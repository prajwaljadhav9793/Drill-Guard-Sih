import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  NavigationRoute,
  ActiveWell,
  OffsetWell,
  DrillingEvent,
  HistoricalDocument,
  AlertItem,
  LessonLearned,
  TelemetryPoint,
  RiskCategoryAssessment,
  IngestionLogEntry,
  UserProfile,
  UserRole,
  AppSettings,
  ToastNotification,
  ExtractedDocEntity,
} from '../types/nwis';
import {
  INITIAL_ACTIVE_WELLS,
  INITIAL_OFFSET_WELLS,
  INITIAL_DRILLING_EVENTS,
  INITIAL_DOCUMENTS,
  INITIAL_ALERTS,
  INITIAL_LESSONS,
  DEMO_USERS,
  DEFAULT_APP_SETTINGS,
  generateInitialTelemetryBuffer,
} from '../data/demoData';

interface NWISContextType {
  activeRoute: NavigationRoute;
  setActiveRoute: (route: NavigationRoute) => void;
  selectedField: string;
  setSelectedField: (field: string) => void;
  activeWells: ActiveWell[];
  activeWell: ActiveWell;
  setActiveWellId: (wellId: string) => void;
  offsetWells: OffsetWell[];
  selectedOffsetWellId: string;
  setSelectedOffsetWellId: (wellId: string) => void;
  selectedOffsetWell: OffsetWell;
  events: DrillingEvent[];
  addEvent: (evt: Omit<DrillingEvent, 'eventId'>) => void;
  updateEvent: (evt: DrillingEvent) => void;
  documents: HistoricalDocument[];
  addDocument: (doc: HistoricalDocument) => void;
  updateDocument: (doc: HistoricalDocument) => void;
  deleteDocument: (docId: string) => void;
  verifyExtractedDocument: (
    docId: string,
    updatedExtracted: ExtractedDocEntity,
    status: 'Verified' | 'Flagged',
    createEventInKB?: boolean
  ) => void;
  alerts: AlertItem[];
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  triggerSampleAlert: (customTitle?: string) => void;
  lessons: LessonLearned[];
  telemetryHistory: TelemetryPoint[];
  simulationStatus: 'running' | 'paused' | 'stopped';
  setSimulationStatus: (status: 'running' | 'paused' | 'stopped') => void;
  resetSimulationTelemetry: () => void;
  ingestionLogs: IngestionLogEntry[];
  riskAssessments: RiskCategoryAssessment[];
  currentUser: UserProfile;
  isAuthenticated: boolean;
  registeredUsers: Array<UserProfile & { password?: string }>;
  loginUser: (
    emailOrBadge: string,
    password?: string,
    targetRoute?: NavigationRoute
  ) => { success: boolean; message: string };
  registerUser: (
    newUser: {
      name: string;
      email: string;
      password?: string;
      role: UserRole;
      department: string;
      shift?: string;
      badgeNumber?: string;
    },
    targetRoute?: NavigationRoute
  ) => { success: boolean; message: string };
  logoutUser: () => void;
  switchUserRole: (role: UserRole) => void;
  updateUserProfile: (updated: Partial<UserProfile>) => void;
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetAllDemoData: () => void;
  // Global Drawers & Modals
  inspectedEvent: DrillingEvent | null;
  setInspectedEvent: (evt: DrillingEvent | null) => void;
  inspectedDocument: HistoricalDocument | null;
  setInspectedDocument: (doc: HistoricalDocument | null) => void;
  inspectedAlert: AlertItem | null;
  setInspectedAlert: (alert: AlertItem | null) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;
  aiInitialPrompt: string;
  askAIAbout: (prompt: string) => void;
  clearAiInitialPrompt: () => void;
  toasts: ToastNotification[];
  addToast: (title: string, message: string, type?: ToastNotification['type']) => void;
  dismissToast: (id: string) => void;
  navigateToWellProfile: (wellId: string) => void;
  navigateToDocById: (docId: string) => void;
  themeMode: 'dark' | 'light';
  setThemeMode: (mode: 'dark' | 'light') => void;
  toggleThemeMode: () => void;
  isMapFullscreen: boolean;
  setIsMapFullscreen: (fullscreen: boolean) => void;
  openFullGISMap: () => void;
}

const NWISContext = createContext<NWISContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ACTIVE_WELLS: 'nwis_indian_active_wells_v3',
  ACTIVE_WELL_ID: 'nwis_indian_active_well_id_v3',
  SELECTED_OFFSET_ID: 'nwis_indian_selected_offset_v3',
  EVENTS: 'nwis_indian_events_v3',
  DOCUMENTS: 'nwis_indian_documents_v3',
  ALERTS: 'nwis_indian_alerts_v3',
  USER: 'nwis_indian_user_v3',
  SETTINGS: 'nwis_indian_settings_v3',
  REGISTERED_USERS: 'nwis_indian_registered_users_v1',
  AUTH_SESSION: 'nwis_indian_auth_session_v1',
  THEME_MODE: 'nwis_theme_mode_v1',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const NWISProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRoute, setActiveRoute] = useState<NavigationRoute>('command-center');
  const [themeMode, setThemeModeState] = useState<'dark' | 'light'>(() =>
    loadFromStorage<'dark' | 'light'>(STORAGE_KEYS.THEME_MODE, 'dark')
  );

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'light') {
      root.classList.add('light-theme');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light-theme');
      root.setAttribute('data-theme', 'dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME_MODE, JSON.stringify(themeMode));
    } catch {
      // Ignore storage errors
    }
  }, [themeMode]);

  const setThemeMode = useCallback((mode: 'dark' | 'light') => {
    setThemeModeState(mode);
  }, []);

  const toggleThemeMode = useCallback(() => {
    setThemeModeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const [isMapFullscreen, setIsMapFullscreen] = useState<boolean>(false);

  const openFullGISMap = useCallback(() => {
    setIsMapFullscreen(true);
    setActiveRoute('nearby-map');
  }, []);
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_APP_SETTINGS)
  );
  const [selectedField, setSelectedFieldState] = useState<string>(settings.defaultField);

  const [activeWells, setActiveWells] = useState<ActiveWell[]>(() =>
    loadFromStorage(STORAGE_KEYS.ACTIVE_WELLS, INITIAL_ACTIVE_WELLS)
  );
  const [activeWellId, setActiveWellIdState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.ACTIVE_WELL_ID, settings.defaultActiveWellId)
  );

  const [offsetWells] = useState<OffsetWell[]>(INITIAL_OFFSET_WELLS);
  const [selectedOffsetWellId, setSelectedOffsetWellId] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.SELECTED_OFFSET_ID, 'NWIS-OFF-001')
  );

  const [events, setEvents] = useState<DrillingEvent[]>(() =>
    loadFromStorage(STORAGE_KEYS.EVENTS, INITIAL_DRILLING_EVENTS)
  );
  const [documents, setDocuments] = useState<HistoricalDocument[]>(() =>
    loadFromStorage(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS)
  );
  const [alerts, setAlerts] = useState<AlertItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.ALERTS, INITIAL_ALERTS)
  );
  const [lessons] = useState<LessonLearned[]>(INITIAL_LESSONS);

  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    loadFromStorage(STORAGE_KEYS.USER, DEMO_USERS[0])
  );

  const [registeredUsers, setRegisteredUsers] = useState<
    Array<UserProfile & { password?: string }>
  >(() =>
    loadFromStorage(
      STORAGE_KEYS.REGISTERED_USERS,
      DEMO_USERS.map((u) => ({ ...u, password: 'oilindia2026' }))
    )
  );

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    loadFromStorage(STORAGE_KEYS.AUTH_SESSION, false)
  );

  const activeWell = useMemo(
    () => activeWells.find((w) => w.wellId === activeWellId) || activeWells[0],
    [activeWells, activeWellId]
  );

  const selectedOffsetWell = useMemo(
    () => offsetWells.find((w) => w.wellId === selectedOffsetWellId) || offsetWells[0],
    [offsetWells, selectedOffsetWellId]
  );

  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>(() =>
    generateInitialTelemetryBuffer(activeWell)
  );
  const [simulationStatus, setSimulationStatus] = useState<'running' | 'paused' | 'stopped'>('running');
  const [ingestionLogs, setIngestionLogs] = useState<IngestionLogEntry[]>(() => [
    {
      id: 'LOG-101',
      timestamp: new Date(Date.now() - 12000).toTimeString().slice(0, 8),
      channel: 'WITSML-1.4.1 / Surface & PWD (Duliajan HQ)',
      status: 'OK',
      message: 'Ingested 12 telemetry channels for OIL-DEMO-042 (Duliajan-042, Depth 2,845.0 m MD, ECD 1.24 SG)',
      latencyMs: 38,
    },
    {
      id: 'LOG-102',
      timestamp: new Date(Date.now() - 8000).toTimeString().slice(0, 8),
      channel: 'NWIS Risk Correlation Engine',
      status: 'WARN',
      message: 'Proximity check matched 4 offset mud-loss/pack-off events within 45 m of active bit depth',
      latencyMs: 14,
    },
    {
      id: 'LOG-103',
      timestamp: new Date(Date.now() - 4000).toTimeString().slice(0, 8),
      channel: 'WITSML-1.4.1 / Surface & PWD',
      status: 'OK',
      message: 'Heartbeat frame verified — Torque 12.8 kN·m, SPP 2,450 psi, Flow 1,650 L/min',
      latencyMs: 41,
    },
  ]);

  // Global overlays
  const [inspectedEvent, setInspectedEvent] = useState<DrillingEvent | null>(null);
  const [inspectedDocument, setInspectedDocument] = useState<HistoricalDocument | null>(null);
  const [inspectedAlert, setInspectedAlert] = useState<AlertItem | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WELLS, JSON.stringify(activeWells));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WELL_ID, JSON.stringify(activeWellId));
      localStorage.setItem(STORAGE_KEYS.SELECTED_OFFSET_ID, JSON.stringify(selectedOffsetWellId));
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(registeredUsers));
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, JSON.stringify(isAuthenticated));
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // ignore storage quota errors
    }
  }, [activeWells, activeWellId, selectedOffsetWellId, events, documents, alerts, currentUser, registeredUsers, isAuthenticated, settings]);

  // Global keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToast = useCallback(
    (title: string, message: string, type: ToastNotification['type'] = 'info') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setActiveWellId = useCallback(
    (wellId: string) => {
      setActiveWellIdState(wellId);
      const found = activeWells.find((w) => w.wellId === wellId);
      if (found) {
        setSelectedFieldState(found.field);
        setTelemetryHistory(generateInitialTelemetryBuffer(found));
        const matchingOffset = offsetWells.find((o) => o.field === found.field);
        if (matchingOffset) {
          setSelectedOffsetWellId(matchingOffset.wellId);
        }
        addToast('Active Well Switched', `Now monitoring ${found.wellId} (${found.wellName}) at ${found.currentDepthMD.toLocaleString()} m MD.`, 'info');
      }
    },
    [activeWells, offsetWells, addToast]
  );

  const setSelectedField = useCallback(
    (field: string) => {
      setSelectedFieldState(field);
      const matchingActive = activeWells.find((w) => w.field === field);
      if (matchingActive && matchingActive.wellId !== activeWellId) {
        setActiveWellIdState(matchingActive.wellId);
        setTelemetryHistory(generateInitialTelemetryBuffer(matchingActive));
      }
      const matchingOffset = offsetWells.find((o) => o.field === field);
      if (matchingOffset) {
        setSelectedOffsetWellId(matchingOffset.wellId);
      }
      addToast('Indian Basin Switched', `Switched spatial and telemetry focus to ${field}.`, 'info');
    },
    [activeWells, offsetWells, activeWellId, addToast]
  );

  // Live Telemetry Simulation Loop
  useEffect(() => {
    if (simulationStatus !== 'running') return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeLabel = now.toTimeString().slice(0, 8);
      const phase = Date.now() / 4000;
      const uniqueLogId = `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const currentWell =
        activeWells.find((w) => w.wellId === activeWellId) || activeWells[0];
      if (!currentWell) return;

      const newDepthMD = Number((currentWell.currentDepthMD + 0.05).toFixed(2));
      const newDepthTVD = Number((newDepthMD * 0.978).toFixed(2));
      const rop = Number(Math.max(8, currentWell.rop + Math.sin(phase) * 0.45).toFixed(1));
      const wob = Number(Math.max(8, currentWell.wob + Math.cos(phase * 1.1) * 0.25).toFixed(1));
      const rpm = Math.round(125 + Math.sin(phase * 0.9) * 3);
      const torque = Number(Math.max(7, 12.8 + Math.sin(phase * 1.4) * 0.85).toFixed(2));
      const spp = Math.round(2450 + Math.cos(phase * 0.8) * 28);
      const flowRate = Math.round(1650 + Math.sin(phase * 0.6) * 12);
      const ecd = Number((currentWell.mudWeight + 0.06 + Math.sin(phase) * 0.008).toFixed(2));
      const hookLoad = Number((114.5 + Math.cos(phase * 0.5) * 0.9).toFixed(1));
      const annularPressure = Math.round(2190 + Math.sin(phase) * 15);

      const newPoint: TelemetryPoint = {
        timestamp: now.toISOString(),
        timeLabel,
        depthMD: newDepthMD,
        depthTVD: newDepthTVD,
        bitDepth: newDepthMD,
        rop,
        wob,
        rpm,
        torque,
        spp,
        flowRate,
        mudWeight: currentWell.mudWeight,
        ecd,
        hookLoad,
        annularPressure,
      };

      setActiveWells((prevWells) =>
        prevWells.map((w) =>
          w.wellId !== activeWellId
            ? w
            : {
                ...w,
                currentDepthMD: newDepthMD,
                currentDepthTVD: newDepthTVD,
                bitDepthMD: newDepthMD,
                rop,
                wob,
                rpm,
                torque,
                spp,
                flowRate,
                ecd,
                hookLoad,
                annularPressure,
                lastUpdated: `${timeLabel} (Simulated Live)`,
              }
        )
      );

      setTelemetryHistory((prevHist) => [...prevHist.slice(-49), newPoint]);

      setIngestionLogs((prevLogs) => [
        {
          id: uniqueLogId,
          timestamp: timeLabel,
          channel: 'WITSML-1.4.1 / Surface & PWD',
          status: torque > settings.torqueAlertThresholdKnm ? 'WARN' : 'OK',
          message: `Frame [${currentWell.wellId}] MD: ${newDepthMD.toFixed(2)}m | ROP: ${rop} m/hr | Trq: ${torque} kN·m | SPP: ${spp} psi | ECD: ${ecd} SG`,
          latencyMs: Math.round(32 + Math.random() * 19),
        },
        ...prevLogs.slice(0, 29),
      ]);
    }, settings.simulationIntervalMs || 2500);

    return () => clearInterval(interval);
  }, [
    simulationStatus,
    activeWellId,
    activeWells,
    settings.simulationIntervalMs,
    settings.torqueAlertThresholdKnm,
  ]);

  const resetSimulationTelemetry = useCallback(() => {
    setActiveWells(INITIAL_ACTIVE_WELLS);
    const base = INITIAL_ACTIVE_WELLS.find((w) => w.wellId === activeWellId) || INITIAL_ACTIVE_WELLS[0];
    setTelemetryHistory(generateInitialTelemetryBuffer(base));
    addToast('Simulation Reset', 'Active well depth and synthetic telemetry channels restored to baseline.', 'info');
  }, [activeWellId, addToast]);

  // Explainable Rule-Based Risk Assessments
  const riskAssessments = useMemo<RiskCategoryAssessment[]>(() => {
    const depth = activeWell.currentDepthMD;
    const nearbyLossEvents = events.filter(
      (e) => e.eventType === 'Mud Loss' && Math.abs(e.depthMD - depth) <= 80
    );
    const nearbyStuckEvents = events.filter(
      (e) => e.eventType === 'Stuck Pipe' && Math.abs(e.depthMD - depth) <= 80
    );
    const torqueRatio = activeWell.torque / settings.torqueAlertThresholdKnm;
    const distanceToFmtD = Math.max(0, activeWell.nextFormationTopMD - depth);

    return [
      {
        category: 'Mud Loss',
        status: nearbyLossEvents.length >= 2 || activeWell.ecd >= 1.25 ? 'High Watch' : 'Moderate',
        score: Math.min(96, 68 + nearbyLossEvents.length * 7 + (activeWell.ecd >= 1.24 ? 6 : 0)),
        evidenceCoverage: 'High (3 Verified Offset Wells within 7.5 km)',
        relevantDepthInterval: '2,860 – 2,920 m MD',
        relevantFormation: activeWell.currentFormation,
        supportingWells: ['NWIS-OFF-001', 'NWIS-OFF-003', 'NWIS-OFF-008'],
        historicalEventCount: events.filter((e) => e.eventType === 'Mud Loss').length,
        dataFreshness: activeWell.lastUpdated,
        contributingIndicators: [
          `Active depth (${depth.toFixed(1)} m MD) is within ${Math.max(0, 2865 - depth).toFixed(0)} m of verified Tipam fracture zone`,
          `Current ECD (${activeWell.ecd} SG) vs 1.27 SG historical fracture reopening gradient`,
          `Duliajan-East-101 (NWIS-OFF-001, 1.1 km NE) lost 42 bbl in 35 min at 2,875 m MD`,
        ],
        ruleExplanation: `Rule [RL-LOSS-01]: Triggered when active bit depth is within ${settings.mudLossProximityWindowM} m of >=2 verified offset mud-loss events OR when simulated ECD >= 1.24 SG in Tipam Sandstone Formation.`,
        recommendedReviewActions: [
          'Verify 25–35 ppb sized CaCO3 + graphite LCM pill readiness in active pill pit',
          'Review pump rate staging to maintain PWD ECD <= 1.25 SG across 2,860–2,920 m MD',
        ],
      },
      {
        category: 'Stuck Pipe',
        status: nearbyStuckEvents.length >= 1 ? 'High Watch' : 'Moderate',
        score: Math.min(92, 74 + Math.round((activeWell.torque - 11) * 4)),
        evidenceCoverage: 'High (2 Verified Offset Incidents)',
        relevantDepthInterval: '2,870 – 2,905 m MD',
        relevantFormation: activeWell.currentFormation,
        supportingWells: ['NWIS-OFF-002', 'NWIS-OFF-007'],
        historicalEventCount: events.filter((e) => e.eventType === 'Stuck Pipe').length,
        dataFreshness: activeWell.lastUpdated,
        contributingIndicators: [
          `Naharkatiya-North-102 (NWIS-OFF-002, 1.8 km SW) experienced mechanical pack-off at 2,890 m MD`,
          `Current rotary torque (${activeWell.torque} kN·m) monitored against ${settings.torqueAlertThresholdKnm} kN·m threshold`,
          `Brittle Tipam shale interbeds prone to spalling during elevator POOH`,
        ],
        ruleExplanation: 'Rule [RL-STUCK-02]: Elevates mechanical pack-off indicator when approaching 2,870–2,905 m MD shale interbeds or when rotary torque fluctuation exceeds baseline.',
        recommendedReviewActions: [
          'Circulate minimum 2x bottoms-up with tandem sweeps prior to any wiper trip',
          'Avoid pulling out on elevators without back-reaming through tight spots in Tipam Sandstone Formation',
        ],
      },
      {
        category: 'Torque Spike',
        status: torqueRatio >= 0.88 ? 'Elevated' : 'Moderate',
        score: Math.min(95, Math.round(torqueRatio * 78)),
        evidenceCoverage: 'High (3 Offset Wells in Tipam Sandstone)',
        relevantDepthInterval: '2,850 – 2,910 m MD',
        relevantFormation: activeWell.currentFormation,
        supportingWells: ['NWIS-OFF-003', 'NWIS-OFF-002', 'NWIS-OFF-009'],
        historicalEventCount: events.filter((e) => e.eventType === 'Torque Spike').length,
        dataFreshness: activeWell.lastUpdated,
        contributingIndicators: [
          `Simulated Torque: ${activeWell.torque} kN·m (Threshold: ${settings.torqueAlertThresholdKnm} kN·m)`,
          `Tengakhat-103 (NWIS-OFF-003) recorded 17.2 kN·m spike across calcareous stringers at 2,860 m MD`,
        ],
        ruleExplanation: `Rule [RL-TRQ-03]: Compares live rotary torque (${activeWell.torque} kN·m) against configurable threshold (${settings.torqueAlertThresholdKnm} kN·m) and offset stringer depths.`,
        recommendedReviewActions: [
          'Verify top-drive soft-torque damping parameters',
          'Review autodriller WOB upper limit ahead of 2,860 m MD calcareous stringers',
        ],
      },
      {
        category: 'Kick / Pressure Risk',
        status: distanceToFmtD < 220 ? 'Elevated' : 'Nominal',
        score: distanceToFmtD < 220 ? 64 : 32,
        evidenceCoverage: 'High (Hugrijan-104 & Baghjan-112)',
        relevantDepthInterval: '3,040 – 3,180 m MD',
        relevantFormation: 'Girujan Clay — Transition Shale (Upcoming)',
        supportingWells: ['NWIS-OFF-004', 'NWIS-OFF-012'],
        historicalEventCount: events.filter((e) => e.eventType === 'Kick / Influx' || e.eventType === 'Overpressure').length,
        dataFreshness: activeWell.lastUpdated,
        contributingIndicators: [
          `${distanceToFmtD.toFixed(0)} m above projected Girujan Clay top (3,040 m MD)`,
          `Current MW (${activeWell.mudWeight} SG) vs Girujan Clay pore pressure (1.29 SG)`,
          `Hugrijan-104 (NWIS-OFF-004) took 12.4 bbl gas influx at 3,085 m MD with 1.19 SG mud`,
        ],
        ruleExplanation: 'Rule [RL-KICK-04]: Evaluates remaining vertical distance to overpressured Girujan Clay top (3,040 m MD) and current mud weight differential.',
        recommendedReviewActions: [
          'Confirm 7" casing/liner setting depth (~3,030 m MD) above Girujan Clay transition zone',
          'Verify barite stock at Duliajan rig site for planned mud weight ramp to 1.28–1.30 SG in next hole section',
        ],
      },
      {
        category: 'Wellbore Instability',
        status: 'Moderate',
        score: 58,
        evidenceCoverage: 'Medium-High (Kathaloni-106 & Chabua-110)',
        relevantDepthInterval: '2,860 – 3,040 m MD',
        relevantFormation: activeWell.currentFormation,
        supportingWells: ['NWIS-OFF-006', 'NWIS-OFF-010'],
        historicalEventCount: events.filter((e) => e.eventType === 'Wellbore Instability' || e.eventType === 'Fishing').length,
        dataFreshness: activeWell.lastUpdated,
        contributingIndicators: [
          'Open-hole exposure duration tracking (currently Day 4 in 8-1/2" section vs 6-day guideline)',
          'Kathaloni-106 (NWIS-OFF-006) experienced collapse and twist-off after 9 days open-hole exposure',
        ],
        ruleExplanation: 'Rule [RL-INSTAB-05]: Tracks open-hole exposure time in Tipam Sandstone Formation against the 6-day historical stability threshold from FWR-DEMO-002.',
        recommendedReviewActions: [
          'Maintain KCl concentration >= 7.0 wt% and monitor shale shaker cavings morphology every 2 hours',
        ],
      },
      {
        category: 'Drag Risk',
        status: 'Moderate',
        score: 49,
        evidenceCoverage: 'Medium (Digboi-West-111)',
        relevantDepthInterval: '2,790 – 2,850 m MD',
        relevantFormation: activeWell.currentFormation,
        supportingWells: ['NWIS-OFF-011'],
        historicalEventCount: events.filter((e) => e.eventType === 'Drag').length,
        dataFreshness: activeWell.lastUpdated,
        contributingIndicators: [
          `Hook load currently ${activeWell.hookLoad} klbf`,
          'Digboi-West-111 (NWIS-OFF-011) recorded 32 klbf overpull across 4.2°/30m micro-dogleg at 2,810 m MD',
        ],
        ruleExplanation: 'Rule [RL-DRAG-06]: Correlates local dogleg severity and interbedded stringer ledges with hook-load pick-up trends.',
        recommendedReviewActions: [
          'Plot broomstick pick-up/slack-off weights at every stand connection',
        ],
      },
      {
        category: 'Cementing Risk',
        status: 'Moderate',
        score: 54,
        evidenceCoverage: 'Medium (Duliajan-East-101 & Chabua-110)',
        relevantDepthInterval: '1,890 – 3,030 m MD (Upcoming 7" Liner)',
        relevantFormation: activeWell.currentFormation,
        supportingWells: ['NWIS-OFF-001', 'NWIS-OFF-010'],
        historicalEventCount: events.filter((e) => e.eventType === 'Cementing Issue').length,
        dataFreshness: activeWell.lastUpdated,
        contributingIndicators: [
          'Duliajan-East-101 (NWIS-OFF-001) lost 18 bbl of 1.58 SG cement slurry across 2,875 m MD fracture zone',
          'Naharkatiya-North-102 & Tengakhat-103 achieved 100% returns using 1.48–1.54 SG microsphere slurry',
        ],
        ruleExplanation: 'Rule [RL-CEM-07]: Flags upcoming casing/liner intervals that span un-isolated historical loss zones.',
        recommendedReviewActions: [
          'Design 7" liner cementing program with low-ECD (<=1.48 SG) lead slurry and fibrous LCM',
        ],
      },
      {
        category: 'NPT Risk',
        status: 'Elevated',
        score: 71,
        evidenceCoverage: 'High (14 Upper Assam Offset Wells Analyzed)',
        relevantDepthInterval: '2,845 – 3,050 m MD',
        relevantFormation: activeWell.currentFormation,
        supportingWells: ['NWIS-OFF-001', 'NWIS-OFF-002', 'NWIS-OFF-006', 'NWIS-OFF-008'],
        historicalEventCount: events.length,
        dataFreshness: activeWell.lastUpdated,
        contributingIndicators: [
          '62% of total field NPT in Tipam Sandstone Formation occurred between 2,860 m and 3,020 m MD',
          'Proactive mitigation on Tengakhat-103 & Naharkatiya-South-109 cut section NPT from 68.5 hrs to <15 hrs',
        ],
        ruleExplanation: 'Rule [RL-NPT-08]: Composite weighted index of historical offset NPT density within ±100 m of current bit depth.',
        recommendedReviewActions: [
          'Conduct pre-tour offset readiness briefing with Rig DSV and Mud Engineer before drilling past 2,855 m MD',
        ],
      },
    ];
  }, [activeWell, events, settings.mudLossProximityWindowM, settings.torqueAlertThresholdKnm]);

  // Actions
  const addEvent = useCallback(
    (evt: Omit<DrillingEvent, 'eventId'>) => {
      const newEvt: DrillingEvent = {
        ...evt,
        eventId: `EVT-DEMO-${100 + events.length + 1}`,
      };
      setEvents((prev) => [newEvt, ...prev]);
      addToast('Drilling Event Added', `Added ${newEvt.eventId} (${newEvt.eventType}) at ${newEvt.depthMD} m MD to Knowledge Base.`, 'success');
    },
    [events.length, addToast]
  );

  const updateEvent = useCallback(
    (updated: DrillingEvent) => {
      setEvents((prev) => prev.map((e) => (e.eventId === updated.eventId ? updated : e)));
      if (inspectedEvent?.eventId === updated.eventId) {
        setInspectedEvent(updated);
      }
      addToast('Event Updated', `Record ${updated.eventId} updated (${updated.verificationStatus}).`, 'success');
    },
    [inspectedEvent, addToast]
  );

  const addDocument = useCallback(
    (doc: HistoricalDocument) => {
      setDocuments((prev) => [doc, ...prev]);
      addToast('Document Uploaded', `${doc.docId} added to repository and queued for AI extraction.`, 'success');
    },
    [addToast]
  );

  const updateDocument = useCallback(
    (doc: HistoricalDocument) => {
      setDocuments((prev) => prev.map((d) => (d.docId === doc.docId ? doc : d)));
      if (inspectedDocument?.docId === doc.docId) {
        setInspectedDocument(doc);
      }
      addToast('Document Updated', `Metadata for ${doc.docId} saved.`, 'info');
    },
    [inspectedDocument, addToast]
  );

  const deleteDocument = useCallback(
    (docId: string) => {
      setDocuments((prev) => prev.filter((d) => d.docId !== docId));
      if (inspectedDocument?.docId === docId) {
        setInspectedDocument(null);
      }
      addToast('Demo Document Deleted', `Removed ${docId} from local prototype repository.`, 'warning');
    },
    [inspectedDocument, addToast]
  );

  const verifyExtractedDocument = useCallback(
    (
      docId: string,
      updatedExtracted: ExtractedDocEntity,
      status: 'Verified' | 'Flagged',
      createEventInKB = false
    ) => {
      const targetDoc = documents.find((d) => d.docId === docId);
      setDocuments((prev) =>
        prev.map((d) =>
          d.docId === docId
            ? {
                ...d,
                extractedData: updatedExtracted,
                verificationStatus: status,
                processingStatus: status === 'Verified' ? 'Indexed' : 'In Review',
                pipelineStage: 11,
              }
            : d
        )
      );

      if (createEventInKB && targetDoc) {
        const parsedDepth = parseInt(updatedExtracted.depthInterval.replace(/[^0-9]/g, '').slice(0, 4), 10) || 2850;
        const newEvent: DrillingEvent = {
          eventId: `EVT-DEMO-${100 + events.length + 1}`,
          wellId: updatedExtracted.wellId || targetDoc.wellId,
          wellName: updatedExtracted.wellId || targetDoc.wellId,
          depthMD: parsedDepth,
          depthTVD: Math.round(parsedDepth * 0.978),
          formation: updatedExtracted.formations[0] || targetDoc.formation,
          eventType: updatedExtracted.detectedEventTypes[0] || 'Mud Loss',
          severity: 'High',
          date: targetDoc.date,
          symptoms: `Extracted from ${docId}: ${updatedExtracted.keyParameters}`,
          rootCause: updatedExtracted.suggestedCause,
          parametersAtEvent: {
            rop: 16.5,
            wob: 15.0,
            rpm: 125,
            torque: 14.2,
            spp: 2480,
            mudWeight: 1.18,
            ecd: 1.24,
          },
          mitigation: updatedExtracted.mitigationSummary,
          outcome: 'Verified via AI Document Processing workflow and indexed in NWIS Knowledge Base.',
          nptHours: 12.0,
          sourceDocId: docId,
          verificationStatus: status,
        };
        setEvents((prev) => [newEvent, ...prev]);
        addToast(
          'Extraction Verified & Indexed',
          `Document ${docId} marked ${status} and event ${newEvent.eventId} committed to Knowledge Base.`,
          'success'
        );
      } else {
        addToast('Extraction Review Saved', `Document ${docId} marked as ${status}.`, 'success');
      }
    },
    [documents, events.length, addToast]
  );

  const acknowledgeAlert = useCallback(
    (alertId: string) => {
      setAlerts((prev) =>
        prev.map((a) =>
          a.alertId === alertId ? { ...a, status: 'Acknowledged', unread: false } : a
        )
      );
      if (inspectedAlert?.alertId === alertId) {
        setInspectedAlert((prev) => (prev ? { ...prev, status: 'Acknowledged', unread: false } : null));
      }
      addToast('Alert Acknowledged', `Alert ${alertId} acknowledged by ${currentUser.name}.`, 'info');
    },
    [currentUser.name, inspectedAlert, addToast]
  );

  const resolveAlert = useCallback(
    (alertId: string) => {
      setAlerts((prev) =>
        prev.map((a) =>
          a.alertId === alertId ? { ...a, status: 'Resolved', unread: false } : a
        )
      );
      if (inspectedAlert?.alertId === alertId) {
        setInspectedAlert((prev) => (prev ? { ...prev, status: 'Resolved', unread: false } : null));
      }
      addToast('Alert Resolved', `Alert ${alertId} marked as resolved and archived in history.`, 'success');
    },
    [inspectedAlert, addToast]
  );

  const triggerSampleAlert = useCallback(
    (customTitle?: string) => {
      const newAlert: AlertItem = {
        alertId: `ALT-DEMO-00${alerts.length + 1}`,
        timestamp: 'Just now',
        wellId: activeWell.wellId,
        depthMD: Math.round(activeWell.currentDepthMD),
        formation: activeWell.currentFormation,
        category: 'Telemetry Threshold',
        severity: 'High',
        title:
          customTitle ||
          `Simulated Torque & ECD Excursion at ${activeWell.currentDepthMD.toFixed(1)} m MD`,
        description: `Simulated telemetry spike triggered during live feed test: Rotary torque reached ${(settings.torqueAlertThresholdKnm + 1.4).toFixed(1)} kN·m with dynamic ECD of 1.26 SG in ${activeWell.currentFormation}.`,
        triggeringEvidence: `Demo Simulator Rule: Torque > ${settings.torqueAlertThresholdKnm} kN·m threshold at ${activeWell.currentDepthMD.toFixed(1)} m MD.`,
        relatedWells: ['NWIS-OFF-001', 'NWIS-OFF-003'],
        relatedDocIds: ['DDR-DEMO-014', 'DDR-DEMO-011'],
        suggestedReviewAction: 'Compare live torque and ECD against NWIS-OFF-003 (2,860 m MD) and verify sweep schedule.',
        status: 'Active',
        unread: true,
      };
      setAlerts((prev) => [newAlert, ...prev]);
      setIngestionLogs((prev) => [
        {
          id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          timestamp: new Date().toTimeString().slice(0, 8),
          channel: 'Drill Guard Alert Engine',
          status: 'EVENT',
          message: `Generated ${newAlert.alertId}: ${newAlert.title}`,
          latencyMs: 11,
        },
        ...prev,
      ]);
      addToast('New Simulated Alert', `${newAlert.alertId}: ${newAlert.title}`, 'warning');
    },
    [alerts.length, activeWell, settings.torqueAlertThresholdKnm, addToast]
  );

  const switchUserRole = useCallback(
    (role: UserRole) => {
      const found =
        registeredUsers.find((u) => u.role === role) ||
        DEMO_USERS.find((u) => u.role === role) || {
          ...currentUser,
          role,
        };
      setCurrentUser(found);
      addToast('Role Switched', `Active role set to ${found.role} (${found.name}).`, 'info');
    },
    [currentUser, registeredUsers, addToast]
  );

  const loginUser = useCallback(
    (emailOrBadge: string, password?: string, targetRoute?: NavigationRoute) => {
      const query = emailOrBadge.trim().toLowerCase();
      if (!query) {
        return { success: false, message: 'Please enter your operational email or badge ID.' };
      }

      const matched = registeredUsers.find(
        (u) =>
          u.email.toLowerCase() === query ||
          u.badgeNumber.toLowerCase() === query ||
          u.name.toLowerCase() === query
      );

      if (!matched) {
        return {
          success: false,
          message: 'No account found with that email or badge ID. Please register or select an Indian Field Profile below.',
        };
      }

      if (matched.password && password && matched.password !== password && password !== 'demo123' && password !== 'oilindia2026') {
        return {
          success: false,
          message: 'Invalid security passphrase. Please verify your credentials.',
        };
      }

      const { password: _removed, ...cleanProfile } = matched;
      setCurrentUser(cleanProfile);
      setIsAuthenticated(true);
      if (targetRoute) {
        setActiveRoute(targetRoute);
      }
      addToast(
        'Authenticated to Drill Guard',
        `Welcome back, ${cleanProfile.name} (${cleanProfile.role}). All 18 Indian oilfield intelligence modules unlocked.`,
        'success'
      );
      return { success: true, message: 'Login successful.' };
    },
    [registeredUsers, addToast]
  );

  const registerUser = useCallback(
    (
      payload: {
        name: string;
        email: string;
        password?: string;
        role: UserRole;
        organization: string;
        badgeId?: string;
      },
      targetRoute?: NavigationRoute
    ) => {
      const cleanName = payload.name.trim();
      const cleanEmail = payload.email.trim().toLowerCase();
      if (!cleanName || !cleanEmail) {
        return { success: false, message: 'Full name and corporate email are required to register.' };
      }

      const exists = registeredUsers.some((u) => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        return {
          success: false,
          message: 'An operator with this email is already registered. Please sign in instead.',
        };
      }

      const newUser: UserProfile & { password?: string } = {
        id: `USR-${100 + registeredUsers.length + 1}`,
        name: cleanName,
        email: cleanEmail,
        role: payload.role,
        department: payload.organization.trim() || 'Upper Assam Basin — Duliajan Field HQ, Assam',
        badgeNumber:
          payload.badgeId?.trim() ||
          `OIL-IND-${Math.floor(1000 + Math.random() * 9000)}`,
        shift: 'Day Shift (06:00 - 18:00 IST)',
        password: payload.password || 'oilindia2026',
      };

      setRegisteredUsers((prev) => [newUser, ...prev]);
      const { password: _pw, ...cleanProfile } = newUser;
      setCurrentUser(cleanProfile);
      setIsAuthenticated(true);
      if (targetRoute) {
        setActiveRoute(targetRoute);
      }
      addToast(
        'Operator Registration Complete',
        `Account provisioned for ${cleanProfile.name} (${cleanProfile.badgeNumber}). Welcome to Drill Guard!`,
        'success'
      );
      return { success: true, message: 'Registration complete.' };
    },
    [registeredUsers, addToast]
  );

  const logoutUser = useCallback(() => {
    setIsAuthenticated(false);
    addToast('Session Ended', 'You have signed out of Drill Guard. Sign in to access operational modules.', 'info');
  }, [addToast]);

  const updateUserProfile = useCallback(
    (updated: Partial<UserProfile>) => {
      setCurrentUser((prev) => ({ ...prev, ...updated }));
      addToast('Profile Updated', 'Demo user profile changes saved to local state.', 'success');
    },
    [addToast]
  );

  const updateSettings = useCallback(
    (partial: Partial<AppSettings>) => {
      setSettings((prev) => ({ ...prev, ...partial }));
      addToast('Settings Saved', 'Operational thresholds and preferences updated.', 'success');
    },
    [addToast]
  );

  const resetAllDemoData = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
    setActiveWells(INITIAL_ACTIVE_WELLS);
    setActiveWellIdState(DEFAULT_APP_SETTINGS.defaultActiveWellId);
    setSelectedOffsetWellId('NWIS-OFF-001');
    setEvents(INITIAL_DRILLING_EVENTS);
    setDocuments(INITIAL_DOCUMENTS);
    setAlerts(INITIAL_ALERTS);
    setCurrentUser(DEMO_USERS[0]);
    setSettings(DEFAULT_APP_SETTINGS);
    setTelemetryHistory(generateInitialTelemetryBuffer(INITIAL_ACTIVE_WELLS[0]));
    addToast('Demo Environment Reset', 'All synthetic wells, events, documents, and alerts restored to factory defaults.', 'info');
  }, [addToast]);

  const navigateToWellProfile = useCallback((wellId: string) => {
    setSelectedOffsetWellId(wellId);
    setActiveRoute('offset-profiles');
  }, []);

  const navigateToDocById = useCallback(
    (docId: string) => {
      const found = documents.find((d) => d.docId === docId);
      if (found) {
        setInspectedDocument(found);
      } else {
        setActiveRoute('knowledge-repo');
      }
    },
    [documents]
  );

  const askAIAbout = useCallback((prompt: string) => {
    setAiInitialPrompt(prompt);
    setActiveRoute('ai-assistant');
  }, []);

  const clearAiInitialPrompt = useCallback(() => {
    setAiInitialPrompt('');
  }, []);

  return (
    <NWISContext.Provider
      value={{
        activeRoute,
        setActiveRoute,
        selectedField,
        setSelectedField,
        activeWells,
        activeWell,
        setActiveWellId,
        offsetWells,
        selectedOffsetWellId,
        setSelectedOffsetWellId,
        selectedOffsetWell,
        events,
        addEvent,
        updateEvent,
        documents,
        addDocument,
        updateDocument,
        deleteDocument,
        verifyExtractedDocument,
        alerts,
        acknowledgeAlert,
        resolveAlert,
        triggerSampleAlert,
        lessons,
        telemetryHistory,
        simulationStatus,
        setSimulationStatus,
        resetSimulationTelemetry,
        ingestionLogs,
        riskAssessments,
        currentUser,
        isAuthenticated,
        registeredUsers,
        loginUser,
        registerUser,
        logoutUser,
        switchUserRole,
        updateUserProfile,
        settings,
        updateSettings,
        resetAllDemoData,
        inspectedEvent,
        setInspectedEvent,
        inspectedDocument,
        setInspectedDocument,
        inspectedAlert,
        setInspectedAlert,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        aiInitialPrompt,
        askAIAbout,
        clearAiInitialPrompt,
        toasts,
        addToast,
        dismissToast,
        navigateToWellProfile,
        navigateToDocById,
        themeMode,
        setThemeMode,
        toggleThemeMode,
        isMapFullscreen,
        setIsMapFullscreen,
        openFullGISMap,
      }}
    >
      {children}
    </NWISContext.Provider>
  );
};

export const useNWIS = () => {
  const ctx = useContext(NWISContext);
  if (!ctx) throw new Error('useNWIS must be used within NWISProvider');
  return ctx;
};
