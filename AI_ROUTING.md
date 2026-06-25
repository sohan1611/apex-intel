# AI Routing Architecture

Apex Intel uses a unified AI routing pipeline to orchestrate the generation of investment memos using multiple specialized agents.

## Core Infrastructure

The routing infrastructure is located in `backend/api/services/ai/`. 
All LLM interactions pass through a central `model_router.py` utility which abstracts away the underlying provider details (e.g., Google Gemini).

## The 9-Agent Pipeline

The generation process consists of 9 distinct analytical steps, executed by specialized prompts and structured output requirements:

1.  **Data Extraction**: Parses raw user input (URL or text) into a structured baseline.
2.  **Market Analysis**: Computes TAM, SAM, SOM and market trends.
3.  **Competitor Matrix**: Identifies direct and indirect competitors with differentiation scores.
4.  **Skeptic / Risk**: Identifies red flags, dependencies, and critical failure points.
5.  **Assumption Validation**: Extracts implicit assumptions made in the pitch/idea.
6.  **Financial / Business Model**: Evaluates the monetization strategy and unit economics.
7.  **Execution Feasibility**: Assesses the technical and operational barriers to entry.
8.  **Contradiction Engine**: Cross-references outputs from previous agents to detect logical inconsistencies.
9.  **Scoring & Synthesis**: Synthesizes the final report, calculates the final `investment_score`, and assigns an `investment_signal` (STRONG, MODERATE, WEAK).

## Rate Limiting and Resilience

Because the system relies on the Gemini Free Tier (which limits to 15 Requests Per Minute), the pipeline is protected by:
- **Tenacity Retry Loops**: Automatic exponential backoff when HTTP 429 status codes are encountered.
- **Concurrency Constraints**: Asynchronous tasks are rate-limited.
- **Graceful Degradation**: If an agent fails to generate valid structured JSON after retries, the orchestrator handles the error without crashing the entire report generation.

## Future Provider Expansion

To add a new LLM provider (e.g., OpenAI, Anthropic):
1. Add the client to `model_router.py`.
2. Update the `call_llm` method to route requests based on a configured fallback mechanism.
3. Ensure the provider supports JSON Schema structured outputs.
