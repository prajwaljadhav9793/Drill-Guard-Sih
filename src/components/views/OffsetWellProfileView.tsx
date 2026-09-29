import React, { useState } from 'react';
import {
  Layers,
  Sliders,
  Bot,
  Download,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useNWIS } from '../../context/NWISContext';

type ProfileTab =
  | 'overview'
  | 'drilling-history'
  | 'geology'
  | 'parameters'
  | 'mud-casing'
  | 'cementing'
  | 'events'
  | 'npt'
  | 'lessons'
  | 'documents';

export const OffsetWellProfileView: React.FC = () => {
  const {
    offsetWells,
    selectedOffsetWell,
    setSelectedOffsetWellId,
    events,
    documents,
    lessons,
    setInspectedEvent,
    setInspectedDocument,
    setActiveRoute,
    askAIAbout,
    addToast,
  } = useNWIS();

  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');

  const wellEvents = events.filter((e) => e.wellId === selectedOffsetWell.wellId);
  const wellDocs = documents.filter((d) => d.wellId === selectedOffsetWell.wellId);
  const wellLessons = lessons.filter((l) => l.sourceWellId === selectedOffsetWell.wellId);

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: 'overview', label: '1. Overview' },
    { id: 'drilling-history', label: '2. Drilling History' },
    { id: 'geology', label: '3. Geological Profile' },
    { id: 'parameters', label: '4. Drilling Parameters' },
    { id: 'mud-casing', label: '5. Mud & Casing' },
    { id: 'cementing', label: '6. Cementing' },
    { id: 'events', label: `7. Operational Events (${wellEvents.length})` },
    { id: 'npt', label: '8. NPT Analysis' },
    { id: 'lessons', label: `9. Lessons Learned (${wellLessons.length})` },
    { id: 'documents', label: `10. Documents (${wellDocs.length})` },
  ];

  const handleExportSummary = () => {
    const payload = {
      disclaimer: 'SYNTHETIC DEMO RECORD — NOT ACTUAL OIL INDIA LIMITED DATA',
      exportedAt: new Date().toISOString(),
      well: selectedOffsetWell,
      events: wellEvents,
      documents: wellDocs.map((d) => ({ docId: d.docId, title: d.title, date: d.date })),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedOffsetWell.wellId}_Intelligence_Profile.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(
      'Offset Well Summary Exported',
      `Downloaded ${selectedOffsetWell.wellId}_Intelligence_Profile.json`,
      'success'
    );
  };

  return (
    <div className="space-y-5">
      {/* Header with Offset Well Selector & 4 Action Buttons */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedOffsetWell.wellId}
              onChange={(e) => setSelectedOffsetWellId(e.target.value)}
              className="bg-[#162920] text-[#A3E6B8] font-mono text-sm font-bold rounded-xl px-3 py-1.5 border border-[#3B5949] focus:outline-none focus:border-[#A3E6B8]"
            >
              {offsetWells.map((w) => (
                <option key={w.wellId} value={w.wellId}>
                  {w.wellId} ({w.wellName}) — {w.distanceKm} km away
                </option>
              ))}
            </select>
            <span className="text-xs font-mono text-[#9BB0A3]">
              Status: <strong className="text-[#F2F6F0]">{selectedOffsetWell.status}</strong> ·
              Coord: {selectedOffsetWell.lat.toFixed(4)}°N, {selectedOffsetWell.lng.toFixed(4)}°E
              (Synthetic)
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#F2F6F0]">
            Offset Well Intelligence Profile — {selectedOffsetWell.wellId} ({selectedOffsetWell.wellName})
          </h1>
          <p className="text-xs text-[#9BB0A3]">{selectedOffsetWell.summary}</p>
        </div>

        {/* 4 Required Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveRoute('parameter-comparison')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#162920] hover:bg-[#A3E6B8]/20 text-xs font-semibold text-[#F2F6F0] border border-[#3B5949] transition-colors whitespace-nowrap"
          >
            <Sliders className="w-3.5 h-3.5 text-[#A3E6B8]" />
            <span>Compare with Active Well</span>
          </button>

          <button
            onClick={() => setActiveRoute('depth-correlation')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#162920] hover:bg-[#A3E6B8]/20 text-xs font-semibold text-[#F2F6F0] border border-[#3B5949] transition-colors whitespace-nowrap"
          >
            <Layers className="w-3.5 h-3.5 text-[#4ADE80]" />
            <span>Open Depth Correlation</span>
          </button>

          <button
            onClick={() =>
              askAIAbout(
                `Summarize the drilling history, events, and key lessons learned from offset well ${selectedOffsetWell.wellId} (${selectedOffsetWell.wellName}) and how they apply to active well NWIS-042.`
              )
            }
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-xs font-semibold text-[#0E1914] transition-colors whitespace-nowrap"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Ask AI About This Well</span>
          </button>

          <button
            onClick={handleExportSummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#12221B] hover:bg-[#162920] text-xs font-medium text-[#9BB0A3] hover:text-[#F2F6F0] border border-[#2B4337] transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Well Summary</span>
          </button>
        </div>
      </div>

      {/* 10-Tab Navigation Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#2B4337]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === t.id
                ? 'bg-[#A3E6B8] text-[#0E1914] shadow-2xs'
                : 'text-[#9BB0A3] hover:text-[#F2F6F0] hover:bg-[#12221B]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs">
              <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">Distance / Azimuth</div>
              <div className="font-mono text-xl font-bold text-[#A3E6B8] mt-1">
                {selectedOffsetWell.distanceKm} km
              </div>
              <div className="text-[11px] text-[#9BB0A3] mt-0.5">
                Bearing: {selectedOffsetWell.azimuthDeg}°
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs">
              <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">Total Depth (MD)</div>
              <div className="font-mono text-xl font-bold text-[#F2F6F0] mt-1">
                {selectedOffsetWell.totalDepthMD.toLocaleString()} m
              </div>
              <div className="text-[11px] text-[#9BB0A3] mt-0.5">
                TVD: {selectedOffsetWell.totalDepthTVD.toLocaleString()} m
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs">
              <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">Total NPT Hours</div>
              <div className="font-mono text-xl font-bold text-[#FBBF24] mt-1">
                {selectedOffsetWell.nptHours} hrs
              </div>
              <div className="text-[11px] text-[#9BB0A3] mt-0.5">
                Across {wellEvents.length} documented events
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs">
              <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">Highest Severity</div>
              <div
                className={`font-mono text-xl font-bold mt-1 ${
                  selectedOffsetWell.highestSeverity === 'Critical'
                    ? 'text-[#F87171]'
                    : selectedOffsetWell.highestSeverity === 'High'
                    ? 'text-[#FBBF24]'
                    : 'text-[#4ADE80]'
                }`}
              >
                {selectedOffsetWell.highestSeverity}
              </div>
              <div className="text-[11px] text-[#9BB0A3] mt-0.5">Historical hazard class</div>
            </div>

            <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs">
              <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">Spud / Completion</div>
              <div className="font-mono text-xs font-bold text-[#F2F6F0] mt-1.5">
                {selectedOffsetWell.spudDate}
              </div>
              <div className="text-[11px] text-[#9BB0A3] mt-0.5">
                to {selectedOffsetWell.completionDate}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs">
              <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">Source Reports</div>
              <div className="font-mono text-xl font-bold text-[#4ADE80] mt-1">
                {wellDocs.length} Docs
              </div>
              <div className="text-[11px] text-[#9BB0A3] mt-0.5">
                {wellLessons.length} Lessons extracted
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-4">
              <h3 className="text-sm font-semibold text-[#F2F6F0]">
                Offset Well Risk & Engineering Relevance Summary
              </h3>
              <p className="text-xs text-[#F2F6F0] leading-relaxed bg-[#A3E6B8]/12 p-4 rounded-xl border border-[#3B5949]">
                {selectedOffsetWell.riskSummary}
              </p>

              <h4 className="text-xs font-semibold text-[#9BB0A3] uppercase font-mono">
                Formation Tops Recorded in {selectedOffsetWell.wellId}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {selectedOffsetWell.formations.map((f) => (
                  <div
                    key={f.code}
                    className="p-3 rounded-xl bg-[#162920] border border-[#2B4337]"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-xs"
                        style={{ backgroundColor: f.color }}
                      />
                      <span className="font-mono text-xs font-bold text-[#F2F6F0]">{f.code}</span>
                    </div>
                    <div className="text-[11px] text-[#9BB0A3] mt-1 line-clamp-1">{f.name}</div>
                    <div className="font-mono text-xs text-[#A3E6B8] font-semibold mt-1">
                      {f.topMD} – {f.bottomMD} m
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Spatial Offset Card */}
            <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#F2F6F0]">
                  Spatial Relation to Active Well
                </h3>
                <p className="text-xs text-[#9BB0A3] mt-0.5">
                  Relative vector from OIL-DEMO-042 to {selectedOffsetWell.wellId}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#162920] border border-[#2B4337] flex items-center justify-around">
                <div className="text-center">
                  <div className="w-4 h-4 rounded-full bg-[#A3E6B8] mx-auto shadow-[0_0_8px_rgba(163, 230, 184,0.5)]" />
                  <div className="font-mono text-xs font-bold text-[#A3E6B8] mt-1.5">
                    OIL-DEMO-042
                  </div>
                  <div className="text-[10px] text-[#9BB0A3]">Active Reference</div>
                </div>

                <div className="flex-1 px-4 text-center">
                  <div className="font-mono text-xs text-[#F2F6F0] font-semibold">
                    {selectedOffsetWell.distanceKm} km · {selectedOffsetWell.azimuthDeg}°
                  </div>
                  <div className="w-full border-t border-dashed border-[#A3E6B8] my-1.5" />
                  <div className="text-[10px] text-[#9BB0A3]">Upper Assam Basin, India</div>
                </div>

                <div className="text-center">
                  <div className="w-4 h-4 rounded-full bg-[#162920] mx-auto" />
                  <div className="font-mono text-xs font-bold text-[#F2F6F0] mt-1.5">
                    {selectedOffsetWell.wellId}
                  </div>
                  <div className="text-[10px] text-[#9BB0A3]">TD {selectedOffsetWell.totalDepthMD}m</div>
                </div>
              </div>

              <button
                onClick={() => setActiveRoute('nearby-map')}
                className="w-full py-2 rounded-xl bg-[#A3E6B8]/12 hover:bg-[#D4DE95] text-xs font-semibold text-[#F2F6F0] border border-[#3B5949] transition-colors"
              >
                Inspect on Interactive GIS Map →
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'drilling-history' && (
        <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-4">
          <h3 className="text-base font-semibold text-[#F2F6F0]">
            Depth vs. Days Curve & Drilling Activity Timeline ({selectedOffsetWell.wellId})
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedOffsetWell.depthCurve}>
                <CartesianGrid stroke="#2B4337" strokeDasharray="3 3" />
                <XAxis
                  dataKey="days"
                  stroke="#9BB0A3"
                  fontSize={11}
                  label={{ value: 'Drilling Days', position: 'insideBottom', offset: -4, fill: '#9BB0A3', fontSize: 11 }}
                />
                <YAxis
                  reversed
                  stroke="#9BB0A3"
                  fontSize={11}
                  label={{ value: 'Depth (m MD)', angle: -90, position: 'insideLeft', fill: '#9BB0A3', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12221B',
                    borderColor: '#3B5949',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#F2F6F0',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="depthMD"
                  name="Measured Depth (m)"
                  stroke="#A3E6B8"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#A3E6B8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'geology' && (
        <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-4">
          <h3 className="text-base font-semibold text-[#F2F6F0]">
            Geological Stratigraphy & Pore Pressure Profile — {selectedOffsetWell.wellId}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2B4337] text-[#9BB0A3] font-mono">
                  <th className="py-2.5 px-3">Formation</th>
                  <th className="py-2.5 px-3">Top – Bottom MD</th>
                  <th className="py-2.5 px-3">Top – Bottom TVD</th>
                  <th className="py-2.5 px-3">Lithology Description</th>
                  <th className="py-2.5 px-3 text-right">Pore Pressure</th>
                  <th className="py-2.5 px-3 text-right">Frac Gradient</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B4337]">
                {selectedOffsetWell.formations.map((f) => (
                  <tr key={f.code} className="hover:bg-[#162920]">
                    <td className="py-3 px-3 font-semibold text-[#F2F6F0] flex items-center gap-2">
                      <span className="w-3 h-3 rounded-xs" style={{ backgroundColor: f.color }} />
                      {f.name}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#A3E6B8] font-semibold">
                      {f.topMD} – {f.bottomMD} m
                    </td>
                    <td className="py-3 px-3 font-mono text-[#9BB0A3]">
                      {f.topTVD} – {f.bottomTVD} m
                    </td>
                    <td className="py-3 px-3 text-[#9BB0A3]">{f.lithology}</td>
                    <td className="py-3 px-3 font-mono text-right text-[#FBBF24] font-semibold">
                      {f.porePressureSG.toFixed(2)} SG
                    </td>
                    <td className="py-3 px-3 font-mono text-right text-[#4ADE80] font-semibold">
                      {f.fractureGradientSG.toFixed(2)} SG
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'parameters' && (
        <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-4">
          <h3 className="text-base font-semibold text-[#F2F6F0]">
            Historical Drilling Parameters by Depth — {selectedOffsetWell.wellId}
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedOffsetWell.depthCurve}>
                <CartesianGrid stroke="#2B4337" strokeDasharray="3 3" />
                <XAxis dataKey="depthMD" stroke="#9BB0A3" fontSize={11} />
                <YAxis stroke="#9BB0A3" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12221B',
                    borderColor: '#3B5949',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#F2F6F0',
                  }}
                />
                <Line type="monotone" dataKey="rop" name="ROP (m/hr)" stroke="#A3E6B8" strokeWidth={2.2} />
                <Line type="monotone" dataKey="torque" name="Torque (kN·m)" stroke="#D4DE95" strokeWidth={2} />
                <Line type="monotone" dataKey="wob" name="WOB (klbf)" stroke="#3B5949" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'mud-casing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3">
            <h3 className="text-sm font-semibold text-[#F2F6F0]">Drilling Fluid (Mud) Program</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#2B4337] text-[#9BB0A3] font-mono">
                    <th className="py-2 px-2.5">Interval</th>
                    <th className="py-2 px-2.5">Hole</th>
                    <th className="py-2 px-2.5">Mud System</th>
                    <th className="py-2 px-2.5">Density (SG)</th>
                    <th className="py-2 px-2.5">Fluid Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B4337]">
                  {selectedOffsetWell.mudProgram.map((m, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-2.5 font-mono text-[#A3E6B8] font-semibold">{m.intervalMD}</td>
                      <td className="py-2.5 px-2.5 font-mono">{m.holeSizeInch}</td>
                      <td className="py-2.5 px-2.5 text-[#F2F6F0]">{m.mudType}</td>
                      <td className="py-2.5 px-2.5 font-mono text-[#F2F6F0] font-semibold">{m.densitySG}</td>
                      <td className="py-2.5 px-2.5 font-mono text-[#9BB0A3]">{m.fluidLossMl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3">
            <h3 className="text-sm font-semibold text-[#F2F6F0]">Casing & Liner Architecture</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#2B4337] text-[#9BB0A3] font-mono">
                    <th className="py-2 px-2.5">String</th>
                    <th className="py-2 px-2.5">OD</th>
                    <th className="py-2 px-2.5">Shoe Depth</th>
                    <th className="py-2 px-2.5">Grade / Weight</th>
                    <th className="py-2 px-2.5">Integrity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B4337]">
                  {selectedOffsetWell.casingProgram.map((c, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-2.5 font-medium text-[#F2F6F0]">{c.casingType}</td>
                      <td className="py-2.5 px-2.5 font-mono text-[#A3E6B8] font-semibold">{c.casingODInch}</td>
                      <td className="py-2.5 px-2.5 font-mono">{c.settingDepthMD} m</td>
                      <td className="py-2.5 px-2.5 font-mono text-[#9BB0A3]">{c.gradeWeight}</td>
                      <td className="py-2.5 px-2.5 text-[#4ADE80] font-medium">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cementing' && (
        <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3">
          <h3 className="text-base font-semibold text-[#F2F6F0]">
            Cementing Execution & Zonal Isolation History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2B4337] text-[#9BB0A3] font-mono">
                  <th className="py-2.5 px-3">Stage / String</th>
                  <th className="py-2.5 px-3">Cemented Interval</th>
                  <th className="py-2.5 px-3">Slurry Density</th>
                  <th className="py-2.5 px-3">Top of Cement</th>
                  <th className="py-2.5 px-3">CBL Bond Quality</th>
                  <th className="py-2.5 px-3">Engineering Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B4337]">
                {selectedOffsetWell.cementingHistory.map((cem, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 font-semibold text-[#F2F6F0]">{cem.stage}</td>
                    <td className="py-3 px-3 font-mono text-[#A3E6B8] font-semibold">{cem.intervalMD}</td>
                    <td className="py-3 px-3 font-mono">{cem.slurryDensitySG} SG</td>
                    <td className="py-3 px-3 font-mono">{cem.topOfCementMD} m MD</td>
                    <td
                      className={`py-3 px-3 font-semibold ${
                        cem.bondQuality === 'Good' ? 'text-[#4ADE80]' : 'text-[#FBBF24]'
                      }`}
                    >
                      {cem.bondQuality}
                    </td>
                    <td className="py-3 px-3 text-[#9BB0A3]">{cem.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#F2F6F0]">
              Operational Events Recorded on {selectedOffsetWell.wellId} ({wellEvents.length})
            </h3>
            <span className="text-xs text-[#9BB0A3]">
              Click any row to open the Event Evidence & Source Drawer
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2B4337] text-[#9BB0A3] font-mono">
                  <th className="py-2.5 px-3">Depth</th>
                  <th className="py-2.5 px-3">Formation</th>
                  <th className="py-2.5 px-3">Event</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Cause</th>
                  <th className="py-2.5 px-3">Mitigation</th>
                  <th className="py-2.5 px-3">Outcome</th>
                  <th className="py-2.5 px-3">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B4337]">
                {wellEvents.map((evt) => (
                  <tr
                    key={evt.eventId}
                    onClick={() => setInspectedEvent(evt)}
                    className="hover:bg-[#A3E6B8]/20 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-[#A3E6B8] whitespace-nowrap">
                      {evt.depthMD} m
                    </td>
                    <td className="py-3 px-3 text-[#F2F6F0]">{evt.formation}</td>
                    <td className="py-3 px-3 font-semibold text-[#F2F6F0] whitespace-nowrap">
                      {evt.eventType}
                    </td>
                    <td
                      className={`py-3 px-3 font-mono font-semibold ${
                        evt.severity === 'Critical'
                          ? 'text-[#F87171]'
                          : evt.severity === 'High'
                          ? 'text-[#FBBF24]'
                          : 'text-[#4ADE80]'
                      }`}
                    >
                      {evt.severity}
                    </td>
                    <td className="py-3 px-3 text-[#9BB0A3] max-w-xs truncate">{evt.rootCause}</td>
                    <td className="py-3 px-3 text-[#4ADE80] font-medium max-w-xs truncate">{evt.mitigation}</td>
                    <td className="py-3 px-3 text-[#9BB0A3] max-w-xs truncate">{evt.outcome}</td>
                    <td className="py-3 px-3 font-mono text-[#A3E6B8] font-semibold whitespace-nowrap">
                      {evt.sourceDocId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'npt' && (
        <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-4">
          <h3 className="text-base font-semibold text-[#F2F6F0]">
            Non-Productive Time (NPT) Breakdown — Total {selectedOffsetWell.nptHours} Hours
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={selectedOffsetWell.nptBreakdown}>
                <CartesianGrid stroke="#2B4337" strokeDasharray="3 3" />
                <XAxis dataKey="category" stroke="#9BB0A3" fontSize={12} />
                <YAxis stroke="#9BB0A3" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12221B',
                    borderColor: '#3B5949',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#F2F6F0',
                  }}
                />
                <Bar dataKey="hours" name="NPT Hours" fill="#A3E6B8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'lessons' && (
        <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3">
          <h3 className="text-base font-semibold text-[#F2F6F0]">
            Lessons Learned Originating from {selectedOffsetWell.wellId}
          </h3>
          {wellLessons.length === 0 ? (
            <p className="text-xs text-[#9BB0A3]">
              No standalone lessons recorded for this well; select NWIS-OFF-001, OFF-002, OFF-003, or
              OFF-004 to inspect verified lessons.
            </p>
          ) : (
            <div className="space-y-3">
              {wellLessons.map((l) => (
                <div
                  key={l.lessonId}
                  className="p-4 rounded-xl bg-[#162920] border border-[#2B4337] space-y-2"
                >
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-[#A3E6B8] font-bold">
                      {l.lessonId} · {l.eventType} at {l.depthMD} m MD
                    </span>
                    <span className="text-[#4ADE80] font-semibold">{l.outcomeCategory}</span>
                  </div>
                  <div className="text-xs text-[#F2F6F0] font-medium">{l.challenge}</div>
                  <div className="text-xs text-[#4ADE80] font-medium">
                    Response: {l.historicalResponse}
                  </div>
                  <div className="text-[11px] text-[#9BB0A3]">
                    Outcome: {l.recordedOutcome} (Source: {l.supportingDocId})
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3">
          <h3 className="text-base font-semibold text-[#F2F6F0]">
            Supporting Historical Reports for {selectedOffsetWell.wellId}
          </h3>
          {wellDocs.length === 0 ? (
            <p className="text-xs text-[#9BB0A3]">
              No direct reports attached to this offset well in the demo set.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {wellDocs.map((d) => (
                <div
                  key={d.docId}
                  onClick={() => setInspectedDocument(d)}
                  className="p-4 rounded-xl bg-[#162920] hover:bg-[#A3E6B8]/20 border border-[#2B4337] hover:border-[#3B5949] cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between font-mono text-xs text-[#A3E6B8] font-semibold">
                    <span>{d.docId}</span>
                    <span>{d.date}</span>
                  </div>
                  <div className="text-sm font-semibold text-[#F2F6F0] mt-1">{d.title}</div>
                  <div className="text-xs text-[#9BB0A3] mt-1">
                    {d.category} · {d.pages} pages · {d.verificationStatus}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
