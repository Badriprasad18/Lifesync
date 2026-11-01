import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface PCAScatterPlotProps {
  userCoords?: { x: number; y: number };
  clusters?: Array<{
    id: number;
    name: string;
    x: number;
    y: number;
    color: string;
    desc: string;
  }>;
  height?: number;
}

const defaultClusters = [
  { id: 0, name: 'Balanced High-Achiever', x: 3.795, y: 0.667, color: '#10b981', desc: 'Optimal sleep, regular movement, low stress' },
  { id: 1, name: 'Sedentary Digital Workaholic', x: -1.51, y: 0.226, color: '#f59e0b', desc: 'Prolonged sitting & high screen exposure' },
  { id: 2, name: 'Stressed Academic / Crammer', x: -4.766, y: 0.807, color: '#ef4444', desc: 'Sleep restriction & elevated exam tension' },
  { id: 3, name: 'Low-Activity Casual', x: 0.539, y: -1.314, color: '#8b5cf6', desc: 'Moderate rest but minimal active exercise' },
];

export const PCAScatterPlot: React.FC<PCAScatterPlotProps> = ({
  userCoords = { x: 2.85, y: 0.42 },
  clusters = defaultClusters,
  height = 280,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Format cluster points
  const clusterData = clusters.map((c) => ({
    x: c.x,
    y: c.y,
    name: c.name,
    desc: c.desc,
    isUser: false,
    color: c.color,
  }));

  // User point
  const userData = [
    {
      x: userCoords.x,
      y: userCoords.y,
      name: 'Your Current Lifestyle Position',
      desc: `2D Coordinates: (${userCoords.x.toFixed(2)}, ${userCoords.y.toFixed(2)})`,
      isUser: true,
      color: '#06b6d4',
    },
  ];

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)'}
          />
          <XAxis
            type="number"
            dataKey="x"
            name="PCA Component 1 (Physical-Sedentary)"
            domain={[-6, 6]}
            tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
            label={{
              value: 'Component 1 (Physical / Sedentary Balance)',
              position: 'insideBottom',
              offset: -12,
              fill: isDark ? '#64748b' : '#94a3b8',
              fontSize: 10,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="PCA Component 2 (Rest-Stress)"
            domain={[-3, 3]}
            tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10 }}
            label={{
              value: 'Component 2 (Sleep / Stress Variance)',
              angle: -90,
              position: 'insideLeft',
              fill: isDark ? '#64748b' : '#94a3b8',
              fontSize: 10,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#0c1222' : '#ffffff',
              borderColor: isDark ? '#1e293b' : '#e2e8f0',
              borderRadius: '12px',
              color: isDark ? '#f8fafc' : '#0f172a',
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              fontSize: '12px',
            }}
            formatter={(val: any, name: any, item: any) => {
              const p = item.payload;
              return [`${p.desc}`, `${p.name}`];
            }}
          />
          {/* Population Archetypes */}
          <Scatter name="Population Archetypes" data={clusterData} shape="circle">
            {clusterData.map((entry, index) => (
              <Cell key={`cluster-${index}`} fill={entry.color} r={10} />
            ))}
          </Scatter>
          {/* User Marker */}
          <Scatter name="You" data={userData} shape="diamond">
            <Cell fill="#06b6d4" r={12} stroke="#ffffff" strokeWidth={2} />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
