import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  FileText,
  Bot,
  Download,
  ArrowRight,
} from 'lucide-react';
import { useNWIS } from '../../context/NWISContext';
import { NavigationRoute } from '../../types/nwis';

export const GlobalOverlays: React.FC = () => {
  const {
    setActiveRoute,
    offsetWells,
    events,
    documents,
    alerts,
    acknowledgeAlert,
    resolveAlert,
    inspectedEvent,
    setInspectedEvent,
    inspectedDocument,
    setInspectedDocument,
    inspectedAlert,
    setInspectedAlert,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    navigateToWellProfile,
    navigateToDocById,
    askAIAbout,
    toasts,
    dismissToast,
  } = useNWIS();

  const [cmdQuery, setCmdQuery] = useState('');

  const quickNavRoutes: { id: NavigationRoute; label: string; category: string }[] = [
    { id: 'command-center', label: 'Open Command Center', category: 'Navigation' },
    { id: 'active-well', label: 'Open Active Well Live Telemetry', category: 'Navigation' },
    { id: 'nearby-map', label: 'Open Nearby Wells GIS Map', category: 'Navigation' },
    { id: 'depth-correlation', label: 'Open Depth & Formation Correlation', category: 'Navigation' },
    { id: 'ai-assistant', label: 'Ask Drill Guard AI Knowledge Assistant', category: 'Navigation' },
    { id: 'risk-prediction', label: 'Open Explainable Risk Prediction', category: 'Navigation' },
    { id: 'ai-doc-processing', label: 'Open AI Document Processing & OCR', category: 'Navigation' },
    { id: 'reports-exports', label: 'Generate & Export Engineering Report', category: 'Navigation' },
  ];

  const filteredCmdResults = useMemo(() => {
    const q = cmdQuery.trim().toLowerCase();
    if (!q) {
      return {
        routes: quickNavRoutes.slice(0, 5),
        wells: offsetWells.slice(0, 4),
        events: events.slice(0, 4),
        docs: documents.slice(0, 4),
      };
    }
    return {
      routes: quickNavRoutes.filter((r) => r.label.toLowerCase().includes(q)),
      wells: offsetWells.filter(
        (w) =>
          w.wellId.toLowerCase().includes(q) ||
          w.wellName.toLowerCase().includes(q) ||
          w.summary.toLowerCase().includes(q)
      ),
      events: events.filter(
        (e) =>
          e.eventId.toLowerCase().includes(q) ||
          e.eventType.toLowerCase().includes(q) ||
          e.formation.toLowerCase().includes(q) ||
          e.wellId.toLowerCase().includes(q) ||
          e.symptoms.toLowerCase().includes(q)
      ),
      docs: documents.filter(
        (d) =>
          d.docId.toLowerCase().includes(q) ||
          d.title.toLowerCase().includes(q) ||
          d.wellId.toLowerCase().includes(q) ||
          d.formation.toLowerCase().includes(q)
      ),
    };
  }, [cmdQuery, offsetWells, events, documents]);

  const handleDownloadDocumentText = (docId: string, title: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docId}_${title.replace(/[^a-z0-9]/gi, '_').slice(0, 30)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* 1. Command Palette Modal (Ctrl+K) */}
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-[#12221B] border border-[#3B5949] shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#2B4337] bg-[#162920]">
              <Search className="w-4 h-4 text-[#A3E6B8]" />
              <input
                type="text"
                autoFocus
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                placeholder="Search offset wells (NWIS-OFF-001), events (Mud Loss, 2875m), reports (DDR-DEMO-014), or modules..."
                className="flex-1 bg-transparent text-sm text-[#F2F6F0] placeholder-[#6E887B] focus:outline-none"
              />
              <button
                onClick={() => setIsCommandPaletteOpen(false)}
                className="p-1 rounded-lg text-[#9BB0A3] hover:text-[#F2F6F0] hover:bg-[#1E352B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto p-4 space-y-5">
              {/* Quick Navigation */}
              {filteredCmdResults.routes.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#9BB0A3] mb-2">
                    Modules & Workspaces
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {filteredCmdResults.routes.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setActiveRoute(r.id);
                          setIsCommandPaletteOpen(false);
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#162920] hover:bg-[#A3E6B8]/20 text-xs font-medium text-[#F2F6F0] border border-[#2B4337] transition-colors text-left"
                      >
                        <span>{r.label}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#A3E6B8]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Offset Wells */}
              {filteredCmdResults.wells.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#9BB0A3] mb-2">
                    Synthetic Offset Wells
                  </div>
                  <div className="space-y-1.5">
                    {filteredCmdResults.wells.map((w) => (
                      <button
                        key={w.wellId}
                        onClick={() => {
                          navigateToWellProfile(w.wellId);
                          setIsCommandPaletteOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#162920] hover:bg-[#A3E6B8]/20 text-left border border-[#2B4337] transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-[#A3E6B8] font-mono">
                            {w.wellId} ({w.wellName})
                          </div>
                          <div className="text-[11px] text-[#9BB0A3] line-clamp-1">{w.summary}</div>
                        </div>
                        <div className="text-right font-mono text-[11px] text-[#F2F6F0] font-semibold shrink-0 ml-3">
                          {w.distanceKm} km · TD {w.totalDepthMD} m
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Historical Events */}
              {filteredCmdResults.events.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#9BB0A3] mb-2">
                    Historical Drilling Events
                  </div>
                  <div className="space-y-1.5">
                    {filteredCmdResults.events.map((evt) => (
                      <button
                        key={evt.eventId}
                        onClick={() => {
                          setInspectedEvent(evt);
                          setIsCommandPaletteOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#162920] hover:bg-[#A3E6B8]/20 text-left border border-[#2B4337] transition-colors"
                      >
                        <div>
                          <div className="text-xs font-medium text-[#F2F6F0]">
                            <span className="font-mono font-bold text-[#FBBF24]">{evt.eventId}</span> ·{' '}
                            {evt.eventType} in {evt.formation}
                          </div>
                          <div className="text-[11px] text-[#9BB0A3] line-clamp-1">
                            {evt.symptoms}
                          </div>
                        </div>
                        <div className="text-right font-mono text-[11px] text-[#9BB0A3] shrink-0 ml-3">
                          {evt.wellId} · {evt.depthMD} m
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {filteredCmdResults.docs.length > 0 && (
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#9BB0A3] mb-2">
                    Historical Reports & Documents
                  </div>
                  <div className="space-y-1.5">
                    {filteredCmdResults.docs.map((doc) => (
                      <button
                        key={doc.docId}
                        onClick={() => {
                          setInspectedDocument(doc);
                          setIsCommandPaletteOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#162920] hover:bg-[#A3E6B8]/20 text-left border border-[#2B4337] transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-[#F2F6F0] truncate">
                            <span className="font-mono font-bold text-[#A3E6B8]">{doc.docId}</span> —{' '}
                            {doc.title}
                          </div>
                          <div className="text-[11px] text-[#9BB0A3]">
                            {doc.category} · Well {doc.wellId}
                          </div>
                        </div>
                        <FileText className="w-4 h-4 text-[#A3E6B8] shrink-0 ml-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Notification Drawer */}
      {isNotificationDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#12221B] border-l border-[#2B4337] h-full flex flex-col shadow-2xl">
            <div className="px-5 py-4 border-b border-[#2B4337] bg-[#162920] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#F2F6F0]">
                  Operational Alerts & Notifications
                </h3>
                <p className="text-xs text-[#9BB0A3]">
                  Real-time advisory warnings for {alerts[0]?.wellId || 'OIL-DEMO-042'}
                </p>
              </div>
              <button
                onClick={() => setIsNotificationDrawerOpen(false)}
                className="p-1.5 rounded-lg text-[#9BB0A3] hover:text-[#F2F6F0] hover:bg-[#1E352B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.alertId}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    alert.severity === 'Critical'
                      ? 'bg-[#12221B] border-[#F87171]/45'
                      : alert.severity === 'High'
                      ? 'bg-[#12221B] border-[#FBBF24]/45'
                      : 'bg-[#162920] border-[#2B4337]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#9BB0A3] mb-1">
                    <span
                      className={
                        alert.severity === 'Critical'
                          ? 'text-[#F87171] font-bold'
                          : alert.severity === 'High'
                          ? 'text-[#FBBF24] font-bold'
                          : 'text-[#A3E6B8] font-semibold'
                      }
                    >
                      {alert.severity.toUpperCase()} · {alert.category}
                    </span>
                    <span>
                      {alert.timestamp} · {alert.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-[#F2F6F0] mb-1">{alert.title}</div>
                  <p className="text-xs text-[#9BB0A3] leading-relaxed mb-3">{alert.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        setInspectedAlert(alert);
                        setIsNotificationDrawerOpen(false);
                      }}
                      className="text-xs text-[#A3E6B8] hover:underline font-semibold"
                    >
                      Inspect Evidence
                    </button>
                    <div className="flex items-center gap-2">
                      {alert.status === 'Active' && (
                        <button
                          onClick={() => acknowledgeAlert(alert.alertId)}
                          className="px-2.5 py-1 rounded-lg bg-[#A3E6B8]/12 hover:bg-[#D4DE95] text-[#F2F6F0] text-xs font-semibold transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                      {alert.status !== 'Resolved' && (
                        <button
                          onClick={() => resolveAlert(alert.alertId)}
                          className="px-2.5 py-1 rounded-lg bg-[#4ADE80] hover:bg-[#162920] text-white text-xs font-semibold transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#2B4337] bg-[#162920]">
              <button
                onClick={() => {
                  setActiveRoute('alerts-warnings');
                  setIsNotificationDrawerOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-semibold text-xs transition-colors"
              >
                Open Full Alert & Warning Center
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Event Detail Drawer */}
      {inspectedEvent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-[#12221B] border-l border-[#2B4337] h-full flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-[#2B4337] bg-[#162920] flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-[#A3E6B8]">
                  {inspectedEvent.eventId} · {inspectedEvent.wellId} ({inspectedEvent.wellName})
                </div>
                <h3 className="text-base font-bold text-[#F2F6F0] mt-0.5">
                  {inspectedEvent.eventType} at {inspectedEvent.depthMD.toLocaleString()} m MD
                </h3>
              </div>
              <button
                onClick={() => setInspectedEvent(null)}
                className="p-1.5 rounded-lg text-[#9BB0A3] hover:text-[#F2F6F0] hover:bg-[#1E352B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Key Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-[#162920] border border-[#2B4337]">
                <div>
                  <div className="text-[11px] text-[#9BB0A3]">Depth (MD / TVD)</div>
                  <div className="font-mono text-xs font-bold text-[#F2F6F0] mt-0.5">
                    {inspectedEvent.depthMD} m / {inspectedEvent.depthTVD} m
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#9BB0A3]">Severity</div>
                  <div
                    className={`font-mono text-xs font-bold mt-0.5 ${
                      inspectedEvent.severity === 'Critical'
                        ? 'text-[#F87171]'
                        : inspectedEvent.severity === 'High'
                        ? 'text-[#FBBF24]'
                        : 'text-[#A3E6B8]'
                    }`}
                  >
                    {inspectedEvent.severity}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#9BB0A3]">NPT Duration</div>
                  <div className="font-mono text-xs font-bold text-[#F2F6F0] mt-0.5">
                    {inspectedEvent.nptHours.toFixed(1)} hrs
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#9BB0A3]">Verification</div>
                  <div className="font-mono text-xs font-bold text-[#4ADE80] mt-0.5">
                    {inspectedEvent.verificationStatus}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-[#F2F6F0] mb-1">
                  Formation & Stratigraphic Interval
                </div>
                <div className="text-xs text-[#9BB0A3]">
                  {inspectedEvent.formation} · Reported on {inspectedEvent.date}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-[#F2F6F0] mb-1">Observed Symptoms</div>
                <p className="text-xs text-[#9BB0A3] leading-relaxed bg-[#162920] p-3.5 rounded-xl border border-[#2B4337]">
                  {inspectedEvent.symptoms}
                </p>
              </div>

              <div>
                <div className="text-xs font-bold text-[#F2F6F0] mb-1">Documented Root Cause</div>
                <p className="text-xs text-[#9BB0A3] leading-relaxed bg-[#162920] p-3.5 rounded-xl border border-[#2B4337]">
                  {inspectedEvent.rootCause}
                </p>
              </div>

              {/* Parameters at Event */}
              <div>
                <div className="text-xs font-bold text-[#F2F6F0] mb-2">
                  Drilling Parameters at Incident Onset
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: 'ROP', val: `${inspectedEvent.parametersAtEvent.rop} m/hr` },
                    { label: 'WOB', val: `${inspectedEvent.parametersAtEvent.wob} klbf` },
                    { label: 'RPM', val: `${inspectedEvent.parametersAtEvent.rpm}` },
                    { label: 'Torque', val: `${inspectedEvent.parametersAtEvent.torque} kN·m` },
                    { label: 'SPP', val: `${inspectedEvent.parametersAtEvent.spp} psi` },
                    { label: 'Mud Weight', val: `${inspectedEvent.parametersAtEvent.mudWeight} SG` },
                    { label: 'ECD', val: `${inspectedEvent.parametersAtEvent.ecd} SG` },
                  ].map((p) => (
                    <div
                      key={p.label}
                      className="p-2.5 rounded-lg bg-[#162920] border border-[#2B4337]"
                    >
                      <div className="text-[10px] text-[#9BB0A3]">{p.label}</div>
                      <div className="font-mono text-xs font-bold text-[#F2F6F0] mt-0.5">
                        {p.val}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-[#F2F6F0] mb-1">
                  Historical Mitigation Actions Taken
                </div>
                <p className="text-xs text-[#F2F6F0] leading-relaxed bg-[#A3E6B8]/12 p-3.5 rounded-xl border border-[#3B5949]">
                  {inspectedEvent.mitigation}
                </p>
              </div>

              <div>
                <div className="text-xs font-bold text-[#F2F6F0] mb-1">Recorded Outcome</div>
                <p className="text-xs text-[#9BB0A3] leading-relaxed bg-[#162920] p-3.5 rounded-xl border border-[#2B4337]">
                  {inspectedEvent.outcome}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-[#2B4337] bg-[#162920] flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => {
                  const srcDoc = inspectedEvent.sourceDocId;
                  setInspectedEvent(null);
                  navigateToDocById(srcDoc);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#12221B] hover:bg-[#A3E6B8]/20 text-xs font-semibold text-[#A3E6B8] border border-[#3B5949] transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Open Source Report ({inspectedEvent.sourceDocId})</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const wellId = inspectedEvent.wellId;
                    setInspectedEvent(null);
                    navigateToWellProfile(wellId);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#12221B] hover:bg-[#1E352B] text-xs font-medium text-[#F2F6F0] border border-[#2B4337] transition-colors"
                >
                  View Well {inspectedEvent.wellId}
                </button>
                <button
                  onClick={() => {
                    const prompt = `Analyze historical event ${inspectedEvent.eventId} (${inspectedEvent.eventType} at ${inspectedEvent.depthMD} m MD in ${inspectedEvent.wellId}) and explain how its mitigation applies to active well NWIS-042.`;
                    setInspectedEvent(null);
                    askAIAbout(prompt);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-xs font-semibold text-[#0E1914] transition-colors"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask AI About Event</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Document Preview Modal */}
      {inspectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-2xl bg-[#12221B] border border-[#3B5949] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-[#162920] border-b border-[#2B4337] flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-[#A3E6B8]">
                  {inspectedDocument.docId} · {inspectedDocument.category} · Well{' '}
                  {inspectedDocument.wellId}
                </div>
                <h3 className="text-base font-bold text-[#F2F6F0] mt-0.5">
                  {inspectedDocument.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectedDocument(null)}
                className="p-1.5 rounded-lg text-[#9BB0A3] hover:text-[#F2F6F0] hover:bg-[#1E352B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#9BB0A3] pb-3 border-b border-[#2B4337]">
                <span>
                  Date: <strong className="text-[#F2F6F0] font-mono">{inspectedDocument.date}</strong>
                </span>
                <span>·</span>
                <span>
                  Pages: <strong className="text-[#F2F6F0] font-mono">{inspectedDocument.pages}</strong>
                </span>
                <span>·</span>
                <span>
                  Formation: <strong className="text-[#A3E6B8]">{inspectedDocument.formation}</strong>
                </span>
                <span>·</span>
                <span>
                  Verification:{' '}
                  <strong className="text-[#4ADE80]">{inspectedDocument.verificationStatus}</strong>
                </span>
              </div>

              <div>
                <div className="text-xs font-bold text-[#F2F6F0] mb-2">
                  Document Text Transcript (Synthetic Demo Record)
                </div>
                <pre className="p-4 rounded-xl bg-[#162920] border border-[#2B4337] font-mono text-xs text-[#F2F6F0] whitespace-pre-wrap leading-relaxed overflow-x-auto">
                  {inspectedDocument.contentPreview}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-[#A3E6B8]/12 border border-[#3B5949] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F2F6F0]">
                    AI-Extracted Knowledge Entities
                  </span>
                  <span className="font-mono text-xs font-bold text-[#4ADE80]">
                    Confidence: {inspectedDocument.extractedData.confidenceScore}%
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[#9BB0A3]">Depth Interval: </span>
                    <span className="font-mono font-semibold text-[#F2F6F0]">
                      {inspectedDocument.extractedData.depthInterval}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#9BB0A3]">Detected Events: </span>
                    <span className="font-semibold text-[#FBBF24]">
                      {inspectedDocument.extractedData.detectedEventTypes.join(', ')}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#9BB0A3]">Key Parameters: </span>
                    <span className="font-mono text-[#F2F6F0]">
                      {inspectedDocument.extractedData.keyParameters}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[#9BB0A3]">Extracted Mitigation: </span>
                    <span className="font-medium text-[#F2F6F0]">
                      {inspectedDocument.extractedData.mitigationSummary}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-[#162920] border-t border-[#2B4337] flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() =>
                  handleDownloadDocumentText(
                    inspectedDocument.docId,
                    inspectedDocument.title,
                    inspectedDocument.contentPreview
                  )
                }
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#12221B] hover:bg-[#1E352B] text-xs font-semibold text-[#F2F6F0] border border-[#2B4337] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#A3E6B8]" />
                <span>Download Transcript (.TXT)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveRoute('ai-doc-processing');
                    setInspectedDocument(null);
                  }}
                  className="px-3 py-2 rounded-xl bg-[#A3E6B8]/12 hover:bg-[#D4DE95] text-xs font-semibold text-[#F2F6F0] border border-[#3B5949] transition-colors"
                >
                  Open in OCR Review Pipeline
                </button>
                <button
                  onClick={() => setInspectedDocument(null)}
                  className="px-4 py-2 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-semibold text-xs"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Alert Detail Drawer */}
      {inspectedAlert && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#12221B] border-l border-[#2B4337] h-full flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-[#2B4337] bg-[#162920] flex items-center justify-between">
              <div>
                <div className="text-xs font-mono font-bold text-[#FBBF24]">
                  {inspectedAlert.alertId} · {inspectedAlert.severity.toUpperCase()} ALERT
                </div>
                <h3 className="text-base font-bold text-[#F2F6F0] mt-0.5">
                  {inspectedAlert.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectedAlert(null)}
                className="p-1.5 rounded-lg text-[#9BB0A3] hover:text-[#F2F6F0] hover:bg-[#1E352B]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#162920] border border-[#2B4337] text-xs">
                <div>
                  <div className="text-[#9BB0A3]">Well & Depth</div>
                  <div className="font-mono font-bold text-[#F2F6F0] mt-0.5">
                    {inspectedAlert.wellId} · {inspectedAlert.depthMD} m
                  </div>
                </div>
                <div>
                  <div className="text-[#9BB0A3]">Category</div>
                  <div className="font-bold text-[#A3E6B8] mt-0.5">
                    {inspectedAlert.category}
                  </div>
                </div>
                <div>
                  <div className="text-[#9BB0A3]">Status</div>
                  <div className="font-mono font-bold text-[#4ADE80] mt-0.5">
                    {inspectedAlert.status}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-[#F2F6F0] mb-1">Alert Description</div>
                <p className="text-xs text-[#9BB0A3] leading-relaxed bg-[#162920] p-3.5 rounded-xl border border-[#2B4337]">
                  {inspectedAlert.description}
                </p>
              </div>

              <div>
                <div className="text-xs font-bold text-[#FBBF24] mb-1">
                  Triggering Rule & Evidence
                </div>
                <p className="text-xs font-mono text-[#F2F6F0] leading-relaxed bg-[#162920] p-3.5 rounded-xl border border-[#FBBF24]/40">
                  {inspectedAlert.triggeringEvidence}
                </p>
              </div>

              <div>
                <div className="text-xs font-bold text-[#F2F6F0] mb-1">
                  Suggested Engineering Review Action (Advisory)
                </div>
                <p className="text-xs text-[#F2F6F0] leading-relaxed bg-[#A3E6B8]/12 p-3.5 rounded-xl border border-[#3B5949]">
                  {inspectedAlert.suggestedReviewAction}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-[#F2F6F0]">
                  Supporting Offset Wells & Reports
                </div>
                <div className="flex flex-wrap gap-2">
                  {inspectedAlert.relatedWells.map((wId) => (
                    <button
                      key={wId}
                      onClick={() => {
                        setInspectedAlert(null);
                        navigateToWellProfile(wId);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#A3E6B8]/12 hover:bg-[#D4DE95] border border-[#3B5949] text-xs font-mono font-semibold text-[#F2F6F0]"
                    >
                      Well: {wId}
                    </button>
                  ))}
                  {inspectedAlert.relatedDocIds.map((dId) => (
                    <button
                      key={dId}
                      onClick={() => {
                        setInspectedAlert(null);
                        navigateToDocById(dId);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-[#162920] hover:bg-[#1E352B] border border-[#2B4337] text-xs font-mono font-semibold text-[#F2F6F0]"
                    >
                      Doc: {dId}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#2B4337] bg-[#162920] flex items-center justify-between gap-2">
              {inspectedAlert.status === 'Active' ? (
                <button
                  onClick={() => acknowledgeAlert(inspectedAlert.alertId)}
                  className="flex-1 py-2 rounded-xl bg-[#A3E6B8]/12 hover:bg-[#D4DE95] text-xs font-bold text-[#F2F6F0] border border-[#3B5949] transition-colors"
                >
                  Acknowledge Alert
                </button>
              ) : (
                <span className="text-xs font-mono text-[#9BB0A3]">
                  Status: {inspectedAlert.status}
                </span>
              )}
              {inspectedAlert.status !== 'Resolved' && (
                <button
                  onClick={() => resolveAlert(inspectedAlert.alertId)}
                  className="flex-1 py-2 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-xs font-semibold text-[#0E1914] transition-colors"
                >
                  Resolve Demo Alert
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Non-Blocking Toast Notification Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl bg-[#12221B] border shadow-xl flex items-start justify-between gap-3 transition-all ${
              t.type === 'critical'
                ? 'border-[#F87171]'
                : t.type === 'warning'
                ? 'border-[#FBBF24]'
                : t.type === 'success'
                ? 'border-[#4ADE80]'
                : 'border-[#A3E6B8]'
            }`}
          >
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#F2F6F0]">{t.title}</div>
              <div className="text-[11px] text-[#9BB0A3] mt-0.5 leading-relaxed">{t.message}</div>
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-[#9BB0A3] hover:text-[#F2F6F0] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};
