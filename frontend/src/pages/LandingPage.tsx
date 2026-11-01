import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Sparkles,
  Zap,
  BarChart3,
  Moon,
  Sun,
  Lock,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleLaunchDemo = async () => {
    await loginDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#070b16] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c1222]/80 backdrop-blur-xl sticky top-0 z-40 px-6 lg:px-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-500 via-teal-400 to-violet-500 bg-clip-text text-transparent">
              LifeSync AI
            </span>
            <span className="block text-[10px] uppercase tracking-widest font-semibold text-slate-400 dark:text-slate-500">
              Wellness & Habit Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
          <NavLink
            to="/login"
            className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Sign In
          </NavLink>
          <button
            onClick={handleLaunchDemo}
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white shadow-md shadow-cyan-500/20 transition-all transform active:scale-95"
          >
            Launch Demo App
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-16 pt-16 pb-20 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI-Driven Behavioral Analytics Platform</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Empowering Healthy Living Through <br className="hidden lg:block" />
            <span className="bg-gradient-to-r from-cyan-500 via-teal-400 to-violet-500 bg-clip-text text-transparent">
              Explainable Machine Learning
            </span>
          </h1>
          <p className="mt-6 text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            Quantify sleep, physical movement, hydration, nutrition, mental stress, and digital habits. Receive genuine Scikit-Learn KMeans clustering archetypes and personalized micro-habit recommendations.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <NavLink
              to="/register"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </NavLink>
            <button
              onClick={handleLaunchDemo}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition-all"
            >
              <span>Explore Interactive Demo</span>
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-500" />
              Educational & Non-Medical
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-cyan-500" />
              Private Local SQLite
            </span>
            <span className="flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-violet-500" />
              Real Scikit-Learn ML
            </span>
          </div>
        </div>

        {/* Visual Showcase Card */}
        <div className="flex-1 w-full max-w-md lg:max-w-none">
          <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-cyan-500 font-bold">
                  92%
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">LifeSync Wellness Index</h4>
                  <p className="text-[11px] text-slate-500">Optimal Wellness Equilibrium</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Optimal
              </span>
            </div>

            {/* Pillar Snapshot */}
            <div className="mt-5 grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium block">Sleep</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">8.0 hrs</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium block">Activity</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">45 min</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 font-medium block">Hydration</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">2.8 L</span>
              </div>
            </div>

            {/* AI Cluster Archetype Pill */}
            <div className="mt-5 p-3.5 rounded-2xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border border-violet-500/20 flex items-center gap-3">
              <BrainCircuit className="w-6 h-6 text-violet-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-violet-600 dark:text-violet-400">
                  Cluster Archetype: Balanced High-Achiever
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Harmonious balance across physical activity, consistent sleep, and low stress.
                </p>
              </div>
            </div>

            {/* Sample Recommendation */}
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <p className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                Suggested Habit Action
              </p>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                Maintain 20-20-20 visual rest intervals to prevent digital eye strain during study blocks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Six Pillars Overview Grid */}
      <section className="px-6 lg:px-16 py-16 bg-slate-100/50 dark:bg-[#0c1222]/50 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white">
              The Six Fundamental Lifestyle Pillars
            </h2>
            <p className="mt-2 text-xs lg:text-sm text-slate-500 dark:text-slate-400">
              A comprehensive and holistic self-reflection framework based on empirical wellness benchmarks.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Sleep Health',
                desc: 'Duration, circadian schedule regularity, and self-reported sleep quality.',
                icon: Moon,
                color: 'text-indigo-500 bg-indigo-500/10',
              },
              {
                title: 'Physical Activity',
                desc: 'Daily exercise duration, weekly frequency, and continuous sedentary sitting hours.',
                icon: Activity,
                color: 'text-teal-500 bg-teal-500/10',
              },
              {
                title: 'Hydration',
                desc: 'Pure water volume intake and caffeine balance throughout the day.',
                icon: Zap,
                color: 'text-cyan-500 bg-cyan-500/10',
              },
              {
                title: 'Nutrition',
                desc: 'Meal timing predictability, fresh produce servings, and diet diversity.',
                icon: HeartHandshake,
                color: 'text-emerald-500 bg-emerald-500/10',
              },
              {
                title: 'Mental Wellness',
                desc: 'Perceived academic/work stress, active relaxation windows, and balance.',
                icon: BrainCircuit,
                color: 'text-violet-500 bg-violet-500/10',
              },
              {
                title: 'Digital Habits',
                desc: 'Recreational screen time, visual breaks frequency, and pre-bed digital curfews.',
                icon: Layers,
                color: 'text-rose-500 bg-rose-500/10',
              },
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/30 transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pillar.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4">{pillar.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 lg:px-16 py-8 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 LifeSync AI — Academic IBST Project. Strictly educational and non-medical.</p>
        <div className="flex items-center gap-6">
          <NavLink to="/login" className="hover:text-cyan-500">Sign In</NavLink>
          <NavLink to="/register" className="hover:text-cyan-500">Register</NavLink>
          <button onClick={handleLaunchDemo} className="hover:text-cyan-500 font-medium">Demo Mode</button>
        </div>
      </footer>
    </div>
  );
};
