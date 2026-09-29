import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Circle,
  Polyline,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import { ActiveWell, OffsetWell, DrillingEvent } from '../../types/nwis';
import { useNWIS } from '../../context/NWISContext';
import {
  MapLanguageMode,
  formatIndianPlaceLabel,
  formatMapUILabel,
  getBilingualHubLabel,
  getBilingualWellLabel,
} from '../../utils/indianMapLabels';

export interface IndianPlaceHub {
  id: string;
  name: string;
  state: string;
  shortRegion: string;
  shortRegionHi: string;
  basin: string;
  lat: number;
  lng: number;
  zoom: number;
  associatedWellId?: string;
  type: 'Assam Sector' | 'National Basin Hub';
  details: string;
  detailsHi: string;
}

export const INDIAN_OILFIELD_PLACES: IndianPlaceHub[] = [
  {
    id: 'IND-DUL',
    name: 'Duliajan Field HQ',
    state: 'Dibrugarh, Assam',
    shortRegion: 'Assam (Duliajan)',
    shortRegionHi: 'असम (दुलियाजान)',
    basin: 'Upper Assam Basin',
    lat: 27.3650,
    lng: 95.3220,
    zoom: 11,
    associatedWellId: 'OIL-DEMO-042',
    type: 'Assam Sector',
    details: 'Oil India Limited Field Headquarters & Central Processing Facility, Dibrugarh District, Assam.',
    detailsHi: 'ऑयल इंडिया लिमिटेड क्षेत्र मुख्यालय एवं केंद्रीय प्रसंस्करण परिसर, डिब्रूगढ़ जिला, असम।',
  },
  {
    id: 'IND-BRM',
    name: 'Barmer — Mangala & Pachpadra Hub',
    state: 'Barmer, Rajasthan',
    shortRegion: 'Rajasthan (Barmer)',
    shortRegionHi: 'राजस्थान (बाड़मेर)',
    basin: 'Barmer–Sanchor & Jaisalmer Basin',
    lat: 25.7532,
    lng: 71.3968,
    zoom: 10,
    associatedWellId: 'OIL-RAJ-051',
    type: 'National Basin Hub',
    details: 'Western India onshore desert oil & gas province in Barmer and Jaisalmer, Rajasthan.',
    detailsHi: 'बाड़मेर और जैसलमेर, राजस्थान में पश्चिमी भारत का प्रमुख मरुस्थलीय तेल एवं गैस क्षेत्र।',
  },
  {
    id: 'IND-CMB',
    name: 'Ankleshwar–Mehsana–Vadodara Hub',
    state: 'Bharuch / Mehsana, Gujarat',
    shortRegion: 'Gujarat (Cambay)',
    shortRegionHi: 'गुजरात (खंभात)',
    basin: 'Cambay Basin',
    lat: 21.6264,
    lng: 73.0152,
    zoom: 9,
    associatedWellId: 'ONGC-CMB-074',
    type: 'National Basin Hub',
    details: 'Major Western India onshore producing province across Ankleshwar, Mehsana, and Kalol in Gujarat.',
    detailsHi: 'गुजरात के खंभात बेसिन (अंकलेश्वर, मेहसाणा, कलोल) में स्थित पश्चिमी भारत का प्रमुख तटीय तेल एवं गैस उत्पादक क्षेत्र।',
  },
  {
    id: 'IND-MBO',
    name: 'Mumbai High Offshore Platform Hub',
    state: 'Arabian Sea Offshore, Maharashtra',
    shortRegion: 'Maharashtra (Mumbai High)',
    shortRegionHi: 'महाराष्ट्र (मुंबई हाई)',
    basin: 'Mumbai Offshore Basin',
    lat: 19.4120,
    lng: 71.3650,
    zoom: 9,
    associatedWellId: 'ONGC-MBO-088',
    type: 'National Basin Hub',
    details: 'India’s largest offshore carbonate oil & gas field in the Arabian Sea off the coast of Mumbai, Maharashtra.',
    detailsHi: 'मुंबई, महाराष्ट्र के तट से दूर अरब सागर में स्थित भारत का सबसे बड़ा अपतटीय तेल एवं गैस क्षेत्र।',
  },
  {
    id: 'IND-KG',
    name: 'Rajahmundry–Kakinada Onland Hub',
    state: 'East Godavari, Andhra Pradesh',
    shortRegion: 'Andhra Pradesh (KG Basin)',
    shortRegionHi: 'आंध्र प्रदेश (केजी बेसिन)',
    basin: 'Krishna–Godavari (KG) Basin',
    lat: 16.9891,
    lng: 81.7840,
    zoom: 9,
    associatedWellId: 'ONGC-KGB-062',
    type: 'National Basin Hub',
    details: 'Eastern coastal India HPHT gas and oil operational hub in Krishna–Godavari Basin, Andhra Pradesh.',
    detailsHi: 'कृष्णा-गोदावरी बेसिन, आंध्र प्रदेश में पूर्वी तटीय उच्च-तापमान/उच्च-दाब (HPHT) गैस एवं तेल केंद्र।',
  },
  {
    id: 'IND-CAU',
    name: 'Karaikal–Nagapattinam Sector',
    state: 'Nagapattinam, Tamil Nadu / Puducherry',
    shortRegion: 'Tamil Nadu (Cauvery)',
    shortRegionHi: 'तमिलनाडु (कावेरी)',
    basin: 'Cauvery Basin',
    lat: 10.9254,
    lng: 79.8380,
    zoom: 10,
    associatedWellId: 'OIL-CAU-095',
    type: 'National Basin Hub',
    details: 'Southern India Cauvery Basin onshore & shallow-water operational hub in Tamil Nadu and Puducherry.',
    detailsHi: 'दक्षिण भारत के कावेरी बेसिन (तमिलनाडु एवं पुडुचेरी) में तटीय एवं उथले अपतटीय परिचालन केंद्र।',
  },
  {
    id: 'IND-MHN',
    name: 'Paradip–Bhubaneswar Sector',
    state: 'Jagatsinghpur, Odisha',
    shortRegion: 'Odisha (Mahanadi)',
    shortRegionHi: 'ओडिशा (महानदी)',
    basin: 'Mahanadi Basin',
    lat: 20.3166,
    lng: 86.6114,
    zoom: 10,
    associatedWellId: 'OIL-MHN-099',
    type: 'National Basin Hub',
    details: 'Eastern India Mahanadi coastal and shelf exploration & drilling hub in Odisha.',
    detailsHi: 'ओडिशा के महानदी बेसिन में पूर्वी तटीय अन्वेषण एवं ड्रिलिंग केंद्र।',
  },
  {
    id: 'IND-DIG',
    name: 'Digboi Historic Oilfield',
    state: 'Tinsukia, Assam',
    shortRegion: 'Assam (Digboi–Baghjan)',
    shortRegionHi: 'असम (डिगबोई–बाघजान)',
    basin: 'Upper Assam Fold Belt',
    lat: 27.3910,
    lng: 95.6150,
    zoom: 10,
    associatedWellId: 'OIL-DEMO-041',
    type: 'Assam Sector',
    details: 'Asia’s oldest operational oilfield and refinery town in Tinsukia District, Assam.',
    detailsHi: 'तिनसुकिया जिला, असम में स्थित एशिया का सबसे पुराना कार्यरत तेल क्षेत्र और रिफाइनरी नगर।',
  },
  {
    id: 'IND-MRN',
    name: 'Moran–Sivasagar Block',
    state: 'Charaideo / Sivasagar, Assam',
    shortRegion: 'Assam (Moran–Sivasagar)',
    shortRegionHi: 'असम (मोरन–शिवसागर)',
    basin: 'Upper Assam Shelf',
    lat: 27.1850,
    lng: 94.9250,
    zoom: 10,
    associatedWellId: 'OIL-MRN-044',
    type: 'Assam Sector',
    details: 'South-western Upper Assam oilfield cluster spanning Moran, Sivasagar, and Jorhat corridor.',
    detailsHi: 'मोरन, शिवसागर और जोरहाट गलियारे में फैला दक्षिण-पश्चिमी ऊपरी असम तेल क्षेत्र क्लस्टर।',
  },
  {
    id: 'IND-JSL',
    name: 'Jaisalmer — Tanot Desert Gas Hub',
    state: 'Jaisalmer, Rajasthan',
    shortRegion: 'Rajasthan (Jaisalmer)',
    shortRegionHi: 'राजस्थान (जैसलमेर)',
    basin: 'Barmer–Sanchor & Jaisalmer Basin',
    lat: 26.9157,
    lng: 70.9083,
    zoom: 9,
    associatedWellId: 'OIL-RAJ-051',
    type: 'National Basin Hub',
    details: 'Western Rajasthan frontier desert gas field complex in Jaisalmer Basin.',
    detailsHi: 'जैसलमेर बेसिन, पश्चिमी राजस्थान में प्रमुख मरुस्थलीय प्राकृतिक गैस क्षेत्र।',
  },
];

function createIndianPlaceIcon(place: IndianPlaceHub, langMode: MapLanguageMode) {
  const isNational = place.type === 'National Basin Hub';
  const hubLabels = getBilingualHubLabel(place, langMode);
  return L.divIcon({
    className: 'custom-indian-place-icon',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:24px;height:24px;">
        <div style="width:10px;height:10px;border-radius:2px;transform:rotate(45deg);background:${
          isNational ? '#D4DE95' : '#26E8B0'
        };border:1.5px solid #0B1410;box-shadow:0 1px 6px rgba(0,0,0,0.45);"></div>
        <div style="position:absolute;top:20px;background:#0B1410;color:#D4DE95;border:1px solid #2B4337;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:600;padding:1px 5px;border-radius:4px;white-space:nowrap;opacity:0.95;">
          ${hubLabels.markerLabel}
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -10],
  });
}

interface MapUpdaterProps {
  center: [number, number];
  zoom: number;
  isFullscreen?: boolean;
}

const MapViewportController: React.FC<MapUpdaterProps> = ({ center, zoom, isFullscreen }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [map, center, zoom]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize({ animate: false });
    }, 60);
    return () => window.clearTimeout(timer);
  }, [map, isFullscreen]);

  useEffect(() => {
    const container = map.getContainer();
    if (!container || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [map]);

  return null;
};

function createActiveWellIcon(
  wellId: string,
  wellName: string,
  isPrimaryActive: boolean,
  langMode: MapLanguageMode
) {
  const labelInfo = getBilingualWellLabel(wellName, wellId, langMode);
  const ringBg = isPrimaryActive ? 'rgba(38, 232, 176, 0.35)' : 'rgba(212, 222, 149, 0.25)';
  const coreBg = isPrimaryActive ? '#26E8B0' : '#D4DE95';
  const badgeBorder = isPrimaryActive ? '#26E8B0' : '#D4DE95';
  const badgeText = isPrimaryActive ? '#26E8B0' : '#D4DE95';

  return L.divIcon({
    className: 'custom-active-well-icon',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:36px;height:36px;">
        <div style="position:absolute;width:${isPrimaryActive ? 34 : 26}px;height:${
      isPrimaryActive ? 34 : 26
    }px;border-radius:9999px;background:${ringBg};border:2px solid ${coreBg};box-shadow:0 0 14px rgba(38, 232, 176, 0.45);"></div>
        <div style="position:relative;width:13px;height:13px;border-radius:9999px;background:${coreBg};border:2px solid #0B1410;"></div>
        <div style="position:absolute;top:34px;background:#0B1410;color:${badgeText};border:1px solid ${badgeBorder};font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;padding:1.5px 6px;border-radius:4px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.55);">
          ${labelInfo.markerTitle} · ${wellId}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -16],
  });
}

function createOffsetWellIcon(
  well: OffsetWell,
  isSelected: boolean,
  showLabels: boolean,
  langMode: MapLanguageMode
) {
  const fillColor =
    well.highestSeverity === 'Critical'
      ? '#F87171'
      : well.highestSeverity === 'High'
      ? '#FBBF24'
      : isSelected
      ? '#26E8B0'
      : '#4ADE80';

  const borderColor = isSelected ? '#FFFFFF' : '#0B1410';
  const size = isSelected ? 28 : 22;
  const innerSize = isSelected ? 18 : 15;
  const ringStyle = isSelected
    ? `box-shadow: 0 0 0 4px rgba(38, 232, 176, 0.55), 0 2px 10px rgba(0, 0, 0, 0.5);`
    : `box-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);`;
  const labelInfo = getBilingualWellLabel(well.wellName, well.wellId, langMode);

  // Distinct geometric shape & inner glyph per well operational status
  let markerShapeHtml = '';
  let statusShortTag = 'PROD';

  if (well.status === 'Plugged & Abandoned') {
    statusShortTag = 'P&A';
    markerShapeHtml = `
      <div style="width:${innerSize}px;height:${innerSize}px;border-radius:9999px;background:#162920;border:2px solid ${fillColor};display:flex;align-items:center;justify-content:center;${ringStyle}">
        <span style="color:${fillColor};font-size:${isSelected ? 10 : 9}px;font-weight:900;line-height:1;">✕</span>
      </div>
    `;
  } else if (well.status === 'Suspended') {
    statusShortTag = 'DORMANT';
    markerShapeHtml = `
      <div style="width:${innerSize}px;height:${innerSize}px;border-radius:9999px;background:rgba(11,20,16,0.9);border:2px dashed ${fillColor};display:flex;align-items:center;justify-content:center;${ringStyle}">
        <div style="width:5px;height:5px;border-radius:1px;background:${fillColor};"></div>
      </div>
    `;
  } else if (well.status === 'Active Injector') {
    statusShortTag = 'INJ';
    markerShapeHtml = `
      <div style="width:${innerSize}px;height:${innerSize}px;border-radius:4px;background:${fillColor};border:2px solid ${borderColor};display:flex;align-items:center;justify-content:center;${ringStyle}">
        <span style="color:#080D0B;font-size:${isSelected ? 9 : 8}px;font-weight:900;line-height:1;">▼</span>
      </div>
    `;
  } else {
    // Completed Producer (Active Producer)
    statusShortTag = 'PROD';
    markerShapeHtml = `
      <div style="width:${innerSize}px;height:${innerSize}px;border-radius:9999px;background:${fillColor};border:2px solid ${borderColor};display:flex;align-items:center;justify-content:center;${ringStyle}">
        <div style="width:4px;height:4px;border-radius:9999px;background:#080D0B;"></div>
      </div>
    `;
  }

  return L.divIcon({
    className: 'custom-offset-well-icon',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;">
        ${markerShapeHtml}
        ${
          showLabels
            ? `<div style="position:absolute;top:${size}px;background:#12221B;color:#F2F6F0;border:1px solid #3B5949;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:600;padding:1px 4px;border-radius:4px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.4);">
                ${labelInfo.markerTitle} · <span style="color:#26E8B0;">${statusShortTag}</span> (${well.distanceKm}km)
              </div>`
            : ''
        }
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -12],
  });
}

export type BaseMapStyle = 'simplified' | 'topographic' | 'satellite' | 'dark' | 'terrain';

interface WellGISMapProps {
  activeWell: ActiveWell;
  offsetWells: OffsetWell[];
  events: DrillingEvent[];
  selectedWellId: string;
  onSelectWell: (wellId: string) => void;
  onViewProfile: (wellId: string) => void;
  onCompareWithActive: (wellId: string) => void;
  onViewEvents: (wellId: string) => void;
  radiusKm: number;
  showTrajectories?: boolean;
  showLabels?: boolean;
  mapStyle?: BaseMapStyle;
  onMapStyleChange?: (style: 'simplified' | 'topographic' | 'satellite') => void;
  zoom?: number;
  center?: [number, number];
  heightClass?: string;
  languageMode?: MapLanguageMode;
  onLanguageModeChange?: (mode: MapLanguageMode) => void;
  defaultAllIndia?: boolean;
  onQuickViewWell?: (wellId: string, wellType: 'offset' | 'active') => void;
  respectFilteredWells?: boolean;
  statusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
  severityFilter?: string;
  onSeverityFilterChange?: (severity: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const WellGISMap: React.FC<WellGISMapProps> = ({
  activeWell,
  offsetWells,
  events,
  selectedWellId,
  onSelectWell,
  onViewProfile,
  onCompareWithActive,
  onViewEvents,
  radiusKm,
  showTrajectories = true,
  showLabels = true,
  mapStyle: controlledMapStyle,
  onMapStyleChange,
  zoom = 5,
  center,
  heightClass = 'h-[420px]',
  languageMode: controlledLangMode,
  onLanguageModeChange,
  defaultAllIndia = true,
  onQuickViewWell,
  respectFilteredWells = false,
  statusFilter = 'All',
  onStatusFilterChange,
  severityFilter = 'All',
  onSeverityFilterChange,
  isFullscreen: controlledFullscreen,
  onToggleFullscreen,
}) => {
  const { activeWells, setActiveWellId, offsetWells: allOffsetWells } = useNWIS();

  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const isFullscreen = controlledFullscreen ?? internalFullscreen;
  const handleToggleFullscreen = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
    } else {
      setInternalFullscreen((prev) => !prev);
    }
  };

  const [overrideView, setOverrideView] = useState<{
    center: [number, number];
    zoom: number;
    regionId?: string;
  } | null>(() =>
    defaultAllIndia ? { center: [21.5, 80.5], zoom: 5, regionId: 'ALL_INDIA' } : null
  );
  const [showIndianHubs, setShowIndianHubs] = useState<boolean>(true);
  const [internalLangMode, setInternalLangMode] = useState<MapLanguageMode>('bilingual');
  const [internalMapStyle, setInternalMapStyle] = useState<
    'simplified' | 'topographic' | 'satellite'
  >('simplified');
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(respectFilteredWells);

  // Normalize legacy 'dark' / 'terrain' values into 'simplified' / 'topographic' / 'satellite'
  const rawStyle = controlledMapStyle ?? internalMapStyle;
  const normalizedMapStyle: 'simplified' | 'topographic' | 'satellite' =
    rawStyle === 'satellite'
      ? 'satellite'
      : rawStyle === 'topographic' || rawStyle === 'terrain'
      ? 'topographic'
      : 'simplified';

  const handleStyleSelect = (nextStyle: 'simplified' | 'topographic' | 'satellite') => {
    setInternalMapStyle(nextStyle);
    onMapStyleChange?.(nextStyle);
  };

  const langMode = controlledLangMode ?? internalLangMode;
  const handleLangChange = (mode: MapLanguageMode) => {
    setInternalLangMode(mode);
    onLanguageModeChange?.(mode);
  };

  // When the user explicitly switches the active well in the top navbar, focus on that well
  useEffect(() => {
    if (center) {
      setOverrideView({ center, zoom });
    }
  }, [center, zoom]);

  const isAllIndiaView = overrideView?.regionId === 'ALL_INDIA' || (!overrideView && zoom <= 6);

  // In NearbyMapView (respectFilteredWells=true), honor the user's active filters even in All-India view
  const displayedOffsetWells = respectFilteredWells
    ? offsetWells
    : isAllIndiaView
    ? allOffsetWells
    : offsetWells;

  // Compute live counts per well type and risk severity for the floating legend
  const legendCounts = {
    activeRigs: activeWells.length,
    producer: allOffsetWells.filter((w) => w.status === 'Completed Producer').length,
    injector: allOffsetWells.filter((w) => w.status === 'Active Injector').length,
    dormant: allOffsetWells.filter((w) => w.status === 'Suspended').length,
    abandoned: allOffsetWells.filter((w) => w.status === 'Plugged & Abandoned').length,
    critical: allOffsetWells.filter((w) => w.highestSeverity === 'Critical').length,
    high: allOffsetWells.filter((w) => w.highestSeverity === 'High').length,
    normal: allOffsetWells.filter(
      (w) => w.highestSeverity === 'Low' || w.highestSeverity === 'Medium'
    ).length,
  };

  const mapCenter: [number, number] = overrideView
    ? overrideView.center
    : center || [activeWell.lat, activeWell.lng];
  const activeZoom = overrideView ? overrideView.zoom : zoom;

  const quickRegionButtons = [
    {
      id: 'ALL_INDIA',
      labelEn: '🇮🇳 All India (8 Basins)',
      labelHi: '🇮🇳 अखिल भारत (८ बेसिन)',
      center: [21.5, 80.5] as [number, number],
      zoom: 5,
      wellId: undefined,
    },
    {
      id: 'RAJASTHAN',
      labelEn: 'Rajasthan (Barmer)',
      labelHi: 'राजस्थान (बाड़मेर)',
      center: [25.7532, 71.3968] as [number, number],
      zoom: 10,
      wellId: 'OIL-RAJ-051',
    },
    {
      id: 'GUJARAT',
      labelEn: 'Gujarat (Cambay)',
      labelHi: 'गुजरात (खंभात)',
      center: [22.35, 72.75] as [number, number],
      zoom: 8,
      wellId: 'ONGC-CMB-074',
    },
    {
      id: 'MAHARASHTRA',
      labelEn: 'Mumbai High (Offshore)',
      labelHi: 'मुंबई हाई (महाराष्ट्र)',
      center: [19.412, 71.52] as [number, number],
      zoom: 9,
      wellId: 'ONGC-MBO-088',
    },
    {
      id: 'ANDHRA',
      labelEn: 'KG Basin (Andhra Pradesh)',
      labelHi: 'केजी बेसिन (आंध्र प्रदेश)',
      center: [16.85, 81.95] as [number, number],
      zoom: 9,
      wellId: 'ONGC-KGB-062',
    },
    {
      id: 'TAMIL_NADU',
      labelEn: 'Cauvery (Tamil Nadu)',
      labelHi: 'कावेरी (तमिलनाडु)',
      center: [10.90, 79.82] as [number, number],
      zoom: 11,
      wellId: 'OIL-CAU-095',
    },
    {
      id: 'ODISHA',
      labelEn: 'Mahanadi (Odisha)',
      labelHi: 'महानदी (ओडिशा)',
      center: [20.29, 86.59] as [number, number],
      zoom: 11,
      wellId: 'OIL-MHN-099',
    },
    {
      id: 'ASSAM',
      labelEn: 'Assam (Duliajan / Digboi)',
      labelHi: 'असम (दुलियाजान / डिगबोई)',
      center: [27.3662, 95.3258] as [number, number],
      zoom: 10,
      wellId: 'OIL-DEMO-042',
    },
  ];

  const mapTileClass =
    normalizedMapStyle === 'satellite'
      ? 'nwis-map-tiles-satellite'
      : normalizedMapStyle === 'topographic'
      ? 'nwis-map-tiles-topographic'
      : 'nwis-map-tiles-simplified';

  return (
    <div
      className={`${
        internalFullscreen && !onToggleFullscreen
          ? 'fixed inset-0 z-50 w-screen h-screen rounded-none'
          : `relative w-full ${heightClass} rounded-xl`
      } overflow-hidden border border-[#2B4337] bg-[#0E1914] ${mapTileClass}`}
    >
      {/* Top Multi-State Indian Basin Quick-Jump Bar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex flex-wrap items-center justify-between gap-1.5 bg-[#0B1410]/95 backdrop-blur-md p-1.5 rounded-xl border border-[#22352C] shadow-md text-[10px] font-mono">
        <div className="flex flex-wrap items-center gap-1">
          {quickRegionButtons.map((reg) => {
            const isActiveRegion = overrideView?.regionId === reg.id;
            return (
              <button
                key={reg.id}
                onClick={() => {
                  if (reg.wellId) {
                    setActiveWellId(reg.wellId);
                  }
                  setOverrideView({
                    center: reg.center,
                    zoom: reg.zoom,
                    regionId: reg.id,
                  });
                }}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  isActiveRegion
                    ? 'bg-[#26E8B0] text-[#080D0B] font-bold shadow-xs'
                    : 'bg-[#111A16] hover:bg-[#162920] text-[#C5D6CC] hover:text-white border border-[#22352C]'
                }`}
              >
                {langMode === 'hi' ? reg.labelHi : reg.labelEn}
              </button>
            );
          })}
        </div>

        {/* Right: Language & Hub Toggles */}
        <div className="flex items-center gap-1 ml-auto">
          <div className="flex items-center rounded-lg bg-[#111A16] p-0.5 border border-[#22352C]">
            <button
              onClick={() => handleLangChange('bilingual')}
              className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                langMode === 'bilingual'
                  ? 'bg-[#26E8B0] text-[#080D0B] font-bold'
                  : 'text-[#C5D6CC] hover:text-white'
              }`}
            >
              हिन्दी+EN
            </button>
            <button
              onClick={() => handleLangChange('hi')}
              className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                langMode === 'hi'
                  ? 'bg-[#26E8B0] text-[#080D0B] font-bold'
                  : 'text-[#C5D6CC] hover:text-white'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => handleLangChange('en')}
              className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                langMode === 'en'
                  ? 'bg-[#26E8B0] text-[#080D0B] font-bold'
                  : 'text-[#C5D6CC] hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          <button
            onClick={() => setShowIndianHubs((prev) => !prev)}
            className={`px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
              showIndianHubs
                ? 'bg-[#162920] text-[#26E8B0] border-[#26E8B0]/50 font-semibold'
                : 'bg-[#111A16] text-[#9BB0A3] border-[#22352C]'
            }`}
          >
            {showIndianHubs ? 'Hubs: ON' : 'Hubs: OFF'}
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? 'Exit Full Screen Map (Esc)' : 'Expand Map to Full Screen'}
            className={`px-2.5 py-1 rounded-lg border font-bold transition-colors cursor-pointer whitespace-nowrap ${
              isFullscreen
                ? 'bg-[#F87171] hover:bg-[#EF4444] text-[#080D0B] border-[#F87171]'
                : 'bg-[#26E8B0] hover:bg-[#4FF2C3] text-[#080D0B] border-[#26E8B0]'
            }`}
          >
            {isFullscreen ? '⤡ Exit Full Screen' : '⤢ Full Screen'}
          </button>
        </div>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={activeZoom}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
      >
        <MapViewportController center={mapCenter} zoom={activeZoom} isFullscreen={isFullscreen} />
        {normalizedMapStyle === 'satellite' && (
          <>
            <TileLayer
              key="tile-satellite-imagery"
              attribution='&copy; Esri, Maxar, Earthstar Geographics · Satellite Site Planning Imagery (India Basins)'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <TileLayer
              key="tile-satellite-labels"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              opacity={0.75}
            />
          </>
        )}
        {normalizedMapStyle === 'topographic' && (
          <TileLayer
            key="tile-topographic"
            attribution='&copy; Esri, USGS, NOAA · Topographic Contours &amp; Elevation Relief GIS'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
          />
        )}
        {normalizedMapStyle === 'simplified' && (
          <TileLayer
            key="tile-simplified"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> भारत (India) · Simplified Basin Trajectory GIS'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        {/* Search Radius Circle around Currently Selected Active Well */}
        <Circle
          center={[activeWell.lat, activeWell.lng]}
          radius={radiusKm * 1000}
          pathOptions={{
            color: '#26E8B0',
            weight: 1.75,
            dashArray: '6 6',
            fillColor: '#26E8B0',
            fillOpacity: 0.10,
          }}
        />

        {/* Indian Oilfield Towns & National Sedimentary Basin Hubs */}
        {showIndianHubs &&
          INDIAN_OILFIELD_PLACES.map((place) => {
            const hubLabels = getBilingualHubLabel(place, langMode);
            return (
              <Marker
                key={`${place.id}-${langMode}`}
                position={[place.lat, place.lng]}
                icon={createIndianPlaceIcon(place, langMode)}
              >
                <Popup>
                  <div className="p-3 space-y-2 text-xs bg-[#12221B] text-[#F2F6F0] rounded-xl">
                    <div className="font-mono font-bold text-[#F2F6F0] border-b border-[#2B4337] pb-1">
                      {hubLabels.popupTitle}
                    </div>
                    <div className="text-[11px] font-semibold text-[#26E8B0]">
                      {hubLabels.popupRegion}
                    </div>
                    {langMode !== 'en' && (
                      <div className="text-[11px] text-[#F2F6F0] font-medium">
                        {place.detailsHi}
                      </div>
                    )}
                    {langMode !== 'hi' && (
                      <div className="text-[11px] text-[#9BB0A3]">{place.details}</div>
                    )}
                    <div className="font-mono text-[10px] text-[#9BB0A3] pt-1">
                      Coords: {place.lat.toFixed(4)}° N, {place.lng.toFixed(4)}° E
                    </div>
                    <button
                      onClick={() => {
                        if (place.associatedWellId) {
                          setActiveWellId(place.associatedWellId);
                        }
                        setOverrideView({
                          center: [place.lat, place.lng],
                          zoom: place.zoom,
                          regionId: place.id,
                        });
                      }}
                      className="w-full mt-1 py-1.5 px-2.5 rounded-lg bg-[#26E8B0] hover:bg-[#4FF2C3] text-[#080D0B] font-bold text-[11px] text-center transition-colors cursor-pointer"
                    >
                      Focus Basin & Switch Rig →
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* All Active Drilling Rigs Across India (Assam, Rajasthan, Gujarat, Mumbai High, KG Basin, Cauvery, Odisha) */}
        {activeWells.map((rig) => {
          const isPrimary = rig.wellId === activeWell.wellId;
          const rigLabels = getBilingualWellLabel(rig.wellName, rig.wellId, langMode);
          return (
            <Marker
              key={`active-${rig.wellId}-${langMode}`}
              position={[rig.lat, rig.lng]}
              icon={createActiveWellIcon(rig.wellId, rig.wellName, isPrimary, langMode)}
              eventHandlers={{
                click: () => {
                  if (!isPrimary) {
                    setActiveWellId(rig.wellId);
                  }
                  onQuickViewWell?.(rig.wellId, 'active');
                },
              }}
            >
              <Popup>
                <div className="p-3.5 space-y-2 text-xs bg-[#12221B] text-[#F2F6F0] rounded-xl">
                  <div className="flex items-center justify-between border-b border-[#2B4337] pb-2 gap-2">
                    <div>
                      <div className="font-mono font-bold text-[#26E8B0]">
                        {rigLabels.markerTitle} ({rig.wellId})
                      </div>
                      <div className="text-[10px] text-[#9BB0A3] mt-0.5">
                        {rigLabels.locationSubtitle}
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-[#4ADE80] shrink-0">
                      {isPrimary ? rigLabels.activeBadge : 'LIVE RIG'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div>
                      <span className="text-[#9BB0A3] block text-[10px]">
                        {formatMapUILabel('currentDepth', langMode)}
                      </span>
                      <span className="font-semibold">{rig.currentDepthMD.toFixed(1)} m MD</span>
                    </div>
                    <div>
                      <span className="text-[#9BB0A3] block text-[10px]">
                        {formatMapUILabel('formation', langMode)}
                      </span>
                      <span className="text-[#26E8B0] font-semibold">
                        {formatIndianPlaceLabel(rig.currentFormation, langMode)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#9BB0A3] block text-[10px]">ROP / Torque</span>
                      <span>
                        {rig.rop} m/h · {rig.torque} kN·m
                      </span>
                    </div>
                    <div>
                      <span className="text-[#9BB0A3] block text-[10px]">MW / ECD</span>
                      <span>
                        {rig.mudWeight} / {rig.ecd} SG
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 pt-1">
                    {onQuickViewWell && (
                      <button
                        onClick={() => onQuickViewWell(rig.wellId, 'active')}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-[#26E8B0] hover:bg-[#4FF2C3] text-[#080D0B] font-bold text-[11px] text-center transition-colors cursor-pointer"
                      >
                        Open Rig Quick-View Drawer →
                      </button>
                    )}
                    {!isPrimary && (
                      <button
                        onClick={() => {
                          setActiveWellId(rig.wellId);
                          setOverrideView({
                            center: [rig.lat, rig.lng],
                            zoom: 11,
                            regionId: rig.wellId,
                          });
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-[#162920] hover:bg-[#26E8B0]/20 text-[#F2F6F0] border border-[#2B4337] font-semibold text-[11px] text-center transition-colors cursor-pointer"
                      >
                        Make Primary Active Rig
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Offset Wells & Trajectories Across All Indian Basins */}
        {displayedOffsetWells.map((well) => {
          const wellEvents = events.filter((e) => e.wellId === well.wellId);
          const isSelected = well.wellId === selectedWellId;
          const wellLabelInfo = getBilingualWellLabel(well.wellName, well.wellId, langMode);

          return (
            <React.Fragment key={`${well.wellId}-${langMode}`}>
              {showTrajectories && (
                <>
                  {isSelected && well.field === activeWell.field && (
                    <Polyline
                      positions={[
                        [activeWell.lat, activeWell.lng],
                        [well.lat, well.lng],
                      ]}
                      pathOptions={{
                        color: '#D4DE95',
                        weight: 2,
                        dashArray: '4 4',
                        opacity: 0.85,
                      }}
                    />
                  )}
                  <Polyline
                    positions={well.trajectoryCoords}
                    pathOptions={{
                      color: '#26E8B0',
                      weight: 2.5,
                      opacity: 0.85,
                    }}
                  />
                </>
              )}

              <Marker
                position={[well.lat, well.lng]}
                icon={createOffsetWellIcon(well, isSelected, showLabels && activeZoom >= 8, langMode)}
                eventHandlers={{
                  click: () => {
                    onSelectWell(well.wellId);
                    onQuickViewWell?.(well.wellId, 'offset');
                  },
                }}
              >
                <Popup>
                  <div className="p-3.5 space-y-3 text-xs bg-[#12221B] text-[#F2F6F0] rounded-xl">
                    <div className="flex items-center justify-between border-b border-[#2B4337] pb-2 gap-2">
                      <div>
                        <div className="font-mono font-bold text-[#26E8B0]">
                          {wellLabelInfo.markerTitle} · {well.wellId}
                        </div>
                        <div className="text-[11px] text-[#9BB0A3]">
                          {wellLabelInfo.locationSubtitle}
                        </div>
                      </div>
                      <div className="text-right font-mono shrink-0">
                        <div className="text-xs font-bold text-[#F2F6F0]">
                          {well.distanceKm} km
                        </div>
                        <div className="text-[10px] text-[#9BB0A3]">Azimuth {well.azimuthDeg}°</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#9BB0A3] block text-[10px]">
                          {formatMapUILabel('totalDepth', langMode)}
                        </span>
                        <span className="font-mono font-semibold">{well.totalDepthMD} m MD</span>
                      </div>
                      <div>
                        <span className="text-[#9BB0A3] block text-[10px]">
                          {formatMapUILabel('wellStatus', langMode)}
                        </span>
                        <span className="font-medium text-[#F2F6F0]">{well.status}</span>
                      </div>
                      <div>
                        <span className="text-[#9BB0A3] block text-[10px]">
                          {formatMapUILabel('historicalEvents', langMode)}
                        </span>
                        <span className="font-mono font-semibold">
                          {wellEvents.length} recorded ({well.nptHours}h NPT)
                        </span>
                      </div>
                      <div>
                        <span className="text-[#9BB0A3] block text-[10px]">
                          {formatMapUILabel('highestSeverity', langMode)}
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            well.highestSeverity === 'Critical'
                              ? 'text-[#F87171]'
                              : well.highestSeverity === 'High'
                              ? 'text-[#FBBF24]'
                              : 'text-[#4ADE80]'
                          }`}
                        >
                          {well.highestSeverity}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#9BB0A3] line-clamp-2 border-t border-[#2B4337] pt-2">
                      {well.summary}
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 pt-1">
                      {onQuickViewWell && (
                        <button
                          onClick={() => onQuickViewWell(well.wellId, 'offset')}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-[#26E8B0] hover:bg-[#4FF2C3] text-[#080D0B] font-bold text-xs text-center transition-colors cursor-pointer"
                        >
                          Quick-View Drawer (In-Map) →
                        </button>
                      )}
                      <button
                        onClick={() => onViewProfile(well.wellId)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-[#162920] hover:bg-[#26E8B0]/20 text-[#26E8B0] border border-[#26E8B0]/40 font-semibold text-xs text-center transition-colors cursor-pointer"
                      >
                        {formatMapUILabel('viewWellProfile', langMode)}
                      </button>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => onCompareWithActive(well.wellId)}
                          className="py-1.5 px-2 rounded-lg bg-[#162920] hover:bg-[#26E8B0]/20 text-[#F2F6F0] font-medium text-[11px] text-center border border-[#2B4337] transition-colors cursor-pointer"
                        >
                          {formatMapUILabel('compareWell', langMode)}
                        </button>
                        <button
                          onClick={() => onViewEvents(well.wellId)}
                          className="py-1.5 px-2 rounded-lg bg-[#162920] hover:bg-[#26E8B0]/20 text-[#FBBF24] font-semibold text-[11px] text-center border border-[#FBBF24]/30 transition-colors cursor-pointer"
                        >
                          {formatMapUILabel('viewEvents', langMode)} ({wellEvents.length})
                        </button>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Floating Well Symbol & Color Legend Panel (Bottom-Left) */}
      <div
        role="region"
        aria-label="Map Symbol and Well Type Legend"
        className="absolute bottom-3 left-3 z-20 max-w-[340px] rounded-xl bg-[#0B1410]/95 backdrop-blur-md border border-[#22352C] shadow-xl text-[11px] overflow-hidden transition-all"
      >
        {/* Legend Panel Header */}
        <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-[#22352C] bg-[#111A16]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#26E8B0] animate-pulse" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#F2F6F0]">
              {langMode === 'hi'
                ? 'मानचित्र प्रतीक एवं कूप प्रकार'
                : 'Well Type & Symbol Legend'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {(statusFilter !== 'All' || severityFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  onStatusFilterChange?.('All');
                  onSeverityFilterChange?.('All');
                }}
                className="px-1.5 py-0.5 rounded bg-[#26E8B0]/20 hover:bg-[#26E8B0] text-[#26E8B0] hover:text-[#080D0B] font-mono text-[9px] font-bold transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsLegendExpanded((prev) => !prev)}
              className="px-2 py-0.5 rounded-md bg-[#162920] hover:bg-[#22352C] text-[#26E8B0] font-mono text-[10px] font-semibold border border-[#2B4337] transition-colors cursor-pointer"
            >
              {isLegendExpanded ? 'Minimize −' : 'Expand +'}
            </button>
          </div>
        </div>

        {isLegendExpanded ? (
          <div className="p-3 space-y-3 max-h-[340px] overflow-y-auto">
            {/* Section 1: Well Types & Operational Status Symbols */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider text-[#9BB0A3]">
                <span>1. Well Types &amp; Marker Symbols</span>
                {onStatusFilterChange && (
                  <span className="text-[#26E8B0]">Click to filter</span>
                )}
              </div>

              {/* Active Drilling Rig */}
              <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-[#111A16]/90 border border-[#22352C]">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex items-center justify-center w-5 h-5 shrink-0">
                    <span className="absolute w-5 h-5 rounded-full bg-[#26E8B0]/30 border border-[#26E8B0]" />
                    <span className="relative w-2.5 h-2.5 rounded-full bg-[#26E8B0] border border-[#0B1410]" />
                  </span>
                  <div>
                    <div className="font-semibold text-[#F2F6F0] leading-tight">
                      Active Drilling Rig
                    </div>
                    <div className="text-[10px] text-[#9BB0A3] leading-tight">
                      Pulsing double-ring bullseye (Live WITSML)
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#26E8B0] font-bold shrink-0">
                  {legendCounts.activeRigs} Rigs
                </span>
              </div>

              {/* Active / Completed Producer */}
              <button
                type="button"
                onClick={() =>
                  onStatusFilterChange?.(
                    statusFilter === 'Completed Producer' ? 'All' : 'Completed Producer'
                  )
                }
                className={`w-full flex items-center justify-between gap-2 p-1.5 rounded-lg border text-left transition-colors ${
                  onStatusFilterChange ? 'cursor-pointer' : 'cursor-default'
                } ${
                  statusFilter === 'Completed Producer'
                    ? 'bg-[#26E8B0]/15 border-[#26E8B0]'
                    : 'bg-[#111A16]/90 hover:bg-[#162920] border-[#22352C]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#4ADE80] border-2 border-[#0B1410] flex items-center justify-center shrink-0 ml-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#080D0B]" />
                  </span>
                  <div>
                    <div className="font-semibold text-[#F2F6F0] leading-tight">
                      Active Producer (PROD)
                    </div>
                    <div className="text-[10px] text-[#9BB0A3] leading-tight">
                      Solid circle with production core dot
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#C5D6CC] font-semibold shrink-0">
                  {legendCounts.producer}
                </span>
              </button>

              {/* Active Injector */}
              <button
                type="button"
                onClick={() =>
                  onStatusFilterChange?.(
                    statusFilter === 'Active Injector' ? 'All' : 'Active Injector'
                  )
                }
                className={`w-full flex items-center justify-between gap-2 p-1.5 rounded-lg border text-left transition-colors ${
                  onStatusFilterChange ? 'cursor-pointer' : 'cursor-default'
                } ${
                  statusFilter === 'Active Injector'
                    ? 'bg-[#26E8B0]/15 border-[#26E8B0]'
                    : 'bg-[#111A16]/90 hover:bg-[#162920] border-[#22352C]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-[4px] bg-[#4ADE80] border-2 border-[#0B1410] flex items-center justify-center shrink-0 ml-0.5 text-[8px] font-black text-[#080D0B] leading-none">
                    ▼
                  </span>
                  <div>
                    <div className="font-semibold text-[#F2F6F0] leading-tight">
                      Active Injector (INJ)
                    </div>
                    <div className="text-[10px] text-[#9BB0A3] leading-tight">
                      Square badge with downward injection chevron
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#C5D6CC] font-semibold shrink-0">
                  {legendCounts.injector}
                </span>
              </button>

              {/* Dormant / Suspended Well */}
              <button
                type="button"
                onClick={() =>
                  onStatusFilterChange?.(statusFilter === 'Suspended' ? 'All' : 'Suspended')
                }
                className={`w-full flex items-center justify-between gap-2 p-1.5 rounded-lg border text-left transition-colors ${
                  onStatusFilterChange ? 'cursor-pointer' : 'cursor-default'
                } ${
                  statusFilter === 'Suspended'
                    ? 'bg-[#26E8B0]/15 border-[#26E8B0]'
                    : 'bg-[#111A16]/90 hover:bg-[#162920] border-[#22352C]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#0B1410] border-2 border-dashed border-[#FBBF24] flex items-center justify-center shrink-0 ml-0.5">
                    <span className="w-1.5 h-1.5 rounded-[1px] bg-[#FBBF24]" />
                  </span>
                  <div>
                    <div className="font-semibold text-[#F2F6F0] leading-tight">
                      Dormant / Suspended (DORMANT)
                    </div>
                    <div className="text-[10px] text-[#9BB0A3] leading-tight">
                      Dashed perimeter ring (Shut-in / Workover)
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#C5D6CC] font-semibold shrink-0">
                  {legendCounts.dormant}
                </span>
              </button>

              {/* Plugged & Abandoned Well */}
              <button
                type="button"
                onClick={() =>
                  onStatusFilterChange?.(
                    statusFilter === 'Plugged & Abandoned' ? 'All' : 'Plugged & Abandoned'
                  )
                }
                className={`w-full flex items-center justify-between gap-2 p-1.5 rounded-lg border text-left transition-colors ${
                  onStatusFilterChange ? 'cursor-pointer' : 'cursor-default'
                } ${
                  statusFilter === 'Plugged & Abandoned'
                    ? 'bg-[#26E8B0]/15 border-[#26E8B0]'
                    : 'bg-[#111A16]/90 hover:bg-[#162920] border-[#22352C]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-[#162920] border-2 border-[#F87171] flex items-center justify-center shrink-0 ml-0.5 text-[8px] font-black text-[#F87171] leading-none">
                    ✕
                  </span>
                  <div>
                    <div className="font-semibold text-[#F2F6F0] leading-tight">
                      Plugged &amp; Abandoned (P&amp;A)
                    </div>
                    <div className="text-[10px] text-[#9BB0A3] leading-tight">
                      Crossed wellhead (Decommissioned &amp; plugged)
                    </div>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-[#C5D6CC] font-semibold shrink-0">
                  {legendCounts.abandoned}
                </span>
              </button>
            </div>

            {/* Section 2: Risk Severity Color Coding */}
            <div className="space-y-1.5 pt-2 border-t border-[#22352C]">
              <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider text-[#9BB0A3]">
                <span>2. Hazard &amp; Risk Color Coding</span>
                <span className="text-[#9BB0A3]">Fill / Border Hue</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    onSeverityFilterChange?.(
                      severityFilter === 'Critical' ? 'All' : 'Critical'
                    )
                  }
                  className={`p-1.5 rounded-lg border text-left transition-colors ${
                    onSeverityFilterChange ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    severityFilter === 'Critical'
                      ? 'bg-[#F87171]/20 border-[#F87171]'
                      : 'bg-[#111A16] hover:bg-[#162920] border-[#22352C]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F87171] shrink-0" />
                    <span className="font-mono text-[10px] font-bold text-[#F87171]">
                      Critical
                    </span>
                  </div>
                  <div className="text-[9px] text-[#9BB0A3] mt-0.5">
                    Kick / Stuck ({legendCounts.critical})
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSeverityFilterChange?.(severityFilter === 'High' ? 'All' : 'High')
                  }
                  className={`p-1.5 rounded-lg border text-left transition-colors ${
                    onSeverityFilterChange ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    severityFilter === 'High'
                      ? 'bg-[#FBBF24]/20 border-[#FBBF24]'
                      : 'bg-[#111A16] hover:bg-[#162920] border-[#22352C]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24] shrink-0" />
                    <span className="font-mono text-[10px] font-bold text-[#FBBF24]">
                      High Risk
                    </span>
                  </div>
                  <div className="text-[9px] text-[#9BB0A3] mt-0.5">
                    Mud Loss ({legendCounts.high})
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSeverityFilterChange?.(severityFilter === 'Low' ? 'All' : 'Low')
                  }
                  className={`p-1.5 rounded-lg border text-left transition-colors ${
                    onSeverityFilterChange ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    severityFilter === 'Low' || severityFilter === 'Medium'
                      ? 'bg-[#4ADE80]/20 border-[#4ADE80]'
                      : 'bg-[#111A16] hover:bg-[#162920] border-[#22352C]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80] shrink-0" />
                    <span className="font-mono text-[10px] font-bold text-[#4ADE80]">
                      Normal
                    </span>
                  </div>
                  <div className="text-[9px] text-[#9BB0A3] mt-0.5">
                    Low Risk ({legendCounts.normal})
                  </div>
                </button>
              </div>
            </div>

            {/* Section 3: Basin Hubs & Trajectory Vectors */}
            <div className="pt-2 border-t border-[#22352C] flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#9BB0A3]">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rotate-45 bg-[#D4DE95] border border-[#0B1410] inline-block" />
                <span>Basin HQ Hub</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-[#26E8B0] inline-block" />
                <span>Well Trajectory</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border border-dashed border-[#26E8B0] inline-block" />
                <span>{radiusKm}km Radius</span>
              </span>
            </div>
          </div>
        ) : (
          /* Compact Minimized Legend Bar */
          <div className="px-3 py-2 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#F2F6F0] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#26E8B0] ring-2 ring-[#D4DE95]" />
              {formatMapUILabel('activeWellLegend', langMode)} ({legendCounts.activeRigs})
            </span>
            <span className="flex items-center gap-1 text-[#9BB0A3]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]" />
              PROD
            </span>
            <span className="flex items-center gap-1 text-[#9BB0A3]">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-[#4ADE80] text-[7px] text-[#080D0B] font-bold flex items-center justify-center">
                ▼
              </span>
              INJ
            </span>
            <span className="flex items-center gap-1 text-[#9BB0A3]">
              <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#FBBF24]" />
              DORMANT
            </span>
            <span className="flex items-center gap-1 text-[#9BB0A3]">
              <span className="w-2.5 h-2.5 rounded-full border border-[#F87171] text-[7px] text-[#F87171] font-bold flex items-center justify-center">
                ✕
              </span>
              P&amp;A
            </span>
          </div>
        )}
      </div>

      {/* Site Planning Base Map Layer Control (Bottom-Right) */}
      <div
        role="group"
        aria-label="Base Map Layer Control"
        className="absolute bottom-7 right-3 z-20 p-1.5 rounded-xl bg-[#0B1410]/95 backdrop-blur-md border border-[#22352C] shadow-lg flex flex-col gap-1"
      >
        <div className="flex items-center justify-between px-1.5 text-[9px] font-mono uppercase tracking-wider text-[#9BB0A3]">
          <span>Site Planning Base Layer</span>
          <span className="text-[#26E8B0] font-bold">{normalizedMapStyle.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1">
          {(
            [
              {
                id: 'simplified',
                label: 'Simplified',
                desc: 'High-contrast corridor & trajectories',
              },
              {
                id: 'topographic',
                label: 'Topographic',
                desc: 'Elevation contours & surface drainage',
              },
              {
                id: 'satellite',
                label: 'Satellite',
                desc: 'Aerial pad imagery & access roads',
              },
            ] as const
          ).map((layer) => {
            const isSelected = normalizedMapStyle === layer.id;
            return (
              <button
                key={layer.id}
                type="button"
                title={layer.desc}
                onClick={() => handleStyleSelect(layer.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#26E8B0] text-[#080D0B] font-bold shadow-xs'
                    : 'bg-[#111A16] hover:bg-[#162920] text-[#C5D6CC] hover:text-white border border-[#22352C]'
                }`}
              >
                {layer.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
