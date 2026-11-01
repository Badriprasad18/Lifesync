# LifeSync AI — Windows Installation & Fresh Deployment Guide

This guide provides complete, step-by-step instructions for installing, configuring, running, and verifying the LifeSync AI platform on a clean Windows environment.

---

## 1. System Prerequisites

Before beginning installation, verify that the target Windows workstation has the following runtimes installed:

| Requirement | Minimum Version | Check Command | Download Source |
|---|---|---|---|
| **Operating System** | Windows 10 or 11 (64-bit) | `winver` | Microsoft |
| **Python** | Python 3.10 or higher | `python --version` | [python.org](https://www.python.org/downloads/) *(Check "Add Python to PATH" during install)* |
| **Node.js** | Node.js 18.x or 20.x LTS | `node -v` | [nodejs.org](https://nodejs.org/) |
| **Package Manager** | npm 9.x or higher | `npm -v` | Bundled with Node.js |
| **Git** | Git 2.x | `git --version` | [git-scm.com](https://git-scm.com/) |

---

## 2. Directory Structure Verification

Extract or clone the project repository into your workspace (e.g., `C:\Users\<YourUsername>\Desktop\Lifestyle`):

```
Lifestyle/
├── backend/
├── frontend/
├── run_backend.bat
├── run_frontend.bat
└── run_all.bat
```

---

## 3. Automated One-Click Installation & Launch

LifeSync AI provides pre-configured Windows batch scripts for automated startup:

### Step 1: Launch Everything
Simply double-click:
```bat
run_all.bat
```
This launcher:
1. Opens a dedicated terminal starting the FastAPI server on `http://127.0.0.1:8000`.
2. Opens a second terminal starting the Vite development server on `http://localhost:5173`.
3. Displays connection URLs.

### Step 2: Access in Browser
* **Frontend Web App:** [http://localhost:5173](http://localhost:5173)
* **Backend API Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **Health Check Endpoint:** [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 4. Manual Step-by-Step Installation (From Clean Terminal)

If setting up on a fresh machine without pre-built virtual environments, follow these manual steps:

### Step 4.1: Backend Setup (FastAPI & Python)

1. Open PowerShell or Command Prompt and navigate to the `backend` folder:
```powershell
cd Lifestyle\backend
```

2. Create a fresh Python virtual environment:
```powershell
python -m venv venv
```

3. Activate the virtual environment:
```powershell
.\venv\Scripts\activate
```
*(You will see `(venv)` appear at the start of your prompt)*

4. Upgrade pip and install all backend dependencies:
```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

5. Verify database initialization:
```powershell
python -c "from app.database import init_db; init_db(); print('SQLite database initialized successfully!')"
```

6. Run the automated backend test suite to verify installation:
```powershell
pytest -v
```
*(All 43 tests should pass)*

7. Start the backend development server:
```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

---

### Step 4.2: Frontend Setup (React & Vite)

1. Open a **second** terminal window and navigate to the `frontend` folder:
```powershell
cd Lifestyle\frontend
```

2. Install all frontend node dependencies:
```powershell
npm install
```

3. Validate TypeScript compilation:
```powershell
npm run build
```
*(Build should complete with 0 errors)*

4. Start the frontend development server:
```powershell
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:5173
```

---

## 5. Instant Evaluation Credentials

To inspect pre-loaded assessment records and evaluation charts without completing a new intake form:

* **Email:** `student_mca@college.edu`
* **Password:** `StudentPassword123!`
* Or click the **"Instant Demo Access"** button located on the Login page (`/login`).

---

## 6. Troubleshooting Common Issues

### Issue 1: `python` command not recognized in PowerShell
* **Cause:** Python was installed without checking "Add python.exe to PATH".
* **Solution:** Re-run the Python installer, select "Modify", and check "Add Python to environment variables". Alternatively, call Python directly using its absolute path (e.g. `C:\Users\<Username>\AppData\Local\Programs\Python\Python311\python.exe`).

### Issue 2: Execution Policy Error in PowerShell (`cannot be loaded because running scripts is disabled`)
* **Cause:** Windows PowerShell default execution policy blocks unsigned script activation.
* **Solution:** Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue 3: Port 8000 or Port 5173 Already in Use
* **Cause:** Another local development server or background process is occupying the port.
* **Solution:**
  - To kill process on Port 8000:
    ```powershell
    Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
    ```
  - To kill process on Port 5173:
    ```powershell
    Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
    ```

### Issue 4: Missing `lifesync.db` or `no such table` Error
* **Cause:** Database file was removed or path changed.
* **Solution:** In the `backend` directory with the virtual environment activated, run:
```powershell
python -c "from app.database import init_db; init_db()"
```
This automatically recreates all 6 tables and indexes.
