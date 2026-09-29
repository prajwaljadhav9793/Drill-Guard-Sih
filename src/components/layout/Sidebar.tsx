import React from 'react';
import {
  LayoutDashboard,
  Activity,
  MapPin,
  Database,
  FileText,
  Cpu,
  AlertTriangle,
  Search,
  Bot,
  Layers,
  Sliders,
  ShieldAlert,
  Radio,
  BellRing,
  BookOpen,
  FileSpreadsheet,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { NavigationRoute } from '../../types/nwis';
import { useNWIS } from '../../context/NWISContext';
import { DrillGuardLogo } from '../common/DrillGuardLogo';

interface NavItem {
  id: NavigationRoute;
  label: string;
  icon: React.FC<{ className?: string }>;
  badgeCount?: number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const {
    activeRoute,
    setActiveRoute,
    alerts,
    documents,
    resetAllDemoData,
    logoutUser,
    themeMode,
    toggleThemeMode,
  } = useNWIS();

  const activeAlertsCount = alerts.filter((a) => a.status === 'Active').length;
  const pendingDocsCount = documents.filter((d) => d.verificationStatus === 'Pending Review').length;

  const navGroups: NavGroup[] = [
    {
      group: 'Overview',
      items: [
        { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
        { id: 'active-well', label: 'Active Well', icon: Activity },
        { id: 'nearby-map', label: 'Nearby Wells Map', icon: MapPin },
      ],
    },
    {
      group: 'Intelligence',
      items: [
        { id: 'offset-profiles', label: 'Offset Well Profiles', icon: Database },
        { id: 'knowledge-repo', label: 'Knowledge Repository', icon: FileText },
        {
          id: 'ai-doc-processing',
          label: 'AI Document Processing',
          icon: Cpu,
          badgeCount: pendingDocsCount > 0 ? pendingDocsCount : undefined,
        },
        { id: 'event-intelligence', label: 'Drilling Event Intelligence', icon: AlertTriangle },
        { id: 'ai-search', label: 'AI Search', icon: Search },
        { id: 'ai-assistant', label: 'AI Knowledge Assistant', icon: Bot },
      ],
    },
    {
      group: 'Analytics',
      items: [
        { id: 'depth-correlation', label: 'Depth & Formation Correlation', icon: Layers },
        { id: 'parameter-comparison', label: 'Parameter Comparison', icon: Sliders },
        { id: 'risk-prediction', label: 'Risk Prediction', icon: ShieldAlert },
      ],
    },
    {
      group: 'Operations',
      items: [
        { id: 'live-integration', label: 'Live Data Integration', icon: Radio },
        {
          id: 'alerts-warnings',
          label: 'Alerts & Warnings',
          icon: BellRing,
          badgeCount: activeAlertsCount > 0 ? activeAlertsCount : undefined,
        },
        { id: 'lessons-learned', label: 'Lessons Learned', icon: BookOpen },
      ],
    },
    {
      group: 'System',
      items: [
        { id: 'reports-exports', label: 'Reports & Exports', icon: FileSpreadsheet },
        { id: 'user-management', label: 'User Management', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  const handleSelect = (id: NavigationRoute) => {
    setActiveRoute(id);
    setMobileOpen(false);
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-[#0B1410] text-[#F2F6F0] border-r border-[#22352C] transition-transform duration-200 ease-out no-print ${
          collapsed ? 'w-[72px]' : 'w-[264px]'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header matching Landing Page Drill Guard Logo */}
        <div className="h-16 px-3 flex items-center justify-between border-b border-[#22352C] shrink-0">
          <button
            onClick={() => handleSelect('command-center')}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer min-w-0"
          >
            {collapsed ? (
              <DrillGuardLogo variant="icon" size="md" />
            ) : (
              <DrillGuardLogo variant="horizontal" size="sm" showSubtitle={true} />
            )}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-[#9BB0A3] hover:text-white hover:bg-[#111A16] border border-transparent hover:border-[#22352C] transition-colors cursor-pointer shrink-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-4">
          {navGroups.map((group) => (
            <div key={group.group}>
              {!collapsed && (
                <div className="px-2.5 mb-1.5 text-[10px] font-mono uppercase tracking-widest text-[#8FA89B]">
                  {group.group}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeRoute === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-colors relative group cursor-pointer ${
                        isActive
                          ? 'bg-[#111A16] text-[#F2F6F0] border border-[#26E8B0]/40 shadow-xs'
                          : 'text-[#9BB0A3] hover:text-[#F2F6F0] hover:bg-[#111A16]/70 border border-transparent'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#26E8B0]" />
                      )}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-[#26E8B0]' : 'text-[#9BB0A3] group-hover:text-[#26E8B0]'
                          }`}
                        />
                        {!collapsed && (
                          <span className="truncate text-left">{item.label}</span>
                        )}
                      </div>
                      {!collapsed && item.badgeCount !== undefined && (
                        <span
                          className={`font-mono text-[10px] tabular-nums px-1.5 py-0.5 rounded-md font-bold ${
                            item.id === 'alerts-warnings'
                              ? 'text-[#080D0B] bg-[#F87171]'
                              : 'text-[#080D0B] bg-[#26E8B0]'
                          }`}
                        >
                          {item.badgeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#22352C] bg-[#0B1410] shrink-0 space-y-1.5">
          {!collapsed ? (
            <>
              <button
                type="button"
                onClick={toggleThemeMode}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#C5D6CC] hover:text-[#F2F6F0] bg-[#111A16] hover:bg-[#162920] border border-[#22352C] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  {themeMode === 'dark' ? (
                    <Sun className="w-3.5 h-3.5 text-[#D4DE95]" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-[#26E8B0]" />
                  )}
                  <span>{themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                </span>
                <span className="font-mono text-[10px] uppercase text-[#26E8B0] font-bold">
                  {themeMode}
                </span>
              </button>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={resetAllDemoData}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#C5D6CC] hover:text-[#080D0B] bg-[#111A16] hover:bg-[#26E8B0] border border-[#22352C] transition-colors whitespace-nowrap cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Data</span>
                </button>
                <button
                  onClick={logoutUser}
                  className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#C5D6CC] hover:text-[#F87171] bg-[#111A16] hover:bg-[#F87171]/15 border border-[#22352C] hover:border-[#F87171]/40 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={toggleThemeMode}
                title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="w-full flex items-center justify-center p-2 rounded-lg text-[#9BB0A3] hover:text-[#F2F6F0] hover:bg-[#111A16] transition-colors cursor-pointer"
              >
                {themeMode === 'dark' ? (
                  <Sun className="w-4 h-4 text-[#D4DE95]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#26E8B0]" />
                )}
              </button>
              <button
                onClick={resetAllDemoData}
                title="Reset Demo Data"
                className="w-full flex items-center justify-center p-2 rounded-lg text-[#9BB0A3] hover:text-white hover:bg-[#111A16] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
