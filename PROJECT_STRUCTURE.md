# Project Folder & File Structure

This document provides a detailed breakdown of all folders and key files in the **Apex Intel** workspace. It explains their roles and how they connect to build the autonomous due-diligence platform.

---

## Workspace Root
The project is structured as a monorepo containing two main directories: `backend` (FastAPI + AI Agents) and `frontend` (Next.js 15).

```text
apex-intel/
├── backend/                  # Python FastAPI Backend
├── frontend/                 # Next.js 15 Frontend
├── .gitignore                # Global Git ignore rules
├── LICENSE                   # Project MIT License
├── CONTRIBUTING.md           # Guidelines for developers
├── ARCHITECTURE.md           # Architectural layout & workflows
├── PROJECT_STRUCTURE.md      # This document
└── README.md                 # Project landing page & quickstart
```

---

## 1. Backend Directory (`/backend`)
The backend is a production-style, asynchronous FastAPI application that houses the SQL database connections, third-party search/scraping services, and the multi-agent AI execution pipelines.

```text
backend/
├── agents/                   # Autonomous AI Agents
│   ├── __init__.py
│   ├── base_agent.py         # Abstract base class & LLM wrapper
│   ├── data_agent.py         # Strips marketing fluff; forms Company Brief
│   ├── market_agent.py       # Audits TAM/SAM/SOM & industry trends
│   ├── competitor_agent.py   # Compiles competitor matrix (positioning, strengths)
│   ├── skeptic_agent.py      # Surfaced high-risk scenarios and vulnerabilities
│   ├── assumption_agent.py   # Flags unvalidated leaps of faith
│   ├── execution_agent.py    # Operations/capital feasibility analyst
│   ├── contradiction_agent.py# Identifies conflict discrepancies between agents
│   ├── synthesizer.py        # Compiles conflict-free data into a memo
│   └── scoring_engine.py     # Weighted financial scoring algorithm
│
├── api/                      # FastAPI Endpoint Handlers
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── analyze.py        # /analyze endpoints (POST triggers, status polling)
│   │   └── report.py         # /report retrieves completed memos & lists library
│   └── __init__.py
│
├── config/                   # Configuration & Constants
│   ├── constants.py          # Weights, investment signals, phase names
│   └── settings.py           # Pydantic BaseSettings for API keys & URL configs
│
├── core/                     # Application Pipeline Core
│   ├── orchestrator/         # Pipeline executors
│   │   ├── agent_runner.py   # Timeout/retry wrapper around agent LLM calls
│   │   ├── main_orchestrator.py# Sequential 5-phase pipeline director
│   │   └── pipeline.py       # Dataclass tracking shared variables (Context)
│   ├── prompts.py            # Complete system and user prompt templates
│   └── scoring.py            # Numeric normalizers & signal calculators
│
├── db/                       # Database Configurations & ORM
│   ├── connection.py         # SQLAlchemy engine and async session makers
│   ├── models.py             # ORM models (Report, ScoreBreakdown, Competitor)
│   └── schema.sql            # Raw SQL script for reference DDL
│
├── repository/               # Repository Query Layer
│   ├── competitor_repository.py# Queries/upserts for competitor rows
│   └── report_repository.py  # Report persistence and status updater query methods
│
├── schemas/                  # Pydantic JSON Schemas
│   ├── request.py            # Incoming REST payloads (/analyze)
│   ├── response.py           # Polling status, listing formats
│   └── report_schema.py      # Nested Pydantic model defining the full Memo JSON
│
├── services/                 # External Integrations
│   ├── cache_service.py      # In-memory dict cache with TTL (Redis-ready)
│   ├── scraping_service.py   # BeautifulSoup scraper cleaning raw HTML
│   └── search_service.py     # Serper HTTP Search client
│
├── tests/                    # Backend Testing Suite
│   ├── test_agents.py
│   └── test_api.py
│
├── .env.example              # Key templates for API setup
├── requirements.txt          # Python package dependency manifest
└── main.py                   # FastAPI app entry point (CORS, lifespan, mount routes)
```

---

## 2. Frontend Directory (`/frontend`)
The frontend is a data-dense, dark-themed Next.js 15 App Router web application written in TypeScript and styled with Tailwind CSS.

```text
frontend/
├── src/
│   ├── app/                  # Next.js App Router Routes (Pages)
│   │   ├── analysis/         # Real-time running analytics screen
│   │   │   └── [id]/page.tsx # Live pipeline tracking dashboard
│   │   ├── analyze/
│   │   │   └── page.tsx      # Landing input console for URLs/texts
│   │   ├── report/
│   │   │   └── [id]/page.tsx # Structured Investment Memo viewer
│   │   ├── reports/
│   │   │   ├── compare/
│   │   │   │   └── page.tsx  # Side-by-side analysis comparison matrix
│   │   │   └── page.tsx      # Past reports Library + global KPI bar
│   │   ├── globals.css       # Global dark style rules (Inter & Mono fonts)
│   │   ├── layout.tsx        # Base shell (App Sidebar, Main Layout)
│   │   ├── page.tsx          # Minimalist index landing route redirects
│   │   └── providers.tsx     # TanStack Query & React hooks setup
│   │
│   ├── components/           # Shared Layout & UI Primitives
│   │   ├── layout/
│   │   │   ├── Footer.tsx
│   │   │   └── Navbar.tsx
│   │   └── ui/               # Low-level layout primitives
│   │       ├── ConfidenceBar.tsx # Linear rating scale status bar
│   │       ├── ExportDropdown.tsx# Action dropdown to export PDF / JSON
│   │       ├── KPIBar.tsx    # Compact multi-card strip for metrics
│   │       ├── MetricCard.tsx# Mini data widgets (Stripe-inspired borders)
│   │       ├── ScoreGauge.tsx# Arc/circular score visualizer
│   │       └── SourceTag.tsx # Renders facts sources (search/inference tags)
│   │
│   ├── features/             # Page-Specific Features (Compositions)
│   │   ├── dashboard/        # Dashboard layout components
│   │   │   ├── AgentActivityLog.tsx # Renders streaming activity logs
│   │   │   └── PipelineTracker.tsx  # Interactive step status indicator
│   │   ├── report/           # Section views for memos
│   │   │   ├── CompetitorMatrix.tsx # Horizontal grid competitor grid
│   │   │   ├── ScoreBreakdown.tsx   # Detailed sub-score analysis bars
│   │   │   └── RedFlagsPanel.tsx    # Surfaced risks and contradictions warnings
│   │   └── reports/          # Library modules
│   │       └── ComparisonTable.tsx  # Report comparison matrix
│   │
│   ├── lib/                  # Utilities & Generators
│   │   ├── mock-data.ts      # Comprehensive mock generator (V2-ready)
│   │   └── utils.ts          # Tailwind CSS merge (`cn`) helper
│   │
│   └── types/
│       └── report.ts         # TypeScript models matching backend JSON output
│
├── package.json              # NPM manifest
├── tsconfig.json             # TypeScript compiler rules
└── postcss.config.mjs        # CSS styling pre-processors
```
