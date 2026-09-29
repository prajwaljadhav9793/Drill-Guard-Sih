import React from 'react';
import {
  Play,
  Pause,
  Square,
  Zap,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import { useNWIS } from '../../context/NWISContext';

const ARCH_STAGES = [
  { title: 'Drill Guard WITSML Source', desc: 'Simulated WITSML 1.4.1 / Surface & PWD Stream' },
  { title: 'Data Ingestion', desc: '1 Hz Frame Parser & Unit Normalization' },
  { title: 'Validation', desc: 'Range & Sensor Quality Gate (12/12 Channels)' },
  { title: 'Time-Series Store', desc: 'Depth & Time Indexed Ring Buffer' },
  { title: 'Risk Engine', desc: 'Offset Proximity & Threshold Evaluator' },
  { title: 'Alert Engine', desc: 'Advisory Notification Dispatcher' },
  { title: 'Drill Guard Dashboard', desc: 'Unified Command & Correlation Views' },
];

export const LiveIntegrationView: React.FC = () => {
  const {
    activeWell,
    simulationStatus,
    setSimulationStatus,
    resetSimulationTelemetry,
    triggerSampleAlert,
    ingestionLogs,
    settings,
  } = useNWIS();

  const channels = [
    { id: 'CH-01', name: 'Measured Depth (MD)', value: `${activeWell.currentDepthMD.toFixed(2)} m`, status: 'Nominal' },
    { id: 'CH-02', name: 'True Vertical Depth (TVD)', value: `${activeWell.currentDepthTVD.toFixed(2)} m`, status: 'Nominal' },
    { id: 'CH-03', name: 'Bit Depth', value: `${activeWell.bitDepthMD.toFixed(2)} m`, status: 'Nominal' },
    { id: 'CH-04', name: 'Rate of Penetration (ROP)', value: `${activeWell.rop} m/hr`, status: 'Nominal' },
    { id: 'CH-05', name: 'Weight on Bit (WOB)', value: `${activeWell.wob} klbf`, status: 'Nominal' },
    { id: 'CH-06', name: 'Surface RPM', value: `${activeWell.rpm} RPM`, status: 'Nominal' },
    {
      id: 'CH-07',
      name: 'Rotary Torque',
      value: `${activeWell.torque} kN·m`,
      status: activeWell.torque > settings.torqueAlertThresholdKnm ? 'Threshold Watch' : 'Nominal',
    },
    { id: 'CH-08', name: 'Standpipe Pressure (SPP)', value: `${activeWell.spp} psi`, status: 'Nominal' },
    { id: 'CH-09', name: 'Mud Flow Rate In', value: `${activeWell.flowRate} L/min`, status: 'Nominal' },
    { id: 'CH-10', name: 'Active Mud Density', value: `${activeWell.mudWeight} SG`, status: 'Nominal' },
    { id: 'CH-11', name: 'Downhole PWD ECD', value: `${activeWell.ecd} SG`, status: 'Nominal' },
    { id: 'CH-12', name: 'Hook Load', value: `${activeWell.hookLoad} klbf`, status: 'Nominal' },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Simulator Controls */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#A3E6B8] font-semibold">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                simulationStatus === 'running'
                  ? 'bg-[#4ADE80] animate-pulse'
                  : 'bg-[#FBBF24]'
              }`}
            />
            <span>DRILL GUARD LIVE WITSML TELEMETRY BRIDGE — DEMO ENVIRONMENT</span>
          </div>
          <h1 className="text-xl font-bold text-[#F2F6F0] mt-0.5">
            Drill Guard Real-Time Data Integration Monitor
          </h1>
          <p className="text-xs text-[#9BB0A3]">
            Monitors synthetic WITSML telemetry ingestion, channel validation, and risk-engine
            pipeline health for {activeWell.wellId}.
          </p>
        </div>

        {/* 6 Required Simulator Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSimulationStatus('running')}
            disabled={simulationStatus === 'running'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] disabled:opacity-40 text-[#0E1914] text-xs font-semibold transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{simulationStatus === 'paused' ? 'Resume Feed' : 'Start Feed'}</span>
          </button>

          <button
            onClick={() => setSimulationStatus('paused')}
            disabled={simulationStatus !== 'running'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FBBF24]/15 hover:bg-[#FBBF24]/25 disabled:opacity-40 text-[#FBBF24] border border-[#FBBF24]/40 text-xs font-semibold transition-colors"
          >
            <Pause className="w-3.5 h-3.5" />
            <span>Pause Feed</span>
          </button>

          <button
            onClick={() => setSimulationStatus('stopped')}
            disabled={simulationStatus === 'stopped'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F87171]/10 hover:bg-[#F87171]/20 disabled:opacity-40 text-[#F87171] border border-[#F87171]/35 text-xs font-semibold transition-colors"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Stop Feed</span>
          </button>

          <button
            onClick={() =>
              triggerSampleAlert(
                `Simulated Drill Guard Torque & ECD Excursion at ${activeWell.currentDepthMD.toFixed(1)} m MD`
              )
            }
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#A3E6B8]/12 hover:bg-[#D4DE95] text-[#F2F6F0] border border-[#3B5949] text-xs font-semibold transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-[#A3E6B8]" />
            <span>Generate Sample Event</span>
          </button>

          <button
            onClick={resetSimulationTelemetry}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#162920] hover:bg-[#1E352B] text-[#9BB0A3] hover:text-[#F2F6F0] border border-[#2B4337] text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Simulation</span>
          </button>
        </div>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">Connection State</div>
          <div className="font-mono text-base font-bold text-[#4ADE80] mt-1">
            {simulationStatus === 'running'
              ? 'SIMULATED STREAMING'
              : simulationStatus.toUpperCase()}
          </div>
          <div className="text-[11px] text-[#9BB0A3] mt-0.5">Protocol: WITSML 1.4.1 Sim</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">Active Well Target</div>
          <div className="font-mono text-base font-bold text-[#A3E6B8] mt-1">
            {activeWell.wellId}
          </div>
          <div className="text-[11px] text-[#9BB0A3] mt-0.5">{activeWell.wellName}</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">Update Frequency</div>
          <div className="font-mono text-base font-bold text-[#F2F6F0] mt-1">
            {(1000 / (settings.simulationIntervalMs || 2500)).toFixed(1)} Hz (
            {(settings.simulationIntervalMs || 2500) / 1000}s)
          </div>
          <div className="text-[11px] text-[#9BB0A3] mt-0.5">Configurable in Settings</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">Last Frame Received</div>
          <div className="font-mono text-sm font-bold text-[#F2F6F0] mt-1">
            {activeWell.lastUpdated}
          </div>
          <div className="text-[11px] text-[#4ADE80] font-semibold mt-0.5">Freshness &lt; 3s</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">Telemetry Channels</div>
          <div className="font-mono text-base font-bold text-[#A3E6B8] mt-1">12 / 12 Active</div>
          <div className="text-[11px] text-[#9BB0A3] mt-0.5">Surface + PWD Downhole</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs">
          <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">Data Quality Warnings</div>
          <div className="font-mono text-base font-bold text-[#F2F6F0] mt-1">0 Packet Drops</div>
          <div className="text-[11px] text-[#9BB0A3] mt-0.5">100% Schema Validated</div>
        </div>
      </div>

      {/* Architecture Flow Diagram */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3">
        <h2 className="text-sm font-semibold text-[#F2F6F0]">
          Drill Guard Real-Time WITSML Data Pipeline Architecture
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
          {ARCH_STAGES.map((stage, i) => (
            <div
              key={stage.title}
              className="p-3 rounded-xl bg-[#162920] border border-[#3B5949] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-[#A3E6B8] font-bold">
                <span>0{i + 1}</span>
                {i < ARCH_STAGES.length - 1 && <ArrowRight className="w-3 h-3" />}
              </div>
              <div className="text-xs font-bold text-[#F2F6F0] mt-1">{stage.title}</div>
              <div className="text-[11px] text-[#9BB0A3] mt-0.5 leading-snug">{stage.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Channels Table + Live Ingestion Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3">
          <h3 className="text-sm font-semibold text-[#F2F6F0]">
            Subscribed Telemetry Channels ({activeWell.wellId})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#2B4337] text-[#9BB0A3] font-mono">
                  <th className="py-2 px-2.5">Channel ID</th>
                  <th className="py-2 px-2.5">Mnemonic / Description</th>
                  <th className="py-2 px-2.5 text-right">Latest Value</th>
                  <th className="py-2 px-2.5 text-right">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B4337]">
                {channels.map((ch) => (
                  <tr key={ch.id} className="hover:bg-[#162920]">
                    <td className="py-2 px-2.5 font-mono text-[#A3E6B8] font-semibold">{ch.id}</td>
                    <td className="py-2 px-2.5 text-[#F2F6F0]">{ch.name}</td>
                    <td className="py-2 px-2.5 font-mono text-right font-semibold text-[#F2F6F0]">
                      {ch.value}
                    </td>
                    <td
                      className={`py-2 px-2.5 font-mono text-right font-semibold ${
                        ch.status === 'Nominal' ? 'text-[#4ADE80]' : 'text-[#FBBF24]'
                      }`}
                    >
                      {ch.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Data Ingestion Log */}
        <div className="lg:col-span-6 p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#F2F6F0]">
              Live Telemetry Ingestion & Evaluation Log
            </h3>
            <span className="font-mono text-[11px] text-[#A3E6B8] font-semibold">
              Showing latest {ingestionLogs.length} frames
            </span>
          </div>

          <div className="flex-1 max-h-[380px] overflow-y-auto space-y-2 pr-1 font-mono text-xs">
            {ingestionLogs.map((log, idx) => (
              <div
                key={`${log.id}-${idx}`}
                className="p-2.5 rounded-xl bg-[#162920] border border-[#2B4337] flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-[#9BB0A3]">[{log.timestamp}]</span>
                    <span
                      className={
                        log.status === 'OK'
                          ? 'text-[#4ADE80] font-bold'
                          : log.status === 'EVENT'
                          ? 'text-[#F87171] font-bold'
                          : 'text-[#FBBF24] font-bold'
                      }
                    >
                      {log.status}
                    </span>
                    <span className="text-[#A3E6B8] font-semibold">{log.channel}</span>
                  </div>
                  <div className="text-[11px] text-[#F2F6F0] mt-0.5">{log.message}</div>
                </div>
                <span className="text-[10px] text-[#9BB0A3] shrink-0">{log.latencyMs}ms</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
