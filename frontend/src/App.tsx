import { useState, useEffect } from 'react';
import {
  HeartPulse,
  Server,
  ClipboardList,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { AssessmentWizard } from './components/assessment/AssessmentWizard';
import {
  fetchHealthCheck,
  loginUser,
  registerUser,
  getCurrentUser,
  listAssessments,
  deleteAssessment,
} from './services/api';
import { HealthCheckResponse, User, AssessmentDetail, AssessmentSummary } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'wizard' | 'history' | 'system'>('wizard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [backendLoading, setBackendLoading] = useState<boolean>(true);
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [editingAssessment, setEditingAssessment] = useState<AssessmentDetail | null>(null);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Initialize session: check backend health and auto-authenticate demo student
  useEffect(() => {
    const initApp = async () => {
      setBackendLoading(true);
      try {
        const healthData = await fetchHealthCheck();
        setHealth(healthData);

        // Try getting existing current user
        try {
          const user = await getCurrentUser();
          setCurrentUser(user);
        } catch {
          // If no token or token expired, auto-authenticate demo student
          try {
            const loginRes = await loginUser({
              email: 'student_mca@college.edu',
              password: 'StudentPassword123!',
            });
            setCurrentUser(loginRes.user);
          } catch {
            // Register demo student if account not yet created
            const regRes = await registerUser({
              email: 'student_mca@college.edu',
              password: 'StudentPassword123!',
              full_name: 'Aditya Sharma',
              age: 23,
              gender: 'male',
              height_cm: 176.0,
              weight_kg: 71.5,
              occupation: 'MCA Student',
            });
            setCurrentUser(regRes.user);
          }
        }
      } catch (err: any) {
        console.error('Backend connection error:', err);
      } finally {
        setBackendLoading(false);
      }
    };

    initApp();
  }, []);

  // Fetch assessment history whenever history tab is opened
  const loadHistory = async () => {
    try {
      const data = await listAssessments();
      setAssessments(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const handleAssessmentSuccess = (assessment: AssessmentDetail) => {
    setStatusNotification(
      `Assessment #${assessment.id} saved successfully! Score: ${assessment.scores.composite_lwi} (${assessment.scores.risk_tier})`
    );
    setEditingAssessment(null);
    loadHistory();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm(`Are you sure you want to delete assessment #${id}?`)) {
      try {
        await deleteAssessment(id);
        setStatusNotification(`Assessment #${id} was cancelled and deleted.`);
        loadHistory();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to delete assessment');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <HeartPulse className="w-5 h-5 text-slate-950 font-black animate-pulse" />
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                LifeSync AI
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Lifestyle Risk Assessment & Wellness Recommendations
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => {
                setEditingAssessment(null);
                setActiveTab('wizard');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'wizard'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Assessment</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'history'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Records ({assessments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('system')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'system'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">System Status</span>
            </button>
          </nav>

          {/* User Badge */}
          <div className="flex items-center gap-2">
            {currentUser && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-medium">{currentUser.profile?.full_name || currentUser.email}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Status Notification Banner */}
        {statusNotification && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 flex items-center justify-between text-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{statusNotification}</span>
            </div>
            <button
              onClick={() => setStatusNotification(null)}
              className="text-emerald-400 hover:underline font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: QUESTIONNAIRE WIZARD */}
        {activeTab === 'wizard' && (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                Phase 4 — Lifestyle Assessment Intake
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
                Multi-Pillar Lifestyle Evaluation
              </h1>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">
                Evaluate your sleep architecture, physical movement, hydration hygiene, dietary patterns, stress, and digital habits.
              </p>
            </div>

            <AssessmentWizard
              editingId={editingAssessment?.id}
              initialData={editingAssessment?.inputs as any}
              onSuccess={handleAssessmentSuccess}
              onCancel={() => {
                setEditingAssessment(null);
                setActiveTab('history');
              }}
            />
          </div>
        )}

        {/* TAB 2: HISTORICAL ASSESSMENTS LOG */}
        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-100">Assessment History Log</h2>
                <p className="text-xs text-slate-400">All submissions saved in the local SQLite database.</p>
              </div>
              <button
                onClick={() => {
                  setEditingAssessment(null);
                  setActiveTab('wizard');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                + New Assessment
              </button>
            </div>

            {assessments.length === 0 ? (
              <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800 space-y-3">
                <ClipboardList className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-semibold text-slate-300">No assessments recorded yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Complete your first multi-pillar assessment to view scores, risk tiers, and population clustering.
                </p>
                <button
                  onClick={() => setActiveTab('wizard')}
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-xs mt-2"
                >
                  Start Assessment
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {assessments.map((a) => (
                  <div
                    key={a.id}
                    className="glass-panel rounded-xl p-4 sm:p-5 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-cyan-400 text-base">#{a.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          a.risk_tier === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          a.risk_tier === 'Fair' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                          a.risk_tier === 'Elevated Risk' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {a.risk_tier} ({a.composite_lwi} pts)
                        </span>
                        {a.is_anomaly && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                            Anomaly Flag
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        Archetype: <span className="text-slate-200 font-medium">{a.cluster_name}</span> •{' '}
                        {new Date(a.assessed_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-2 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 transition-colors"
                        title="Delete assessment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SYSTEM READINESS STATUS */}
        {activeTab === 'system' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <Server className="w-6 h-6 text-cyan-400" />
                <div>
                  <h2 className="text-base font-bold text-slate-100">FastAPI & SQLite Readiness</h2>
                  <p className="text-xs text-slate-400">Endpoint: http://localhost:8000/api/health</p>
                </div>
              </div>

              {backendLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 py-4">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  Connecting to backend...
                </div>
              ) : health ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 p-3 rounded-lg border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    System Healthy: {health.project} (v{health.version})
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(health.modules).map(([mod, state]) => (
                      <div key={mod} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex justify-between">
                        <span className="text-slate-400 capitalize">{mod.replace('_', ' ')}</span>
                        <span className="text-cyan-400 font-mono font-medium">{state}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-rose-400 p-3 rounded bg-rose-950/30 border border-rose-500/30">
                  Backend unreachable. Ensure uvicorn is running on port 8000.
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <p>LifeSync AI — Educational Lifestyle Risk Assessment Platform (Non-Clinical).</p>
      </footer>

    </div>
  );
}

export default App;
