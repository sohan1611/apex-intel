# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.0-rc1] - 2026-06-25

### Added
- **AI Agent Pipeline**: Full 9-agent autonomous due diligence orchestrator.
- **Report Generation**: Automatic formatting of AI outputs into a comprehensive Investment Memo.
- **Next.js Frontend**: Highly polished, responsive dashboard and landing page following linear/vercel design aesthetics.
- **FastAPI Backend**: Asynchronous python backend utilizing SQLAlchemy, PostgreSQL, and Gemini API.
- **Authentication**: NextAuth integration for Google SSO and JWT token generation for backend access.
- **Admin Dashboard**: `/admin` UI and `/api/v1/admin/*` endpoints for global usage analytics.
- **Monetization Architecture**: Data models (`Subscription`, `UsageTracking`, `AnalysisCredit`) ready for Stripe integration.
- **Plan-Aware Rate Limiting**: Intelligent rate limits scaling up for FREE, PRO_LITE, PRO, and ADMIN tiers.
- **Documentation**: Initial `ARCHITECTURE_DIAGRAM.md`, `SECURITY.md`, `SUBSCRIPTIONS.md`, and `AI_ROUTING.md`.

### Changed
- Refactored frontend styling to eliminate complex gradients and enforce an information-dense, dark-mode-first aesthetic.
- Renamed orchestration components to clarify responsibilities (e.g., `web_search.py`, `competitor_agent.py`).

### Fixed
- Fixed unhandled HTTP 500s when Gemini quotas are exceeded by implementing Tenacity retry logic.
- Fixed Missing React error boundaries by adding global `error.tsx` and `not-found.tsx` to handle client-side crashes.
- Prevented potential IDOR via strict `user_id` validation on `/api/v1/report` endpoints.
- Prevented Turbopack compilation crashes by removing Unicode box-drawing characters from JSX comments.

### Security
- **Strict Headers**: Configured Next.js and FastAPI to emit HSTS, CSP, XSS-Protection, and X-Frame-Options headers.
- **JWT Claims**: Embedded `tier` and `is_admin` claims securely in tokens to prevent DB hits on every authenticated request.
- **IDOR Protection**: Validated object ownership on all parameterized report queries.

### Performance
- Optimized PostgreSQL queries using `selectinload` for relational data to prevent N+1 queries.
- Pre-compiled Tailwind CSS classes via standard design tokens to shrink bundle size.

### Documentation
- Updated `README.md` to remove all development placeholders.
- Provided `RELEASE_CHECKLIST.md` for standard deployment protocols.

### Known Limitations
- Gemini free-tier quota (15 RPM) may reduce throughput during concurrent analysis requests in development.
- Payment providers (Stripe/Paddle) are modeled in DB but not yet active in the frontend.
- Admin dashboard is strictly intended for internal operations and requires manual CLI promotion via `make_admin.py`.
- Team workspaces and shared folders are not yet implemented.
- AI outputs, notably TAM estimates, may vary slightly between identical executions due to non-zero model temperature.
