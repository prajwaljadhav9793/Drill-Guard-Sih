import React, { useState } from 'react';
import {
  Download,
  Printer,
  FileCode,
} from 'lucide-react';
import { useNWIS } from '../../context/NWISContext';
import { DrillGuardLogo } from '../common/DrillGuardLogo';

const REPORT_TYPES = [
  'Active Well Intelligence Summary',
  'Nearby Wells Comparison',
  'Formation Risk Assessment',
  'Historical Event Report',
  'Drilling Parameter Comparison',
  'Lessons Learned Report',
  'Document Processing Summary',
  'Alert History',
];

export const ReportsExportsView: React.FC = () => {
  const {
    activeWell,
    offsetWells,
    events,
    alerts,
    lessons,
    riskAssessments,
    addToast,
  } = useNWIS();

  const [selectedReport, setSelectedReport] = useState<string>(REPORT_TYPES[0]);
  const [wellScope, setWellScope] = useState<string>('ALL_WELLS');
  const [formationScope, setFormationScope] = useState<string>('Tipam Sandstone Formation');
  const [depthWindow, setDepthWindow] = useState<string>('2,500 – 3,200 m MD');
  const [includeCharts, setIncludeCharts] = useState<boolean>(true);
  const [includeSources, setIncludeSources] = useState<boolean>(true);

  const handleExportCSV = () => {
    const headers = [
      'Event_ID',
      'Well_ID',
      'Depth_MD_m',
      'Formation',
      'Event_Type',
      'Severity',
      'NPT_Hours',
      'Source_Document',
      'Verification_Status',
    ];
    const rows = events.map((e) =>
      [
        e.eventId,
        e.wellId,
        e.depthMD,
        `"${e.formation}"`,
        `"${e.eventType}"`,
        e.severity,
        e.nptHours,
        e.sourceDocId,
        e.verificationStatus,
      ].join(',')
    );
    const csv = [
      `# REPORT: ${selectedReport} | GENERATED: ${new Date().toISOString()} | DISCLAIMER: SYNTHETIC DEMO DATA`,
      headers.join(','),
      ...rows,
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Drill_Guard_${selectedReport.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('CSV Report Exported', `Downloaded ${selectedReport} as CSV.`, 'success');
  };

  const handleExportJSON = () => {
    const payload = {
      reportTitle: selectedReport,
      generatedAt: new Date().toISOString(),
      disclaimer:
        'SYNTHETIC DEMO RECORD — OIL INDIA LIMITED SIH PS-26121 PROTOTYPE (NOT ACTUAL OPERATIONAL DATA)',
      configuration: {
        wellScope,
        formationScope,
        depthWindow,
        includeCharts,
        includeSources,
      },
      activeWellSummary: activeWell,
      riskAssessments,
      offsetWellsCount: offsetWells.length,
      eventsIncluded: events,
      lessonsIncluded: lessons,
      alertsHistory: alerts,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Drill_Guard_${selectedReport.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('JSON Report Exported', `Downloaded ${selectedReport} as JSON package.`, 'success');
  };

  const handlePrintReport = () => {
    window.print();
    addToast('Print / PDF Dialog Opened', 'Prepared print-ready engineering report.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <div className="text-xs font-mono text-[#A3E6B8] font-semibold">
            ENGINEERING REPORT GENERATOR & DATA EXPORT STUDIO
          </div>
          <h1 className="text-xl font-bold text-[#F2F6F0] mt-0.5">
            Reports & Exports Workspace
          </h1>
          <p className="text-xs text-[#9BB0A3]">
            Generate structured drilling intelligence packages with source citations in CSV, JSON,
            or Print-Ready PDF format.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#162920] hover:bg-[#A3E6B8]/20 text-xs font-semibold text-[#A3E6B8] border border-[#3B5949] transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#162920] hover:bg-[#A3E6B8]/20 text-xs font-semibold text-[#4ADE80] border border-[#4ADE80]/40 transition-colors"
          >
            <FileCode className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-xs font-semibold text-[#0E1914] transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Builder Split: Left Configuration + Right Live Report Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Configuration Column (4 cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-sm space-y-4 text-xs no-print">
          <h2 className="text-sm font-semibold text-[#F2F6F0]">Report Template & Scope</h2>

          <div>
            <label className="block text-[#9BB0A3] font-medium mb-1">Select Report Type</label>
            <div className="space-y-1.5">
              {REPORT_TYPES.map((rt) => (
                <button
                  key={rt}
                  onClick={() => setSelectedReport(rt)}
                  className={`w-full px-3 py-2 rounded-xl text-left transition-colors border ${
                    selectedReport === rt
                      ? 'bg-[#A3E6B8]/12 text-[#F2F6F0] border-[#A3E6B8] font-semibold'
                      : 'bg-[#162920] text-[#9BB0A3] hover:text-[#F2F6F0] border-[#2B4337]'
                  }`}
                >
                  {rt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[#9BB0A3] font-medium mb-1">Well Scope</label>
            <select
              value={wellScope}
              onChange={(e) => setWellScope(e.target.value)}
              className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#2B4337]"
            >
              <option value="ALL_WELLS">Active Well + All 14 Offset Wells</option>
              <option value={activeWell.wellId}>Active Well Only ({activeWell.wellId})</option>
              {offsetWells.slice(0, 6).map((w) => (
                <option key={w.wellId} value={w.wellId}>
                  Offset Well {w.wellId} ({w.wellName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#9BB0A3] font-medium mb-1">Target Formation</label>
            <select
              value={formationScope}
              onChange={(e) => setFormationScope(e.target.value)}
              className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#2B4337]"
            >
              <option value="All Formations">All Upper Assam Formations (0 – 4,100 m MD)</option>
              <option value="Tipam Sandstone Formation">Tipam Sandstone Formation (1,980 – 3,040 m)</option>
              <option value="Girujan Clay — Transition Shale">
                Girujan Clay — Transition Shale (3,040 – 3,480 m)
              </option>
              <option value="Barail Sandstone Reservoir">
                Barail Sandstone Reservoir (3,480 – 4,100 m)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-[#9BB0A3] font-medium mb-1">Depth Window</label>
            <input
              type="text"
              value={depthWindow}
              onChange={(e) => setDepthWindow(e.target.value)}
              className="w-full bg-[#162920] text-[#F2F6F0] font-mono rounded-lg px-3 py-2 border border-[#2B4337]"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-[#2B4337]">
            <label className="flex items-center gap-2 cursor-pointer text-[#F2F6F0] font-medium">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="rounded accent-[#A3E6B8]"
              />
              <span>Include Risk & Telemetry Summary Tables</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[#F2F6F0] font-medium">
              <input
                type="checkbox"
                checked={includeSources}
                onChange={(e) => setIncludeSources(e.target.checked)}
                className="rounded accent-[#A3E6B8]"
              />
              <span>Include Primary Source Report Citations</span>
            </label>
          </div>
        </div>

        {/* Right Live Print-Ready Report Preview (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-sm space-y-5">
          <div className="pb-4 border-b border-[#2B4337] flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <DrillGuardLogo variant="icon" size="md" />
              <div>
                <div className="text-xs font-mono text-[#A3E6B8] font-bold">
                  DRILL GUARD · NEARBY WELLS INTELLIGENCE DOSSIER
                </div>
                <h2 className="text-lg font-bold text-[#F2F6F0] mt-1">{selectedReport}</h2>
                <div className="text-xs text-[#9BB0A3] mt-0.5">
                  Generated: {new Date().toUTCString()} · Scope: {wellScope} · Interval: {depthWindow}
                </div>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#FBBF24]/15 border border-[#FBBF24]/40 text-[11px] font-mono font-semibold text-[#FBBF24]">
              SYNTHETIC DEMO DATA DISCLAIMER
            </div>
          </div>

          {/* Section 1: Active Well Snapshot */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#A3E6B8] font-bold">
              1. Active Well Operational Snapshot ({activeWell.wellId})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#162920] border border-[#2B4337] text-xs font-mono">
              <div>
                <span className="text-[#9BB0A3] block text-[10px]">Current Depth</span>
                <span className="text-[#F2F6F0] font-bold">
                  {activeWell.currentDepthMD.toFixed(1)} m MD
                </span>
              </div>
              <div>
                <span className="text-[#9BB0A3] block text-[10px]">Formation</span>
                <span className="text-[#A3E6B8] font-bold">{activeWell.currentFormation}</span>
              </div>
              <div>
                <span className="text-[#9BB0A3] block text-[10px]">ROP / Torque</span>
                <span className="text-[#F2F6F0] font-semibold">
                  {activeWell.rop} m/hr · {activeWell.torque} kN·m
                </span>
              </div>
              <div>
                <span className="text-[#9BB0A3] block text-[10px]">MW / ECD</span>
                <span className="text-[#4ADE80] font-bold">
                  {activeWell.mudWeight} / {activeWell.ecd} SG
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Risk Indicators */}
          {includeCharts && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#A3E6B8] font-bold">
                2. Explainable Risk Assessment Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {riskAssessments.slice(0, 4).map((r) => (
                  <div
                    key={r.category}
                    className="p-3 rounded-xl bg-[#162920] border border-[#2B4337]"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-[#F2F6F0]">{r.category}</span>
                      <span className="text-[#FBBF24] font-bold">
                        {r.status} ({r.score}/100)
                      </span>
                    </div>
                    <div className="text-[11px] text-[#9BB0A3] mt-1">
                      {r.recommendedReviewActions[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Key Offset Events & Source References */}
          {includeSources && (
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#A3E6B8] font-bold">
                3. Verified Historical Events & Source Document Citations
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#2B4337] text-[#9BB0A3] font-mono text-[11px] bg-[#162920]">
                      <th className="py-2 px-2">Event ID</th>
                      <th className="py-2 px-2">Well</th>
                      <th className="py-2 px-2">Depth</th>
                      <th className="py-2 px-2">Type</th>
                      <th className="py-2 px-2">Mitigation Summary</th>
                      <th className="py-2 px-2">Source Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B4337]">
                    {events.slice(0, 6).map((e) => (
                      <tr key={e.eventId} className="hover:bg-[#162920]">
                        <td className="py-2 px-2 font-mono text-[#A3E6B8] font-bold">
                          {e.eventId}
                        </td>
                        <td className="py-2 px-2 font-mono text-[#F2F6F0] font-semibold">
                          {e.wellId}
                        </td>
                        <td className="py-2 px-2 font-mono text-[#F2F6F0]">{e.depthMD} m</td>
                        <td className="py-2 px-2 text-[#FBBF24] font-medium">{e.eventType}</td>
                        <td className="py-2 px-2 text-[#9BB0A3] max-w-xs truncate">
                          {e.mitigation}
                        </td>
                        <td className="py-2 px-2 font-mono text-[#4ADE80] font-semibold">
                          {e.sourceDocId}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
