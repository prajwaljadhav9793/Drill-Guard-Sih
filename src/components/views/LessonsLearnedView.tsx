import React, { useState, useMemo } from 'react';
import {
  Search,
  FileText,
  GitCompare,
} from 'lucide-react';
import { useNWIS } from '../../context/NWISContext';

export const LessonsLearnedView: React.FC = () => {
  const { lessons, navigateToWellProfile, navigateToDocById } = useNWIS();

  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeTab, setOutcomeTab] = useState<
    'All' | 'Documented Successful' | 'Documented Unsuccessful' | 'Unverified Observation'
  >('All');
  const [formationFilter, setFormationFilter] = useState<string>('All');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('All');
  const [showCompareMatrix, setShowCompareMatrix] = useState<boolean>(false);

  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      if (
        searchQuery.trim() &&
        !l.challenge.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !l.historicalResponse.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !l.lessonId.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (outcomeTab !== 'All' && l.outcomeCategory !== outcomeTab) return false;
      if (formationFilter !== 'All' && l.formation !== formationFilter) return false;
      if (eventTypeFilter !== 'All' && l.eventType !== eventTypeFilter) return false;
      return true;
    });
  }, [lessons, searchQuery, outcomeTab, formationFilter, eventTypeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-[#A3E6B8] font-semibold">
            POST-WELL EMPIRICAL KNOWLEDGE BASE · SYNTHETIC DEMO DATASET
          </div>
          <h1 className="text-xl font-bold text-[#F2F6F0] mt-0.5">
            Historical Mitigation & Lessons Learned Library
          </h1>
          <p className="text-xs text-[#9BB0A3]">
            Distinguishes documented successful mitigations, unsuccessful attempts, and unverified
            observations with explicit geological applicability constraints.
          </p>
        </div>

        <button
          onClick={() => setShowCompareMatrix(!showCompareMatrix)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-semibold text-xs transition-colors self-start lg:self-auto"
        >
          <GitCompare className="w-4 h-4" />
          <span>
            {showCompareMatrix
              ? 'Hide Historical Response Comparison'
              : 'Compare Historical Responses'}
          </span>
        </button>
      </div>

      {/* Compare Historical Responses Feature Matrix */}
      {showCompareMatrix && (
        <div className="p-5 rounded-2xl bg-[#A3E6B8]/12 border border-[#A3E6B8] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#F2F6F0]">
              Comparative Response Analysis — Tipam Sandstone Fractured Interval (2,860–2,920 m MD, Upper Assam)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#12221B] border border-[#F87171]/40 space-y-2">
              <div className="font-mono text-[#F87171] font-bold">
                REACTIVE / UNSUCCESSFUL BASELINE (Duliajan-East-101 & Kathaloni-106)
              </div>
              <p className="text-[#F2F6F0]">
                <strong>Action:</strong> Drilled into 2,875 m MD fractures with unbridged WBM at
                1,820 L/min (1.28 SG ECD) and attempted 1.58 SG single-stage primary cementing.
              </p>
              <p className="text-[#9BB0A3]">
                <strong>Outcome:</strong> 42 bbl sudden mud loss (38 hrs NPT), 18 bbl cement slurry
                loss, and required remedial perforation squeeze.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#12221B] border border-[#4ADE80]/40 space-y-2">
              <div className="font-mono text-[#4ADE80] font-bold">
                PROACTIVE / SUCCESSFUL RESPONSE (Tengakhat-103 & Naharkatiya-South-109)
              </div>
              <p className="text-[#F2F6F0]">
                <strong>Action:</strong> Pre-treated mud with 15–25 ppb sized CaCO3 prior to 2,850 m
                MD, capped pump flow rate at 1,620 L/min (ECD &lt;= 1.24 SG), and used 1.48 SG
                hollow-microsphere cement lead.
              </p>
              <p className="text-[#9BB0A3]">
                <strong>Outcome:</strong> Seepage sealed in 45 mins (&lt;14 bbl lost, 2.5 hrs NPT)
                and 100% primary cementing returns.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Outcome Category Tabs & Filters */}
      <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              'All',
              'Documented Successful',
              'Documented Unsuccessful',
              'Unverified Observation',
            ] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setOutcomeTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                outcomeTab === tab
                  ? 'bg-[#A3E6B8] text-[#0E1914]'
                  : 'bg-[#162920] text-[#9BB0A3] hover:text-[#F2F6F0] border border-[#2B4337]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#2B4337]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9BB0A3] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search challenges, causes, or responses..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#162920] border border-[#2B4337] text-xs text-[#F2F6F0]"
            />
          </div>

          <select
            value={formationFilter}
            onChange={(e) => setFormationFilter(e.target.value)}
            className="bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-1.5 border border-[#2B4337]"
          >
            <option value="All">All Formations</option>
            <option value="Namsang Claystone Formation">Namsang Claystone Formation</option>
            <option value="Tipam Sandstone Formation">Tipam Sandstone Formation</option>
            <option value="Girujan Clay — Transition Shale">Girujan Clay — Transition Shale</option>
            <option value="Barail Sandstone Reservoir">Barail Sandstone Reservoir</option>
          </select>

          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-1.5 border border-[#2B4337]"
          >
            <option value="All">All Event Types</option>
            <option value="Mud Loss">Mud Loss</option>
            <option value="Stuck Pipe">Stuck Pipe</option>
            <option value="Kick / Influx">Kick / Influx</option>
            <option value="Cementing Issue">Cementing Issue</option>
            <option value="Fishing">Fishing</option>
            <option value="Wellbore Instability">Wellbore Instability</option>
          </select>
        </div>
      </div>

      {/* Lessons Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredLessons.map((lsn) => (
          <div
            key={lsn.lessonId}
            className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col justify-between space-y-3.5"
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
                <span className="text-[#A3E6B8] font-bold">
                  {lsn.lessonId} · Well {lsn.sourceWellId} · {lsn.depthMD} m MD
                </span>
                <span
                  className={
                    lsn.outcomeCategory === 'Documented Successful'
                      ? 'text-[#4ADE80] font-semibold'
                      : lsn.outcomeCategory === 'Documented Unsuccessful'
                      ? 'text-[#F87171] font-semibold'
                      : 'text-[#FBBF24] font-semibold'
                  }
                >
                  {lsn.outcomeCategory}
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#F2F6F0]">
                {lsn.eventType} in {lsn.formation}
              </h3>

              <div className="text-xs text-[#9BB0A3]">
                <strong className="text-[#F2F6F0]">Observed Challenge:</strong> {lsn.challenge}
              </div>

              <div className="text-xs text-[#9BB0A3]">
                <strong className="text-[#F2F6F0]">Documented Cause:</strong> {lsn.documentedCause}
              </div>

              <div className="p-3 rounded-xl bg-[#A3E6B8]/12 border border-[#3B5949] text-xs text-[#F2F6F0]">
                <strong className="text-[#F2F6F0]">Historical Response:</strong> {lsn.historicalResponse}
              </div>

              <div className="text-xs text-[#F2F6F0]">
                <strong>Recorded Outcome:</strong> {lsn.recordedOutcome}
              </div>

              <div className="p-2.5 rounded-lg bg-[#162920] border border-[#2B4337] text-[11px] text-[#9BB0A3]">
                <strong className="text-[#FBBF24]">Applicability & Geological Limitations:</strong>{' '}
                {lsn.applicabilityLimitations}
              </div>
            </div>

            <div className="pt-3 border-t border-[#2B4337] flex items-center justify-between text-xs font-mono">
              <button
                onClick={() => navigateToDocById(lsn.supportingDocId)}
                className="text-[#A3E6B8] font-semibold hover:underline flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Source Report: {lsn.supportingDocId}</span>
              </button>

              <button
                onClick={() => navigateToWellProfile(lsn.sourceWellId)}
                className="text-[#F2F6F0] font-semibold hover:underline"
              >
                Inspect {lsn.sourceWellId} →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
