import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Eye, EyeOff, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, loginDemo, isAuthenticated, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setFormError(err.message || 'Login failed. Please check credentials.');
    }
  };

  const handleDemoLogin = async (targetEmail = 'badriprasaddash849@gmail.com') => {
    setFormError(null);
    try {
      await loginDemo(targetEmail);
      navigate('/dashboard');
    } catch (err: any) {
      setFormError(err.message || 'Demo initialization failed.');
    }
  };

  const handleAutofill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setFormError(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b16] text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <NavLink to="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-cyan-500 via-teal-400 to-violet-500 bg-clip-text text-transparent">
            LifeSync AI
          </span>
        </NavLink>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Or{' '}
          <NavLink to="/register" className="font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
            create a new account
          </NavLink>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-xl">
          {/* Instant 1-Click Access Banner */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-violet-500/10 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Instant 1-Click Sign In
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Pre-configured Badriprasad Dash profile & records
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDemoLogin('badriprasaddash849@gmail.com')}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-sm transition-all transform active:scale-95"
              >
                Log In Now
              </button>
            </div>

            <div className="pt-2 border-t border-cyan-500/15 flex items-center gap-2 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Or autofill credentials:</span>
              <button
                type="button"
                onClick={() => handleAutofill('badriprasaddash849@gmail.com', 'Badri123!')}
                className="inline-flex items-center gap-1 font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                <UserCheck className="w-3 h-3" />
                Badriprasad Dash
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                type="button"
                onClick={() => handleAutofill('student_mca@college.edu', 'StudentPassword123!')}
                className="font-semibold text-slate-500 dark:text-slate-400 hover:underline"
              >
                MCA Demo
              </button>
            </div>
          </div>

          {(formError || error) && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex flex-col gap-1.5">
              <span>{formError || error}</span>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('badriprasaddash849@gmail.com')}
                  className="font-bold underline text-cyan-600 dark:text-cyan-400"
                >
                  Click here for 1-Click Sign In
                </button>
                <span>or</span>
                <NavLink to="/register" className="font-bold underline">
                  Create Account
                </NavLink>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email address
                </label>
                <button
                  type="button"
                  onClick={() => setEmail('badriprasaddash849@gmail.com')}
                  className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                >
                  Use my email
                </button>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="badriprasaddash849@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-slate-800/60 text-center">
            <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
              Secured with bcrypt password hashing & JWT tokens
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
