import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Bus,
  FileCheck2,
  Users2,
  Coins,
  Clock,
  Laptop,
  Languages,
  Building2,
  AlertCircle,
  Shield,
  Sliders,
  BarChart3,
  Layers,
  CheckCircle2,
  Compass,
  Ticket,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { TTSButton } from '../components/common/TTSButton';
import { AiAppointmentAssistanceCard } from '../components/common/AiAppointmentAssistanceCard';
import { EmergencySOSModal } from '../components/common/EmergencySOSModal';
import { initiateHelplineCall } from '../services/helplineCallingService';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = React.useState(false);

  return (
    <div className="space-y-12 sm:space-y-16 md:space-y-20 lg:space-y-24 pb-16 overflow-hidden">
      {/* ================================================== */}
      {/* 1. HERO SECTION: INSTITUTIONAL HEALTHCARE ACCESS INTELLIGENCE */}
      {/* ================================================== */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24 bg-slate-50/50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Core Institutional Messaging & Actions */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
              {/* Category Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-semibold tracking-wider uppercase shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                <span>Patient Journey Friction Intelligence System</span>
              </div>

              {/* Primary Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-950 tracking-tight leading-[1.12]">
                Healthcare availability is not the same{' '}
                <span className="text-teal-900 block sm:inline font-extrabold">
                  as healthcare accessibility.
                </span>
              </h1>

              {/* Supporting Copy */}
              <div className="space-y-3 max-w-2xl">
                <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
                  Hospitals, clinics, and medical staff may exist on paper, but non-clinical friction—transit deficits, administrative delays, documentation barriers, and daily wage loss—prevents patients from completing necessary care.
                </p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  PFIS pinpoints precisely where friction accumulates across the five stages of care, measures drop-out risks, and equips health authorities, hospital administrators, and clinicians with targeted, actionable interventions.
                </p>

                <div className="pt-1">
                  <TTSButton
                    text="Healthcare availability is not the same as healthcare accessibility. Hospitals and clinical capacity may exist, but non-clinical friction like transit deficits, administrative queues, documentation barriers, and wage loss prevent patients from completing necessary care. PFIS measures where friction occurs across the journey and helps health systems identify actionable interventions."
                    label={t('common.listen', 'Listen to summary')}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Link to="/assessment" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<Activity className="w-4 h-4 shrink-0" />}
                    className="w-full sm:w-auto min-h-[48px] px-6 text-sm font-semibold bg-teal-700 hover:bg-teal-800 text-white rounded-lg shadow-2xs transition cursor-pointer"
                  >
                    Assess Journey Friction
                  </Button>
                </Link>

                <Link to="/government/friction-intelligence" className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={<BarChart3 className="w-4 h-4 shrink-0 text-slate-700" />}
                    className="w-full sm:w-auto min-h-[48px] px-6 text-sm font-semibold border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 rounded-lg shadow-2xs transition cursor-pointer"
                  >
                    Health Authority Command
                  </Button>
                </Link>

                <Link to="/patient/hospitals" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    icon={<MapPin className="w-4 h-4 shrink-0 text-slate-600" />}
                    className="w-full sm:w-auto min-h-[48px] px-5 text-sm font-medium border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-100/70 rounded-lg transition cursor-pointer"
                  >
                    Find Hospitals
                  </Button>
                </Link>
              </div>

              {/* Institutional Role Portals */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-600">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Direct Portals:</span>
                <Link to="/login?role=patient" className="hover:text-teal-800 font-medium transition">
                  Patient Vault
                </Link>
                <span className="text-slate-300">•</span>
                <Link to="/login?role=doctor" className="hover:text-teal-800 font-medium transition">
                  Doctor OPD Desk
                </Link>
                <span className="text-slate-300">•</span>
                <Link to="/login?role=hospital" className="hover:text-teal-800 font-medium transition">
                  Hospital Intake
                </Link>
                <span className="text-slate-300">•</span>
                <Link to="/login?role=asha" className="hover:text-teal-800 font-medium transition">
                  Frontline ASHA
                </Link>
              </div>
            </div>

            {/* Right Column: Realistic, Institutional Healthcare Journey Telemetry */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
                {/* Telemetry Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live Journey Telemetry</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">District Care-Pathway Friction Analysis</div>
                  </div>
                  <div className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                    Friction: 64/100 · High
                  </div>
                </div>

                {/* 5 Journey Stages Real Data Metrics */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <div>
                        <div className="font-semibold text-slate-900">1. Transit & Geography</div>
                        <div className="text-[11px] text-slate-500">22 km commute · 2 bus transfers</div>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      High Friction
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <div>
                        <div className="font-semibold text-slate-900">2. Intake & Documentation</div>
                        <div className="text-[11px] text-slate-500">ABDM e-KYC pending · Counter queue: 45 min</div>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Moderate
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-rose-500" />
                      <div>
                        <div className="font-semibold text-slate-900">3. OPD Queue & Consultation</div>
                        <div className="text-[11px] text-slate-500">38 patients ahead · Est. wait: 110 min</div>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      High Wait
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <div>
                        <div className="font-semibold text-slate-900">4. Diagnostic Turnaround</div>
                        <div className="text-[11px] text-slate-500">Routine hematology: Same-day available</div>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Normal
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <div>
                        <div className="font-semibold text-slate-900">5. Pharmacy & Financial Settlement</div>
                        <div className="text-[11px] text-slate-500">Jan Aushadhi stock: 82% · Cashless approved</div>
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Low Gap
                    </span>
                  </div>
                </div>

                {/* Deterministic Outcome & Action Panel */}
                <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-teal-950">Care Failure Risk Estimate</span>
                    <span className="font-bold text-rose-700">42% (Probability of Drop-out)</span>
                  </div>
                  <p className="text-[11px] text-teal-900 leading-relaxed">
                    <strong>Recommended Intervention:</strong> Issue ASHA transit escort voucher and pre-book token for afternoon OPD session to eliminate morning wage sacrifice.
                  </p>
                </div>

                {/* Verification Specifications Footer */}
                <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-slate-400" />
                    <span>k-Anonymity (k ≥ 3) Preserved</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-slate-400" />
                    <span>Officer SHA-256 Verified</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* HEALTHCARE ACCESS & EMERGENCY NAVIGATION CARDS */}
      {/* ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
        <AiAppointmentAssistanceCard
          onOpen108Emergency={() => setIsEmergencyModalOpen(true)}
          onOpenAiAssistance={initiateHelplineCall}
        />
      </section>

      {/* ================================================== */}
      {/* 2. THE PROBLEM: NON-CLINICAL ACCESS BARRIERS */}
      {/* ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{t('landing.problemTag', 'Addressing Patient Dropouts')}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {t('landing.problemTitle', 'Why patient dropouts happen before the consultation room.')}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Standard healthcare systems often assume that building physical infrastructure solves healthcare delivery. In practice, vulnerable patients confront substantial non-clinical obstacles:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <Bus className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">{t('landing.transportDeficit', 'Transit Deficits')}</strong>
                  <span className="text-slate-500">
                    {t('landing.transportDeficitDesc', 'Infrequent rural buses or high out-of-pocket auto fares across 30+ km distances.')}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <Coins className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">{t('landing.wageLoss', 'Daily Wage Loss')}</strong>
                  <span className="text-slate-500">
                    {t('landing.wageLossDesc', 'Rigid morning hospital queues force informal workers to choose between medical care and daily income.')}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <Laptop className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">{t('landing.digitalExclusion', 'Digital & Literacy Hurdles')}</strong>
                  <span className="text-slate-500">
                    {t('landing.digitalExclusionDesc', 'Feature-phone households unable to complete app-based registrations or QR token scans.')}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <FileCheck2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">{t('landing.paperworkGaps', 'Documentation Bottlenecks')}</strong>
                  <span className="text-slate-500">
                    {t('landing.paperworkGapsDesc', 'Missing Aadhaar links or unverified referral slips delaying cashless scheme coverage.')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Solution Highlight Visual Card */}
          <div className="bg-white text-slate-900 rounded-3xl p-7 sm:p-9 shadow-sm border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-2xs">
                  PFIS
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-950">Access Friction Profiling</h4>
                  <p className="text-xs text-teal-700 font-medium">Transparent Multi-Vector Assessment</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 text-[11px] font-semibold border border-teal-200">
                Rule-Based Rationale
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              PFIS calculates practical friction across verified logistical indicators so healthcare teams understand the specific reasons preventing care completion:
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 font-medium">Travel Distance & Terrain Burden</span>
                  <span className="font-bold text-rose-700">82 / 100 (Severe)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-600 rounded-full w-[82%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 font-medium">Public Transit Availability</span>
                  <span className="font-bold text-amber-700">75 / 100 (High)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[75%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 font-medium">Family & Caregiver Accompaniment</span>
                  <span className="font-bold text-amber-700">65 / 100 (Moderate)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full w-[65%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 font-medium">Digital Access & Scheme Readiness</span>
                  <span className="font-bold text-emerald-700">30 / 100 (Low)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full w-[30%]" />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Estimated Care Completion:</span>
              <span className="text-base font-bold text-teal-400">38% (High Dropout Risk)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 3. UNDERSTANDING AVAILABILITY VS ACCESSIBILITY */}
      {/* Clean, Human-Designed Comparative Healthcare Card */}
      {/* ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-b from-slate-50 to-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200/70">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span>Bridging the Healthcare Delivery Gap</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              Understanding Availability vs Real Accessibility
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              A hospital facility existing on a map does not mean care is realistically reachable for a patient living 40 kilometers away with limited transport and daily wage responsibilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Left Card: Physical Infrastructure */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">Hospital Availability</h3>
                      <p className="text-[11px] text-slate-500">Physical Infrastructure & Facilities</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                    Physical Presence
                  </span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>Hospitals and primary centers are marked on official district registries.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>Medical equipment, beds, and physician schedules are formally allotted.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>Outpatient departments run on standard daytime consultation hours.</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs text-rose-800 leading-relaxed">
                <strong className="block text-rose-950 mb-0.5">The Limiting Factor:</strong>
                Physical availability alone does not resolve the logistical difficulties patients experience before reaching the front door.
              </div>
            </div>

            {/* Right Card: Patient Accessibility */}
            <div className="p-6 sm:p-7 rounded-2xl bg-teal-900 text-white shadow-md space-y-5 flex flex-col justify-between border border-teal-800">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-teal-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-800 text-teal-200 flex items-center justify-center shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-white">Patient Accessibility</h3>
                      <p className="text-[11px] text-teal-300">Everyday Patient Experience</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-teal-800 text-teal-200 text-[11px] font-medium border border-teal-700">
                    Real-World Access
                  </span>
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-teal-100">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                    <span>Can the family afford round-trip travel costs over 30+ kilometers?</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                    <span>Can daily wage workers stand in long queues without losing essential livelihood?</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
                    <span>Are Ayushman Bharat cards, identity documents, and referrals verified beforehand?</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 bg-teal-950/70 border border-teal-700/80 rounded-xl text-xs text-teal-200 leading-relaxed">
                <strong className="block text-teal-100 mb-0.5">The Solution:</strong>
                PFIS quantifies practical friction so health administrators can target solutions—like feeder transport and digital helpdesks—where they matter most.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. BARRIER CATEGORIES (THE 8 DIMENSIONS) */}
      {/* ================================================== */}
      <section className="bg-slate-50/80 border-y border-slate-200/80 py-14 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200/70">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>Comprehensive Access Dimensions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('landing.eightDimensions', 'The 8 Dimensions of Healthcare Accessibility')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              PFIS systematically examines non-clinical friction across every stage of the patient journey.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: MapPin,
                title: 'Travel Distance',
                desc: 'Road transit distances from rural habitations to specialized district facilities.',
                color: 'text-teal-600 bg-teal-50 border-teal-200',
              },
              {
                icon: Bus,
                title: 'Transport Availability',
                desc: 'Frequency and reliability of local buses, shared autos, and route transfers.',
                color: 'text-rose-600 bg-rose-50 border-rose-200',
              },
              {
                icon: Laptop,
                title: 'Digital Access',
                desc: 'Device availability, mobile literacy, and familiarity with online appointment slots.',
                color: 'text-blue-600 bg-blue-50 border-blue-200',
              },
              {
                icon: Languages,
                title: 'Language & Dialect',
                desc: 'Comfort level between the patient’s spoken dialect and hospital desk staff.',
                color: 'text-amber-600 bg-amber-50 border-amber-200',
              },
              {
                icon: Users2,
                title: 'Family & Caregiver Support',
                desc: 'Presence of family members or escorts to accompany elderly or vulnerable patients.',
                color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
              },
              {
                icon: FileCheck2,
                title: 'Documentation Status',
                desc: 'Readiness of Ayushman Bharat cards, valid identity proof, and prior medical records.',
                color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
              },
              {
                icon: Coins,
                title: 'Cost Burden',
                desc: 'Out-of-pocket expenses for round-trip tickets, food, and non-medical logistics.',
                color: 'text-orange-600 bg-orange-50 border-orange-200',
              },
              {
                icon: Clock,
                title: 'Appointment Timing',
                desc: 'Alignment of outpatient clinic hours with daily employment shifts.',
                color: 'text-purple-600 bg-purple-50 border-purple-200',
              },
            ].map((dim) => {
              const Icon = dim.icon;
              return (
                <div
                  key={dim.title}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-3"
                >
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${dim.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{dim.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{dim.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 5. PFIS SCORING METHODOLOGY */}
      {/* ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-card space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">
              <Sliders className="w-3.5 h-3.5 text-teal-600" />
              <span>Scoring Rationale</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explainable Access Friction Scoring Model
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every index score is calculated with clear, explainable factors representing physical and logistical access friction only, without making medical diagnoses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { category: 'Transportation Friction', weight: '30%', desc: 'Vehicle availability, transit frequency, and transfer counts.', color: 'text-teal-600' },
              { category: 'Cost Burden Friction', weight: '20%', desc: 'Commute fares and indirect expenses vs household daily food budget.', color: 'text-amber-600' },
              { category: 'Documentation Friction', weight: '15%', desc: 'Aadhaar / PM-JAY card linkage and referral paperwork readiness.', color: 'text-blue-600' },
              { category: 'Time & Work Friction', weight: '15%', desc: 'Rigid morning labor shift conflicts and estimated daily wage loss.', color: 'text-purple-600' },
              { category: 'Distance & Travel Friction', weight: '10%', desc: 'Total road kilometers and transit duration to verified centers.', color: 'text-rose-600' },
              { category: 'Digital Access Friction', weight: '10%', desc: 'Device type (feature phone vs smartphone) and digital literacy.', color: 'text-emerald-600' },
            ].map((item) => (
              <div key={item.category} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{item.category}</h4>
                  <span className={`font-black text-xs ${item.color}`}>{item.weight}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Classification Tiers */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-3">
              Friction Level Classifications:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-800 block">LOW FRICTION</span>
                <span className="text-[11px] text-emerald-600">0 - 25</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="font-bold text-amber-800 block">MODERATE FRICTION</span>
                <span className="text-[11px] text-amber-600">26 - 50</span>
              </div>
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200">
                <span className="font-bold text-orange-800 block">HIGH FRICTION</span>
                <span className="text-[11px] text-orange-600">51 - 75</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="font-bold text-rose-800 block">CRITICAL BARRIER</span>
                <span className="text-[11px] text-rose-600">76 - 100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 6. HOSPITAL & FACILITY DISCOVERY */}
      {/* ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200/70 mb-2">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Facility Directory & Routing</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Hospital & Facility Logistics Discovery
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Locate verified facilities with transparent distance, OPD queue status, and transit relevance.
            </p>
          </div>
          <Link to="/patient/hospitals">
            <Button variant="primary" size="md" icon={<MapPin className="w-4 h-4" />} className="cursor-pointer">
              Open Hospital Directory & Live Queue →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Geographic & Transit Routing</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Accurate road distance calculations and direct external navigation directions for every empaneled hospital.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Live OPD Queue Tracking</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Real-time token wait estimation to prevent patients from waiting prolonged hours in clinic lobbies.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Physical Accessibility</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verified availability of wheelchair ramps, Ayushman Bharat helpdesks, and emergency ambulance access.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 7. DECISION SUPPORT & INTERVENTION SIMULATOR */}
      {/* Clean, User-Friendly Healthcare Planning Showcase */}
      {/* ================================================== */}
      <section className="bg-slate-50 text-slate-900 py-10 sm:py-14 rounded-2xl sm:rounded-3xl max-w-7xl mx-3 sm:mx-6 lg:mx-auto px-5 sm:px-10 lg:px-12 border border-slate-200 space-y-8 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">
              <Sliders className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span>Decision Support for Healthcare Planners</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-950 tracking-tight leading-snug">
              Predict Impact Before Deploying Interventions
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Healthcare administrators can model how targeted logistical programs, such as community transport feeder shuttles, local document helpdesks, or extended evening OPDs, measurably reduce patient dropouts.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto">
              <Link to="/admin/simulator" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  icon={<Sliders className="w-4 h-4" />}
                  className="w-full sm:w-auto min-h-[44px] bg-teal-700 hover:bg-teal-800 text-white font-bold cursor-pointer"
                >
                  Open What-If Simulator →
                </Button>
              </Link>
              <Link to="/admin/interventions" className="w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="md"
                  icon={<BarChart3 className="w-4 h-4" />}
                  className="w-full sm:w-auto min-h-[44px] text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  View Budget Allocator
                </Button>
              </Link>
            </div>
          </div>

          {/* Simulation Preview Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-3 text-xs gap-1">
              <span className="font-bold text-slate-900">Demonstration Scenario: Rural Cohort (1,000 Patients)</span>
              <span className="text-[11px] text-slate-500">Baseline Completion: 37%</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="text-slate-700 font-medium">Baseline Care Completion Rate:</span>
                <span className="font-bold text-rose-700">37%</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-teal-200 text-xs">
                <span className="text-teal-900 font-medium">With Community Transit Feeder Shuttle</span>
                <span className="font-bold text-teal-700">37% → 62% (+25%)</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-teal-200 text-xs">
                <span className="text-teal-900 font-medium">With Ayushman Scheme Helpdesk</span>
                <span className="font-bold text-teal-700">62% → 79% (+17%)</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-teal-200 text-xs">
                <span className="text-teal-900 font-medium">With Frontline Community Escorts</span>
                <span className="font-bold text-teal-700">79% → 89% (+10%)</span>
              </div>
            </div>

            <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl text-xs flex justify-between items-center">
              <span className="text-slate-700 font-medium">Projected Outcome:</span>
              <span className="font-bold text-teal-800 text-sm">~520 Additional Patients Helped</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* 8. CALL TO ACTION */}
      {/* ================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/80 text-teal-200 text-xs font-semibold border border-teal-700/60">
              <Activity className="w-3.5 h-3.5 text-teal-300" />
              <span>Get Started</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Evaluate Healthcare Access Friction
            </h2>
            <p className="text-xs sm:text-sm text-teal-100 max-w-xl">
              Take the non-clinical logistics assessment, search verified nearby facilities, or explore administrative planning tools.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full md:w-auto shrink-0">
            <Link to="/assessment" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm sm:text-base border border-white"
              >
                <Activity className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="font-bold text-slate-900">Start Assessment →</span>
              </button>
            </Link>
            <Link to="/patient/hospitals" className="w-full sm:w-auto">
              <button
                type="button"
                className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl font-semibold bg-teal-950/70 text-white hover:bg-teal-900/90 transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm sm:text-base border border-teal-400/40 shadow-sm"
              >
                <MapPin className="w-4 h-4 text-teal-300 shrink-0" />
                <span className="font-semibold text-white">Find Nearby Hospitals</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </div>
  );
};
