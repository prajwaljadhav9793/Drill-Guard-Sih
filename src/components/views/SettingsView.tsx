import React, { useState } from 'react';
import {
  RotateCcw,
  Save,
} from 'lucide-react';
import { useNWIS } from '../../context/NWISContext';
import { DEMO_FIELD_OPTIONS } from '../../data/demoData';
import { DrillGuardShieldMark } from '../common/DrillGuardLogo';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    activeWells,
    resetAllDemoData,
    themeMode,
    setThemeMode,
  } = useNWIS();

  const [formState, setFormState] = useState(settings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <DrillGuardShieldMark className="w-11 h-11 hidden sm:block" />
          <div>
            <div className="text-xs font-mono text-[#A3E6B8] font-semibold">
              DRILL GUARD CONFIGURATION & DEMO PERSISTENCE MANAGEMENT
            </div>
            <h1 className="text-xl font-bold text-[#F2F6F0] mt-0.5">
              Drill Guard System & Threshold Settings
            </h1>
            <p className="text-xs text-[#9BB0A3]">
              Configure interface appearance (Dark / Light mode), default field/well parameters, risk
              engine thresholds, and telemetry simulation cadence.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center rounded-xl bg-[#162920] p-1 border border-[#2B4337]">
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                themeMode === 'dark'
                  ? 'bg-[#26E8B0] text-[#080D0B] font-bold'
                  : 'text-[#9BB0A3] hover:text-[#F2F6F0]'
              }`}
            >
              Dark Mode
            </button>
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                themeMode === 'light'
                  ? 'bg-[#26E8B0] text-[#080D0B] font-bold'
                  : 'text-[#9BB0A3] hover:text-[#F2F6F0]'
              }`}
            >
              Light Mode
            </button>
          </div>

          <button
            onClick={resetAllDemoData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F87171]/15 hover:bg-[#F87171]/25 text-[#F87171] border border-[#F87171]/40 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Demo Data</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Default Operational Context */}
        <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-[#F2F6F0]">
            1. Default Field, Well & GIS Map Preferences
          </h2>

          <div>
            <label className="block text-[#9BB0A3] font-medium mb-1">Default Demo Field</label>
            <select
              value={formState.defaultField}
              onChange={(e) => setFormState({ ...formState, defaultField: e.target.value })}
              className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#2B4337]"
            >
              {DEMO_FIELD_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#9BB0A3] font-medium mb-1">Default Active Well</label>
            <select
              value={formState.defaultActiveWellId}
              onChange={(e) =>
                setFormState({ ...formState, defaultActiveWellId: e.target.value })
              }
              className="w-full bg-[#162920] text-[#F2F6F0] font-mono rounded-lg px-3 py-2 border border-[#2B4337]"
            >
              {activeWells.map((w) => (
                <option key={w.wellId} value={w.wellId}>
                  {w.wellId} ({w.wellName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#9BB0A3] font-medium mb-1">
              Default GIS Search Radius (km)
            </label>
            <select
              value={formState.defaultMapRadiusKm}
              onChange={(e) =>
                setFormState({ ...formState, defaultMapRadiusKm: Number(e.target.value) })
              }
              className="w-full bg-[#162920] text-[#F2F6F0] font-mono rounded-lg px-3 py-2 border border-[#2B4337]"
            >
              {[1, 5, 10, 25, 50].map((r) => (
                <option key={r} value={r}>
                  {r} km
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[#9BB0A3] font-medium mb-1">
              Simulated Telemetry Update Cadence (ms)
            </label>
            <select
              value={formState.simulationIntervalMs}
              onChange={(e) =>
                setFormState({ ...formState, simulationIntervalMs: Number(e.target.value) })
              }
              className="w-full bg-[#162920] text-[#F2F6F0] font-mono rounded-lg px-3 py-2 border border-[#2B4337]"
            >
              <option value={1500}>1,500 ms (Fast Demo Stream)</option>
              <option value={2500}>2,500 ms (Standard Cadence)</option>
              <option value={5000}>5,000 ms (Relaxed Cadence)</option>
            </select>
          </div>
        </div>

        {/* Alert Thresholds & Notification Preferences */}
        <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-[#F2F6F0]">
            2. Risk Engine & Alert Threshold Configuration
          </h2>

          <div>
            <label className="block text-[#9BB0A3] font-medium mb-1">
              Rotary Torque Alert Threshold (kN·m)
            </label>
            <input
              type="number"
              step={0.5}
              value={formState.torqueAlertThresholdKnm}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  torqueAlertThresholdKnm: Number(e.target.value),
                })
              }
              className="w-full bg-[#162920] text-[#F2F6F0] font-mono rounded-lg px-3 py-2 border border-[#2B4337]"
            />
          </div>

          <div>
            <label className="block text-[#9BB0A3] font-medium mb-1">
              Standpipe Pressure Alert Threshold (psi)
            </label>
            <input
              type="number"
              step={50}
              value={formState.sppAlertThresholdPsi}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  sppAlertThresholdPsi: Number(e.target.value),
                })
              }
              className="w-full bg-[#162920] text-[#F2F6F0] font-mono rounded-lg px-3 py-2 border border-[#2B4337]"
            />
          </div>

          <div>
            <label className="block text-[#9BB0A3] font-medium mb-1">
              Offset Event Look-Ahead Proximity Window (m MD)
            </label>
            <input
              type="number"
              step={5}
              value={formState.mudLossProximityWindowM}
              onChange={(e) =>
                setFormState({
                  ...formState,
                  mudLossProximityWindowM: Number(e.target.value),
                })
              }
              className="w-full bg-[#162920] text-[#F2F6F0] font-mono rounded-lg px-3 py-2 border border-[#2B4337]"
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-[#2B4337]">
            <label className="flex items-center gap-2 cursor-pointer text-[#F2F6F0] font-medium">
              <input
                type="checkbox"
                checked={formState.emailAlertsEnabled}
                onChange={(e) =>
                  setFormState({ ...formState, emailAlertsEnabled: e.target.checked })
                }
                className="rounded accent-[#A3E6B8]"
              />
              <span>Enable Simulated Shift Handover Digest Notifications</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[#F2F6F0] font-medium">
              <input
                type="checkbox"
                checked={formState.autoCorrelateDepth}
                onChange={(e) =>
                  setFormState({ ...formState, autoCorrelateDepth: e.target.checked })
                }
                className="rounded accent-[#A3E6B8]"
              />
              <span>Auto-Synchronize Depth Correlation Window with Active Bit</span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Save All System & Threshold Settings</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
