# Security Architecture

Security is a fundamental design principle for Apex Intel, especially given the sensitive nature of investment due diligence.

## Authentication & Identity
- **Frontend**: NextAuth.js handles the OAuth flow (Google Provider). It receives an `id_token` and securely exchanges it with the backend.
- **Backend**: FastAPI relies on JWT (JSON Web Tokens). It validates the Google `id_token`, provisions a user record, and issues a standard Bearer JWT to the frontend for subsequent API calls.
- **Session Management**: The frontend NextAuth session strictly encrypts the backend JWT, ensuring it is not exposed inappropriately.

## Admin Controls
- A dedicated `/api/v1/admin/` route provides elevated platform visibility.
- This route is protected by `get_current_admin`, which verifies both the validity of the JWT and that `is_admin=True` on the user record.
- **Promotion**: Users are not automatically promoted to Admin. A secure CLI script (`make_admin.py`) is used by system operators to elevate privileges safely.

## Database Security
- All passwords (if used) are hashed with `passlib` (bcrypt).
- UUIDs are used for all primary keys to prevent enumeration attacks on user IDs or Report IDs.
- SQL Injection is mitigated by the exclusive use of SQLAlchemy ORM and prepared statements.

## API Security
- **CORS**: Strictly defined origins in `settings.CORS_ORIGINS`.
- **Environment Variables**: Sensitive keys (like `GEMINI_API_KEY`) are loaded via python-dotenv and are never committed to version control.
- **Rate Limiting**: AI pipeline generation is protected by tier-based quotas to prevent abuse and denial-of-wallet attacks.
