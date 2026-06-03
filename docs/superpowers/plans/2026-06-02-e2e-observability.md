# E2E Observability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a small production-hardening layer: request-id observability, clearer frontend API failure messages, and a Playwright E2E smoke scaffold.

**Architecture:** The backend adds a focused middleware that assigns a request id, logs request outcomes, and returns the id in `X-Request-ID`. The frontend API client catches network failures and turns them into Chinese messages with likely causes. E2E tests run at the repository root against the local Next.js app and cover public navigation plus a network failure surface without storing real credentials.

**Tech Stack:** FastAPI middleware, Python `unittest`, Next.js/TypeScript, Playwright Test, npm workspace scripts.

---

### Task 1: Backend Request-ID Observability

**Files:**

- Create: `apps/api/app/core/middleware.py`
- Create: `apps/api/tests/test_request_id_middleware.py`
- Modify: `apps/api/app/main.py`

- [ ] **Step 1: Write failing middleware tests**

Create `apps/api/tests/test_request_id_middleware.py` with tests that call `/api/v1/health` through `TestClient`, assert an `X-Request-ID` header exists, and assert a caller-provided request id is preserved.

- [ ] **Step 2: Run tests to verify failure**

Run: `D:\conda_envs\pytorch\python.exe -m unittest tests.test_request_id_middleware`
Expected: import failure because middleware is not implemented.

- [ ] **Step 3: Implement middleware**

Create `RequestIDMiddleware` in `apps/api/app/core/middleware.py`. It should read `X-Request-ID` from the request, create a UUID when missing, place it on `request.state.request_id`, log method/path/status/duration, and add `X-Request-ID` to responses.

- [ ] **Step 4: Register middleware**

Modify `apps/api/app/main.py` to add `RequestIDMiddleware` before route registration.

- [ ] **Step 5: Verify**

Run: `D:\conda_envs\pytorch\python.exe -m unittest tests.test_request_id_middleware`
Expected: tests pass.

### Task 2: Frontend API Error Classification

**Files:**

- Modify: `apps/web/lib/api/client.ts`

- [ ] **Step 1: Add a network-error helper**

Update `apiFetch` to wrap `fetch` in `try/catch`. If `fetch` throws, return a Chinese message that distinguishes local API URLs from remote/network failures.

- [ ] **Step 2: Preserve response error behavior**

Keep existing HTTP status handling and JSON detail extraction unchanged for non-2xx API responses.

- [ ] **Step 3: Verify**

Run: `npm run lint` and `npm run build`.
Expected: both pass.

### Task 3: Playwright E2E Smoke Scaffold

**Files:**

- Create: `playwright.config.ts`
- Create: `tests/e2e/auth-and-shell.spec.ts`
- Modify: `package.json`
- Modify: `README.md`
- Modify: `docs/production-readiness.md`

- [ ] **Step 1: Add Playwright dependency and script**

Install `@playwright/test` as a root dev dependency with browser download skipped. Add `e2e` script to root `package.json`.

- [ ] **Step 2: Add config**

Create `playwright.config.ts` with `baseURL` defaulting to `http://127.0.0.1:3000`, no automatic web server, and Chrome/Edge-friendly defaults.

- [ ] **Step 3: Add smoke spec**

Create `tests/e2e/auth-and-shell.spec.ts`. It should navigate to `/`, assert Chinese app copy, navigate to `/login` and `/register`, and confirm the upload shell is visible when the homepage renders.

- [ ] **Step 4: Document E2E usage**

Update README and production readiness docs with `npm run e2e` plus the requirement that frontend/backend servers are already running.

- [ ] **Step 5: Verify**

Run: `npm run e2e`.
Expected: smoke test passes if a usable browser is installed; otherwise document the exact browser availability blocker.

### Task 4: Final Verification and Git

**Files:**

- Modify: `MEMORY.md`
- Modify: `AGENTS.md` only if a lasting operating rule is learned.

- [ ] **Step 1: Update memory**

Record that request ids, frontend network-error classification, and Playwright smoke E2E were added.

- [ ] **Step 2: Run verification**

Run backend unittest discovery, API smoke, frontend lint, frontend build, format check, and E2E when browser support is available.

- [ ] **Step 3: Commit and push**

Commit on `codex/e2e-observability` and push the branch.
