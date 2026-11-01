import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  History,
  Calendar,
  Activity,
  BrainCircuit,
  Trash2,
  Eye,
  PlusCircle,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { listAssessments, deleteAssessment, getAssessment, downloadAssessmentPdf } from '../services/api';
import { AssessmentSummary } from '../types';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [downloadingPdfId, setDownloadingPdfId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await listAssessments();
      setAssessments(data);
    } catch {
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleView = async (id: number) => {
    try {
      const detail = await getAssessment(id);
      sessionStorage.setItem('lifesync_latest_assessment', JSON.stringify(detail));
      navigate('/assessment/results');
    } catch (err) {
      console.error('Failed to load assessment detail:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete Assessment #${id}?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteAssessment(id);
      setAssessments((prev) => prev.filter((a) => a.id !== id));
      setNotification(`Assessment #${id} was successfully deleted.`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadPdf = async (id: number) => {
    setDownloadingPdfId(id);
    try {
      await downloadAssessmentPdf(id);
      setNotification(`PDF report for Assessment #${id} downloaded.`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Failed to download PDF report:', err);
    } finally {
      setDownloadingPdfId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail & Records</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Assessment Session History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse, review, inspect, and manage your past self-reflection assessment evaluations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadHistory}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <NavLink
            to="/assessment"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Assessment</span>
          </NavLink>
        </div>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* History Records Table / Cards */}
      {assessments.length > 0 ? (
        <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200/60 dark:border-slate-800/60 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-6">Session ID</th>
                  <th className="py-3.5 px-6">Date & Time</th>
                  <th className="py-3.5 px-6">Wellness Index</th>
                  <th className="py-3.5 px-6">Risk Tier</th>
                  <th className="py-3.5 px-6">AI Archetype</th>
                  <th className="py-3.5 px-6">Anomaly Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                {assessments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-800 dark:text-slate-200">
                      #{a.id}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {new Date(a.assessed_at).toLocaleDateString()} {new Date(a.assessed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-extrabold text-sm text-cyan-600 dark:text-cyan-400">
                        {a.composite_lwi?.toFixed(1)} / 100
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        {a.risk_tier}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium">
                      {a.cluster_name}
                    </td>
                    <td className="py-4 px-6">
                      {a.is_anomaly ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          Anomaly
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownloadPdf(a.id)}
                          disabled={downloadingPdfId === a.id}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors"
                          title="Download Official PDF Report"
                        >
                          <Download className={`w-4 h-4 ${downloadingPdfId === a.id ? 'animate-spin text-cyan-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleView(a.id)}
                          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors"
                          title="View Assessment Breakdown"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          disabled={deletingId === a.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete Session"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800/80">
          <History className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Assessment History Records Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6">
            Take your first 6-pillar lifestyle assessment to unlock your wellness score, cluster archetype, and personalized habit guidance.
          </p>
          <NavLink
            to="/assessment"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-md shadow-cyan-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start Your First Assessment</span>
          </NavLink>
        </div>
      )}
    </div>
  );
};
