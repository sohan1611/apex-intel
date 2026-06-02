# FastAPI REST API Documentation

This document outlines the API contracts, request payloads, response structures, and error codes for the **Apex Intel** backend server.

The default local development API prefix is `/api/v1`.

---

## Interactive Docs
When the FastAPI backend is running locally, you can view and test these endpoints using:
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Summary of Endpoints

| Method | Endpoint | Description | Authentication |
|---|---|---|---|
| **GET** | `/` | Root service metadata | None |
| **GET** | `/health` | System health check status | None |
| **POST** | `/api/v1/analyze` | Queue a new startup analysis | None |
| **GET** | `/api/v1/analyze/{id}/status` | Poll the progress of a running pipeline | None |
| **GET** | `/api/v1/report/{id}` | Retrieve a single completed analysis memo | None |
| **GET** | `/api/v1/reports` | List all historical analyses (paginated) | None |

---

## 1. System Endpoints

### GET `/health`
Returns a simple JSON indicating that the FastAPI process is alive and healthy. Used by load balancers or container runners.

#### Response (200 OK)
```json
{
  "status": "healthy",
  "service": "Apex Intel"
}
```

---

## 2. Analysis Endpoints

### POST `/api/v1/analyze`
Submits a startup website URL or a text description to the system. This triggers a background task and immediately returns a queuing status.

#### Request Headers
`Content-Type: application/json`

#### Request Body
```json
{
  "input_type": "url",
  "content": "https://stripe.com"
}
```
*Constraints:*
- `input_type`: Must be either `"url"` or `"text"`.
- `content`: Must be a string with a minimum length of 10 characters.

#### Response (200 OK)
```json
{
  "analysis_id": "8f3a3d2e-0b0c-4e8c-8f4f-6f7f8f9a0b1c",
  "status": "queued"
}
```

---

### GET `/api/v1/analyze/{analysis_id}/status`
Polls the processing state of an ongoing pipeline run.

#### Path Parameters
- `analysis_id` (UUID): The ID returned in the `/analyze` POST response.

#### Response (200 OK)
```json
{
  "analysis_id": "8f3a3d2e-0b0c-4e8c-8f4f-6f7f8f9a0b1c",
  "status": "in_progress",
  "progress": 50,
  "current_phase": "agent_analysis"
}
```

*Fields Description:*
- `status`: One of `queued`, `in_progress`, `completed`, or `failed`.
- `progress`: An integer between `0` and `100` representing progress.
- `current_phase`: Current pipeline phase label:
  - `waiting` (queued)
  - `data_ingestion` (Phase 1)
  - `agent_analysis` (Phase 2)
  - `cross_validation` (Phase 3)
  - `scoring_and_synthesis` (Phase 4 & 5)
  - `completed` / `failed`

---

## 3. Report Retrieval Endpoints

### GET `/api/v1/report/{report_id}`
Retrieves the full finalized Investment Memo. If the analysis is not yet completed, it will return a lightweight status object with progress, matching the polling endpoint.

#### Path Parameters
- `report_id` (UUID): The unique report identifier.

#### Response (200 OK - Active running fallback)
```json
{
  "status": "in_progress",
  "progress": 75,
  "current_phase": "cross_validation"
}
```

#### Response (200 OK - Completed full report)
```json
{
  "id": "8f3a3d2e-0b0c-4e8c-8f4f-6f7f8f9a0b1c",
  "status": "completed",
  "company_brief": {
    "core_value_prop": "Global financial infrastructure builder offering online payment processing and merchant services.",
    "target_customer_segment": "E-commerce retailers, SaaS companies, and platform marketplaces.",
    "revenue_model": "Transaction-based fee splitting (e.g. 2.9% + 30c per success transaction)."
  },
  "market_analysis": {
    "tam_estimate": 15000000000.0,
    "sam_estimate": 5000000000.0,
    "som_estimate": 800000000.0,
    "market_trends": [
      {
        "trend": "Continued migration from brick-and-mortar to omni-channel retail.",
        "source": "search-based-data"
      }
    ],
    "confidence_score": 85.0,
    "uncertainty_factor": "Fluctuating cross-border regulatory policies."
  },
  "competitors": [
    {
      "name": "Adyen",
      "pricing": "Interchange-plus pricing models based on volume.",
      "positioning": "Single platform processing payments across online, mobile, and in-store channels.",
      "strengths": ["Strong unified commerce capabilities", "Direct connections to global schemes"],
      "weaknesses": ["Higher barrier of entry for small startups", "Complex contracting"],
      "source": "search-based-data"
    }
  ],
  "skeptic_analysis": [
    {
      "risk": "Regulatory and compliance burden globally.",
      "severity": "HIGH",
      "rationale": "Operating payment rails requires continuous compliance audits across dozens of jurisdictions.",
      "source": "inferred-insight"
    }
  ],
  "assumptions": [
    {
      "assumption": "Assumes consistent interchange rates over the next 24 months.",
      "validation_difficulty": "moderate",
      "impact_if_false": "high",
      "source": "inferred-insight"
    }
  ],
  "execution_feasibility": {
    "operational_difficulty": "HIGH",
    "capital_requirements": "HIGH",
    "time_to_market_estimate": "12-18 months for initial licensing",
    "rationale": "High operating barriers and massive capital reserves are required for financial services clearance.",
    "source": "inferred-insight"
  },
  "contradictions": [
    {
      "description": "Market Agent TAM estimate was higher than search data average.",
      "resolution_or_flag": "Normalized down based on historical research limits."
    }
  ],
  "red_flags": [
    {
      "flag": "High regulatory concentration risks combined with high execution difficulty.",
      "severity": "high",
      "related_agents": ["Skeptic Agent", "Execution Feasibility Agent"]
    }
  ],
  "score": {
    "total_score": 82.5,
    "market_opportunity": 26.5,
    "competition_intensity": 18.0,
    "execution_feasibility": 14.0,
    "risk_exposure": 24.0,
    "investment_signal": "STRONG",
    "justification": "Large TAM and highly defensive positioning offset high capital entry requirements."
  },
  "overall_confidence_score": 88.0,
  "investment_signal": "STRONG",
  "created_at": "2026-06-02T11:45:00Z",
  "updated_at": "2026-06-02T11:48:00Z"
}
```

---

### GET `/api/v1/reports`
Returns a paginated list of all reports recorded in the database, ordered by newest creation date first.

#### Query Parameters
- `skip` (int, default `0`): Offset for database pagination. Must be `>= 0`.
- `limit` (int, default `20`): Page size limit. Range: `1` to `100`.

#### Response (200 OK)
```json
{
  "total": 47,
  "reports": [
    {
      "id": "8f3a3d2e-0b0c-4e8c-8f4f-6f7f8f9a0b1c",
      "input_type": "url",
      "input_content": "https://stripe.com",
      "status": "completed",
      "investment_signal": "STRONG",
      "created_at": "2026-06-02T11:45:00Z"
    },
    {
      "id": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "input_type": "text",
      "input_content": "A local farm-to-table delivery service built using an automated SMS order bot...",
      "status": "completed",
      "investment_signal": "MODERATE",
      "created_at": "2026-06-01T09:12:00Z"
    }
  ]
}
```

---

## 4. Error Responses

The API returns standard RFC 7807 problem details on failure.

### 404 Not Found
Returned when requesting an analysis ID or report ID that does not exist in the database.
```json
{
  "detail": "Report with id '8f3a3d2e-0b0c-4e8c-8f4f-6f7f8f9a9999' not found."
}
```

### 422 Unprocessable Entity
Returned by FastAPI automatically when Pydantic validation checks fail on input payloads (e.g. text input is too short or fields are missing).
```json
{
  "detail": [
    {
      "loc": ["body", "content"],
      "msg": "ensure this value has at least 10 characters",
      "type": "value_error.any_str.min_length",
      "limit_value": 10
    }
  ]
}
```

### 500 Internal Server Error
Returned when database transactions fail or unexpected uncaught exceptions occur during background agent execution.
```json
{
  "detail": "An unexpected error occurred while creating the analysis. Please try again later."
}
```
