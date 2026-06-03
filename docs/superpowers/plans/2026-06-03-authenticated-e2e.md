# Authenticated E2E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an optional Playwright workflow that exercises the logged-in upload-to-agent path with a dedicated test account.

**Architecture:** Keep public smoke tests always runnable. Gate the authenticated workflow behind `E2E_USER_EMAIL` and `E2E_USER_PASSWORD` so CI and local environments without seeded credentials skip it cleanly. Drive the real browser UI instead of calling internal APIs directly.

**Tech Stack:** Playwright Test, Next.js UI, Supabase Auth/Storage, FastAPI API routes, `samples/sales-demo.csv`.

---

### Task 1: Authenticated Workflow Spec

**Files:**

- Create: `tests/e2e/authenticated-workflow.spec.ts`
- Create: `tests/e2e/support/auth.ts`
- Modify: `package.json`

- [x] **Step 1: Write the failing test**

Create a Playwright spec that imports authentication helpers, logs in, uploads `samples/sales-demo.csv`, waits for parsing, generates charts, asks an AI question, and runs the Agent workflow.

- [x] **Step 2: Run test to verify it fails**

Run: `npm run e2e -- tests/e2e/authenticated-workflow.spec.ts`
Expected: failure because `tests/e2e/support/auth.ts` does not exist.

- [x] **Step 3: Add minimal auth helper**

Create `getE2ECredentials()` and `loginWithCredentials()` in `tests/e2e/support/auth.ts`.

- [x] **Step 4: Verify unseeded environments skip cleanly**

Run: `npm run e2e -- tests/e2e/authenticated-workflow.spec.ts`
Expected: `1 skipped` when `E2E_USER_EMAIL` and `E2E_USER_PASSWORD` are not set.

- [x] **Step 5: Add focused npm script**

Add `npm run e2e:auth` for the authenticated workflow.

### Task 2: Documentation

**Files:**

- Modify: `.env.example`
- Modify: `README.md`
- Modify: `docs/production-readiness.md`
- Modify: `MEMORY.md`

- [x] **Step 1: Document E2E credentials**

Add optional `E2E_USER_EMAIL` and `E2E_USER_PASSWORD` placeholders to `.env.example` with a warning to use a dedicated test user.

- [x] **Step 2: Document local commands**

Document `npm run e2e:auth`, the credential requirement, and the workflow coverage.

- [ ] **Step 3: Verify and commit**

Run the standard verification commands, update memory, commit, and push to the existing PR branch.
