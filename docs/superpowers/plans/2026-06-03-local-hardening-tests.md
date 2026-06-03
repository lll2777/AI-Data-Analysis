# Local Hardening Tests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden local test coverage without relying on unstable external network calls.

**Architecture:** Keep credentials out of Playwright failure artifacts by clearing password fields in the E2E helper immediately after submission. Add focused backend unit tests around profiler edge cases, chart recommendation output, AI fallback behavior, and Agent step failure recording.

**Tech Stack:** Playwright Test, Python `unittest`, pandas-backed profiler, deterministic chart recommender, FastAPI service-layer units.

---

### Task 1: E2E Password Report Safety

**Files:**

- Create: `tests/e2e/auth-helper.spec.ts`
- Modify: `tests/e2e/support/auth.ts`

- [x] **Step 1: Reproduce the risk**

Add a helper test that calls `loginWithCredentials()` with invalid credentials and asserts the password field is cleared after the helper starts waiting for authenticated state.

- [x] **Step 2: Verify failure**

Run: `npm run e2e -- tests/e2e/auth-helper.spec.ts`
Expected: failure showing the password still in the DOM.

- [x] **Step 3: Clear password after submit**

Update the helper to clear the password input immediately after clicking 登录 and allow short test timeouts.

- [x] **Step 4: Verify**

Run: `npm run e2e -- tests/e2e/auth-helper.spec.ts`
Expected: helper test passes.

### Task 2: Backend Core Coverage

**Files:**

- Create: `apps/api/tests/test_profiler.py`
- Create: `apps/api/tests/test_chart_recommender.py`
- Create: `apps/api/tests/test_agent.py`
- Modify: `apps/api/tests/test_insights.py`

- [x] **Step 1: Add profiler edge tests**

Cover boolean columns staying out of numeric analysis and integer columns not becoming time-series fields.

- [x] **Step 2: Add chart recommender test**

Cover mixed sales data producing Chinese chart titles and expected chart families.

- [x] **Step 3: Add AI fallback test**

Cover unparseable AI insight content becoming a warning insight with provider/model metadata preserved.

- [x] **Step 4: Add Agent failure tests**

Cover sync and async Agent tool failures marking steps failed before re-raising.

- [x] **Step 5: Verify**

Run: `D:\conda_envs\pytorch\python.exe -m unittest discover tests`
Expected: backend tests pass.

### Task 3: Final Verification

**Files:**

- Modify: `MEMORY.md`

- [ ] **Step 1: Run full local verification**

Run backend tests, API smoke, formatting, lint, build, public E2E smoke, and full E2E.

- [ ] **Step 2: Commit locally**

Commit the hardening tests. Push later if GitHub network remains unstable.
