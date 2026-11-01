# LifeSync AI

> **Artificial Intelligence-Based Lifestyle Risk Assessment and Personalized Wellness Recommendation Platform**  
> *Master of Computer Applications (MCA) — Information-Based Software Technology (IBST) Project*

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-teal.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4%2B-orange.svg)](https://scikit-learn.org/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL--Mode-003B57.svg)](https://www.sqlite.org/)
[![Tests](https://img.shields.io/badge/Tests-43%20Passed%20(100%25)-brightgreen.svg)]()

---

## 1. Project Overview

**LifeSync AI** is an intelligent, full-stack lifestyle wellness intelligence and risk assessment platform designed to help university students, young professionals, and sedentary computer workers quantify, understand, and optimize daily lifestyle habits.

The platform continuously audits six core lifestyle dimensions using genuine Machine Learning algorithms:
1. **Sleep Hygiene & Rest:** Daily duration, wake freshness, circadian schedule consistency.
2. **Physical Activity & Movement:** Active minutes, weekly workout frequency, step counts, sedentary sitting hours.
3. **Nutrition & Hydration:** Daily water volume, hydration regularity, meal consistency, fruit/vegetable intake, junk food frequency.
4. **Mental Wellbeing & Stress:** Perceived stress scale, daily mindfulness minutes, study/work-life balance.
5. **Digital Hygiene:** Recreational vs. work screen hours, screen break regularity, pre-sleep blue light exposure.
6. **Substance Habits & Recovery:** Caffeine consumption, tobacco, alcohol, and restorative recovery routines.

---

## 2. Key Capabilities & AI Innovations

* **Transparent LifeSync Wellness Index (LWI):** A deterministic, explainable 0–100 wellness index derived from multidimensional weighted scoring and itemized audit deductions.
* **Unsupervised Demographic Clustering (K-Means):** Unsupervised clustering ($k=4$) trained on $N=1,500$ demographic samples to assign users to lifestyle archetypes (*Balanced High-Achiever, Sedentary Overextended, Irregular Burnout, Wellness Optimizer*).
* **2D Latent Feature Projection (PCA):** Principal Component Analysis capturing >70% explained variance to plot the user's multi-attribute lifestyle coordinate relative to population centroids.
* **Statistical Anomaly Detection (Isolation Forest):** Unsupervised ensemble tree partitioning identifying high-risk habit irregularities (e.g. chronic screen exposure combined with severe sleep deficit).
* **Personalized Habit Recommendation Engine:** Dynamic habit action center providing prioritized micro-habits, physiological justifications ("why this works"), and interactive habit completion toggling.
* **Longitudinal Behavioral Trends:** Recharts time-series progression mapping milestone scores across chronological assessment checkpoints.
* **Executive PDF Report Generator:** ReportLab-powered PDF compiler generating downloadable, branded evaluation reports with diagnostic disclaimers.

---

## 3. Technology Stack

| Layer | Technologies Employed |
|---|---|
| **Frontend Client** | React 18, TypeScript, Vite, Tailwind CSS (Dual Dark/Light Theme), Recharts, Framer Motion, Lucide React, Axios |
| **Backend API** | Python 3.10+, FastAPI (Asynchronous REST API), Pydantic v2 (Validation), ReportLab (PDF Engine) |
| **Machine Learning** | Scikit-Learn, Pandas, NumPy, Joblib |
| **Database & Auth** | SQLite 3 (WAL mode), SQLAlchemy 2.0 ORM, Passlib (Bcrypt), Python-JOSE (JWT HS256) |
| **Quality Assurance** | Pytest, HTTPX, Chrome Browser Instrumentation |

---

## 4. Application Architecture & Pages

```
LifeSync AI Web Application
├── Public Landing Page (/)
├── User Authentication (/login, /register)
└── Protected Dashboard Shell
    ├── /dashboard              → Holistic KPI Overview, Radial Score Gauge, Pillar Radar
    ├── /assessment             → 6-Step Multi-Pillar Lifestyle Questionnaire Wizard
    ├── /assessment/results     → Algorithmic Scoring Breakdown & PDF Download
    ├── /ai-analysis            → 2D PCA Demographic Scatter Plot & Anomaly Insights
    ├── /recommendations        → Interactive Habit Action Center & Completion Tracking
    ├── /analytics              → Longitudinal Behavioral Trends & Benchmark Matrix
    ├── /history                → Audit Trail Sessions Table & PDF Report Export
    ├── /profile                → Biometric Profile & Dynamic BMI Computation
    └── /settings               → Dark/Light Theme Switching & JSON Backup Export
```

---

## 5. Quick Start (Windows)

### Prerequisites
* **Python 3.10+**
* **Node.js 18+ & npm**

### Option A: One-Click Launcher (Recommended)
Simply double-click:
```bat
run_all.bat
```
This automatically starts both the FastAPI backend (`http://127.0.0.1:8000`) and Vite frontend client (`http://localhost:5173`) in dedicated command windows.

### Option B: Manual Execution

#### 1. Backend Server Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
*API Swagger Documentation is available at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

#### 2. Frontend Client Setup
```powershell
cd frontend
npm install
npm run dev
```
*Frontend User Interface is accessible at: [http://localhost:5173](http://localhost:5173)*

#### 3. Instant Demo Login Credentials
* **Email:** `student_mca@college.edu`
* **Password:** `StudentPassword123!`
*(Or click the "Instant Demo Access" button on the Login page)*

---

## 6. Project Structure

```
Lifestyle/
├── backend/
│   ├── app/
│   │   ├── ml/                 # KMeans, PCA, Scaler & Isolation Forest models
│   │   ├── models/             # SQLAlchemy ORM database models
│   │   ├── routers/            # FastAPI REST API endpoints
│   │   ├── schemas/            # Pydantic v2 validation schemas
│   │   ├── services/           # Scoring engine, recommendations & ReportLab PDF
│   │   ├── utils/              # Security, JWT tokens & password hashing
│   │   ├── config.py           # Application settings & CORS
│   │   ├── database.py         # Database engine & session maker
│   │   └── main.py             # FastAPI entrypoint
│   ├── tests/                  # 43 automated unit & integration tests
│   └── requirements.txt        # Python backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable charts, gauges, cards, wizard
│   │   ├── context/            # AuthContext & ThemeContext
│   │   ├── layouts/            # AppLayout sidebar & mobile drawer shell
│   │   ├── pages/              # 12 fully integrated application pages
│   │   ├── services/           # Centralized API service & demo fallbacks
│   │   ├── types/              # Complete TypeScript interfaces
│   │   ├── App.tsx             # Routing & route guards
│   │   └── index.css           # Design tokens, glassmorphism & themes
│   ├── package.json
│   └── vite.config.ts
├── docs/                       # Project planning & architectural documents
├── run_backend.bat             # Batch launcher for backend
├── run_frontend.bat            # Batch launcher for frontend
├── run_all.bat                 # One-click dual launcher
├── PROJECT_OVERVIEW.md         # Full Academic Project Report
├── SYSTEM_ARCHITECTURE.md      # Detailed Architecture & Component Diagrams
├── DATABASE_DESIGN.md          # Database Entities & Schema Specifications
├── ER_DIAGRAM.md               # Entity Relationship Diagram & Cardinalities
├── USE_CASE_DIAGRAM.md         # Actor Use Cases & Workflow Specifications
├── DATA_FLOW_DIAGRAM.md        # DFD Level 0, Level 1, Level 2 Diagrams
├── ML_METHODOLOGY.md           # Machine Learning Methodology & Clustering
├── API_DOCUMENTATION.md        # Comprehensive REST API Specification
├── TESTING_REPORT.md           # 43/43 QA Test Results & Audit Log
├── INSTALLATION_GUIDE.md       # Windows Deployment & Fresh Setup Guide
└── USER_MANUAL.md              # Demonstration Guide & University Viva Q&A
```

---

## 7. Automated Testing Status

The platform has been audited using comprehensive test automation:
* **Backend Test Suite:** `43 / 43 tests passing (100%)` via `pytest`.
* **Frontend Compilation:** `0 TypeScript errors` across 2,370 modules via `npm run build`.
* **Console Errors:** `0 runtime console errors` verified across all routes.

To run the automated tests:
```powershell
cd backend
.\venv\Scripts\activate
pytest -v
```

---

## 8. Academic & Ethical Disclaimer

LifeSync AI is developed strictly for educational and self-reflection purposes as part of the MCA curriculum. The scores, classifications, and recommendations provided do **NOT** constitute medical diagnoses, clinical advice, or treatment plans. Users experiencing acute physical or psychological health concerns are directed to consult licensed healthcare professionals.
