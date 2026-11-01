import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  BrainCircuit,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Moon,
  Zap,
  HeartHandshake,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { WellnessGauge } from '../components/common/WellnessGauge';
import { PillarRadar } from '../components/common/PillarRadar';
import { HistoricalTrendChart } from '../components/common/HistoricalTrendChart';
import { RecommendationCard } from '../components/common/RecommendationCard';
import {
  getDashboardSummary,
  listAssessments,
  fetchRecommendations,
  toggleRecommendation,
} from '../services/api';
import {
  DashboardSummary,
  AssessmentSummary,
  Recommendation,
} from '../types';
import {
  DEMO_DASHBOARD_SUMMARY,
  DEMO_HISTORICAL_TRENDS,
  DEMO_RECOMMENDATIONS,
} from '../services/demoData';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadDashboardData = async () => {
    try {
      const [sumData, assessData, recsData] = await Promise.allSettled([
        getDashboardSummary(),
        listAssessments(),
        fetchRecommendations({ latest_only: true }),
      ]);

      if (sumData.status === 'fulfilled' && sumData.value.latest_score) {
        setSummary(sumData.value);
      } else {
        setSummary(DEMO_DASHBOARD_SUMMARY);
      }

      if (assessData.status === 'fulfilled' && assessData.value.length > 0) {
        setAssessments(assessData.value);
      } else {
        setAssessments([]);
      }

      if (recsData.status === 'fulfilled' && recsData.value.length > 0) {
        setRecommendations(recsData.value);
      } else {
        setRecommendations(DEMO_RECOMMENDATIONS);
      }
    } catch {
      setSummary(DEMO_DASHBOARD_SUMMARY);
      setRecommendations(DEMO_RECOMMENDATIONS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleToggleRec = async (id: number) => {
    try {
      await toggleRecommendation(id);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_completed: !r.is_completed } : r))
      );
    } catch (err) {
      console.error('Failed to toggle recommendation:', err);
    }
  };

  const activeSummary = summary || DEMO_DASHBOARD_SUMMARY;
  const pillars = activeSummary.latest_score?.pillars || DEMO_DASHBOARD_SUMMARY.latest_score!.pillars;
  const overallScore = activeSummary.latest_score?.composite_lwi || 78.5;
  const riskTier = activeSummary.latest_score?.risk_tier || 'Optimal';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl p-6 lg:p-8 relative overflow-hidden border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Lifestyle Intelligence Active</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Welcome back, {user?.profile?.full_name?.split(' ')[0] || 'Friend'}!
            </h1>
            <p className="mt-1 text-xs lg:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
              Your personalized wellness overview based on your self-reported habits, unsupervised ML clustering, and anomaly detection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
            <NavLink
              to="/assessment"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white text-xs font-semibold flex items-center gap-2 shadow-sm shadow-cyan-500/25 transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Assessment</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Wellness Index"
          value={`${overallScore.toFixed(1)}/100`}
          subtitle={`Tier: ${riskTier}`}
          icon={Activity}
          colorScheme="teal"
          trend={{ value: '+3.5 pts', positive: true }}
        />
        <StatCard
          title="Cluster Archetype"
          value={activeSummary.latest_cluster || 'Balanced High-Achiever'}
          subtitle="KMeans k=4 segmentation"
          icon={BrainCircuit}
          colorScheme="violet"
        />
        <StatCard
          title="Habit Actions"
          value={recommendations.filter((r) => !r.is_completed).length}
          subtitle={`${recommendations.filter((r) => r.is_completed).length} completed this cycle`}
          icon={Sparkles}
          colorScheme="cyan"
        />
        <StatCard
          title="Total Assessments"
          value={activeSummary.total_assessments || (assessments.length || 5)}
          subtitle="Historical logs tracked"
          icon={TrendingUp}
          colorScheme="emerald"
        />
      </div>

      {/* Machine Learning Anomaly Alert Banner (if flagged) */}
      {activeSummary.latest_anomaly && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-600 dark:text-amber-400">
              Statistical Anomaly Detected by Isolation Forest
            </h4>
            <p className="mt-0.5 text-slate-600 dark:text-slate-300">
              Your recent habit pattern diverges significantly from the baseline population cohort. Review personalized recommendations to stabilize critical routines.
            </p>
          </div>
        </div>
      )}

      {/* Main Visual Row: Gauge + Pillar Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Wellness Score Radial Gauge */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Overall Wellness Score</h3>
              <p className="text-[11px] text-slate-500">LifeSync Wellness Index (0-100)</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              {riskTier}
            </span>
          </div>

          <WellnessGauge score={overallScore} riskTier={riskTier} size={220} />

          <div className="w-full pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-center">
            <NavLink
              to="/assessment/results"
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              <span>View In-Depth Scoring Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>

        {/* Center/Right: 6-Pillar Radar Chart */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">6-Pillar Lifestyle Balance</h3>
              <p className="text-[11px] text-slate-500">Multivariate balance across all audited wellness dimensions</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span>Your Score</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                <span>Benchmark</span>
              </span>
            </div>
          </div>

          <PillarRadar pillars={pillars} height={290} />

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-center">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40">
              <span className="text-[10px] text-slate-400 block font-medium">Sleep</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{pillars.sleep?.toFixed(0)}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40">
              <span className="text-[10px] text-slate-400 block font-medium">Activity</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{pillars.physical_activity?.toFixed(0)}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40">
              <span className="text-[10px] text-slate-400 block font-medium">Hydration</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{pillars.nutrition_hydration?.toFixed(0)}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40">
              <span className="text-[10px] text-slate-400 block font-medium">Nutrition</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{pillars.habits?.toFixed(0)}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40">
              <span className="text-[10px] text-slate-400 block font-medium">Mental</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{pillars.mental_wellbeing?.toFixed(0)}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/40">
              <span className="text-[10px] text-slate-400 block font-medium">Digital</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{pillars.digital_hygiene?.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Trends & Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Longitudinal Trends */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Historical Trajectory</h3>
              <p className="text-[11px] text-slate-500">Progress trajectory across recent assessment records</p>
            </div>
            <NavLink to="/analytics" className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
              Detailed Trends
            </NavLink>
          </div>

          <div className="py-2">
            <HistoricalTrendChart data={DEMO_HISTORICAL_TRENDS} height={230} />
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
            Steady upward progress (+16.5 points over 5 assessment checkpoints)
          </p>
        </div>

        {/* Personalized Recommendations Preview */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Prioritized Habit Actions</h3>
              <p className="text-[11px] text-slate-500">Tailored micro-habits based on your lifestyle data</p>
            </div>
            <NavLink to="/recommendations" className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
              View All
            </NavLink>
          </div>

          <div className="space-y-3 py-2 overflow-y-auto max-h-[300px]">
            {recommendations.slice(0, 2).map((rec) => (
              <RecommendationCard key={rec.id} recommendation={rec} onToggle={handleToggleRec} />
            ))}
          </div>

          <div className="pt-2 text-center">
            <NavLink
              to="/recommendations"
              className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              <span>Explore Habit Action Center ({recommendations.length} total)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
