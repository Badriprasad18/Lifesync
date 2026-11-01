import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, XCircle, RefreshCw, Server, Cpu, Database, ShieldCheck, HeartPulse } from 'lucide-react';
import { fetchHealthCheck } from './services/api';
import { HealthCheckResponse } from './types';

export function App() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealthCheck();
      setHealth(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Failed to connect to backend.');
      } else {
        setError('Failed to connect to backend.');
      }
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 selection:bg-cyan-500 selection:text-slate-950">
      <div className="max-w-3xl w-full space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
            <HeartPulse className="w-4 h-4 text-cyan-400 animate-pulse" />
            MCA IBST Mini Project — Phase 2 Initialized
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            LifeSync AI
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Artificial Intelligence-Based Lifestyle Risk Assessment and Personalized Wellness Recommendation Platform
          </p>
        </div>

        {/* Backend Connectivity Status Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-cyan-950/20 border border-slate-700/60">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <Server className="w-6 h-6 text-cyan-400" />
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Backend Communication Status</h2>
                <p className="text-xs text-slate-400">Endpoint: <code className="text-cyan-300">/api/health</code></p>
              </div>
            </div>
            <button
              onClick={checkConnection}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              Re-check
            </button>
          </div>

          {/* Dynamic Status Output */}
          {loading && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
              <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
              <span className="text-sm">Connecting to FastAPI on http://localhost:8000...</span>
            </div>
          )}

          {!loading && error && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-semibold">Backend Unreachable</p>
                  <p className="text-xs text-rose-300/80">
                    Ensure FastAPI is running on <code className="bg-rose-900/50 px-1 py-0.5 rounded">http://localhost:8000</code>.
                  </p>
                  <p className="text-xs text-slate-400 font-mono pt-1">Error: {error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && health && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-sm flex-1">
                  <span className="font-semibold text-emerald-300">Communication Verified:</span> Backend is active and responding.
                  <div className="text-xs text-slate-400 mt-0.5">
                    Service: {health.project} (v{health.version}) • Environment: {health.environment}
                  </div>
                </div>
              </div>

              {/* Module Readiness Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center space-y-1">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 mx-auto" />
                  <p className="text-xs font-medium text-slate-300">Auth & JWT</p>
                  <span className="inline-block px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-400 font-mono">
                    {health.modules?.auth || 'ready'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center space-y-1">
                  <Activity className="w-4 h-4 text-cyan-400 mx-auto" />
                  <p className="text-xs font-medium text-slate-300">Scoring Engine</p>
                  <span className="inline-block px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-400 font-mono">
                    {health.modules?.scoring_engine || 'ready'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center space-y-1">
                  <Cpu className="w-4 h-4 text-cyan-400 mx-auto" />
                  <p className="text-xs font-medium text-slate-300">ML Subsystem</p>
                  <span className="inline-block px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-400 font-mono">
                    {health.modules?.ml_subsystem || 'ready'}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center space-y-1">
                  <Database className="w-4 h-4 text-cyan-400 mx-auto" />
                  <p className="text-xs font-medium text-slate-300">SQLite Engine</p>
                  <span className="inline-block px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/10 text-emerald-400 font-mono">
                    {health.modules?.database || 'ready'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Phase 2 Checklist Card */}
        <div className="glass-card rounded-xl p-5 border border-slate-800 text-xs text-slate-400 space-y-2">
          <p className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Phase 2 Verification Checklist</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Project directory architecture created</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Python 3.14 venv & dependencies configured</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Vite + React + TypeScript + Tailwind CSS initialized</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>CORS & API Base URLs linked</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
