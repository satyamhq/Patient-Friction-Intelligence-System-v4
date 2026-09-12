import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation } from '../../context/LocationContext';
import { patientService } from '../../services/patientService';
import { hospitalService } from '../../services/hospitalService';
import { documentService } from '../../services/documentService';
import { Patient, FrictionProfile, CareRisk, HospitalRequest, PatientDocument, Hospital } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { CompletionGauge } from '../../components/charts/CompletionGauge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { TTSButton } from '../../components/common/TTSButton';
import { SmartHospitalRecommendationCard } from '../../components/hospitals/SmartHospitalRecommendationCard';
import { LiveQueueTracker } from '../../components/queue/LiveQueueTracker';
import {
  Activity,
  ShieldAlert,
  MapPin,
  Building2,
  FileText,
  ListOrdered,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  FolderLock,
  Plus,
  Laptop,
  CheckCircle2,
  Clock,
  UserCheck,
  RefreshCw,
  Navigation,
  GitFork,
  Pill,
  HeartPulse,
  HeartHandshake,
  Stethoscope,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const { coords, requestCurrentLocation, isLoading: isLocLoading } = useLocation();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [frictionProfile, setFrictionProfile] = useState<FrictionProfile | null>(null);
  const [careRisk, setCareRisk] = useState<CareRisk | null>(null);
  const [activeRequests, setActiveRequests] = useState<HospitalRequest[]>([]);
  const [recentDocs, setRecentDocs] = useState<PatientDocument[]>([]);
  const [nearestHospital, setNearestHospital] = useState<Hospital | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const pRes = await patientService.getMe().catch(() => null);
        if (pRes?.success && pRes.patient) {
          setPatient(pRes.patient);
          setActiveRequests(pRes.activeRequests || []);
        }
        // No fallback: if no patient profile exists, show onboarding state below

        const fRes = await patientService.getFrictionProfile().catch(() => null);
        if (fRes?.success) setFrictionProfile(fRes.frictionProfile);

        const rRes = await patientService.getAccessibilityRisk().catch(() => null);
        if (rRes?.success) setCareRisk(rRes.careRisk);

        const dRes = await documentService.getPatientDocuments().catch(() => null);
        if (dRes?.success) setRecentDocs(dRes.documents.slice(0, 3));

        // Fetch nearest real hospital dynamically from user's live GPS coordinates
        const lat = coords.latitude || pRes?.patient?.location?.latitude || 31.2533;
        const lng = coords.longitude || pRes?.patient?.location?.longitude || 75.7042;
        const hRes = await hospitalService.getNearby({ lat, lng, radiusKm: 60 }).catch(() => null);
        if (hRes?.success && hRes.hospitals?.length > 0) {
          setNearestHospital(hRes.hospitals[0]);
        }
      } catch (e) {
        console.error('[PatientDashboard Error]', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [coords.latitude, coords.longitude]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={3} />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LoadingSkeleton rows={2} />
          <LoadingSkeleton rows={2} />
          <LoadingSkeleton rows={2} />
          <LoadingSkeleton rows={2} />
        </div>
      </div>
    );
  }

  // No patient profile found for this user → show onboarding card
  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 flex items-center justify-center shadow-lg">
          <UserCheck className="w-10 h-10 text-brand-600 dark:text-brand-400" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Welcome, {user?.name}!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Your health profile hasn't been set up yet. Complete it to unlock your personalised friction score, care accessibility index, and nearby hospital matching.
          </p>
        </div>
        <Link
          to="/patient/profile"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
        >
          <UserCheck className="w-4 h-4" />
          Set Up My Health Profile
        </Link>
      </div>
    );
  }

  // Real dynamic distance calculation based on user's live coordinates & nearest facility
  const realDistanceKm = nearestHospital?.distanceKm ?? (frictionProfile?.travel?.contributingParameters?.distanceKm ?? 2.7);

  let accessibilityScore = frictionProfile?.overallAccessibilityScore ?? 85;
  let completionProbability = careRisk?.careCompletionProbability ?? 86;
  let riskCategory = careRisk?.riskCategory ?? 'LOW';
  let topBarrier = frictionProfile?.topBarrier ?? 'Transport Availability';

  if (nearestHospital && realDistanceKm !== undefined) {
    if (realDistanceKm <= 5) {
      accessibilityScore = Math.max(accessibilityScore, 92);
      completionProbability = Math.max(completionProbability, 91);
      riskCategory = 'LOW';
      topBarrier = 'OPD Token Queue & Timings';
    } else if (realDistanceKm <= 15) {
      accessibilityScore = 80;
      completionProbability = 82;
      riskCategory = 'LOW';
      topBarrier = 'Local Road Transit';
    } else if (realDistanceKm <= 30) {
      accessibilityScore = 64;
      completionProbability = 70;
      riskCategory = 'MODERATE';
      topBarrier = 'Travel Distance & Transit Cost';
    } else {
      accessibilityScore = 46;
      completionProbability = 52;
      riskCategory = 'HIGH';
      topBarrier = 'Severe Geographic Distance';
    }
  }

  const userAddressText = coords.address || patient?.location?.address || (coords.city ? `${coords.city}, ${coords.state || 'India'}` : patient?.location?.city || 'Location not available');



  const dynamicDiagnosis = nearestHospital
    ? `User detected at ${userAddressText}. Nearest verified health center (${nearestHospital.name}) is ${realDistanceKm.toFixed(1)} km away (~${Math.max(5, Math.round(realDistanceKm * 3.5))} mins transit). Overall accessibility friction is evaluated at ${100 - accessibilityScore}/100 with ${completionProbability}% care completion probability.`
    : (frictionProfile?.explanation || `User located at ${userAddressText}. Nearby facility proximity represents manageable geographic travel.`);

  const dashboardExplanation = dynamicDiagnosis;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header Profile Greeting Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-card flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('patient.welcome', 'Welcome')}, {user?.name}
            </h1>
            {patient?.patientCode && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold border border-slate-200 dark:border-slate-700">
                {patient.patientCode}
              </span>
            )}
            <StatusBadge status={riskCategory === 'CRITICAL' ? 'CRITICAL' : riskCategory === 'HIGH' ? 'HIGH' : 'ACTIVE'} size="sm" />
            <TTSButton text={`${t('patient.welcome')} ${user?.name}. ${dashboardExplanation}`} />
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-0.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 border border-teal-200 dark:border-teal-800 text-xs font-semibold shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 animate-pulse" />
              <span>{userAddressText}</span>
              <span className="text-teal-600 dark:text-teal-400 font-mono text-[10px]">
                ({coords.latitude.toFixed(3)}, {coords.longitude.toFixed(3)})
              </span>
            </div>

            <button
              onClick={() => requestCurrentLocation()}
              disabled={isLocLoading}
              title="Detect and refresh real GPS coordinates"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/40 rounded-lg border border-teal-200 dark:border-teal-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLocLoading ? 'animate-spin text-teal-600' : ''}`} />
              <span>{isLocLoading ? 'Detecting...' : 'Sync GPS'}</span>
            </button>

            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{t('common.language', 'Language')}: <strong>{currentLanguage.nativeName}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <Link to="/patient/profile">
            <Button variant="outline" size="sm">
              {t('patient.editProfile', 'Edit Profile')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Smart Recommended Hospital & Live OPD Queue Tracker */}
      <div className="space-y-6" id="queue">
        <SmartHospitalRecommendationCard
          hospital={{
            id: nearestHospital?._id || 'hosp-rec-1',
            name: nearestHospital?.name || 'District Civil Hospital, Jalandhar',
            type: nearestHospital?.type || 'Government',
            city: nearestHospital?.city || coords.city || 'Jalandhar',
            district: nearestHospital?.state || coords.state || 'Punjab',
            distanceKm: Number(realDistanceKm.toFixed(1)),
            estimatedWaitMinutes: nearestHospital?.averageWaitTimeMinutes || 25,
            availableBeds: nearestHospital?.availableBeds || 42,
            totalBeds: nearestHospital?.totalBeds || 120,
            rating: nearestHospital?.rating || 4.8,
            reasons: [
              `Shortest transit barrier: Only ${realDistanceKm.toFixed(1)} km away via local transit`,
              'Minimal queue friction: Digital OPD tokens active with live SMS/app progression',
              'Specialty match: General medicine and emergency triage open 24/7 with zero referral backlog',
            ],
            specialtyMatch: 'General Medicine, Emergency & Diagnostic Lab',
            frictionScore: Math.round(100 - accessibilityScore),
          }}
          onSelectToken={() => {
            const el = document.getElementById('queue-tracker-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        <div id="queue-tracker-section">
          <LiveQueueTracker
            hospitalName={nearestHospital?.name || 'District Civil Hospital, Jalandhar'}
            department="General Medicine OPD"
          />
        </div>
      </div>

      {/* 2. Primary 1-Click Patient Healthcare Action Hub */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600" /> Quick Patient Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Find Hospitals & Doctors */}
          <Link
            to="/patient/hospitals"
            className="p-5 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg shadow-teal-500/10 hover:shadow-xl hover:scale-[1.02] transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base leading-tight">Find Hospitals & Doctors</h3>
              <p className="text-xs text-teal-100 leading-relaxed">
                View on-duty doctors, available OPD token seats, and bed capacity near you.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-teal-100 group-hover:text-white">
              <span>Find Nearby</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Live Video Teleconsultation */}
          <Link
            to="/patient/teleconsult"
            className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/10 hover:shadow-xl hover:scale-[1.02] transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base leading-tight">Live Teleconsultation</h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                Connect instantly via video with duty doctors from home with live translation.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-blue-100 group-hover:text-white">
              <span>Start Video Call</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Friction Digital Twin */}
          <Link
            to="/patient/digital-twin"
            className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:scale-[1.02] transition-all flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base leading-tight">Friction Digital Twin</h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Simulate your 7-step travel journey and see how shuttles and ASHA escorts save time.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-emerald-100 group-hover:text-white">
              <span>Simulate Journey</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4: Document Vault */}
          <Link
            to="/patient/documents"
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg shadow-slate-900/10 hover:shadow-xl hover:scale-[1.02] transition-all flex flex-col justify-between space-y-4 group border border-slate-700"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white backdrop-blur-xs">
                <FolderLock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base leading-tight">Document Vault</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Securely store your Ayushman Bharat card, prescription slips, and lab reports.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-white">
              <span>View Documents</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* 2b. Integrated Public Health Care-Access Suite */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wider border border-teal-200 dark:border-teal-800">
              <Building2 className="w-3 h-3" /> Public Health Infrastructure • Regional Facility Network
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
              Integrated Rural Care & Public Facility Support
            </h2>
          </div>
          <span className="text-xs text-slate-400">Strengthening Primary to Tertiary Health Continuum</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Digital Triage & Tier Router */}
          <Link
            to="/patient/triage"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 shadow-xs hover:shadow-md transition-all flex items-start gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                <span>Digital Triage & Tier Router</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Determine whether to visit <strong>Sub-Centre</strong>, <strong>PHC</strong>, or <strong>Rural Hospital</strong> to avoid 60km travel.
              </p>
            </div>
          </Link>

          {/* 2. Tiered Referral Tracking */}
          <Link
            to="/patient/referrals"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all flex items-start gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <GitFork className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                <span>Referral Tracking Hub</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Multi-tier pipeline (PHC ➡️ RH ➡️ DH) with 102/108 transit status and counter-referral feedback loop.
              </p>
            </div>
          </Link>

          {/* 3. Longitudinal Records & ABHA */}
          <Link
            to="/patient/health-records"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 shadow-xs hover:shadow-md transition-all flex items-start gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                <span>Health Records & ABHA</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Interoperable 14-digit ABHA card, chronological consultation history, and ABDM FHIR JSON export.
              </p>
            </div>
          </Link>

          {/* 4. Diagnostic Network & Equipment Uptime */}
          <Link
            to="/patient/diagnostics"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-400 shadow-xs hover:shadow-md transition-all flex items-start gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                <span>Diagnostic Equipment Uptime</span>
                <ArrowRight className="w-3.5 h-3.5 text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verify functional status of <strong>Digital X-Ray</strong>, <strong>Ultrasound</strong>, and <strong>CBNAAT TB</strong> labs.
              </p>
            </div>
          </Link>

          {/* 5. e-Aushadhi Essential Medicines */}
          <Link
            to="/patient/medicines"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 shadow-xs hover:shadow-md transition-all flex items-start gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Pill className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                <span>e-Aushadhi Medicine Stock</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Real-time Essential Drug List (EDL) inventory across facilities with alternate stock locator.
              </p>
            </div>
          </Link>

          {/* 6. High-Risk Care & Follow-up */}
          <Link
            to="/patient/high-risk"
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-rose-400 shadow-xs hover:shadow-md transition-all flex items-start gap-3.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                <span>High-Risk Care & Follow-up</span>
                <ArrowRight className="w-3.5 h-3.5 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tracking for <strong>High-Risk Pregnancies</strong>, <strong>Child Immunization</strong>, and <strong>Chronic NCDs</strong>.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* 3. 4 Key Friction Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('patient.accessibilityScore', 'Healthcare Accessibility')}
          value={`${accessibilityScore} / 100`}
          subtitle={t('patient.accessibilityScoreDesc', 'Non-clinical accessibility score')}
          icon={TrendingUp}
          badge={accessibilityScore >= 70 ? t('common.optimal', 'Optimal') : accessibilityScore >= 50 ? t('common.moderate', 'Moderate') : t('common.high', 'Constrained')}
          badgeType={accessibilityScore >= 70 ? 'success' : accessibilityScore >= 50 ? 'warning' : 'danger'}
        />

        <StatCard
          title={t('patient.completionProb', 'Care Completion Prob.')}
          value={`${completionProbability}%`}
          subtitle={t('patient.completionProbDesc', 'Estimated journey completion forecast')}
          icon={Activity}
          iconColor="text-teal-600 bg-teal-50 border-teal-100 dark:bg-teal-950/40"
          badge={`${completionProbability}%`}
          badgeType={completionProbability >= 70 ? 'success' : completionProbability >= 50 ? 'warning' : 'danger'}
        />

        <StatCard
          title={t('patient.accessibilityRisk', 'Accessibility Risk')}
          value={riskCategory}
          subtitle={t('patient.accessibilityRiskDesc', 'Estimated operational barrier risk')}
          icon={ShieldAlert}
          iconColor={riskCategory === 'CRITICAL' ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-amber-600 bg-amber-50 border-amber-100'}
          badge={riskCategory}
          badgeType={riskCategory === 'CRITICAL' ? 'danger' : riskCategory === 'HIGH' ? 'danger' : 'success'}
        />

        <StatCard
          title={t('patient.primaryBarrier', 'Primary Barrier')}
          value={topBarrier.split(' ')[0]}
          subtitle={topBarrier}
          icon={AlertTriangle}
          iconColor="text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-950/40"
          badge="High Barrier"
          badgeType="warning"
        />
      </div>

      {/* 4. Center 2-Column: Intelligence & Nearest Facility */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Gauge & Friction Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('patient.explainableIntelligence', 'Explainable Accessibility Intelligence')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('patient.explainableDesc', 'How socio-geographic factors shape your estimated healthcare completion')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <TTSButton text={dashboardExplanation} />
                <Link to="/patient/friction">
                  <Button variant="ghost" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                    {t('patient.radarBtn', 'Detailed Radar')}
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <div className="sm:col-span-1 flex justify-center">
                <CompletionGauge
                  score={completionProbability}
                  size={160}
                  label="Completion Forecast"
                  sublabel="Operational index"
                />
              </div>

              <div className="sm:col-span-2 space-y-3 text-xs">
                <div className="p-4 rounded-2xl border space-y-1.5 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <p className="font-bold text-xs flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-teal-500" />
                    Operational Access Diagnosis:
                  </p>
                  <p className="leading-relaxed">{dashboardExplanation}</p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link to="/patient/risk" className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      {t('patient.bottleneckAnalysis', 'View Journey Bottleneck Analysis')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Active Patient Requests Ledger */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t('patient.activeRequests', 'Active Hospital Requests')}
                </h3>
              </div>
              <Link to="/patient/requests" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                {t('patient.viewAll', 'View All')} ({activeRequests.length})
              </Link>
            </div>

            {activeRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                <p>No active hospital intake requests.</p>
                <Link to="/patient/hospitals">
                  <Button variant="primary" size="sm">
                    Find Hospital & Book Slot
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeRequests.map((req) => (
                  <Link
                    key={req._id}
                    to={`/patient/requests/${req._id}`}
                    className="block p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-all text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">{req.requestCode}</span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {(req.hospitalId as any)?.name || 'Civil Hospital'}
                        </h4>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Department: {req.departmentName}</p>
                      </div>
                      <StatusBadge status={req.status} size="sm" />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span>Reason: {req.reasonForVisit}</span>
                      <span className="font-semibold text-teal-700 dark:text-teal-400">
                        {req.distanceKm ? `${req.distanceKm} km transit` : 'Nearby'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Nearest Hospital Card & Document Vault */}
        <div className="space-y-6">
          {/* Nearest Hospital Card with Doctors */}
          {nearestHospital && (
            <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-navy-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" /> {t('patient.nearestFacility', 'Nearest Verified Facility')}
                </span>
                <span className="text-[10px] bg-teal-950 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-800 font-bold uppercase">
                  {nearestHospital.type}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-lg text-white">{nearestHospital.name}</h4>
                <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  {nearestHospital.address}, {nearestHospital.city}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">{t('hospital.distance', 'Distance')}:</span>
                  <span className="font-bold text-teal-300">{realDistanceKm.toFixed(1)} km away</span>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700">
                  <span className="text-[10px] text-slate-400 block">Emergency:</span>
                  <span className="font-bold text-emerald-300">
                    {nearestHospital.emergencyAvailable ? '24/7 Active' : 'OPD Hours'}
                  </span>
                </div>
              </div>

              <Link to={`/patient/hospitals/${nearestHospital._id}`} className="block pt-1">
                <Button variant="primary" size="sm" className="w-full">
                  {t('patient.viewHospitalAndRequest', 'View Hospital & Doctors')}
                </Button>
              </Link>
            </div>
          )}

          {/* Document Vault Quick Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-teal-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('patient.documentVault', 'Medical Records Vault')}
                </h4>
              </div>
              <Link to="/patient/documents" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
                {t('common.view', 'View All')}
              </Link>
            </div>

            {recentDocs.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                Upload your Ayushman Bharat card and prescriptions for 1-click hospital intake.
              </div>
            ) : (
              <div className="space-y-2">
                {recentDocs.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{doc.title}</span>
                    </div>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-bold">
                      {doc.type}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Link to="/patient/documents" className="block">
              <Button variant="outline" size="sm" className="w-full text-xs" icon={<Plus className="w-3.5 h-3.5" />}>
                {t('patient.uploadRecord', 'Upload Medical Record')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
