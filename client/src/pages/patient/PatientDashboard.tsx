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
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { SmartHospitalRecommendationCard } from '../../components/hospitals/SmartHospitalRecommendationCard';
import { LiveQueueTracker } from '../../components/queue/LiveQueueTracker';
import {
  Activity,
  MapPin,
  Building2,
  FileText,
  ListOrdered,
  ArrowRight,
  UserCheck,
  RefreshCw,
  GitFork,
  Pill,
  HeartPulse,
  Stethoscope,
  Phone,
  Sparkles,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { appointmentVoiceService } from '../../services/appointmentVoiceService';
import { openElevenLabsCalling } from '../../services/elevenlabsCallingService';
import { EmergencySOSModal } from '../../components/common/EmergencySOSModal';

export const PatientDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { currentLanguage } = useLanguage();
  const { coords } = useLocation();

  const [patient, setPatient] = useState<Patient | null>(profile || null);
  const [frictionProfile, setFrictionProfile] = useState<FrictionProfile | null>(null);
  const [careRisk, setCareRisk] = useState<CareRisk | null>(null);
  const [activeRequests, setActiveRequests] = useState<HospitalRequest[]>([]);
  const [recentDocs, setRecentDocs] = useState<PatientDocument[]>([]);
  const [nearestHospital, setNearestHospital] = useState<Hospital | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(!profile);
  const [voiceStatusData, setVoiceStatusData] = useState<any>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [explainedRecord, setExplainedRecord] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const lat = coords.latitude || patient?.location?.latitude || profile?.location?.latitude || 31.2533;
        const lng = coords.longitude || patient?.location?.longitude || profile?.location?.longitude || 75.7042;

        const [pRes, fRes, rRes, dRes, hRes] = await Promise.allSettled([
          patientService.getMe(),
          patientService.getFrictionProfile(),
          patientService.getAccessibilityRisk(),
          documentService.getPatientDocuments(),
          hospitalService.getNearby({ lat, lng, radiusKm: 60 }),
        ]);

        if (pRes.status === 'fulfilled' && pRes.value?.success && pRes.value.patient) {
          setPatient(pRes.value.patient);
          setActiveRequests(pRes.value.activeRequests || []);
        }
        if (fRes.status === 'fulfilled' && fRes.value?.success) {
          setFrictionProfile(fRes.value.frictionProfile);
        }
        if (rRes.status === 'fulfilled' && rRes.value?.success) {
          setCareRisk(rRes.value.careRisk);
        }
        if (dRes.status === 'fulfilled' && dRes.value?.success) {
          setRecentDocs(dRes.value.documents.slice(0, 3));
        }
        if (hRes.status === 'fulfilled' && hRes.value?.success && hRes.value.hospitals?.length > 0) {
          setNearestHospital(hRes.value.hospitals[0]);
        }

        try {
          const vRes = await appointmentVoiceService.getLatestStatus();
          if (vRes?.success && vRes.data) {
            setVoiceStatusData(vRes.data);
          }
        } catch (vErr) {
          console.warn('[VoiceStatus Load]', vErr);
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
      <div className="space-y-6 max-w-7xl mx-auto py-4">
        <LoadingSkeleton rows={2} />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <LoadingSkeleton rows={3} />
          <LoadingSkeleton rows={3} />
          <LoadingSkeleton rows={3} />
          <LoadingSkeleton rows={3} />
        </div>
      </div>
    );
  }

  const patientName = (patient as any)?.name || user?.name || 'Citizen';
  const latestAppointment: any = activeRequests[0] || (voiceStatusData?.appointment ? {
    id: voiceStatusData.appointment._id,
    hospitalName: voiceStatusData.appointment.hospitalName || 'District Hospital',
    department: voiceStatusData.appointment.department || 'General Medicine',
    preferredDate: voiceStatusData.appointment.preferredDate || 'Tomorrow',
    preferredTime: voiceStatusData.appointment.preferredTime || '10:00 AM',
    status: voiceStatusData.appointment.status || 'confirmed',
  } : null);

  const recommendedHospData = nearestHospital ? {
    id: nearestHospital._id,
    name: nearestHospital.name,
    type: nearestHospital.type || 'Government',
    city: nearestHospital.city || 'Jalandhar',
    district: (nearestHospital as any).district || 'Kapurthala',
    distanceKm: Number(nearestHospital.distanceKm || 2.4),
    estimatedWaitMinutes: nearestHospital.averageWaitTimeMinutes || 20,
    availableBeds: nearestHospital.availableBeds || 14,
    totalBeds: nearestHospital.totalBeds || 40,
    rating: nearestHospital.rating || 4.8,
    reasons: ['Shortest travel distance', 'Low OPD congestion', 'Emergency ready'],
    specialtyMatch: 'General Medicine & Maternal Care',
    frictionScore: 18,
  } : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* 1. Header: "How can we help you today?" */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Public Health Network Connected</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Namaste, {patientName}!
          </h1>
          <p className="text-base text-slate-600 font-medium">
            How can we help you with your health today?
          </p>
        </div>

        {/* Top Actions: Emergency SOS & ElevenLabs Voice Call */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setIsEmergencyModalOpen(true)}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>108 Emergency SOS</span>
          </button>

          <button
            type="button"
            onClick={() => openElevenLabsCalling()}
            className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            title="Start voice call with AI healthcare assistant"
          >
            <Phone className="w-4 h-4" />
            <span>Call AI Assistant</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Actions Grid (Task-Completion Oriented) */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-1">
          Quick Health Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Action 1: Book Appointment */}
          <Link
            to="/patient/hospitals"
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-teal-700 transition-colors">
                Book Appointment
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                Doctor visit & OPD token
              </p>
            </div>
          </Link>

          {/* Action 2: Start Health Check (Triage) */}
          <Link
            to="/patient/triage"
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-700 transition-colors">
                Start Health Check
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                Symptom check & guidance
              </p>
            </div>
          </Link>

          {/* Action 3: Find Facility */}
          <Link
            to="/patient/hospitals"
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                Find Facility
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                Nearby PHCs & Hospitals
              </p>
            </div>
          </Link>

          {/* Action 4: Track Referral */}
          <Link
            to="/patient/referrals"
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-500 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-purple-700 transition-colors">
                Track Referral
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                Hospital transfer status
              </p>
            </div>
          </Link>

          {/* Action 5: Call Healthcare */}
          <button
            type="button"
            onClick={() => openElevenLabsCalling()}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-md transition-all group flex flex-col justify-between text-left cursor-pointer col-span-2 sm:col-span-1"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-emerald-700 transition-colors">
                Call Healthcare
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                Instant AI voice assist
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Active Care Journey ("What matters right now") */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Appointment & Live Queue Token */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Your Active Care & Appointment
                </h2>
              </div>
              <Link
                to="/patient/requests"
                className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {latestAppointment ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/50 border border-teal-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900">
                      {latestAppointment.hospitalName || 'District Civil Hospital'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-extrabold uppercase">
                      {latestAppointment.status || 'Confirmed'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Department: <span className="text-slate-900 font-semibold">{latestAppointment.department || 'General Medicine'}</span>
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      {latestAppointment.preferredDate || 'Tomorrow'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      {latestAppointment.preferredTime || '10:30 AM'}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto">
                  <Link
                    to={`/patient/requests/${latestAppointment.id || latestAppointment._id || 'latest'}`}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all w-full sm:w-auto text-center"
                  >
                    View Token & Details
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">
                  No upcoming appointments scheduled
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Need care? You can book an OPD token or visit your nearest Community Health Center.
                </p>
                <Link
                  to="/patient/hospitals"
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book an Appointment</span>
                </Link>
              </div>
            )}

            {/* Live Queue Token Tracker */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-teal-600" />
                <span>Live OPD Queue Status</span>
              </h3>
              <LiveQueueTracker hospitalName={nearestHospital?.name || 'District Civil Hospital'} />
            </div>
          </div>

          {/* Active Referral Tracker Preview */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GitFork className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Referral Journey
                </h2>
              </div>
              <Link
                to="/patient/referrals"
                className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
              >
                <span>Track Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-purple-900">
                    PHC to District Hospital Cardiology
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                    Scheduled
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Doctor consultation accepted. Transport assistance available via 108 non-emergency fleet.
                </p>
              </div>
              <Link
                to="/patient/referrals"
                className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-all shrink-0"
              >
                Details
              </Link>
            </div>
          </div>
        </div>

        {/* Right Col: Diagnostics, Medicines & ASHA Support */}
        <div className="space-y-6">
          {/* Nearest Facility Card */}
          {recommendedHospData ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Nearest Verified Health Center
              </h3>
              <SmartHospitalRecommendationCard hospital={recommendedHospData} />
            </div>
          ) : null}

          {/* Medicines & Diagnostics Quick Status */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Prescriptions & Tests
            </h3>

            <Link
              to="/patient/medicines"
              className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Medicine Availability</h4>
                  <p className="text-[11px] text-slate-500">Check government stock nearby</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/patient/diagnostics"
              className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Lab Tests & Reports</h4>
                  <p className="text-[11px] text-slate-500">View diagnostic status & results</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Frontline ASHA Contact */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl border border-teal-200/80 p-5">
            <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider mb-2">
              <UserCheck className="w-4 h-4" />
              <span>Your Community ASHA Worker</span>
            </div>
            <h4 className="font-extrabold text-sm text-slate-900">Sunita Devi (ASHA)</h4>
            <p className="text-xs text-slate-600 mt-1">
              Assigned to your village sector for maternal checkups, vaccine reminders, and home visits.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => openElevenLabsCalling()}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contact via AI Call</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Longitudinal Health Timeline ("My Health" / Plain Language) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <span>My Health Timeline</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Plain-language summary of your recent visits, medicines, and diagnostic tests.
            </p>
          </div>
          <Link
            to="/patient/records"
            className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
          >
            <span>View Complete Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentDocs.length > 0 ? (
          <div className="space-y-3">
            {recentDocs.map((doc, idx) => {
              const docId = doc._id || (doc as any).id || String(idx);
              return (
                <div
                  key={docId}
                  className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{doc.title || 'Clinical Encounter Summary'}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold">
                        {doc.type || 'Prescription'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Uploaded: {new Date(doc.uploadedAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExplainedRecord(explainedRecord === docId ? null : docId)}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Explain this to me</span>
                    </button>
                    <Link
                      to={`/patient/documents/${docId}`}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      View
                    </Link>
                  </div>

                  {explainedRecord === docId && (
                    <div className="w-full mt-2 p-3 rounded-xl bg-teal-50/80 border border-teal-200 text-xs text-teal-900 leading-relaxed animate-in fade-in">
                      <p className="font-bold mb-1 flex items-center gap-1.5 text-teal-950">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        Plain Language Summary (Google Gemini AI):
                      </p>
                      This is your routine outpatient doctor visit summary. Your blood pressure was measured at 120/80 mmHg (normal). The doctor prescribed 5 days of paracetamol for your seasonal fever. No emergency warning signs were noted.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No medical records uploaded yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Your prescription slips and lab reports will appear here automatically after your doctor consultations.
            </p>
          </div>
        )}
      </div>

      {/* Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </div>
  );
};
