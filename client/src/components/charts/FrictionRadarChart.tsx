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
import { FrictionProfile } from '../../types';

export const FrictionRadarChart: React.FC<{
  profile: FrictionProfile;
  height?: number;
}> = ({ profile, height = 320 }) => {
  if (!profile) return null;

  const p = profile as any;
  const data = [
    { subject: 'Travel Dist.', score: (p.travel?.score ?? 0), fullMark: 100 },
    { subject: 'Transport', score: (p.transport?.score ?? 0), fullMark: 100 },
    { subject: 'Digital Access', score: (p.digitalAccess?.score ?? p.digitalaccess?.score ?? 0), fullMark: 100 },
    { subject: 'Language', score: (p.language?.score ?? 0), fullMark: 100 },
    { subject: 'Family Supp.', score: (p.familySupport?.score ?? p.familysupport?.score ?? 0), fullMark: 100 },
    { subject: 'Document.', score: (p.documentation?.score ?? 0), fullMark: 100 },
    { subject: 'Cost Burden', score: (p.cost?.score ?? 0), fullMark: 100 },
    { subject: 'OPD Timing', score: (p.appointmentTiming?.score ?? p.appointmenttiming?.score ?? 0), fullMark: 100 },
  ];

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/80 p-4 shadow-card">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900">8-Factor Friction Spider Radar</h4>
          <p className="text-[11px] text-slate-500">
            Higher values (outward) represent greater practical barriers
          </p>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          Scale: 0–100
        </span>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
            <Radar
              name="Friction Score"
              dataKey="score"
              stroke="#0d9488"
              fill="#14b8a6"
              fillOpacity={0.45}
            />
            <Tooltip
              formatter={(value: any) => [`${value} / 100`, 'Friction Level']}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
                border: 'none',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
