# Deployment Guide

Deploy the **backend** to [Railway](https://railway.app) and the **frontend** to [Vercel](https://vercel.com).

## Prerequisites

- GitHub repo with this project pushed
- Railway account
- Vercel account

---

## 1. Backend (Railway)

### Create the service

1. In Railway, click **New Project** → **Deploy from GitHub repo**.
2. Select your repository.
3. Open the service **Settings** → set **Root Directory** to `backend`.
4. Railway will detect Python via `runtime.txt` and use `railway.toml` / `Procfile`.

### Add PostgreSQL

1. In the same Railway project, click **New** → **Database** → **PostgreSQL**.
2. Open the PostgreSQL service → **Variables** → copy `DATABASE_URL`.
3. In your **backend service** → **Variables**, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Paste from PostgreSQL service (Railway sets this automatically if you link the database) |
| `CORS_ORIGINS` | `https://your-app.vercel.app` (update after Vercel deploy) |
| `CORS_ALLOW_VERCEL_PREVIEWS` | `true` (optional — allows `*.vercel.app` preview URLs) |
| `LOG_LEVEL` | `INFO` |

> Railway may provide `DATABASE_URL` as `postgres://...`. The app converts it to `postgresql://` automatically.

### Deploy

1. Railway deploys on push to your connected branch.
2. On startup, `start.sh` runs `alembic upgrade head` then starts uvicorn.
3. Open **Settings** → **Networking** → **Generate Domain** to get a public URL like `https://your-app.up.railway.app`.
4. Verify: `https://your-app.up.railway.app/health` should return `{"status":"ok"}`.

---

## 2. Frontend (Vercel)

### Create the project

1. In Vercel, click **Add New** → **Project** → import your GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite** (auto-detected).

### Build settings

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### Environment variables

Add in Vercel → **Settings** → **Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-app.up.railway.app/api` |

Use your actual Railway public URL. No trailing slash.

Apply to **Production**, **Preview**, and **Development** environments.

### Deploy

1. Click **Deploy**.
2. `vercel.json` handles React Router client-side routing (all routes → `index.html`).
3. Copy your Vercel URL (e.g. `https://your-app.vercel.app`).

---

## 3. Connect frontend and backend

1. Go back to **Railway** → backend service → **Variables**.
2. Update `CORS_ORIGINS` to your Vercel production URL:
   ```
   https://your-app.vercel.app
   ```
3. Redeploy the backend (or it redeploys automatically on variable change).
4. Open your Vercel site and confirm clients/reports load.

---

## Local development

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env       # edit DATABASE_URL
alembic upgrade head
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env       # VITE_API_URL=http://localhost:8000/api
npm run dev
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors in browser | Add your exact Vercel URL to Railway `CORS_ORIGINS`, or set `CORS_ALLOW_VERCEL_PREVIEWS=true` |
| Database connection failed | Confirm PostgreSQL is linked and `DATABASE_URL` is set on the backend service |
| 404 on page refresh (Vercel) | `vercel.json` rewrites should be present in `frontend/` |
| API calls go to localhost | Set `VITE_API_URL` in Vercel env vars and redeploy |
| PDF generation fails | Railway uses xhtml2pdf fallback; WeasyPrint system libs are installed via `nixpacks.toml` |

---

## Environment variable summary

### Railway (backend)

```
DATABASE_URL=<from PostgreSQL>
CORS_ORIGINS=https://your-app.vercel.app
CORS_ALLOW_VERCEL_PREVIEWS=true
LOG_LEVEL=INFO
```

### Vercel (frontend)

```
VITE_API_URL=https://your-app.up.railway.app/api
```
