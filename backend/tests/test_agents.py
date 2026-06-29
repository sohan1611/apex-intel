"""
backend/tests/test_agents.py
─────────────────────────────
Unit tests for the BaseAgent class.

These tests verify the shared utility methods that ALL agents inherit:
  • _parse_json_response  — Extracts JSON from LLM output strings
  • _build_error_output   — Creates a standardised error dict

The OpenAI client is mocked so these tests run without API keys.
"""

from __future__ import annotations

import json
from unittest.mock import MagicMock, patch

import pytest

# ── Import the BaseAgent class ───────────────────────────────────────
# BaseAgent is an abstract class, so we create a minimal concrete
# subclass for testing.
from backend.agents.base_agent import BaseAgent


# =====================================================================
#  Concrete test subclass of BaseAgent
# =====================================================================
class _TestAgent(BaseAgent):
    """
    Minimal concrete implementation of BaseAgent for testing.

    BaseAgent is abstract (it requires subclasses to implement
    certain methods). This test subclass satisfies those requirements
    with trivial implementations so we can test the shared utilities.
    """

    @property
    def agent_name(self) -> str:
        """Return a fixed agent name for testing."""
        return "test_agent"

    @property
    def system_prompt(self) -> str:
        """Return a simple test prompt."""
        return "You are a test agent."

    def fallback_default(self) -> dict:
        return {"data": None}

    async def run(self, context: dict) -> dict:
        """
        Minimal run implementation — just returns the context as-is.

        In real agents, this method calls the LLM and processes the
        response. For testing the base utilities, we don't need that.
        """
        return context


# =====================================================================
#  Fixtures
# =====================================================================
@pytest.fixture
def agent() -> _TestAgent:
    """
    Create a _TestAgent instance with a mocked OpenAI client.

    We patch the OpenAI client so no actual API calls are made.
    """
    with patch("backend.agents.base_agent.genai.Client") as MockClient:
        # Client() returns a MagicMock; the agent stores it
        mock_client = MagicMock()
        MockClient.return_value = mock_client
        return _TestAgent()


# =====================================================================
#  Test: _parse_json_response — Valid JSON string
# =====================================================================
@pytest.mark.asyncio
async def test_base_agent_parse_json(agent: _TestAgent) -> None:
    """
    _parse_json_response should correctly parse a plain JSON string.

    Given a raw JSON string (as an LLM might return), the method
    should extract and return the parsed Python dictionary.
    """
    # Arrange: a clean JSON string
    raw_response = json.dumps({
        "market_size": 5000000,
        "confidence_score": 0.85,
        "source": "search-based",
    })

    # Act: parse it
    result = agent._parse_json_response(raw_response)

    # Assert: the parsed dict matches the original data
    assert isinstance(result, dict)
    assert result["market_size"] == 5000000
    assert result["confidence_score"] == 0.85
    assert result["source"] == "search-based"


# =====================================================================
#  Test: _parse_json_response — JSON wrapped in markdown code block
# =====================================================================
@pytest.mark.asyncio
async def test_base_agent_parse_json_with_markdown(
    agent: _TestAgent,
) -> None:
    """
    _parse_json_response should handle JSON wrapped in ```json``` blocks.

    LLMs frequently wrap their JSON output in markdown code fences:
        ```json
        { "key": "value" }
        ```

    The parser should strip the fences and still extract valid JSON.
    """
    # Arrange: JSON inside a markdown code fence
    raw_response = (
        "Here is the analysis:\n"
        "```json\n"
        '{\n'
        '  "top_risks": [\n'
        '    {\n'
        '      "risk": "High customer acquisition cost",\n'
        '      "severity": "HIGH",\n'
        '      "rationale": "No established brand presence",\n'
        '      "source": "inferred-insight"\n'
        '    }\n'
        '  ]\n'
        '}\n'
        "```\n"
        "Let me know if you need more details."
    )

    # Act: parse it — the method should strip the markdown wrapper
    result = agent._parse_json_response(raw_response)

    # Assert: only the JSON content is returned
    assert isinstance(result, dict)
    assert "top_risks" in result
    assert len(result["top_risks"]) == 1
    assert result["top_risks"][0]["severity"] == "HIGH"


# =====================================================================
#  Test: _parse_json_response — Invalid JSON
# =====================================================================
@pytest.mark.asyncio
async def test_base_agent_parse_json_invalid(agent: _TestAgent) -> None:
    """
    _parse_json_response should return None (or raise) for invalid JSON.

    If the LLM returns something that isn't valid JSON at all,
    the parser should handle it gracefully.
    """
    raw_response = "This is not JSON at all, just plain text."

    result = agent._parse_json_response(raw_response)

    # Depending on implementation, it might return None or an empty dict
    assert result is None or result == {}


# =====================================================================
#  Test: _build_error_output — Correct error format
# =====================================================================
@pytest.mark.asyncio
async def test_base_agent_error_output(agent: _TestAgent) -> None:
    """
    _build_error_output should return a dict with the standard
    error schema used across all agents.

    Expected format:
      {
        "agent": "<agent_name>",
        "status": "error",
        "error": "<error_message>",
        "data": None
      }

    This standardised format allows the orchestrator to detect
    failures and inject placeholder data so the pipeline continues.
    """
    # Arrange: simulate an error
    error_message = "OpenAI API timeout after 60 seconds"

    # Act: build the error output
    result = agent._build_error_output(error_message)

    # Assert: check the structure
    assert isinstance(result, dict)
    assert result["agent"] == "test_agent"
    assert result["status"] == "partial_failure"
    assert "error" in result


# =====================================================================
#  Test: _build_error_output — With exception object
# =====================================================================
@pytest.mark.asyncio
async def test_base_agent_error_output_from_exception(
    agent: _TestAgent,
) -> None:
    """
    _build_error_output should also work when passed an Exception
    object (converting it to a string message).
    """
    error = TimeoutError("Connection timed out")

    result = agent._build_error_output(str(error))

    assert isinstance(result, dict)
    assert result["status"] == "partial_failure"
    assert "error" in result
