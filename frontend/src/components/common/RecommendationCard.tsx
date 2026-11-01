import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Recommendation } from '../../types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onToggle?: (id: number) => Promise<void> | void;
}

const priorityStyles = {
  high: {
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
    dot: 'bg-rose-500',
    label: 'High Priority',
  },
  medium: {
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
    dot: 'bg-amber-500',
    label: 'Medium Priority',
  },
  low: {
    badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
    dot: 'bg-cyan-500',
    label: 'Maintenance',
  },
  positive: {
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-500',
    label: 'Strength Acknowledged',
  },
};

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onToggle,
}) => {
  const [completed, setCompleted] = useState<boolean>(recommendation.is_completed);
  const [isToggling, setIsToggling] = useState<boolean>(false);

  const style = priorityStyles[recommendation.priority] || priorityStyles.low;
  const isPositive = recommendation.priority === 'positive';

  const handleToggle = async () => {
    setIsToggling(true);
    const newStatus = !completed;
    setCompleted(newStatus);
    if (onToggle) {
      try {
        await onToggle(recommendation.id);
      } catch (err) {
        // Revert on error
        setCompleted(!newStatus);
      }
    }
    setIsToggling(false);
  };

  return (
    <div
      className={`glass-card rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden ${
        completed
          ? 'border-emerald-500/30 bg-emerald-950/10 dark:bg-emerald-950/20'
          : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {recommendation.category}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${style.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {style.label}
          </span>
          {isPositive && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Progress
            </span>
          )}
        </div>

        {!isPositive && (
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
              completed
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title={completed ? 'Mark as pending' : 'Mark as completed'}
          >
            {completed ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Done</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" />
                <span>Mark Done</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Observation */}
      <h4 className={`text-base font-semibold mt-3 ${completed ? 'line-through text-slate-500 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
        {recommendation.observation || recommendation.title}
      </h4>

      {/* Suggested Action Item */}
      <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80">
        <div className="flex items-start gap-2">
          <ArrowRight className="w-4 h-4 mt-0.5 text-teal-500 shrink-0" />
          <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
            <strong className="font-semibold text-teal-600 dark:text-teal-400">Action: </strong>
            {recommendation.suggested_action || recommendation.action_item}
          </p>
        </div>
      </div>

      {/* Physiological Reason */}
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        <strong className="font-medium text-slate-600 dark:text-slate-300">Why this matters: </strong>
        {recommendation.reason || recommendation.description}
      </p>
    </div>
  );
};
