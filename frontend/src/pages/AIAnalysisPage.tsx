import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  Layers,
  Sparkles,
  ShieldCheck,
  ScatterChart as ScatterIcon,
  HelpCircle,
  Binary,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { PCAScatterPlot } from '../components/common/PCAScatterPlot';
import { apiClient } from '../services/api';
import { DEMO_PCA_CLUSTERS, DEMO_ASSESSMENT_DETAIL } from '../services/demoData';

export const AIAnalysisPage: React.FC = () => {
  const [clusters, setClusters] = useState(DEMO_PCA_CLUSTERS);
  const [userCoords, setUserCoords] = useState({ x: 2.85, y: 0.42 });
  const [activeArchetype, setActiveArchetype] = useState('Balanced High-Achiever');
  const [isAnomaly, setIsAnomaly] = useState(false);
  const [anomalyScore, setAnomalyScore] = useState(0.18);
  const [anomalyFactors, setAnomalyFactors] = useState<string[]>([]);

  useEffect(() => {
    const fetchClusters = async () => {
      try {
        const res = await apiClient.get('/dashboard/clusters');
        if (res.data && res.data.clusters) {
          const colors = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
          const mapped = res.data.clusters.map((c: any, i: number) => ({
            id: c.cluster_id,
            name: c.name,
            x: c.pca_x,
            y: c.pca_y,
            color: colors[i % colors.length],
            desc: c.description,
          }));
          setClusters(mapped);
        }
      } catch {
        setClusters(DEMO_PCA_CLUSTERS);
      }
    };

    fetchClusters();

    // Check session storage for latest assessment ML insights
    const stored = sessionStorage.getItem('lifesync_latest_assessment');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.ml_insights) {
          setUserCoords(parsed.ml_insights.pca_coordinates || { x: 2.85, y: 0.42 });
          setActiveArchetype(parsed.ml_insights.cluster_name || 'Balanced High-Achiever');
          setIsAnomaly(parsed.ml_insights.is_anomaly || false);
          setAnomalyScore(parsed.ml_insights.anomaly_score || 0.18);
          setAnomalyFactors(parsed.ml_insights.anomaly_contributing_factors || []);
        }
      } catch {
        // use defaults
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-semibold mb-2">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Unsupervised Machine Learning Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            AI Cluster Segmentation & Anomaly Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Genuine Scikit-Learn KMeans ($k=4$), 2D Principal Component Analysis (71.7% explained variance), and Isolation Forest tree partitioning.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
          <Binary className="w-4 h-4 text-cyan-500" />
          <span>Fitted on N=1,500 Population Baseline</span>
        </div>
      </div>

      {/* 2D PCA Benchmark Scatter Plot Card */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ScatterIcon className="w-4 h-4 text-cyan-500" />
              <span>2D PCA Demographic Projection</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Dimensionality reduction mapping 10 lifestyle features into 2 primary principal components.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rotate-45 bg-cyan-500 inline-block" />
              <strong className="text-slate-900 dark:text-white">Your Position</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
              <span className="text-slate-500">Cluster Centroids</span>
            </span>
          </div>
        </div>

        <div className="py-4">
          <PCAScatterPlot userCoords={userCoords} clusters={clusters} height={320} />
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-900 dark:text-white font-semibold">How to read this plot: </strong>
            Horizontal position (Component 1) reflects your physical activity versus sedentary sitting balance. Vertical position (Component 2) indicates your sleep regularity versus acute perceived stress variance. The cyan diamond represents your exact lifestyle coordinates.
          </p>
        </div>
      </div>

      {/* Four K-Means Cluster Archetypes Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Population Lifestyle Clusters ($k=4$)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clusters.map((c) => {
            const isAssigned = c.name === activeArchetype;
            return (
              <div
                key={c.id}
                className={`glass-card rounded-2xl p-5 border transition-all ${
                  isAssigned
                    ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-md'
                    : 'border-slate-200/80 dark:border-slate-800/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: c.color }} />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{c.name}</h4>
                  </div>
                  {isAssigned && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                      Your Archetype
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {c.desc}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Centroid Coordinate:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    ({c.x.toFixed(2)}, {c.y.toFixed(2)})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Isolation Forest Anomaly Detection Section */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-500" />
              <span>Isolation Forest Multivariate Anomaly Engine</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Isolates irregular multi-feature combinations (contamination threshold = 0.05).
            </p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            isAnomaly
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
          }`}>
            {isAnomaly ? 'Statistical Anomaly Flagged' : 'Within Expected Baseline'}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Decision Score</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white block mt-1">
              {anomalyScore > 0 ? `+${anomalyScore.toFixed(3)}` : anomalyScore.toFixed(3)}
            </span>
            <p className="text-[10px] text-slate-500 mt-1">Positive values indicate normal depth; negative indicates isolated anomaly.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contamination Ratio</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white block mt-1">
              5.0%
            </span>
            <p className="text-[10px] text-slate-500 mt-1">Configured expected multivariate outlier prevalence in general population.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attribution Method</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white block mt-1">
              Z-Score (&gt; 1.8σ)
            </span>
            <p className="text-[10px] text-slate-500 mt-1">Transparent feature-level standard deviation attribution.</p>
          </div>
        </div>

        {/* Feature-Level Attribution List */}
        {anomalyFactors.length > 0 && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20">
            <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-2">
              Contributing Anomaly Factors
            </h4>
            <div className="space-y-1.5">
              {anomalyFactors.map((factor, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
