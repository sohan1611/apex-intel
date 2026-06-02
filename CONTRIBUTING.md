# Contributing to Apex Intel

Thank you for your interest in contributing to **Apex Intel**! We welcome contributions from the community to help make this autonomous startup due-diligence platform even more powerful.

Please read through these guidelines to understand our development workflow, coding standards, and contribution processes.

---

## Code of Conduct

We expect all contributors to adhere to a professional, welcoming, and inclusive standard of behavior. Please treat others with respect and focus on constructive feedback.

---

## Development Setup

1. **Fork and Clone:**
   Fork the repository to your own GitHub account and clone it locally:
   ```bash
   git clone https://github.com/sohan1611/apex-intel.git
   cd apex-intel
   ```

2. **Branching Strategy:**
   Always create a new branch for your feature, bug fix, or documentation update. Do not work directly on the `main` branch.
   - For features: `feature/your-feature-name`
   - For bug fixes: `bugfix/issue-description`
   - For documentation: `docs/documentation-update`

   Create your branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Coding Standards

To ensure the codebase remains clean, maintainable, and uniform, please follow the style guides below.

### Backend (Python & FastAPI)
- **Formatting & Style:** We follow **PEP 8**. Use linting and formatting tools such as `ruff` or `black` + `isort`.
- **Type Annotations:** Type annotations are **mandatory** on all function signatures, variables, and models. We use `from __future__ import annotations` for forward-compatible annotations.
- **Pydantic Validation:** All incoming payloads and outgoing responses must pass validation via Pydantic v2 schemas located in `backend/schemas/`.
- **Asynchronous Code:** Utilize `async`/`await` for all route handlers, database repository calls, web-scraping/search services, and agent execution.
- **SQLAlchemy 2.0:** Use modern declarative ORM mappings using `Mapped[T]` and `mapped_column()` in `backend/db/models.py`.

### Frontend (Next.js & TypeScript)
- **Framework Pattern:** Use Next.js 15 App Router. Pages reside under `src/app/`, layout structures under `src/components/`, and core domain-specific code under `src/features/`.
- **TypeScript:** Set `strict: true` in your TS Config. Avoid using `any` type annotations; define interfaces in `src/types/` that mirror backend Pydantic models.
- **Tailwind CSS:** Keep UI styles utility-first. Stick to the curated Zinc dark theme color tokens (`#09090b` base background, `#27272a` borders) to maintain the Stripe/Bloomberg-style minimalist aesthetics.
- **React Components:** Keep components modular, accessible, and functional. Avoid inline scripts; use custom React hooks for complex state logic.

---

## Commit Message Guidelines

We follow a structured commit convention to generate clean git histories. Write clear, imperative-style commit messages:

- `feat:` for new user-facing features (e.g. `feat: add PDF exporter to report viewer`)
- `fix:` for bug fixes (e.g. `fix: handle failed scraped_content gracefully in DataAgent`)
- `docs:` for documentation updates (e.g. `docs: add API documentation file`)
- `style:` for code style, formatting, or missing semicolon updates (no logic changes)
- `refactor:` for code modifications that do not fix a bug or add a feature
- `test:` for writing tests (e.g. `test: add unit test for ScoringEngine`)

Example commit message:
```text
feat: add contradiction detection section to UI

- Built ContradictionsSection UI component
- Handled warning states when contradiction count > 0
- Integrated into /report/[id] page
```

---

## Pull Request Guidelines

1. **Update Documentation:** If you add new parameters, routes, or features, ensure the respective files (`README.md`, `PROJECT_STRUCTURE.md`, `API_DOCUMENTATION.md`, or `ARCHITECTURE.md`) are updated.
2. **Write Tests:** Ensure corresponding backend tests in `backend/tests/` or mock frontend configurations are added for new logic.
3. **Verify Locally:** Ensure the frontend builds and backend tests pass before opening a PR:
   - Backend: Run `pytest` inside the virtual environment.
   - Frontend: Run `npm run build` to verify Next.js builds successfully.
4. **Open a PR:** Open a Pull Request from your fork's branch to our `main` branch. Provide a detailed summary of your changes, reference any related issue numbers, and include screenshots for UI updates.
