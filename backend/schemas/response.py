"""
Apex Intel — Response Schemas
===============================

Pydantic models that define the shape of HTTP responses.

Separating request and response schemas is a best practice because:
*   The data you **accept** (request) is often a subset of what you
    **return** (response).  For example, ``id`` and ``created_at`` only
    exist in the response.
*   It prevents accidental data leakage — you explicitly choose which
    fields the client sees.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field
from typing import Any


# ═══════════════════════════════════════════════════════════════════════════
# 1. AnalyzeResponse — returned immediately after POSTing a new analysis
# ═══════════════════════════════════════════════════════════════════════════
class AnalyzeResponse(BaseModel):
    """Returned by ``POST /analyze`` to confirm the analysis was queued.

    The client uses ``analysis_id`` to poll for results later.
    """

    analysis_id: uuid.UUID = Field(
        ..., description="Unique ID of the newly created analysis."
    )
    status: str = Field(
        default="queued",
        description="Initial status — always 'queued' right after creation.",
    )


# ═══════════════════════════════════════════════════════════════════════════
# 2. ReportStatusResponse — lightweight status check
# ═══════════════════════════════════════════════════════════════════════════
class ReportStatusResponse(BaseModel):
    """Returned by ``GET /report/{id}/status`` for quick polling.

    Attributes:
        progress:       Integer 0–100 representing overall completion.
        current_phase:  The analysis phase currently running (see constants).
    """

    analysis_id: uuid.UUID
    status: str = Field(
        ..., description="queued | in_progress | completed | failed"
    )
    progress: int = Field(
        ..., ge=0, le=100,
        description="Completion percentage (0–100).",
    )
    current_phase: str = Field(
        ...,
        description="Name of the phase currently executing.",
    )
    error_log: dict[str, Any] | None = Field(
        default=None,
        description="Structured error information if the pipeline failed.",
    )


# ═══════════════════════════════════════════════════════════════════════════
# 3. Report listing (paginated)
# ═══════════════════════════════════════════════════════════════════════════
class ReportListItem(BaseModel):
    """One row in the paginated report listing.

    ``input_content`` is truncated to keep the response payload small.
    """

    id: uuid.UUID
    input_type: str
    input_content: str = Field(
        ...,
        description="First ~200 chars of the original input (truncated).",
    )
    status: str
    investment_signal: str | None = Field(
        default=None,
        description="STRONG / MODERATE / WEAK, or null if not yet scored.",
    )
    total_score: float | None = Field(
        default=None,
        description="Total score (0-100) if available.",
    )
    created_at: datetime


class ReportListResponse(BaseModel):
    """Paginated list of reports returned by ``GET /reports``."""

    reports: list[ReportListItem]
    total: int = Field(
        ..., ge=0,
        description="Total number of reports matching the query.",
    )


# ═══════════════════════════════════════════════════════════════════════════
# 4. ErrorResponse — standard error envelope
# ═══════════════════════════════════════════════════════════════════════════
class ErrorResponse(BaseModel):
    """Uniform error shape so the frontend always knows what to expect.

    Attributes:
        detail:     Human-readable error message.
        error_code: Optional machine-readable code (e.g. ``"REPORT_NOT_FOUND"``).
    """

    detail: str = Field(
        ..., description="Human-readable description of the error."
    )
    error_code: str | None = Field(
        default=None,
        description="Machine-readable error code for programmatic handling.",
    )
