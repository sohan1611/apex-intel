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
RUN printf '#!/bin/sh\nif [ "$1" = "run" ]; then shift; fi\nif [ "$1" = "alembic" ]; then echo "UV SHIM: Skipping alembic to avoid locks"; exit 0; fi\necho "UV SHIM EXECUTING: $@"\nexec "$@"\n' > /usr/local/bin/uv \
    && chmod +x /usr/local/bin/uv

# Copy alembic.ini to /app and fix the migrations path.
# The original uses %(here)s/migrations which resolves relative to the ini file.
# Since we copy to /app/ but migrations live at /app/backend/migrations,
# we rewrite the path.
RUN cp /app/backend/alembic.ini /app/alembic.ini \
    && sed -i 's|script_location = %(here)s/migrations|script_location = /app/backend/migrations|' /app/alembic.ini

# Copy entrypoint.sh
COPY entrypoint.sh /app/entrypoint.sh
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

ENV PYTHONPATH=/app

# Railway injects PORT (usually 8080). Default to 8000 for local dev.
EXPOSE 8080

# Use ENTRYPOINT to run our own script and completely ignore
# whatever startCommand Railway tries to append as arguments.
ENTRYPOINT ["/app/entrypoint.sh"]
