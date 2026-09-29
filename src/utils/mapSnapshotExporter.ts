import { ActiveWell, OffsetWell } from '../types/nwis';
import { MapLanguageMode, getBilingualWellLabel } from './indianMapLabels';

export interface MapSnapshotOptions {
  activeWell: ActiveWell;
  activeWells: ActiveWell[];
  offsetWells: OffsetWell[];
  selectedOffsetWellId: string;
  center: [number, number];
  zoom: number;
  radiusKm: number;
  mapStyle: 'simplified' | 'topographic' | 'satellite';
  stateFilter: string;
  statusFilter: string;
  severityFilter: string;
  showTrajectories: boolean;
  showLabels: boolean;
  languageMode: MapLanguageMode;
  mapContainerEl?: HTMLElement | null;
}

// Web Mercator projection helpers for accurate lat/lng -> canvas pixel mapping
function lngToWorldX(lng: number, zoom: number): number {
  const scale = 256 * Math.pow(2, zoom);
  return ((lng + 180) / 360) * scale;
}

function latToWorldY(lat: number, zoom: number): number {
  const scale = 256 * Math.pow(2, zoom);
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  return (0.5 - mercN / (2 * Math.PI)) * scale;
}

function worldXToLng(wx: number, zoom: number): number {
  const scale = 256 * Math.pow(2, zoom);
  return (wx / scale) * 360 - 180;
}

function worldYToLat(wy: number, zoom: number): number {
  const scale = 256 * Math.pow(2, zoom);
  const n = Math.PI - (2 * Math.PI * wy) / scale;
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

function loadCorsTileImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const timeout = window.setTimeout(() => resolve(null), 1800);
    img.onload = () => {
      window.clearTimeout(timeout);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(timeout);
      resolve(null);
    };
    img.src = src;
  });
}

export async function generateMapSnapshotPng(
  options: MapSnapshotOptions
): Promise<{ dataUrl: string; filename: string }> {
  const {
    activeWell,
    activeWells,
    offsetWells,
    selectedOffsetWellId,
    center,
    zoom,
    radiusKm,
    mapStyle,
    stateFilter,
    statusFilter,
    severityFilter,
    showTrajectories,
    showLabels,
    languageMode,
    mapContainerEl,
  } = options;

  const width = 1600;
  const height = 960;
  const headerH = 76;
  const footerH = 92;
  const mapTop = headerH;
  const mapH = height - headerH - footerH;
  const mapW = width;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  // 1. Base Canvas Fill according to selected Base Map Style
  const bgGradients: Record<'simplified' | 'topographic' | 'satellite', [string, string]> = {
    simplified: ['#0B1511', '#0E1E17'],
    topographic: ['#101E17', '#172A20'],
    satellite: ['#071114', '#0D1F22'],
  };
  const [bgStart, bgEnd] = bgGradients[mapStyle] || bgGradients.simplified;
  const mapGrad = ctx.createLinearGradient(0, mapTop, width, mapTop + mapH);
  mapGrad.addColorStop(0, bgStart);
  mapGrad.addColorStop(1, bgEnd);
  ctx.fillStyle = mapGrad;
  ctx.fillRect(0, mapTop, mapW, mapH);

  // 2. Attempt to composite live DOM Leaflet tiles onto the map viewport area
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, mapTop, mapW, mapH);
  ctx.clip();

  if (mapContainerEl) {
    const containerRect = mapContainerEl.getBoundingClientRect();
    const tileEls = Array.from(
      mapContainerEl.querySelectorAll<HTMLImageElement>('.leaflet-tile-pane img.leaflet-tile')
    );

    if (containerRect.width > 0 && containerRect.height > 0 && tileEls.length > 0) {
      const scaleX = mapW / containerRect.width;
      const scaleY = mapH / containerRect.height;

      const loadedTiles = await Promise.all(
        tileEls.map(async (el) => {
          if (!el.src) return null;
          const img = await loadCorsTileImage(el.src);
          if (!img) return null;
          const rect = el.getBoundingClientRect();
          return {
            img,
            x: (rect.left - containerRect.left) * scaleX,
            y: mapTop + (rect.top - containerRect.top) * scaleY,
            w: rect.width * scaleX,
            h: rect.height * scaleY,
          };
        })
      );

      ctx.save();
      if (mapStyle === 'simplified') {
        ctx.filter = 'invert(92%) hue-rotate(135deg) saturate(65%) brightness(88%) contrast(98%)';
      } else if (mapStyle === 'topographic') {
        ctx.filter = 'invert(86%) hue-rotate(115deg) saturate(85%) brightness(86%) contrast(108%)';
      } else {
        ctx.filter = 'saturate(108%) brightness(90%) contrast(106%)';
      }

      for (const item of loadedTiles) {
        if (item) {
          try {
            ctx.drawImage(item.img, item.x, item.y, item.w, item.h);
          } catch {
            // Ignore any individual tile draw issues
          }
        }
      }
      ctx.restore();
    }
  }

  // 3. Projection helper from [lat, lng] to canvas [x, y]
  const centerWorldX = lngToWorldX(center[1], zoom);
  const centerWorldY = latToWorldY(center[0], zoom);

  const projectLatLng = (lat: number, lng: number): [number, number] => {
    const wx = lngToWorldX(lng, zoom);
    const wy = latToWorldY(lat, zoom);
    const x = mapW / 2 + (wx - centerWorldX);
    const y = mapTop + mapH / 2 + (wy - centerWorldY);
    return [x, y];
  };

  // 4. Draw Cartographic Graticule Grid & Topographic Contours (if Topographic mode)
  ctx.strokeStyle =
    mapStyle === 'satellite' ? 'rgba(38, 232, 176, 0.16)' : 'rgba(43, 67, 55, 0.55)';
  ctx.lineWidth = 1;
  const gridStepPx = 160;
  ctx.font = '500 10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(155, 176, 163, 0.75)';

  for (let gx = gridStepPx; gx < mapW; gx += gridStepPx) {
    ctx.beginPath();
    ctx.moveTo(gx, mapTop);
    ctx.lineTo(gx, mapTop + mapH);
    ctx.stroke();
    const lngVal = worldXToLng(centerWorldX + (gx - mapW / 2), zoom);
    ctx.fillText(`${lngVal.toFixed(2)}°E`, gx + 6, mapTop + 18);
  }

  for (let gy = mapTop + 120; gy < mapTop + mapH - 30; gy += 140) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(mapW, gy);
    ctx.stroke();
    const latVal = worldYToLat(centerWorldY + (gy - (mapTop + mapH / 2)), zoom);
    ctx.fillText(`${latVal.toFixed(2)}°N`, 12, gy - 6);
  }

  // 5. Draw Search Radius Circle around Active Well
  const [activeX, activeY] = projectLatLng(activeWell.lat, activeWell.lng);
  // Calculate pixel radius at activeWell latitude
  const metersPerPixel =
    (156543.03392 * Math.cos((activeWell.lat * Math.PI) / 180)) / Math.pow(2, zoom);
  const radiusPx = Math.max(24, (radiusKm * 1000) / Math.max(0.1, metersPerPixel));

  ctx.save();
  ctx.beginPath();
  ctx.arc(activeX, activeY, radiusPx, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(38, 232, 176, 0.08)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.strokeStyle = '#26E8B0';
  ctx.stroke();
  ctx.restore();

  // 6. Draw Trajectories & Active-to-Selected Correlation Vector
  if (showTrajectories) {
    for (const well of offsetWells) {
      if (well.trajectoryCoords && well.trajectoryCoords.length > 1) {
        ctx.save();
        ctx.beginPath();
        well.trajectoryCoords.forEach(([lat, lng], idx) => {
          const [px, py] = projectLatLng(lat, lng);
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.strokeStyle = '#26E8B0';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.restore();
      }

      if (well.wellId === selectedOffsetWellId) {
        const [wx, wy] = projectLatLng(well.lat, well.lng);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(activeX, activeY);
        ctx.lineTo(wx, wy);
        ctx.setLineDash([5, 5]);
        ctx.strokeStyle = '#D4DE95';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  // 7. Draw Offset Well Markers with Exact Well Type Symbols & Risk Colors
  for (const well of offsetWells) {
    const [wx, wy] = projectLatLng(well.lat, well.lng);
    if (wx < -40 || wx > mapW + 40 || wy < mapTop - 40 || wy > mapTop + mapH + 40) {
      continue;
    }

    const isSelected = well.wellId === selectedOffsetWellId;
    const fillColor =
      well.highestSeverity === 'Critical'
        ? '#F87171'
        : well.highestSeverity === 'High'
        ? '#FBBF24'
        : isSelected
        ? '#26E8B0'
        : '#4ADE80';

    ctx.save();
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(wx, wy, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(38, 232, 176, 0.28)';
      ctx.fill();
    }

    if (well.status === 'Plugged & Abandoned') {
      // Circle with Cross (P&A)
      ctx.beginPath();
      ctx.arc(wx, wy, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#162920';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = fillColor;
      ctx.stroke();

      ctx.strokeStyle = fillColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wx - 3.5, wy - 3.5);
      ctx.lineTo(wx + 3.5, wy + 3.5);
      ctx.moveTo(wx + 3.5, wy - 3.5);
      ctx.lineTo(wx - 3.5, wy + 3.5);
      ctx.stroke();
    } else if (well.status === 'Suspended') {
      // Dashed Circle (Dormant / Suspended)
      ctx.beginPath();
      ctx.arc(wx, wy, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#0B1410';
      ctx.fill();
      ctx.setLineDash([3, 2]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = fillColor;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = fillColor;
      ctx.fillRect(wx - 2.5, wy - 2.5, 5, 5);
    } else if (well.status === 'Active Injector') {
      // Rounded Square + Downward Triangle (Injector)
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = isSelected ? '#FFFFFF' : '#0B1410';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(wx - 8, wy - 8, 16, 16, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#080D0B';
      ctx.beginPath();
      ctx.moveTo(wx - 4, wy - 3);
      ctx.lineTo(wx + 4, wy - 3);
      ctx.lineTo(wx, wy + 4);
      ctx.closePath();
      ctx.fill();
    } else {
      // Completed Producer: Solid Circle + Inner Core Dot
      ctx.beginPath();
      ctx.arc(wx, wy, 8, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isSelected ? '#FFFFFF' : '#0B1410';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(wx, wy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#080D0B';
      ctx.fill();
    }

    // Marker Label
    if (showLabels) {
      const lbl = getBilingualWellLabel(well.wellName, well.wellId, languageMode);
      const statusShort =
        well.status === 'Plugged & Abandoned'
          ? 'P&A'
          : well.status === 'Suspended'
          ? 'DORMANT'
          : well.status === 'Active Injector'
          ? 'INJ'
          : 'PROD';
      const text = `${lbl.markerTitle} · ${statusShort}`;
      ctx.font = '600 10px "JetBrains Mono", monospace';
      const textW = ctx.measureText(text).width + 10;
      ctx.fillStyle = 'rgba(18, 34, 27, 0.92)';
      ctx.strokeStyle = '#3B5949';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(wx - textW / 2, wy + 11, textW, 16, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#F2F6F0';
      ctx.textAlign = 'center';
      ctx.fillText(text, wx, wy + 22);
    }
    ctx.restore();
  }

  // 8. Draw Active Drilling Rigs (Bullseye Markers)
  for (const rig of activeWells) {
    const [rx, ry] = projectLatLng(rig.lat, rig.lng);
    if (rx < -40 || rx > mapW + 40 || ry < mapTop - 40 || ry > mapTop + mapH + 40) {
      continue;
    }
    const isPrimary = rig.wellId === activeWell.wellId;
    const coreColor = isPrimary ? '#26E8B0' : '#D4DE95';

    ctx.save();
    ctx.beginPath();
    ctx.arc(rx, ry, isPrimary ? 17 : 13, 0, Math.PI * 2);
    ctx.fillStyle = isPrimary ? 'rgba(38, 232, 176, 0.28)' : 'rgba(212, 222, 149, 0.22)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = coreColor;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(rx, ry, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = coreColor;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0B1410';
    ctx.stroke();

    const rigLbl = getBilingualWellLabel(rig.wellName, rig.wellId, languageMode);
    const badgeText = `${rigLbl.markerTitle} (${rig.wellId})`;
    ctx.font = '700 10px "JetBrains Mono", monospace';
    const bw = ctx.measureText(badgeText).width + 12;
    ctx.fillStyle = '#0B1410';
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(rx - bw / 2, ry + 18, bw, 18, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = coreColor;
    ctx.textAlign = 'center';
    ctx.fillText(badgeText, rx, ry + 30);
    ctx.restore();
  }

  // North Arrow & Scale Indicator on Map Canvas (Top-Right)
  ctx.save();
  ctx.fillStyle = 'rgba(11, 20, 16, 0.92)';
  ctx.strokeStyle = '#2B4337';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(mapW - 148, mapTop + 16, 132, 48, 10);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#26E8B0';
  ctx.font = '700 11px "JetBrains Mono", monospace';
  ctx.fillText('▲ NORTH (GIS)', mapW - 134, mapTop + 36);
  ctx.fillStyle = '#9BB0A3';
  ctx.font = '500 10px "JetBrains Mono", monospace';
  ctx.fillText(`Zoom L${zoom} · ${mapStyle.toUpperCase()}`, mapW - 134, mapTop + 52);
  ctx.restore();

  ctx.restore(); // End map clip

  // 9. Draw Top Engineering Report Title Block
  ctx.fillStyle = '#0B1410';
  ctx.fillRect(0, 0, width, headerH);
  ctx.strokeStyle = '#26E8B0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, headerH);
  ctx.lineTo(width, headerH);
  ctx.stroke();

  ctx.fillStyle = '#26E8B0';
  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.fillText(
    'DRILL GUARD · NEARBY WELLS INTELLIGENCE SYSTEM — ALL-INDIA GIS SNAPSHOT',
    24,
    28
  );

  ctx.fillStyle = '#F2F6F0';
  ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `Active Rig: ${activeWell.wellId} (${activeWell.wellName}) — ${activeWell.currentDepthMD.toFixed(
      1
    )} m MD`,
    24,
    56
  );

  // Right metadata in header
  const timestampStr = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
  ctx.textAlign = 'right';
  ctx.fillStyle = '#D4DE95';
  ctx.font = '600 12px "JetBrains Mono", monospace';
  ctx.fillText(
    `Base Layer: ${mapStyle.toUpperCase()} | Region: ${stateFilter} | Radius: ${radiusKm} km`,
    width - 24,
    30
  );
  ctx.fillStyle = '#9BB0A3';
  ctx.font = '500 11px "JetBrains Mono", monospace';
  ctx.fillText(
    `Center: ${center[0].toFixed(4)}°N, ${center[1].toFixed(4)}°E | Exported: ${timestampStr}`,
    width - 24,
    54
  );
  ctx.textAlign = 'left';

  // 10. Draw Bottom Legend & Filter Summary Footer
  const footerY = height - footerH;
  ctx.fillStyle = '#0B1410';
  ctx.fillRect(0, footerY, width, footerH);
  ctx.strokeStyle = '#22352C';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, footerY);
  ctx.lineTo(width, footerY);
  ctx.stroke();

  ctx.fillStyle = '#9BB0A3';
  ctx.font = '700 10px "JetBrains Mono", monospace';
  ctx.fillText('WELL TYPE & HAZARD SYMBOL LEGEND:', 24, footerY + 24);

  const legendItems = [
    { label: 'Active Rig (Live WITSML)', color: '#26E8B0', symbol: '◎' },
    { label: 'Active Producer (PROD)', color: '#4ADE80', symbol: '⦿' },
    { label: 'Active Injector (INJ)', color: '#4ADE80', symbol: '▼' },
    { label: 'Dormant / Suspended', color: '#FBBF24', symbol: '◌' },
    { label: 'Plugged & Abandoned (P&A)', color: '#F87171', symbol: '✕' },
    { label: 'High Risk Offset', color: '#FBBF24', symbol: '●' },
    { label: 'Critical Hazard Offset', color: '#F87171', symbol: '●' },
  ];

  let lx = 24;
  const ly = footerY + 54;
  for (const item of legendItems) {
    ctx.fillStyle = item.color;
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.fillText(item.symbol, lx, ly);
    ctx.fillStyle = '#F2F6F0';
    ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(item.label, lx + 18, ly);
    lx += ctx.measureText(item.label).width + 44;
  }

  ctx.textAlign = 'right';
  ctx.fillStyle = '#26E8B0';
  ctx.font = '600 11px "JetBrains Mono", monospace';
  ctx.fillText(
    `Plotted: ${activeWells.length} Active Rigs · ${offsetWells.length} Offset Wells (Status: ${statusFilter}, Risk: ${severityFilter})`,
    width - 24,
    footerY + 54
  );
  ctx.textAlign = 'left';

  const dateSlug = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const filename = `DrillGuard_Map-Snapshot_${activeWell.wellId}_${mapStyle}_${dateSlug}.png`;
  const dataUrl = canvas.toDataURL('image/png');

  return { dataUrl, filename };
}
