"""
Apex Intel — Request Schemas
==============================

Pydantic models that validate incoming HTTP request bodies.

Why use Pydantic for requests?
------------------------------
*   **Automatic validation** — FastAPI deserialises the JSON body and
    validates it against the model *before* your route code runs.
    If validation fails the client receives a clear ``422`` error.
*   **Type safety** — your IDE knows exactly what fields are available.
*   **Documentation** — FastAPI auto-generates OpenAPI (Swagger) docs
    from these models.
"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    """Body of the ``POST /analyze`` endpoint.

    Attributes:
        input_type: Must be ``"url"`` (a website to scrape) or ``"text"``
                    (raw copy-pasted content about a company).
        content:    The actual URL or text.  Minimum 10 characters to avoid
                    accidental empty submissions.
    """

    input_type: Literal["url", "text"] = Field(
        ...,
        description="Type of input: 'url' for a website or 'text' for raw content.",
        examples=["url", "text"],
    )
    content: str = Field(
        ...,
        min_length=10,
        description=(
            "The URL to analyse or the raw text content.  "
            "Must be at least 10 characters long."
        ),
        examples=[
            "https://example.com/startup-landing-page",
            "Acme Corp is a B2B SaaS company that provides AI-driven analytics…",
        ],
    )

    # -- Pydantic model config --
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "input_type": "url",
                    "content": "https://example.com/startup-landing-page",
                },
                {
                    "input_type": "text",
                    "content": (
                        "Acme Corp is a B2B SaaS company that provides "
                        "AI-driven analytics for the healthcare industry."
                    ),
                },
            ]
        }
    }
