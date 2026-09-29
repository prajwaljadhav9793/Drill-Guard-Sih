import React, { useState, useMemo } from 'react';
import {
  Search,
  Database,
  AlertTriangle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { useNWIS } from '../../context/NWISContext';

const SAMPLE_NL_QUERIES = [
  'Show offset wells within 5 km that experienced mud losses.',
  'Find stuck pipe incidents in the same formation.',
  'Which nearby wells encountered high torque between 2,500 and 3,000 m?',
  'Show cementing issues and the mitigation measures used.',
  'Find historical wells with similar drilling parameters.',
  'Which documents discuss instability in the current formation?',
  "Show verified events within 100 m of the active well's current depth.",
];

export const AISearchView: React.FC = () => {
  const {
    activeWell,
    offsetWells,
    events,
    documents,
    navigateToWellProfile,
    setInspectedEvent,
    setInspectedDocument,
  } = useNWIS();

  const [query, setQuery] = useState(
    "Show verified events within 100 m of the active well's current depth."
  );
  const [minDepth, setMinDepth] = useState<number>(0);
  const [maxDepth, setMaxDepth] = useState<number>(4100);
  const [formationFilter, setFormationFilter] = useState<string>('All');
  const [verificationOnly, setVerificationOnly] = useState<boolean>(false);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    const isWithin5km = q.includes('5 km') || q.includes('5km');
    const isNearCurrentDepth =
      q.includes('100 m') || q.includes('current depth') || q.includes('this depth');
    const isMudLoss = q.includes('mud loss') || q.includes('losses');
    const isStuckPipe = q.includes('stuck pipe') || q.includes('pack-off');
    const isTorque = q.includes('torque');
    const isCementing = q.includes('cement');
    const isInstability = q.includes('instability') || q.includes('collapse') || q.includes('cavings');
    const isRange2500to3000 = q.includes('2,500') || q.includes('2500');

    const matchedEvents = events.filter((e) => {
      if (e.depthMD < minDepth || e.depthMD > maxDepth) return false;
      if (formationFilter !== 'All' && e.formation !== formationFilter) return false;
      if (verificationOnly && e.verificationStatus !== 'Verified') return false;

      if (isWithin5km) {
        const w = offsetWells.find((ow) => ow.wellId === e.wellId);
        if (w && w.distanceKm > 5) return false;
      }
      if (isNearCurrentDepth && Math.abs(e.depthMD - activeWell.currentDepthMD) > 100) {
        return false;
      }
      if (isRange2500to3000 && (e.depthMD < 2500 || e.depthMD > 3000)) {
        return false;
      }
      if (isMudLoss && e.eventType !== 'Mud Loss') return false;
      if (isStuckPipe && e.eventType !== 'Stuck Pipe') return false;
      if (isTorque && e.eventType !== 'Torque Spike') return false;
      if (isCementing && e.eventType !== 'Cementing Issue') return false;
      if (
        isInstability &&
        e.eventType !== 'Wellbore Instability' &&
        e.eventType !== 'Fishing' &&
        e.eventType !== 'Stuck Pipe'
      ) {
        return false;
      }

      if (
        !isWithin5km &&
        !isNearCurrentDepth &&
        !isMudLoss &&
        !isStuckPipe &&
        !isTorque &&
        !isCementing &&
        !isInstability &&
        !isRange2500to3000 &&
        q.length > 0
      ) {
        return (
          e.eventType.toLowerCase().includes(q) ||
          e.formation.toLowerCase().includes(q) ||
          e.wellId.toLowerCase().includes(q) ||
          e.symptoms.toLowerCase().includes(q) ||
          e.mitigation.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const matchedWells = offsetWells.filter((w) => {
      if (isWithin5km && w.distanceKm > 5) return false;
      const hasMatchingEvent = matchedEvents.some((e) => e.wellId === w.wellId);
      if (
        isMudLoss ||
        isStuckPipe ||
        isTorque ||
        isCementing ||
        isInstability ||
        isNearCurrentDepth
      ) {
        return hasMatchingEvent;
      }
      if (q.length > 0 && !q.includes('similar drilling parameters')) {
        return (
          hasMatchingEvent ||
          w.wellId.toLowerCase().includes(q) ||
          w.wellName.toLowerCase().includes(q) ||
          w.summary.toLowerCase().includes(q)
        );
      }
      return true;
    });

    const matchedDocs = documents.filter((d) => {
      if (formationFilter !== 'All' && d.formation !== formationFilter) return false;
      if (verificationOnly && d.verificationStatus !== 'Verified') return false;
      if (isCementing) return d.category.includes('Cementing') || d.contentPreview.toLowerCase().includes('cement');
      if (isInstability)
        return (
          d.contentPreview.toLowerCase().includes('shale') ||
          d.contentPreview.toLowerCase().includes('cavings') ||
          d.contentPreview.toLowerCase().includes('collapse')
        );
      const linkedToEvent = matchedEvents.some((e) => e.sourceDocId === d.docId);
      return (
        linkedToEvent ||
        d.title.toLowerCase().includes(q) ||
        d.contentPreview.toLowerCase().includes(q)
      );
    });

    return { wells: matchedWells, events: matchedEvents, docs: matchedDocs };
  }, [
    query,
    minDepth,
    maxDepth,
    formationFilter,
    verificationOnly,
    events,
    offsetWells,
    documents,
    activeWell.currentDepthMD,
  ]);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="p-6 rounded-2xl bg-[#12221B] border border-[#3B5949] shadow-2xs space-y-4">
        <div>
          <div className="text-xs font-mono text-[#A3E6B8] font-semibold">
            STRUCTURED & NATURAL-LANGUAGE KNOWLEDGE RETRIEVAL ENGINE
          </div>
          <h1 className="text-xl font-bold text-[#F2F6F0] mt-0.5">
            AI Search & Offset Knowledge Retrieval
          </h1>
          <p className="text-xs text-[#9BB0A3]">
            Query across synthetic offset wells, depth-indexed operational events, and verified
            drilling reports with full source traceability.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A3E6B8] absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a natural-language query or enter keywords (e.g. Mud loss within 5 km)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#162920] border border-[#3B5949] text-sm text-[#F2F6F0] placeholder-[#6E887B] focus:outline-none focus:border-[#A3E6B8]"
            />
          </div>
          <button
            onClick={() => {
              setQuery('');
              setMinDepth(0);
              setMaxDepth(4100);
              setFormationFilter('All');
              setVerificationOnly(false);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#162920] hover:bg-[#1E352B] text-xs font-medium text-[#9BB0A3] hover:text-[#F2F6F0] border border-[#2B4337] flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Suggested Natural-Language Queries */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono uppercase text-[#9BB0A3]">
            Suggested Natural-Language Engineering Queries:
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_NL_QUERIES.map((sq) => (
              <button
                key={sq}
                onClick={() => setQuery(sq)}
                className={`px-3 py-1.5 rounded-lg text-xs text-left transition-colors border ${
                  query === sq
                    ? 'bg-[#A3E6B8] text-[#0E1914] border-[#A3E6B8] font-semibold'
                    : 'bg-[#162920] text-[#9BB0A3] hover:text-[#F2F6F0] border-[#2B4337] hover:border-[#3B5949]'
                }`}
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Structured Depth & Formation Refinements */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-[#2B4337] text-xs">
          <div>
            <label className="block text-[#9BB0A3] font-medium mb-1">Min Depth (m MD)</label>
            <input
              type="number"
              value={minDepth}
              onChange={(e) => setMinDepth(Number(e.target.value))}
              className="w-full bg-[#162920] text-[#F2F6F0] font-mono rounded-lg px-3 py-1.5 border border-[#2B4337]"
            />
          </div>
          <div>
            <label className="block text-[#9BB0A3] font-medium mb-1">Max Depth (m MD)</label>
            <input
              type="number"
              value={maxDepth}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              className="w-full bg-[#162920] text-[#F2F6F0] font-mono rounded-lg px-3 py-1.5 border border-[#2B4337]"
            />
          </div>
          <div>
            <label className="block text-[#9BB0A3] font-medium mb-1">Formation Filter</label>
            <select
              value={formationFilter}
              onChange={(e) => setFormationFilter(e.target.value)}
              className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-1.5 border border-[#2B4337]"
            >
              <option value="All">All Formations</option>
              <option value="Namsang Claystone Formation">Namsang Claystone Formation</option>
              <option value="Tipam Sandstone Formation">Tipam Sandstone Formation</option>
              <option value="Girujan Clay — Transition Shale">Girujan Clay — Transition Shale</option>
              <option value="Barail Sandstone Reservoir">Barail Sandstone Reservoir</option>
            </select>
          </div>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#F2F6F0] font-medium">
              <input
                type="checkbox"
                checked={verificationOnly}
                onChange={(e) => setVerificationOnly(e.target.checked)}
                className="rounded border-[#3B5949] accent-[#A3E6B8]"
              />
              <span>Verified Records Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results Grid: Wells, Events, Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Matched Offset Well Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-[#F2F6F0] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#A3E6B8]" />
              <span>Matching Offset Wells ({searchResults.wells.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {searchResults.wells.map((w) => (
              <div
                key={w.wellId}
                onClick={() => navigateToWellProfile(w.wellId)}
                className="p-4 rounded-2xl bg-[#12221B] hover:bg-[#162920] border border-[#2B4337] hover:border-[#3B5949] shadow-2xs cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-[#A3E6B8]">
                    {w.wellId} ({w.wellName})
                  </span>
                  <span className="text-[#F2F6F0] font-medium">{w.distanceKm} km away</span>
                </div>
                <div className="text-xs text-[#9BB0A3] leading-relaxed">{w.summary}</div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#9BB0A3] pt-2 border-t border-[#2B4337]">
                  <span>TD: {w.totalDepthMD} m MD</span>
                  <span className="text-[#F2F6F0] font-semibold">NPT: {w.nptHours} hrs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Matched Historical Event Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-[#F2F6F0] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#FBBF24]" />
              <span>Matching Drilling Events ({searchResults.events.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {searchResults.events.map((evt) => (
              <div
                key={evt.eventId}
                onClick={() => setInspectedEvent(evt)}
                className="p-4 rounded-2xl bg-[#12221B] hover:bg-[#162920] border border-[#2B4337] hover:border-[#3B5949] shadow-2xs cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-[#F2F6F0]">
                    {evt.eventId} · {evt.eventType}
                  </span>
                  <span className="text-[#A3E6B8] font-semibold">
                    {evt.wellId} @ {evt.depthMD} m
                  </span>
                </div>
                <div className="text-xs text-[#F2F6F0] font-medium">{evt.formation}</div>
                <p className="text-xs text-[#9BB0A3] line-clamp-2">{evt.symptoms}</p>
                <div className="text-[11px] text-[#4ADE80] font-medium line-clamp-2">
                  Mitigation: {evt.mitigation}
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-[#9BB0A3] pt-2 border-t border-[#2B4337]">
                  <span>Source: {evt.sourceDocId}</span>
                  <span className="text-[#4ADE80] font-semibold">{evt.verificationStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Matched Source Document Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-[#F2F6F0] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#4ADE80]" />
              <span>Matching Source Reports ({searchResults.docs.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {searchResults.docs.map((doc) => (
              <div
                key={doc.docId}
                onClick={() => setInspectedDocument(doc)}
                className="p-4 rounded-2xl bg-[#12221B] hover:bg-[#162920] border border-[#2B4337] hover:border-[#3B5949] shadow-2xs cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-bold text-[#A3E6B8]">{doc.docId}</span>
                  <span className="text-[#9BB0A3]">Well {doc.wellId}</span>
                </div>
                <div className="text-xs font-semibold text-[#F2F6F0]">{doc.title}</div>
                <div className="text-[11px] text-[#9BB0A3]">
                  {doc.category} · {doc.formation}
                </div>
                <div className="text-[11px] text-[#4ADE80] font-medium line-clamp-2">
                  Extracted: {doc.extractedData.mitigationSummary}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
