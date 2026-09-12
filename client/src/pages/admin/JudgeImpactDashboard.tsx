import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  TrendingUp,
  Activity,
  CheckCircle2,
  Users,
  Building2,
  Stethoscope,
  HeartHandshake,
  Landmark,
  Shield,
  ArrowRight,
  Clock,
  GitFork,
  BarChart3,
  Sliders,
  Cpu,
} from 'lucide-react';

export const JudgeImpactDashboard: React.FC = () => {
  const [activeStage, setActiveStage] = useState<'problem' | 'data' | 'friction' | 'intelligence' | 'intervention' | 'impact'>('impact');

  const STAGES = [
    { id: 'problem', step: '01', title: 'Healthcare Problem', subtitle: 'Long queues, referral failure, & non-clinical barriers' },
    { id: 'data', step: '02', title: 'Data Ingestion', subtitle: 'ABHA EHR, transit metrics, e-Aushadhi stock' },
    { id: 'friction', step: '03', title: 'Friction Index', subtitle: 'Explainable scoring engine: waiting, travel, costs' },
    { id: 'intelligence', step: '04', title: 'Intelligence & Alerts', subtitle: 'Risk detection, early warning & smart matching' },
    { id: 'intervention', step: '05', title: 'Targeted Interventions', subtitle: 'OPD digital queues, What-If simulator, triage' },
    { id: 'impact', step: '06', title: 'Measurable Impact', subtitle: 'Quantified platform impact outcomes' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Trophy Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-purple-500/30">
        <div className="absolute right-0 top-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Healthcare Operational Benchmarks • System Impact Hub</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              PFIS End-to-End System Impact Dashboard
            </h1>
            <p className="text-sm text-purple-200/90 max-w-2xl">
              Demonstrating how the Patient Friction Index System shifts public healthcare from reactive emergency management to proactive, data-driven friction mitigation.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-900/60 border border-purple-400/30 text-[11px] text-purple-200">
              <span>Demonstration Projection • Modeled from pre-seeded district cohort data</span>
            </div>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center shrink-0">
            <span className="text-[11px] uppercase tracking-wider text-purple-200 font-bold block">Overall Friction Reduction</span>
            <p className="text-3xl font-black text-emerald-400 mt-0.5">-41.6%</p>
            <span className="text-[10px] text-purple-200 block mt-0.5">Simulated Demonstration Projection (12 Facilities)</span>
          </div>
        </div>
      </div>

      {/* 6-Stage Core Flow Selector */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {STAGES.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStage(s.id as any)}
            className={`p-3 rounded-2xl border text-left transition-all ${
              activeStage === s.id
                ? 'bg-purple-50 border-purple-500 shadow-md dark:bg-purple-950/50 dark:border-purple-600'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            <span className={`text-[10px] font-black block ${activeStage === s.id ? 'text-purple-700 dark:text-purple-300' : 'text-slate-400'}`}>
              STAGE {s.step}
            </span>
            <strong className={`text-xs block mt-0.5 ${activeStage === s.id ? 'text-purple-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
              {s.title}
            </strong>
          </button>
        ))}
      </div>

      {/* Impact Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>OPD Wait Time</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">58m <span className="text-xs text-emerald-600 font-bold">(-38%)</span></p>
          <span className="text-[11px] text-slate-500 block">Reduced from 94 min average baseline</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Referral Completion</span>
            <GitFork className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">88.4% <span className="text-xs text-blue-600 font-bold">(+42%)</span></p>
          <span className="text-[11px] text-slate-500 block">Lost-in-referral dropped from 52% to 11.6%</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Hospital Bed Balancing</span>
            <Building2 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">81.2% <span className="text-xs text-purple-600 font-bold">(+31%)</span></p>
          <span className="text-[11px] text-slate-500 block">Secondary CHCs utilized, offloading Tertiary Medical College</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Rural Coverage</span>
            <HeartHandshake className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">142,500+ <span className="text-xs text-amber-600 font-bold">(+55%)</span></p>
          <span className="text-[11px] text-slate-500 block">Villagers tracked via ASHA frontline modules</span>
        </div>
      </div>

      {/* 6-Persona Experience Quick Links for Judges */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-500" />
              Explore the 6 Functional Healthcare Personas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any role to test live end-to-end workflows in real time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <Link
            to="/patient/dashboard"
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-teal-500 hover:shadow-md transition-all group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <strong className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors block">
                1. Patient & Citizen Portal
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">Smart hospital recommendation, live digital queue token, friction reports.</p>
            </div>
          </Link>

          <Link
            to="/doctor/dashboard"
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-md transition-all group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <strong className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors block">
                2. Doctor Consultation Desk
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">OPD queue caller, clinical alerts, digital prescription workspace.</p>
            </div>
          </Link>

          <Link
            to="/hospital/dashboard"
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:shadow-md transition-all group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <strong className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors block">
                3. Hospital & Clinical Facility
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">Bed/ICU capacity counters, patient flow stage friction funnel.</p>
            </div>
          </Link>

          <Link
            to="/asha/dashboard"
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-green-500 hover:shadow-md transition-all group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-950/60 text-green-600 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <strong className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-green-600 transition-colors block">
                4. ASHA Frontline Seva
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">Village household registry, maternal health, high-risk case flags.</p>
            </div>
          </Link>

          <Link
            to="/government/dashboard"
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 hover:shadow-md transition-all group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 group-hover:scale-105 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <strong className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors block">
                5. Government & District Authority
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">District health command center, hospital accreditation certified.</p>
            </div>
          </Link>

          <Link
            to="/admin/dashboard"
            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-rose-500 hover:shadow-md transition-all group flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <strong className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-rose-600 transition-colors block">
                6. Health Ministry Command
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">State comparisons, What-If policy simulator, user directory.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
