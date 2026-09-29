import React, { useState, useMemo } from 'react';
import {
  Search,
  Sliders,
  Zap,
} from 'lucide-react';
import { useNWIS } from '../../context/NWISContext';

export const AlertsWarningsView: React.FC = () => {
  const {
    alerts,
    acknowledgeAlert,
    resolveAlert,
    triggerSampleAlert,
    setInspectedAlert,
    navigateToWellProfile,
    navigateToDocById,
    settings,
    updateSettings,
  } = useNWIS();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showThresholdConfig, setShowThresholdConfig] = useState(false);

  const [torqueLimit, setTorqueLimit] = useState(settings.torqueAlertThresholdKnm);
  const [sppLimit, setSppLimit] = useState(settings.sppAlertThresholdPsi);
  const [proximityWin, setProximityWin] = useState(settings.mudLossProximityWindowM);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      if (
        searchQuery.trim() &&
        !a.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !a.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !a.alertId.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (severityFilter !== 'All' && a.severity !== severityFilter) return false;
      if (categoryFilter !== 'All' && a.category !== categoryFilter) return false;
      if (statusFilter !== 'All' && a.status !== statusFilter) return false;
      return true;
    });
  }, [alerts, searchQuery, severityFilter, categoryFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-[#A3E6B8] font-semibold">
            PROACTIVE OFFSET HAZARD & TELEMETRY ADVISORY SYSTEM
          </div>
          <h1 className="text-xl font-bold text-[#F2F6F0] mt-0.5">
            Real-Time Alert & Warning Center ({filteredAlerts.length})
          </h1>
          <p className="text-xs text-[#9BB0A3]">
            Review, acknowledge, and resolve advisory warnings triggered by approaching offset-well
            events and telemetry thresholds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowThresholdConfig(!showThresholdConfig)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#A3E6B8]/12 hover:bg-[#D4DE95] text-xs font-semibold text-[#F2F6F0] border border-[#3B5949] transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-[#A3E6B8]" />
            <span>Configurable Alert Thresholds</span>
          </button>

          <button
            onClick={() => triggerSampleAlert()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-semibold text-xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Generate Simulated Alert</span>
          </button>
        </div>
      </div>

      {/* Configurable Demo Thresholds Drawer */}
      {showThresholdConfig && (
        <div className="p-5 rounded-2xl bg-[#A3E6B8]/12 border border-[#A3E6B8] space-y-4">
          <h3 className="text-sm font-semibold text-[#F2F6F0]">
            Configurable Demo Alert Rules & Telemetry Thresholds
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[#9BB0A3] font-medium mb-1">
                Rotary Torque Warning Threshold (kN·m)
              </label>
              <input
                type="number"
                step={0.5}
                value={torqueLimit}
                onChange={(e) => setTorqueLimit(Number(e.target.value))}
                className="w-full bg-[#12221B] text-[#F2F6F0] font-mono rounded-lg px-3 py-2 border border-[#3B5949]"
              />
            </div>
            <div>
              <label className="block text-[#9BB0A3] font-medium mb-1">
                Standpipe Pressure Alert Threshold (psi)
              </label>
              <input
                type="number"
                step={50}
                value={sppLimit}
                onChange={(e) => setSppLimit(Number(e.target.value))}
                className="w-full bg-[#12221B] text-[#F2F6F0] font-mono rounded-lg px-3 py-2 border border-[#3B5949]"
              />
            </div>
            <div>
              <label className="block text-[#9BB0A3] font-medium mb-1">
                Historical Event Proximity Window (m MD)
              </label>
              <input
                type="number"
                step={5}
                value={proximityWin}
                onChange={(e) => setProximityWin(Number(e.target.value))}
                className="w-full bg-[#12221B] text-[#F2F6F0] font-mono rounded-lg px-3 py-2 border border-[#3B5949]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                updateSettings({
                  torqueAlertThresholdKnm: torqueLimit,
                  sppAlertThresholdPsi: sppLimit,
                  mudLossProximityWindowM: proximityWin,
                });
                setShowThresholdConfig(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-semibold text-xs"
            >
              Save Threshold Rules
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#9BB0A3] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alerts by ID, title, evidence..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#162920] border border-[#2B4337] text-xs text-[#F2F6F0] placeholder-[#6E887B] focus:outline-none focus:border-[#A3E6B8]"
          />
        </div>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-1.5 border border-[#2B4337]"
        >
          <option value="All">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
          <option value="Informational">Informational</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-1.5 border border-[#2B4337]"
        >
          <option value="All">All Alert Categories</option>
          <option value="Approaching Historical Event">Approaching Historical Event</option>
          <option value="Historical Pattern Match">Historical Pattern Match</option>
          <option value="Formation Risk">Formation Risk</option>
          <option value="Telemetry Threshold">Telemetry Threshold</option>
          <option value="Data Quality">Data Quality</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-1.5 border border-[#2B4337]"
        >
          <option value="All">All Acknowledgment Statuses</option>
          <option value="Active">Active (Unacknowledged)</option>
          <option value="Acknowledged">Acknowledged</option>
          <option value="Resolved">Resolved History</option>
        </select>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-3.5">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.alertId}
            className={`p-5 rounded-2xl bg-[#12221B] border shadow-2xs transition-all space-y-3 ${
              alert.severity === 'Critical' && alert.status === 'Active'
                ? 'border-[#F87171]/50'
                : alert.severity === 'High' && alert.status === 'Active'
                ? 'border-[#FBBF24]/50'
                : 'border-[#2B4337]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span
                  className={
                    alert.severity === 'Critical'
                      ? 'text-[#F87171] font-bold'
                      : alert.severity === 'High'
                      ? 'text-[#FBBF24] font-bold'
                      : 'text-[#A3E6B8] font-semibold'
                  }
                >
                  [{alert.severity.toUpperCase()}]
                </span>
                <span className="text-[#F2F6F0] font-bold">{alert.alertId}</span>
                <span className="text-[#9BB0A3]">· {alert.category}</span>
                <span className="text-[#9BB0A3]">
                  · Well {alert.wellId} @ {alert.depthMD} m MD ({alert.formation})
                </span>
              </div>

              <div className="font-mono text-xs text-[#9BB0A3]">
                {alert.timestamp} · Status:{' '}
                <strong
                  className={
                    alert.status === 'Active'
                      ? 'text-[#FBBF24]'
                      : alert.status === 'Acknowledged'
                      ? 'text-[#A3E6B8]'
                      : 'text-[#4ADE80]'
                  }
                >
                  {alert.status}
                </strong>
              </div>
            </div>

            <h3 className="text-sm font-bold text-[#F2F6F0]">{alert.title}</h3>
            <p className="text-xs text-[#9BB0A3] leading-relaxed">{alert.description}</p>

            <div className="p-3 rounded-xl bg-[#162920] border border-[#2B4337] text-xs space-y-1">
              <div className="font-mono text-[11px] text-[#F2F6F0] font-semibold">
                Triggering Evidence: {alert.triggeringEvidence}
              </div>
              <div className="text-[#4ADE80] font-medium">
                Suggested Review Action: {alert.suggestedReviewAction}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                {alert.relatedWells.map((wId) => (
                  <button
                    key={wId}
                    onClick={() => navigateToWellProfile(wId)}
                    className="px-2.5 py-1 rounded-lg bg-[#162920] hover:bg-[#A3E6B8]/20 text-[11px] font-mono font-semibold text-[#A3E6B8] border border-[#3B5949]"
                  >
                    Offset: {wId}
                  </button>
                ))}
                {alert.relatedDocIds.map((dId) => (
                  <button
                    key={dId}
                    onClick={() => navigateToDocById(dId)}
                    className="px-2.5 py-1 rounded-lg bg-[#162920] hover:bg-[#A3E6B8]/20 text-[11px] font-mono font-semibold text-[#F2F6F0] border border-[#3B5949]"
                  >
                    Report: {dId}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInspectedAlert(alert)}
                  className="px-3 py-1.5 rounded-xl bg-[#162920] hover:bg-[#1E352B] text-xs font-medium text-[#F2F6F0] border border-[#2B4337]"
                >
                  Inspect Drawer
                </button>
                {alert.status === 'Active' && (
                  <button
                    onClick={() => acknowledgeAlert(alert.alertId)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#A3E6B8]/12 hover:bg-[#D4DE95] text-xs font-semibold text-[#F2F6F0] border border-[#3B5949]"
                  >
                    Acknowledge Alert
                  </button>
                )}
                {alert.status !== 'Resolved' && (
                  <button
                    onClick={() => resolveAlert(alert.alertId)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-xs font-semibold text-[#0E1914]"
                  >
                    Resolve Demo Alert
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
