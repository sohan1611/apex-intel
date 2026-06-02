// ──────────────────────────────────────────────
// Apex Intel — Shared Type Definitions
// ──────────────────────────────────────────────

/** Signal strength for an investment analysis */
export type SignalStrength = 'STRONG' | 'MODERATE' | 'WEAK';

/** Overall confidence level */
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

/** Pipeline phase status */
export type PhaseStatus = 'queued' | 'running' | 'completed' | 'failed';

/** Agent execution status */
export type AgentStatus = 'waiting' | 'running' | 'completed' | 'failed';

// ──────────────────────────────────────────────
// Report Types
// ──────────────────────────────────────────────

/** A single metric in a report summary */
export interface ReportMetric {
  label: string;
  value: string | number;
  suffix?: string;
  signal?: SignalStrength;
}

/** A risk item surfaced during analysis */
export interface RiskItem {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  source: 'search' | 'inferred';
}

/** Summary entry in reports list (used in analyze page) */
export interface ReportSummary {
  id: string;
  name: string;
  subtitle: string;
  score: number;
  signal: SignalStrength;
  confidence: number;
  redFlags: number;
  createdAt: string;
}

/** Full investment report (simple) */
export interface InvestmentReport {
  id: string;
  name: string;
  subtitle: string;
  score: number;
  signal: SignalStrength;
  confidence: number;
  redFlags: number;
  metrics: ReportMetric[];
  risks: RiskItem[];
  createdAt: string;
}

// ──────────────────────────────────────────────
// Data Model Types (match API/mock data shapes)
// ──────────────────────────────────────────────

/** Source attribution tag */
export interface SourceTag {
  source_type: string;
  label?: string;
  url?: string;
}

/** Score breakdown from scoring engine */
export interface ScoreBreakdown {
  market_opportunity: number;
  competition_intensity: number;
  execution_feasibility: number;
  risk_exposure: number;
  total: number;
  investment_signal: SignalStrength;
  justification: string;
  // Convenience aliases for UI
  marketOpportunity?: number;
  competitionIntensity?: number;
  executionFeasibility?: number;
  riskExposure?: number;
}

/** Assumption entry */
export interface AssumptionEntry {
  assumption: string;
  validation_difficulty: 'HARD' | 'MEDIUM' | 'EASY';
  impact_if_false: 'FATAL' | 'MODERATE' | 'LOW';
  source: string;
}

/** Execution feasibility */
export interface ExecutionFeasibility {
  operational_difficulty: 'HIGH' | 'MEDIUM' | 'LOW';
  capital_requirements: 'HIGH' | 'MEDIUM' | 'LOW';
  time_to_market_estimate: string | null;
  rationale: string;
  source: string;
}

/** Contradiction */
export interface Contradiction {
  description: string;
  resolution_or_flag: string;
}

/** Red flag */
export interface RedFlag {
  flag: string;
  severity: string;
  related_agents: string[];
}

// ──────────────────────────────────────────────
// Full Report (rich object from API/mock data)
// ──────────────────────────────────────────────

/** Full report used in comparison tables and report views */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface FullReport {
  id: string;
  status?: string;
  input_type?: string;
  input_content?: string;
  company_brief?: {
    core_value_prop: string;
    target_customer_segment: string;
    revenue_model: string;
  };
  market_analysis?: {
    tam_estimate: number;
    sam_estimate: number;
    som_estimate: number;
    market_trends: { trend: string; source: string }[];
    confidence_score: number;
    uncertainty_factor: string;
  };
  competitors?: {
    name: string;
    pricing: string;
    positioning: string;
    strengths: string[];
    weaknesses: string[];
    source: string;
  }[];
  skeptic_analysis?: {
    risk: string;
    severity: string;
    rationale: string;
    source: string;
  }[];
  assumptions?: AssumptionEntry[];
  execution_feasibility?: ExecutionFeasibility;
  contradictions?: Contradiction[];
  red_flags?: RedFlag[];
  score?: ScoreBreakdown;
  overall_confidence_score?: number;
  investment_signal?: SignalStrength;
  created_at?: string;
  updated_at?: string;

  // ── Convenience aliases used by UI components ──
  companyName?: string;
  investmentSignal?: SignalStrength;
  investmentScore?: number;
  confidenceScore?: number;
  redFlagCount?: number;
  contradictionCount?: number;
  scoreBreakdown?: {
    marketOpportunity?: number;
    competitionIntensity?: number;
    executionFeasibility?: number;
    riskExposure?: number;
  };
}

// ──────────────────────────────────────────────
// Report List Item (for library/table views)
// ──────────────────────────────────────────────

/** Lightweight report representation for list views and search results */
export interface ReportListItem {
  id: string;
  input_type?: 'url' | 'text';
  input_content?: string;
  status?: string;
  investment_signal?: SignalStrength | null;
  total_score?: number | null;
  created_at?: string;

  // ── Convenience aliases used by UI components ──
  companyName?: string;
  title?: string;
  investmentSignal?: SignalStrength | null;
  investmentScore?: number | null;
  createdAt?: string;
  confidenceScore?: number | null;
}

// ──────────────────────────────────────────────
// Real-time Analysis Status
// ──────────────────────────────────────────────

export interface AnalysisStatus {
  analysis_id: string;
  status: string;
  progress: number;
  current_phase: string;
}

// ──────────────────────────────────────────────
// Pipeline & Agent Types
// ──────────────────────────────────────────────

/** An agent within a pipeline phase */
export interface PipelineAgent {
  name: string;
  status: AgentStatus;
}

/** A phase of the analysis pipeline */
export interface PipelinePhase {
  id: string | number;
  name: string;
  status: PhaseStatus;
  progress: number;
  agents?: PipelineAgent[];
}

/** Agent activity log entry */
export interface AgentLogEntry {
  id?: string;
  timestamp: string;
  agent: string;
  message: string;
  /** Agent status (used in pipeline views) */
  status?: AgentStatus;
  /** Log level type for styling (used in activity log) */
  type?: 'info' | 'success' | 'warning' | 'error';
}
