"""
Apex Intel — Web Scraping Service
====================================

Extracts readable text content from a given URL so the Data Structuring
Agent can work with it.

How it works
-------------
1.  ``scrape_url(url)`` fetches the page HTML using ``httpx``.
2.  ``BeautifulSoup`` parses the HTML and strips away elements that
    don't contain useful content (scripts, styles, nav bars, footers,
    headers, forms, iframes, ads).
3.  The remaining text is cleaned up (extra whitespace removed) and
    truncated to ``MAX_CONTENT_LENGTH`` characters (default: 3 000)
    to keep downstream LLM token usage under control.

Why truncate?
--------------
LLMs have a finite context window.  Sending 50 000 characters of raw
HTML wastes tokens and degrades output quality.  3 000 characters is
typically enough to capture the "hero section" + product description
of a startup's landing page.

Error handling
---------------
*   Network errors → logged and ``None`` returned.
*   Invalid HTML → BeautifulSoup is very lenient; it rarely crashes.
*   Timeouts → 15-second hard limit via ``httpx``.

Usage::

    from backend.services.scraping_service import ScrapingService

    service = ScrapingService()
    text = await service.scrape_url("https://example.com")
    if text:
        print(text[:200])
"""

from __future__ import annotations

import logging
import re

import httpx
from bs4 import BeautifulSoup
from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    before_sleep_log,
)

# ── Logger ────────────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)

# ── Constants ────────────────────────────────────────────────────────────
MAX_CONTENT_LENGTH = 3_000  # Characters — keeps LLM token usage reasonable.

# HTML tags that almost never contain useful prose.
TAGS_TO_STRIP: list[str] = [
    "script",
    "style",
    "noscript",
    "nav",
    "footer",
    "header",
    "aside",
    "form",
    "iframe",
    "svg",
    "img",
    "button",
    "input",
    "select",
    "textarea",
]

# A browser-like User-Agent prevents some sites from blocking our requests.
DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)


class ScrapingService:
    """Fetches and cleans text content from web pages.

    Attributes:
        timeout:     Request timeout in seconds.
        max_length:  Maximum number of characters to return.
        user_agent:  HTTP User-Agent header value.
    """

    def __init__(
        self,
        timeout: float = 15.0,
        max_length: int = MAX_CONTENT_LENGTH,
        user_agent: str = DEFAULT_USER_AGENT,
    ) -> None:
        """Initialise the scraping service.

        Args:
            timeout:    How long to wait for the HTTP response.
            max_length: Truncate the extracted text to this many characters.
            user_agent: User-Agent string sent with requests.
        """
        self.timeout = timeout
        self.max_length = max_length
        self.user_agent = user_agent

    # ══════════════════════════════════════════════════════════════════════
    # Core method: scrape_url
    # ══════════════════════════════════════════════════════════════════════
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        before_sleep=before_sleep_log(logger, logging.WARNING),
    )
    async def scrape_url(self, url: str) -> str | None:
        """Fetch a URL and return its cleaned text content.

        Args:
            url: The page to scrape (must start with ``http://`` or
                 ``https://``).

        Returns:
            Cleaned text (up to ``max_length`` chars), or ``None`` if
            the fetch/parse failed.
        """
        logger.info("[ScrapingService] Fetching URL: %s", url)

        # ── Step 1: Fetch the raw HTML ───────────────────────────────────
        html = await self._fetch_html(url)
        if html is None:
            return None

        # ── Step 2: Parse and extract text ───────────────────────────────
        text = self._extract_text(html)
        if not text:
            logger.warning("[ScrapingService] No text content found at: %s", url)
            return None

        # ── Step 3: Truncate ─────────────────────────────────────────────
        if len(text) > self.max_length:
            logger.info(
                "[ScrapingService] Truncating content from %d to %d chars",
                len(text),
                self.max_length,
            )
            text = text[: self.max_length] + " …[truncated]"

        logger.info(
            "[ScrapingService] Successfully extracted %d chars from %s",
            len(text),
            url,
        )
        return text

    # ══════════════════════════════════════════════════════════════════════
    # Private: HTTP fetch
    # ══════════════════════════════════════════════════════════════════════
    async def _fetch_html(self, url: str) -> str | None:
        """Download the raw HTML of a page.

        Args:
            url: Target URL.

        Returns:
            Raw HTML string, or ``None`` on failure.
        """
        headers = {"User-Agent": self.user_agent}

        try:
            async with httpx.AsyncClient(
                timeout=self.timeout,
                follow_redirects=True,  # Handle 301/302 redirects
                verify=True,            # Validate TLS certificates
            ) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                return response.text

        except httpx.TimeoutException as exc:
            logger.error("[ScrapingService] Timeout fetching: %s", url)
            raise exc

        except httpx.HTTPStatusError as exc:
            logger.error(
                "[ScrapingService] HTTP %d from %s: %s",
                exc.response.status_code,
                url,
                exc.response.text[:200],
            )
            raise exc

        except httpx.RequestError as exc:
            # Covers DNS failures, connection refused, etc.
            logger.error(
                "[ScrapingService] Request error for %s: %s", url, exc
            )
            raise exc

        except Exception as exc:
            logger.error(
                "[ScrapingService] Unexpected error scraping %s: %s", url, exc
            )
            raise exc

    # ══════════════════════════════════════════════════════════════════════
    # Private: HTML → clean text
    # ══════════════════════════════════════════════════════════════════════
    def _extract_text(self, html: str) -> str:
        """Parse HTML and return only the meaningful text.

        Steps:
        1.  Feed the HTML to BeautifulSoup with the built-in ``html.parser``.
        2.  Remove all "noise" tags (scripts, styles, nav, footer …).
        3.  Extract the remaining text with ``get_text()``.
        4.  Collapse multiple whitespace/newline runs into single spaces.

        Args:
            html: Raw HTML string.

        Returns:
            Cleaned plain-text string (may be empty).
        """
        soup = BeautifulSoup(html, "html.parser")

        # Remove tags that only add noise.
        for tag_name in TAGS_TO_STRIP:
            for tag in soup.find_all(tag_name):
                tag.decompose()  # Removes the tag AND its children

        # get_text() extracts all remaining visible text.
        # The separator=" " prevents words from merging across tag boundaries
        # (e.g. "<p>Hello</p><p>World</p>" → "Hello World", not "HelloWorld").
        raw_text: str = soup.get_text(separator=" ", strip=True)

        # Collapse runs of whitespace into single spaces.
        cleaned = re.sub(r"\s+", " ", raw_text).strip()

        return cleaned
