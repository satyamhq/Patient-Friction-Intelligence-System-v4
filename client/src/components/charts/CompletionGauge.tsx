import React from 'react';

export interface CompletionGaugeProps {
  score: number; // 0 to 100
  size?: number;
  label?: string;
  sublabel?: string;
}

export const CompletionGauge: React.FC<CompletionGaugeProps> = ({
  score,
  size = 180,
  label = 'Completion Prob.',
  sublabel = 'Operational forecast',
}) => {
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // We want a 270-degree gauge (3/4 circle)
  const strokeDashoffset = circumference - (score / 100) * (circumference * 0.75);

  const getColor = (s: number) => {
    if (s >= 75) return '#10b981'; // High completion / Low risk
    if (s >= 55) return '#f59e0b'; // Moderate
    if (s >= 35) return '#f97316'; // Low completion / High risk
    return '#ef4444'; // Critical
  };

  const getStatusText = (s: number) => {
    if (s >= 75) return 'HIGH LIKELIHOOD';
    if (s >= 55) return 'MODERATE ACCESS';
    if (s >= 35) return 'HIGH FRICTION';
    return 'CRITICAL BOTTLENECK';
  };

  const color = getColor(score);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200/80 shadow-card">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-135">
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference * 0.75} ${circumference}`}
            strokeLinecap="round"
          />
          {/* Animated Value Stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Label Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            {score}%
          </span>
          <span className="text-[10px] font-bold tracking-wider uppercase mt-0.5" style={{ color }}>
            {getStatusText(score)}
          </span>
        </div>
      </div>

      <div className="text-center mt-1">
        <h5 className="text-xs font-bold text-slate-800">{label}</h5>
        <p className="text-[10px] text-slate-400">{sublabel}</p>
      </div>
    </div>
  );
};
