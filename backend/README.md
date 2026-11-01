# LifeSync AI – Backend Service

High-performance Python ASGI backend service powered by **FastAPI**, **SQLite**, and **Scikit-Learn**.

---

## 1. Prerequisites
- **Python:** 3.10+ (Tested on Windows with Python 3.14)
- **Virtual Environment Tool:** Python built-in `venv`

---

## 2. Directory Structure

```text
backend/
├── app/
│   ├── main.py              # FastAPI initialization & CORS
│   ├── config.py            # Pydantic environment configuration
│   ├── models/              # SQLAlchemy database ORM models
│   ├── schemas/             # Pydantic request & response schemas
│   ├── routers/             # API routes (health, auth, assessments, analytics)
│   ├── services/            # Scoring engine, recommendations & PDF generation
│   ├── ml/                  # Machine learning inference runtime
│   └── utils/               # Security, hashing & formatting helpers
├── data/                    # SQLite database file storage
├── tests/                   # Pytest test suites
├── venv/                    # Local Python virtual environment
├── requirements.txt         # Pinned pip dependencies
├── .env.example             # Configuration template
└── .env                     # Local environment settings
```

---

## 3. Windows Localhost Setup & Execution

### Step 1: Activate Virtual Environment
Open PowerShell or Command Prompt in the `Lifestyle/backend` directory:
```powershell
.\venv\Scripts\Activate.ps1
```
*(If script execution is disabled in PowerShell, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first, or use `.\venv\Scripts\activate.bat` in cmd).*

### Step 2: Install Dependencies
```powershell
pip install -r requirements.txt
```

### Step 3: Run the Development Server
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

---

## 4. API Endpoints & Documentation
Once running, interactive documentation is available at:
- **Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Verification:** [http://localhost:8000/api/health](http://localhost:8000/api/health)
