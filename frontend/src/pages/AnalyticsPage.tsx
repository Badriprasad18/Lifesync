import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  BarChart2,
  Calendar,
  Layers,
  Activity,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { HistoricalTrendChart } from '../components/common/HistoricalTrendChart';
import { PillarRadar } from '../components/common/PillarRadar';
import { apiClient } from '../services/api';
import { DEMO_HISTORICAL_TRENDS, DEMO_DASHBOARD_SUMMARY } from '../services/demoData';

export const AnalyticsPage: React.FC = () => {
  const [trendData, setTrendData] = useState(DEMO_HISTORICAL_TRENDS);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const res = await apiClient.get('/dashboard/trends?limit=10');
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((item: any, i: number) => ({
            assessed_at: `Log #${item.assessment_id || i + 1}`,
            score: item.composite_lwi,
            sleep: item.pillars?.sleep,
            activity: item.pillars?.physical_activity,
            hydration: item.pillars?.nutrition_hydration,
          }));
          setTrendData(mapped);
        }
      } catch {
        setTrendData(DEMO_HISTORICAL_TRENDS);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  const scores = trendData.map((d) => d.score);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const delta = scores[scores.length - 1] - scores[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Longitudinal Behavioral Analytics</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Analytics & Longitudinal Trends
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tracking your habit development and score progression across chronological assessment checkpoints.
          </p>
        </div>
      </div>

      {/* Analytics Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Index</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white block mt-2">
            {avgScore.toFixed(1)} <span className="text-sm font-normal text-slate-400">/ 100</span>
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Mean across all recorded sessions</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Peak Recorded Score</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block mt-2">
            {maxScore.toFixed(1)}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Highest optimal wellness milestone</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Net Delta</span>
          <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 block mt-2 flex items-center gap-1">
            {delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)}
            <ArrowUpRight className="w-5 h-5 text-cyan-500" />
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Net progress from earliest assessment</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Historical Checkpoints</span>
          <span className="text-2xl font-bold text-violet-600 dark:text-violet-400 block mt-2">
            {trendData.length}
          </span>
          <p className="text-[11px] text-slate-500 mt-1">Completed evaluation checkpoints</p>
        </div>
      </div>

      {/* Main Longitudinal Trend Area Chart */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              LifeSync Wellness Index Score Trajectory
            </h3>
            <p className="text-[11px] text-slate-500">
              Chronological progression showing stability and positive habit reinforcement.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            Rolling Trajectory
          </span>
        </div>

        <div className="py-4">
          <HistoricalTrendChart data={trendData} height={300} />
        </div>
      </div>

      {/* Comparative Pillar Balance */}
      <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
          Current Pillar Distribution vs. Population Baseline
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Comparing your latest habit evaluation against the calibrated N=1,500 population dataset.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <PillarRadar
            pillars={DEMO_DASHBOARD_SUMMARY.latest_score!.pillars}
            benchmarkPillars={{
              sleep: 72,
              physical_activity: 65,
              nutrition_hydration: 70,
              mental_wellbeing: 62,
              digital_hygiene: 65,
              habits: 68,
            }}
            height={300}
          />

          <div className="space-y-3">
            {[
              { name: 'Sleep Restoration', user: 80, benchmark: 72, diff: '+8 pts' },
              { name: 'Physical Conditioning', user: 72.5, benchmark: 65, diff: '+7.5 pts' },
              { name: 'Hydration Pacing', user: 82, benchmark: 70, diff: '+12 pts' },
              { name: 'Dietary Variety', user: 78, benchmark: 68, diff: '+10 pts' },
              { name: 'Mental Equilibrium', user: 68, benchmark: 62, diff: '+6 pts' },
              { name: 'Digital Hygiene', user: 74, benchmark: 65, diff: '+9 pts' },
            ].map((row, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">{row.name}</span>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">{row.user}</span>
                  <span className="text-slate-400">vs {row.benchmark}</span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {row.diff}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
