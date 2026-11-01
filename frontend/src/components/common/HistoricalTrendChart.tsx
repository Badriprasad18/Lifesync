import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface HistoricalTrendChartProps {
  data: Array<{
    assessed_at: string;
    score: number;
    sleep?: number;
    activity?: number;
    hydration?: number;
  }>;
  height?: number;
}

export const HistoricalTrendChart: React.FC<HistoricalTrendChartProps> = ({
  data,
  height = 260,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={isDark ? 0.4 : 0.25} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'}
            vertical={false}
          />
          <XAxis
            dataKey="assessed_at"
            tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
            axisLine={{ stroke: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.3)' }}
            tickLine={false}
          />
          <YAxis
            domain={[40, 100]}
            tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
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
            formatter={(value: any) => [`${Number(value).toFixed(1)} / 100`, 'Wellness Index']}
          />
          <Area
            type="monotone"
            dataKey="score"
            name="LifeSync Wellness Index"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#scoreGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
