# Agent Operating Notes

This repository is the AI Data Analysis SaaS platform. Treat it as a production
startup project and a portfolio-grade full-stack system.

## User Mandates

- Work step by step. Do not generate the whole product at once.
- Current sequence:
  1. Architecture and planning.
  2. Project initialization.
  3. Authentication.
  4. File upload.
  5. CSV parsing.
  6. Automatic charts.
  7. AI Q&A.
  8. AI insights.
  9. Dashboards.
  10. Async tasks.
  11. AI Agent.
  12. Deployment.
- Every completed work session should update this file and `MEMORY.md` when needed.
- Every completed work session should commit and push changes to GitHub when there
  are repository changes.
- Try pushing from this environment before asking the user to push manually. If the
  push fails because of connectivity or credentials, report the exact failure and
  leave the local commit ready for manual push.
- The user clarified that this file must be named `AGENTS.md`.
- The user's C drive has limited free space. Prefer D drive locations for dependency
  downloads, package caches, generated artifacts, Docker volumes, datasets, and other
  space-heavy operations whenever possible.

## Required Stack

- Frontend: Next.js latest stable with App Router, TypeScript, TailwindCSS,
  shadcn/ui, React Query, Zustand.
- Backend: FastAPI running in the existing conda `pytorch` environment.
- Do not create a Python venv.
- Do not force-upgrade Python.
- Database: PostgreSQL.
- Auth: Supabase Auth.
- Storage: Supabase Storage.
- AI: Provider Adapter architecture. Default provider is Mimo with model
  `mimo-v2.5`.
- Charts: Recharts first, ECharts later.
- Async: Redis and Celery.
- Deploy: Vercel for frontend, Railway or Render for backend.

## AI Architecture Rules

- Business code must never call vendor model APIs directly.
- All AI calls go through `aiService`.
- `aiService` selects a provider from environment variables.
- Required provider interface:
  - `chat`
  - `analyze_data`
  - `generate_insight`
  - `generate_chart_config`
- Implement `MimoProvider` first.
- Reserve providers for OpenAI, DeepSeek, Qwen, and Claude.

## Local Environment Facts

- Repository path: `D:\codex_project\git`
- Git remote: `https://github.com/lll2777/AI-Data-Analysis.git`
- The user renamed the GitHub repository and project to `AI Data Analysis`.
- Current backend Python environment: conda env `pytorch`
- Detected Python version in `pytorch`: `Python 3.10.20`
- `gh` CLI is not installed.
- Current shell cannot run `node` or `npm`; Node.js must be installed or exposed in
  PATH before STEP 2 frontend initialization.
- Use D drive paths for large local assets and caches where possible.
- PowerShell 7 is available and can be used for complex commands when it behaves
  better than Windows PowerShell.
- A portable Node.js LTS runtime was placed on the D drive:
  `D:\codex_project\tools\node-v24.16.0-win-x64`.
- Prefer `D:\codex_project\cache\npm` for npm cache and
  `D:\codex_project\cache\pip` for pip cache.

## Current Status

- STEP 1 is complete.
- STEP 2 scaffold is implemented and locally verified.
- STEP 3 authentication is implemented and locally verified without live Supabase
  credentials.
- STEP 4 file upload is implemented and locally verified without live Supabase
  credentials.
- STEP 5 CSV parsing/profile generation is implemented and locally verified without
  live Supabase credentials.
- STEP 6 automatic chart recommendation is implemented and locally verified without
  live Supabase credentials.
- STEP 7 AI dataset Q&A is implemented and locally verified without live Supabase
  credentials.
- STEP 8 AI insight generation is implemented and locally verified without live
  Supabase credentials.
- STEP 9 dashboard saving is implemented and locally verified without live
  Supabase credentials.
- STEP 10 Redis/Celery async task infrastructure is implemented and locally
  verified without live Supabase credentials.
- STEP 11 controlled AI Agent workflow is implemented and locally verified without
  live Supabase credentials.
- STEP 12 deployment configuration and production runbook are implemented and
  locally verified.
- Public read-only dashboard share links are implemented. Share links create one
  active token per dashboard, render at `/share/{token}`, and can be revoked by
  the dashboard owner.
- Production readiness tooling is being added: GitHub Actions CI, environment
  validation, API smoke checks, sample data, and a top-level README suitable for
  portfolio review.
- Local Supabase Postgres migrations and Storage policies have been applied once
  with the user's local credentials. Do not record or expose secrets.
- Architecture documentation lives in `docs/step-01-architecture.md`.
- Initialization documentation lives in `docs/step-02-initialization.md`.
- Authentication documentation lives in `docs/step-03-authentication.md`.
- File upload documentation lives in `docs/step-04-file-upload.md`.
- CSV parsing documentation lives in `docs/step-05-csv-parsing.md`.
- Automatic chart documentation lives in `docs/step-06-chart-generation.md`.
- AI Q&A documentation lives in `docs/step-07-ai-qa.md`.
- AI insights documentation lives in `docs/step-08-ai-insights.md`.
- Dashboard documentation lives in `docs/step-09-dashboards.md`.
- Async task documentation lives in `docs/step-10-async-tasks.md`.
- AI Agent documentation lives in `docs/step-11-ai-agent.md`.
- Deployment documentation lives in `docs/step-12-deployment.md`.
- Supabase Storage policies can be reapplied idempotently with
  `scripts/apply_supabase_storage_policies.py`.
- The original 12-step roadmap is complete. Next work should harden production:
  tests, CI, billing, RBAC, sharing, and real provider credentials.
- Playwright now has public smoke coverage plus an optional authenticated E2E
  workflow. The authenticated workflow requires a dedicated test account via
  `E2E_USER_EMAIL` and `E2E_USER_PASSWORD`; never commit those values.
- CI runs public Playwright smoke with `PLAYWRIGHT_START_SERVER=1` and bundled
  Chromium. Authenticated E2E should remain separate until GitHub Secrets provide
  a seeded test account.
- The web UI should be Chinese. Keep new user-facing frontend copy in Chinese.
- Frontend protected API calls should fetch a fresh Supabase access token through
  `getAccessToken()` before each request instead of reusing a possibly stale
  `session.access_token`.
- If Supabase reports an invalid browser token, the frontend should clear local
  auth state and ask the user to log in again instead of repeatedly retrying with
  the same stale token.
- Backend auth uses local Supabase JWT verification first and falls back to
  Supabase Auth `/auth/v1/user` validation for browser access tokens that are
  valid in Supabase but rejected by local JWKS/secret verification.
- Homepage login UI should be auth-aware through the client `WorkspaceHero`
  component; do not reintroduce static login buttons that stay visible after
  login.
- Visualization UI should be Chinese-first. Chart titles, chart type labels,
  tooltips, and common field labels should render in Chinese where possible.
- Recharts text should keep an explicit Chinese font stack such as Microsoft
  YaHei/PingFang/Noto Sans CJK/SimHei to avoid garbled chart labels.
- Dataset profiling must treat boolean columns separately from numeric columns.
  Coerce numeric analysis data to float before quantile/outlier/correlation work,
  and only parse time series for true datetime columns or date/time-like names.
- Homepage desktop layout uses `ResizableWorkspaceLayout` so the right analysis
  column can be widened for chart review. Preserve the draggable desktop split and
  stacked mobile behavior when changing the workspace layout.
- Upload workspace UX is selection-driven. The recent dataset list acts as the
  dataset selector; downstream analysis panels should use the selected ready
  dataset only. Failed/uploaded datasets should show a locked-state notice and a
  rerun analysis action instead of silently showing another dataset's charts.
- Dataset AI Q&A sends tools to MiMo. If the provider returns `tool_calls` with
  empty content, execute the local dataset-context tool and make a follow-up
  model call before storing the assistant answer. Do not regress to saving the
  English fallback "I could not generate an answer." for valid tool-call flows.
- MiMo can return XML-style `<tool_call>` content instead of OpenAI-compatible
  `tool_calls`. Dataset AI Q&A must parse those XML tool calls and produce a
  normal Chinese final answer instead of storing raw tool markup.
- AI Agent `prepare_dashboard` should not fail only because live AI insight
  generation is temporarily unavailable. Preserve deterministic insights and
  return a warning AI insight so the workflow can continue to dashboard saving.
- The user has configured the local large-model API key. Upload, parsing,
  deterministic charts, dashboard persistence, AI Q&A, AI insights, and AI Agent
  model-backed behavior can now be tested locally.
- User's current MiMo subscription shows the OpenAI-compatible base URL
  `https://token-plan-cn.xiaomimimo.com/v1` and available models including
  `mimo-v2.5` and `MIMO-v2.5-pro`; use `mimo-v2.5` as the default local model.
- Local MiMo live connectivity has passed once with `MIMO_BASE_URL` set to
  `https://token-plan-cn.xiaomimimo.com/v1` and `MIMO_MODEL=mimo-v2.5`, returning
  `mimo provider ok` and usage metadata. Later repeat runs hit connection-layer
  `httpx.ConnectError`, so re-test live MiMo if model-backed behavior appears
  unavailable.
- Local `.env` may include a UTF-8 BOM. `scripts/check_env.py` intentionally reads
  env files with `utf-8-sig`; keep that compatibility.
- Local startup helpers now exist:
  - `npm run local:start` starts Docker postgres/redis when available, FastAPI on
    `127.0.0.1:8000`, Next.js on `127.0.0.1:3000`, runs a health check, and opens
    the frontend.
  - `npm run local:check` checks frontend, backend, and Supabase Auth
    connectivity without printing secrets. A Supabase Auth failure means local
    services may be up while login/upload still fail from external network
    instability.
- `npm run test:scripts` runs local tooling script tests and is included in
  GitHub Actions CI.
- Deployment checklist lives in `docs/deployment-checklist.md`. Production MiMo
  defaults in `.env.production.example` and `render.yaml` should stay aligned
  with `MIMO_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1` and
  `MIMO_MODEL=mimo-v2.5`.
- Render Docker API deploy previously failed because `app/core/config.py` assumed
  the source file always had a deep local repository path and used
  `Path(__file__).parents[4]`. Keep root detection compatible with both local
  `apps/api/app/core/config.py` and Docker `/app/app/core/config.py` layouts.
- Production deployment has started with existing Supabase project:
  - Render API service `ai-data-analysis-api` is deployed at
    `https://ai-data-analysis-api.onrender.com`; `/api/v1/health` returned 200
    with `{"status":"ok","service":"api"}` after the Render path fix was merged.
  - Render Key Value Redis `ai-data-analysis-redis` exists. Background Worker was
    intentionally skipped because Render did not offer a free worker instance.
  - Vercel frontend `ai-data-analysis-web` is deployed at
    `https://ai-data-analysis-web-five.vercel.app` and returned HTTP 200.
  - Render API `CORS_ORIGINS` was updated to
    `["https://ai-data-analysis-web-five.vercel.app"]`.
  - Next production task is manual online E2E testing: login, upload, parsing,
    chart generation, AI Q&A, insights, dashboard save, and share link.
