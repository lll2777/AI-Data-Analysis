# Share Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users create, copy, revoke, and publicly view read-only dashboard share links.

**Architecture:** Add a `share_links` persistence layer keyed by random tokens. Private endpoints create/revoke links after dashboard membership checks; a public endpoint reads by active token. The frontend adds share actions to saved dashboard rows and a public `/share/[token]` page that reuses chart rendering.

**Tech Stack:** PostgreSQL migrations, FastAPI, SQLAlchemy text repositories, Pydantic schemas, Next.js App Router, React Query, Recharts, Playwright smoke, Python `unittest`.

---

### Task 1: Backend Share Domain

**Files:**

- Create: `infra/postgres/010_share_links.sql`
- Create: `apps/api/app/schemas/share.py`
- Create: `apps/api/app/repositories/share_links.py`
- Create: `apps/api/app/services/share_links.py`
- Create: `apps/api/tests/test_share_links.py`

- [ ] **Step 1: Write failing service tests**

Cover active link reuse, revoked-token public lookup returning `None`, and public
share payload returning dashboard data.

- [ ] **Step 2: Run tests to verify failure**

Run: `D:\conda_envs\pytorch\python.exe -m unittest tests.test_share_links`
Expected: import failure because share link service does not exist.

- [ ] **Step 3: Add schemas and token service**

Create Pydantic response models and implement token creation/reuse/revocation
using repository methods.

- [ ] **Step 4: Add repository SQL and migration**

Create `share_links` with a unique token and one active link per dashboard.

- [ ] **Step 5: Verify backend tests**

Run: `D:\conda_envs\pytorch\python.exe -m unittest discover tests`
Expected: backend tests pass.

### Task 2: Backend Routes

**Files:**

- Create: `apps/api/app/api/v1/routes/share_links.py`
- Modify: `apps/api/app/api/v1/router.py`
- Modify: `apps/api/app/services/dashboards.py`
- Modify: `apps/api/app/repositories/dashboards.py`

- [ ] **Step 1: Add private and public routes**

Add create, revoke, and public get routes.

- [ ] **Step 2: Add public dashboard lookup**

Reuse dashboard item ordering without workspace auth for already-authorized share
tokens.

- [ ] **Step 3: Verify API smoke**

Run: `D:\conda_envs\pytorch\python.exe scripts\smoke_api.py --local-testclient`
Expected: existing smoke still passes.

### Task 3: Frontend Share UI

**Files:**

- Create: `apps/web/features/charts/components/chart-card.tsx`
- Create: `apps/web/features/share/public-share-api.ts`
- Create: `apps/web/app/share/[token]/page.tsx`
- Modify: `apps/web/features/charts/components/chart-recommendations.tsx`
- Modify: `apps/web/features/dashboards/components/dashboard-panel.tsx`
- Modify: `apps/web/features/datasets/dataset-api.ts`

- [ ] **Step 1: Extract chart card renderer**

Move reusable chart display logic into a client component.

- [ ] **Step 2: Add share API functions**

Add create and revoke private calls plus public share fetching.

- [ ] **Step 3: Add dashboard row actions**

Render share and revoke buttons, copy generated links, and show the active URL.

- [ ] **Step 4: Add public share page**

Render title, charts, insights, and invalid-link state in Chinese.

- [ ] **Step 5: Verify frontend**

Run: `npm run lint`, `npm run build`, and `npm run e2e:smoke`.
Expected: all pass.

### Task 4: Docs, Memory, and Git

**Files:**

- Modify: `README.md`
- Modify: `docs/production-readiness.md`
- Modify: `MEMORY.md`
- Modify: `AGENTS.md` if a lasting rule is learned.

- [ ] **Step 1: Document share links**

Mention public dashboard sharing and the migration.

- [ ] **Step 2: Full verification**

Run backend tests, API smoke, format, lint, build, and E2E smoke/full public E2E.

- [ ] **Step 3: Commit and push**

Commit on `codex/share-links`; try pushing when network allows.
