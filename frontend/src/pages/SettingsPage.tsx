import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Bell,
  Lock,
  Download,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, setTheme } = useTheme();
  const { logout } = useAuth();

  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [anomalyAlerts, setAnomalyAlerts] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const handleExportData = () => {
    const backup = {
      exported_at: new Date().toISOString(),
      platform: 'LifeSync AI',
      version: '1.0.0',
      data_notice: 'Educational lifestyle data export.',
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifesync_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setNotification('Data export downloaded successfully.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleClearCache = () => {
    if (window.confirm('Clear local session cache? (Your database records remain safe)')) {
      sessionStorage.clear();
      setNotification('Local session cache cleared.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-2">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>System Preferences</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Application Settings & Controls
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure appearance themes, notification reminders, data security, and compliance settings.
        </p>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Theme Appearance Card */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Appearance & Color Theme</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Choose between signature Deep Navy Dark mode or clean Soft Light mode.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
              theme === 'dark'
                ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-[#070b16]'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-900 text-amber-400 border border-slate-800">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Deep Navy Dark</span>
              <span className="text-[11px] text-slate-400">Glassmorphism with violet & teal accents</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
              theme === 'light'
                ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-white'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
            }`}
          >
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <Sun className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Clean Soft Light</span>
              <span className="text-[11px] text-slate-500">Bright neutral surfaces & blue accents</span>
            </div>
          </button>
        </div>
      </div>

      {/* Habit Notification Controls */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-cyan-500" />
            <span>Habit & Assessment Reminders</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure periodic self-reflection notifications and milestone alerts.
          </p>
        </div>

        <div className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">Daily Habit Reminders</span>
              <span className="text-slate-400 text-[11px]">Receive subtle morning prompts for hydration and posture breaks</span>
            </div>
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(e) => setRemindersEnabled(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">Weekly Wellness Progress Digest</span>
              <span className="text-slate-400 text-[11px]">Synthesize 7-day longitudinal score trajectories</span>
            </div>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="py-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block">ML Anomaly Detection Alerts</span>
              <span className="text-slate-400 text-[11px]">Notify when lifestyle vectors diverge significantly from baseline</span>
            </div>
            <input
              type="checkbox"
              checked={anomalyAlerts}
              onChange={(e) => setAnomalyAlerts(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Privacy, Storage & Data Management */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-violet-500" />
            <span>Privacy & Local Storage</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your assessment records are securely stored on your local SQLite database with bcrypt hashing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-cyan-500" />
            <span>Export Data Backup (JSON)</span>
          </button>

          <button
            onClick={handleClearCache}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4 text-amber-500" />
            <span>Clear Session Cache</span>
          </button>
        </div>
      </div>

      {/* Non-Medical Regulatory Classification Notice */}
      <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold">
          <ShieldCheck className="w-4 h-4" />
          <span>Non-Medical Ethics & Regulatory Compliance Notice</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
          LifeSync AI is developed strictly for educational demonstration as an academic MCA Mini Project (IBST Track). LifeSync AI does NOT provide medical diagnostic evaluations, psychiatric risk determinations, or clinical advice. Wellness scores and statistical clusters represent unsupervised algorithmic patterns and should never replace consultation with certified healthcare professionals.
        </p>
      </div>
    </div>
  );
};
