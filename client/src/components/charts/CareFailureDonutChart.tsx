import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface BarrierData {
  category: string;
  percentage: number;
  caseCount: number;
}

const COLORS = [
  '#0d9488', // Teal (Transport 36%)
  '#f59e0b', // Amber (Timing 21%)
  '#3b82f6', // Blue (Diagnostics 17%)
  '#8b5cf6', // Violet (Medicine 12%)
  '#ef4444', // Rose (Financial 8%)
  '#10b981', // Emerald (Documentation 4%)
  '#64748b', // Slate (Digital 2%)
];

export const CareFailureDonutChart: React.FC<{
  data: BarrierData[];
  height?: number;
}> = ({ data, height = 300 }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/80 p-4 shadow-card">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Why Did Care Fail? Attribution</h4>
          <p className="text-[11px] text-slate-500">Root-cause non-clinical dropout distribution</p>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="percentage"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="80%"
              paddingAngle={3}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => [`${value}% of Dropouts`, name]}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
                border: 'none',
              }}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
