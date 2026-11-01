import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Filter,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { RecommendationCard } from '../components/common/RecommendationCard';
import { fetchRecommendations, toggleRecommendation } from '../services/api';
import { Recommendation } from '../types';
import { DEMO_RECOMMENDATIONS } from '../services/demoData';

const categories = [
  'All',
  'Sleep',
  'Physical Activity',
  'Hydration',
  'Nutrition',
  'Mental Wellness',
  'Digital Habits',
];

const priorities = ['All', 'high', 'medium', 'low', 'positive'];

export const RecommendationsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>(DEMO_RECOMMENDATIONS);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activePriority, setActivePriority] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(true);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await fetchRecommendations({ latest_only: true });
      if (data && data.length > 0) {
        setRecommendations(data);
      } else {
        setRecommendations(DEMO_RECOMMENDATIONS);
      }
    } catch {
      setRecommendations(DEMO_RECOMMENDATIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleToggle = async (id: number) => {
    try {
      await toggleRecommendation(id);
      setRecommendations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_completed: !r.is_completed } : r))
      );
    } catch (err) {
      console.error('Failed to toggle recommendation:', err);
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    const matchCat =
      activeCategory === 'All' || r.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchPri = activePriority === 'All' || r.priority === activePriority.toLowerCase();
    return matchCat && matchPri;
  });

  const completedCount = recommendations.filter((r) => r.is_completed).length;
  const totalActionable = recommendations.filter((r) => r.priority !== 'positive').length;
  const progressPercent = totalActionable > 0 ? Math.round((completedCount / totalActionable) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Habit Action Center</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Personalized Wellness Recommendations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supportive, scientifically calibrated micro-habits designed for sustainable lifestyle optimization.
          </p>
        </div>

        <button
          onClick={loadRecommendations}
          disabled={loading}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Habit Completion Progress Bar */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Habit Implementation Progress
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {completedCount} of {totalActionable} recommended action items checked off this cycle.
          </p>
        </div>

        <div className="flex items-center gap-4 sm:w-64">
          <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-10 text-right">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="space-y-3">
        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Pillars:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-400 mr-1">Priority:</span>
          {priorities.map((pri) => (
            <button
              key={pri}
              onClick={() => setActivePriority(pri)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                activePriority === pri
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {pri === 'positive' ? 'Strengths' : pri}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecs.map((rec) => (
          <RecommendationCard key={rec.id} recommendation={rec} onToggle={handleToggle} />
        ))}
      </div>

      {filteredRecs.length === 0 && (
        <div className="p-12 text-center rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No recommendations match this filter
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try resetting your pillar or priority filter to view all active recommendations.
          </p>
        </div>
      )}
    </div>
  );
};
