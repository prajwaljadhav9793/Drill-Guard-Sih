import React, { useState, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useNWIS } from '../../context/NWISContext';
import { TelemetryPoint } from '../../types/nwis';

type SelectableParam = 'rop' | 'wob' | 'rpm' | 'torque' | 'spp' | 'flowRate' | 'mudWeight' | 'ecd';
type SparklineMetricKey = SelectableParam | 'depthMD' | 'depthTVD' | 'hookLoad' | 'annularPressure';

interface MiniSparklineProps {
  data: TelemetryPoint[];
  dataKey: SparklineMetricKey;
  color: string;
  unit: string;
  height?: number;
  showTooltip?: boolean;
  decimals?: number;
}

const TelemetryMiniSparkline: React.FC<MiniSparklineProps> = ({
  data,
  dataKey,
  color,
  unit,
  height = 52,
  showTooltip = true,
  decimals = 1,
}) => {
  const gradientId = `spark-grad-${dataKey}`;

  const stats = useMemo(() => {
    if (!data.length) return { min: 0, max: 1, avg: 0 };
    const values = data.map((d) => Number(d[dataKey]) || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((acc, v) => acc + v, 0) / values.length;
    return { min, max, avg };
  }, [data, dataKey]);

  const pad = Math.max((stats.max - stats.min) * 0.2, 0.01);

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.32} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <YAxis
            domain={[stats.min - pad, stats.max + pad]}
            hide
          />
          <ReferenceLine
            y={stats.avg}
            stroke={color}
            strokeDasharray="2 2"
            strokeOpacity={0.35}
          />
          {showTooltip && (
            <Tooltip
              cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '2 2' }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const pt = payload[0].payload as TelemetryPoint;
                const rawVal = Number(pt[dataKey] ?? 0);
                return (
                  <div className="px-2 py-1 rounded-md bg-[#0B1410] text-[#F2F6F0] text-[10px] font-mono shadow-md border border-[#3B5949]">
                    <span className="text-[#A3E6B8]">{pt.timeLabel}</span>:{' '}
                    <span className="font-bold">
                      {rawVal.toFixed(decimals)} {unit}
                    </span>
                  </div>
                );
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3, fill: color, stroke: '#12221B', strokeWidth: 1.5 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const PARAM_CONFIG: Record<
  SelectableParam,
  { label: string; unit: string; color: string; baseline: string }
> = {
  rop: { label: 'Rate of Penetration (ROP)', unit: 'm/hr', color: '#A3E6B8', baseline: '16.0 – 22.0 m/hr' },
  wob: { label: 'Weight on Bit (WOB)', unit: 'klbf', color: '#4ADE80', baseline: '13.5 – 16.5 klbf' },
  rpm: { label: 'Surface Rotary Speed (RPM)', unit: 'RPM', color: '#D4DE95', baseline: '118 – 135 RPM' },
  torque: { label: 'Rotary Torque', unit: 'kN·m', color: '#FBBF24', baseline: '< 14.5 kN·m' },
  spp: { label: 'Standpipe Pressure (SPP)', unit: 'psi', color: '#F87171', baseline: '2,350 – 2,600 psi' },
  flowRate: { label: 'Mud Flow Rate', unit: 'L/min', color: '#A3E6B8', baseline: '1,580 – 1,720 L/min' },
  mudWeight: { label: 'Active Mud Weight', unit: 'SG', color: '#4ADE80', baseline: '1.18 SG' },
  ecd: { label: 'Equivalent Circulating Density (ECD)', unit: 'SG', color: '#D4DE95', baseline: '< 1.26 SG' },
};

export const ActiveWellView: React.FC = () => {
  const {
    activeWells,
    activeWell,
    setActiveWellId,
    telemetryHistory,
    simulationStatus,
    setSimulationStatus,
    resetSimulationTelemetry,
    triggerSampleAlert,
    setActiveRoute,
  } = useNWIS();

  const [selectedParam, setSelectedParam] = useState<SelectableParam>('rop');
  const [secondaryParam, setSecondaryParam] = useState<SelectableParam>('torque');
  const [timeWindow, setTimeWindow] = useState<'15m' | '1h' | '6h' | '24h'>('15m');

  const slicedData = useMemo(() => {
    if (timeWindow === '15m') return telemetryHistory.slice(-15);
    if (timeWindow === '1h') return telemetryHistory.slice(-25);
    return telemetryHistory;
  }, [telemetryHistory, timeWindow]);

  const recentSparklineWindow = useMemo(
    () => telemetryHistory.slice(-15),
    [telemetryHistory]
  );

  const telemetryCards = [
    {
      key: 'rop' as SelectableParam,
      title: 'Rate of Penetration',
      short: 'ROP',
      value: activeWell.rop.toFixed(1),
      unit: 'm/hr',
      delta: '+0.4 m/hr',
      color: '#A3E6B8',
      decimals: 1,
    },
    {
      key: 'wob' as SelectableParam,
      title: 'Weight on Bit',
      short: 'WOB',
      value: activeWell.wob.toFixed(1),
      unit: 'klbf',
      delta: 'Nominal',
      color: '#4ADE80',
      decimals: 1,
    },
    {
      key: 'rpm' as SelectableParam,
      title: 'Rotary Speed',
      short: 'RPM',
      value: activeWell.rpm.toString(),
      unit: 'rpm',
      delta: 'Top Drive Active',
      color: '#D4DE95',
      decimals: 0,
    },
    {
      key: 'torque' as SelectableParam,
      title: 'Surface Torque',
      short: 'TORQUE',
      value: activeWell.torque.toFixed(2),
      unit: 'kN·m',
      delta: activeWell.torque > 14.0 ? 'Approaching Limit' : 'Stable',
      color: '#FBBF24',
      decimals: 2,
    },
    {
      key: 'spp' as SelectableParam,
      title: 'Standpipe Pressure',
      short: 'SPP',
      value: activeWell.spp.toString(),
      unit: 'psi',
      delta: 'Pumps #1 & #2',
      color: '#F87171',
      decimals: 0,
    },
    {
      key: 'flowRate' as SelectableParam,
      title: 'Mud Flow Rate',
      short: 'FLOW',
      value: activeWell.flowRate.toString(),
      unit: 'L/min',
      delta: '99.2% Returns',
      color: '#A3E6B8',
      decimals: 0,
    },
    {
      key: 'mudWeight' as SelectableParam,
      title: 'Active Mud Weight',
      short: 'MW IN/OUT',
      value: activeWell.mudWeight.toFixed(2),
      unit: 'SG',
      delta: 'HPWBM + CaCO3',
      color: '#4ADE80',
      decimals: 2,
    },
    {
      key: 'ecd' as SelectableParam,
      title: 'Downhole PWD ECD',
      short: 'ECD',
      value: activeWell.ecd.toFixed(2),
      unit: 'SG',
      delta: 'Frac Grad: 1.44 SG',
      color: '#D4DE95',
      decimals: 2,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Simulation Controls */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#9BB0A3] mb-1">
            <span className="font-mono font-semibold text-[#A3E6B8]">
              SIMULATED LIVE DATA — NOT CONNECTED TO PHYSICAL RIG EQUIPMENT
            </span>
            <span>·</span>
            <span>Last Updated: {activeWell.lastUpdated}</span>
          </div>
          <h1 className="text-xl font-bold text-[#F2F6F0]">
            Active Well Monitoring Workspace — {activeWell.wellId} ({activeWell.wellName})
          </h1>
          <p className="text-xs text-[#9BB0A3] mt-0.5">
            Rig: {activeWell.rigName} · Spud Date: {activeWell.spudDate} · Target TD:{' '}
            {activeWell.targetDepthMD.toLocaleString()} m MD
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={activeWell.wellId}
            onChange={(e) => setActiveWellId(e.target.value)}
            className="bg-[#162920] text-[#F2F6F0] font-mono text-xs rounded-xl px-3 py-2 border border-[#3B5949] focus:outline-none focus:border-[#A3E6B8]"
          >
            {activeWells.map((w) => (
              <option key={w.wellId} value={w.wellId}>
                {w.wellId} ({w.wellName})
              </option>
            ))}
          </select>

          {simulationStatus === 'running' ? (
            <button
              onClick={() => setSimulationStatus('paused')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FBBF24]/15 hover:bg-[#FBBF24]/25 text-[#FBBF24] border border-[#FBBF24]/40 text-xs font-semibold transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Simulation</span>
            </button>
          ) : (
            <button
              onClick={() => setSimulationStatus('running')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] text-xs font-semibold transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Simulation</span>
            </button>
          )}

          <button
            onClick={() => triggerSampleAlert()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#A3E6B8]/12 hover:bg-[#D4DE95] text-[#F2F6F0] border border-[#3B5949] text-xs font-semibold transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-[#A3E6B8]" />
            <span>Simulate Anomaly Alert</span>
          </button>

          <button
            onClick={resetSimulationTelemetry}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#162920] hover:bg-[#1E352B] text-[#9BB0A3] hover:text-[#F2F6F0] border border-[#2B4337] text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Depth & Subsurface Status Summary Row with At-a-Glance Mini Sparklines */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#12221B] border border-[#A3E6B8]/40 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#9BB0A3]">Measured Depth (MD)</span>
              <Activity className="w-3 h-3 text-[#A3E6B8]" />
            </div>
            <div className="font-mono text-2xl font-bold text-[#A3E6B8] tabular-nums mt-1">
              {activeWell.currentDepthMD.toFixed(2)} <span className="text-xs font-normal">m</span>
            </div>
            <div className="text-[11px] text-[#9BB0A3] mt-0.5">
              Bit Depth: {activeWell.bitDepthMD.toFixed(2)} m
            </div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-[#2B4337]/80">
            <TelemetryMiniSparkline
              data={recentSparklineWindow}
              dataKey="depthMD"
              color="#A3E6B8"
              unit="m"
              height={32}
              decimals={2}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">True Vertical Depth</div>
            <div className="font-mono text-2xl font-bold text-[#F2F6F0] tabular-nums mt-1">
              {activeWell.currentDepthTVD.toFixed(2)} <span className="text-xs font-normal">m</span>
            </div>
            <div className="text-[11px] text-[#9BB0A3] mt-0.5">Inclination: 18.4° Tangent</div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-[#2B4337]/80">
            <TelemetryMiniSparkline
              data={recentSparklineWindow}
              dataKey="depthTVD"
              color="#D4DE95"
              unit="m"
              height={32}
              decimals={2}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">Current Formation</div>
            <div className="text-sm font-bold text-[#F2F6F0] mt-1.5 truncate">
              {activeWell.currentFormation}
            </div>
            <div className="text-[11px] text-[#9BB0A3] mt-1">Pore Pressure ~1.15 SG</div>
          </div>
          <div className="mt-2 pt-2 border-t border-[#2B4337]/80 flex items-center justify-between text-[10px] font-mono text-[#A3E6B8]">
            <span>LITHOLOGY VERIFIED</span>
            <span>WITSML LIVE</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">Hook Load</div>
            <div className="font-mono text-2xl font-bold text-[#F2F6F0] tabular-nums mt-1">
              {activeWell.hookLoad.toFixed(1)} <span className="text-xs font-normal">klbf</span>
            </div>
            <div className="text-[11px] text-[#9BB0A3] mt-0.5">Overpull Margin: +65 klbf</div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-[#2B4337]/80">
            <TelemetryMiniSparkline
              data={recentSparklineWindow}
              dataKey="hookLoad"
              color="#4ADE80"
              unit="klbf"
              height={32}
              decimals={1}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">Annular Pressure</div>
            <div className="font-mono text-2xl font-bold text-[#F2F6F0] tabular-nums mt-1">
              {activeWell.annularPressure} <span className="text-xs font-normal">psi</span>
            </div>
            <div className="text-[11px] text-[#9BB0A3] mt-0.5">Downhole PWD Sensor</div>
          </div>
          <div className="mt-2 pt-1.5 border-t border-[#2B4337]/80">
            <TelemetryMiniSparkline
              data={recentSparklineWindow}
              dataKey="annularPressure"
              color="#FBBF24"
              unit="psi"
              height={32}
              decimals={0}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">Next Formation Top</div>
            <div className="font-mono text-xl font-bold text-[#4ADE80] tabular-nums mt-1">
              {activeWell.nextFormationTopMD} m MD
            </div>
            <div className="text-[11px] text-[#9BB0A3] mt-0.5 truncate">
              {activeWell.nextFormation}
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-[#2B4337]/80 flex items-center justify-between text-[10px] font-mono text-[#4ADE80]">
            <span>LOOKAHEAD</span>
            <span>
              {Math.max(0, activeWell.nextFormationTopMD - activeWell.currentDepthMD).toFixed(1)} m TO TOP
            </span>
          </div>
        </div>
      </div>

      {/* 8 Individual Telemetry Cards with Interactive Recharts Mini Sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {telemetryCards.map((card) => {
          const isSelected = selectedParam === card.key;
          const windowVals = recentSparklineWindow.map((pt) => Number(pt[card.key]) || 0);
          const minVal = windowVals.length ? Math.min(...windowVals) : 0;
          const maxVal = windowVals.length ? Math.max(...windowVals) : 0;
          const firstVal = windowVals.length ? windowVals[0] : 0;
          const lastVal = windowVals.length ? windowVals[windowVals.length - 1] : 0;
          const diff = lastVal - firstVal;
          const TrendIcon =
            Math.abs(diff) < 0.005 ? Minus : diff > 0 ? TrendingUp : TrendingDown;

          return (
            <div
              key={card.key}
              onClick={() => setSelectedParam(card.key)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#A3E6B8]/12 border-[#A3E6B8] shadow-sm'
                  : 'bg-[#12221B] border-[#2B4337] hover:border-[#3B5949] shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-[#9BB0A3]">
                <span className="font-mono uppercase tracking-wider font-semibold text-[#F2F6F0]">
                  {card.short}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-[#9BB0A3] font-mono">
                  <TrendIcon className="w-3 h-3" style={{ color: card.color }} />
                  <span>{card.delta}</span>
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className="font-mono text-2xl font-bold tabular-nums"
                    style={{ color: card.color }}
                  >
                    {card.value}
                  </span>
                  <span className="font-mono text-xs text-[#9BB0A3]">{card.unit}</span>
                </div>
                <span className="text-[10px] font-mono text-[#9BB0A3] tabular-nums">
                  {diff >= 0 ? '+' : ''}
                  {diff.toFixed(card.decimals)} {card.unit}
                </span>
              </div>
              <div className="text-[11px] text-[#9BB0A3] mt-0.5">{card.title}</div>

              {/* Recharts Mini Area Sparkline with Auto-Scaled Domain & Mean Reference Line */}
              <div className="mt-2.5 pt-2 border-t border-[#2B4337]/80">
                <TelemetryMiniSparkline
                  data={recentSparklineWindow}
                  dataKey={card.key}
                  color={card.color}
                  unit={card.unit}
                  height={52}
                  decimals={card.decimals}
                />
                <div className="mt-1 flex items-center justify-between text-[10px] font-mono text-[#9BB0A3] tabular-nums">
                  <span>Min: {minVal.toFixed(card.decimals)}</span>
                  <span>15-pt Trend</span>
                  <span>Max: {maxVal.toFixed(card.decimals)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Multi-Parameter Time-Series Chart */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-[#F2F6F0]">
              Real-Time Telemetry Waveform Analyzer
            </h2>
            <p className="text-xs text-[#9BB0A3]">
              Primary: <strong className="text-[#A3E6B8]">{PARAM_CONFIG[selectedParam].label}</strong>{' '}
              (Offset Baseline: {PARAM_CONFIG[selectedParam].baseline}) · Secondary:{' '}
              <strong className="text-[#F2F6F0]">{PARAM_CONFIG[secondaryParam].label}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Parameter Selector */}
            <select
              value={selectedParam}
              onChange={(e) => setSelectedParam(e.target.value as SelectableParam)}
              className="bg-[#162920] text-[#A3E6B8] text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-[#3B5949]"
            >
              {(Object.keys(PARAM_CONFIG) as SelectableParam[]).map((k) => (
                <option key={k} value={k}>
                  Primary: {PARAM_CONFIG[k].label}
                </option>
              ))}
            </select>

            {/* Secondary Parameter Selector */}
            <select
              value={secondaryParam}
              onChange={(e) => setSecondaryParam(e.target.value as SelectableParam)}
              className="bg-[#162920] text-[#F2F6F0] text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-[#3B5949]"
            >
              {(Object.keys(PARAM_CONFIG) as SelectableParam[]).map((k) => (
                <option key={k} value={k}>
                  Overlay: {PARAM_CONFIG[k].label}
                </option>
              ))}
            </select>

            {/* Time Range Buttons */}
            <div className="flex items-center bg-[#162920] p-1 rounded-lg border border-[#2B4337]">
              {(
                [
                  { id: '15m', label: '15 min' },
                  { id: '1h', label: '1 hr' },
                  { id: '6h', label: '6 hrs' },
                  { id: '24h', label: '24 hrs' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeWindow(t.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                    timeWindow === t.id
                      ? 'bg-[#A3E6B8] text-[#0E1914] font-semibold'
                      : 'text-[#9BB0A3] hover:text-[#F2F6F0]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={slicedData}>
              <defs>
                <linearGradient id="primaryParamGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A3E6B8" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#A3E6B8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2B4337" strokeDasharray="3 3" />
              <XAxis dataKey="timeLabel" stroke="#9BB0A3" fontSize={11} />
              <YAxis yAxisId="left" stroke="#A3E6B8" fontSize={11} />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#D4DE95"
                fontSize={11}
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
              <Area
                yAxisId="left"
                type="monotone"
                dataKey={selectedParam}
                name={`${PARAM_CONFIG[selectedParam].label} (${PARAM_CONFIG[selectedParam].unit})`}
                stroke="#A3E6B8"
                strokeWidth={2.2}
                fill="url(#primaryParamGrad)"
                isAnimationActive={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey={secondaryParam}
                name={`${PARAM_CONFIG[secondaryParam].label} (${PARAM_CONFIG[secondaryParam].unit})`}
                stroke="#D4DE95"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stratigraphic Prognosis Table for Active Well */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#F2F6F0]">
            Active Well Stratigraphic Column & Pore/Fracture Gradient Prognosis
          </h3>
          <button
            onClick={() => setActiveRoute('depth-correlation')}
            className="text-xs text-[#A3E6B8] font-semibold hover:underline"
          >
            Compare with Offset Tops →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#2B4337] text-[#9BB0A3] font-mono text-[11px]">
                <th className="py-2.5 px-3">Formation</th>
                <th className="py-2.5 px-3">Interval (MD)</th>
                <th className="py-2.5 px-3">Interval (TVD)</th>
                <th className="py-2.5 px-3">Lithology</th>
                <th className="py-2.5 px-3 text-right">Pore Press.</th>
                <th className="py-2.5 px-3 text-right">Frac Grad.</th>
                <th className="py-2.5 px-3">Offset Risk Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B4337]">
              {activeWell.formations.map((f) => {
                const isCurrent = f.name === activeWell.currentFormation;
                return (
                  <tr
                    key={f.code}
                    className={
                      isCurrent ? 'bg-[#A3E6B8]/12 font-medium' : 'hover:bg-[#162920]'
                    }
                  >
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: f.color }}
                      />
                      <span className="text-[#F2F6F0]">{f.name}</span>
                      {isCurrent && (
                        <span className="font-mono text-[10px] text-[#A3E6B8] font-bold ml-1">
                          [CURRENT BIT]
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-[#F2F6F0]">
                      {f.topMD} – {f.bottomMD} m
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-[#9BB0A3]">
                      {f.topTVD} – {f.bottomTVD} m
                    </td>
                    <td className="py-2.5 px-3 text-[#9BB0A3]">{f.lithology}</td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-right text-[#FBBF24] font-semibold">
                      {f.porePressureSG.toFixed(2)} SG
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-right text-[#4ADE80] font-semibold">
                      {f.fractureGradientSG.toFixed(2)} SG
                    </td>
                    <td className="py-2.5 px-3 text-[#9BB0A3]">{f.riskSummary}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
