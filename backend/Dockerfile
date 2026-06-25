FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 curl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/wheels /wheels
RUN pip install --no-cache /wheels/*

# Copy the backend code (build context is /backend via rootDirectory)
COPY . /app/backend

# Create a 'uv' shim so Railway's startCommand ("uv run ...") works
# without actually needing uv installed. "uv run <cmd>" becomes just "<cmd>".
RUN printf '#!/bin/sh\nif [ "$1" = "run" ]; then shift; fi\nexec "$@"\n' > /usr/local/bin/uv \
    && chmod +x /usr/local/bin/uv

# Symlink alembic.ini into /app so "alembic upgrade head" finds it from WORKDIR
RUN ln -sf /app/backend/alembic.ini /app/alembic.ini

# Non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

ENV PYTHONPATH=/app

# Railway injects PORT (usually 8080). Default to 8000 for local dev.
EXPOSE 8080

# Default CMD - Railway's startCommand overrides this, but if no
# startCommand is set this will work standalone.
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
