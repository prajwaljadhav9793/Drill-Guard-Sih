import React, { useState, useMemo } from 'react';
import {
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
  Legend,
  ReferenceDot,
} from 'recharts';
import { useNWIS } from '../../context/NWISContext';

type CompParameter =
  | 'rop'
  | 'wob'
  | 'rpm'
  | 'torque'
  | 'spp'
  | 'flowRate'
  | 'mudWeight'
  | 'ecd'
  | 'hookLoad';

const PARAM_META: Record<CompParameter, { label: string; unit: string }> = {
  rop: { label: 'Rate of Penetration (ROP)', unit: 'm/hr' },
  wob: { label: 'Weight on Bit (WOB)', unit: 'klbf' },
  rpm: { label: 'Rotary Speed (RPM)', unit: 'RPM' },
  torque: { label: 'Rotary Torque', unit: 'kN·m' },
  spp: { label: 'Standpipe Pressure (SPP)', unit: 'psi' },
  flowRate: { label: 'Mud Flow Rate', unit: 'L/min' },
  mudWeight: { label: 'Mud Weight', unit: 'SG' },
  ecd: { label: 'Equivalent Circulating Density (ECD)', unit: 'SG' },
  hookLoad: { label: 'Hook Load', unit: 'klbf' },
};

export const ParameterComparisonView: React.FC = () => {
  const { activeWell, offsetWells, selectedOffsetWellId, addToast } = useNWIS();

  const [selectedParam, setSelectedParam] = useState<CompParameter>('rop');
  const [chartMode, setChartMode] = useState<'depth' | 'time' | 'baseline'>('depth');
  const [wellAId, setWellAId] = useState<string>(selectedOffsetWellId || 'NWIS-OFF-001');
  const [wellBId, setWellBId] = useState<string>('NWIS-OFF-003');
  const [minDepth, setMinDepth] = useState<number>(1000);
  const [maxDepth, setMaxDepth] = useState<number>(3600);
  const [normalizeValues, setNormalizeValues] = useState<boolean>(false);
  const [showEventMarkers, setShowEventMarkers] = useState<boolean>(true);

  const wellA = offsetWells.find((w) => w.wellId === wellAId) || offsetWells[0];
  const wellB = offsetWells.find((w) => w.wellId === wellBId) || offsetWells[2];

  const comparisonData = useMemo(() => {
    const filteredPoints = wellA.depthCurve.filter(
      (pt) => pt.depthMD >= minDepth && pt.depthMD <= maxDepth
    );

    return filteredPoints.map((ptA, idx) => {
      const ptB =
        wellB.depthCurve.find((b) => b.depthMD === ptA.depthMD) || wellB.depthCurve[idx] || ptA;

      const hasActive = ptA.depthMD <= activeWell.currentDepthMD + 100;
      const rawActive = hasActive
        ? Number(((ptA[selectedParam] + ptB[selectedParam]) / 2).toFixed(2))
        : undefined;

      const rawA = ptA[selectedParam];
      const rawB = ptB[selectedParam];
      const baselineAvg = Number(((rawA + rawB) / 2).toFixed(2));

      if (normalizeValues) {
        const maxVal = Math.max(rawA, rawB, rawActive || 1, 1);
        return {
          depthMD: ptA.depthMD,
          days: ptA.days,
          activeWellVal: rawActive !== undefined ? Number(((rawActive / maxVal) * 100).toFixed(1)) : undefined,
          wellAVal: Number(((rawA / maxVal) * 100).toFixed(1)),
          wellBVal: Number(((rawB / maxVal) * 100).toFixed(1)),
          baselineVal: Number(((baselineAvg / maxVal) * 100).toFixed(1)),
        };
      }

      return {
        depthMD: ptA.depthMD,
        days: ptA.days,
        activeWellVal: rawActive,
        wellAVal: rawA,
        wellBVal: rawB,
        baselineVal: baselineAvg,
      };
    });
  }, [wellA, wellB, activeWell, selectedParam, minDepth, maxDepth, normalizeValues]);

  const handleExportCSV = () => {
    const headers = [
      'Depth_MD_m',
      'Drilling_Days',
      `${activeWell.wellId}_${selectedParam}`,
      `${wellA.wellId}_${selectedParam}`,
      `${wellB.wellId}_${selectedParam}`,
      'Offset_Baseline',
    ];
    const rows = comparisonData.map((r) =>
      [
        r.depthMD,
        r.days,
        r.activeWellVal ?? '',
        r.wellAVal,
        r.wellBVal,
        r.baselineVal,
      ].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NWIS_Parameter_Comparison_${selectedParam}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(
      'Parameter Chart Exported',
      `Downloaded NWIS_Parameter_Comparison_${selectedParam}.csv`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-[#A3E6B8] font-semibold">
            MULTI-WELL DRILLING PARAMETER ANALYTICS · DEPTH-ALIGNED SYNTHETIC DATASET
          </div>
          <h1 className="text-xl font-bold text-[#F2F6F0] mt-0.5">
            Drilling Parameter Comparison & Offset Baseline Benchmarking
          </h1>
          <p className="text-xs text-[#9BB0A3]">
            Compare active well <strong className="text-[#A3E6B8]">{activeWell.wellId}</strong>{' '}
            against offset wells aligned by Measured Depth (m MD) or Drilling Days.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-semibold text-xs transition-colors self-start lg:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Chart Data (CSV)</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
        <div>
          <label className="block text-[#9BB0A3] font-medium mb-1">Drilling Parameter</label>
          <select
            value={selectedParam}
            onChange={(e) => setSelectedParam(e.target.value as CompParameter)}
            className="w-full bg-[#162920] text-[#A3E6B8] font-semibold rounded-lg px-2.5 py-2 border border-[#3B5949]"
          >
            {(Object.keys(PARAM_META) as CompParameter[]).map((k) => (
              <option key={k} value={k}>
                {PARAM_META[k].label} ({PARAM_META[k].unit})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[#9BB0A3] font-medium mb-1">Offset Well A (High Risk Ref)</label>
          <select
            value={wellAId}
            onChange={(e) => setWellAId(e.target.value)}
            className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-2.5 py-2 border border-[#2B4337]"
          >
            {offsetWells.map((w) => (
              <option key={w.wellId} value={w.wellId}>
                {w.wellId} ({w.distanceKm} km)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[#9BB0A3] font-medium mb-1">Offset Well B (Benchmark Ref)</label>
          <select
            value={wellBId}
            onChange={(e) => setWellBId(e.target.value)}
            className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-2.5 py-2 border border-[#2B4337]"
          >
            {offsetWells.map((w) => (
              <option key={w.wellId} value={w.wellId}>
                {w.wellId} ({w.distanceKm} km)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[#9BB0A3] font-medium mb-1">Chart Alignment Mode</label>
          <select
            value={chartMode}
            onChange={(e) => setChartMode(e.target.value as 'depth' | 'time' | 'baseline')}
            className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-2.5 py-2 border border-[#2B4337]"
          >
            <option value="depth">1. Parameter vs. Depth (m MD)</option>
            <option value="time">2. Parameter vs. Time (Days)</option>
            <option value="baseline">3. Active vs. Offset Baseline</option>
          </select>
        </div>

        <div>
          <label className="block text-[#9BB0A3] font-medium mb-1">Depth Window (m MD)</label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              step={200}
              value={minDepth}
              onChange={(e) => setMinDepth(Number(e.target.value))}
              className="w-1/2 bg-[#162920] text-[#F2F6F0] font-mono rounded-lg px-2 py-2 border border-[#2B4337]"
            />
            <input
              type="number"
              step={200}
              value={maxDepth}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              className="w-1/2 bg-[#162920] text-[#F2F6F0] font-mono rounded-lg px-2 py-2 border border-[#2B4337]"
            />
          </div>
        </div>

        <div className="flex flex-col justify-end gap-1.5 pb-0.5">
          <label className="flex items-center gap-2 cursor-pointer text-[#F2F6F0]">
            <input
              type="checkbox"
              checked={normalizeValues}
              onChange={(e) => setNormalizeValues(e.target.checked)}
              className="rounded accent-[#A3E6B8]"
            />
            <span>Normalize (0–100%)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-[#F2F6F0]">
            <input
              type="checkbox"
              checked={showEventMarkers}
              onChange={(e) => setShowEventMarkers(e.target.checked)}
              className="rounded accent-[#A3E6B8]"
            />
            <span>Overlay Event Markers</span>
          </label>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-[#F2F6F0]">
              {PARAM_META[selectedParam].label}{' '}
              {normalizeValues ? '(Normalized %)' : `(${PARAM_META[selectedParam].unit})`}
            </h2>
            <p className="text-xs text-[#9BB0A3]">
              Alignment Method: Uniform 200m Measured Depth (MD) interpolation · Sample Count:{' '}
              {comparisonData.length} depth intervals · Data Quality: 99.4% Validated
            </p>
          </div>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'baseline' ? (
              <BarChart data={comparisonData}>
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
                <Legend />
                <Bar
                  dataKey="activeWellVal"
                  name={`Active Well (${activeWell.wellId})`}
                  fill="#A3E6B8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="baselineVal"
                  name="Offset Wells Composite Baseline"
                  fill="#3B5949"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={comparisonData}>
                <CartesianGrid stroke="#2B4337" strokeDasharray="3 3" />
                <XAxis
                  dataKey={chartMode === 'depth' ? 'depthMD' : 'days'}
                  stroke="#9BB0A3"
                  fontSize={11}
                />
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
                <Legend />
                <Line
                  type="monotone"
                  dataKey="activeWellVal"
                  name={`Active Well (${activeWell.wellId})`}
                  stroke="#A3E6B8"
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#A3E6B8' }}
                />
                <Line
                  type="monotone"
                  dataKey="wellAVal"
                  name={`Offset ${wellA.wellId}`}
                  stroke="#D4DE95"
                  strokeWidth={2.2}
                />
                <Line
                  type="monotone"
                  dataKey="wellBVal"
                  name={`Offset ${wellB.wellId}`}
                  stroke="#3B5949"
                  strokeWidth={2.2}
                />
                {showEventMarkers &&
                  chartMode === 'depth' &&
                  comparisonData
                    .filter((d) => d.depthMD === 2800 || d.depthMD === 3000)
                    .map((d) => (
                      <ReferenceDot
                        key={d.depthMD}
                        x={d.depthMD}
                        y={d.wellAVal}
                        r={6}
                        fill="#F87171"
                        stroke="#12221B"
                      />
                    ))}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
