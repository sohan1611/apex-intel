import type {
  FullReport,
  ReportListItem,
  PipelinePhase,
  AgentLogEntry,
} from '@/types/report';

// ============================================================================
// NutriSync — AI-Powered Personalized Nutrition Platform
// Complete mock analysis for demonstration and development.
// ============================================================================

export const MOCK_REPORT: FullReport = {
  id: 'rpt_nutrisync_a7f3b2c1',
  status: 'completed',
  input_type: 'url',
  input_content: 'https://nutrisync.io',

  // ── Convenience aliases ──
  companyName: 'NutriSync',
  investmentSignal: 'MODERATE',
  investmentScore: 67,
  confidenceScore: 64,
  redFlagCount: 2,
  contradictionCount: 2,

  company_brief: {
    core_value_prop:
      'NutriSync combines continuous glucose monitoring (CGM) data with AI-driven dietary recommendations to deliver hyper-personalized nutrition plans. Unlike generic calorie trackers, it adapts in real-time to metabolic responses, enabling users to optimize energy, weight management, and chronic disease prevention.',
    target_customer_segment:
      'Health-conscious consumers aged 28–55 in the B2C segment, with particular traction among pre-diabetic and metabolically curious individuals willing to pay a premium for data-driven wellness. Secondary segment: corporate wellness programs (B2B2C).',
    revenue_model:
      'Freemium subscription model — free tier with basic tracking, $29/mo Premium tier with CGM integration and AI coaching, $79/mo Enterprise tier for corporate wellness. Additional revenue from affiliate partnerships with supplement and meal-kit brands.',
  },
  market_analysis: {
    tam_estimate: 45_000_000_000,
    sam_estimate: 8_200_000_000,
    som_estimate: 320_000_000,
    market_trends: [
      {
        trend:
          'The global personalized nutrition market is projected to reach $37.3B by 2030, growing at a 15.2% CAGR driven by wearable integration and consumer demand for metabolic health insights.',
        source: 'web_search: Grand View Research, 2025 Market Report',
      },
      {
        trend:
          'CGM adoption among non-diabetic consumers surged 340% between 2023–2025, with Dexcom and Abbott both launching consumer-grade devices. FDA cleared two over-the-counter CGM devices in Q2 2025.',
        source: 'web_search: Bloomberg Health Tech Analysis, Jan 2026',
      },
      {
        trend:
          'Venture funding in AI-nutrition startups exceeded $2.1B in 2025, up 67% year-over-year, signaling strong investor conviction despite broader market pullback.',
        source: 'web_search: PitchBook Emerging Tech Report, 2025',
      },
      {
        trend:
          'Consumer willingness-to-pay for personalized health insights has plateaued in the $25–$40/mo range, suggesting a natural pricing ceiling for subscription-based wellness apps.',
        source: 'inferred: synthesis of Sensor Tower data and consumer survey meta-analysis',
      },
    ],
    confidence_score: 0.72,
    uncertainty_factor:
      'TAM estimates vary significantly across sources (range: $30B–$65B) due to inconsistent definitions of "personalized nutrition." The serviceable market depends heavily on CGM regulatory pathways in EU and APAC markets, which remain uncertain.',
  },
  competitors: [
    {
      name: 'Noom',
      pricing: '$59/mo (annual: $199/yr). Recently launched Noom Med at $149/mo for GLP-1 integrated programs.',
      positioning:
        'Psychology-based weight loss platform pivoting toward clinical outcomes. Emphasis on behavioral change over biometric tracking.',
      strengths: [
        'Massive user base (50M+ downloads) with strong brand recognition',
        'Proven clinical outcomes — 3 peer-reviewed studies showing sustained weight loss',
        'Deep pockets ($600M+ raised) enabling aggressive customer acquisition',
        'Recently integrated GLP-1 medication management, expanding TAM',
      ],
      weaknesses: [
        'High churn rate (~60% at 6 months) suggests weak long-term engagement',
        'No real-time biometric integration — relies on self-reported food logging',
        'User complaints about repetitive coaching content and bot-like interactions',
        'Premium pricing creates barrier for cost-sensitive demographics',
      ],
      source: 'web_search: Noom investor presentations, App Annie data',
    },
    {
      name: 'MyFitnessPal',
      pricing: 'Free tier + $19.99/mo Premium. Acquired by Francisco Partners for $345M in 2020.',
      positioning:
        'Largest food database (14M+ foods) focused on calorie/macro tracking. Utilitarian tool rather than coaching platform.',
      strengths: [
        'Dominant food database moat — 14M+ verified food entries',
        '200M+ registered users providing unmatched network effects for food logging',
        'Extensive API integrations with 50+ fitness devices and platforms',
        'Low-cost acquisition channel through organic search dominance',
      ],
      weaknesses: [
        'Minimal AI/ML capabilities — primarily a manual logging tool',
        'Aging UI/UX that has not meaningfully evolved since 2019',
        'No metabolic or biometric feedback loop',
        'Monetization struggles — ARPU declining despite premium tier launch',
      ],
      source: 'web_search: TechCrunch, company blog, Sensor Tower metrics',
    },
    {
      name: 'Huel',
      pricing: '$2.12–$3.50 per meal. Subscription discounts of 10%. Annual revenue ~$250M.',
      positioning:
        'Complete nutrition meal replacement brand. Product-first approach (powders, bars, ready-to-drink) rather than software/tracking.',
      strengths: [
        'Strong DTC brand with cult-like following in fitness communities',
        'Vertically integrated supply chain with proprietary formulations',
        'High gross margins (~65%) on physical products',
        'Expanding into personalized nutrition with Huel Daily Greens line',
      ],
      weaknesses: [
        'Physical product constraints limit scalability vs. pure software',
        'No AI or personalization engine — one-size-fits-all formulations',
        'Limited appeal beyond fitness enthusiasts and convenience seekers',
        'Vulnerable to supply chain disruption and ingredient cost inflation',
      ],
      source: 'web_search: Huel annual report 2025, Crunchbase',
    },
    {
      name: 'Calibrate',
      pricing: '$1,595/yr for metabolic health program including physician consultations and GLP-1 prescriptions.',
      positioning:
        'Clinical-grade metabolic health platform combining GLP-1 medications, CGM data, and one-on-one coaching. Positioned as a premium medical weight loss solution.',
      strengths: [
        'Medical credibility — physician-led with insurance reimbursement pathways',
        'Integrated CGM data analysis with actionable coaching',
        'Strong clinical outcomes (avg. 15% body weight loss in 12 months)',
        'Defensible moat through medical licensing and pharmacy partnerships',
      ],
      weaknesses: [
        'Very high price point excludes 80%+ of addressable market',
        'Heavily dependent on GLP-1 drug supply chain and insurance approvals',
        'Scaling challenges — requires licensed physicians in each state',
        'Narrow positioning limits expansion into general wellness',
      ],
      source: 'web_search: Calibrate press releases, STAT News coverage',
    },
  ],
  skeptic_analysis: [
    {
      risk: 'The personalized nutrition app market is saturated with 200+ competitors. Customer acquisition costs for health apps have risen 45% since 2024, and organic discovery is increasingly difficult without a differentiated distribution channel.',
      severity: 'HIGH',
      rationale:
        'The top 10 nutrition apps control 78% of market share. New entrants face a brutal CAC environment where Facebook/Instagram CPMs for health-related content have hit $35+. Without a viral loop or partnership-driven distribution, NutriSync risks burning through capital on paid acquisition.',
      source: 'web_search: AppsFlyer Cost Benchmarks 2025, Sensor Tower market share data',
    },
    {
      risk: 'CGM devices used for non-medical purposes face regulatory uncertainty. The FDA has signaled potential reclassification of consumer-grade CGMs, and the EU MDR framework may require additional clinical evidence for wellness claims.',
      severity: 'MEDIUM',
      rationale:
        'While two OTC CGMs were cleared in 2025, the FDA has opened a comment period on "wellness device" marketing claims. A restrictive ruling could force NutriSync to limit its value proposition or pursue costly clinical trials to substantiate health claims.',
      source: 'web_search: FDA Federal Register Notice 2025-18442, EU MDR guidance documents',
    },
    {
      risk: 'Continuous biometric data collection triggers HIPAA, GDPR, and emerging state-level biometric privacy laws. A data breach involving metabolic health data could result in catastrophic reputational and financial damage.',
      severity: 'MEDIUM',
      rationale:
        'NutriSync would process sensitive health data (glucose levels, dietary patterns, body composition) that may qualify as PHI under HIPAA if combined with clinical recommendations. Illinois BIPA and similar statutes impose statutory damages of $1,000–$5,000 per violation.',
      source: 'web_search: IAPP privacy law tracker, HIPAA guidance on wellness apps',
    },
  ],
  assumptions: [
    {
      assumption:
        'Customer acquisition cost (CAC) can be maintained below $40 through a combination of content marketing, CGM manufacturer partnerships, and referral incentives.',
      validation_difficulty: 'HARD',
      impact_if_false: 'FATAL',
      source: 'inferred: based on stated growth model and unit economics targets',
    },
    {
      assumption:
        'Premium subscribers will achieve a 6-month payback period, implying monthly churn below 8% and average revenue per user (ARPU) above $32/mo.',
      validation_difficulty: 'HARD',
      impact_if_false: 'MODERATE',
      source: 'inferred: derived from subscription pricing and industry churn benchmarks',
    },
    {
      assumption:
        'CGM manufacturer APIs (Dexcom, Abbott) will remain accessible for third-party integration without prohibitive licensing fees or data-sharing restrictions.',
      validation_difficulty: 'EASY',
      impact_if_false: 'LOW',
      source: 'web_search: Dexcom developer portal, Abbott LibreView API documentation',
    },
  ],
  execution_feasibility: {
    operational_difficulty: 'MEDIUM',
    capital_requirements: 'HIGH',
    time_to_market_estimate: '8–14 months for MVP with CGM integration; 18–24 months for full AI coaching engine with clinical validation.',
    rationale:
      'Core app development is straightforward, but CGM integration requires FDA-compliant data pipelines, secure health data infrastructure (SOC 2 Type II), and partnerships with device manufacturers. The AI nutrition engine requires training on proprietary metabolic response datasets that do not yet exist — necessitating a costly data collection phase. Team needs at minimum: 2 ML engineers, 1 regulatory specialist, 1 clinical advisor, and 4 full-stack engineers.',
    source: 'inferred: synthesis of technical requirements and comparable startup timelines',
  },
  contradictions: [
    {
      description:
        'The market analysis highlights a 15.2% CAGR and $45B TAM suggesting strong opportunity, while the skeptic analysis flags market saturation with 200+ competitors and rising CAC — these narratives are in tension.',
      resolution_or_flag:
        'Both can be true simultaneously: the market is large and growing, but the value is concentrating among established players. NutriSync\'s success depends on whether CGM-native positioning creates a defensible niche within the broader market.',
    },
    {
      description:
        'The company claims a $29/mo price point is accessible, but competitor analysis shows Noom at $59/mo with high churn and MyFitnessPal struggling to monetize at $19.99/mo — suggesting the $29 price point may face resistance from both directions.',
      resolution_or_flag:
        'Price sensitivity research is needed. The $29 price point sits in an awkward middle ground — too expensive for casual users, too cheap to signal clinical credibility. Consider a two-tier strategy with a lower entry point and premium clinical tier.',
    },
  ],
  red_flags: [
    {
      flag: 'No proprietary dataset or defensible data moat identified. The AI nutrition engine depends on publicly available food databases and generic metabolic research, making the core technology replicable by well-funded competitors within 6–12 months.',
      severity: 'HIGH',
      related_agents: ['market_analyst', 'skeptic', 'scoring_agent'],
    },
    {
      flag: 'Founder team lacks regulatory and clinical experience. In a space where FDA compliance and health claims are critical, the absence of a Chief Medical Officer or regulatory lead is a significant execution risk.',
      severity: 'MEDIUM',
      related_agents: ['skeptic', 'execution_analyst'],
    },
  ],
  score: {
    total_score: 67,
    market_opportunity: 20,
    competition_intensity: 14,
    execution_feasibility: 16,
    risk_exposure: 17,
    investment_signal: 'MODERATE',
    justification:
      'NutriSync addresses a genuine and growing market need, but faces significant headwinds from market saturation, high capital requirements, and the absence of a defensible data moat. The CGM-native positioning is differentiated but unproven at scale. Score reflects moderate conviction — the opportunity is real but execution risk is elevated, and the team needs strengthening in regulatory and clinical domains. Recommended: conditional interest pending proof of CAC efficiency and CGM partnership confirmation.',
    // camelCase aliases for comparison table
    marketOpportunity: 20,
    competitionIntensity: 14,
    executionFeasibility: 16,
    riskExposure: 17,
  },
  scoreBreakdown: {
    marketOpportunity: 20,
    competitionIntensity: 14,
    executionFeasibility: 16,
    riskExposure: 17,
  },
  overall_confidence_score: 0.64,
  investment_signal: 'MODERATE',
  created_at: '2026-05-28T14:23:00Z',
  updated_at: '2026-05-28T14:47:32Z',
};

// ============================================================================
// Report List — Mix of signals and statuses
// ============================================================================

export const MOCK_REPORTS_LIST: ReportListItem[] = [
  {
    id: 'rpt_nutrisync_a7f3b2c1',
    input_type: 'url',
    input_content: 'https://nutrisync.io',
    status: 'completed',
    investment_signal: 'MODERATE',
    total_score: 67,
    created_at: '2026-05-28T14:23:00Z',
    companyName: 'NutriSync',
    title: 'NutriSync — AI Nutrition Platform',
    investmentSignal: 'MODERATE',
    investmentScore: 67,
    createdAt: '2026-05-28T14:23:00Z',
  },
  {
    id: 'rpt_cryptopay_e4d91f82',
    input_type: 'url',
    input_content: 'https://cryptopayroll.com',
    status: 'completed',
    investment_signal: 'STRONG',
    total_score: 84,
    created_at: '2026-05-27T09:15:00Z',
    companyName: 'CryptoPayroll',
    title: 'CryptoPayroll — Blockchain Payroll',
    investmentSignal: 'STRONG',
    investmentScore: 84,
    createdAt: '2026-05-27T09:15:00Z',
  },
  {
    id: 'rpt_devtoolkit_b3c28a5f',
    input_type: 'text',
    input_content: 'DevToolKit — Open source developer productivity suite monetized through cloud-hosted enterprise features',
    status: 'completed',
    investment_signal: 'STRONG',
    total_score: 79,
    created_at: '2026-05-26T16:42:00Z',
    companyName: 'DevToolKit',
    title: 'DevToolKit — Developer Productivity',
    investmentSignal: 'STRONG',
    investmentScore: 79,
    createdAt: '2026-05-26T16:42:00Z',
  },
  {
    id: 'rpt_greenfleet_d7e6c4a3',
    input_type: 'url',
    input_content: 'https://greenfleet.co',
    status: 'completed',
    investment_signal: 'MODERATE',
    total_score: 58,
    created_at: '2026-05-25T11:30:00Z',
    companyName: 'GreenFleet',
    title: 'GreenFleet — EV Fleet Management',
    investmentSignal: 'MODERATE',
    investmentScore: 58,
    createdAt: '2026-05-25T11:30:00Z',
  },
  {
    id: 'rpt_aieducate_f1b92d47',
    input_type: 'url',
    input_content: 'https://aieducate.app',
    status: 'completed',
    investment_signal: 'MODERATE',
    total_score: 61,
    created_at: '2026-05-24T08:55:00Z',
    companyName: 'AI Educate',
    title: 'AI Educate — Adaptive Learning',
    investmentSignal: 'MODERATE',
    investmentScore: 61,
    createdAt: '2026-05-24T08:55:00Z',
  },
  {
    id: 'rpt_mediscan_c8a3f6e1',
    input_type: 'text',
    input_content: 'MediScan — AI-powered medical imaging diagnostics for rural healthcare facilities',
    status: 'completed',
    investment_signal: 'WEAK',
    total_score: 38,
    created_at: '2026-05-23T13:20:00Z',
    companyName: 'MediScan',
    title: 'MediScan — Medical Imaging AI',
    investmentSignal: 'WEAK',
    investmentScore: 38,
    createdAt: '2026-05-23T13:20:00Z',
  },
  {
    id: 'rpt_socialfi_a2e7d9b4',
    input_type: 'url',
    input_content: 'https://socialfi.network',
    status: 'completed',
    investment_signal: 'WEAK',
    total_score: 29,
    created_at: '2026-05-22T17:45:00Z',
    companyName: 'SocialFi',
    title: 'SocialFi — Social Finance Network',
    investmentSignal: 'WEAK',
    investmentScore: 29,
    createdAt: '2026-05-22T17:45:00Z',
  },
  {
    id: 'rpt_automate_processing',
    input_type: 'url',
    input_content: 'https://automateflow.io',
    status: 'processing',
    investment_signal: null,
    total_score: null,
    created_at: '2026-05-29T10:05:00Z',
    companyName: 'AutomateFlow',
    title: 'AutomateFlow — Workflow Automation',
    investmentSignal: null,
    investmentScore: null,
    createdAt: '2026-05-29T10:05:00Z',
  },
];

// ============================================================================
// Pipeline Phases — Realistic multi-agent pipeline status
// ============================================================================

export const MOCK_PIPELINE_PHASES: PipelinePhase[] = [
  {
    id: 1,
    name: 'Input Processing & Extraction',
    status: 'completed',
    progress: 100,
    agents: [
      { name: 'URL Scraper', status: 'completed' },
      { name: 'Content Parser', status: 'completed' },
      { name: 'Entity Extractor', status: 'completed' },
    ],
  },
  {
    id: 2,
    name: 'Parallel Research & Analysis',
    status: 'running',
    progress: 60,
    agents: [
      { name: 'Market Analyst', status: 'completed' },
      { name: 'Competitor Scanner', status: 'completed' },
      { name: 'Skeptic Agent', status: 'completed' },
      { name: 'Assumption Validator', status: 'running' },
      { name: 'Execution Analyst', status: 'waiting' },
    ],
  },
  {
    id: 3,
    name: 'Cross-Agent Validation',
    status: 'queued',
    progress: 0,
    agents: [
      { name: 'Contradiction Detector', status: 'waiting' },
      { name: 'Red Flag Scanner', status: 'waiting' },
    ],
  },
  {
    id: 4,
    name: 'Scoring & Synthesis',
    status: 'queued',
    progress: 0,
    agents: [
      { name: 'Scoring Engine', status: 'waiting' },
      { name: 'Report Synthesizer', status: 'waiting' },
    ],
  },
  {
    id: 5,
    name: 'Report Generation',
    status: 'queued',
    progress: 0,
    agents: [
      { name: 'PDF Renderer', status: 'waiting' },
      { name: 'Dashboard Builder', status: 'waiting' },
    ],
  },
];

// ============================================================================
// Agent Logs — Realistic timestamped activity
// ============================================================================

export const MOCK_AGENT_LOGS: AgentLogEntry[] = [
  {
    id: 'log_001',
    timestamp: '2026-05-28T14:23:01Z',
    agent: 'Orchestrator',
    message: 'Analysis pipeline initiated for https://nutrisync.io',
    status: 'completed',
    type: 'info',
  },
  {
    id: 'log_002',
    timestamp: '2026-05-28T14:23:03Z',
    agent: 'URL Scraper',
    message: 'Successfully scraped 12 pages from nutrisync.io (landing, about, pricing, blog x9)',
    status: 'completed',
    type: 'success',
  },
  {
    id: 'log_003',
    timestamp: '2026-05-28T14:23:18Z',
    agent: 'Content Parser',
    message: 'Extracted 4,200 tokens of structured content. Identified company brief, pricing, and team sections.',
    status: 'completed',
    type: 'success',
  },
  {
    id: 'log_004',
    timestamp: '2026-05-28T14:23:22Z',
    agent: 'Entity Extractor',
    message: 'Identified entities: NutriSync (company), CGM (technology), B2C health-tech (segment), subscription (model)',
    status: 'completed',
    type: 'success',
  },
  {
    id: 'log_005',
    timestamp: '2026-05-28T14:23:25Z',
    agent: 'Orchestrator',
    message: 'Phase 1 complete. Dispatching 5 parallel research agents.',
    status: 'completed',
    type: 'info',
  },
  {
    id: 'log_006',
    timestamp: '2026-05-28T14:23:30Z',
    agent: 'Market Analyst',
    message: 'Querying market size databases and analyst reports for personalized nutrition TAM/SAM/SOM...',
    status: 'completed',
    type: 'info',
  },
  {
    id: 'log_007',
    timestamp: '2026-05-28T14:25:12Z',
    agent: 'Market Analyst',
    message: 'Market analysis complete. TAM: $45B, SAM: $8.2B, SOM: $320M. Confidence: 72%. 4 trends identified.',
    status: 'completed',
    type: 'success',
  },
  {
    id: 'log_008',
    timestamp: '2026-05-28T14:24:45Z',
    agent: 'Competitor Scanner',
    message: 'Identified 23 competitors. Deep-diving top 4: Noom, MyFitnessPal, Huel, Calibrate.',
    status: 'completed',
    type: 'info',
  },
  {
    id: 'log_009',
    timestamp: '2026-05-28T14:26:30Z',
    agent: 'Competitor Scanner',
    message: 'Competitor profiles complete. Key insight: no current competitor combines CGM data with AI coaching at NutriSync\'s price point.',
    status: 'completed',
    type: 'success',
  },
  {
    id: 'log_010',
    timestamp: '2026-05-28T14:25:50Z',
    agent: 'Skeptic Agent',
    message: 'Risk assessment complete. 3 risks identified: market saturation (HIGH), regulatory uncertainty (MEDIUM), data privacy (MEDIUM).',
    status: 'completed',
    type: 'warning',
  },
  {
    id: 'log_011',
    timestamp: '2026-05-28T14:27:15Z',
    agent: 'Assumption Validator',
    message: 'Validating 3 critical assumptions against market data. Running CAC benchmarking queries...',
    status: 'running',
    type: 'info',
  },
  {
    id: 'log_012',
    timestamp: '2026-05-28T14:27:45Z',
    agent: 'Assumption Validator',
    message: 'CAC assumption ($40 target) flagged as high-risk. Industry median for health apps is $62. Checking referral loop potential...',
    status: 'running',
    type: 'warning',
  },
  {
    id: 'log_013',
    timestamp: '2026-05-28T14:28:00Z',
    agent: 'Execution Analyst',
    message: 'Awaiting Assumption Validator completion before starting feasibility assessment.',
    status: 'waiting',
    type: 'info',
  },
  {
    id: 'log_014',
    timestamp: '2026-05-28T14:28:10Z',
    agent: 'Contradiction Detector',
    message: 'Queued. Waiting for all Phase 2 agents to complete before cross-validation.',
    status: 'waiting',
    type: 'info',
  },
  {
    id: 'log_015',
    timestamp: '2026-05-28T14:28:10Z',
    agent: 'Scoring Engine',
    message: 'Queued. Waiting for validation and synthesis phases.',
    status: 'waiting',
    type: 'info',
  },
];

// ============================================================================
// Comparison Reports — 3 full reports for side-by-side comparison
// ============================================================================

const CRYPTO_PAYROLL_REPORT: FullReport = {
  id: 'rpt_cryptopay_e4d91f82',
  status: 'completed',
  input_type: 'url',
  input_content: 'https://cryptopayroll.com',

  companyName: 'CryptoPayroll',
  investmentSignal: 'STRONG',
  investmentScore: 84,
  confidenceScore: 78,
  redFlagCount: 1,
  contradictionCount: 1,

  company_brief: {
    core_value_prop:
      'CryptoPayroll enables companies to pay international contractors and employees in stablecoins (USDC, USDT) with automatic fiat off-ramp, tax withholding, and compliance reporting — reducing cross-border payment fees by 85% and settlement time from 3–5 days to under 2 hours.',
    target_customer_segment:
      'Mid-market companies (50–500 employees) with distributed international teams, particularly in tech, gaming, and creative industries where 30%+ of workforce is international contractors.',
    revenue_model:
      'SaaS platform fee ($8/employee/mo) plus 0.3% transaction fee on payroll volume. Enterprise tier at $15/employee/mo includes custom compliance modules and dedicated support.',
  },
  market_analysis: {
    tam_estimate: 28_000_000_000,
    sam_estimate: 4_500_000_000,
    som_estimate: 180_000_000,
    market_trends: [
      {
        trend: 'Cross-border payroll market is projected to reach $28B by 2028. Blockchain-based settlement is capturing 12% of new market entrants.',
        source: 'web_search: Allied Market Research, 2025',
      },
      {
        trend: 'Stablecoin transaction volume exceeded $12T in 2025, with B2B payments being the fastest-growing use case at 89% YoY growth.',
        source: 'web_search: Chainalysis State of Crypto 2025',
      },
    ],
    confidence_score: 0.81,
    uncertainty_factor: 'Regulatory landscape for crypto-denominated payroll varies significantly across jurisdictions.',
  },
  competitors: [
    {
      name: 'Deel',
      pricing: '$49–$599/contractor/mo',
      positioning: 'Full EOR and contractor management platform with crypto payment as a feature, not core.',
      strengths: ['Market leader with $12B+ valuation', 'Supports 150+ countries', 'Deep compliance infrastructure'],
      weaknesses: ['Crypto is an add-on, not core competency', 'Expensive for crypto-native companies', 'Complex UX for simple payment needs'],
      source: 'web_search: Deel pricing page, G2 reviews',
    },
    {
      name: 'Papaya Global',
      pricing: '$12–$650/employee/mo',
      positioning: 'Enterprise workforce payment platform with blockchain settlement layer.',
      strengths: ['Enterprise credibility', 'Recent blockchain pivot shows adaptability'],
      weaknesses: ['Limited crypto-native features', 'Slow product iteration'],
      source: 'web_search: Papaya Global blog, Crunchbase',
    },
  ],
  skeptic_analysis: [
    {
      risk: 'Crypto regulatory crackdown in major markets could invalidate core value proposition.',
      severity: 'HIGH',
      rationale: 'MiCA in EU and proposed US stablecoin legislation may impose banking-equivalent compliance requirements, eroding cost advantage.',
      source: 'web_search: EU MiCA implementation timeline',
    },
    {
      risk: 'Stablecoin de-peg risk could expose payroll funds to temporary loss.',
      severity: 'MEDIUM',
      rationale: 'USDC experienced a brief de-peg during SVB crisis. Payroll funds in transit are exposed to similar events.',
      source: 'web_search: Circle/USDC incident analysis',
    },
  ],
  assumptions: [
    {
      assumption: 'Companies will trust crypto rails for mission-critical payroll within 12 months of product launch.',
      validation_difficulty: 'HARD',
      impact_if_false: 'FATAL',
      source: 'inferred: based on sales pipeline assumptions',
    },
    {
      assumption: 'Transaction fees will remain below traditional SWIFT/correspondent banking fees long-term.',
      validation_difficulty: 'EASY',
      impact_if_false: 'MODERATE',
      source: 'web_search: blockchain fee trend analysis',
    },
  ],
  execution_feasibility: {
    operational_difficulty: 'HIGH',
    capital_requirements: 'MEDIUM',
    time_to_market_estimate: '6–10 months for core product; 12–18 months for multi-jurisdiction compliance.',
    rationale: 'Strong technical team with crypto background. Primary challenge is regulatory compliance across multiple jurisdictions.',
    source: 'inferred: team assessment and regulatory landscape analysis',
  },
  contradictions: [
    {
      description: 'Claims 85% cost reduction vs SWIFT, but regulatory compliance costs may erode this advantage significantly.',
      resolution_or_flag: 'Net savings likely closer to 40-50% after compliance costs. Marketing claims need revision.',
    },
  ],
  red_flags: [
    {
      flag: 'No money transmitter licenses secured yet. Operating without MTLs exposes the company to enforcement action in 47 US states.',
      severity: 'HIGH',
      related_agents: ['skeptic', 'execution_analyst'],
    },
  ],
  score: {
    total_score: 84,
    market_opportunity: 26,
    competition_intensity: 19,
    execution_feasibility: 18,
    risk_exposure: 21,
    investment_signal: 'STRONG',
    justification:
      'CryptoPayroll addresses a clear pain point with measurable cost savings. Strong market tailwinds and limited direct competition in the crypto-native payroll niche. Execution risk is manageable with the right regulatory strategy.',
    marketOpportunity: 26,
    competitionIntensity: 19,
    executionFeasibility: 18,
    riskExposure: 21,
  },
  scoreBreakdown: {
    marketOpportunity: 26,
    competitionIntensity: 19,
    executionFeasibility: 18,
    riskExposure: 21,
  },
  overall_confidence_score: 0.78,
  investment_signal: 'STRONG',
  created_at: '2026-05-27T09:15:00Z',
  updated_at: '2026-05-27T09:41:22Z',
};

const DEVTOOLKIT_REPORT: FullReport = {
  id: 'rpt_devtoolkit_b3c28a5f',
  status: 'completed',
  input_type: 'text',
  input_content: 'DevToolKit — Open source developer productivity suite monetized through cloud-hosted enterprise features',

  companyName: 'DevToolKit',
  investmentSignal: 'STRONG',
  investmentScore: 79,
  confidenceScore: 73,
  redFlagCount: 1,
  contradictionCount: 1,

  company_brief: {
    core_value_prop:
      'DevToolKit is an open-source developer productivity suite that unifies code review, CI/CD orchestration, and incident management into a single platform. The open-source core drives adoption, while the cloud-hosted enterprise tier ($45/dev/mo) adds SSO, audit logs, advanced analytics, and priority support.',
    target_customer_segment:
      'Engineering teams of 20–200 developers at Series B+ startups and mid-market tech companies frustrated with tool sprawl (Jira + GitHub + PagerDuty + CircleCI).',
    revenue_model:
      'Open-core model. Free self-hosted community edition drives adoption. Revenue from cloud-hosted Enterprise tier ($45/dev/mo) and Professional tier ($18/dev/mo). Additional revenue from marketplace add-ons and professional services.',
  },
  market_analysis: {
    tam_estimate: 32_000_000_000,
    sam_estimate: 6_800_000_000,
    som_estimate: 240_000_000,
    market_trends: [
      {
        trend: 'Developer tooling market consolidation is accelerating — 73% of CTOs surveyed want fewer, more integrated tools.',
        source: 'web_search: SlashData Developer Economics 2025',
      },
      {
        trend: 'Open-source commercial software (OCS) revenue exceeded $35B in 2025, with open-core being the dominant monetization strategy.',
        source: 'web_search: OSS Capital report 2025',
      },
      {
        trend: 'Average engineering team uses 14 distinct developer tools, up from 9 in 2022, creating significant tool fatigue and integration overhead.',
        source: 'web_search: Harness State of DevOps 2025',
      },
    ],
    confidence_score: 0.76,
    uncertainty_factor: 'Open-source adoption does not guarantee commercial conversion. Industry benchmark for OSS-to-paid conversion is 2-5%.',
  },
  competitors: [
    {
      name: 'GitLab',
      pricing: 'Free / $29 / $99 per user/mo',
      positioning: 'The DevSecOps platform — single application for the entire DevOps lifecycle.',
      strengths: ['Comprehensive feature set covering entire SDLC', 'Strong enterprise adoption with $500M+ ARR', 'Public company credibility'],
      weaknesses: ['Often perceived as "jack of all trades, master of none"', 'Complex pricing tiers confuse buyers', 'Performance issues at scale'],
      source: 'web_search: GitLab investor relations, G2 reviews',
    },
    {
      name: 'Linear',
      pricing: 'Free / $8 / $14 per user/mo',
      positioning: 'Modern project management for software teams. Focused on speed and developer experience.',
      strengths: ['Exceptional UX that developers love', 'Fast-growing with strong word-of-mouth', 'Focused scope enables quality'],
      weaknesses: ['Limited to project management — no CI/CD or incident management', 'Smaller scale limits enterprise credibility', 'Dependent on integrations for complete workflow'],
      source: 'web_search: Linear blog, Twitter developer sentiment',
    },
  ],
  skeptic_analysis: [
    {
      risk: 'Open-source core may cannibalize enterprise revenue if community forks become feature-rich.',
      severity: 'MEDIUM',
      rationale: 'The open-core model relies on keeping enterprise features compelling enough to justify $45/dev/mo. If the community builds equivalent features, conversion rates will drop below sustainability.',
      source: 'inferred: analysis of open-core business model risks',
    },
    {
      risk: 'Competing against GitLab and GitHub (Microsoft) means fighting deep-pocketed incumbents who can undercut on pricing.',
      severity: 'HIGH',
      rationale: 'Microsoft bundled GitHub Actions into existing subscriptions, effectively making CI/CD free for GitHub users. Similar bundling could neutralize DevToolKit\'s integrated value proposition.',
      source: 'web_search: GitHub pricing strategy analysis',
    },
  ],
  assumptions: [
    {
      assumption: 'OSS-to-enterprise conversion rate will reach 4% within 18 months of launch.',
      validation_difficulty: 'HARD',
      impact_if_false: 'FATAL',
      source: 'inferred: based on revenue projections',
    },
    {
      assumption: 'Developer community will contribute meaningfully to the open-source core, reducing R&D costs by 30%.',
      validation_difficulty: 'HARD',
      impact_if_false: 'MODERATE',
      source: 'inferred: OSS community growth assumptions',
    },
  ],
  execution_feasibility: {
    operational_difficulty: 'MEDIUM',
    capital_requirements: 'MEDIUM',
    time_to_market_estimate: '4–8 months for open-source launch; 10–14 months for enterprise GA.',
    rationale: 'Strong technical founding team with prior experience at GitLab and Datadog. Open-source community building is the primary execution challenge.',
    source: 'inferred: team assessment and comparable company timelines',
  },
  contradictions: [
    {
      description: 'Claims tool consolidation saves time, but the platform\'s breadth may result in a learning curve that offsets productivity gains.',
      resolution_or_flag: 'Need user testing data to validate net productivity impact. Consider phased adoption path.',
    },
  ],
  red_flags: [
    {
      flag: 'Founding team has no prior open-source community management experience. Building and sustaining a healthy OSS community is a distinct skill set.',
      severity: 'MEDIUM',
      related_agents: ['execution_analyst', 'skeptic'],
    },
  ],
  score: {
    total_score: 79,
    market_opportunity: 24,
    competition_intensity: 16,
    execution_feasibility: 19,
    risk_exposure: 20,
    investment_signal: 'STRONG',
    justification:
      'DevToolKit targets a genuine pain point (tool sprawl) with a proven business model (open-core). Strong market tailwinds and experienced technical team. Main risks are competitive pressure from incumbents and OSS community execution.',
    marketOpportunity: 24,
    competitionIntensity: 16,
    executionFeasibility: 19,
    riskExposure: 20,
  },
  scoreBreakdown: {
    marketOpportunity: 24,
    competitionIntensity: 16,
    executionFeasibility: 19,
    riskExposure: 20,
  },
  overall_confidence_score: 0.73,
  investment_signal: 'STRONG',
  created_at: '2026-05-26T16:42:00Z',
  updated_at: '2026-05-26T17:08:45Z',
};

export const MOCK_COMPARISON_REPORTS: FullReport[] = [
  MOCK_REPORT,
  CRYPTO_PAYROLL_REPORT,
  DEVTOOLKIT_REPORT,
];
