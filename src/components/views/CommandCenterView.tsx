import React, { useState } from 'react';
import {
  Activity,
  MapPin,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Radio,
  ArrowRight,
  Bot,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import { useNWIS } from '../../context/NWISContext';
import { WellGISMap } from '../map/WellGISMap';
import { DrillGuardShieldMark } from '../common/DrillGuardLogo';

export const CommandCenterView: React.FC = () => {
  const {
    selectedField,
    activeWells,
    activeWell,
    offsetWells,
    selectedOffsetWellId,
    setSelectedOffsetWellId,
    events,
    documents,
    alerts,
    lessons,
    telemetryHistory,
    riskAssessments,
    simulationStatus,
    setActiveRoute,
    navigateToWellProfile,
    setInspectedEvent,
    setInspectedDocument,
    setInspectedAlert,
    askAIAbout,
    openFullGISMap,
  } = useNWIS();

  const [mapRadiusKm, setMapRadiusKm] = useState<number>(10);

  const activeAlerts = alerts.filter((a) => a.status === 'Active');
  const nearbyWellsInRadius = offsetWells.filter((w) => w.distanceKm <= mapRadiusKm);
  const eventsNearCurrentDepth = events.filter(
    (e) => Math.abs(e.depthMD - activeWell.currentDepthMD) <= 120
  );
  const avgOffsetNpt = (
    offsetWells.reduce((acc, w) => acc + w.nptHours, 0) / offsetWells.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Command Center Top Header */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <DrillGuardShieldMark className="w-12 h-12 hidden sm:block" />
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#9BB0A3] mb-1">
              <span className="font-mono text-[#A3E6B8] font-semibold">DRILL GUARD COMMAND SUITE</span>
              <span aria-hidden="true">·</span>
              <span>Field: {selectedField}</span>
              <span aria-hidden="true">·</span>
              <span>Rig: {activeWell.rigName}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F2F6F0]">
              Drill Guard Intelligence Command Center
            </h1>
            <p className="text-xs sm:text-sm text-[#9BB0A3] mt-0.5">
              Live operational awareness powered by Nearby Wells Intelligence System.
            </p>
          </div>
        </div>

        {/* Live Telemetry Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#162920] p-3.5 rounded-xl border border-[#2B4337]">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#9BB0A3]">
              Active Well / Status
            </div>
            <div className="font-mono text-sm font-bold text-[#A3E6B8] mt-0.5">
              {activeWell.wellId} · {activeWell.status}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#9BB0A3]">
              Current Depth (MD)
            </div>
            <div className="font-mono text-sm font-bold text-[#F2F6F0] tabular-nums mt-0.5">
              {activeWell.currentDepthMD.toFixed(1)} m
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#9BB0A3]">
              Current Formation
            </div>
            <div className="text-xs font-semibold text-[#F2F6F0] truncate mt-0.5">
              {activeWell.currentFormation}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#9BB0A3]">
              Drill Guard Feed Status
            </div>
            <div className="font-mono text-xs font-semibold text-[#4ADE80] mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />
              {simulationStatus === 'running' ? 'SIMULATED 1Hz' : 'PAUSED'}
            </div>
          </div>
        </div>
      </div>

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <button
          onClick={() => setActiveRoute('active-well')}
          className="p-4 rounded-2xl bg-[#12221B] hover:bg-[#162920] border border-[#2B4337] hover:border-[#3B5949] shadow-2xs text-left transition-all"
        >
          <div className="flex items-center justify-between text-xs text-[#9BB0A3] mb-2">
            <span>Active Wells</span>
            <Activity className="w-4 h-4 text-[#A3E6B8]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#A3E6B8] tabular-nums">
            {activeWells.length}
          </div>
          <div className="text-[11px] text-[#9BB0A3] mt-1">
            Primary: <span className="text-[#F2F6F0] font-mono font-semibold">{activeWell.wellName}</span>
          </div>
        </button>

        <button
          onClick={() => setActiveRoute('nearby-map')}
          className="p-4 rounded-2xl bg-[#12221B] hover:bg-[#162920] border border-[#2B4337] hover:border-[#3B5949] shadow-2xs text-left transition-all"
        >
          <div className="flex items-center justify-between text-xs text-[#9BB0A3] mb-2">
            <span>Nearby Offset Wells</span>
            <MapPin className="w-4 h-4 text-[#A3E6B8]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#A3E6B8] tabular-nums">
            {offsetWells.length}
          </div>
          <div className="text-[11px] text-[#9BB0A3] mt-1">
            {offsetWells.filter((w) => w.distanceKm <= 10).length} within 10 km radius
          </div>
        </button>

        <button
          onClick={() => setActiveRoute('alerts-warnings')}
          className="p-4 rounded-2xl bg-[#12221B] hover:bg-[#162920] border border-[#F87171]/35 hover:border-[#F87171] shadow-2xs text-left transition-all"
        >
          <div className="flex items-center justify-between text-xs text-[#9BB0A3] mb-2">
            <span>Active Risk Alerts</span>
            <ShieldAlert className="w-4 h-4 text-[#F87171]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#F87171] tabular-nums">
            {activeAlerts.length}
          </div>
          <div className="text-[11px] text-[#9BB0A3] mt-1">
            {alerts.filter((a) => a.severity === 'Critical').length} Critical · Requires review
          </div>
        </button>

        <button
          onClick={() => setActiveRoute('event-intelligence')}
          className="p-4 rounded-2xl bg-[#12221B] hover:bg-[#162920] border border-[#2B4337] hover:border-[#3B5949] shadow-2xs text-left transition-all"
        >
          <div className="flex items-center justify-between text-xs text-[#9BB0A3] mb-2">
            <span>Events in Depth Range</span>
            <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#FBBF24] tabular-nums">
            {eventsNearCurrentDepth.length}
          </div>
          <div className="text-[11px] text-[#9BB0A3] mt-1">
            Within ±120 m of {activeWell.currentDepthMD.toFixed(0)} m
          </div>
        </button>

        <button
          onClick={() => setActiveRoute('offset-profiles')}
          className="p-4 rounded-2xl bg-[#12221B] hover:bg-[#162920] border border-[#2B4337] hover:border-[#3B5949] shadow-2xs text-left transition-all"
        >
          <div className="flex items-center justify-between text-xs text-[#9BB0A3] mb-2">
            <span>Average Offset NPT</span>
            <Clock className="w-4 h-4 text-[#F2F6F0]" />
          </div>
          <div className="font-mono text-2xl font-bold text-[#F2F6F0] tabular-nums">
            {avgOffsetNpt} <span className="text-xs font-normal text-[#9BB0A3]">hrs</span>
          </div>
          <div className="text-[11px] text-[#9BB0A3] mt-1">
            Best benchmark: 14.0 hrs (OFF-009)
          </div>
        </button>

        <button
          onClick={() => setActiveRoute('live-integration')}
          className="p-4 rounded-2xl bg-[#12221B] hover:bg-[#162920] border border-[#2B4337] hover:border-[#3B5949] shadow-2xs text-left transition-all"
        >
          <div className="flex items-center justify-between text-xs text-[#9BB0A3] mb-2">
            <span>Data Integration</span>
            <Radio className="w-4 h-4 text-[#4ADE80]" />
          </div>
          <div className="font-mono text-lg font-bold text-[#4ADE80] tabular-nums mt-1">
            12 / 12 CHANNELS
          </div>
          <div className="text-[11px] text-[#9BB0A3] mt-1">
            {activeWell.lastUpdated}
          </div>
        </button>
      </div>

      {/* Drilling Situation Progression Bar */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#3B5949] shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#A3E6B8]" />
            <h2 className="text-sm font-semibold text-[#F2F6F0]">
              Drilling Situation & Horizon Look-Ahead
            </h2>
          </div>
          <button
            onClick={() => setActiveRoute('depth-correlation')}
            className="text-xs text-[#A3E6B8] hover:text-[#F2F6F0] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Open Multi-Well Depth Correlation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-[#162920] border border-[#2B4337]">
            <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">
              01 · Current Bit Depth
            </div>
            <div className="font-mono text-base font-bold text-[#A3E6B8] mt-1">
              {activeWell.currentDepthMD.toFixed(1)} m MD
            </div>
            <div className="text-[11px] text-[#9BB0A3] mt-0.5">
              TVD: {activeWell.currentDepthTVD.toFixed(1)} m · ROP {activeWell.rop} m/hr
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#162920] border border-[#2B4337]">
            <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">
              02 · Current Formation
            </div>
            <div className="text-sm font-semibold text-[#F2F6F0] mt-1">
              {activeWell.currentFormation}
            </div>
            <div className="text-[11px] text-[#9BB0A3] mt-0.5">
              Interval: 1,980 – 3,040 m MD (Fractured Sand/Shale)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#162920] border border-[#2B4337]">
            <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">
              03 · Next Formation Boundary
            </div>
            <div className="text-sm font-semibold text-[#F2F6F0] mt-1">
              {activeWell.nextFormation}
            </div>
            <div className="text-[11px] font-mono text-[#A3E6B8] font-semibold mt-0.5">
              Top at ~{activeWell.nextFormationTopMD} m MD (in{' '}
              {Math.max(0, activeWell.nextFormationTopMD - activeWell.currentDepthMD).toFixed(0)} m)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FBBF24]/10 border border-[#FBBF24]/35">
            <div className="text-[10px] font-mono uppercase text-[#FBBF24] font-semibold">
              04 · Approaching Offset Hazards
            </div>
            <div className="text-xs font-semibold text-[#F2F6F0] mt-1">
              2,860 – 2,890 m MD Fracture Zone
            </div>
            <div className="text-[11px] text-[#9BB0A3] mt-0.5">
              Mud loss (OFF-001, OFF-008) & Pack-off (OFF-002)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F87171]/10 border border-[#F87171]/35">
            <div className="text-[10px] font-mono uppercase text-[#F87171] font-semibold">
              05 · Active Advisory Alert
            </div>
            <div className="text-xs font-semibold text-[#F2F6F0] mt-1 truncate">
              {activeAlerts[0]?.title || 'All Parameters Nominal'}
            </div>
            <button
              onClick={() =>
                activeAlerts[0]
                  ? setInspectedAlert(activeAlerts[0])
                  : setActiveRoute('alerts-warnings')
              }
              className="text-[11px] text-[#A3E6B8] font-semibold hover:underline mt-0.5 inline-block"
            >
              Review Evidence & LCM Readiness →
            </button>
          </div>
        </div>
      </div>

      {/* Main Split: Left GIS Map + Right Active Well Risk Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Nearby-Well GIS Map (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-[#F2F6F0]">
                All-India Sedimentary Basins &amp; Offset Wells GIS
              </h2>
              <p className="text-xs text-[#9BB0A3]">
                Showing 9 active rigs &amp; 25 offset wells across Assam, Rajasthan, Gujarat, Mumbai High, KG, Cauvery &amp; Odisha
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              {[5, 10, 25].map((r) => (
                <button
                  key={r}
                  onClick={() => setMapRadiusKm(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    mapRadiusKm === r
                      ? 'bg-[#A3E6B8] text-[#0E1914] font-semibold'
                      : 'bg-[#162920] text-[#9BB0A3] hover:text-[#F2F6F0] border border-[#2B4337]'
                  }`}
                >
                  {r} km
                </button>
              ))}
              <button
                onClick={openFullGISMap}
                className="px-3 py-1 rounded-lg bg-[#26E8B0] hover:bg-[#4FF2C3] text-[#080D0B] text-xs font-bold border border-[#26E8B0] shadow-xs transition-colors cursor-pointer"
              >
                ⤢ Full GIS Map
              </button>
            </div>
          </div>

          <WellGISMap
            activeWell={activeWell}
            offsetWells={nearbyWellsInRadius}
            events={events}
            selectedWellId={selectedOffsetWellId}
            onSelectWell={(id) => setSelectedOffsetWellId(id)}
            onViewProfile={(id) => navigateToWellProfile(id)}
            onCompareWithActive={(id) => {
              setSelectedOffsetWellId(id);
              setActiveRoute('parameter-comparison');
            }}
            onViewEvents={(id) => {
              setSelectedOffsetWellId(id);
              setActiveRoute('event-intelligence');
            }}
            radiusKm={mapRadiusKm}
            heightClass="h-[410px]"
            defaultAllIndia={true}
          />

          {/* Quick Closest Offset Well Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {(offsetWells.filter((w) => w.field === activeWell.field).length > 0
              ? offsetWells.filter((w) => w.field === activeWell.field)
              : offsetWells
            )
              .slice(0, 3)
              .map((w) => (
              <button
                key={w.wellId}
                onClick={() => navigateToWellProfile(w.wellId)}
                className={`p-3 rounded-xl border text-left transition-colors ${
                  selectedOffsetWellId === w.wellId
                    ? 'bg-[#A3E6B8]/12 border-[#A3E6B8]'
                    : 'bg-[#162920] border-[#2B4337] hover:border-[#3B5949]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#A3E6B8]">{w.wellId}</span>
                  <span className="text-[#9BB0A3]">{w.distanceKm} km</span>
                </div>
                <div className="text-[11px] text-[#F2F6F0] font-medium mt-1 truncate">
                  TD {w.totalDepthMD} m · NPT {w.nptHours} hrs
                </div>
                <div className="text-[11px] text-[#9BB0A3] mt-0.5 truncate">
                  Max Risk:{' '}
                  <span
                    className={`font-semibold ${
                      w.highestSeverity === 'Critical'
                        ? 'text-[#F87171]'
                        : w.highestSeverity === 'High'
                        ? 'text-[#FBBF24]'
                        : 'text-[#4ADE80]'
                    }`}
                  >
                    {w.highestSeverity}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Active Well Risk Intelligence Panel (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#F2F6F0]">
                Active Well Risk Intelligence
              </h2>
              <p className="text-xs text-[#9BB0A3]">
                Explainable rule-based indicators at {activeWell.currentDepthMD.toFixed(1)} m MD
              </p>
            </div>
            <button
              onClick={() => setActiveRoute('risk-prediction')}
              className="text-xs text-[#A3E6B8] hover:text-[#F2F6F0] hover:underline font-semibold"
            >
              Full Risk Matrix →
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {riskAssessments.slice(0, 5).map((r) => (
              <div
                key={r.category}
                className="p-3.5 rounded-xl bg-[#162920] border border-[#2B4337] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        r.status === 'High Watch'
                          ? 'bg-[#F87171]'
                          : r.status === 'Elevated'
                          ? 'bg-[#FBBF24]'
                          : 'bg-[#4ADE80]'
                      }`}
                    />
                    <span className="text-xs font-semibold text-[#F2F6F0]">{r.category}</span>
                  </div>
                  <div className="font-mono text-xs">
                    <span
                      className={
                        r.status === 'High Watch'
                          ? 'text-[#F87171] font-semibold'
                          : r.status === 'Elevated'
                          ? 'text-[#FBBF24] font-semibold'
                          : 'text-[#4ADE80] font-semibold'
                      }
                    >
                      {r.status.toUpperCase()}
                    </span>
                    <span className="text-[#9BB0A3] ml-1.5">· Index {r.score}/100</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-[#2B4337] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      r.status === 'High Watch'
                        ? 'bg-[#F87171]'
                        : r.status === 'Elevated'
                        ? 'bg-[#FBBF24]'
                        : 'bg-[#A3E6B8]'
                    }`}
                    style={{ width: `${r.score}%` }}
                  />
                </div>

                <div className="text-[11px] text-[#9BB0A3] leading-relaxed">
                  {r.contributingIndicators[0]}
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#A3E6B8] font-medium pt-0.5">
                  <span>Interval: {r.relevantDepthInterval}</span>
                  <span>Refs: {r.supportingWells.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() =>
              askAIAbout(
                `What risks were observed in nearby offset wells around ${activeWell.currentDepthMD.toFixed(
                  0
                )} m MD in ${activeWell.currentFormation}, and what mitigation measures are documented?`
              )
            }
            className="w-full py-2.5 px-4 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Bot className="w-4 h-4" />
            <span>Ask NWIS Assistant About Current Depth Interval</span>
          </button>
        </div>
      </div>

      {/* Real-Time Drilling Parameter Charts + Offset NPT Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-[#F2F6F0]">
                Real-Time Drilling Telemetry Trends (Simulated 1 Hz Stream)
              </h2>
              <p className="text-xs text-[#9BB0A3]">
                ROP (m/hr) and Rotary Torque (kN·m) for {activeWell.wellId}
              </p>
            </div>
            <button
              onClick={() => setActiveRoute('active-well')}
              className="text-xs text-[#A3E6B8] hover:text-[#F2F6F0] hover:underline font-semibold"
            >
              Open Active Well Console →
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={telemetryHistory}>
                <defs>
                  <linearGradient id="ropGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A3E6B8" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#A3E6B8" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="trqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B5949" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#3B5949" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#2B4337" strokeDasharray="3 3" />
                <XAxis
                  dataKey="timeLabel"
                  stroke="#9BB0A3"
                  fontSize={11}
                  tickMargin={8}
                />
                <YAxis stroke="#9BB0A3" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12221B',
                    borderColor: '#3B5949',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#F2F6F0',
                    boxShadow: '0 8px 24px rgba(61, 65, 39, 0.12)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rop"
                  name="ROP (m/hr)"
                  stroke="#A3E6B8"
                  strokeWidth={2.2}
                  fill="url(#ropGrad)"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="torque"
                  name="Torque (kN·m)"
                  stroke="#D4DE95"
                  strokeWidth={2}
                  fill="url(#trqGrad)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nearby Well NPT Comparison Chart */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#F2F6F0]">
                Nearby Offset NPT Comparison
              </h2>
              <p className="text-xs text-[#9BB0A3]">Non-Productive Time (hours) by offset well</p>
            </div>
            <button
              onClick={() => setActiveRoute('parameter-comparison')}
              className="text-xs text-[#A3E6B8] hover:text-[#F2F6F0] hover:underline font-semibold"
            >
              Compare →
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={offsetWells.slice(0, 7)} layout="vertical">
                <CartesianGrid stroke="#2B4337" strokeDasharray="3 3" />
                <XAxis type="number" stroke="#9BB0A3" fontSize={11} />
                <YAxis
                  dataKey="wellId"
                  type="category"
                  stroke="#9BB0A3"
                  fontSize={10}
                  width={84}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12221B',
                    borderColor: '#3B5949',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#F2F6F0',
                    boxShadow: '0 8px 24px rgba(61, 65, 39, 0.12)',
                  }}
                />
                <Bar dataKey="nptHours" name="NPT (Hours)" fill="#A3E6B8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom 3-Column Intelligence Strip: Approaching Events, Recommended Reports, Recent Mitigation Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Approaching Historical Risk Zones & Events */}
        <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F2F6F0]">
              Approaching Historical Risk Zones
            </h3>
            <button
              onClick={() => setActiveRoute('event-intelligence')}
              className="text-xs text-[#A3E6B8] font-semibold hover:underline"
            >
              All Events ({events.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {events.slice(0, 4).map((evt) => (
              <button
                key={evt.eventId}
                onClick={() => setInspectedEvent(evt)}
                className="w-full p-3 rounded-xl bg-[#162920] hover:bg-[#A3E6B8]/20 border border-[#2B4337] hover:border-[#3B5949] text-left transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#A3E6B8] font-semibold">
                    {evt.eventId} · {evt.wellId}
                  </span>
                  <span
                    className={
                      evt.severity === 'Critical'
                        ? 'text-[#F87171] font-semibold'
                        : 'text-[#FBBF24] font-semibold'
                    }
                  >
                    {evt.severity} · {evt.depthMD} m MD
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#F2F6F0] mt-1">
                  {evt.eventType} in {evt.formation}
                </div>
                <p className="text-[11px] text-[#9BB0A3] line-clamp-2 mt-0.5">{evt.mitigation}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: Recommended Historical Reports & Latest Processed Docs */}
        <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F2F6F0]">
              Recommended Offset Reports & OCR Docs
            </h3>
            <button
              onClick={() => setActiveRoute('knowledge-repo')}
              className="text-xs text-[#A3E6B8] font-semibold hover:underline"
            >
              Repository ({documents.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {documents.slice(0, 4).map((doc) => (
              <button
                key={doc.docId}
                onClick={() => setInspectedDocument(doc)}
                className="w-full p-3 rounded-xl bg-[#162920] hover:bg-[#A3E6B8]/20 border border-[#2B4337] hover:border-[#3B5949] text-left transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-[#9BB0A3]">
                  <span className="text-[#A3E6B8] font-semibold">{doc.docId}</span>
                  <span>
                    Well {doc.wellId} · {doc.verificationStatus}
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#F2F6F0] mt-1 line-clamp-1">
                  {doc.title}
                </div>
                <div className="text-[11px] text-[#9BB0A3] mt-0.5 line-clamp-1">
                  Extracted: {doc.extractedData.mitigationSummary}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Column 3: Recent Mitigation Lessons Learned */}
        <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F2F6F0]">
              Documented Mitigation Lessons
            </h3>
            <button
              onClick={() => setActiveRoute('lessons-learned')}
              className="text-xs text-[#A3E6B8] font-semibold hover:underline"
            >
              Library ({lessons.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {lessons.slice(0, 4).map((lsn) => (
              <div
                key={lsn.lessonId}
                onClick={() => setActiveRoute('lessons-learned')}
                className="p-3 rounded-xl bg-[#162920] hover:bg-[#A3E6B8]/20 border border-[#2B4337] hover:border-[#3B5949] cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#4ADE80] font-semibold">
                    {lsn.lessonId} · {lsn.sourceWellId}
                  </span>
                  <span className="text-[#9BB0A3]">{lsn.depthMD} m MD</span>
                </div>
                <div className="text-xs font-semibold text-[#F2F6F0] mt-1">
                  {lsn.eventType}: {lsn.outcomeCategory}
                </div>
                <p className="text-[11px] text-[#9BB0A3] line-clamp-2 mt-0.5">
                  {lsn.historicalResponse}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
