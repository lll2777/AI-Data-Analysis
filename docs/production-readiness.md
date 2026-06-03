# Production Readiness

## What Is Ready

- Monorepo with Next.js frontend and FastAPI backend.
- Supabase Auth and Storage integration points.
- PostgreSQL schema migrations.
- CSV/Excel parsing and profiling.
- Chart recommendations.
- AI Q&A through provider adapter architecture.
- AI insights.
- Dashboard saving.
- Public read-only dashboard share links.
- Redis/Celery background jobs.
- Controlled AI Agent workflow.
- Vercel and Render deployment templates.
- CI for formatting, linting, backend compile, API smoke, and frontend build.
- Windows local startup and connectivity checks.

## What Still Needs Real Credentials

- Supabase project URL and keys.
- Supabase JWT secret.
- Supabase service role key.
- Supabase Storage bucket and policies.
- PostgreSQL database URL.
- Redis URL.
- Mimo API key.
- Vercel project environment variables.
- Render or Railway backend environment variables.

## Local Readiness Commands

```bash
python scripts/check_env.py --file .env --profile development
npm run test:scripts
conda run -n pytorch python scripts/smoke_api.py --local-testclient
conda run -n pytorch python scripts/apply_supabase_storage_policies.py
npm run format:check
npm run lint
npm run build
npm run e2e:smoke
npm run e2e
E2E_USER_EMAIL="test@example.com" E2E_USER_PASSWORD="test-password" npm run e2e:auth
conda run -n pytorch python -m compileall apps/api/app scripts
```

The Playwright smoke suite uses the root `playwright.config.ts` and defaults to
`http://127.0.0.1:3000`. Start the frontend before running `npm run e2e`, or set
`PLAYWRIGHT_BASE_URL` to a deployed frontend URL. The local configuration uses
the installed Chrome channel to avoid downloading browser binaries.

CI runs `npm run e2e:smoke` with `PLAYWRIGHT_START_SERVER=1`, so the Next.js dev
server starts automatically and Playwright uses bundled Chromium on Linux. Keep
the CI smoke suite public-only until dedicated seeded credentials are stored as
GitHub Secrets.

The authenticated Playwright workflow is skipped unless `E2E_USER_EMAIL` and
`E2E_USER_PASSWORD` are provided. Use a dedicated Supabase test user and store
those values in local shell variables or GitHub Secrets. The authenticated suite
uploads `samples/sales-demo.csv`, waits for parsing, generates charts, asks an AI
question, and runs the AI Agent workflow.

## Manual End-to-End Checklist

1. Apply migrations with `python scripts/apply_postgres_migrations.py`.
2. Apply Supabase storage policies with
   `python scripts/apply_supabase_storage_policies.py`.
3. Start API with `conda activate pytorch` then `uvicorn app.main:app --reload`.
4. Start frontend with `npm run dev`.
5. Sign up or sign in.
6. Upload `samples/sales-demo.csv`.
7. Confirm parsed preview and profile.
8. Generate charts.
9. Ask an AI question.
10. Generate insights.
11. Save dashboard.
12. Generate a share link and open `/share/{token}` without signing in.
13. Queue a background analysis job with Redis/Celery running.
14. Run the AI Agent.

## Suggested Next Hardening Work

- Add backend unit tests for repositories and services.
- Add frontend component tests for upload, charts, insights, jobs, and agent panels.
- Configure GitHub Secrets for the authenticated Playwright workflow and add a
  separate authenticated CI job.
- Extend authenticated Playwright coverage to dashboard saving and async job
  polling.
- Extend authenticated Playwright coverage to share-link creation and public
  `/share/{token}` rendering.
- Add structured JSON logs on top of the current request IDs.
- Add rate limits on upload, AI, and agent endpoints.
- Add billing, RBAC, and audit logs from the roadmap.
