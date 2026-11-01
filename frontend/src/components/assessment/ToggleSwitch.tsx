import React from 'react';

interface ToggleSwitchProps {
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  sublabel,
  checked,
  onChange,
}) => {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
        checked
          ? 'bg-cyan-950/40 border-cyan-500/60'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="pr-4">
        <h4 className="text-sm font-semibold text-slate-200">{label}</h4>
        {sublabel && <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>}
      </div>

      <div
        className={`w-12 h-6 rounded-full transition-colors relative flex items-center p-1 shrink-0 ${
          checked ? 'bg-cyan-500' : 'bg-slate-700'
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </div>
    </div>
  );
};
