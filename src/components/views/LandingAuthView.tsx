import React, { useState } from 'react';
import { useNWIS } from '../../context/NWISContext';
import { NavigationRoute, UserRole } from '../../types/nwis';
import { DrillGuardLogo, DrillGuardShieldMark } from '../common/DrillGuardLogo';
import {
  ShieldCheck,
  Lock,
  UserPlus,
  LogIn,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Compass,
  Layers,
  Activity,
  Database,
  BrainCircuit,
  AlertTriangle,
  FileText,
  Sliders,
  CheckCircle2,
  X,
  LayoutGrid,
  Sun,
  Moon,
} from 'lucide-react';

const ALL_MODULES_PREVIEW: Array<{
  route: NavigationRoute;
  title: string;
  category: string;
  desc: string;
  icon: React.FC<{ className?: string }>;
}> = [
  {
    route: 'command-center',
    title: 'Command Center',
    category: 'Operations & GIS',
    desc: 'Multi-rig KPI overview, active Duliajan & Naharkatiya status, and real-time risk matrix.',
    icon: Compass,
  },
  {
    route: 'active-well',
    title: 'Active Well Dashboard',
    category: 'Operations & GIS',
    desc: 'Live WITSML 1.4.1 telemetry, ROP, WOB, torque, hookload, and mud pit surveillance.',
    icon: Activity,
  },
  {
    route: 'nearby-map',
    title: 'Nearby Wells GIS Map (हिन्दी / EN)',
    category: 'Operations & GIS',
    desc: 'Bilingual Hindi & English spatial map of Upper Assam, KG, Cambay & Mumbai High.',
    icon: Compass,
  },
  {
    route: 'offset-profiles',
    title: 'Offset Well Intelligence Profiles',
    category: 'Operations & GIS',
    desc: 'Casing schemes, pore-pressure envelopes, NPT breakdowns, and Tipam/Barail tops.',
    icon: Layers,
  },
  {
    route: 'knowledge-repo',
    title: 'Historical Document Repository',
    category: 'Knowledge & AI',
    desc: 'End-of-Well reports, daily drilling logs, mud recaps, and lithology strips.',
    icon: Database,
  },
  {
    route: 'ai-doc-processing',
    title: 'AI Document Processing & OCR',
    category: 'Knowledge & AI',
    desc: 'Automated table & entity extraction from scanned legacy Oil India / ONGC reports.',
    icon: FileText,
  },
  {
    route: 'event-intelligence',
    title: 'Drilling Event Knowledge Base',
    category: 'Knowledge & AI',
    desc: 'Structured catalog of stuck pipe, lost circulation, kicks, and tight hole incidents.',
    icon: AlertTriangle,
  },
  {
    route: 'ai-search',
    title: 'Semantic AI Search',
    category: 'Knowledge & AI',
    desc: 'Natural-language vector search across offset wells, formations, and lessons.',
    icon: Sparkles,
  },
  {
    route: 'ai-assistant',
    title: 'AI Knowledge Assistant',
    category: 'Knowledge & AI',
    desc: 'Context-aware engineering copilot for downhole troubleshooting and optimization.',
    icon: BrainCircuit,
  },
  {
    route: 'depth-correlation',
    title: 'Depth & Formation Correlation',
    category: 'Correlation & Risk',
    desc: 'Multi-well stratigraphic alignment across Dhekiajuli, Namsang, Tipam, Girujan & Barail.',
    icon: Layers,
  },
  {
    route: 'parameter-comparison',
    title: 'Drilling Parameter Comparison',
    category: 'Correlation & Risk',
    desc: 'Overlay active vs. offset ROP, WOB, RPM, MSE, and standpipe pressure curves.',
    icon: Sliders,
  },
  {
    route: 'live-integration',
    title: 'Drill Guard Live WITSML Stream',
    category: 'Correlation & Risk',
    desc: 'Real-time WITSML ingestion pipeline health, channel latency, and packet verification.',
    icon: Activity,
  },
  {
    route: 'risk-prediction',
    title: 'Drilling Risk Prediction',
    category: 'Correlation & Risk',
    desc: 'Forward-looking 150m hazard lookahead for differential sticking and Girujan clay.',
    icon: ShieldCheck,
  },
  {
    route: 'alerts-warnings',
    title: 'Alerts & Warnings Center',
    category: 'Correlation & Risk',
    desc: 'Prioritized advisory queue with recommended engineering mitigations.',
    icon: AlertTriangle,
  },
  {
    route: 'lessons-learned',
    title: 'Historical Mitigation & Lessons',
    category: 'Governance',
    desc: 'Field-validated best practices and bit/hydraulics recommendations by basin.',
    icon: CheckCircle2,
  },
  {
    route: 'reports-exports',
    title: 'Reports & Exports Builder',
    category: 'Governance',
    desc: 'Generate pre-spud offset intelligence dossiers, morning ops briefs, and exports.',
    icon: FileText,
  },
];

export const LandingAuthView: React.FC = () => {
  const { registeredUsers, loginUser, registerUser, themeMode, toggleThemeMode } = useNWIS();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [modulesDrawerOpen, setModulesDrawerOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [targetRoute, setTargetRoute] = useState<NavigationRoute>('command-center');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState(
    registeredUsers[0]?.email || 'r.sharma@oilindia-nwis.in'
  );
  const [loginPassword, setLoginPassword] = useState('oilindia2026');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Drilling Engineer');
  const [regOrg, setRegOrg] = useState('Oil India — Upper Assam Basin (Duliajan HQ)');
  const [regBadgeId, setRegBadgeId] = useState('');

  const openAuthPortal = (mode: 'login' | 'register', route: NavigationRoute = 'command-center') => {
    setAuthMode(mode);
    setTargetRoute(route);
    setAuthError(null);
    setModulesDrawerOpen(false);
    setAuthModalOpen(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const result = loginUser(loginIdentifier, loginPassword, targetRoute);
    if (!result.success) {
      setAuthError(result.message);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (regPassword.trim().length > 0 && regPassword.trim().length < 4) {
      setAuthError('Please use a security passphrase of at least 4 characters.');
      return;
    }
    const result = registerUser(
      {
        name: regName,
        email: regEmail,
        password: regPassword || 'oilindia2026',
        role: regRole,
        organization: regOrg,
        badgeId: regBadgeId,
      },
      targetRoute
    );
    if (!result.success) {
      setAuthError(result.message);
    }
  };

  const handleQuickProfileSelect = (email: string) => {
    setLoginIdentifier(email);
    setLoginPassword('oilindia2026');
    setAuthError(null);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#080D0B] text-[#F2F6F0] relative select-none font-sans flex flex-col">
      {/* Subtle Ambient Teal/Emerald Spotlight on the Right & Bottom */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            themeMode === 'light'
              ? 'radial-gradient(circle at 72% 42%, rgba(16, 185, 129, 0.14) 0%, rgba(209, 232, 220, 0.35) 42%, rgba(243, 247, 244, 0.98) 80%)'
              : 'radial-gradient(circle at 72% 42%, rgba(34, 211, 153, 0.12) 0%, rgba(19, 42, 33, 0.22) 38%, rgba(8, 13, 11, 0.98) 78%)',
        }}
      />

      {/* Main Centered Single-Page Container */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto h-full px-6 sm:px-10 lg:px-14 flex flex-col justify-between">
        {/* 1. CLEAN TOP NAVIGATION BAR (3-Zone Architectural Grid) */}
        <header className="h-16 shrink-0 grid grid-cols-2 md:grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-[#22352C]/80">
          {/* Left: Official Drill Guard Brand Logo (Adaptive for Light & Dark Mode) */}
          <div className="flex items-center gap-3 justify-self-start">
            <DrillGuardLogo variant="horizontal" size="md" showSubtitle={true} />
          </div>

          {/* Center: Segmented Navigation Bar */}
          <nav className="hidden md:flex items-center justify-self-center bg-[#111A16]/95 border border-[#22352C] rounded-xl p-1 divide-x divide-[#22352C]">
            <button
              onClick={() => setModulesDrawerOpen(true)}
              className="px-4 py-1.5 text-xs font-medium text-[#C5D6CC] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-[#26E8B0]" />
              <span>18 Modules</span>
            </button>
            <button
              onClick={() => openAuthPortal('login', 'nearby-map')}
              className="px-4 py-1.5 text-xs font-medium text-[#C5D6CC] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Indian Basins
            </button>
            <button
              onClick={() => openAuthPortal('login', 'knowledge-repo')}
              className="px-4 py-1.5 text-xs font-medium text-[#C5D6CC] hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Offset Case Studies
            </button>
          </nav>

          {/* Right: Theme Mode Toggle + Clean Auth Actions */}
          <div className="flex items-center gap-2 justify-self-end">
            <button
              type="button"
              onClick={toggleThemeMode}
              title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111A16] hover:bg-[#192821] border border-[#22352C] text-xs font-mono font-semibold text-[#F2F6F0] transition-all cursor-pointer whitespace-nowrap"
            >
              {themeMode === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#D4DE95]" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#26E8B0]" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
            <button
              onClick={() =>
                loginUser(
                  registeredUsers[0]?.email || 'r.sharma@oilindia-nwis.in',
                  'oilindia2026',
                  'command-center'
                )
              }
              title="Instant 1-Click Demo Login"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111A16] hover:bg-[#192821] border border-[#22352C] text-xs font-medium text-[#9BB5A8] hover:text-white transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Demo Access</span>
            </button>
            <button
              onClick={() => openAuthPortal('login')}
              className="px-3.5 py-2 rounded-xl bg-[#111A16] hover:bg-[#192821] border border-[#22352C] text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 text-[#26E8B0]" />
              <span>Login</span>
            </button>
            <button
              onClick={() => openAuthPortal('register')}
              className="px-4 py-2 rounded-xl bg-[#26E8B0] hover:bg-[#4FF2C3] text-[#07120E] text-xs font-bold transition-all shadow-[0_0_24px_rgba(38,232,176,0.28)] cursor-pointer whitespace-nowrap"
            >
              Register
            </button>
          </div>
        </header>

        {/* 2. MAIN HERO SECTION (Clean Split Arrangement: Left Typography, Right Stepped Workflow) */}
        <section className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12 py-4">
          {/* Left 6 Columns: Main Headline, Description & Primary CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111E18] border border-[#233B30] text-[#26E8B0] text-xs font-medium mb-5">
              <DrillGuardShieldMark className="w-4 h-4" />
              <span>Drill Guard · Upper Assam · KG Basin · Cambay · Mumbai High</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-bold tracking-[-0.03em] leading-[1.08] text-white">
              Correlate and predict{' '}
              <span className="block mt-1">
                <span className="text-[#26E8B0]">offset well</span> systems fast
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-sm sm:text-base text-[#9BB5A8] leading-relaxed">
              Generate formation-specific answers, stream real-time WITSML 1.4.1 telemetry, and prevent downhole drilling hazards with unprecedented speed and fidelity.
            </p>

            {/* Primary CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => openAuthPortal('login', 'command-center')}
                className="px-6 py-3.5 rounded-xl text-sm font-bold text-[#07120E] bg-[#26E8B0] hover:bg-[#4FF2C3] transition-all shadow-[0_0_28px_rgba(38,232,176,0.3)] flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Login to Command Center</span>
              </button>

              <button
                onClick={() => openAuthPortal('register', 'command-center')}
                className="px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-[#111A16] hover:bg-[#192821] border border-[#263C32] hover:border-[#26E8B0]/50 transition-all flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-[#26E8B0]" />
                <span>Register Operator</span>
              </button>
            </div>
          </div>

          {/* Right 6 Columns: Clean Cascading Parallelogram Workflow Diagram */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center items-end relative pr-4">
            <div className="w-full max-w-[540px] space-y-3.5">
              {/* Row A: Top 2 Stepped Parallelograms */}
              <div className="flex items-center gap-3.5">
                <div
                  onClick={() => openAuthPortal('login', 'offset-profiles')}
                  className="flex-1 px-5 py-4 rounded-xl bg-[#111916]/90 border border-[#23362D] hover:border-[#26E8B0]/50 transition-all cursor-pointer -skew-x-12 shadow-lg"
                >
                  <div className="skew-x-12 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A9689] block">
                        STAGE 01
                      </span>
                      <span className="text-xs font-semibold text-[#D5E3DC] mt-0.5 block">
                        Offset Study &amp; Benchmarking
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#26E8B0]" />
                  </div>
                </div>

                {/* Highlighted Active Parallelogram */}
                <div
                  onClick={() => openAuthPortal('login', 'depth-correlation')}
                  className="flex-1 px-5 py-4 rounded-xl bg-[#102E24]/95 border-2 border-[#26E8B0] shadow-[0_0_35px_rgba(38,232,176,0.22)] cursor-pointer -skew-x-12"
                >
                  <div className="skew-x-12 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#26E8B0] block">
                        STAGE 02 · ACTIVE AI
                      </span>
                      <span className="text-xs font-bold text-white mt-0.5 block">
                        Tipam &amp; Barail Correlation
                      </span>
                    </div>
                    <Layers className="w-4 h-4 text-[#26E8B0]" />
                  </div>
                </div>
              </div>

              {/* Row B: Indented Stepped Parallelogram */}
              <div className="pl-16 pr-8">
                <div
                  onClick={() => openAuthPortal('login', 'parameter-comparison')}
                  className="w-full px-5 py-4 rounded-xl bg-[#111916]/90 border border-[#23362D] hover:border-[#26E8B0]/50 transition-all cursor-pointer -skew-x-12 shadow-lg"
                >
                  <div className="skew-x-12 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A9689] block">
                        STAGE 03
                      </span>
                      <span className="text-xs font-semibold text-[#D5E3DC] mt-0.5 block">
                        WITSML 1.4.1 Parameter Specification
                      </span>
                    </div>
                    <Sliders className="w-4 h-4 text-[#8FA89B]" />
                  </div>
                </div>
              </div>

              {/* Row C: Further Indented Stepped Parallelogram */}
              <div className="pl-28 pr-2">
                <div
                  onClick={() => openAuthPortal('login', 'risk-prediction')}
                  className="w-full px-5 py-4 rounded-xl bg-[#111916]/90 border border-[#23362D] hover:border-[#26E8B0]/50 transition-all cursor-pointer -skew-x-12 shadow-lg"
                >
                  <div className="skew-x-12 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#7A9689] block">
                        STAGE 04
                      </span>
                      <span className="text-xs font-semibold text-[#D5E3DC] mt-0.5 block">
                        150m Stuck-Pipe &amp; Kick Risk Lookahead
                      </span>
                    </div>
                    <ShieldCheck className="w-4 h-4 text-[#26E8B0]" />
                  </div>
                </div>
              </div>

              {/* Row D: Base Verification Parallelogram */}
              <div className="pl-36">
                <div
                  onClick={() => openAuthPortal('login', 'command-center')}
                  className="w-full px-5 py-3.5 rounded-xl bg-[#0D1411]/90 border border-[#1E2E26] hover:border-[#26E8B0]/50 transition-all cursor-pointer -skew-x-12"
                >
                  <div className="skew-x-12 flex items-center justify-between">
                    <span className="text-xs font-medium text-[#8FA89B]">
                      Real-Time Advisory &amp; Wellsite Execution
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-[#26E8B0]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. COMPACT 6-BOX HORIZONTAL ROW AT BOTTOM (Fits on One Screen, Clean Isometric Cards) */}
        <section className="shrink-0 pb-6 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Box 1: Command Center */}
            <div
              onClick={() => openAuthPortal('login', 'command-center')}
              className="group h-[136px] rounded-xl bg-[#101815]/90 hover:bg-[#15221D] border border-[#21332B] hover:border-[#26E8B0]/60 p-4 flex flex-col justify-between transition-all cursor-pointer"
            >
              <div className="flex-1 flex items-center justify-center">
                <svg className="w-14 h-14" viewBox="0 0 120 120" fill="none">
                  <polygon points="60,16 102,40 60,64 18,40" fill="#1E3A2F" stroke="#26E8B0" strokeWidth="1.5" />
                  <polygon points="18,40 60,64 60,102 18,78" fill="#152921" stroke="#3B6E5C" strokeWidth="1.2" />
                  <polygon points="102,40 60,64 60,102 102,78" fill="#0F1F18" stroke="#3B6E5C" strokeWidth="1.2" />
                  <circle cx="60" cy="40" r="5" fill="#26E8B0" />
                </svg>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#E2ECE7] group-hover:text-[#26E8B0] transition-colors truncate">
                  Command Center
                </span>
                <ArrowRight className="w-3 h-3 text-[#7A9689] group-hover:text-[#26E8B0] shrink-0" />
              </div>
            </div>

            {/* Box 2: Live WITSML Telemetry */}
            <div
              onClick={() => openAuthPortal('login', 'active-well')}
              className="group h-[136px] rounded-xl bg-[#101815]/90 hover:bg-[#15221D] border border-[#21332B] hover:border-[#26E8B0]/60 p-4 flex flex-col justify-between transition-all cursor-pointer"
            >
              <div className="flex-1 flex items-center justify-center">
                <svg className="w-14 h-14" viewBox="0 0 120 120" fill="none">
                  <polygon points="60,22 96,42 60,62 24,42" fill="#173026" stroke="#48826D" strokeWidth="1.2" />
                  <polyline
                    points="26,64 46,48 62,70 78,36 96,54"
                    stroke="#26E8B0"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="78" cy="36" r="4" fill="#D4DE95" />
                </svg>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#E2ECE7] group-hover:text-[#26E8B0] transition-colors truncate">
                  Live WITSML Rig
                </span>
                <ArrowRight className="w-3 h-3 text-[#7A9689] group-hover:text-[#26E8B0] shrink-0" />
              </div>
            </div>

            {/* Box 3: Bilingual Indian GIS */}
            <div
              onClick={() => openAuthPortal('login', 'nearby-map')}
              className="group h-[136px] rounded-xl bg-[#101815]/90 hover:bg-[#15221D] border border-[#21332B] hover:border-[#26E8B0]/60 p-4 flex flex-col justify-between transition-all cursor-pointer"
            >
              <div className="flex-1 flex items-center justify-center">
                <svg className="w-14 h-14" viewBox="0 0 120 120" fill="none">
                  <circle cx="60" cy="56" r="32" fill="#13261E" stroke="#3B6E5C" strokeWidth="1.4" />
                  <ellipse cx="60" cy="56" rx="32" ry="12" stroke="#3B6E5C" strokeWidth="1" />
                  <ellipse cx="60" cy="56" rx="12" ry="32" stroke="#3B6E5C" strokeWidth="1" />
                  <ellipse
                    cx="60"
                    cy="56"
                    rx="42"
                    ry="14"
                    transform="rotate(-20 60 56)"
                    stroke="#26E8B0"
                    strokeWidth="2"
                  />
                  <circle cx="72" cy="48" r="3.5" fill="#D4DE95" />
                </svg>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#E2ECE7] group-hover:text-[#26E8B0] transition-colors truncate">
                  Indian Basins GIS
                </span>
                <ArrowRight className="w-3 h-3 text-[#7A9689] group-hover:text-[#26E8B0] shrink-0" />
              </div>
            </div>

            {/* Box 4: Stratigraphic Correlation */}
            <div
              onClick={() => openAuthPortal('login', 'depth-correlation')}
              className="group h-[136px] rounded-xl bg-[#101815]/90 hover:bg-[#15221D] border border-[#21332B] hover:border-[#26E8B0]/60 p-4 flex flex-col justify-between transition-all cursor-pointer"
            >
              <div className="flex-1 flex items-center justify-center">
                <svg className="w-14 h-14" viewBox="0 0 120 120" fill="none">
                  <polygon points="60,68 98,84 60,100 22,84" fill="#13241D" stroke="#3B6E5C" strokeWidth="1.3" />
                  <polygon points="60,48 98,64 60,80 22,64" fill="#183127" stroke="#53947D" strokeWidth="1.3" />
                  <polygon points="60,28 98,44 60,60 22,44" fill="#1F4234" stroke="#26E8B0" strokeWidth="1.6" />
                </svg>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#E2ECE7] group-hover:text-[#26E8B0] transition-colors truncate">
                  Depth Correlation
                </span>
                <ArrowRight className="w-3 h-3 text-[#7A9689] group-hover:text-[#26E8B0] shrink-0" />
              </div>
            </div>

            {/* Box 5: Risk Prediction */}
            <div
              onClick={() => openAuthPortal('login', 'risk-prediction')}
              className="group h-[136px] rounded-xl bg-[#101815]/90 hover:bg-[#15221D] border border-[#21332B] hover:border-[#26E8B0]/60 p-4 flex flex-col justify-between transition-all cursor-pointer"
            >
              <div className="flex-1 flex items-center justify-center">
                <svg className="w-14 h-14" viewBox="0 0 120 120" fill="none">
                  <path
                    d="M60 20L90 34V58C90 77 77 92 60 98C43 92 30 77 30 58V34L60 20Z"
                    fill="#162D24"
                    stroke="#26E8B0"
                    strokeWidth="1.6"
                  />
                  <path d="M48 58L56 66L74 48" stroke="#D4DE95" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#E2ECE7] group-hover:text-[#26E8B0] transition-colors truncate">
                  Risk Lookahead
                </span>
                <ArrowRight className="w-3 h-3 text-[#7A9689] group-hover:text-[#26E8B0] shrink-0" />
              </div>
            </div>

            {/* Box 6: AI Copilot & OCR */}
            <div
              onClick={() => openAuthPortal('login', 'ai-assistant')}
              className="group h-[136px] rounded-xl bg-[#101815]/90 hover:bg-[#15221D] border border-[#21332B] hover:border-[#26E8B0]/60 p-4 flex flex-col justify-between transition-all cursor-pointer"
            >
              <div className="flex-1 flex items-center justify-center">
                <svg className="w-14 h-14" viewBox="0 0 120 120" fill="none">
                  <rect
                    x="32"
                    y="26"
                    width="56"
                    height="56"
                    rx="12"
                    fill="#162D24"
                    stroke="#26E8B0"
                    strokeWidth="1.6"
                  />
                  <circle cx="50" cy="48" r="4" fill="#26E8B0" />
                  <circle cx="70" cy="48" r="4" fill="#26E8B0" />
                  <path d="M46 64H74" stroke="#D4DE95" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#E2ECE7] group-hover:text-[#26E8B0] transition-colors truncate">
                  AI Copilot &amp; OCR
                </span>
                <ArrowRight className="w-3 h-3 text-[#7A9689] group-hover:text-[#26E8B0] shrink-0" />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL OVERLAY FOR LOGIN / REGISTER */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12221B] border border-[#3B5949] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#172B22] border-b border-[#2B4337] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <DrillGuardShieldMark className="w-9 h-9" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {authMode === 'login' ? 'Sign In to Drill Guard' : 'Register New Drill Guard Operator'}
                  </h3>
                  <p className="text-[11px] text-[#BAC095]">
                    Nearby Wells Intelligence System · Target: <span className="text-[#A3E6B8] font-mono">{targetRoute}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAuthModalOpen(false)}
                className="p-1.5 rounded-lg text-[#BAC095] hover:text-white hover:bg-[#233D31] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 max-h-[82vh] overflow-y-auto">
              {/* Mode Switcher */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[#0C1611] border border-[#2B4337] mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-[#636B2F] text-white'
                      : 'text-[#BAC095] hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-[#636B2F] text-white'
                      : 'text-[#BAC095] hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>

              {authError && (
                <div className="mb-4 p-3 rounded-xl bg-[#C74747]/20 border border-[#C74747]/50 text-xs text-[#FFD2D2] flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#FF8A8A] shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {authMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-[#BAC095] mb-1">
                      Corporate Email or Badge ID
                    </label>
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="r.sharma@oilindia-nwis.in"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0C1611] border border-[#2F4A3C] text-sm text-white focus:outline-none focus:border-[#A3E6B8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#BAC095] mb-1">
                      Security Passphrase
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[#0C1611] border border-[#2F4A3C] text-sm text-white focus:outline-none focus:border-[#A3E6B8]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BAC095] hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In &amp; Enter Main Platform</span>
                  </button>

                  {/* Quick-Select Registered Indian Personnel */}
                  <div className="pt-3 border-t border-[#2B4337]">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-[#BAC095] mb-2">
                      Quick-Fill Indian Field Personnel ({registeredUsers.length}):
                    </p>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {registeredUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleQuickProfileSelect(u.email)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg border text-xs transition-all flex items-center justify-between cursor-pointer ${
                            loginIdentifier.toLowerCase() === u.email.toLowerCase()
                              ? 'bg-[#636B2F]/35 border-[#D4DE95]/60 text-white'
                              : 'bg-[#0C1611]/70 border-[#263C30] text-[#BAC095] hover:text-white'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="font-semibold text-white block truncate">{u.name}</span>
                            <span className="text-[10px] text-[#BAC095]">{u.email}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-[#1B3126] text-[#A3E6B8] text-[10px] font-mono shrink-0">
                            {u.role}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#BAC095] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Er. Prajwal Jadhav"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0C1611] border border-[#2F4A3C] text-sm text-white focus:outline-none focus:border-[#A3E6B8]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#BAC095] mb-1">
                      Corporate Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="prajwal.jadhav@oilindia-nwis.in"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0C1611] border border-[#2F4A3C] text-sm text-white focus:outline-none focus:border-[#A3E6B8]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-[#BAC095] mb-1">
                        Role
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full px-2.5 py-2 rounded-xl bg-[#0C1611] border border-[#2F4A3C] text-xs text-white focus:outline-none focus:border-[#A3E6B8]"
                      >
                        <option value="Drilling Engineer">Drilling Engineer</option>
                        <option value="Geologist">Geologist</option>
                        <option value="Drilling Supervisor">Drilling Supervisor</option>
                        <option value="Data Analyst">Data Analyst</option>
                        <option value="Administrator">Administrator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#BAC095] mb-1">
                        Passphrase *
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 4 chars"
                        className="w-full px-3 py-2 rounded-xl bg-[#0C1611] border border-[#2F4A3C] text-xs text-white focus:outline-none focus:border-[#A3E6B8]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#BAC095] mb-1">
                      Indian Basin / Asset
                    </label>
                    <select
                      value={regOrg}
                      onChange={(e) => setRegOrg(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0C1611] border border-[#2F4A3C] text-xs text-white focus:outline-none focus:border-[#A3E6B8]"
                    >
                      <option value="Oil India — Upper Assam Basin (Duliajan HQ)">
                        Oil India — Upper Assam Basin (Duliajan HQ)
                      </option>
                      <option value="Oil India — Digboi & Baghjan Asset (Tinsukia, Assam)">
                        Oil India — Digboi &amp; Baghjan Asset (Tinsukia)
                      </option>
                      <option value="ONGC — Krishna-Godavari Basin (Kakinada, AP)">
                        ONGC — Krishna-Godavari Basin (Kakinada)
                      </option>
                      <option value="ONGC — Cambay Basin (Ankleshwar, Gujarat)">
                        ONGC — Cambay Basin (Ankleshwar)
                      </option>
                      <option value="ONGC — Mumbai High Offshore (Arabian Sea)">
                        ONGC — Mumbai High Offshore
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#BAC095] mb-1">
                      Employee Badge ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={regBadgeId}
                      onChange={(e) => setRegBadgeId(e.target.value)}
                      placeholder="Auto-assigned if blank (e.g. OIL-IND-4092)"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0C1611] border border-[#2F4A3C] text-xs text-white focus:outline-none focus:border-[#A3E6B8]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#A3E6B8] hover:bg-[#D4DE95] text-[#0E1914] font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Complete Registration &amp; Enter</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL OVERLAY FOR ALL 18 MODULES PREVIEW */}
      {modulesDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-[#12221B] border border-[#3B5949] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-[#172B22] border-b border-[#2B4337] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DrillGuardShieldMark className="w-9 h-9" />
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#A3E6B8]">
                    DRILL GUARD · NEARBY WELLS INTELLIGENCE SYSTEM
                  </span>
                  <h3 className="text-base font-bold text-white">
                    All 18 Drill Guard Modules (Click any module to Login or Register)
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setModulesDrawerOpen(false)}
                className="p-1.5 rounded-lg text-[#BAC095] hover:text-white hover:bg-[#233D31] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_MODULES_PREVIEW.map((mod) => {
                const IconComponent = mod.icon;
                return (
                  <div
                    key={mod.route}
                    onClick={() => openAuthPortal('login', mod.route)}
                    className="group p-3.5 rounded-xl bg-[#0E1914]/90 hover:bg-[#192F25] border border-[#2B4337] hover:border-[#A3E6B8]/60 transition-all cursor-pointer flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#1D3429] border border-[#355243] group-hover:border-[#A3E6B8] flex items-center justify-center text-[#D4DE95] shrink-0 mt-0.5">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="text-xs font-semibold text-white group-hover:text-[#A3E6B8] transition-colors truncate">
                          {mod.title}
                        </h4>
                        <Lock className="w-3 h-3 text-[#BAC095]/60 group-hover:text-[#A3E6B8] shrink-0" />
                      </div>
                      <p className="text-[11px] text-[#BAC095] mt-1 line-clamp-2 leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
