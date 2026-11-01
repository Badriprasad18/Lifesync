import React from 'react';

interface WellnessGaugeProps {
  score: number;
  riskTier?: string;
  size?: number;
  strokeWidth?: number;
  subtitle?: string;
}

export const WellnessGauge: React.FC<WellnessGaugeProps> = ({
  score,
  riskTier = 'Optimal',
  size = 200,
  strokeWidth = 14,
  subtitle = 'LifeSync Wellness Index',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use a 270 degree arc (leaving bottom 90 degrees open)
  const arcLength = circumference * 0.75;
  const normalizedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = arcLength - (arcLength * normalizedScore) / 100;

  // Tier color styling
  let color = '#10b981'; // emerald
  let glowColor = 'rgba(16, 185, 129, 0.25)';
  if (normalizedScore < 50) {
    color = '#f43f5e'; // rose
    glowColor = 'rgba(244, 63, 94, 0.25)';
  } else if (normalizedScore < 65) {
    color = '#f59e0b'; // amber
    glowColor = 'rgba(245, 158, 11, 0.25)';
  } else if (normalizedScore < 80) {
    color = '#06b6d4'; // cyan
    glowColor = 'rgba(6, 182, 212, 0.25)';
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size * 0.85 }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-[225deg]"
          style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            className="text-slate-200 dark:text-slate-800"
            strokeLinecap="round"
          />
          {/* Progress track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {normalizedScore.toFixed(1)}
          </span>
          <span className="text-xs uppercase tracking-widest font-semibold mt-1 px-2.5 py-0.5 rounded-full" style={{ backgroundColor: glowColor, color }}>
            {riskTier}
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400 text-center">
        {subtitle}
      </p>
    </div>
  );
};
