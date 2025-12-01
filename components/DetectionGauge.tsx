import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DetectionGaugeProps {
  percentage: number;
}

const DetectionGauge: React.FC<DetectionGaugeProps> = ({ percentage }) => {
  const data = [
    { name: 'AI', value: percentage },
    { name: 'Human', value: 100 - percentage },
  ];

  // Determine color based on score
  const getColor = (p: number) => {
    if (p < 30) return '#22c55e'; // Green (Human)
    if (p < 70) return '#eab308'; // Yellow (Mixed)
    return '#ef4444'; // Red (AI)
  };

  const color = getColor(percentage);

  return (
    <div className="relative h-64 w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell key="cell-ai" fill={color} />
            <Cell key="cell-human" fill="#334155" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Text */}
      <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <span className="block text-4xl font-bold" style={{ color }}>
          {percentage}%
        </span>
        <span className="text-sm text-slate-400">AI Probability</span>
      </div>
    </div>
  );
};

export default DetectionGauge;