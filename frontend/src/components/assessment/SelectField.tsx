import React from 'react';

interface Option {
  value: string | number;
  label: string;
  sublabel?: string;
}

interface SelectFieldProps {
  label: string;
  sublabel?: string;
  value: string | number;
  options: Option[];
  onChange: (val: any) => void;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  sublabel,
  value,
  options,
  onChange,
}) => {
  return (
    <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
      <div>
        <label className="block text-sm font-semibold text-slate-200">{label}</label>
        {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
      </div>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors cursor-pointer"
        >
          {options.map((opt) => (
            <option key={String(opt.value)} value={opt.value} className="bg-slate-900 text-slate-100 py-1">
              {opt.label} {opt.sublabel ? `(${opt.sublabel})` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
