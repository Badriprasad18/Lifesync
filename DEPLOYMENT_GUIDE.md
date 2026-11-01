# LifeSync AI - Complete Deployment Guide

This guide provides step-by-step instructions for deploying **LifeSync AI** to production with **Vercel** for the high-performance React/Vite frontend and **Render / Railway** for the FastAPI Machine Learning backend.

---

## Architecture Overview

```
 ┌──────────────────────────────────────────────────────────────┐
 │                     User Web Browser                         │
 └──────────────────────────────┬───────────────────────────────┘
                                │
                 ┌──────────────┴──────────────┐
                 ▼                             ▼
   ┌───────────────────────────┐ ┌───────────────────────────┐
   │      Vercel (Frontend)    │ │      Render (Backend)     │
   │  - Vite + React + TS      │ │  - FastAPI + Python 3.11  │
   │  - Global Edge CDN        │ │  - Scikit-Learn ML Models │
   │  - SPA Routing Rewrites   │ │  - ReportLab PDF Engine   │
   │  - Instant Cache Purge    │ │  - Real-Time AI Chatbot   │
   └───────────────────────────┘ └───────────────────────────┘
```

---

## Method 1: Deploying the Frontend to Vercel (Recommended)

### Step 1: Push Code to GitHub
Ensure all your latest changes are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "feat: Prepare Vercel and Render production deployment configuration"
git push origin master
```

### Step 2: Import into Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Select your **LifeSync** GitHub repository and click **Import**.

### Step 3: Configure Project Settings in Vercel
Vercel will automatically detect the configuration files we have prepared:
- **Framework Preset**: `Vite`
- **Root Directory**:
  - *Option A (Default)*: Leave as `./` (Root `vercel.json` and `package.json` will automatically build the `frontend` directory).
  - *Option B*: Click **Edit** and set Root Directory to `frontend`.
- **Build Command**: `npm run build`
- **Output Directory**: `dist` (or `frontend/dist` if using root)

### Step 4: Add Environment Variables in Vercel
In the **Environment Variables** section on Vercel, add:
| Key | Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://your-backend.onrender.com/api` | URL of your deployed FastAPI backend |

*(If you haven't deployed the backend yet, you can test with `http://localhost:8000/api` or deploy the backend first as shown below).*

### Step 5: Click Deploy
Click **Deploy**. Within 1–2 minutes, your website will be live at `https://lifesync-ai.vercel.app` (or your assigned Vercel URL).

> [!NOTE]
> All client-side routes (`/dashboard`, `/assistant`, `/assessment`, `/recommendations`, etc.) are pre-configured in `vercel.json` with SPA rewrites to `/index.html` so you will never get 404 errors on page refreshes.

---

## Method 2: Deploying the Backend (Free on Render)

Because LifeSync AI includes Scikit-Learn, NumPy, Pandas, Matplotlib, and SQLite, deploying the backend as a standard web service on **Render** (free tier) is recommended.

### Step 1: Create a Render Account
Go to [render.com](https://render.com) and sign up with GitHub.

### Step 2: Create a Web Service
1. Click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the following fields:
   - **Name**: `lifesync-backend`
   - **Region**: Closest to you (e.g. Frankfurt, Singapore, Oregon)
   - **Branch**: `master`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`

### Step 3: Add Environment Variables in Render
Add the following under **Environment Variables**:
| Key | Value |
|---|---|
| `ENVIRONMENT` | `production` |
| `ALLOWED_ORIGINS` | `https://*.vercel.app,http://localhost:5173` |
| `SECRET_KEY` | *(Click generate or paste a random 64-char string)* |
| `DATABASE_URL` | `sqlite:///./lifesync.db` |
| `GEMINI_API_KEY` | *(Optional: Your Google Gemini API key)* |
| `OPENAI_API_KEY` | *(Optional: Your OpenAI API key)* |

4. Click **Create Web Service**.
5. Once deployment completes, copy your Render backend URL (e.g., `https://lifesync-backend-xxxx.onrender.com`).

### Step 4: Link Render URL to Vercel
Go back to your Vercel Project Settings → **Environment Variables**:
Update `VITE_API_BASE_URL` to:
```
https://lifesync-backend-xxxx.onrender.com/api
```
Click **Redeploy** on Vercel. Frontend and Backend are now connected in production!

---

## Alternative: Deploying Backend with Docker (Railway / Fly.io / VPS)

A production-ready [`backend/Dockerfile`](file:///c:/Users/badri/Desktop/Lifestyle/backend/Dockerfile) is also provided in the repository:
```bash
# Build and run locally or push to any container registry:
cd backend
docker build -t lifesync-ai-backend .
docker run -p 8000:8000 -e ALLOWED_ORIGINS="*" lifesync-ai-backend
```

---

## Verification Checklist

- [x] **Client-side routing**: Deep links (`/dashboard`, `/assistant`, `/analytics`) redirect to `index.html` via `vercel.json`.
- [x] **CORS Configuration**: `backend/app/main.py` includes `allow_origin_regex=r"https://.*\.vercel\.app"` allowing any Vercel domain.
- [x] **Asset Caching**: Static JS and CSS in `/assets/*` have 1-year immutable caching configured in `vercel.json`.
- [x] **Code Splitting**: Rollup configured with separate chunks for `vendor`, `charts`, `icons`, and `motion`.
- [x] **Zero Build Warnings**: Production Vite build finishes with 0 errors and chunks < 450 kB.
