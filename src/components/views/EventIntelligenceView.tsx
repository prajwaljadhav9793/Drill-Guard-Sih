import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  X,
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
import { EventType, SeverityLevel, VerificationStatus } from '../../types/nwis';

const EVENT_TYPES: EventType[] = [
  'Mud Loss',
  'Kick / Influx',
  'Stuck Pipe',
  'Torque Spike',
  'Drag',
  'Wellbore Instability',
  'Fishing',
  'Cementing Issue',
  'Overpressure',
  'Non-Productive Time',
];

export const EventIntelligenceView: React.FC = () => {
  const {
    events,
    offsetWells,
    addEvent,
    setInspectedEvent,
    navigateToDocById,
    navigateToWellProfile,
  } = useNWIS();

  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('All');
  const [formationFilter, setFormationFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [wellFilter, setWellFilter] = useState<string>('All');
  const [compareIds, setCompareIds] = useState<string[]>([]);

  // New Event Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newWellId, setNewWellId] = useState('NWIS-OFF-001');
  const [newDepthMD, setNewDepthMD] = useState(2880);
  const [newFormation] = useState('Tipam Sandstone Formation');
  const [newType, setNewType] = useState<EventType>('Mud Loss');
  const [newSeverity, setNewSeverity] = useState<SeverityLevel>('High');
  const [newSymptoms, setNewSymptoms] = useState('');
  const [newCause, setNewCause] = useState('');
  const [newMitigation, setNewMitigation] = useState('');
  const [newOutcome, setNewOutcome] = useState('');
  const [newNpt] = useState(12);

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (
        searchQuery.trim() &&
        !e.eventId.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.symptoms.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.rootCause.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.mitigation.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (eventTypeFilter !== 'All' && e.eventType !== eventTypeFilter) return false;
      if (formationFilter !== 'All' && e.formation !== formationFilter) return false;
      if (severityFilter !== 'All' && e.severity !== severityFilter) return false;
      if (wellFilter !== 'All' && e.wellId !== wellFilter) return false;
      return true;
    });
  }, [events, searchQuery, eventTypeFilter, formationFilter, severityFilter, wellFilter]);

  // Chart 1: Event Type Distribution
  const eventTypeDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEvents.forEach((e) => {
      counts[e.eventType] = (counts[e.eventType] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [filteredEvents]);

  // Chart 2: Depth Interval Histogram
  const depthHistogram = useMemo(() => {
    const bins = [
      { bin: '1,000–2,000m', min: 1000, max: 2000, count: 0 },
      { bin: '2,000–2,800m', min: 2000, max: 2800, count: 0 },
      { bin: '2,800–3,000m', min: 2800, max: 3000, count: 0 },
      { bin: '3,000–3,300m', min: 3000, max: 3300, count: 0 },
      { bin: '3,300–4,000m', min: 3300, max: 4000, count: 0 },
    ];
    filteredEvents.forEach((e) => {
      const target = bins.find((b) => e.depthMD >= b.min && e.depthMD < b.max);
      if (target) target.count += 1;
    });
    return bins;
  }, [filteredEvents]);

  // Chart 3: Frequency by Formation
  const formationDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredEvents.forEach((e) => {
      const shortName = e.formation.split('—')[0].trim();
      counts[shortName] = (counts[shortName] || 0) + 1;
    });
    return Object.entries(counts).map(([formation, count]) => ({ formation, count }));
  }, [filteredEvents]);

  const toggleCompare = (eventId: string) => {
    setCompareIds((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev.slice(-2), eventId]
    );
  };

  const comparedEvents = events.filter((e) => compareIds.includes(e.eventId));

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymptoms.trim() || !newMitigation.trim()) return;
    const wellObj = offsetWells.find((w) => w.wellId === newWellId);
    addEvent({
      wellId: newWellId,
      wellName: wellObj?.wellName || newWellId,
      depthMD: Number(newDepthMD),
      depthTVD: Math.round(Number(newDepthMD) * 0.978),
      formation: newFormation,
      eventType: newType,
      severity: newSeverity,
      date: new Date().toISOString().slice(0, 10),
      symptoms: newSymptoms,
      rootCause: newCause || 'Under engineering evaluation',
      parametersAtEvent: {
        rop: 16.0,
        wob: 15.0,
        rpm: 125,
        torque: 14.5,
        spp: 2480,
        mudWeight: 1.18,
        ecd: 1.24,
      },
      mitigation: newMitigation,
      outcome: newOutcome || 'Mitigation verified in demo log.',
      nptHours: Number(newNpt),
      sourceDocId: 'DDR-DEMO-014',
      verificationStatus: 'Verified' as VerificationStatus,
    });
    setIsAddOpen(false);
    setNewSymptoms('');
    setNewCause('');
    setNewMitigation('');
    setNewOutcome('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono text-[#A3E6B8] font-semibold">
            OPERATIONAL INCIDENT & HAZARD DATABASE · SYNTHETIC DEMO RECORDS
          </div>
          <h1 className="text-xl font-bold text-[#F2F6F0] mt-0.5">
            Drilling Event Intelligence Knowledge Base ({filteredEvents.length} Events)
          </h1>
          <p className="text-xs text-[#9BB0A3]">
            Search, filter, and correlate historical mud losses, stuck pipe, kicks, torque spikes,
            and wellbore instability records.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-semibold text-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Demo Drilling Event</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#9BB0A3] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symptoms, causes, mitigation..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#162920] border border-[#2B4337] text-xs text-[#F2F6F0] placeholder-[#6E887B] focus:outline-none focus:border-[#A3E6B8]"
          />
        </div>

        <select
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          className="bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-1.5 border border-[#2B4337] focus:outline-none focus:border-[#A3E6B8]"
        >
          <option value="All">All Event Types</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <select
          value={formationFilter}
          onChange={(e) => setFormationFilter(e.target.value)}
          className="bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-1.5 border border-[#2B4337] focus:outline-none focus:border-[#A3E6B8]"
        >
          <option value="All">All Formations</option>
          <option value="Namsang Claystone Formation">Namsang Claystone Formation</option>
          <option value="Tipam Sandstone Formation">Tipam Sandstone Formation</option>
          <option value="Girujan Clay — Transition Shale">Girujan Clay — Transition Shale</option>
          <option value="Barail Sandstone Reservoir">Barail Sandstone Reservoir</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-1.5 border border-[#2B4337] focus:outline-none focus:border-[#A3E6B8]"
        >
          <option value="All">All Severities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={wellFilter}
          onChange={(e) => setWellFilter(e.target.value)}
          className="bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-1.5 border border-[#2B4337] focus:outline-none focus:border-[#A3E6B8]"
        >
          <option value="All">All Offset Wells</option>
          {offsetWells.map((w) => (
            <option key={w.wellId} value={w.wellId}>
              {w.wellId} ({w.wellName})
            </option>
          ))}
        </select>
      </div>

      {/* 3 Analytics Charts: Event Distribution, Depth Histogram, Frequency by Formation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-2">
          <h3 className="text-xs font-semibold text-[#F2F6F0]">Event Distribution by Type</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventTypeDistribution}>
                <CartesianGrid stroke="#2B4337" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#9BB0A3" fontSize={10} />
                <YAxis stroke="#9BB0A3" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12221B',
                    borderColor: '#3B5949',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#F2F6F0',
                  }}
                />
                <Bar dataKey="count" name="Events" fill="#A3E6B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-2">
          <h3 className="text-xs font-semibold text-[#F2F6F0]">Event Depth Histogram (m MD)</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depthHistogram}>
                <CartesianGrid stroke="#2B4337" strokeDasharray="3 3" />
                <XAxis dataKey="bin" stroke="#9BB0A3" fontSize={10} />
                <YAxis stroke="#9BB0A3" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12221B',
                    borderColor: '#3B5949',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#F2F6F0',
                  }}
                />
                <Bar dataKey="count" name="Events in Interval" fill="#3B5949" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-2">
          <h3 className="text-xs font-semibold text-[#F2F6F0]">Event Frequency by Formation</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formationDistribution}>
                <CartesianGrid stroke="#2B4337" strokeDasharray="3 3" />
                <XAxis dataKey="formation" stroke="#9BB0A3" fontSize={10} />
                <YAxis stroke="#9BB0A3" fontSize={10} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12221B',
                    borderColor: '#3B5949',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#F2F6F0',
                  }}
                />
                <Bar dataKey="count" name="Events" fill="#D4DE95" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Compare Similar Events Drawer/Panel if >= 2 selected */}
      {comparedEvents.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#A3E6B8]/12 border border-[#A3E6B8] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#F2F6F0]">
              Side-by-Side Event Comparison ({comparedEvents.length} Selected)
            </h3>
            <button
              onClick={() => setCompareIds([])}
              className="text-xs text-[#A3E6B8] font-semibold hover:underline"
            >
              Clear Comparison
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparedEvents.map((ce) => (
              <div
                key={ce.eventId}
                className="p-4 rounded-xl bg-[#12221B] border border-[#3B5949] space-y-2 text-xs shadow-2xs"
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[#A3E6B8] font-bold">
                    {ce.eventId} ({ce.wellId})
                  </span>
                  <span className="text-[#F2F6F0] font-semibold">{ce.depthMD} m MD</span>
                </div>
                <div className="font-semibold text-[#F2F6F0]">
                  {ce.eventType} · {ce.formation}
                </div>
                <div className="text-[#9BB0A3]">
                  <strong>Cause:</strong> {ce.rootCause}
                </div>
                <div className="text-[#4ADE80] font-medium">
                  <strong>Mitigation:</strong> {ce.mitigation}
                </div>
                <div className="font-mono text-[11px] text-[#F2F6F0]">
                  NPT: {ce.nptHours} hrs · MW: {ce.parametersAtEvent.mudWeight} SG · ECD:{' '}
                  {ce.parametersAtEvent.ecd} SG
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Searchable Operational Events Table */}
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#2B4337] text-[#9BB0A3] font-mono text-[11px]">
              <th className="py-2.5 px-3">Compare</th>
              <th className="py-2.5 px-3">Event ID</th>
              <th className="py-2.5 px-3">Well ID</th>
              <th className="py-2.5 px-3">Depth (MD/TVD)</th>
              <th className="py-2.5 px-3">Formation</th>
              <th className="py-2.5 px-3">Event Type</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Mitigation Action</th>
              <th className="py-2.5 px-3 text-right">NPT</th>
              <th className="py-2.5 px-3">Source</th>
              <th className="py-2.5 px-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2B4337]">
            {filteredEvents.map((evt) => (
              <tr key={evt.eventId} className="hover:bg-[#162920] transition-colors">
                <td className="py-3 px-3">
                  <input
                    type="checkbox"
                    checked={compareIds.includes(evt.eventId)}
                    onChange={() => toggleCompare(evt.eventId)}
                    className="rounded border-[#3B5949] accent-[#A3E6B8]"
                  />
                </td>
                <td className="py-3 px-3 font-mono font-bold text-[#A3E6B8] whitespace-nowrap">
                  {evt.eventId}
                </td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => navigateToWellProfile(evt.wellId)}
                    className="font-mono text-[#F2F6F0] font-semibold hover:text-[#A3E6B8] hover:underline whitespace-nowrap"
                  >
                    {evt.wellId}
                  </button>
                </td>
                <td className="py-3 px-3 font-mono whitespace-nowrap">
                  <span className="text-[#F2F6F0] font-semibold">{evt.depthMD} m</span>{' '}
                  <span className="text-[#9BB0A3]">({evt.depthTVD}m)</span>
                </td>
                <td className="py-3 px-3 text-[#9BB0A3]">{evt.formation}</td>
                <td className="py-3 px-3 font-semibold text-[#F2F6F0] whitespace-nowrap">
                  {evt.eventType}
                </td>
                <td
                  className={`py-3 px-3 font-mono font-semibold ${
                    evt.severity === 'Critical'
                      ? 'text-[#F87171]'
                      : evt.severity === 'High'
                      ? 'text-[#FBBF24]'
                      : 'text-[#4ADE80]'
                  }`}
                >
                  {evt.severity}
                </td>
                <td className="py-3 px-3 text-[#4ADE80] font-medium max-w-xs truncate">{evt.mitigation}</td>
                <td className="py-3 px-3 font-mono text-right text-[#F2F6F0] whitespace-nowrap">
                  {evt.nptHours.toFixed(1)}h
                </td>
                <td className="py-3 px-3">
                  <button
                    onClick={() => navigateToDocById(evt.sourceDocId)}
                    className="font-mono text-[#A3E6B8] font-semibold hover:underline whitespace-nowrap"
                  >
                    {evt.sourceDocId}
                  </button>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => setInspectedEvent(evt)}
                    className="px-2.5 py-1 rounded-lg bg-[#A3E6B8]/12 hover:bg-[#D4DE95] text-[#F2F6F0] border border-[#3B5949] text-[11px] font-semibold"
                  >
                    Inspect
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Demo Event Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-[#12221B] border border-[#3B5949] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#162920] border-b border-[#2B4337] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#F2F6F0]">
                Log New Synthetic Drilling Event into Knowledge Base
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-[#9BB0A3] hover:text-[#F2F6F0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9BB0A3] font-medium mb-1">Offset Well ID</label>
                  <select
                    value={newWellId}
                    onChange={(e) => setNewWellId(e.target.value)}
                    className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#2B4337]"
                  >
                    {offsetWells.map((w) => (
                      <option key={w.wellId} value={w.wellId}>
                        {w.wellId} ({w.wellName})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#9BB0A3] font-medium mb-1">Measured Depth (m MD)</label>
                  <input
                    type="number"
                    value={newDepthMD}
                    onChange={(e) => setNewDepthMD(Number(e.target.value))}
                    className="w-full bg-[#162920] text-[#F2F6F0] font-mono rounded-lg px-3 py-2 border border-[#2B4337]"
                  />
                </div>
                <div>
                  <label className="block text-[#9BB0A3] font-medium mb-1">Event Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as EventType)}
                    className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#2B4337]"
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#9BB0A3] font-medium mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as SeverityLevel)}
                    className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#2B4337]"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#9BB0A3] font-medium mb-1">Observed Symptoms *</label>
                <textarea
                  rows={2}
                  required
                  value={newSymptoms}
                  onChange={(e) => setNewSymptoms(e.target.value)}
                  placeholder="Describe pit loss, torque surge, or overpull..."
                  className="w-full bg-[#162920] text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#2B4337]"
                />
              </div>

              <div>
                <label className="block text-[#9BB0A3] font-medium mb-1">Mitigation Measures Applied *</label>
                <textarea
                  rows={2}
                  required
                  value={newMitigation}
                  onChange={(e) => setNewMitigation(e.target.value)}
                  placeholder="Describe LCM pill, pump rate adjustment, or jarring..."
                  className="w-full bg-[#A3E6B8]/12 text-[#F2F6F0] rounded-lg px-3 py-2 border border-[#3B5949]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#162920] text-[#9BB0A3] border border-[#2B4337]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-semibold"
                >
                  Save Event to Knowledge Base
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
