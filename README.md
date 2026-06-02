# Apex Intel

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black?logo=nextdotjs)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![OpenAI](https://img.shields.io/badge/AI-OpenAI%20GPT--4o-412991?logo=openai)](https://openai.com/)

Apex Intel is an autonomous, multi-agent due-diligence platform designed for venture capital firms, angel investors, consultants, and startup analysts. The platform takes a startup's website URL or a text description and runs it through a 5-phase execution pipeline of specialized AI agents. It performs automatic market sizing, web research, competitor analysis, risk auditing, execution feasibility modeling, contradiction detection, and outputs a complete, professional, and structured investment memo.

<!--
  PLACEHOLDER: Apex Intel Platform Demo GIF
  [TODO: Insert a 10-15 second GIF showing the user pasting a URL and watching the pipeline run in real-time]
  Format: ![Apex Intel Platform Demo](/public/demo.gif)
-->

---

## Key Features

- **Multi-Agent Ingestion & Data Structuring:** Automatically scrapes and structures core value propositions, target segments, and revenue models from any URL or raw text description.
- **Parallel Domain Analysis:** Executes specialized agents concurrently to audit market opportunity (TAM/SAM/SOM), competitor landscape, skeptic/failure risks, core assumptions, and execution feasibility (operational/capital difficulty).
- **Contradiction Detection & Logic Verification:** Employs a dedicated Auditor Agent to resolve conflicting statements or metrics between different research streams before synthesis.
- **Confidence Scoring & Investment Signals:** Uses a Pydantic-based Scoring Engine to produce a weighted overall investment score (0–100) and discrete signals (**STRONG**, **MODERATE**, **WEAK**) alongside key red flags.
- **Premium Bloomberg/Stripe-Style Dashboard:** Data-dense, keyboard-friendly UI tailored for professional analysts, featuring real-time pipeline status trackers, score gauges, competitor tables, and export options (PDF, JSON).
- **Report Library & Side-by-Side Comparison:** View and manage a library of historical analyses, and select multiple reports to contrast key metrics in a dedicated comparison view.

---

## Technical Architecture

The platform follows a **Supervisor-Orchestrator** pattern where the main pipeline directs data flow sequentially across phases, using a shared `PipelineContext`.

```mermaid
graph TD
    User([User Request]) -->|URL or Text| Router[FastAPI /analyze]
    Router -->|Launch Background Task| Orchestrator[Main Orchestrator]
    
    subgraph Phase 1: Data Structuring
        Orchestrator --> Scraping[Scraping Service]
        Scraping --> DataAgent[Data Structuring Agent]
        DataAgent -->|Company Brief| DB[(PostgreSQL)]
    end
    
    subgraph Phase 2: Parallel Analysis
        Orchestrator --> Search[Serper Web Search]
        Search --> Market[Market Research Agent]
        Search --> Competitor[Competitor Agent]
        Search --> Skeptic[Skeptic Agent]
        Search --> Assumption[Assumption Auditor]
        Search --> Exec[Execution Feasibility Agent]
    end
    
    subgraph Phase 3: Conflict Resolution
        Market & Competitor & Skeptic & Assumption & Exec --> ContraAgent[Contradiction Agent]
    end
    
    subgraph Phase 4 & 5: Synthesis & Scoring
        ContraAgent --> Synthesizer[Final Synthesizer]
        Synthesizer --> Scoring[Scoring Engine]
        Scoring --> FinalRepo[Report Repository]
        FinalRepo --> DB
    end

    DB -->|Fetch Memo| FE[Next.js App Router]
```

For more details on agent designs, schemas, and flowcharts, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Tech Stack

### Backend
- **Framework:** FastAPI
- **Web Server:** Uvicorn
- **ORM:** SQLAlchemy 2.0 (asyncpg for asynchronous PostgreSQL connectivity)
- **Validation:** Pydantic v2 (Strict schemas for all agent boundaries)
- **AI/LLM integration:** OpenAI SDK (`gpt-4o`)
- **Search & Ingestion:** Serper API & BeautifulSoup4

### Frontend
- **Framework:** Next.js 15 (App Router, React 19)
- **Styling:** Tailwind CSS (v4)
- **Icons:** Lucide React
- **Data Fetching:** TanStack Query (React Query)
- **Components:** Custom components based on Tailwind utility primitives (zinc-based dark theme, minimalist grid borders, JetBrains Mono font for metrics)

---

## Folder Structure

```text
apex-intel/
├── backend/                   # FastAPI Backend
│   ├── agents/                # AI Agent definitions (Data, Market, Competitor, etc.)
│   ├── api/                   # API routes (analyze, report, health)
│   ├── config/                # Environment settings & project constants
│   ├── core/                  # Orchestrator, runner, scoring functions & prompts
│   ├── db/                    # DB connection setup and SQLAlchemy models
│   ├── repository/            # DB query abstractions (Thin repository layer)
│   ├── schemas/               # Pydantic request, response, and full memo schemas
│   ├── services/              # Web search, web scraping, and caching engines
│   └── tests/                 # Unit and API integration tests
│
├── frontend/                  # Next.js Frontend
│   ├── src/
│   │   ├── app/               # Next.js Pages (Landing, Analyze, Dashboard, Library)
│   │   ├── components/        # Shared layout, navigation, and UI primitives
│   │   ├── features/          # Domain-specific UI features (dashboard tracker, report sections)
│   │   ├── lib/               # Mock data generators and utility files
│   │   └── types/             # TypeScript definitions matching report schemas
│   └── public/                # Static assets (logo, images)
│
├── LICENSE                    # MIT License
├── CONTRIBUTING.md            # Guidelines for code styling and pull requests
├── PROJECT_STRUCTURE.md       # Extended documentation of folder structures
├── ARCHITECTURE.md            # In-depth architectural design specifications
└── API_DOCUMENTATION.md       # API endpoint contracts and JSON schema references
```

---

## Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ (npm or yarn)
- PostgreSQL (or use Docker / local SQLite for development)
- OpenAI API Key
- Serper API Key

### 1. Environment Setup

#### Backend Setup
Navigate to the `backend/` folder and copy the environment template:
```bash
cd backend
cp .env.example .env
```
Fill in the required environment variables in `backend/.env`:
```ini
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/apex_intel
OPENAI_API_KEY=your_openai_api_key
SERPER_API_KEY=your_serper_api_key
```

#### Frontend Setup
Navigate to the `frontend/` folder:
```bash
cd ../frontend
```
*(The frontend operates with rich mock data out-of-the-box for demo purposes, so no additional configuration is required to view the pages.)*

---

## Running the Application

### 1. Start the Backend (FastAPI)
Navigate to the backend directory, install python dependencies, and launch the Uvicorn server:
```bash
cd backend
python -m venv .venv
# On Windows
.venv\Scripts\activate
# On macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```
The FastAPI interactive Swagger UI will be available at `http://localhost:8000/docs`.

### 2. Start the Frontend (Next.js)
In a separate terminal, navigate to the frontend directory, install npm packages, and run the development server:
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to `http://localhost:3000` to interact with the platform.

---

## Future Roadmap

- [ ] **Dynamic API Integration:** Connect the Next.js frontend TanStack Query hooks to the FastAPI server endpoints (completed static layouts are V2 API-integration ready).
- [ ] **Multi-Report Analysis (V2 Compare):** Add support for comparing more than two startup models simultaneously in a horizontal grid.
- [ ] **Local LLM Support:** Add support for running offline analyses using Ollama / Llama 3 models for secure, air-gapped venture research.
- [ ] **Historical Exporting formats:** Add direct exporting options to DOCX, Google Docs, and PowerPoint slide decks.

---

## Screenshots

<!--
  PLACEHOLDER: Landing Page Screenshot
  [TODO: Insert screenshot of the minimalist input landing page]
  Format: ![Landing Page](/public/screenshots/landing_page.png)
-->

<!--
  PLACEHOLDER: Live Tracker Dashboard Screenshot
  [TODO: Insert screenshot of the live agent analysis pipeline visualizer]
  Format: ![Live Dashboard](/public/screenshots/live_dashboard.png)
-->

<!--
  PLACEHOLDER: Investment Memo Report View Screenshot
  [TODO: Insert screenshot of the structured memo viewer with scores and competitor matrix]
  Format: ![Investment Memo Viewer](/public/screenshots/memo_viewer.png)
-->

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
Copyright © 2026 Sohan.
