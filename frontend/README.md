# LifeSync AI – Frontend Client

Modern Single-Page Application (SPA) built using **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**.

---

## 1. Prerequisites
- **Node.js:** v18.0+ (Tested on Windows with Node v25.9)
- **Package Manager:** npm (v10+)

---

## 2. Directory Structure

```text
frontend/
├── src/
│   ├── assets/              # Icons, logos and illustrations
│   ├── components/          # Reusable UI primitives and charts
│   ├── context/             # Authentication & session state
│   ├── hooks/               # Custom React lifecycle hooks
│   ├── layouts/             # App shell, Navbar, ProtectedRoute
│   ├── pages/               # Routed pages (Landing, Assessment, Dashboard)
│   ├── services/            # Axios API clients and interceptors
│   ├── types/               # TypeScript interfaces
│   ├── App.tsx              # Root component
│   ├── main.tsx             # DOM mount point
│   └── index.css            # Tailwind CSS base and glassmorphism utilities
├── index.html               # Single page HTML entry
├── package.json             # NPM package scripts & dependencies
├── tailwind.config.js       # Tailwind design tokens
├── vite.config.ts           # Vite bundler & alias configuration
├── .env.example             # Frontend environment variables template
└── .env                     # Local environment settings
```

---

## 3. Windows Localhost Setup & Execution

### Step 1: Install Dependencies
Open PowerShell or Command Prompt in the `Lifestyle/frontend` directory:
```powershell
npm install
```

### Step 2: Configure Environment
Copy `.env.example` to `.env` (already done by default):
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### Step 3: Start the Vite Dev Server
```powershell
npm run dev
```
The application will launch on:
- **Local URL:** [http://localhost:5173](http://localhost:5173)
