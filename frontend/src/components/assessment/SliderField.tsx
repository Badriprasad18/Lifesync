import React from 'react';

interface SliderFieldProps {
  label: string;
  sublabel?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (val: number) => void;
  helperText?: string;
  badge?: string;
}

export const SliderField: React.FC<SliderFieldProps> = ({
  label,
  sublabel,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  helperText,
  badge,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200">{label}</span>
            {badge && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                {badge}
              </span>
            )}
          </div>
          {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
        </div>
        <div className="text-right">
          <span className="text-lg font-bold font-mono text-cyan-400">
            {value} <span className="text-xs font-normal text-slate-400">{unit}</span>
          </span>
        </div>
      </div>

      <div className="relative flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          style={{
            background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${percentage}%, #1e293b ${percentage}%, #1e293b 100%)`,
          }}
        />
      </div>

      <div className="flex justify-between text-[11px] font-mono text-slate-500">
        <span>{min} {unit}</span>
        {helperText && <span className="text-slate-400 italic font-sans">{helperText}</span>}
        <span>{max} {unit}</span>
      </div>
    </div>
  );
};
