"""
Apex Intel — Web Search Service (Serper API)
===============================================

This service wraps the `Serper.dev <https://serper.dev>`_ API to perform
Google searches programmatically.  The agents use it to ground their
analysis in real-world data instead of relying solely on the LLM's
training cutoff.

How it works
-------------
1.  The agent (or orchestrator) calls ``search(query)`` with a natural-
    language question like *"What is the TAM for AI-powered legal tech?"*.
2.  The service sends the query to Serper's ``/search`` endpoint.
3.  The raw JSON response is parsed into a clean list of
    ``{title, snippet, link}`` dicts.
4.  ``format_results_for_prompt()`` converts that list into a human-
    readable text block that can be injected straight into an LLM prompt.

Error handling
---------------
Network errors and bad API keys will be caught and logged.
The service returns an **empty list** on failure so the pipeline can
continue with whatever data it already has — a degraded result is better
than a crashed pipeline.

Usage::

    from backend.services.search_service import SearchService

    service = SearchService()
    results = await service.search("fintech competitor landscape 2024")
    prompt_text = service.format_results_for_prompt(results)
"""

from __future__ import annotations

import logging
from typing import Any

import httpx
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)

from backend.config.settings import settings

# ── Logger ────────────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)

# ── Serper API endpoint ──────────────────────────────────────────────────
SERPER_API_URL = "https://google.serper.dev/search"


class SearchService:
    """Provides web search capabilities via the Serper (Google Search) API.

    Attributes:
        api_key: The Serper API key (read from settings at init).
    """

    def __init__(self, api_key: str | None = None) -> None:
        """Initialise the search service.

        Args:
            api_key: Override for the Serper API key.  If ``None``, the
                     value from ``settings.SERPER_API_KEY`` is used.
        """
        self.api_key: str = api_key or settings.SERPER_API_KEY

    # ══════════════════════════════════════════════════════════════════════
    # Core method: search
    # ══════════════════════════════════════════════════════════════════════
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        before_sleep=before_sleep_log(logger, logging.WARNING),
    )
    async def search(
        self,
        query: str,
        num_results: int = 5,
    ) -> list[dict[str, str]]:
        """Perform a Google search and return structured results.

        Args:
            query:       The search query string (natural language).
            num_results: Maximum number of results to return (default 5).

        Returns:
            A list of dicts, each containing::

                {
                    "title":   "Page Title",
                    "snippet": "Brief excerpt from the page …",
                    "link":    "https://example.com/page"
                }

            Returns an empty list if the API call fails.
        """
        # ── Guard: no API key configured ─────────────────────────────────
        if not self.api_key:
            logger.warning(
                "[SearchService] SERPER_API_KEY is not set — skipping search."
            )
            return []

        # ── Build the request ────────────────────────────────────────────
        headers: dict[str, str] = {
            "X-API-KEY": self.api_key,
            "Content-Type": "application/json",
        }
        payload: dict[str, Any] = {
            "q": query,
            "num": num_results,
        }

        try:
            # httpx.AsyncClient is the async equivalent of `requests.Session`.
            # Using `async with` ensures the connection is closed properly.
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    SERPER_API_URL,
                    headers=headers,
                    json=payload,
                )
                # Raise an exception for 4xx / 5xx status codes.
                response.raise_for_status()
                data: dict = response.json()

            # ── Parse the response ───────────────────────────────────────
            return self._parse_results(data, num_results)

        except httpx.TimeoutException as exc:
            logger.error(
                "[SearchService] Request timed out for query: %r", query
            )
            raise exc

        except httpx.HTTPStatusError as exc:
            logger.error(
                "[SearchService] HTTP %d for query %r: %s",
                exc.response.status_code,
                query,
                exc.response.text[:200],
            )
            raise exc

        except Exception as exc:
            logger.error(
                "[SearchService] Unexpected error for query %r: %s",
                query,
                exc,
            )
            raise exc

    # ══════════════════════════════════════════════════════════════════════
    # Response parser
    # ══════════════════════════════════════════════════════════════════════
    @staticmethod
    def _parse_results(
        data: dict,
        num_results: int,
    ) -> list[dict[str, str]]:
        """Extract clean result dicts from Serper's raw JSON response.

        Serper returns organic results under ``data["organic"]``.  Each item
        has ``title``, ``snippet``, and ``link`` fields.

        Args:
            data:        The full JSON response from Serper.
            num_results: Maximum number of results to return.

        Returns:
            A list of ``{title, snippet, link}`` dicts.
        """
        organic: list[dict] = data.get("organic", [])
        results: list[dict[str, str]] = []

        for item in organic[:num_results]:
            results.append({
                "title": item.get("title", ""),
                "snippet": item.get("snippet", ""),
                "link": item.get("link", ""),
            })

        return results

    # ══════════════════════════════════════════════════════════════════════
    # Formatter: turn search results into prompt-ready text
    # ══════════════════════════════════════════════════════════════════════
    @staticmethod
    def format_results_for_prompt(
        results: list[dict[str, str]],
    ) -> str:
        """Convert a list of search results into readable text for LLM prompts.

        The output is a numbered list that looks like::

            === Web Search Results ===
            [1] Title of the First Page
                URL: https://example.com/page1
                Excerpt: "A brief snippet from the page …"

            [2] Title of the Second Page
                ...

        Args:
            results: List of ``{title, snippet, link}`` dicts (from ``search()``).

        Returns:
            A formatted multi-line string, or a message saying no results
            were found.
        """
        if not results:
            return "(No web search results available.)"

        lines: list[str] = ["=== Web Search Results ===", ""]

        for idx, result in enumerate(results, start=1):
            title = result.get("title", "Untitled")
            link = result.get("link", "N/A")
            snippet = result.get("snippet", "No excerpt available.")

            lines.append(f"[{idx}] {title}")
            lines.append(f"    URL: {link}")
            lines.append(f'    Excerpt: "{snippet}"')
            lines.append("")  # Blank line between results

        return "\n".join(lines)
