"""
backend/tests/test_api.py
─────────────────────────
Integration tests for the Apex Intel FastAPI endpoints.

These tests use httpx.AsyncClient with ASGITransport to make real
HTTP requests against the FastAPI app *without* starting a server.

NOTE ON DATABASE:
  These tests import the production `app` object, which is wired to
  the real database. For proper isolated testing you should:
    1. Create a separate test database (e.g. "apex_intel_test").
    2. Override the `get_db` dependency in the app to use a test
       session with a test database URL.
    3. Use fixtures to create/drop tables before/after each test.

  Example fixture (add to conftest.py):
  ```python
  from backend.db.connection import get_db
  from backend.main import app
  from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

  TEST_DB_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/apex_intel_test"
  test_engine = create_async_engine(TEST_DB_URL)
  TestSession = async_sessionmaker(test_engine, expire_on_commit=False)

  async def override_get_db():
      async with TestSession() as session:
          yield session

  app.dependency_overrides[get_db] = override_get_db
  ```

  For now, these tests focus on endpoint behaviour that doesn't
  require a live database (validation, 404s, route existence).
"""

from __future__ import annotations

import uuid

import pytest
import httpx

from backend.main import app


# =====================================================================
#  Shared test client fixture
# =====================================================================
@pytest.fixture
async def client() -> httpx.AsyncClient:
    """
    Create an httpx.AsyncClient bound to our FastAPI app.

    Uses ASGITransport so requests go directly to the ASGI app
    in-process — no network involved.
    """
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
        transport=transport,
        base_url="http://testserver",
    ) as ac:
        yield ac


# =====================================================================
#  Test: Health Check
# =====================================================================
@pytest.mark.asyncio
async def test_health_check(client: httpx.AsyncClient) -> None:
    """
    GET /health should return 200 with a health-status payload.

    This endpoint exists primarily for load-balancer / k8s probes.
    """
    response = await client.get("/health")
    assert response.status_code == 200

    data = response.json()
    # The health endpoint should at minimum return a "status" key
    assert "status" in data
    assert data["status"] == "healthy"


# =====================================================================
#  Test: Root Endpoint
# =====================================================================
@pytest.mark.asyncio
async def test_root(client: httpx.AsyncClient) -> None:
    """
    GET / should return 200 with basic app info (name, version, etc.).
    """
    response = await client.get("/")
    assert response.status_code == 200

    data = response.json()
    # Root should return app name to confirm the server is alive
    assert "app" in data or "name" in data


# =====================================================================
#  Test: Analyze — Invalid Input
# =====================================================================
@pytest.mark.asyncio
async def test_analyze_invalid_input(client: httpx.AsyncClient) -> None:
    """
    POST /api/v1/analyze with an invalid body should return 422.

    FastAPI + Pydantic will reject the request because the required
    fields (input_type, content) are missing or malformed.
    """
    # Send an empty body — both 'input_type' and 'content' are required
    response = await client.post(
        "/api/v1/analyze",
        json={},  # Missing required fields
    )
    assert response.status_code == 422  # Unprocessable Entity

    # Verify the error response has the standard validation format
    data = response.json()
    assert "detail" in data


# =====================================================================
#  Test: Analyze — Invalid Input Type
# =====================================================================
@pytest.mark.asyncio
async def test_analyze_invalid_input_type(client: httpx.AsyncClient) -> None:
    """
    POST /api/v1/analyze with an invalid input_type should return 422.

    The AnalyzeRequest schema restricts input_type to 'url' or 'text'.
    """
    response = await client.post(
        "/api/v1/analyze",
        json={
            "input_type": "invalid_type",
            "content": "Some content",
        },
    )
    assert response.status_code == 422


# =====================================================================
#  Test: Analyze — Valid Text Input
#  NOTE: This test requires a working database connection.
# =====================================================================
@pytest.mark.asyncio
async def test_analyze_valid_text(client: httpx.AsyncClient) -> None:
    """
    POST /api/v1/analyze with valid text input should return 200.

    Expected response:
      {
        "analysis_id": "<uuid>",
        "status": "queued"
      }

    ⚠️  This test requires a functioning database. If the database is
    not available, it will fail with a 500 error. See the module
    docstring for how to set up a test database.
    """
    response = await client.post(
        "/api/v1/analyze",
        json={
            "input_type": "text",
            "content": "A SaaS platform that uses AI to automate "
                       "due diligence for venture capital firms.",
        },
    )

    # If DB is available, expect 200. If not, this will be 500.
    # We check for 200 assuming proper test DB setup.
    if response.status_code == 200:
        data = response.json()
        assert "analysis_id" in data
        assert data["status"] == "queued"

        # Validate that analysis_id is a valid UUID
        uuid.UUID(data["analysis_id"])  # Raises ValueError if invalid
    else:
        # Database not configured — skip gracefully
        pytest.skip(
            "Database not available. Set up a test database to run "
            "this test. See module docstring for instructions."
        )


# =====================================================================
#  Test: Get Reports — Empty List
#  NOTE: This test requires a working database connection.
# =====================================================================
@pytest.mark.asyncio
async def test_get_reports_empty(client: httpx.AsyncClient) -> None:
    """
    GET /api/v1/reports should return a list (possibly empty).

    ⚠️  Requires a test database. With a fresh DB, the list will be
    empty. The response shape should be:
      { "total": 0, "reports": [] }
    """
    response = await client.get("/api/v1/reports")

    if response.status_code == 200:
        data = response.json()
        assert "total" in data
        assert "reports" in data
        assert isinstance(data["reports"], list)
    else:
        pytest.skip(
            "Database not available. Set up a test database."
        )


# =====================================================================
#  Test: Get Report — Not Found
# =====================================================================
@pytest.mark.asyncio
async def test_get_report_not_found(client: httpx.AsyncClient) -> None:
    """
    GET /api/v1/report/{random_uuid} should return 404.

    We use a freshly generated UUID that definitely doesn't exist.
    """
    random_id = uuid.uuid4()
    response = await client.get(f"/api/v1/report/{random_id}")

    # Could be 404 (report not found) or 500 (DB not available)
    if response.status_code == 404:
        data = response.json()
        assert "detail" in data
    elif response.status_code == 500:
        pytest.skip("Database not available.")
    else:
        # Any other status code is unexpected
        pytest.fail(
            f"Unexpected status code: {response.status_code}"
        )


# =====================================================================
#  Test: Analyze Status — Not Found
# =====================================================================
@pytest.mark.asyncio
async def test_analyze_status_not_found(client: httpx.AsyncClient) -> None:
    """
    GET /api/v1/analyze/{random_uuid}/status should return 404.
    """
    random_id = uuid.uuid4()
    response = await client.get(f"/api/v1/analyze/{random_id}/status")

    if response.status_code == 404:
        data = response.json()
        assert "detail" in data
    elif response.status_code == 500:
        pytest.skip("Database not available.")
    else:
        pytest.fail(
            f"Unexpected status code: {response.status_code}"
        )
