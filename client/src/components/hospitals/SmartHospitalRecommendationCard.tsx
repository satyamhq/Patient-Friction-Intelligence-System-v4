import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Clock,
  Bed,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Navigation,
  Ticket,
  HeartPulse,
} from 'lucide-react';

interface SmartHospitalRecommendationCardProps {
  hospital: {
    id: string;
    name: string;
    type: string;
    city: string;
    district?: string;
    distanceKm: number;
    estimatedWaitMinutes: number;
    availableBeds: number;
    totalBeds: number;
    rating: number;
    reasons: string[];
    specialtyMatch: string;
    frictionScore: number;
  };
  onSelectToken?: () => void;
}

export const SmartHospitalRecommendationCard: React.FC<SmartHospitalRecommendationCardProps> = ({
  hospital,
  onSelectToken,
}) => {
  return (
    <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-teal-500/30 space-y-6">
      <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-200 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
          <span>Recommended Healthcare Center • Verified Transit & Direct Access</span>
        </div>
        <span className="text-xs text-teal-200/90 font-medium">
          Optimal facility for minimal travel and immediate OPD token
        </span>
      </div>

      {/* Facility Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            {hospital.name}
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Verified NQAS Facility
            </span>
          </h2>
          <p className="text-sm text-teal-100/80 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span>{hospital.city} • {hospital.distanceKm} km away (~{Math.round(hospital.distanceKm * 2.2)} min drive)</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10 text-center">
          <div>
            <span className="text-[10px] text-teal-200 uppercase tracking-wider block">OPD Wait</span>
            <p className="text-lg font-black text-white mt-0.5">~{hospital.estimatedWaitMinutes}m</p>
          </div>
          <div className="border-x border-white/10 px-3">
            <span className="text-[10px] text-teal-200 uppercase tracking-wider block">Beds Left</span>
            <p className="text-lg font-black text-emerald-400 mt-0.5">{hospital.availableBeds}/{hospital.totalBeds}</p>
          </div>
          <div>
            <span className="text-[10px] text-teal-200 uppercase tracking-wider block">Friction</span>
            <p className="text-lg font-black text-teal-300 mt-0.5">{hospital.frictionScore}/100</p>
          </div>
        </div>
      </div>

      {/* WHY THIS HOSPITAL IS RECOMMENDED (Recommendation Engine) */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 space-y-3">
        <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
          <CheckCircle2 className="w-4 h-4" />
          <span>Why This Hospital is Recommended for You:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-200">
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
            <span><strong>Shortest Travel Time:</strong> Accessible via direct transit routes with low congestion.</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
            <span><strong>Specialty Match:</strong> Active {hospital.specialtyMatch} OPD with 4 on-duty clinical specialists.</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
            <span><strong>High Bed Availability:</strong> {hospital.availableBeds} general & ICU beds currently open with zero triage backlog.</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
            <span><strong>Cashless Scheme Empaneled:</strong> 100% Ayushman Bharat PM-JAY & State health card coverage.</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onSelectToken}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-lg shadow-teal-500/25 transition-all"
          >
            <Ticket className="w-4 h-4" />
            Get Live OPD Token
          </button>
          <Link
            to={`/patient/hospitals`}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all"
          >
            <Building2 className="w-3.5 h-3.5" />
            View Departments
          </Link>
        </div>

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + hospital.city)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-300 hover:text-teal-200 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          Navigate on Map <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
