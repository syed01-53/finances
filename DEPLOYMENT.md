# Deployment Guide

Deploy the **backend** to [Railway](https://railway.app) and the **frontend** to [Vercel](https://vercel.com).

Repo: `syed01-53/finances`

## Prerequisites

- GitHub repo pushed with `backend/` and `frontend/` folders
- Railway account
- Vercel account

---

## 1. Backend (Railway) — service `finances`

### Service settings

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Branch | `main` |
| Config file | `backend/railway.toml` |

### Add PostgreSQL (required)

1. In the Railway project, click **New** → **Database** → **PostgreSQL**.
2. Open the **finances** backend service → **Variables**.
3. Add a variable referencing Postgres:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

Replace `Postgres` with your PostgreSQL service name if different.

> **Do not** use `localhost` or values from `.env.example`. Railway suggested variables often copy local dev settings — those will fail in production.

### Set production variables

Use `backend/railway.env.example` as the template. On **finances** → **Variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (reference linked PostgreSQL) |
| `CORS_ORIGINS` | `https://your-app.vercel.app` (set after Vercel deploy) |
| `CORS_ALLOW_VERCEL_PREVIEWS` | `true` (optional) |
| `LOG_LEVEL` | `INFO` |

**Do NOT set on Railway:**

| Variable | Why |
|----------|-----|
| `WEASYPRINT_DLL_DIRECTORIES` | Windows-only; not used on Linux |
| Localhost `DATABASE_URL` | Points to the container, not your database |
| Localhost `CORS_ORIGINS` | Browser will block your Vercel frontend |

### Networking

1. **Settings** → **Networking** → **Generate Domain**.
2. Verify: `https://YOUR-RAILWAY-DOMAIN/health` → `{"status":"ok"}`

### Deploy flow

On each deploy, Railway (Nixpacks) runs:

1. `pip install -r requirements.txt` (install phase — do **not** add a duplicate build command)
2. `alembic upgrade head` (pre-deploy migrations)
3. `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (start)

**Railway dashboard settings:**

| Setting | Value |
|---------|-------|
| Builder | Nixpacks |
| Build command | *(leave empty)* |
| Nixpacks config | `backend/nixpacks.toml` |
| Start command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Healthcheck | `/health` |

---

## 2. Frontend (Vercel)

### Project settings

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### Environment variables

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://YOUR-RAILWAY-DOMAIN/api` |

No trailing slash. Apply to Production, Preview, and Development.

---

## 3. Connect frontend and backend

1. Deploy Vercel → copy your URL (e.g. `https://finances-abc.vercel.app`).
2. Railway **finances** → **Variables** → set:
   ```
   CORS_ORIGINS=https://finances-abc.vercel.app
   ```
3. Redeploy backend if needed.
4. Open the Vercel site and confirm the client list loads.

---

## Local development

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env       # edit DATABASE_URL for local Postgres
alembic upgrade head
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

---

## Troubleshooting Railway failures

| Symptom | Cause | Fix |
|---------|-------|-----|
| Deploy fails at `alembic` | Wrong/missing `DATABASE_URL` | Link PostgreSQL; use `${{Postgres.DATABASE_URL}}` |
| `connection refused` to localhost | Used local `.env` values on Railway | Remove localhost URL; use Postgres reference |
| Build fails on `pip install` | Old `requirements.txt` on GitHub or duplicate build command | **Push latest code**; leave **Build command** empty in Railway UI |
| Build fails on `pycairo` / `cairo not found` | `svglib` 1.6+ pulls native pycairo | Fixed: `svglib==1.5.1` pinned in `requirements.txt` |
| Deploy still shows 25-line requirements | GitHub not updated | Run `git push origin main` after committing backend changes |
| CORS error in browser | Wrong `CORS_ORIGINS` | Set exact Vercel URL or `CORS_ALLOW_VERCEL_PREVIEWS=true` |
| `/health` fails | App crashed on start | Check deploy logs after fixing `DATABASE_URL` |

### Check deploy logs

Railway → **finances** → **Deployments** → latest failed deploy:

- **Build logs** — `pip install` errors
- **Deploy logs** — `alembic`, database connection, uvicorn startup

---

## Environment variable summary

### Railway (`finances`)

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
CORS_ORIGINS=https://your-app.vercel.app
CORS_ALLOW_VERCEL_PREVIEWS=true
LOG_LEVEL=INFO
```

### Vercel (frontend)

```
VITE_API_URL=https://your-railway-domain.up.railway.app/api
```
