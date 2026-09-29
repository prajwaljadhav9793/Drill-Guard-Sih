import React, { useState, useMemo } from 'react';
import {
  Crosshair,
} from 'lucide-react';
import { useNWIS } from '../../context/NWISContext';

export const DepthCorrelationView: React.FC = () => {
  const {
    activeWell,
    offsetWells,
    events,
    setInspectedEvent,
    navigateToWellProfile,
    navigateToDocById,
  } = useNWIS();

  const [selectedWellIds, setSelectedWellIds] = useState<string[]>([
    'NWIS-OFF-001',
    'NWIS-OFF-002',
    'NWIS-OFF-003',
    'NWIS-OFF-004',
  ]);
  const [depthMode, setDepthMode] = useState<'MD' | 'TVD'>('MD');
  const [minDepth, setMinDepth] = useState<number>(1800);
  const [maxDepth, setMaxDepth] = useState<number>(3600);
  const [highlightedFormation, setHighlightedFormation] = useState<string>('All');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('All');
  const [focusedEventId, setFocusedEventId] = useState<string>('EVT-DEMO-101');

  const toggleWell = (wellId: string) => {
    setSelectedWellIds((prev) =>
      prev.includes(wellId)
        ? prev.filter((id) => id !== wellId)
        : [...prev.slice(-4), wellId]
    );
  };

  const handleJumpToActiveBit = () => {
    const center = depthMode === 'MD' ? activeWell.currentDepthMD : activeWell.currentDepthTVD;
    setMinDepth(Math.max(0, Math.round(center - 450)));
    setMaxDepth(Math.min(4100, Math.round(center + 450)));
  };

  const selectedWells = offsetWells.filter((w) => selectedWellIds.includes(w.wellId));
  const focusedEvent =
    events.find((e) => e.eventId === focusedEventId) || events[0];

  const depthSpan = Math.max(200, maxDepth - minDepth);
  const getVerticalPct = (d: number) => {
    return Math.max(0, Math.min(100, ((d - minDepth) / depthSpan) * 100));
  };

  const activeBitDepth =
    depthMode === 'MD' ? activeWell.currentDepthMD : activeWell.currentDepthTVD;
  const activeBitPct = getVerticalPct(activeBitDepth);

  const depthTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = depthSpan <= 1000 ? 100 : 200;
    const start = Math.ceil(minDepth / step) * step;
    for (let d = start; d <= maxDepth; d += step) {
      ticks.push(d);
    }
    return ticks;
  }, [minDepth, maxDepth, depthSpan]);

  return (
    <div className="space-y-5">
      {/* Header & Depth Window Controls */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-[#A3E6B8] font-semibold">
            APPROXIMATE STRATIGRAPHIC & HAZARD CORRELATION · SYNTHETIC DEMO DATASET
          </div>
          <h1 className="text-xl font-bold text-[#F2F6F0] mt-0.5">
            Multi-Well Depth & Formation Correlation Studio
          </h1>
          <p className="text-xs text-[#9BB0A3]">
            Align active well <strong className="text-[#A3E6B8]">{activeWell.wellId}</strong> with
            offset formation tops, historical mud-loss zones, and pack-off intervals on a unified{' '}
            {depthMode} vertical axis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* MD / TVD Toggle */}
          <div className="flex items-center bg-[#162920] p-1 rounded-xl border border-[#2B4337]">
            <button
              onClick={() => setDepthMode('MD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                depthMode === 'MD'
                  ? 'bg-[#A3E6B8] text-[#0E1914] font-bold'
                  : 'text-[#9BB0A3] hover:text-[#F2F6F0]'
              }`}
            >
              Measured Depth (MD)
            </button>
            <button
              onClick={() => setDepthMode('TVD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                depthMode === 'TVD'
                  ? 'bg-[#A3E6B8] text-[#0E1914] font-bold'
                  : 'text-[#9BB0A3] hover:text-[#F2F6F0]'
              }`}
            >
              True Vertical (TVD)
            </button>
          </div>

          {/* Preset Depth Windows */}
          <button
            onClick={() => {
              setMinDepth(0);
              setMaxDepth(4000);
            }}
            className="px-3 py-2 rounded-xl bg-[#162920] hover:bg-[#1E352B] text-xs font-mono text-[#F2F6F0] border border-[#2B4337]"
          >
            Full Well (0–4,000m)
          </button>

          <button
            onClick={handleJumpToActiveBit}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#A3E6B8]/12 hover:bg-[#D4DE95] text-xs font-semibold text-[#F2F6F0] border border-[#A3E6B8] transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5 text-[#A3E6B8]" />
            <span>Jump to Active Bit ({activeBitDepth.toFixed(0)} m)</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column Correlation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Well Selector & Formation Filters (3 cols) */}
        <div className="lg:col-span-3 p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-5">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#9BB0A3] mb-2">
              Depth Window ({depthMode})
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-[#9BB0A3]">Top (m)</label>
                <input
                  type="number"
                  step={100}
                  value={minDepth}
                  onChange={(e) => setMinDepth(Number(e.target.value))}
                  className="w-full bg-[#162920] text-[#F2F6F0] font-mono rounded-lg px-2.5 py-1.5 border border-[#2B4337] mt-0.5"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#9BB0A3]">Base (m)</label>
                <input
                  type="number"
                  step={100}
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(Number(e.target.value))}
                  className="w-full bg-[#162920] text-[#F2F6F0] font-mono rounded-lg px-2.5 py-1.5 border border-[#2B4337] mt-0.5"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#9BB0A3] mb-2">
              Highlight Formation
            </h3>
            <select
              value={highlightedFormation}
              onChange={(e) => setHighlightedFormation(e.target.value)}
              className="w-full bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-2 border border-[#2B4337]"
            >
              <option value="All">Show All Formations</option>
              {activeWell.formations.map((f) => (
                <option key={f.code} value={f.name}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#9BB0A3] mb-2">
              Filter Event Markers
            </h3>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-2 border border-[#2B4337]"
            >
              <option value="All">All Event Types</option>
              <option value="Mud Loss">Mud Loss</option>
              <option value="Stuck Pipe">Stuck Pipe</option>
              <option value="Kick / Influx">Kick / Influx</option>
              <option value="Torque Spike">Torque Spike</option>
              <option value="Fishing">Fishing</option>
              <option value="Cementing Issue">Cementing Issue</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#9BB0A3]">
                Offset Well Tracks (Max 5)
              </h3>
              <span className="text-[11px] font-mono text-[#A3E6B8] font-semibold">
                {selectedWellIds.length} active
              </span>
            </div>
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {offsetWells.map((w) => {
                const checked = selectedWellIds.includes(w.wellId);
                return (
                  <label
                    key={w.wellId}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                      checked
                        ? 'bg-[#A3E6B8]/12 border-[#A3E6B8] text-[#F2F6F0] font-semibold'
                        : 'bg-[#162920] border-[#2B4337] text-[#9BB0A3]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleWell(w.wellId)}
                        className="rounded accent-[#A3E6B8]"
                      />
                      <span className="font-mono font-semibold">{w.wellId}</span>
                    </div>
                    <span className="font-mono text-[11px]">{w.distanceKm} km</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Compact Legend */}
          <div className="pt-3 border-t border-[#2B4337] space-y-1.5 text-[11px] text-[#9BB0A3]">
            <div className="font-mono uppercase text-[10px] text-[#F2F6F0] font-bold">Legend</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-[#A3E6B8]" />
              <span>Active Bit Depth Indicator</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F87171]" />
              <span>Critical Event Marker</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" />
              <span>High/Medium Event Marker</span>
            </div>
          </div>
        </div>

        {/* Center: Multi-Well Vertical Correlation Canvas (6 cols) */}
        <div className="lg:col-span-6 p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2B4337]">
            <span className="text-xs font-semibold text-[#F2F6F0]">
              Vertical Stratigraphic & Event Correlation ({minDepth}m – {maxDepth}m {depthMode})
            </span>
            <span className="text-[11px] font-mono text-[#9BB0A3]">
              Click any event badge to inspect
            </span>
          </div>

          <div className="relative flex-1 min-h-[560px] bg-[#162920] rounded-xl border border-[#2B4337] overflow-x-auto">
            <div className="min-w-[620px] h-[560px] flex relative">
              {/* Horizontal Active Bit Reference Line across all tracks */}
              {activeBitDepth >= minDepth && activeBitDepth <= maxDepth && (
                <div
                  className="absolute left-0 right-0 z-30 border-t-2 border-dashed border-[#A3E6B8] pointer-events-none"
                  style={{ top: `${activeBitPct}%` }}
                >
                  <span className="absolute left-16 -top-5 px-2 py-0.5 rounded bg-[#162920] text-[#D4DE95] font-mono text-[10px] font-bold shadow">
                    ACTIVE BIT: {activeBitDepth.toFixed(1)} m {depthMode}
                  </span>
                </div>
              )}

              {/* Left Depth Axis Ruler */}
              <div className="w-16 shrink-0 border-r border-[#2B4337] bg-[#12221B] relative">
                <div className="h-10 border-b border-[#2B4337] flex items-center justify-center font-mono text-[10px] text-[#9BB0A3] font-semibold">
                  {depthMode} (m)
                </div>
                <div className="relative h-[520px]">
                  {depthTicks.map((t) => {
                    const topPct = getVerticalPct(t);
                    return (
                      <div
                        key={t}
                        className="absolute left-0 right-0 flex items-center justify-end pr-1.5 font-mono text-[10px] text-[#9BB0A3] -translate-y-1/2"
                        style={{ top: `${topPct}%` }}
                      >
                        <span>{t}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Track 1: Active Well Track */}
              <div className="w-36 shrink-0 border-r border-[#A3E6B8]/40 bg-[#A3E6B8]/12 flex flex-col">
                <div className="h-10 px-2 border-b border-[#A3E6B8]/40 bg-[#162920] flex flex-col justify-center text-center">
                  <div className="font-mono text-xs font-bold text-[#D4DE95]">
                    {activeWell.wellId}
                  </div>
                  <div className="text-[9px] font-mono text-[#A3E6B8]">ACTIVE WELL</div>
                </div>
                <div className="relative flex-1">
                  {activeWell.formations.map((f) => {
                    const topVal = depthMode === 'MD' ? f.topMD : f.topTVD;
                    const botVal = depthMode === 'MD' ? f.bottomMD : f.bottomTVD;
                    const topPct = getVerticalPct(topVal);
                    const botPct = getVerticalPct(botVal);
                    const heightPct = Math.max(0, botPct - topPct);
                    if (heightPct <= 0) return null;
                    const dimmed =
                      highlightedFormation !== 'All' && highlightedFormation !== f.name;
                    return (
                      <div
                        key={f.code}
                        className="absolute left-1 right-1 rounded border px-1.5 py-1 overflow-hidden transition-opacity"
                        style={{
                          top: `${topPct}%`,
                          height: `${heightPct}%`,
                          backgroundColor: `${f.color}${dimmed ? '14' : '2E'}`,
                          borderColor: `${f.color}88`,
                        }}
                      >
                        <div className="font-mono text-[10px] font-bold text-[#F2F6F0]">
                          {f.code}
                        </div>
                        <div className="text-[9px] text-[#F2F6F0] font-medium truncate">{topVal}m</div>
                      </div>
                    );
                  })}

                  {/* Drilled Wellbore Conduit up to Current Bit Depth */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 w-2 bg-[#A3E6B8] rounded-b shadow-[0_0_8px_rgba(163, 230, 184,0.6)]"
                    style={{
                      top: '0%',
                      height: `${activeBitPct}%`,
                    }}
                  />
                </div>
              </div>

              {/* Offset Well Tracks */}
              {selectedWells.map((well) => {
                const wellEvents = events.filter((e) => {
                  if (e.wellId !== well.wellId) return false;
                  if (eventTypeFilter !== 'All' && e.eventType !== eventTypeFilter) return false;
                  const d = depthMode === 'MD' ? e.depthMD : e.depthTVD;
                  return d >= minDepth && d <= maxDepth;
                });

                return (
                  <div
                    key={well.wellId}
                    className="flex-1 min-w-[115px] border-r border-[#2B4337] flex flex-col bg-[#12221B]/80"
                  >
                    <div
                      onClick={() => navigateToWellProfile(well.wellId)}
                      className="h-10 px-2 border-b border-[#2B4337] bg-[#12221B] hover:bg-[#A3E6B8]/20 cursor-pointer flex flex-col justify-center text-center transition-colors"
                    >
                      <div className="font-mono text-xs font-bold text-[#F2F6F0]">
                        {well.wellId.replace('NWIS-', '')}
                      </div>
                      <div className="text-[9px] font-mono text-[#9BB0A3]">
                        {well.distanceKm} km · {well.nptHours}h NPT
                      </div>
                    </div>

                    <div className="relative flex-1">
                      {well.formations.map((f) => {
                        const topVal = depthMode === 'MD' ? f.topMD : f.topTVD;
                        const botVal = depthMode === 'MD' ? f.bottomMD : f.bottomTVD;
                        const topPct = getVerticalPct(topVal);
                        const botPct = getVerticalPct(botVal);
                        const heightPct = Math.max(0, botPct - topPct);
                        if (heightPct <= 0) return null;
                        const dimmed =
                          highlightedFormation !== 'All' && highlightedFormation !== f.name;
                        return (
                          <div
                            key={f.code}
                            className="absolute left-1 right-1 rounded border px-1.5 py-0.5 overflow-hidden"
                            style={{
                              top: `${topPct}%`,
                              height: `${heightPct}%`,
                              backgroundColor: `${f.color}${dimmed ? '12' : '26'}`,
                              borderColor: `${f.color}77`,
                            }}
                          >
                            <div className="font-mono text-[9px] text-[#F2F6F0] font-medium">
                              {f.code} ({topVal}m)
                            </div>
                          </div>
                        );
                      })}

                      {/* Historical Event Markers on Track */}
                      {wellEvents.map((evt) => {
                        const d = depthMode === 'MD' ? evt.depthMD : evt.depthTVD;
                        const topPct = getVerticalPct(d);
                        const isCrit = evt.severity === 'Critical';
                        return (
                          <button
                            key={evt.eventId}
                            onClick={() => {
                              setFocusedEventId(evt.eventId);
                              setInspectedEvent(evt);
                            }}
                            style={{ top: `${topPct}%` }}
                            className={`absolute left-2 right-2 -translate-y-1/2 z-20 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold flex items-center justify-between border shadow-xs transition-transform hover:scale-105 ${
                              isCrit
                                ? 'bg-[#F87171] text-[#12221B] border-[#0E1914]'
                                : 'bg-[#FBBF24] text-[#12221B] border-[#0E1914]'
                            }`}
                          >
                            <span className="truncate">{evt.eventType}</span>
                            <span>{d}m</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Rightmost Historical Event Density Strip */}
              <div className="w-16 shrink-0 bg-[#12221B] flex flex-col">
                <div className="h-10 border-b border-[#2B4337] flex items-center justify-center font-mono text-[9px] text-[#9BB0A3] font-semibold text-center px-1">
                  HAZARD DENSITY
                </div>
                <div className="relative flex-1 p-1">
                  {/* High density band around 2,860-2,920m */}
                  <div
                    className="absolute left-1 right-1 rounded bg-[#F87171]/20 border border-[#F87171] flex items-center justify-center font-mono text-[9px] text-[#F87171] font-bold"
                    style={{
                      top: `${getVerticalPct(2850)}%`,
                      height: `${Math.max(4, getVerticalPct(2925) - getVerticalPct(2850))}%`,
                    }}
                  >
                    HIGH
                  </div>
                  <div
                    className="absolute left-1 right-1 rounded bg-[#FBBF24]/20 border border-[#FBBF24] flex items-center justify-center font-mono text-[9px] text-[#FBBF24] font-bold"
                    style={{
                      top: `${getVerticalPct(3040)}%`,
                      height: `${Math.max(4, getVerticalPct(3160) - getVerticalPct(3040))}%`,
                    }}
                  >
                    KICK
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Event Details & Formation Risk Summary (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3">
            <div className="text-xs font-mono text-[#A3E6B8] font-semibold">
              CORRELATED OFFSET EVENT INSPECTOR
            </div>
            <h3 className="text-sm font-bold text-[#F2F6F0]">
              {focusedEvent.eventId} — {focusedEvent.eventType}
            </h3>
            <div className="text-xs font-mono text-[#A3E6B8] font-semibold">
              Well {focusedEvent.wellId} · {focusedEvent.depthMD} m MD ({focusedEvent.depthTVD} m TVD)
            </div>
            <p className="text-xs text-[#9BB0A3] leading-relaxed">{focusedEvent.symptoms}</p>
            <div className="p-3 rounded-xl bg-[#A3E6B8]/12 border border-[#3B5949] text-xs text-[#F2F6F0]">
              <strong className="text-[#F2F6F0]">Mitigation:</strong> {focusedEvent.mitigation}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setInspectedEvent(focusedEvent)}
                className="flex-1 py-1.5 rounded-lg bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-semibold text-xs transition-colors"
              >
                Full Event Drawer
              </button>
              <button
                onClick={() => navigateToDocById(focusedEvent.sourceDocId)}
                className="py-1.5 px-2.5 rounded-lg bg-[#162920] text-[#F2F6F0] font-mono text-xs border border-[#3B5949]"
              >
                {focusedEvent.sourceDocId}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#9BB0A3]">
              Formation Risk Summary
            </h3>
            <div className="space-y-2.5">
              {activeWell.formations.slice(1, 5).map((f) => (
                <div
                  key={f.code}
                  className="p-3 rounded-xl bg-[#162920] border border-[#2B4337] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-[#F2F6F0]">{f.code}</span>
                    <span className="text-[#A3E6B8] font-semibold">
                      {f.topMD}–{f.bottomMD}m
                    </span>
                  </div>
                  <div className="text-[11px] text-[#9BB0A3] leading-relaxed">{f.riskSummary}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
