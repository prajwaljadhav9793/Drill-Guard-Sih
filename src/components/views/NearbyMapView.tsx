import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  Layers,
  AlertTriangle,
  Activity,
  Bot,
  Sliders,
  Database,
  Eye,
  Compass,
  Clock,
  ShieldAlert,
  Camera,
  Download,
  CheckCircle2,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useNWIS } from '../../context/NWISContext';
import { WellGISMap } from '../map/WellGISMap';
import { EventType } from '../../types/nwis';
import {
  MapLanguageMode,
  formatIndianPlaceLabel,
  getBilingualWellLabel,
} from '../../utils/indianMapLabels';
import { generateMapSnapshotPng } from '../../utils/mapSnapshotExporter';

const STATE_VIEWPORTS: Record<string, { center: [number, number]; zoom: number; wellId?: string }> = {
  All: { center: [21.5, 80.5], zoom: 5 },
  Assam: { center: [27.3662, 95.3258], zoom: 10, wellId: 'OIL-DEMO-042' },
  Rajasthan: { center: [25.7532, 71.3968], zoom: 9, wellId: 'OIL-RAJ-051' },
  Gujarat: { center: [22.35, 72.75], zoom: 8, wellId: 'ONGC-CMB-074' },
  Maharashtra: { center: [19.412, 71.52], zoom: 9, wellId: 'ONGC-MBO-088' },
  'Andhra Pradesh': { center: [16.85, 81.95], zoom: 9, wellId: 'ONGC-KGB-062' },
  'Tamil Nadu': { center: [10.90, 79.82], zoom: 10, wellId: 'OIL-CAU-095' },
  Odisha: { center: [20.29, 86.59], zoom: 10, wellId: 'OIL-MHN-099' },
};

type QuickViewTab = 'overview' | 'formations' | 'events';

export const NearbyMapView: React.FC = () => {
  const {
    activeWells,
    activeWell,
    setActiveWellId,
    offsetWells,
    events,
    selectedOffsetWellId,
    setSelectedOffsetWellId,
    navigateToWellProfile,
    setActiveRoute,
    setInspectedEvent,
    askAIAbout,
    isMapFullscreen,
    setIsMapFullscreen,
  } = useNWIS();

  const [showOffsetListPanel, setShowOffsetListPanel] = useState<boolean>(!isMapFullscreen);

  useEffect(() => {
    if (isMapFullscreen) {
      setShowOffsetListPanel(false);
    } else {
      setShowOffsetListPanel(true);
    }
  }, [isMapFullscreen]);

  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [stateFilter, setStateFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('All');
  const [showTrajectories, setShowTrajectories] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [mapStyle, setMapStyle] = useState<'simplified' | 'topographic' | 'satellite'>('simplified');
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.5, 80.5]);
  const [mapZoom, setMapZoom] = useState<number>(5);
  const [languageMode, setLanguageMode] = useState<MapLanguageMode>('bilingual');

  // Interactive Well Quick-View Drawer State
  const [quickViewTarget, setQuickViewTarget] = useState<{
    wellId: string;
    wellType: 'offset' | 'active';
  } | null>(null);
  const [quickViewTab, setQuickViewTab] = useState<QuickViewTab>('overview');

  // Map Snapshot PNG Export State
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const [isExportingSnapshot, setIsExportingSnapshot] = useState(false);
  const [lastSnapshot, setLastSnapshot] = useState<{
    dataUrl: string;
    filename: string;
    timestamp: string;
  } | null>(null);

  // Close drawer or exit fullscreen on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (quickViewTarget) {
          setQuickViewTarget(null);
        } else if (isMapFullscreen) {
          setIsMapFullscreen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quickViewTarget, isMapFullscreen, setIsMapFullscreen]);

  const filteredWells = useMemo(() => {
    return offsetWells.filter((w) => {
      if (w.distanceKm > radiusKm) return false;
      if (stateFilter !== 'All' && !w.field.toLowerCase().includes(stateFilter.toLowerCase())) {
        return false;
      }
      const bilingual = getBilingualWellLabel(w.wellName, w.wellId, 'bilingual');
      if (
        searchQuery.trim() &&
        !w.wellId.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !w.wellName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !w.field.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !bilingual.shortPlaceHi.includes(searchQuery.trim()) &&
        !bilingual.locationSubtitle.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (statusFilter !== 'All' && w.status !== statusFilter) return false;
      if (severityFilter !== 'All' && w.highestSeverity !== severityFilter) return false;

      const wellEvents = events.filter((e) => e.wellId === w.wellId);
      if (
        eventTypeFilter !== 'All' &&
        !wellEvents.some((e) => e.eventType === (eventTypeFilter as EventType))
      ) {
        return false;
      }
      return true;
    });
  }, [
    offsetWells,
    events,
    radiusKm,
    stateFilter,
    searchQuery,
    statusFilter,
    severityFilter,
    eventTypeFilter,
  ]);

  const handleSelectWell = (wellId: string) => {
    setSelectedOffsetWellId(wellId);
    const found = offsetWells.find((w) => w.wellId === wellId);
    if (found) {
      setMapCenter([found.lat, found.lng]);
      setMapZoom(11);
    }
  };

  const handleOpenQuickView = (wellId: string, wellType: 'offset' | 'active' = 'offset') => {
    if (wellType === 'offset') {
      setSelectedOffsetWellId(wellId);
      const found = offsetWells.find((w) => w.wellId === wellId);
      if (found) {
        setMapCenter([found.lat, found.lng]);
        setMapZoom(11);
      }
    } else {
      const foundRig = activeWells.find((r) => r.wellId === wellId);
      if (foundRig) {
        setMapCenter([foundRig.lat, foundRig.lng]);
        setMapZoom(11);
      }
    }
    setQuickViewTarget({ wellId, wellType });
    setQuickViewTab('overview');
  };

  const handleStepQuickViewWell = (direction: -1 | 1) => {
    if (!quickViewTarget) return;
    if (quickViewTarget.wellType === 'active') {
      const idx = activeWells.findIndex((w) => w.wellId === quickViewTarget.wellId);
      const nextIdx = (idx + direction + activeWells.length) % activeWells.length;
      const nextRig = activeWells[nextIdx];
      if (nextRig) {
        setActiveWellId(nextRig.wellId);
        handleOpenQuickView(nextRig.wellId, 'active');
      }
    } else {
      const pool = filteredWells.length > 0 ? filteredWells : offsetWells;
      const idx = pool.findIndex((w) => w.wellId === quickViewTarget.wellId);
      const nextIdx = (idx + direction + pool.length) % pool.length;
      const nextWell = pool[nextIdx];
      if (nextWell) {
        handleOpenQuickView(nextWell.wellId, 'offset');
      }
    }
  };

  const handleStateSelect = (stateName: string) => {
    setStateFilter(stateName);
    const vp = STATE_VIEWPORTS[stateName] || STATE_VIEWPORTS.All;
    setMapCenter(vp.center);
    setMapZoom(vp.zoom);
    if (vp.wellId) {
      setActiveWellId(vp.wellId);
    }
  };

  const handleResetView = () => {
    setRadiusKm(50);
    setStateFilter('All');
    setSearchQuery('');
    setStatusFilter('All');
    setSeverityFilter('All');
    setEventTypeFilter('All');
    setMapCenter([21.5, 80.5]);
    setMapZoom(5);
  };

  const handleExportMapSnapshot = async () => {
    if (isExportingSnapshot) return;
    setIsExportingSnapshot(true);
    try {
      const { dataUrl, filename } = await generateMapSnapshotPng({
        activeWell,
        activeWells,
        offsetWells: filteredWells,
        selectedOffsetWellId,
        center: mapCenter,
        zoom: mapZoom,
        radiusKm,
        mapStyle,
        stateFilter,
        statusFilter,
        severityFilter,
        showTrajectories,
        showLabels,
        languageMode,
        mapContainerEl: mapWrapperRef.current,
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setLastSnapshot({
        dataUrl,
        filename,
        timestamp: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      });
    } finally {
      window.setTimeout(() => setIsExportingSnapshot(false), 320);
    }
  };

  // Resolved Drawer Entities
  const quickViewOffsetWell = useMemo(
    () =>
      quickViewTarget?.wellType === 'offset'
        ? offsetWells.find((w) => w.wellId === quickViewTarget.wellId) || null
        : null,
    [quickViewTarget, offsetWells]
  );

  const quickViewActiveRig = useMemo(
    () =>
      quickViewTarget?.wellType === 'active'
        ? activeWells.find((w) => w.wellId === quickViewTarget.wellId) || null
        : null,
    [quickViewTarget, activeWells]
  );

  const quickViewEvents = useMemo(() => {
    if (!quickViewTarget) return [];
    const direct = events.filter((e) => e.wellId === quickViewTarget.wellId);
    if (direct.length > 0) return direct;
    // If a regional offset well has no direct event rows in DEMO_EVENTS, show top analog events
    return events.slice(0, 3);
  }, [quickViewTarget, events]);

  return (
    <div
      className={
        isMapFullscreen
          ? 'fixed inset-0 z-40 w-screen h-screen bg-[#0E1914] flex flex-col p-3 gap-2.5 overflow-hidden'
          : 'space-y-5 relative'
      }
    >
      {/* Compact Full-Screen Top Command Bar (when in Full-Screen GIS Mode) */}
      {isMapFullscreen ? (
        <div className="px-4 py-2.5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-md flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-[#26E8B0]/15 border border-[#26E8B0]/40 font-mono text-xs font-bold text-[#26E8B0]">
              FULL-SCREEN GIS MAP
            </span>
            <div>
              <div className="text-sm font-bold text-[#F2F6F0] leading-tight">
                All-India Sedimentary Basins &amp; Offset Wells ({filteredWells.length} Wells · 9 Rigs)
              </div>
              <div className="text-[11px] text-[#9BB0A3] font-mono">
                Active Rig: <strong className="text-[#26E8B0]">{activeWell.wellId}</strong> ({activeWell.currentDepthMD.toFixed(1)} m MD)
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={stateFilter}
              onChange={(e) => handleStateSelect(e.target.value)}
              className="bg-[#162920] text-xs text-[#26E8B0] font-semibold rounded-lg px-2.5 py-1.5 border border-[#2B4337] focus:outline-none focus:border-[#26E8B0]"
            >
              <option value="All">🇮🇳 All Indian States (7 Regions)</option>
              <option value="Assam">Assam — Upper Assam Basin</option>
              <option value="Rajasthan">Rajasthan — Barmer &amp; Jaisalmer</option>
              <option value="Gujarat">Gujarat — Cambay</option>
              <option value="Maharashtra">Maharashtra — Mumbai High</option>
              <option value="Andhra Pradesh">Andhra Pradesh — KG Basin</option>
              <option value="Tamil Nadu">Tamil Nadu — Cauvery Basin</option>
              <option value="Odisha">Odisha — Mahanadi Basin</option>
            </select>

            <div className="inline-flex items-center rounded-lg bg-[#0B1410] p-0.5 border border-[#2B4337] gap-0.5">
              {(['simplified', 'topographic', 'satellite'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setMapStyle(st)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono capitalize transition-colors cursor-pointer ${
                    mapStyle === st
                      ? 'bg-[#26E8B0] text-[#080D0B] font-bold'
                      : 'text-[#9BB0A3] hover:text-[#F2F6F0]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowOffsetListPanel((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                showOffsetListPanel
                  ? 'bg-[#26E8B0]/15 text-[#26E8B0] border-[#26E8B0]/50'
                  : 'bg-[#162920] text-[#F2F6F0] border-[#2B4337]'
              }`}
            >
              {showOffsetListPanel ? (
                <PanelRightClose className="w-3.5 h-3.5" />
              ) : (
                <PanelRightOpen className="w-3.5 h-3.5" />
              )}
              <span>{showOffsetListPanel ? 'Hide Well List' : `Show Well List (${filteredWells.length})`}</span>
            </button>

            <button
              type="button"
              onClick={handleExportMapSnapshot}
              disabled={isExportingSnapshot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#162920] hover:bg-[#26E8B0] text-[#26E8B0] hover:text-[#080D0B] border border-[#26E8B0]/40 text-xs font-bold transition-all cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Snapshot PNG</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMapFullscreen(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F87171] hover:bg-[#EF4444] text-[#080D0B] text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Exit Full Screen (Esc)</span>
            </button>
          </div>
        </div>
      ) : (
      /* Header & Map Filter Controls */
      <div className="p-5 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-[#26E8B0] font-semibold">
              अखिल भारतीय अवसादी बेसिन GIS · ASSAM · RAJASTHAN · GUJARAT · MUMBAI HIGH · KG BASIN · CAUVERY · ODISHA
            </div>
            <h1 className="text-xl font-bold text-[#F2F6F0] mt-0.5">
              All-India Oilfields &amp; Offset Wells GIS Map (भारतीय तेल क्षेत्र मानचित्र)
            </h1>
            <p className="text-xs text-[#9BB0A3]">
              Click any well marker on the map or list to open the in-map{' '}
              <strong className="text-[#26E8B0]">Well Quick-View Drawer</strong>. Monitoring{' '}
              <strong className="text-[#F2F6F0]">{activeWell.wellId}</strong> (
              {formatIndianPlaceLabel(activeWell.wellName, languageMode)}).
            </p>
          </div>

          {/* Search Radius & Quick-View Trigger */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#9BB0A3] mr-1">त्रिज्या / Radius:</span>
            {[5, 10, 25, 50].map((r) => (
              <button
                key={r}
                onClick={() => setRadiusKm(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  radiusKm === r
                    ? 'bg-[#26E8B0] text-[#080D0B] font-bold'
                    : 'bg-[#162920] text-[#9BB0A3] hover:text-[#F2F6F0] border border-[#2B4337]'
                }`}
              >
                {r === 50 ? 'All (50 km)' : `${r} km`}
              </button>
            ))}

            <button
              onClick={() => handleOpenQuickView(selectedOffsetWellId, 'offset')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#26E8B0]/15 hover:bg-[#26E8B0] text-[#26E8B0] hover:text-[#080D0B] border border-[#26E8B0]/40 text-xs font-bold transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Quick-View ({selectedOffsetWellId})</span>
            </button>

            <button
              type="button"
              onClick={handleExportMapSnapshot}
              disabled={isExportingSnapshot}
              title="Export current GIS map view as a report-ready PNG snapshot"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#26E8B0] hover:bg-[#4FF2C3] text-[#080D0B] text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isExportingSnapshot ? 'Capturing PNG...' : 'Snapshot PNG'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowOffsetListPanel((prev) => !prev)}
              title={showOffsetListPanel ? 'Expand map to full 12-column width' : 'Show Offset Well sidebar list'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#162920] hover:bg-[#1E352B] text-[#F2F6F0] border border-[#2B4337] text-xs font-semibold transition-colors cursor-pointer"
            >
              {showOffsetListPanel ? (
                <PanelRightClose className="w-3.5 h-3.5 text-[#26E8B0]" />
              ) : (
                <PanelRightOpen className="w-3.5 h-3.5 text-[#26E8B0]" />
              )}
              <span>{showOffsetListPanel ? 'Wide Map' : 'Split List'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMapFullscreen(true)}
              title="Expand GIS Map to Full Screen"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4DE95] hover:bg-[#26E8B0] text-[#080D0B] text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full Screen GIS</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 pt-2 border-t border-[#2B4337]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#9BB0A3] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Barmer, Mumbai, Kakinada, Assam..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#162920] border border-[#2B4337] text-xs text-[#F2F6F0] placeholder-[#6E887B] focus:outline-none focus:border-[#26E8B0]"
            />
          </div>

          <select
            value={stateFilter}
            onChange={(e) => handleStateSelect(e.target.value)}
            className="bg-[#162920] text-xs text-[#26E8B0] font-semibold rounded-lg px-2.5 py-1.5 border border-[#2B4337] focus:outline-none focus:border-[#26E8B0]"
          >
            <option value="All">🇮🇳 All Indian States (7 Regions)</option>
            <option value="Assam">Assam — Upper Assam Basin</option>
            <option value="Rajasthan">Rajasthan — Barmer &amp; Jaisalmer</option>
            <option value="Gujarat">Gujarat — Cambay (Ankleshwar/Mehsana)</option>
            <option value="Maharashtra">Maharashtra — Mumbai High Offshore</option>
            <option value="Andhra Pradesh">Andhra Pradesh — KG Basin</option>
            <option value="Tamil Nadu">Tamil Nadu — Cauvery Basin</option>
            <option value="Odisha">Odisha — Mahanadi Basin</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-1.5 border border-[#2B4337] focus:outline-none focus:border-[#26E8B0]"
          >
            <option value="All">All Risk Severities</option>
            <option value="Critical">Critical Severity Only</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>

          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-1.5 border border-[#2B4337] focus:outline-none focus:border-[#26E8B0]"
          >
            <option value="All">All Historical Event Types</option>
            <option value="Mud Loss">Mud Loss</option>
            <option value="Stuck Pipe">Stuck Pipe</option>
            <option value="Kick / Influx">Kick / Influx</option>
            <option value="Torque Spike">Torque Spike</option>
            <option value="Wellbore Instability">Wellbore Instability</option>
            <option value="Fishing">Fishing</option>
            <option value="Cementing Issue">Cementing Issue</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#162920] text-xs text-[#F2F6F0] rounded-lg px-2.5 py-1.5 border border-[#2B4337] focus:outline-none focus:border-[#26E8B0]"
          >
            <option value="All">All Well Statuses</option>
            <option value="Completed Producer">Completed Producer</option>
            <option value="Active Injector">Active Injector</option>
            <option value="Suspended">Suspended</option>
            <option value="Plugged & Abandoned">Plugged &amp; Abandoned</option>
          </select>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowTrajectories(!showTrajectories)}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                showTrajectories
                  ? 'bg-[#26E8B0]/15 text-[#26E8B0] border-[#26E8B0]'
                  : 'bg-[#162920] text-[#9BB0A3] border-[#2B4337]'
              }`}
            >
              Trajectories
            </button>
            <button
              type="button"
              onClick={handleExportMapSnapshot}
              title="Capture Map Snapshot as PNG"
              className="p-1.5 rounded-lg bg-[#162920] hover:bg-[#26E8B0] text-[#26E8B0] hover:text-[#080D0B] border border-[#26E8B0]/40 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetView}
              title="Reset to All-India Map"
              className="p-1.5 rounded-lg bg-[#162920] hover:bg-[#1E352B] text-[#9BB0A3] hover:text-[#F2F6F0] border border-[#2B4337] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Site Planning Base Map Layer Control Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-[#2B4337]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F2F6F0]">
              <Layers className="w-3.5 h-3.5 text-[#26E8B0]" />
              <span>Site Planning Base Map Layer:</span>
            </span>
            <div
              role="group"
              aria-label="Base Map Style Toggle"
              className="inline-flex items-center rounded-xl bg-[#0B1410] p-1 border border-[#2B4337] gap-1"
            >
              {(
                [
                  {
                    id: 'simplified',
                    label: 'Simplified',
                    badge: 'GIS Vector',
                  },
                  {
                    id: 'topographic',
                    label: 'Topographic',
                    badge: 'Contours & Relief',
                  },
                  {
                    id: 'satellite',
                    label: 'Satellite',
                    badge: 'Aerial Imagery',
                  },
                ] as const
              ).map((layer) => {
                const isSelected = mapStyle === layer.id;
                return (
                  <button
                    key={layer.id}
                    type="button"
                    onClick={() => setMapStyle(layer.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#26E8B0] text-[#080D0B] font-bold shadow-xs'
                        : 'text-[#9BB0A3] hover:text-[#F2F6F0]'
                    }`}
                  >
                    <span>{layer.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isSelected
                          ? 'bg-[#080D0B]/20 text-[#080D0B]'
                          : 'bg-[#162920] text-[#9BB0A3]'
                      }`}
                    >
                      {layer.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#9BB0A3]">
            {mapStyle === 'satellite' && (
              <span>
                <strong className="text-[#26E8B0]">Satellite Mode:</strong> High-res aerial imagery for rig pad layout, flare pit setbacks &amp; access road planning.
              </span>
            )}
            {mapStyle === 'topographic' && (
              <span>
                <strong className="text-[#D4DE95]">Topographic Mode:</strong> Elevation contours, slope gradients &amp; surface drainage for civil site grading.
              </span>
            )}
            {mapStyle === 'simplified' && (
              <span>
                <strong className="text-[#26E8B0]">Simplified Mode:</strong> High-contrast basin corridor for subsurface trajectory &amp; anti-collision analysis.
              </span>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Exported PNG Snapshot Confirmation & Preview Banner */}
      {lastSnapshot && (
        <div className="p-3.5 rounded-2xl bg-[#12221B] border border-[#26E8B0]/50 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={lastSnapshot.dataUrl}
              alt="Exported Map Snapshot Thumbnail"
              className="w-24 h-14 object-cover rounded-lg border border-[#2B4337] shrink-0 bg-[#0B1410]"
            />
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#26E8B0]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Report Map Snapshot Exported as PNG ({lastSnapshot.timestamp})</span>
              </div>
              <div className="font-mono text-[11px] text-[#F2F6F0] mt-0.5 break-all">
                {lastSnapshot.filename}
              </div>
              <div className="text-[11px] text-[#9BB0A3]">
                Includes title block, coordinates, {mapStyle.toUpperCase()} base layer, trajectories &amp; well symbol legend for DDR/WCR reports.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={lastSnapshot.dataUrl}
              download={lastSnapshot.filename}
              className="px-3 py-1.5 rounded-lg bg-[#26E8B0] hover:bg-[#4FF2C3] text-[#080D0B] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </a>
            <button
              type="button"
              onClick={() => setLastSnapshot(null)}
              className="p-1.5 rounded-lg bg-[#162920] hover:bg-[#22352C] text-[#9BB0A3] hover:text-[#F2F6F0] border border-[#2B4337] cursor-pointer"
              title="Dismiss Snapshot Banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Split: GIS Map + Synchronized Offset Well List */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 gap-4 ${
          isMapFullscreen ? 'flex-1 min-h-0' : ''
        }`}
      >
        <div
          ref={mapWrapperRef}
          className={`${
            showOffsetListPanel ? 'lg:col-span-8' : 'lg:col-span-12'
          } relative ${isMapFullscreen ? 'h-full min-h-0' : ''}`}
        >
          {isExportingSnapshot && (
            <div className="absolute inset-0 z-30 rounded-xl bg-white/25 pointer-events-none animate-pulse" />
          )}
          <WellGISMap
            activeWell={activeWell}
            offsetWells={filteredWells}
            events={events}
            selectedWellId={selectedOffsetWellId}
            onSelectWell={handleSelectWell}
            onQuickViewWell={(id, type) => handleOpenQuickView(id, type)}
            onViewProfile={(id) => navigateToWellProfile(id)}
            onCompareWithActive={(id) => {
              setSelectedOffsetWellId(id);
              setActiveRoute('parameter-comparison');
            }}
            onViewEvents={(id) => {
              setSelectedOffsetWellId(id);
              setActiveRoute('event-intelligence');
            }}
            radiusKm={radiusKm}
            showTrajectories={showTrajectories}
            showLabels={showLabels}
            mapStyle={mapStyle}
            onMapStyleChange={setMapStyle}
            zoom={mapZoom}
            center={mapCenter}
            heightClass={isMapFullscreen ? 'h-full' : 'h-[76vh] min-h-[680px]'}
            languageMode={languageMode}
            onLanguageModeChange={setLanguageMode}
            defaultAllIndia={true}
            respectFilteredWells={true}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            severityFilter={severityFilter}
            onSeverityFilterChange={setSeverityFilter}
            isFullscreen={isMapFullscreen}
            onToggleFullscreen={() => setIsMapFullscreen(!isMapFullscreen)}
          />
        </div>

        {/* Synchronized Offset Well List */}
        {showOffsetListPanel && (
        <div
          className={`lg:col-span-4 p-4 rounded-2xl bg-[#12221B] border border-[#2B4337] shadow-2xs flex flex-col ${
            isMapFullscreen ? 'h-full min-h-0 overflow-hidden' : 'h-[76vh] min-h-[680px]'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#2B4337]">
            <div>
              <h2 className="text-sm font-semibold text-[#F2F6F0]">
                भारतीय ऑफसेट कूप · Indian Offset Wells ({filteredWells.length})
              </h2>
              <p className="text-[11px] text-[#9BB0A3]">
                Click any well to open Quick-View Drawer &amp; center map
              </p>
            </div>
            <button
              onClick={() => setShowLabels(!showLabels)}
              className="text-[11px] text-[#26E8B0] font-semibold hover:underline cursor-pointer"
            >
              {showLabels ? 'Hide Labels' : 'Show Labels'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 py-3 pr-1">
            {filteredWells.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#9BB0A3]">
                <MapPin className="w-8 h-8 text-[#3B5949] mb-2" />
                <div className="text-xs font-semibold text-[#F2F6F0]">
                  No Offset Wells Match Current Filters
                </div>
                <p className="text-[11px] mt-1">
                  Increase the search radius or reset state/event filters.
                </p>
                <button
                  onClick={handleResetView}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-[#26E8B0] text-[#080D0B] font-semibold text-xs cursor-pointer"
                >
                  Reset to All-India (50 km)
                </button>
              </div>
            ) : (
              filteredWells.map((well) => {
                const wellEvents = events.filter((e) => e.wellId === well.wellId);
                const isSelected = well.wellId === selectedOffsetWellId;
                const wellBilingual = getBilingualWellLabel(
                  well.wellName,
                  well.wellId,
                  languageMode
                );
                return (
                  <div
                    key={well.wellId}
                    onClick={() => handleOpenQuickView(well.wellId, 'offset')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#26E8B0]/12 border-[#26E8B0] shadow-2xs'
                        : 'bg-[#162920] border-[#2B4337] hover:border-[#3B5949]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono text-xs font-bold text-[#26E8B0]">
                          {wellBilingual.markerTitle} · {well.wellId}
                        </div>
                        <div className="text-[11px] text-[#9BB0A3]">
                          {wellBilingual.locationSubtitle}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span
                          className={`font-mono text-[11px] font-semibold ${
                            well.highestSeverity === 'Critical'
                              ? 'text-[#F87171]'
                              : well.highestSeverity === 'High'
                              ? 'text-[#FBBF24]'
                              : 'text-[#4ADE80]'
                          }`}
                        >
                          {well.highestSeverity} Risk
                        </span>
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#0B1410] border border-[#2B4337] text-[#C5D6CC]">
                          {well.status === 'Suspended'
                            ? 'Dormant / Suspended'
                            : well.status === 'Plugged & Abandoned'
                            ? 'Plugged & Abandoned'
                            : well.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-[11px] text-[#F2F6F0] mt-1">
                      <span>Dist: {well.distanceKm} km</span>
                      <span>·</span>
                      <span>TD: {well.totalDepthMD} m</span>
                      <span>·</span>
                      <span>NPT: {well.nptHours} hrs</span>
                    </div>

                    <p className="text-[11px] text-[#9BB0A3] mt-1.5 line-clamp-2">{well.summary}</p>

                    <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-[#2B4337]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenQuickView(well.wellId, 'offset');
                        }}
                        className="flex-1 py-1 px-2 rounded-lg bg-[#26E8B0] hover:bg-[#4FF2C3] text-[#080D0B] text-[11px] font-bold text-center transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Quick-View</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateToWellProfile(well.wellId);
                        }}
                        className="flex-1 py-1 px-2 rounded-lg bg-[#12221B] hover:bg-[#26E8B0]/20 text-[#26E8B0] text-[11px] font-semibold text-center border border-[#26E8B0]/30 transition-colors cursor-pointer"
                      >
                        Full Profile
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOffsetWellId(well.wellId);
                          setActiveRoute('depth-correlation');
                        }}
                        className="py-1 px-2 rounded-lg bg-[#12221B] hover:bg-[#26E8B0]/20 text-[#F2F6F0] text-[11px] font-medium text-center border border-[#3B5949] transition-colors cursor-pointer"
                        title="Open Depth Correlation"
                      >
                        Correlate ({wellEvents.length})
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        )}
      </div>

      {/* =====================================================================
          IN-MAP "WELL QUICK-VIEW" SLIDE-OVER DRAWER (Offset Well or Active Rig)
         ===================================================================== */}
      {quickViewTarget && (quickViewOffsetWell || quickViewActiveRig) && (
        <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
          {/* Subtle Click-Away Backdrop that preserves map visibility on the left */}
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-[1px] pointer-events-auto transition-opacity"
            onClick={() => setQuickViewTarget(null)}
          />

          {/* Slide-Over Drawer Panel */}
          <aside
            aria-label="Well Quick-View Drawer"
            className="relative z-10 w-full max-w-[540px] h-full bg-[#0B1410]/98 border-l border-[#26E8B0]/40 shadow-2xl flex flex-col pointer-events-auto animate-in slide-in-from-right duration-200"
          >
            {/* 1. Drawer Top Header */}
            <div className="p-4 sm:p-5 border-b border-[#22352C] bg-[#111A16] space-y-3 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#26E8B0]/15 border border-[#26E8B0]/40 font-mono text-[10px] font-bold uppercase tracking-wider text-[#26E8B0]">
                    {quickViewOffsetWell ? 'OFFSET WELL QUICK-VIEW' : 'ACTIVE RIG QUICK-VIEW'}
                  </span>
                  {quickViewOffsetWell && (
                    <span
                      className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold uppercase ${
                        quickViewOffsetWell.highestSeverity === 'Critical'
                          ? 'bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/40'
                          : quickViewOffsetWell.highestSeverity === 'High'
                          ? 'bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/40'
                          : 'bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/40'
                      }`}
                    >
                      {quickViewOffsetWell.highestSeverity} Risk
                    </span>
                  )}
                  {quickViewActiveRig && (
                    <span className="px-2 py-0.5 rounded-md bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/40 font-mono text-[10px] font-bold uppercase">
                      {quickViewActiveRig.status} · LIVE WITSML
                    </span>
                  )}
                </div>

                {/* Prev / Next Well Steppers & Close Button */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleStepQuickViewWell(-1)}
                    title="Previous Well on Map"
                    className="p-1.5 rounded-lg bg-[#162920] hover:bg-[#26E8B0] text-[#C5D6CC] hover:text-[#080D0B] border border-[#2B4337] transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStepQuickViewWell(1)}
                    title="Next Well on Map"
                    className="p-1.5 rounded-lg bg-[#162920] hover:bg-[#26E8B0] text-[#C5D6CC] hover:text-[#080D0B] border border-[#2B4337] transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setQuickViewTarget(null)}
                    title="Close Quick-View (Esc)"
                    className="p-1.5 rounded-lg bg-[#162920] hover:bg-[#F87171]/20 text-[#9BB0A3] hover:text-[#F87171] border border-[#2B4337] transition-colors cursor-pointer ml-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Well Title & Coordinates */}
              {quickViewOffsetWell && (() => {
                const lbl = getBilingualWellLabel(
                  quickViewOffsetWell.wellName,
                  quickViewOffsetWell.wellId,
                  languageMode
                );
                return (
                  <div>
                    <h2 className="text-lg font-bold text-[#F2F6F0] tracking-tight">
                      {lbl.markerTitle}{' '}
                      <span className="font-mono text-sm text-[#26E8B0]">
                        ({quickViewOffsetWell.wellId})
                      </span>
                    </h2>
                    <div className="text-xs text-[#9BB0A3] mt-0.5">{quickViewOffsetWell.field}</div>
                    <div className="flex flex-wrap items-center gap-3 mt-2 font-mono text-[11px] text-[#C5D6CC]">
                      <span className="inline-flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-[#26E8B0]" />
                        {quickViewOffsetWell.lat.toFixed(4)}°N, {quickViewOffsetWell.lng.toFixed(4)}°E
                      </span>
                      <span>·</span>
                      <span>
                        {quickViewOffsetWell.distanceKm} km ({quickViewOffsetWell.azimuthDeg}° Azimuth)
                      </span>
                      <span>·</span>
                      <span className="text-[#D4DE95]">{quickViewOffsetWell.status}</span>
                    </div>
                  </div>
                );
              })()}

              {quickViewActiveRig && (() => {
                const lbl = getBilingualWellLabel(
                  quickViewActiveRig.wellName,
                  quickViewActiveRig.wellId,
                  languageMode
                );
                return (
                  <div>
                    <h2 className="text-lg font-bold text-[#F2F6F0] tracking-tight">
                      {lbl.markerTitle}{' '}
                      <span className="font-mono text-sm text-[#26E8B0]">
                        ({quickViewActiveRig.wellId})
                      </span>
                    </h2>
                    <div className="text-xs text-[#9BB0A3] mt-0.5">
                      {quickViewActiveRig.field} · Rig: {quickViewActiveRig.rigName}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2 font-mono text-[11px] text-[#C5D6CC]">
                      <span className="inline-flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-[#26E8B0]" />
                        {quickViewActiveRig.lat.toFixed(4)}°N, {quickViewActiveRig.lng.toFixed(4)}°E
                      </span>
                      <span>·</span>
                      <span>Spud: {quickViewActiveRig.spudDate}</span>
                      <span>·</span>
                      <span className="text-[#4ADE80]">
                        Target TD: {quickViewActiveRig.targetDepthMD} m
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Segmented Tab Bar inside Drawer */}
              <div className="grid grid-cols-3 gap-1 bg-[#0B1410] p-1 rounded-xl border border-[#22352C]">
                <button
                  onClick={() => setQuickViewTab('overview')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    quickViewTab === 'overview'
                      ? 'bg-[#26E8B0] text-[#080D0B] font-bold'
                      : 'text-[#9BB0A3] hover:text-[#F2F6F0]'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Overview &amp; Curve</span>
                </button>
                <button
                  onClick={() => setQuickViewTab('formations')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    quickViewTab === 'formations'
                      ? 'bg-[#26E8B0] text-[#080D0B] font-bold'
                      : 'text-[#9BB0A3] hover:text-[#F2F6F0]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Formations &amp; Mud</span>
                </button>
                <button
                  onClick={() => setQuickViewTab('events')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    quickViewTab === 'events'
                      ? 'bg-[#26E8B0] text-[#080D0B] font-bold'
                      : 'text-[#9BB0A3] hover:text-[#F2F6F0]'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Events ({quickViewEvents.length})</span>
                </button>
              </div>
            </div>

            {/* 2. Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* ==================== OFFSET WELL CONTENT ==================== */}
              {quickViewOffsetWell && quickViewTab === 'overview' && (
                <>
                  {/* 4-Card KPI Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-[#12221B] border border-[#2B4337]">
                      <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">
                        Total Depth
                      </div>
                      <div className="font-mono text-base font-bold text-[#F2F6F0] mt-0.5">
                        {quickViewOffsetWell.totalDepthMD} m
                      </div>
                      <div className="text-[10px] text-[#9BB0A3] font-mono">
                        TVD: {quickViewOffsetWell.totalDepthTVD} m
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#12221B] border border-[#2B4337]">
                      <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">
                        Proximity
                      </div>
                      <div className="font-mono text-base font-bold text-[#26E8B0] mt-0.5">
                        {quickViewOffsetWell.distanceKm} km
                      </div>
                      <div className="text-[10px] text-[#9BB0A3] font-mono">
                        Azimuth {quickViewOffsetWell.azimuthDeg}°
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#12221B] border border-[#2B4337]">
                      <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">
                        Total NPT
                      </div>
                      <div className="font-mono text-base font-bold text-[#FBBF24] mt-0.5">
                        {quickViewOffsetWell.nptHours} hrs
                      </div>
                      <div className="text-[10px] text-[#9BB0A3] font-mono">
                        {quickViewOffsetWell.nptBreakdown.length} categories
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#12221B] border border-[#2B4337]">
                      <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">
                        Completion
                      </div>
                      <div className="font-mono text-xs font-bold text-[#F2F6F0] mt-1">
                        {quickViewOffsetWell.completionDate}
                      </div>
                      <div className="text-[10px] text-[#9BB0A3] font-mono">
                        Spud: {quickViewOffsetWell.spudDate}
                      </div>
                    </div>
                  </div>

                  {/* Executive Summary & Risk Callout */}
                  <div className="p-3.5 rounded-xl bg-[#12221B] border border-[#2B4337] space-y-2">
                    <div className="text-xs font-bold text-[#F2F6F0] flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-[#26E8B0]" />
                      <span>Geological &amp; Drilling Summary</span>
                    </div>
                    <p className="text-xs text-[#C5D6CC] leading-relaxed">
                      {quickViewOffsetWell.summary}
                    </p>
                    <div className="p-2.5 rounded-lg bg-[#FBBF24]/10 border border-[#FBBF24]/30 text-xs text-[#F2F6F0]">
                      <strong className="text-[#FBBF24] font-mono uppercase text-[10px] block mb-0.5">
                        Correlation Risk Advisory for Active Rig:
                      </strong>
                      {quickViewOffsetWell.riskSummary}
                    </div>
                  </div>

                  {/* Mini Recharts Depth vs ROP & Mud Weight Curve */}
                  <div className="p-3.5 rounded-xl bg-[#12221B] border border-[#2B4337] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-[#F2F6F0]">
                        Depth vs. ROP (m/hr) &amp; ECD (SG) Drilling Curve
                      </div>
                      <span className="font-mono text-[10px] text-[#26E8B0]">
                        0 – {quickViewOffsetWell.totalDepthMD} m MD
                      </span>
                    </div>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={quickViewOffsetWell.depthCurve}
                          margin={{ top: 6, right: 8, left: -18, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="qvRopGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#26E8B0" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#26E8B0" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#22352C" />
                          <XAxis
                            dataKey="depthMD"
                            tick={{ fill: '#9BB0A3', fontSize: 10 }}
                            tickFormatter={(v) => `${v}m`}
                          />
                          <YAxis tick={{ fill: '#9BB0A3', fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0B1410',
                              borderColor: '#26E8B0',
                              borderRadius: '10px',
                              fontSize: '11px',
                              color: '#F2F6F0',
                            }}
                            formatter={(val: number, name: string) => [
                              name === 'rop' ? `${val} m/hr` : `${val} kN·m`,
                              name === 'rop' ? 'ROP' : 'Torque',
                            ]}
                            labelFormatter={(label) => `Depth: ${label} m MD`}
                          />
                          <Area
                            type="monotone"
                            dataKey="rop"
                            stroke="#26E8B0"
                            strokeWidth={2}
                            fill="url(#qvRopGrad)"
                          />
                          <Area
                            type="monotone"
                            dataKey="torque"
                            stroke="#D4DE95"
                            strokeWidth={1.5}
                            fillOpacity={0}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* NPT Breakdown Bars */}
                  <div className="p-3.5 rounded-xl bg-[#12221B] border border-[#2B4337] space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#F2F6F0] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
                        <span>Non-Productive Time (NPT) Breakdown</span>
                      </span>
                      <span className="font-mono text-[#FBBF24] font-bold">
                        {quickViewOffsetWell.nptHours} hrs total
                      </span>
                    </div>
                    <div className="space-y-2">
                      {quickViewOffsetWell.nptBreakdown.map((item) => {
                        const pct = Math.min(
                          100,
                          Math.round((item.hours / Math.max(1, quickViewOffsetWell.nptHours)) * 100)
                        );
                        return (
                          <div key={item.category} className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#C5D6CC] font-medium">{item.category}</span>
                              <span className="font-mono text-[#F2F6F0]">
                                {item.hours} hrs ({pct}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[#0B1410] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#26E8B0]"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ==================== FORMATIONS, MUD & CASING TAB ==================== */}
              {quickViewOffsetWell && quickViewTab === 'formations' && (
                <>
                  {/* Formations List */}
                  <div className="p-3.5 rounded-xl bg-[#12221B] border border-[#2B4337] space-y-2.5">
                    <div className="text-xs font-bold text-[#F2F6F0]">
                      Stratigraphic Column &amp; Pore/Fracture Window
                    </div>
                    <div className="space-y-2">
                      {quickViewOffsetWell.formations.map((f) => (
                        <div
                          key={f.code}
                          className="p-2.5 rounded-lg bg-[#162920] border border-[#2B4337] space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#26E8B0]">
                              {f.code} · {f.name}
                            </span>
                            <span className="font-mono text-[11px] text-[#F2F6F0]">
                              {f.topMD} – {f.bottomMD} m MD
                            </span>
                          </div>
                          <div className="flex items-center gap-3 font-mono text-[10px] text-[#D4DE95]">
                            <span>Pore Pressure: {f.porePressureSG} SG</span>
                            <span>·</span>
                            <span>Frac Gradient: {f.fractureGradientSG} SG</span>
                          </div>
                          <p className="text-[11px] text-[#9BB0A3]">{f.riskSummary}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Casing Program */}
                  <div className="p-3.5 rounded-xl bg-[#12221B] border border-[#2B4337] space-y-2">
                    <div className="text-xs font-bold text-[#F2F6F0]">
                      Casing &amp; Liner Setting Depths
                    </div>
                    <div className="space-y-1.5">
                      {quickViewOffsetWell.casingProgram.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#162920] border border-[#2B4337] text-[11px]"
                        >
                          <div>
                            <div className="font-semibold text-[#F2F6F0]">
                              {c.casingODInch} {c.casingType} ({c.holeSizeInch} Hole)
                            </div>
                            <div className="text-[10px] text-[#9BB0A3] font-mono">
                              Grade: {c.gradeWeight}
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="text-[#26E8B0] font-bold">{c.settingDepthMD} m MD</div>
                            <div className="text-[10px] text-[#4ADE80]">{c.status}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mud Program */}
                  <div className="p-3.5 rounded-xl bg-[#12221B] border border-[#2B4337] space-y-2">
                    <div className="text-xs font-bold text-[#F2F6F0]">Drilling Fluid Program</div>
                    <div className="space-y-1.5">
                      {quickViewOffsetWell.mudProgram.map((m, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#162920] border border-[#2B4337] text-[11px]"
                        >
                          <div>
                            <div className="font-semibold text-[#F2F6F0]">{m.mudType}</div>
                            <div className="text-[10px] text-[#9BB0A3] font-mono">
                              {m.intervalMD} ({m.holeSizeInch})
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <div className="text-[#D4DE95] font-bold">{m.densitySG} SG</div>
                            <div className="text-[10px] text-[#9BB0A3]">FL: {m.fluidLossMl}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ==================== ACTIVE RIG QUICK-VIEW CONTENT ==================== */}
              {quickViewActiveRig && quickViewTab === 'overview' && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="p-3 rounded-xl bg-[#12221B] border border-[#2B4337]">
                      <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">
                        Current Depth
                      </div>
                      <div className="font-mono text-base font-bold text-[#26E8B0] mt-0.5">
                        {quickViewActiveRig.currentDepthMD.toFixed(1)} m
                      </div>
                      <div className="text-[10px] text-[#9BB0A3] font-mono">
                        TVD: {quickViewActiveRig.currentDepthTVD.toFixed(1)} m
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#12221B] border border-[#2B4337]">
                      <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">
                        ROP / WOB
                      </div>
                      <div className="font-mono text-base font-bold text-[#4ADE80] mt-0.5">
                        {quickViewActiveRig.rop} m/h
                      </div>
                      <div className="text-[10px] text-[#9BB0A3] font-mono">
                        WOB: {quickViewActiveRig.wob} klbf
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#12221B] border border-[#2B4337]">
                      <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">
                        MW / Live ECD
                      </div>
                      <div className="font-mono text-base font-bold text-[#D4DE95] mt-0.5">
                        {quickViewActiveRig.ecd} SG
                      </div>
                      <div className="text-[10px] text-[#9BB0A3] font-mono">
                        MW: {quickViewActiveRig.mudWeight} SG
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#12221B] border border-[#2B4337]">
                      <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">
                        Rotary Torque
                      </div>
                      <div className="font-mono text-base font-bold text-[#F2F6F0] mt-0.5">
                        {quickViewActiveRig.torque} kN·m
                      </div>
                      <div className="text-[10px] text-[#9BB0A3] font-mono">
                        RPM: {quickViewActiveRig.rpm}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#12221B] border border-[#2B4337]">
                      <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">
                        Standpipe SPP
                      </div>
                      <div className="font-mono text-base font-bold text-[#F2F6F0] mt-0.5">
                        {quickViewActiveRig.spp} psi
                      </div>
                      <div className="text-[10px] text-[#9BB0A3] font-mono">
                        Flow: {quickViewActiveRig.flowRate} L/m
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-[#12221B] border border-[#2B4337]">
                      <div className="text-[10px] font-mono uppercase text-[#9BB0A3]">
                        Next Top Lookahead
                      </div>
                      <div className="font-mono text-base font-bold text-[#FBBF24] mt-0.5">
                        {quickViewActiveRig.nextFormationTopMD} m
                      </div>
                      <div className="text-[10px] text-[#9BB0A3] truncate">
                        {quickViewActiveRig.nextFormation}
                      </div>
                    </div>
                  </div>

                  {/* Live Rig Telemetry Curve */}
                  <div className="p-3.5 rounded-xl bg-[#12221B] border border-[#2B4337] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-[#F2F6F0]">
                        Real-Time WITSML Telemetry · ROP (m/h) &amp; Torque (kN·m)
                      </div>
                      <span className="font-mono text-[10px] text-[#26E8B0]">
                        Live Stream ({quickViewActiveRig.telemetryHistory.length} pts)
                      </span>
                    </div>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={quickViewActiveRig.telemetryHistory}
                          margin={{ top: 6, right: 8, left: -18, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="qvRigRopGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#26E8B0" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#26E8B0" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#22352C" />
                          <XAxis
                            dataKey="timestamp"
                            tick={{ fill: '#9BB0A3', fontSize: 10 }}
                          />
                          <YAxis tick={{ fill: '#9BB0A3', fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0B1410',
                              borderColor: '#26E8B0',
                              borderRadius: '10px',
                              fontSize: '11px',
                              color: '#F2F6F0',
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="rop"
                            stroke="#26E8B0"
                            strokeWidth={2}
                            fill="url(#qvRigRopGrad)"
                          />
                          <Area
                            type="monotone"
                            dataKey="torque"
                            stroke="#D4DE95"
                            strokeWidth={1.5}
                            fillOpacity={0}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#12221B] border border-[#2B4337] space-y-2">
                    <div className="text-xs font-bold text-[#F2F6F0]">
                      Active Lithology &amp; Formation Status
                    </div>
                    <div className="text-xs text-[#26E8B0] font-semibold">
                      Drilling in: {quickViewActiveRig.currentFormation}
                    </div>
                    <div className="text-[11px] text-[#9BB0A3]">
                      Upcoming boundary at {quickViewActiveRig.nextFormationTopMD} m MD (
                      {Math.max(
                        0,
                        quickViewActiveRig.nextFormationTopMD - quickViewActiveRig.currentDepthMD
                      ).toFixed(1)}{' '}
                      m ahead): <strong className="text-[#F2F6F0]">{quickViewActiveRig.nextFormation}</strong>
                    </div>
                  </div>
                </>
              )}

              {quickViewActiveRig && quickViewTab === 'formations' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#12221B] border border-[#2B4337] space-y-2">
                    <div className="text-xs font-bold text-[#F2F6F0]">
                      Active Formation &amp; Horizon Lookahead
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#162920] border border-[#2B4337] space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#26E8B0]">Current Horizon</span>
                        <span className="font-mono text-[#F2F6F0]">
                          {quickViewActiveRig.currentDepthMD.toFixed(1)} m MD
                        </span>
                      </div>
                      <div className="text-xs text-[#F2F6F0] font-medium">
                        {quickViewActiveRig.currentFormation}
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#162920] border border-[#FBBF24]/40 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#FBBF24]">Predicted Next Top</span>
                        <span className="font-mono text-[#FBBF24]">
                          {quickViewActiveRig.nextFormationTopMD} m MD
                        </span>
                      </div>
                      <div className="text-xs text-[#F2F6F0] font-medium">
                        {quickViewActiveRig.nextFormation}
                      </div>
                      <div className="text-[11px] text-[#9BB0A3]">
                        Distance remaining:{' '}
                        {Math.max(
                          0,
                          quickViewActiveRig.nextFormationTopMD - quickViewActiveRig.currentDepthMD
                        ).toFixed(1)}{' '}
                        m ahead of bit
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#12221B] border border-[#2B4337] space-y-2">
                    <div className="text-xs font-bold text-[#F2F6F0]">
                      Live Drilling Fluid &amp; Downhole Hydraulics
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div className="p-2.5 rounded-lg bg-[#162920] border border-[#2B4337]">
                        <div className="text-[10px] text-[#9BB0A3]">Mud Weight (MW)</div>
                        <div className="text-sm font-bold text-[#26E8B0] mt-0.5">
                          {quickViewActiveRig.mudWeight} SG
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#162920] border border-[#2B4337]">
                        <div className="text-[10px] text-[#9BB0A3]">Live ECD</div>
                        <div className="text-sm font-bold text-[#D4DE95] mt-0.5">
                          {quickViewActiveRig.ecd} SG
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#162920] border border-[#2B4337]">
                        <div className="text-[10px] text-[#9BB0A3]">Annular Pressure</div>
                        <div className="text-sm font-bold text-[#F2F6F0] mt-0.5">
                          {quickViewActiveRig.annularPressure} psi
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#162920] border border-[#2B4337]">
                        <div className="text-[10px] text-[#9BB0A3]">Background Gas</div>
                        <div className="text-sm font-bold text-[#FBBF24] mt-0.5">
                          {quickViewActiveRig.gasReading}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== HISTORICAL EVENTS TAB ==================== */}
              {quickViewTab === 'events' && (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-[#F2F6F0] flex items-center justify-between">
                    <span>Recorded Drilling Hazards &amp; Mitigations</span>
                    <span className="font-mono text-[11px] text-[#26E8B0]">
                      {quickViewEvents.length} Events
                    </span>
                  </div>
                  {quickViewEvents.map((evt) => (
                    <div
                      key={evt.eventId}
                      className="p-3.5 rounded-xl bg-[#12221B] border border-[#2B4337] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#26E8B0]">
                          {evt.eventType} @ {evt.depthMD} m MD
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                            evt.severity === 'Critical'
                              ? 'bg-[#F87171]/15 text-[#F87171]'
                              : 'bg-[#FBBF24]/15 text-[#FBBF24]'
                          }`}
                        >
                          {evt.severity} · {evt.nptHours}h NPT
                        </span>
                      </div>
                      <div className="text-[11px] text-[#D4DE95] font-mono">{evt.formation}</div>
                      <p className="text-xs text-[#C5D6CC]">{evt.symptoms}</p>
                      <div className="p-2 rounded-lg bg-[#162920] border border-[#2B4337] text-[11px] text-[#9BB0A3]">
                        <strong className="text-[#4ADE80]">Proven Mitigation:</strong>{' '}
                        {evt.mitigation}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => setInspectedEvent(evt)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#162920] hover:bg-[#26E8B0] text-[#F2F6F0] hover:text-[#080D0B] text-[11px] font-semibold border border-[#2B4337] transition-colors cursor-pointer"
                        >
                          Inspect Full Event Record
                        </button>
                        <button
                          onClick={() =>
                            askAIAbout(
                              `Analyze event ${evt.eventId} (${evt.eventType} at ${evt.depthMD} m MD in ${evt.wellName}) and recommend preventive actions for ${activeWell.wellId}.`
                            )
                          }
                          className="py-1.5 px-2.5 rounded-lg bg-[#26E8B0]/15 hover:bg-[#26E8B0] text-[#26E8B0] hover:text-[#080D0B] text-[11px] font-semibold border border-[#26E8B0]/30 transition-colors cursor-pointer"
                        >
                          Ask AI
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Sticky Drawer Footer Actions */}
            <div className="p-4 border-t border-[#22352C] bg-[#111A16] space-y-2 shrink-0">
              {quickViewOffsetWell ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setQuickViewTarget(null);
                        navigateToWellProfile(quickViewOffsetWell.wellId);
                      }}
                      className="py-2 px-3 rounded-xl bg-[#26E8B0] hover:bg-[#4FF2C3] text-[#080D0B] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Full Offset Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOffsetWellId(quickViewOffsetWell.wellId);
                        setQuickViewTarget(null);
                        setActiveRoute('depth-correlation');
                      }}
                      className="py-2 px-3 rounded-xl bg-[#162920] hover:bg-[#1E352B] text-[#F2F6F0] border border-[#2B4337] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#26E8B0]" />
                      <span>Depth Correlation</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSelectedOffsetWellId(quickViewOffsetWell.wellId);
                        setQuickViewTarget(null);
                        setActiveRoute('parameter-comparison');
                      }}
                      className="py-2 px-3 rounded-xl bg-[#162920] hover:bg-[#1E352B] text-[#F2F6F0] border border-[#2B4337] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#D4DE95]" />
                      <span>Compare Parameters</span>
                    </button>
                    <button
                      onClick={() => {
                        const wid = quickViewOffsetWell.wellId;
                        const wname = quickViewOffsetWell.wellName;
                        setQuickViewTarget(null);
                        askAIAbout(
                          `Summarize key drilling risks, NPT causes, and recommended mud/casing practices from offset well ${wid} (${wname}) for our active well ${activeWell.wellId}.`
                        );
                      }}
                      className="py-2 px-3 rounded-xl bg-[#162920] hover:bg-[#1E352B] text-[#26E8B0] border border-[#26E8B0]/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Ask AI Copilot</span>
                    </button>
                  </div>
                </>
              ) : (
                quickViewActiveRig && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setActiveWellId(quickViewActiveRig.wellId);
                        setQuickViewTarget(null);
                        setActiveRoute('active-well');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-[#26E8B0] hover:bg-[#4FF2C3] text-[#080D0B] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Open Live Telemetry</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveWellId(quickViewActiveRig.wellId);
                        setQuickViewTarget(null);
                        setActiveRoute('risk-prediction');
                      }}
                      className="py-2.5 px-3 rounded-xl bg-[#162920] hover:bg-[#1E352B] text-[#F2F6F0] border border-[#2B4337] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-[#FBBF24]" />
                      <span>150m Risk Lookahead</span>
                    </button>
                  </div>
                )
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};
