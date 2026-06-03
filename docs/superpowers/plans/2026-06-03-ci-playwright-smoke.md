# CI Playwright Smoke Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run the public Playwright smoke suite automatically in GitHub Actions.

**Architecture:** Keep `npm run e2e` available for local full-suite runs. Add a focused `npm run e2e:smoke` command for public shell coverage. Gate Playwright's dev server startup behind `PLAYWRIGHT_START_SERVER=1` so CI can start Next.js automatically while local users can still run against an already-open dev server.

**Tech Stack:** GitHub Actions, Playwright Test, Next.js dev server, npm scripts.

---

### Task 1: Public Smoke Script

**Files:**

- Modify: `package.json`

- [x] **Step 1: Verify the script is missing**

Run: `npm run e2e:smoke`
Expected: npm reports `Missing script: "e2e:smoke"`.

- [x] **Step 2: Add the focused script**

Add `e2e:smoke` pointing to `tests/e2e/auth-and-shell.spec.ts`.

- [x] **Step 3: Verify locally**

Run: `npm run e2e:smoke`
Expected: public Playwright tests pass when the local frontend is reachable.

### Task 2: CI Web Server

**Files:**

- Modify: `playwright.config.ts`
- Modify: `.github/workflows/ci.yml`

- [x] **Step 1: Add conditional web server startup**

Set Playwright `webServer` only when `PLAYWRIGHT_START_SERVER=1`.

- [x] **Step 2: Use bundled Chromium in CI**

Avoid forcing the local Chrome channel when `CI=true`, and install Playwright
Chromium in GitHub Actions.

- [x] **Step 3: Add CI smoke step**

Run `npm run e2e:smoke` after frontend build with public placeholder Supabase
environment variables.

### Task 3: Documentation and Verification

**Files:**

- Modify: `README.md`
- Modify: `docs/production-readiness.md`
- Modify: `MEMORY.md`

- [x] **Step 1: Document CI behavior**

Explain that CI starts the Next.js dev server automatically for public smoke.

- [ ] **Step 2: Run verification and commit**

Run formatting, lint, build, backend tests, API smoke, E2E smoke, and full E2E.
Commit locally. Push later if GitHub network is still unavailable.
