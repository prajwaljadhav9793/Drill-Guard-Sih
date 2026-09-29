export type NavigationRoute =
  | 'command-center'
  | 'active-well'
  | 'nearby-map'
  | 'offset-profiles'
  | 'knowledge-repo'
  | 'ai-doc-processing'
  | 'event-intelligence'
  | 'ai-search'
  | 'ai-assistant'
  | 'depth-correlation'
  | 'parameter-comparison'
  | 'risk-prediction'
  | 'live-integration'
  | 'alerts-warnings'
  | 'lessons-learned'
  | 'reports-exports'
  | 'user-management'
  | 'settings';

export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export type EventType =
  | 'Mud Loss'
  | 'Kick / Influx'
  | 'Stuck Pipe'
  | 'Torque Spike'
  | 'Drag'
  | 'Wellbore Instability'
  | 'Fishing'
  | 'Cementing Issue'
  | 'Overpressure'
  | 'Non-Productive Time';

export type VerificationStatus = 'Verified' | 'Pending Review' | 'Flagged';

export type DocumentCategory =
  | 'Well Completion Reports (WCR)'
  | 'Daily Drilling Reports (DDR)'
  | 'Mud Logging Reports'
  | 'Geological Reports'
  | 'Cementing Reports'
  | 'Casing Reports'
  | 'Incident Reports'
  | 'Final Well Reports';

export type UserRole =
  | 'Drilling Engineer'
  | 'Geologist'
  | 'Drilling Supervisor'
  | 'Data Analyst'
  | 'Administrator';

export interface FormationInterval {
  name: string;
  code: string;
  topMD: number;
  bottomMD: number;
  topTVD: number;
  bottomTVD: number;
  lithology: string;
  porePressureSG: number;
  fractureGradientSG: number;
  color: string;
  riskSummary: string;
}

export interface TelemetryPoint {
  timestamp: string;
  timeLabel: string;
  depthMD: number;
  depthTVD: number;
  bitDepth: number;
  rop: number; // m/hr
  wob: number; // klbf
  rpm: number; // rpm
  torque: number; // kN·m
  spp: number; // psi
  flowRate: number; // L/min
  mudWeight: number; // SG
  ecd: number; // SG
  hookLoad: number; // klbf
  annularPressure: number; // psi
}

export interface ActiveWell {
  wellId: string;
  wellName: string;
  field: string;
  status: 'Drilling' | 'Circulating' | 'Tripping' | 'Casing';
  spudDate: string;
  rigName: string;
  lat: number;
  lng: number;
  targetDepthMD: number;
  currentDepthMD: number;
  currentDepthTVD: number;
  bitDepthMD: number;
  currentFormation: string;
  nextFormation: string;
  nextFormationTopMD: number;
  rop: number;
  wob: number;
  rpm: number;
  torque: number;
  spp: number;
  mudWeight: number;
  flowRate: number;
  ecd: number;
  hookLoad: number;
  annularPressure: number;
  lastUpdated: string;
  formations: FormationInterval[];
}

export interface MudProgramRow {
  intervalMD: string;
  holeSizeInch: string;
  mudType: string;
  densitySG: string;
  viscositySecQt: string;
  fluidLossMl: string;
}

export interface CasingProgramRow {
  casingType: string;
  holeSizeInch: string;
  casingODInch: string;
  settingDepthMD: number;
  gradeWeight: string;
  status: string;
}

export interface CementingRecord {
  stage: string;
  casingString: string;
  intervalMD: string;
  slurryDensitySG: number;
  topOfCementMD: number;
  bondQuality: 'Good' | 'Moderate' | 'Channeling Observed';
  notes: string;
}

export interface DepthParameterPoint {
  depthMD: number;
  depthTVD: number;
  days: number;
  rop: number;
  wob: number;
  rpm: number;
  torque: number;
  spp: number;
  flowRate: number;
  mudWeight: number;
  ecd: number;
  hookLoad: number;
}

export interface OffsetWell {
  wellId: string;
  wellName: string;
  field: string;
  lat: number;
  lng: number;
  trajectoryCoords: [number, number][];
  distanceKm: number;
  azimuthDeg: number;
  totalDepthMD: number;
  totalDepthTVD: number;
  spudDate: string;
  completionDate: string;
  status: 'Completed Producer' | 'Plugged & Abandoned' | 'Suspended' | 'Active Injector';
  highestSeverity: SeverityLevel;
  nptHours: number;
  nptBreakdown: { category: string; hours: number }[];
  summary: string;
  riskSummary: string;
  formations: FormationInterval[];
  mudProgram: MudProgramRow[];
  casingProgram: CasingProgramRow[];
  cementingHistory: CementingRecord[];
  depthCurve: DepthParameterPoint[];
}

export interface DrillingEvent {
  eventId: string;
  wellId: string;
  wellName: string;
  depthMD: number;
  depthTVD: number;
  formation: string;
  eventType: EventType;
  severity: SeverityLevel;
  date: string;
  symptoms: string;
  rootCause: string;
  parametersAtEvent: {
    rop: number;
    wob: number;
    rpm: number;
    torque: number;
    spp: number;
    mudWeight: number;
    ecd: number;
  };
  mitigation: string;
  outcome: string;
  nptHours: number;
  sourceDocId: string;
  verificationStatus: VerificationStatus;
}

export interface ExtractedDocEntity {
  wellId: string;
  formations: string[];
  depthInterval: string;
  detectedEventTypes: EventType[];
  keyParameters: string;
  suggestedCause: string;
  mitigationSummary: string;
  confidenceScore: number;
  ocrStatus: 'Extracted (Digital PDF/Text)' | 'Simulated Demo Extraction' | 'OCR Required (Scanned Image)';
}

export interface HistoricalDocument {
  docId: string;
  title: string;
  wellId: string;
  category: DocumentCategory;
  date: string;
  pages: number;
  fileSize: string;
  formation: string;
  processingStatus: 'Indexed' | 'In Review' | 'Processing' | 'OCR Required';
  verificationStatus: VerificationStatus;
  pipelineStage: number; // 1 to 11
  contentPreview: string;
  extractedData: ExtractedDocEntity;
}

export interface AlertItem {
  alertId: string;
  timestamp: string;
  wellId: string;
  depthMD: number;
  formation: string;
  category:
    | 'Approaching Historical Event'
    | 'Formation Risk'
    | 'Telemetry Threshold'
    | 'Data Quality'
    | 'Integration Failure'
    | 'Historical Pattern Match';
  severity: SeverityLevel;
  title: string;
  description: string;
  triggeringEvidence: string;
  relatedWells: string[];
  relatedDocIds: string[];
  suggestedReviewAction: string;
  status: 'Active' | 'Acknowledged' | 'Resolved';
  unread: boolean;
}

export interface LessonLearned {
  lessonId: string;
  sourceWellId: string;
  eventType: EventType;
  formation: string;
  depthMD: number;
  challenge: string;
  documentedCause: string;
  historicalResponse: string;
  recordedOutcome: string;
  outcomeCategory: 'Documented Successful' | 'Documented Unsuccessful' | 'Unverified Observation';
  applicabilityLimitations: string;
  supportingDocId: string;
  verificationStatus: VerificationStatus;
}

export interface RiskCategoryAssessment {
  category:
    | 'Mud Loss'
    | 'Stuck Pipe'
    | 'Kick / Pressure Risk'
    | 'Torque Spike'
    | 'Drag Risk'
    | 'Wellbore Instability'
    | 'Cementing Risk'
    | 'NPT Risk';
  status: 'Elevated' | 'Moderate' | 'Nominal' | 'High Watch';
  score: number; // 0-100 illustrative indicator
  evidenceCoverage: string;
  relevantDepthInterval: string;
  relevantFormation: string;
  supportingWells: string[];
  historicalEventCount: number;
  dataFreshness: string;
  contributingIndicators: string[];
  ruleExplanation: string;
  recommendedReviewActions: string[];
}

export interface IngestionLogEntry {
  id: string;
  timestamp: string;
  channel: string;
  status: 'OK' | 'WARN' | 'EVENT';
  message: string;
  latencyMs: number;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  department: string;
  shift: string;
  badgeNumber: string;
}

export interface AppSettings {
  defaultField: string;
  defaultActiveWellId: string;
  defaultMapRadiusKm: number;
  torqueAlertThresholdKnm: number;
  sppAlertThresholdPsi: number;
  mudLossProximityWindowM: number;
  ropDropWarningPct: number;
  simulationIntervalMs: number;
  emailAlertsEnabled: boolean;
  soundAlertsEnabled: boolean;
  autoCorrelateDepth: boolean;
  compactTables: boolean;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'critical';
}
