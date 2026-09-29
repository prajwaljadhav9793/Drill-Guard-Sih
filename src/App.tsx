import React, { useState } from 'react';
import { NWISProvider, useNWIS } from './context/NWISContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavbar } from './components/layout/TopNavbar';
import { BreadcrumbBar } from './components/layout/BreadcrumbBar';
import { GlobalOverlays } from './components/layout/GlobalOverlays';
import { CommandCenterView } from './components/views/CommandCenterView';
import { ActiveWellView } from './components/views/ActiveWellView';
import { NearbyMapView } from './components/views/NearbyMapView';
import { OffsetWellProfileView } from './components/views/OffsetWellProfileView';
import { KnowledgeRepoView } from './components/views/KnowledgeRepoView';
import { AIDocProcessingView } from './components/views/AIDocProcessingView';
import { EventIntelligenceView } from './components/views/EventIntelligenceView';
import { AISearchView } from './components/views/AISearchView';
import { AIAssistantView } from './components/views/AIAssistantView';
import { DepthCorrelationView } from './components/views/DepthCorrelationView';
import { ParameterComparisonView } from './components/views/ParameterComparisonView';
import { RiskPredictionView } from './components/views/RiskPredictionView';
import { LiveIntegrationView } from './components/views/LiveIntegrationView';
import { AlertsWarningsView } from './components/views/AlertsWarningsView';
import { LessonsLearnedView } from './components/views/LessonsLearnedView';
import { ReportsExportsView } from './components/views/ReportsExportsView';
import { UserManagementView } from './components/views/UserManagementView';
import { SettingsView } from './components/views/SettingsView';
import { LandingAuthView } from './components/views/LandingAuthView';
import { DrillGuardLogo } from './components/common/DrillGuardLogo';

const NWISApplicationShell: React.FC = () => {
  const { activeRoute, isAuthenticated, themeMode } = useNWIS();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <LandingAuthView />
        <GlobalOverlays />
      </>
    );
  }

  const renderActiveWorkspace = () => {
    switch (activeRoute) {
      case 'command-center':
        return <CommandCenterView />;
      case 'active-well':
        return <ActiveWellView />;
      case 'nearby-map':
        return <NearbyMapView />;
      case 'offset-profiles':
        return <OffsetWellProfileView />;
      case 'knowledge-repo':
        return <KnowledgeRepoView />;
      case 'ai-doc-processing':
        return <AIDocProcessingView />;
      case 'event-intelligence':
        return <EventIntelligenceView />;
      case 'ai-search':
        return <AISearchView />;
      case 'ai-assistant':
        return <AIAssistantView />;
      case 'depth-correlation':
        return <DepthCorrelationView />;
      case 'parameter-comparison':
        return <ParameterComparisonView />;
      case 'risk-prediction':
        return <RiskPredictionView />;
      case 'live-integration':
        return <LiveIntegrationView />;
      case 'alerts-warnings':
        return <AlertsWarningsView />;
      case 'lessons-learned':
        return <LessonsLearnedView />;
      case 'reports-exports':
        return <ReportsExportsView />;
      case 'user-management':
        return <UserManagementView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <CommandCenterView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1914] text-[#F2F6F0] flex flex-col relative transition-colors duration-200">
      {/* Subtle Radial Emerald/Olive Glow & Tactile Grain matching Landing Page */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40 no-print"
        style={{
          background:
            themeMode === 'light'
              ? 'radial-gradient(ellipse 65% 50% at 50% 32%, rgba(16, 185, 129, 0.10), rgba(243, 247, 244, 0) 75%)'
              : 'radial-gradient(ellipse 65% 50% at 50% 32%, rgba(84, 130, 95, 0.20), rgba(14, 25, 20, 0) 75%)',
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] no-print"
        style={{
          backgroundImage:
            themeMode === 'light'
              ? 'radial-gradient(#097956 0.75px, transparent 0.75px), radial-gradient(#556910 0.75px, #F3F7F4 0.75px)'
              : 'radial-gradient(#D4DE95 0.75px, transparent 0.75px), radial-gradient(#A3E6B8 0.75px, #0E1914 0.75px)',
          backgroundSize: '28px 28px',
          backgroundPosition: '0 0, 14px 14px',
        }}
      />

      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      <div
        className={`relative z-10 flex-1 flex flex-col transition-all duration-200 ${
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[264px]'
        }`}
      >
        <TopNavbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
          <BreadcrumbBar />
          {renderActiveWorkspace()}
        </main>

        <footer className="px-6 py-3.5 bg-[#0B1410]/90 backdrop-blur-md border-t border-[#2B4337] text-[11px] text-[#9BB0A3] flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex flex-wrap items-center gap-3">
            <DrillGuardLogo variant="horizontal" size="sm" showSubtitle={false} />
            <span className="hidden sm:inline text-[#2B4337]">|</span>
            <span>
              <strong className="text-[#F2F6F0]">Drill Guard</strong> — Nearby Wells Intelligence System ·{' '}
              <span className="text-[#A3E6B8] font-semibold">
                &ldquo;Every Well Has a Story. Every Decision Has Intelligence.&rdquo;
              </span>
            </span>
          </div>
          <div>
            Drill Guard Enterprise Suite · All Wells, Coordinates &amp; Reports are Synthetic Demo Data
          </div>
        </footer>
      </div>

      <GlobalOverlays />
    </div>
  );
};

export default function App() {
  return (
    <NWISProvider>
      <NWISApplicationShell />
    </NWISProvider>
  );
}
