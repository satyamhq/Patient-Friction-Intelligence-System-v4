import React from 'react';
import { ShieldCheck, Activity, Target, Layers, HeartHandshake, CheckCircle2 } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
          <Activity className="w-4 h-4" />
          <span>Patient Friction Index & Access Platform (PFIS)</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          About the PFIS Platform
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Non-clinical healthcare accessibility analysis and operational routing for vulnerable
          and rural populations across India.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-card space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Target className="w-5 h-5 text-brand-500" /> The Core Philosophy
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Traditional digital health initiatives focus exclusively on clinical diagnosis, ignoring the
          staggering practical barriers that cause patients to drop out before they ever reach a physician.
          PFIS bridges this critical gap by quantifying physical transit deserts, language discordance,
          daily wage loss constraints, and documentation hurdles.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-xs space-y-1 text-teal-950">
            <strong className="block font-bold">1. Deterministic Multi-Vector Engine</strong>
            <p className="text-teal-800">
              Evaluates 8 access dimensions using explainable mathematical formulas and real-world geo-spatial distance.
            </p>
          </div>

          <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-xs space-y-1 text-teal-950">
            <strong className="block font-bold">2. Knapsack Budget Optimization</strong>
            <p className="text-teal-800">
              Evaluates combinations of interventions to model estimated completion gains within a specified budget.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl border border-slate-800 space-y-4 text-xs leading-relaxed">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <h4 className="text-base font-bold text-white">Strict Non-Clinical Operational Governance Mandate</h4>
        </div>
        <p className="text-slate-300">
          PFIS does NOT diagnose diseases, predict physiological pathology, or offer clinical treatment
          recommendations. All metrics (including "Estimated Healthcare Journey Accessibility Risk" and
          "Estimated Care Completion Probability") are operational indicators designed exclusively for logistical
          triage, patient transportation assistance, and health policy planning.
        </p>
      </div>
    </div>
  );
};
