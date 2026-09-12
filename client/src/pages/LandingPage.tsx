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

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-12 sm:space-y-16 md:space-y-20 lg:space-y-24 pb-16 overflow-hidden">
      {/* ================================================== */}
      {/* 1. HERO SECTION */}
      {/* ================================================== */}
      <section className="relative pt-8 pb-14 sm:pt-14 sm:pb-24 lg:pt-16 lg:pb-28 bg-gradient-to-b from-teal-50/70 via-white to-slate-50 border-b border-slate-200/80">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0d948808_1px,transparent_1px),linear-gradient(to_bottom,#0d948808_1px,transparent_1px)] sm:bg-[linear-gradient(to_right,#0d94880a_1px,transparent_1px),linear-gradient(to_bottom,#0d94880a_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] sm:bg-[size:4rem_4rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-4 sm:space-y-6">
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-semibold border border-teal-200/80 dark:border-teal-800 shadow-xs mb-2 sm:mb-3 max-w-full">
              <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="truncate">Healthcare Accessibility & Logistics Intelligence</span>
            </div>

            {/* Hero Main Heading */}
            <h1 className="text-[clamp(1.875rem,5.2vw,4.25rem)] font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
              {t('landing.heroTitle1', 'Healthcare may be available.')}{' '}
              <span className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent block mt-1">
                {t('landing.heroTitle2', 'But is it actually accessible?')}
              </span>
            </h1>

            {/* Subheading with Audio Read */}
            <div className="flex flex-col items-center gap-3">
              <p className="w-full max-w-[720px] mx-auto px-4 sm:px-0 text-[clamp(0.9375rem,1.2vw,1.125rem)] text-slate-600 leading-relaxed">
                PFIS identifies practical non-clinical barriers, including transit deficits, documentation gaps, and daily wage loss, that prevent patients from completing care. This helps healthcare planners deploy targeted interventions.
              </p>
              <TTSButton
                text="Healthcare may be available. But is it actually accessible? PFIS identifies practical non-clinical barriers, including transit deficits, documentation gaps, and daily wage loss, that prevent patients from completing care. This helps healthcare planners deploy targeted interventions."
                label={t('common.listen', 'Listen')}
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 sm:pt-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-3.5 w-full max-w-md sm:max-w-none mx-auto">
                <Link to="/assessment" className="w-full sm:w-auto max-w-[360px] mx-auto sm:mx-0">
                  <Button
                    variant="primary"
                    size="lg"
                    icon={<Activity className="w-5 h-5 shrink-0" />}
                    className="w-full min-h-[48px] px-6 text-sm sm:text-base font-bold shadow-md bg-teal-600 hover:bg-teal-700 cursor-pointer"
                  >
                    Start Access Assessment →
                  </Button>
                </Link>

                <Link to="/patient/hospitals" className="w-full sm:w-auto max-w-[360px] mx-auto sm:mx-0">
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={<MapPin className="w-5 h-5 shrink-0" />}
                    className="w-full min-h-[48px] px-6 text-sm sm:text-base font-semibold shadow-md cursor-pointer"
                  >
                    {t('landing.findHospitals', 'Find Nearby Hospitals')}
                  </Button>
                </Link>

                {!isAuthenticated ? (
                  <Link to="/login" className="w-full sm:w-auto max-w-[360px] mx-auto sm:mx-0">
                    <Button
                      variant="outline"
                      size="lg"
                      icon={<Shield className="w-4 h-4 shrink-0" />}
                      className="w-full min-h-[48px] px-6 text-sm sm:text-base font-semibold shadow-xs cursor-pointer"
                    >
                      Sign In
                    </Button>
                  </Link>
                ) : (
                  <Link
                    to={
                      user?.role === 'patient'
                        ? '/patient/dashboard'
                        : user?.role === 'hospital'
                        ? '/hospital/dashboard'
                        : '/admin/dashboard'
                    }
                    className="w-full sm:w-auto max-w-[360px] mx-auto sm:mx-0"
                  >
                    <Button
                      variant="secondary"
                      size="lg"
                      icon={<ArrowRight className="w-4 h-4 shrink-0" />}
                      className="w-full min-h-[48px] px-6 text-sm sm:text-base font-semibold shadow-md cursor-pointer"
                    >
                      {t('landing.goToDashboard', 'Go to Your Dashboard')}
                    </Button>
                  </Link>
                )}
              </div>

              {/* Secondary portal links for unauthenticated */}
              {!isAuthenticated && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                  <Link to="/admin/judge-mode">
                    <button className="text-xs text-teal-800 dark:text-teal-300 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 font-semibold px-3.5 py-1.5 rounded-lg border border-teal-200 dark:border-teal-800 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer">
                      <BarChart3 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>System Impact & Evaluation Hub →</span>
                    </button>
                  </Link>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <Link to="/login?role=hospital">
                    <button className="text-xs text-slate-600 hover:text-teal-600 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                      {t('landing.hospitalPortal', 'Hospital Desk Portal →')}
                    </button>
                  </Link>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <Link to="/login?role=patient">
                    <button className="text-xs text-slate-600 hover:text-teal-600 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                      {t('landing.patientLogin', 'Patient Portal →')}
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
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
          <div className="bg-slate-900 text-white rounded-3xl p-7 sm:p-9 shadow-xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-500 text-slate-950 font-black flex items-center justify-center text-sm shadow-sm">
                  PFIS
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Access Friction Profiling</h4>
                  <p className="text-xs text-teal-400">Transparent Multi-Vector Assessment</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-teal-950 text-teal-300 text-[11px] font-semibold border border-teal-800">
                Rule-Based Rationale
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              PFIS calculates practical friction across verified logistical indicators so healthcare teams understand the specific reasons preventing care completion:
            </p>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Travel Distance & Terrain Burden</span>
                  <span className="font-bold text-rose-400">82 / 100 (Severe)</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full w-[82%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Public Transit Availability</span>
                  <span className="font-bold text-orange-400">75 / 100 (High)</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full w-[75%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Family & Caregiver Accompaniment</span>
                  <span className="font-bold text-amber-400">65 / 100 (Moderate)</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full w-[65%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Digital Access & Scheme Readiness</span>
                  <span className="font-bold text-emerald-400">30 / 100 (Low)</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[30%]" />
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
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-card space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-semibold border border-teal-200 dark:border-teal-800">
              <Sliders className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Scoring Rationale</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Explainable Access Friction Scoring Model
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
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
              <div key={item.category} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{item.category}</h4>
                  <span className={`font-black text-xs ${item.color}`}>{item.weight}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Classification Tiers */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              Friction Level Classifications:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 block">LOW FRICTION</span>
                <span className="text-[11px] text-emerald-600">0 - 25</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <span className="font-bold text-amber-800 dark:text-amber-300 block">MODERATE FRICTION</span>
                <span className="text-[11px] text-amber-600">26 - 50</span>
              </div>
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800">
                <span className="font-bold text-orange-800 dark:text-orange-300 block">HIGH FRICTION</span>
                <span className="text-[11px] text-orange-600">51 - 75</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <span className="font-bold text-rose-800 dark:text-rose-300 block">CRITICAL BARRIER</span>
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
      <section className="bg-slate-900 text-white py-10 sm:py-14 rounded-2xl sm:rounded-3xl max-w-7xl mx-3 sm:mx-6 lg:mx-auto px-5 sm:px-10 lg:px-12 shadow-xl border border-slate-800 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 text-teal-300 text-xs font-semibold border border-teal-800">
              <Sliders className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Decision Support for Healthcare Planners</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
              Predict Impact Before Deploying Interventions
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Healthcare administrators can model how targeted logistical programs, such as community transport feeder shuttles, local document helpdesks, or extended evening OPDs, measurably reduce patient dropouts.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full sm:w-auto">
              <Link to="/admin/simulator" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="md"
                  icon={<Sliders className="w-4 h-4" />}
                  className="w-full sm:w-auto min-h-[44px] bg-teal-600 hover:bg-teal-500 text-white font-bold cursor-pointer"
                >
                  Open What-If Simulator →
                </Button>
              </Link>
              <Link to="/admin/interventions" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="md"
                  icon={<BarChart3 className="w-4 h-4" />}
                  className="w-full sm:w-auto min-h-[44px] text-teal-300 border-teal-700 hover:bg-teal-950/60 font-semibold cursor-pointer"
                >
                  View Budget Allocator
                </Button>
              </Link>
            </div>
          </div>

          {/* Simulation Preview Card */}
          <div className="bg-slate-800/95 rounded-2xl p-5 sm:p-6 border border-slate-700/80 space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700 pb-3 text-xs gap-1">
              <span className="font-bold text-teal-300">Demonstration Scenario: Rural Cohort (1,000 Patients)</span>
              <span className="text-[11px] text-slate-400">Baseline Completion: 37%</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-xs">
                <span className="text-slate-300">Baseline Care Completion Rate:</span>
                <span className="font-bold text-rose-400">37%</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/90 border border-teal-900/60 text-xs">
                <span className="text-teal-200">With Community Transit Feeder Shuttle</span>
                <span className="font-bold text-teal-400">37% → 62% (+25%)</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/90 border border-teal-900/60 text-xs">
                <span className="text-teal-200">With Ayushman Scheme Helpdesk</span>
                <span className="font-bold text-teal-400">62% → 79% (+17%)</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/90 border border-teal-900/60 text-xs">
                <span className="text-teal-200">With Frontline Community Escorts</span>
                <span className="font-bold text-teal-400">79% → 89% (+10%)</span>
              </div>
            </div>

            <div className="p-3.5 bg-teal-950/80 border border-teal-800/80 rounded-xl text-xs flex justify-between items-center">
              <span className="text-slate-200 font-medium">Projected Outcome:</span>
              <span className="font-bold text-teal-300 text-sm">~520 Additional Patients Helped</span>
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
    </div>
  );
};
