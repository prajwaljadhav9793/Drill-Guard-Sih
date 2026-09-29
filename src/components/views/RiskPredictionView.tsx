import React, { useState } from 'react';
import {
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useNWIS } from '../../context/NWISContext';

export const RiskPredictionView: React.FC = () => {
  const {
    activeWell,
    riskAssessments,
    navigateToWellProfile,
    setActiveRoute,
    askAIAbout,
  } = useNWIS();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    riskAssessments[0]?.category || 'Mud Loss'
  );
  const [showMlArchitecture, setShowMlArchitecture] = useState<boolean>(false);

  const focusedRisk =
    riskAssessments.find((r) => r.category === selectedCategory) || riskAssessments[0];

  const formationRiskChart = [
    { formation: 'Fmt A (Sands)', riskScore: 24 },
    { formation: 'Fmt B (Claystone)', riskScore: 52 },
    { formation: 'Fmt C (Current)', riskScore: 84 },
    { formation: 'Fmt D (Transition)', riskScore: 78 },
    { formation: 'Fmt E (Reservoir)', riskScore: 59 },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Advisory Disclaimer */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-[#A3E6B8] font-semibold">
            EXPLAINABLE RULE-BASED ADVISORY ENGINE · NOT A BLACK-BOX ML CONTROL SYSTEM
          </div>
          <h1 className="text-xl font-bold text-[#F2F6F0] mt-0.5">
            Drilling Risk Prediction & Evidence Correlation ({activeWell.wellId})
          </h1>
          <p className="text-xs text-[#9BB0A3]">
            Advisory prototype indicators derived from explicit offset-well proximity rules and
            simulated telemetry thresholds. Must be reviewed by qualified engineers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowMlArchitecture(!showMlArchitecture)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#A3E6B8]/12 hover:bg-[#D4DE95] text-xs font-semibold text-[#F2F6F0] border border-[#3B5949] transition-colors"
          >
            <Cpu className="w-4 h-4 text-[#A3E6B8]" />
            <span>
              {showMlArchitecture
                ? 'Hide Sample ML Architecture'
                : 'Explore Sample ML Integration Architecture'}
            </span>
          </button>
          <button
            onClick={() => setActiveRoute('settings')}
            className="px-3.5 py-2 rounded-xl bg-[#162920] hover:bg-[#1E352B] text-xs text-[#F2F6F0] border border-[#2B4337]"
          >
            Configure Rule Thresholds
          </button>
        </div>
      </div>

      {/* Optional Sample ML Integration Architecture Blueprint */}
      {showMlArchitecture && (
        <div className="p-5 rounded-2xl bg-[#A3E6B8]/12 border border-[#A3E6B8] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F2F6F0]">
              Sample Production ML Integration Architecture (Reference Blueprint)
            </h3>
            <span className="text-[11px] font-mono text-[#A3E6B8] font-semibold">
              NOTE: Current Demo Uses Deterministic Rules Below
            </span>
          </div>
          <p className="text-xs text-[#F2F6F0] leading-relaxed">
            In this prototype, risk scores are computed transparently using deterministic engineering
            rules (e.g. offset event depth proximity &lt; 35 m and torque/ECD threshold comparison).
            In a future Phase-2 deployment with Oil India Limited historical archives, the rule
            engine can be augmented with:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-[#12221B] border border-[#3B5949]">
              <div className="font-mono font-bold text-[#A3E6B8]">1. Feature Store</div>
              <p className="text-[#9BB0A3] mt-1">
                1 Hz WITSML surface + PWD logs aligned with offset gamma-ray/sonic curves.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#12221B] border border-[#3B5949]">
              <div className="font-mono font-bold text-[#4ADE80]">2. Anomaly Detection</div>
              <p className="text-[#9BB0A3] mt-1">
                Gradient-boosted trees / LSTM sequence monitor on torque, drag, and pit-volume delta.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#12221B] border border-[#3B5949]">
              <div className="font-mono font-bold text-[#FBBF24]">3. SHAP Explainability</div>
              <p className="text-[#9BB0A3] mt-1">
                Every flag surfaces top contributing channels and matching offset DDR paragraphs.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-[#12221B] border border-[#3B5949]">
              <div className="font-mono font-bold text-[#F2F6F0]">4. Engineer Sign-Off</div>
              <p className="text-[#9BB0A3] mt-1">
                Advisory-only output; never executes automated rig control or setpoint changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 8 Risk Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {riskAssessments.map((r) => {
          const isSelected = r.category === focusedRisk.category;
          const badgeColor =
            r.status === 'High Watch'
              ? 'text-[#F87171]'
              : r.status === 'Elevated'
              ? 'text-[#FBBF24]'
              : 'text-[#4ADE80]';
          return (
            <div
              key={r.category}
              onClick={() => setSelectedCategory(r.category)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                isSelected
                  ? 'bg-[#A3E6B8]/12 border-[#A3E6B8] shadow-xs'
                  : 'bg-[#12221B] border-[#2B4337] hover:border-[#3B5949] shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#F2F6F0]">{r.category}</span>
                <span className={`font-mono text-xs font-semibold ${badgeColor}`}>
                  {r.status}
                </span>
              </div>

              <div className="flex items-baseline justify-between font-mono">
                <span className="text-2xl font-bold text-[#A3E6B8] tabular-nums">
                  {r.score}
                  <span className="text-xs font-normal text-[#9BB0A3]"> / 100</span>
                </span>
                <span className="text-[11px] text-[#9BB0A3]">
                  {r.historicalEventCount} Offset Evts
                </span>
              </div>

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

              <div className="text-[11px] font-mono text-[#A3E6B8] font-medium truncate">
                Window: {r.relevantDepthInterval}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Rule Inspector & Formation Risk Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#2B4337]">
            <div>
              <div className="text-xs font-mono text-[#A3E6B8] font-semibold">
                EXPLAINABLE RULE & EVIDENCE INSPECTOR
              </div>
              <h2 className="text-lg font-bold text-[#F2F6F0]">
                {focusedRisk.category} — {focusedRisk.status} (Index {focusedRisk.score}/100)
              </h2>
            </div>
            <span className="font-mono text-xs text-[#4ADE80] font-semibold">
              Evidence Coverage: {focusedRisk.evidenceCoverage}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#162920] border border-[#3B5949] text-xs font-mono text-[#F2F6F0]">
            {focusedRisk.ruleExplanation}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#F2F6F0] mb-2">
              Contributing Telemetry & Offset Indicators
            </h3>
            <ul className="space-y-1.5 text-xs text-[#9BB0A3]">
              {focusedRisk.contributingIndicators.map((ind, i) => (
                <li
                  key={i}
                  className="p-2.5 rounded-lg bg-[#162920] border border-[#2B4337] flex items-center gap-2 text-[#F2F6F0]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A3E6B8]" />
                  <span>{ind}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#4ADE80] mb-2">
              Recommended Engineering Review Actions (Advisory)
            </h3>
            <ul className="space-y-1.5 text-xs text-[#F2F6F0]">
              {focusedRisk.recommendedReviewActions.map((act, i) => (
                <li
                  key={i}
                  className="p-2.5 rounded-lg bg-[#A3E6B8]/12 border border-[#3B5949] flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9BB0A3]">Supporting Offset Wells:</span>
              {focusedRisk.supportingWells.map((wId) => (
                <button
                  key={wId}
                  onClick={() => navigateToWellProfile(wId)}
                  className="px-2.5 py-1 rounded-lg bg-[#162920] hover:bg-[#A3E6B8]/20 text-xs font-mono font-semibold text-[#A3E6B8] border border-[#3B5949]"
                >
                  {wId}
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                askAIAbout(
                  `Explain the historical evidence behind the ${focusedRisk.category} risk indicator (${focusedRisk.score}/100) at ${activeWell.currentDepthMD.toFixed(0)} m MD.`
                )
              }
              className="px-3.5 py-1.5 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-semibold text-xs transition-colors"
            >
              Ask AI About This Risk
            </button>
          </div>
        </div>

        {/* Right: Risk by Formation & Category Charts (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-4">
          <h3 className="text-sm font-semibold text-[#F2F6F0]">
            Historical Hazard Density by Formation
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formationRiskChart}>
                <CartesianGrid stroke="#2B4337" strokeDasharray="3 3" />
                <XAxis dataKey="formation" stroke="#9BB0A3" fontSize={10} />
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
                <Bar dataKey="riskScore" name="Composite Risk Index" fill="#A3E6B8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 rounded-xl bg-[#162920] border border-[#2B4337] text-xs text-[#9BB0A3] leading-relaxed">
            <strong className="text-[#F2F6F0] block mb-1">
              Engineering Governance Note:
            </strong>
            All risk indicators are advisory decision-support outputs generated from synthetic
            offset records and configurable thresholds. They do not issue automated rig control
            commands.
          </div>
        </div>
      </div>
    </div>
  );
};
