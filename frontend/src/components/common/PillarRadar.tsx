import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface PillarRadarProps {
  pillars: {
    sleep: number;
    physical_activity: number;
    nutrition_hydration: number;
    mental_wellbeing: number;
    digital_hygiene: number;
    habits: number;
  };
  benchmarkPillars?: {
    sleep: number;
    physical_activity: number;
    nutrition_hydration: number;
    mental_wellbeing: number;
    digital_hygiene: number;
    habits: number;
  };
  height?: number;
}

export const PillarRadar: React.FC<PillarRadarProps> = ({
  pillars,
  benchmarkPillars,
  height = 320,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const data = [
    {
      pillar: 'Sleep',
      score: pillars.sleep,
      benchmark: benchmarkPillars?.sleep || 75,
      fullMark: 100,
    },
    {
      pillar: 'Physical Activity',
      score: pillars.physical_activity,
      benchmark: benchmarkPillars?.physical_activity || 70,
      fullMark: 100,
    },
    {
      pillar: 'Hydration',
      score: pillars.nutrition_hydration,
      benchmark: benchmarkPillars?.nutrition_hydration || 75,
      fullMark: 100,
    },
    {
      pillar: 'Nutrition',
      score: pillars.habits,
      benchmark: benchmarkPillars?.habits || 70,
      fullMark: 100,
    },
    {
      pillar: 'Mental Wellness',
      score: pillars.mental_wellbeing,
      benchmark: benchmarkPillars?.mental_wellbeing || 68,
      fullMark: 100,
    },
    {
      pillar: 'Digital Habits',
      score: pillars.digital_hygiene,
      benchmark: benchmarkPillars?.digital_hygiene || 72,
      fullMark: 100,
    },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke={isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.3)'} />
          <PolarAngleAxis
            dataKey="pillar"
            tick={{
              fill: isDark ? '#94a3b8' : '#475569',
              fontSize: 11,
              fontWeight: 500,
            }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10 }}
            stroke={isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#0c1222' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
              borderRadius: '12px',
              color: isDark ? '#f8fafc' : '#0f172a',
              boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              fontSize: '12px',
            }}
          />
          {benchmarkPillars && (
            <Radar
              name="Benchmark (Population)"
              dataKey="benchmark"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.15}
              strokeDasharray="3 3"
            />
          )}
          <Radar
            name="Your Wellness Score"
            dataKey="score"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={isDark ? 0.45 : 0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
