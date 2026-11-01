import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  BrainCircuit,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Moon,
  Zap,
  HeartHandshake,
  Download,
  Share2,
} from 'lucide-react';
import { WellnessGauge } from '../components/common/WellnessGauge';
import { PillarRadar } from '../components/common/PillarRadar';
import { RecommendationCard } from '../components/common/RecommendationCard';
import { AssessmentDetail } from '../types';
import { DEMO_ASSESSMENT_DETAIL } from '../services/demoData';

export const AssessmentResultsPage: React.FC = () => {
  const [assessment, setAssessment] = useState<AssessmentDetail>(DEMO_ASSESSMENT_DETAIL);

  useEffect(() => {
    // Check if session storage has the fresh assessment result
    const stored = sessionStorage.getItem('lifesync_latest_assessment');
    if (stored) {
      try {
        setAssessment(JSON.parse(stored));
      } catch {
        setAssessment(DEMO_ASSESSMENT_DETAIL);
      }
    }
  }, []);

  const score = assessment.scores?.composite_lwi || 78.5;
  const riskTier = assessment.scores?.risk_tier || 'Optimal';
  const pillars = assessment.scores?.pillars || DEMO_ASSESSMENT_DETAIL.scores.pillars;
  const deductions = assessment.scores?.deductions || [];
  const ml = assessment.ml_insights || DEMO_ASSESSMENT_DETAIL.ml_insights;
  const recs = assessment.recommendations || DEMO_ASSESSMENT_DETAIL.recommendations;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Analysis Generated</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Assessment Results & Scientific Breakdown
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit evaluation completed on {new Date(assessment.assessed_at).toLocaleDateString()} at{' '}
            {new Date(assessment.assessed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/ai-analysis"
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2"
          >
            <BrainCircuit className="w-4 h-4 text-violet-500" />
            <span>AI Cluster Analysis</span>
          </NavLink>
          <NavLink
            to="/recommendations"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Habit Plan</span>
          </NavLink>
        </div>
      </div>

      {/* Main Score & Radar Hero Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Overall Score Gauge */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Composite LifeSync Wellness Index
          </span>
          <WellnessGauge score={score} riskTier={riskTier} size={230} />
          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            Evaluated using weighted multidimensional pillar scoring formulas.
          </div>
        </div>

        {/* Center: 6-Pillar Radar Chart */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pillar Balance Radar</h3>
            <span className="text-[11px] text-slate-500">6 Continuous Dimensions</span>
          </div>
          <PillarRadar pillars={pillars} height={250} />
          <p className="text-[11px] text-slate-400 text-center">
            Higher coverage indicates harmonious wellness equilibrium across life areas.
          </p>
        </div>

        {/* Right: AI Clustering & Anomaly Status */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Machine Learning Pattern</h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400">
              Scikit-Learn
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
            <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wider block">
              Assigned Demographic Archetype
            </span>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
              {ml.cluster_name}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {ml.cluster_description}
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-violet-500/15 pt-2">
              <span>Distance to Centroid:</span>
              <strong className="text-slate-800 dark:text-slate-200 font-mono">{ml.distance_to_center?.toFixed(2)}</strong>
            </div>
          </div>

          {/* Anomaly Callout */}
          <div className={`p-3.5 rounded-2xl border text-xs ${
            ml.is_anomaly
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {ml.is_anomaly ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{ml.is_anomaly ? 'Statistical Anomaly Detected' : 'Normal Behavioral Variance'}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
              {ml.is_anomaly
                ? 'Your lifestyle combination exhibits high statistical divergence (>1.8σ) from population baseline.'
                : 'Habit vectors fall within expected population variance intervals.'}
            </p>
          </div>
        </div>
      </div>

      {/* Six Pillars Detailed Breakdown Cards */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Individual Pillar Audits & Deductions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Sleep Health', score: pillars.sleep, icon: Moon, desc: `${assessment.inputs.sleep_hours} hrs/night, quality ${assessment.inputs.sleep_quality}/5` },
            { name: 'Physical Activity', score: pillars.physical_activity, icon: Activity, desc: `${assessment.inputs.exercise_minutes} min/day, sitting ${assessment.inputs.sitting_hours} hrs` },
            { name: 'Hydration', score: pillars.nutrition_hydration, icon: Zap, desc: `${assessment.inputs.water_intake_liters} L/day fluid intake` },
            { name: 'Nutrition', score: pillars.habits, icon: HeartHandshake, desc: `${assessment.inputs.fruit_veg_servings} servings produce, meals regularity ${assessment.inputs.meals_regularity}/3` },
            { name: 'Mental Wellness', score: pillars.mental_wellbeing, icon: BrainCircuit, desc: `Stress level ${assessment.inputs.stress_level}/10, balance ${assessment.inputs.work_life_balance}/5` },
            { name: 'Digital Habits', score: pillars.digital_hygiene, icon: Layers, desc: `${assessment.inputs.recreational_screen_hours} hrs recreational screen time` },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-cyan-500">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {item.score?.toFixed(0)} / 100
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
                  />
                </div>
                <p className="mt-2.5 text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Deductions Audit List */}
      {deductions.length > 0 && (
        <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Algorithmic Audit Deductions
          </h4>
          <div className="space-y-2">
            {deductions.map((ded, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{ded}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Recommendations Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Formulated Recommendations ({recs.length})
          </h3>
          <NavLink to="/recommendations" className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline">
            Manage Action Items
          </NavLink>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recs.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </div>
    </div>
  );
};
