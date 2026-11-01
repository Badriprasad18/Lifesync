# LifeSync AI

> **Artificial Intelligence-Based Lifestyle Risk Assessment and Personalized Wellness Recommendation Platform**  
> *IBST Mini Project | Master of Computer Applications (MCA)*

---

## 1. Project Overview

**LifeSync AI** is a full-stack, local-first lifestyle analytics and health hygiene platform. It evaluates daily lifestyle metrics across six foundational pillars (sleep, physical activity, nutrition & hydration, stress, screen time, and general habits) using an explainable heuristic scoring engine, combined with unsupervised machine learning (**K-Means Clustering** for demographic archetype classification and **Isolation Forest** for acute compound anomaly detection).

> [!IMPORTANT]
> **Educational Disclaimer:** LifeSync AI is developed strictly for educational and lifestyle self-improvement purposes. It is not a clinical medical diagnostic tool and does not provide clinical prescriptions or treatments.

---

## 2. Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend:** Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0
- **Database:** SQLite 3 (WAL mode enabled)
- **Machine Learning:** Scikit-Learn, Pandas, NumPy, Joblib
- **Authentication:** Stateless Bearer JWT & Bcrypt password hashing
- **Reporting:** ReportLab (Pure Python PDF Generation)

---

## 3. Project Structure

```text
Lifestyle/
├── backend/                  # FastAPI Application
│   ├── app/                  # Application code (models, schemas, routers, services, ml)
│   ├── data/                 # SQLite database storage
│   ├── tests/                # Automated pytest test suites
│   ├── venv/                 # Local Python virtual environment
│   ├── requirements.txt      # Backend Python dependencies
│   ├── .env.example          # Environment template
│   └── README.md             # Backend setup & API documentation
│
├── frontend/                 # React + TypeScript + Vite Client
│   ├── src/                  # React source (components, pages, services, types)
│   ├── package.json          # Frontend dependencies & scripts
│   ├── tailwind.config.js    # Tailwind styling tokens
│   ├── vite.config.ts        # Vite configuration & proxy settings
│   ├── .env.example          # Frontend environment template
│   └── README.md             # Frontend setup instructions
│
├── ml/                       # Machine Learning Engineering Subsystem
│   ├── datasets/             # Calibrated synthetic baseline datasets
│   ├── training/             # Scikit-Learn training pipelines
│   └── models/               # Pickled model artifacts (.pkl)
│
├── docs/                     # Architectural & Engineering Specifications
│   ├── PRD.md                # Product Requirements Document
│   ├── SYSTEM_ARCHITECTURE.md# Complete System Architecture
│   ├── DATABASE_DESIGN.md    # Relational Database Schema & WAL
│   ├── ML_DESIGN.md          # Explainable Scoring & ML Formulas
│   ├── API_DESIGN.md         # REST API Endpoints Specification
│   ├── UI_UX_DESIGN.md       # Visual Design System & Wireframes
│   ├── IMPLEMENTATION_PLAN.md# 9-Phase Development Roadmap
│   └── TESTING_PLAN.md       # Quality Assurance & Testing Strategy
│
├── .gitignore                # Git ignore configuration
└── README.md                 # Main project documentation
```

---

## 4. Quick Start (Windows Localhost)

### 4.1 Running the Backend Service
1. Open a PowerShell terminal in the `backend/` directory:
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
2. Verify API status at:
   - Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)
   - Swagger Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 4.2 Running the Frontend Client
1. Open a separate PowerShell terminal in the `frontend/` directory:
   ```powershell
   cd frontend
   npm run dev
   ```
2. Open your browser and navigate to:
   - Application URL: [http://localhost:5173](http://localhost:5173)

---

## 5. Development Status

| Phase | Description | Status |
| :---: | :--- | :---: |
| **Phase 1** | System Planning & Specifications (8 Core Documents) | Completed |
| **Phase 2** | Project Scaffolding, Environment Setup & Health Verification | Completed |
| **Phase 3** | Database Layer & SQLAlchemy Models | Next |
| **Phase 4** | Explainable Scoring Engine & Heuristics | Planned |
| **Phase 5** | Machine Learning Pipelines (KMeans & Isolation Forest) | Planned |
| **Phase 6** | REST APIs & ReportLab PDF Generation | Planned |
| **Phase 7** | Frontend UI Pages & Recharts Visualizations | Planned |
| **Phase 8** | Integration & End-to-End System Testing | Planned |
| **Phase 9** | Final Verification & Academic Packaging | Planned |
