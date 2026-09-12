import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/common/Button';
import { TTSButton } from '../../components/common/TTSButton';
import {
  ShieldCheck,
  Activity,
  Cpu,
  MapPin,
  Bus,
  Layers,
  TrendingUp,
  Coins,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Laptop,
  Users2,
  Stethoscope,
  Fingerprint,
} from 'lucide-react';

export const SystemArchitecture: React.FC = () => {
  const { t } = useTranslation();

  const corePillars = [
    {
      number: '1',
      title: 'Patient Friction Fingerprint',
      concept: '8-Dimensional Operational Barrier Profile',
      description: 'Quantifies non-clinical friction across Travel, Transport, Digital, Language, Family, Documentation, Cost, and Timing on a 0-100 scale.',
      link: '/patient/friction',
      buttonText: 'Open Live Radar',
      icon: Fingerprint,
    },
    {
      number: '2',
      title: 'Friction Interaction Engine',
      concept: 'Compound Non-Linear Amplification',
      description: 'Detects when multiple barriers co-occur (e.g. No Transport + Digital Illiteracy) to amplify drop-out risk via sublinear interaction multipliers.',
      link: '/patient/risk',
      buttonText: 'View Interaction Multiplier',
      icon: Layers,
    },
    {
      number: '3',
      title: 'Care Failure Risk Engine',
      concept: 'Operational Drop-Out Forecasting',
      description: 'Calculates the probability that a patient cannot complete their care continuum, providing deterministic explainability without predicting disease.',
      link: '/patient/risk',
      buttonText: 'Inspect Risk Analysis',
      icon: AlertTriangle,
    },
    {
      number: '4',
      title: 'Friction Digital Twin',
      concept: 'Virtual Patient Healthcare Journey Model',
      description: 'Simulates a digital patient navigating 7 healthcare milestones in real-time, visualizing where drop-outs occur and how interventions save them.',
      link: '/patient/digital-twin',
      buttonText: 'Launch Digital Twin',
      icon: Activity,
    },
    {
      number: '5',
      title: 'What-If Intervention Simulator',
      concept: 'Counterfactual Scenario Modeling',
      description: 'Enables healthcare administrators to toggle community transport, PoC labs, or ASHA escorts and observe simulated care completion gains under configurable assumptions.',
      link: '/admin/simulator',
      buttonText: 'Run Live Simulator',
      icon: Cpu,
    },
    {
      number: '6',
      title: 'Intervention Optimization Engine',
      concept: 'Algorithmic Budget Maximization',
      description: 'Knapsack optimizer calculating optimal portfolio allocations for ₹5 Lakh vs ₹10 Lakh budgets to maximize patients helped per rupee spent.',
      link: '/admin/interventions',
      buttonText: 'Optimize Budget',
      icon: Coins,
    },
    {
      number: '7',
      title: 'Population Friction Map',
      concept: 'Geospatial Barrier Density Mapping',
      description: 'District and village-level choropleth map highlighting specific friction categories (Transport vs Diagnostic vs Specialist Access) across clusters.',
      link: '/admin/friction-map',
      buttonText: 'Explore District Map',
      icon: MapPin,
    },
    {
      number: '8',
      title: 'Care Leakage Funnel',
      concept: '6-Stage Patient Drop-off Pipeline',
      description: 'Tracks leakage from Referred (1000) → Consulted (820) → Diagnosed (650) → Started Treatment (470) → Completed (290) → Follow-up (180).',
      link: '/admin/care-leakage',
      buttonText: 'View Drop-off Funnel',
      icon: TrendingUp,
    },
    {
      number: '9',
      title: '"Why Did Care Fail?" Engine',
      concept: 'Root Cause Attribution Analytics',
      description: 'Categorizes drop-outs into precise operational factors: Transport (36%), Timing (21%), Diagnostics (17%), Cost (8%), and Paperwork (4%).',
      link: '/admin/care-failure',
      buttonText: 'Analyze Failure Causes',
      icon: HelpCircle,
    },
    {
      number: '10',
      title: 'Live Tele-Triage & Dialect System',
      concept: 'Assisted Teleconsultation & 11 Indian Languages',
      description: 'Zero-travel real-time video triage consultation room supporting 11 native languages, regional dialects (Bhojpuri, Majhi), voice STT & TTS audio.',
      link: '/patient/teleconsult',
      buttonText: 'Join Teleconsultation',
      icon: Laptop,
    },
  ];

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-4">
      {/* Hero Banner */}
      <div className="bg-gradient-to-tr from-slate-900 via-navy-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-slate-800 space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-950 text-teal-300 text-xs font-bold border border-teal-800">
          <Layers className="w-4 h-4 text-teal-400" />
          <span>National Healthcare Accessibility System Architecture</span>
        </div>

        <div className="space-y-3 max-w-3xl">
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Patient Friction Index & Access Platform (PFIS)
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            Predicting and eliminating the non-clinical operational barriers (travel, transport, digital literacy, documentation, and daily wages) that prevent patients from successfully completing treatment.
          </p>
        </div>

        {/* Core Value Proposition Box */}
        <div className="p-5 bg-slate-800/80 rounded-2xl border border-teal-500/30 text-xs sm:text-sm space-y-2">
          <div className="text-teal-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            🎯 Platform Mission & Mandate:
          </div>
          <p className="text-white italic font-medium leading-relaxed">
            "We do not diagnose diseases. We analyze whether a patient can successfully navigate the physical, geographic, and socio-economic healthcare journey, and model the most cost-effective community interventions to prevent care failure."
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link to="/patient/digital-twin">
            <Button variant="primary" size="lg" icon={<Activity className="w-4 h-4" />}>
              Test Friction Digital Twin
            </Button>
          </Link>
          <Link to="/admin/simulator">
            <Button variant="outline" size="lg" className="text-slate-900 bg-white hover:bg-slate-100" icon={<Cpu className="w-4 h-4" />}>
              Open What-If Simulator
            </Button>
          </Link>
          <TTSButton
            text="Patient Friction Index System. Predicting and eliminating non-clinical barriers that cause care failure."
            label="Listen Audio Overview"
          />
        </div>
      </div>

      {/* Comparison Matrix: Traditional Healthcare vs PFIS Thinking */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-6">
        <div className="text-center space-y-1 max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Why PFIS is Fundamentally Novel
          </h2>
          <p className="text-xs text-slate-500">
            Shifting from traditional clinical assumptions to non-clinical operational intelligence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Paradigm */}
          <div className="p-6 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-rose-200 dark:bg-rose-900 flex items-center justify-center text-xs">✕</span>
              <span>Traditional Clinical View (Assumes Universal Access):</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <div className="font-mono bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900">
                Patient → Disease → Doctor Available ✅ → Treatment Assumed Complete
              </div>
              <p>
                <strong>The Blind Spot:</strong> If a doctor and hospital exist, traditional software concludes healthcare is accessible. It ignores that the patient lives 65 km away with no direct bus, cannot use a smartphone, and risks losing daily food wages.
              </p>
            </div>
          </div>

          {/* PFIS Paradigm */}
          <div className="p-6 rounded-2xl bg-teal-50/70 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 space-y-3">
            <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-teal-200 dark:bg-teal-900 flex items-center justify-center text-xs text-teal-900">✓</span>
              <span>PFIS Operational Intelligence (Models Reality):</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <div className="font-mono bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-teal-100 dark:border-teal-800">
                Patient → Need → (+Travel +Transport +Digital +Cost +Language +Escort) → Can Patient Finish?
              </div>
              <p>
                <strong>The Solution:</strong> PFIS maps all 8 non-clinical friction dimensions, models compound barrier interactions, and simulates cost-effective interventions (e.g. Community Shuttle + PoC Labs) to mitigate drop-out risk and support treatment completion.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* All 10 Core Architectural Pillars Showcase */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              The 10 Core Architectural Pillars
            </h2>
            <p className="text-xs text-slate-500">Each architectural pillar operates on transparent deterministic rules, explainable heuristics, and simulated demonstration models</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {corePillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.number}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card hover:shadow-card-hover hover:border-teal-300 dark:hover:border-teal-600 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-sm">
                        {pillar.number}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">{pillar.title}</h3>
                        <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400">{pillar.concept}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link to={pillar.link}>
                    <Button variant="primary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                      {pillar.buttonText}
                    </Button>
                  </Link>
                  <TTSButton text={`${pillar.title}: ${pillar.description}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Non-Clinical Operational Governance Callout */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400">
            <ShieldCheck className="w-4 h-4" /> Non-Clinical Operational Governance Protocol
          </div>
          <h3 className="text-xl font-bold">Strict Operational Boundaries</h3>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            PFIS is strictly an operational logistics layer. It never provides medical diagnoses, never replaces doctors, and operates transparently on explainable deterministic algorithms and counterfactual simulations.
          </p>
        </div>

        <Link to="/about" className="flex-shrink-0">
          <Button variant="outline" size="sm" className="bg-white text-slate-900 hover:bg-slate-100">
            Read Governance Mandate
          </Button>
        </Link>
      </div>
    </div>
  );
};
