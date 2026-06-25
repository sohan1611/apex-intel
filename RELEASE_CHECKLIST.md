# Apex Intel Release Checklist

This document defines the standard procedure for deploying new versions of Apex Intel to production. Follow these steps meticulously to ensure zero-downtime and data integrity.

## Pre-Deployment Verification
- [ ] Ensure all local unit and E2E tests pass (`python -m pytest`).
- [ ] Run `npm run lint` and `npm run build` on the frontend without warnings.
- [ ] Verify `CHANGELOG.md` is updated with semantic version notes.
- [ ] Verify `package.json` and backend `__version__` variables are bumped.

## Infrastructure Checks
- [ ] Verify **Railway** configuration (Backend):
  - [ ] `DATABASE_URL` matches the production PostgreSQL instance.
  - [ ] `GEMINI_API_KEY` and `SERPER_API_KEY` are valid.
  - [ ] `JWT_SECRET_KEY` is highly secure and rotated if compromised.
- [ ] Verify **Vercel** configuration (Frontend):
  - [ ] `NEXT_PUBLIC_API_URL` points to the Railway production URL.
  - [ ] `NEXTAUTH_URL` is set to the Vercel production domain.
  - [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are valid.
- [ ] Verify **Database**:
  - [ ] Automated PostgreSQL backups are enabled.
  - [ ] Apply pending Alembic migrations via `alembic upgrade head`.

## Post-Deployment Checks
- [ ] **Authentication**: Verify Google OAuth login works on the production domain.
- [ ] **Rate Limiting**: Attempt to spam the `/api/v1/analyze` route using a Free Tier account to trigger a 429 Too Many Requests response.
- [ ] **End-to-End Pipeline**: Run a full 9-agent analysis using a test URL and confirm the Investment Memo generates without silent errors.
- [ ] Verify custom domains and SSL certificates.

## Finalization
- [ ] Tag the release in Git (e.g., `git tag v1.x.x && git push --tags`).
- [ ] Announce release.
