# Apex Intel Architecture

The following diagram illustrates the high-level architecture of the Apex Intel platform, designed for new contributors to understand the system flow at a glance.

```mermaid
graph TD
    %% Define styles
    classDef frontend fill:#1E1E1E,stroke:#4A4A4A,stroke-width:2px,color:#FFFFFF
    classDef backend fill:#15292B,stroke:#2C5254,stroke-width:2px,color:#FFFFFF
    classDef external fill:#2A1B38,stroke:#52316D,stroke-width:2px,color:#FFFFFF
    classDef db fill:#3D2B1F,stroke:#8A5A44,stroke-width:2px,color:#FFFFFF

    %% Components
    subgraph Client [Frontend - Next.js]
        UI[React UI Components]
        Auth[NextAuth.js]
    end

    subgraph Server [Backend - FastAPI]
        API[API Router / JWT Auth]
        Rate[SlowAPI Rate Limiter]
        Task[Background Tasks]
        
        subgraph Agents [AI Orchestrator]
            Manager[Pipeline Manager]
            Data[Data Collection Agent]
            Market[Market Agent]
            Competitor[Competitor Agent]
            Risk[Risk Agent]
            Synthesis[Final Synthesis Agent]
        end
    end

    subgraph Data Layer
        DB[(PostgreSQL\nSQLAlchemy)]
    end

    subgraph External Services
        Google[Google OAuth]
        Gemini[Google Gemini API]
        Serper[Serper.dev Web Search]
    end

    %% Relationships
    UI -- "REST (JSON)" --> Rate
    Auth -- "SSO" --> Google
    Auth -- "Exchange ID Token" --> API
    Rate -- "Passes" --> API
    
    API -- "Queues Job" --> Task
    Task -- "Spawns" --> Manager
    
    Manager --> Data
    Manager --> Market
    Manager --> Competitor
    Manager --> Risk
    Manager --> Synthesis
    
    %% AI connections
    Data & Market & Competitor & Risk & Synthesis -- "Prompts" --> Gemini
    Data & Market & Competitor -- "Queries" --> Serper
    
    %% DB connections
    API -- "CRUD" --> DB
    Manager -- "Status & Telemetry Updates" --> DB
    Synthesis -- "Saves Final Memo" --> DB

    %% Apply styles
    class UI,Auth frontend;
    class API,Rate,Task,Manager,Data,Market,Competitor,Risk,Synthesis backend;
    class DB db;
    class Google,Gemini,Serper external;
```

## Core Components
- **Frontend**: Next.js 16 with React Server Components, styled via Tailwind CSS. NextAuth handles initial Google SSO, but the backend is the source of truth for user models.
- **Backend**: FastAPI with async Python. Routes are protected via JWTs generated during the NextAuth token exchange.
- **AI Orchestrator**: A multi-agent DAG (Directed Acyclic Graph) pipeline. Agents act independently, querying web sources (Serper) and reasoning (Gemini) before a Final Synthesis agent compiles the investment memo.
- **Database**: PostgreSQL driven by SQLAlchemy (asyncpg). Tracks Users, Subscriptions, Credits, Reports, and Orchestration Telemetry.
