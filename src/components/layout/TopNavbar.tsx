import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  Play,
  Pause,
  UserCheck,
  Settings,
  LogOut,
  MapPin,
  Activity,
  Sun,
  Moon,
} from 'lucide-react';
import { useNWIS } from '../../context/NWISContext';
import { DEMO_FIELD_OPTIONS, DEMO_USERS } from '../../data/demoData';
import { NavigationRoute } from '../../types/nwis';
import { DrillGuardShieldMark } from '../common/DrillGuardLogo';

const ROUTE_LABELS: Record<NavigationRoute, { section: string; title: string }> = {
  'command-center': { section: 'Overview', title: 'Command Center' },
  'active-well': { section: 'Overview', title: 'Active Well Telemetry' },
  'nearby-map': { section: 'Overview', title: 'Nearby Wells GIS Map' },
  'offset-profiles': { section: 'Intelligence', title: 'Offset Well Profiles' },
  'knowledge-repo': { section: 'Intelligence', title: 'Document Repository' },
  'ai-doc-processing': { section: 'Intelligence', title: 'AI Document OCR' },
  'event-intelligence': { section: 'Intelligence', title: 'Event Knowledge Base' },
  'ai-search': { section: 'Intelligence', title: 'AI Semantic Search' },
  'ai-assistant': { section: 'Intelligence', title: 'Drill Guard AI Copilot' },
  'depth-correlation': { section: 'Analytics', title: 'Depth Correlation' },
  'parameter-comparison': { section: 'Analytics', title: 'Parameter Comparison' },
  'risk-prediction': { section: 'Analytics', title: 'Risk Lookahead' },
  'live-integration': { section: 'Operations', title: 'WITSML Live Stream' },
  'alerts-warnings': { section: 'Operations', title: 'Alerts & Warnings' },
  'lessons-learned': { section: 'Operations', title: 'Lessons Learned' },
  'reports-exports': { section: 'System', title: 'Reports & Exports' },
  'user-management': { section: 'System', title: 'User Management' },
  'settings': { section: 'System', title: 'System Settings' },
};

const SHORT_FIELD_LABELS: Record<string, string> = {
  'Duliajan–Naharkatiya Oilfield (Dibrugarh, Assam, India)': 'Duliajan–Naharkatiya (Assam)',
  'Digboi–Makum–Baghjan Sector (Tinsukia, Assam, India)': 'Digboi–Baghjan (Assam)',
  'Moran–Sivasagar–Jorhat Block (Upper Assam Basin, India)': 'Moran–Sivasagar (Assam)',
  'Chabua–Tengakhat–Dikom Block (Brahmaputra Valley, India)': 'Chabua–Dikom (Assam)',
  'Barmer–Sanchor Basin — Mangala Sector (Rajasthan, India)': 'Barmer Basin (Rajasthan)',
  'Krishna–Godavari Basin — Rajahmundry Onland (Andhra Pradesh, India)': 'KG Basin (Andhra Pradesh)',
  'Cambay Basin — Ankleshwar–Mehsana Asset (Gujarat, India)': 'Cambay Basin (Gujarat)',
  'Mumbai Offshore Basin — Mumbai High Sector (Maharashtra, India)': 'Mumbai High (Maharashtra)',
  'Cauvery Basin — Karaikal–Nagapattinam Block (Tamil Nadu, India)': 'Cauvery Basin (Tamil Nadu)',
  'Mahanadi Basin — Paradip–Cuttack Shelf (Odisha, India)': 'Mahanadi Basin (Odisha)',
};

interface TopNavbarProps {
  onOpenMobileMenu: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onOpenMobileMenu }) => {
  const {
    activeRoute,
    setActiveRoute,
    selectedField,
    setSelectedField,
    activeWells,
    activeWell,
    setActiveWellId,
    alerts,
    simulationStatus,
    setSimulationStatus,
    currentUser,
    switchUserRole,
    logoutUser,
    setIsCommandPaletteOpen,
    setIsNotificationDrawerOpen,
    themeMode,
    setThemeMode,
    toggleThemeMode,
  } = useNWIS();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadAlertsCount = alerts.filter((a) => a.unread || a.status === 'Active').length;
  const routeMeta = ROUTE_LABELS[activeRoute];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B1410]/95 backdrop-blur-md border-b border-[#22352C] px-4 lg:px-6 grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] items-center gap-4 no-print">
      {/* LEFT ZONE: Mobile Menu + Clean Current Workspace Title */}
      <div className="flex items-center gap-3 min-w-0 justify-self-start">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-[#111A16] border border-[#22352C] text-[#9BB0A3] hover:text-[#F2F6F0] hover:border-[#3B5949] transition-colors cursor-pointer"
          aria-label="Open Navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <DrillGuardShieldMark className="w-7 h-7 sm:hidden" />
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-[#26E8B0]/10 border border-[#26E8B0]/30 font-mono text-[10px] uppercase tracking-wider text-[#26E8B0] font-semibold shrink-0">
            {routeMeta.section}
          </span>
          <h1 className="text-sm sm:text-base font-bold text-[#F2F6F0] tracking-tight truncate">
            {routeMeta.title}
          </h1>
        </div>
      </div>

      {/* CENTER ZONE: Unified Segmented Operational Bar (Matching Landing Page Navbar Style) */}
      <div className="hidden md:flex items-center justify-self-center bg-[#111A16] border border-[#22352C] rounded-xl p-1 divide-x divide-[#22352C] shadow-xs">
        {/* Segment 1: Basin Selector */}
        <div className="flex items-center gap-1.5 px-3 py-1">
          <MapPin className="w-3.5 h-3.5 text-[#26E8B0] shrink-0" />
          <label htmlFor="field-select" className="sr-only">
            Indian Basin Selector
          </label>
          <select
            id="field-select"
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="bg-transparent text-[#C5D6CC] hover:text-white text-xs font-medium focus:outline-none cursor-pointer max-w-[180px] xl:max-w-[215px] truncate"
          >
            {DEMO_FIELD_OPTIONS.map((f) => (
              <option key={f} value={f} className="bg-[#12221B] text-[#F2F6F0]">
                {SHORT_FIELD_LABELS[f] || f}
              </option>
            ))}
          </select>
        </div>

        {/* Segment 2: Active Well Selector */}
        <div className="flex items-center gap-1.5 px-3 py-1">
          <Activity className="w-3.5 h-3.5 text-[#D4DE95] shrink-0" />
          <label htmlFor="well-select" className="sr-only">
            Active Well
          </label>
          <select
            id="well-select"
            value={activeWell.wellId}
            onChange={(e) => setActiveWellId(e.target.value)}
            className="bg-transparent text-[#F2F6F0] font-mono text-xs font-bold focus:outline-none cursor-pointer"
          >
            {activeWells.map((w) => (
              <option key={w.wellId} value={w.wellId} className="bg-[#12221B] text-[#F2F6F0]">
                {w.wellId} · {w.wellName} ({w.currentDepthMD.toFixed(0)}m)
              </option>
            ))}
          </select>
        </div>

        {/* Segment 3: Live Telemetry Simulation Toggle */}
        <button
          onClick={() =>
            setSimulationStatus(simulationStatus === 'running' ? 'paused' : 'running')
          }
          title={
            simulationStatus === 'running'
              ? 'Pause WITSML Telemetry Stream'
              : 'Resume WITSML Telemetry Stream'
          }
          className="flex items-center gap-2 px-3 py-1 text-xs font-mono font-semibold text-[#F2F6F0] hover:text-[#26E8B0] transition-colors cursor-pointer"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              simulationStatus === 'running' ? 'bg-[#26E8B0] animate-pulse' : 'bg-[#FBBF24]'
            }`}
          />
          <span className="hidden xl:inline">
            {simulationStatus === 'running' ? 'LIVE' : 'PAUSED'}
          </span>
          {simulationStatus === 'running' ? (
            <Pause className="w-3 h-3 text-[#26E8B0]" />
          ) : (
            <Play className="w-3 h-3 text-[#FBBF24]" />
          )}
        </button>
      </div>

      {/* RIGHT ZONE: Search + Notifications + User Profile & Sign Out */}
      <div className="flex items-center gap-2 shrink-0 justify-self-end">
        {/* Global Search Command Palette Button */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 h-9 rounded-xl bg-[#111A16] hover:bg-[#162920] border border-[#22352C] hover:border-[#3B5949] text-xs text-[#9BB0A3] hover:text-[#F2F6F0] transition-colors cursor-pointer"
          title="Search wells, events, reports (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-[#26E8B0] shrink-0" />
          <span className="hidden lg:inline whitespace-nowrap">Search...</span>
          <kbd className="hidden sm:inline-block font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#0B1410] text-[#9BB0A3] border border-[#22352C]">
            ⌘K
          </kbd>
        </button>

        {/* Light / Dark Theme Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleThemeMode}
          aria-label={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
          title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="flex items-center gap-1.5 px-2.5 h-9 rounded-xl bg-[#111A16] hover:bg-[#162920] border border-[#22352C] hover:border-[#3B5949] text-xs font-mono font-semibold text-[#F2F6F0] transition-colors cursor-pointer"
        >
          {themeMode === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#D4DE95]" />
              <span className="hidden sm:inline text-[11px]">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#26E8B0]" />
              <span className="hidden sm:inline text-[11px]">Dark</span>
            </>
          )}
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setIsNotificationDrawerOpen(true)}
          className="relative w-9 h-9 rounded-xl bg-[#111A16] hover:bg-[#162920] border border-[#22352C] hover:border-[#3B5949] flex items-center justify-center text-[#9BB0A3] hover:text-[#F2F6F0] transition-colors cursor-pointer"
          aria-label="Open Notifications"
          title="Active Drilling Alerts & Notifications"
        >
          <Bell className="w-4 h-4 text-[#26E8B0]" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#F87171] text-[#080D0B] font-mono text-[10px] font-bold flex items-center justify-center">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* User Profile & Role Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-1.5 pr-2.5 h-9 rounded-xl bg-[#111A16] hover:bg-[#162920] border border-[#22352C] hover:border-[#3B5949] transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-[#26E8B0]/15 border border-[#26E8B0]/40 text-[#26E8B0] flex items-center justify-center text-[11px] font-mono font-bold">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-[#F2F6F0] leading-none whitespace-nowrap">
                {currentUser.name.split(' ').slice(0, 2).join(' ')}
              </div>
              <div className="text-[10px] text-[#26E8B0] font-mono leading-none mt-0.5 whitespace-nowrap">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#9BB0A3]" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#111A16] border border-[#2B4337] shadow-2xl p-3.5 z-50 space-y-3">
              <div className="pb-2.5 border-b border-[#22352C]">
                <div className="text-xs font-bold text-[#F2F6F0]">{currentUser.name}</div>
                <div className="text-[11px] text-[#9BB0A3] mt-0.5">{currentUser.department}</div>
                <div className="text-[11px] font-mono text-[#26E8B0] font-semibold mt-1">
                  {currentUser.role} · {currentUser.badgeNumber}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#9BB0A3] mb-1.5">
                  Switch Operational Role
                </div>
                <div className="space-y-1">
                  {DEMO_USERS.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUserRole(u.role);
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        currentUser.role === u.role
                          ? 'bg-[#26E8B0]/15 text-[#26E8B0] font-bold border border-[#26E8B0]/30'
                          : 'text-[#9BB0A3] hover:text-[#F2F6F0] hover:bg-[#162920]'
                      }`}
                    >
                      <span>{u.role}</span>
                      <span className="text-[10px] font-mono opacity-80">
                        {u.name.split(' ')[1]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#22352C] space-y-2">
                <div className="flex items-center justify-between bg-[#162920] p-1 rounded-xl border border-[#2B4337]">
                  <button
                    type="button"
                    onClick={() => setThemeMode('dark')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      themeMode === 'dark'
                        ? 'bg-[#26E8B0] text-[#080D0B]'
                        : 'text-[#9BB0A3] hover:text-[#F2F6F0]'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeMode('light')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      themeMode === 'light'
                        ? 'bg-[#26E8B0] text-[#080D0B]'
                        : 'text-[#9BB0A3] hover:text-[#F2F6F0]'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light Mode</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveRoute('user-management');
                      setProfileDropdownOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#162920] hover:bg-[#1E352B] text-xs text-[#F2F6F0] font-medium border border-[#2B4337] transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#26E8B0]" />
                    <span>Role Matrix</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveRoute('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#162920] hover:bg-[#1E352B] text-xs text-[#F2F6F0] font-medium border border-[#2B4337] transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#26E8B0]" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-[#22352C]">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logoutUser();
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#F87171]/15 hover:bg-[#F87171] text-[#F87171] hover:text-[#080D0B] text-xs font-bold border border-[#F87171]/30 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out to Landing Page</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clean Compact Sign Out Icon Button */}
        <button
          onClick={logoutUser}
          title="Sign Out to Landing Page"
          aria-label="Sign Out to Landing Page"
          className="w-9 h-9 rounded-xl bg-[#111A16] hover:bg-[#F87171]/15 text-[#9BB0A3] hover:text-[#F87171] border border-[#22352C] hover:border-[#F87171]/40 flex items-center justify-center transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
