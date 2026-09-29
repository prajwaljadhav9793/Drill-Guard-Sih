import React from 'react';
import { ChevronRight, CornerUpLeft } from 'lucide-react';
import { useNWIS } from '../../context/NWISContext';
import { NavigationRoute } from '../../types/nwis';
import { DrillGuardShieldMark } from '../common/DrillGuardLogo';

interface RouteBreadcrumbMeta {
  group: string;
  groupDefaultRoute: NavigationRoute;
  label: string;
  pathSlug: string;
  showSelectedOffset?: boolean;
}

export const BREADCRUMB_ROUTE_MAP: Record<NavigationRoute, RouteBreadcrumbMeta> = {
  'command-center': {
    group: 'Overview',
    groupDefaultRoute: 'command-center',
    label: 'Command Center',
    pathSlug: '/overview/command-center',
  },
  'active-well': {
    group: 'Overview',
    groupDefaultRoute: 'command-center',
    label: 'Active Well',
    pathSlug: '/overview/active-well',
  },
  'nearby-map': {
    group: 'Overview',
    groupDefaultRoute: 'command-center',
    label: 'Nearby Wells Map',
    pathSlug: '/overview/nearby-map',
  },
  'offset-profiles': {
    group: 'Intelligence',
    groupDefaultRoute: 'offset-profiles',
    label: 'Offset Well Profiles',
    pathSlug: '/intelligence/offset-profiles',
    showSelectedOffset: true,
  },
  'knowledge-repo': {
    group: 'Intelligence',
    groupDefaultRoute: 'offset-profiles',
    label: 'Knowledge Repository',
    pathSlug: '/intelligence/knowledge-repo',
  },
  'ai-doc-processing': {
    group: 'Intelligence',
    groupDefaultRoute: 'offset-profiles',
    label: 'AI Document Processing',
    pathSlug: '/intelligence/ai-doc-processing',
  },
  'event-intelligence': {
    group: 'Intelligence',
    groupDefaultRoute: 'offset-profiles',
    label: 'Drilling Event Intelligence',
    pathSlug: '/intelligence/event-intelligence',
  },
  'ai-search': {
    group: 'Intelligence',
    groupDefaultRoute: 'offset-profiles',
    label: 'AI Search',
    pathSlug: '/intelligence/ai-search',
  },
  'ai-assistant': {
    group: 'Intelligence',
    groupDefaultRoute: 'offset-profiles',
    label: 'AI Knowledge Assistant',
    pathSlug: '/intelligence/ai-assistant',
  },
  'depth-correlation': {
    group: 'Analytics',
    groupDefaultRoute: 'depth-correlation',
    label: 'Depth & Formation Correlation',
    pathSlug: '/analytics/depth-correlation',
  },
  'parameter-comparison': {
    group: 'Analytics',
    groupDefaultRoute: 'depth-correlation',
    label: 'Parameter Comparison',
    pathSlug: '/analytics/parameter-comparison',
    showSelectedOffset: true,
  },
  'risk-prediction': {
    group: 'Analytics',
    groupDefaultRoute: 'depth-correlation',
    label: 'Risk Prediction',
    pathSlug: '/analytics/risk-prediction',
  },
  'live-integration': {
    group: 'Operations',
    groupDefaultRoute: 'live-integration',
    label: 'Live Data Integration',
    pathSlug: '/operations/live-integration',
  },
  'alerts-warnings': {
    group: 'Operations',
    groupDefaultRoute: 'live-integration',
    label: 'Alerts & Warnings',
    pathSlug: '/operations/alerts-warnings',
  },
  'lessons-learned': {
    group: 'Operations',
    groupDefaultRoute: 'live-integration',
    label: 'Lessons Learned',
    pathSlug: '/operations/lessons-learned',
  },
  'reports-exports': {
    group: 'System',
    groupDefaultRoute: 'reports-exports',
    label: 'Reports & Exports',
    pathSlug: '/system/reports-exports',
  },
  'user-management': {
    group: 'System',
    groupDefaultRoute: 'reports-exports',
    label: 'User Management',
    pathSlug: '/system/user-management',
  },
  'settings': {
    group: 'System',
    groupDefaultRoute: 'reports-exports',
    label: 'Settings',
    pathSlug: '/system/settings',
  },
};

export const BreadcrumbBar: React.FC = () => {
  const {
    activeRoute,
    setActiveRoute,
    activeWell,
    selectedOffsetWell,
  } = useNWIS();

  const meta = BREADCRUMB_ROUTE_MAP[activeRoute];

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 px-4 py-2 rounded-xl bg-[#111A16]/90 border border-[#22352C] flex flex-wrap items-center justify-between gap-3 text-xs no-print"
    >
      {/* Left: Clean Interactive Route Trail */}
      <ol className="flex flex-wrap items-center gap-1.5 text-[#9BB0A3]">
        <li>
          <button
            onClick={() => setActiveRoute('command-center')}
            className="inline-flex items-center gap-1.5 text-[#F2F6F0] hover:text-[#26E8B0] transition-colors font-bold cursor-pointer"
          >
            <DrillGuardShieldMark className="w-4 h-4" />
            <span>Drill Guard</span>
          </button>
        </li>

        <li aria-hidden="true" className="text-[#3B5949]">
          <ChevronRight className="w-3.5 h-3.5" />
        </li>

        <li>
          <button
            onClick={() => setActiveRoute(meta.groupDefaultRoute)}
            className="text-[#9BB0A3] hover:text-[#F2F6F0] transition-colors cursor-pointer"
          >
            {meta.group}
          </button>
        </li>

        <li aria-hidden="true" className="text-[#3B5949]">
          <ChevronRight className="w-3.5 h-3.5" />
        </li>

        <li>
          <span aria-current="page" className="font-bold text-[#F2F6F0]">
            {meta.label}
          </span>
        </li>

        <li aria-hidden="true" className="text-[#3B5949]">
          <ChevronRight className="w-3.5 h-3.5" />
        </li>

        <li>
          {meta.showSelectedOffset ? (
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#26E8B0]/12 border border-[#26E8B0]/30 text-[#26E8B0] font-semibold">
              {selectedOffsetWell.wellId} ({selectedOffsetWell.wellName})
            </span>
          ) : (
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#26E8B0]/12 border border-[#26E8B0]/30 text-[#26E8B0] font-semibold">
              {activeWell.wellId}
            </span>
          )}
        </li>
      </ol>

      {/* Right: Compact Live Telemetry Strip & Quick Return */}
      <div className="flex items-center gap-3 ml-auto">
        <div className="hidden lg:flex items-center gap-3 font-mono text-[11px] tabular-nums text-[#9BB0A3] bg-[#0B1410] px-3 py-1 rounded-lg border border-[#22352C]">
          <span>
            MD: <strong className="text-[#F2F6F0]">{activeWell.currentDepthMD.toFixed(1)}m</strong>
          </span>
          <span className="text-[#22352C]">|</span>
          <span>
            FM: <strong className="text-[#26E8B0]">{activeWell.currentFormation}</strong>
          </span>
          <span className="text-[#22352C]">|</span>
          <span>
            ROP: <strong className="text-[#4ADE80]">{activeWell.rop} m/h</strong>
          </span>
          <span className="hidden xl:inline text-[#22352C]">|</span>
          <span className="hidden xl:inline">
            ECD: <strong className="text-[#F2F6F0]">{activeWell.ecd} SG</strong>
          </span>
        </div>

        {activeRoute !== 'command-center' && (
          <button
            onClick={() => setActiveRoute('command-center')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#162920] hover:bg-[#26E8B0] text-[#F2F6F0] hover:text-[#080D0B] border border-[#2B4337] text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            <CornerUpLeft className="w-3 h-3" />
            <span>Command Center</span>
          </button>
        )}
      </div>
    </nav>
  );
};
