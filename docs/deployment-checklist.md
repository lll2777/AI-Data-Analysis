# Deployment Checklist

Use this checklist before publishing AI Data Analysis to a public environment.
Do not paste real secrets into this file.

## 1. Provision Services

- Create or choose a Supabase project.
- Enable Supabase email authentication.
- Create the Supabase Storage bucket named `datasets`.
- Provision PostgreSQL.
- Provision Redis.
- Choose the backend host: Render or Railway.
- Choose the frontend host: Vercel.

## 2. Configure Backend Environment

Set these variables on the API service and worker service:

```bash
APP_ENV=production
LOG_LEVEL=info
DATABASE_URL=<managed-postgres-url>
REDIS_URL=<managed-redis-url>
CORS_ORIGINS=["https://your-vercel-app.vercel.app"]
SUPABASE_URL=<supabase-project-url>
SUPABASE_PUBLISHABLE_KEY=<supabase-publishable-key>
SUPABASE_SERVICE_ROLE_KEY=<supabase-service-role-key>
SUPABASE_JWT_SECRET=<supabase-jwt-secret>
SUPABASE_JWT_AUDIENCE=authenticated
SUPABASE_STORAGE_BUCKET=datasets
MAX_UPLOAD_SIZE_BYTES=26214400
AI_PROVIDER=mimo
MIMO_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
MIMO_API_KEY=<mimo-api-key>
MIMO_MODEL=mimo-v2.5
```

## 3. Configure Frontend Environment

Set these variables on Vercel:

```bash
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-api-host.example.com
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<supabase-publishable-key>
NEXT_PUBLIC_MAX_UPLOAD_SIZE_BYTES=26214400
```

## 4. Apply Database and Storage Setup

Run the PostgreSQL migrations from a trusted shell with production
`DATABASE_URL` configured:

```bash
python scripts/apply_postgres_migrations.py
```

Apply Supabase Storage policies with Supabase credentials configured:

```bash
python scripts/apply_supabase_storage_policies.py
```

## 5. Deploy Runtime Services

- Deploy the API service from `infra/docker/Dockerfile.api`.
- Deploy the Celery worker from `infra/docker/Dockerfile.api` with command:

```bash
celery -A app.tasks.celery_app.celery_app worker --loglevel=info -c 2 -Q analysis
```

- Deploy the Vercel frontend after the API URL is known.
- Set backend `CORS_ORIGINS` to the final Vercel app URL.

## 6. Smoke Test

- Open `https://your-api-host.example.com/api/v1/health`.
- Open the Vercel frontend.
- Sign in with a test user.
- Upload `samples/sales-demo.csv`.
- Confirm parsing reaches ready state.
- Generate charts.
- Ask one AI question.
- Generate insights.
- Save a dashboard.
- Create a public share link and open it in a signed-out browser.
- Run the AI Agent once.

## 7. Launch Gate

Launch only when these are true:

- GitHub Actions CI is passing on the deployed commit.
- API health check returns `status=ok`.
- Frontend can reach the production API without CORS errors.
- Supabase Auth works from the deployed frontend.
- Supabase Storage accepts and reads dataset uploads.
- MiMo returns a model-backed answer with `mimo-v2.5`.
- Worker logs show no repeated Redis or database connection errors.
