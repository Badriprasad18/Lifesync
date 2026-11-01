import React from 'react';

interface RatingOption {
  value: number;
  label: string;
  description?: string;
  icon?: string;
}

interface RatingSelectProps {
  label: string;
  sublabel?: string;
  value: number;
  options: RatingOption[];
  onChange: (val: number) => void;
}

export const RatingSelect: React.FC<RatingSelectProps> = ({
  label,
  sublabel,
  value,
  options,
  onChange,
}) => {
  return (
    <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
      <div>
        <h4 className="text-sm font-semibold text-slate-200">{label}</h4>
        {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`p-3 rounded-lg text-center transition-all border ${
                isSelected
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              {opt.icon && <div className="text-xl mb-1">{opt.icon}</div>}
              <div className="text-xs font-semibold">{opt.label}</div>
              {opt.description && (
                <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{opt.description}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
