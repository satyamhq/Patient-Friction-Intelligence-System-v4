import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  publicHealthService,
  HealthRecord,
  AbhaProfile,
  HealthRecordConsent,
  HealthRecordAuditEvent,
} from '../../services/publicHealthService';
import { hospitalService } from '../../services/hospitalService';
import { Hospital } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  CreditCard,
  QrCode,
  Download,
  Calendar,
  Building2,
  User,
  Activity,
  Pill,
  CheckCircle2,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ExternalLink,
  Lock,
  RefreshCw,
  Eye,
  AlertTriangle,
  History,
  X,
  Search,
} from 'lucide-react';

export const LongitudinalRecordsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  // ── Core State ────────────────────────────────────────────────────────────
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [abha, setAbha] = useState<AbhaProfile>({
    status: 'not_connected',
    abhaNumber: null,
    abhaAddress: null,
    name: user?.name || null,
    dob: null,
    gender: profile?.gender || null,
    state: profile?.location?.state || null,
    verificationStatus: 'ABHA not connected',
    qrAvailable: false,
    qrData: null,
    lastSyncTime: null,
  });
  const [syncStatus, setSyncStatus] = useState<string>('not_synchronized');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'consents' | 'audit'>('timeline');

  // ── Consents & Audit Trail ────────────────────────────────────────────────
  const [consents, setConsents] = useState<HealthRecordConsent[]>([]);
  const [auditEvents, setAuditEvents] = useState<HealthRecordAuditEvent[]>([]);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // ── Modals State ──────────────────────────────────────────────────────────
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState<boolean>(false);
  const [isConnectAbhaModalOpen, setIsConnectAbhaModalOpen] = useState<boolean>(false);

  // ── "Add Visit Entry" Form State ──────────────────────────────────────────
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState<boolean>(false);
  const [hospitalQuery, setHospitalQuery] = useState<string>('');
  const [selectedFacilityName, setSelectedFacilityName] = useState<string>('');
  const [customFacilityName, setCustomFacilityName] = useState<string>('');
  const [recordType, setRecordType] = useState<string>('OPD Consultation');
  const [recordDate, setRecordDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [doctorName, setDoctorName] = useState<string>('');
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [bp, setBp] = useState<string>('');
  const [pulse, setPulse] = useState<string>('');
  const [spo2, setSpo2] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmittingEntry, setIsSubmittingEntry] = useState<boolean>(false);

  // ── "Connect ABHA" Form State ─────────────────────────────────────────────
  const [inputAbhaNumber, setInputAbhaNumber] = useState<string>('');
  const [inputAbhaAddress, setInputAbhaAddress] = useState<string>('');
  const [isConnectingAbha, setIsConnectingAbha] = useState<boolean>(false);

  // ── Fetch Health Records & ABHA Profile ───────────────────────────────────
  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await publicHealthService.getHealthRecords();
      if (data) {
        if (data.abha) setAbha(data.abha);
        if (Array.isArray(data.records)) setRecords(data.records);
        if (data.syncStatus) setSyncStatus(data.syncStatus);
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to fetch health records', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // ── Fetch Consents ────────────────────────────────────────────────────────
  const fetchConsents = useCallback(async () => {
    try {
      const data = await publicHealthService.getHealthRecordConsents();
      setConsents(data);
    } catch (_err) {
      // Non-blocking
    }
  }, []);

  // ── Fetch Audit Events ────────────────────────────────────────────────────
  const fetchAuditEvents = useCallback(async () => {
    try {
      const data = await publicHealthService.getHealthRecordAuditEvents();
      setAuditEvents(data);
    } catch (_err) {
      // Non-blocking
    }
  }, []);

  // ── Initial Load ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchRecords();
    fetchConsents();
    fetchAuditEvents();
  }, [fetchRecords, fetchConsents, fetchAuditEvents]);

  // ── Load Facilities for Visit Entry ───────────────────────────────────────
  const loadHospitals = useCallback(async (q = '') => {
    setHospitalsLoading(true);
    try {
      if (q.trim().length > 1) {
        const res = await hospitalService.search(q);
        setHospitals(res.hospitals || []);
      } else {
        const res = await hospitalService.getNearby({ radiusKm: 250 });
        setHospitals(res.hospitals || []);
      }
    } catch {
      setHospitals([]);
    } finally {
      setHospitalsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isNewRecordModalOpen) {
      loadHospitals(hospitalQuery);
    }
  }, [isNewRecordModalOpen, hospitalQuery, loadHospitals]);

  // ── Handle "Add Visit Entry" ──────────────────────────────────────────────
  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const facility = selectedFacilityName === 'other'
      ? customFacilityName.trim()
      : selectedFacilityName.trim();

    if (!facility) {
      showToast('Please specify the healthcare facility visited', 'error');
      return;
    }
    if (!diagnosis.trim()) {
      showToast('Please enter a diagnosis or visit summary', 'error');
      return;
    }

    try {
      setIsSubmittingEntry(true);
      const vitalsObj: Record<string, string> = {};
      if (bp.trim()) vitalsObj.bp = bp.trim();
      if (pulse.trim()) vitalsObj.pulse = pulse.trim();
      if (spo2.trim()) vitalsObj.spo2 = spo2.trim();

      await publicHealthService.createHealthRecord({
        facilityName: facility,
        doctorName: doctorName.trim() || 'Medical Officer / Attending Staff',
        recordType: recordType,
        recordDate: recordDate,
        diagnosis: diagnosis.trim(),
        recordSource: 'patient_entered', // Strictly marked as patient-entered
        vitals: Object.keys(vitalsObj).length > 0 ? vitalsObj : undefined,
        notes: notes.trim() || undefined,
      } as any);

      showToast('Visit entry saved as a Patient-entered record', 'success');
      setIsNewRecordModalOpen(false);
      // Reset form
      setSelectedFacilityName('');
      setCustomFacilityName('');
      setDiagnosis('');
      setDoctorName('');
      setBp('');
      setPulse('');
      setSpo2('');
      setNotes('');
      // Reload records & audit
      fetchRecords();
      fetchAuditEvents();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save health record', 'error');
    } finally {
      setIsSubmittingEntry(false);
    }
  };

  // ── Handle "Connect ABHA" ─────────────────────────────────────────────────
  const handleConnectAbha = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputAbhaNumber.trim() && !inputAbhaAddress.trim()) {
      showToast('Please enter your 14-digit ABHA number or ABHA address', 'error');
      return;
    }

    try {
      setIsConnectingAbha(true);
      const res = await publicHealthService.connectAbha({
        abhaNumber: inputAbhaNumber.trim() || undefined,
        abhaAddress: inputAbhaAddress.trim() || undefined,
      });

      showToast(res.message || 'ABHA account linked successfully', 'success');
      setIsConnectAbhaModalOpen(false);
      setInputAbhaNumber('');
      setInputAbhaAddress('');
      fetchRecords();
      fetchAuditEvents();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to connect ABHA', 'error');
    } finally {
      setIsConnectingAbha(false);
    }
  };

  // ── Handle "Disconnect ABHA" ──────────────────────────────────────────────
  const handleDisconnectAbha = async () => {
    if (!window.confirm('Are you sure you want to disconnect your ABHA account from PFIS?')) {
      return;
    }

    try {
      await publicHealthService.disconnectAbha();
      showToast('ABHA connection removed', 'info');
      fetchRecords();
      fetchAuditEvents();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to disconnect ABHA', 'error');
    }
  };

  // ── Handle "Export FHIR JSON" ─────────────────────────────────────────────
  const handleDownloadFHIR = async () => {
    if (records.length === 0) {
      showToast('Nothing available to export.', 'info');
      return;
    }

    try {
      setIsExporting(true);
      const blob = await publicHealthService.exportFhirJson();
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      const cleanId = (abha.abhaNumber || user?.id || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `PFIS_FHIR_R4_Bundle_${cleanId}_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast('Official FHIR R4 Bundle downloaded successfully', 'success');
      fetchAuditEvents();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Nothing available to export.';
      showToast(msg, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // ── Handle Consent Toggle ─────────────────────────────────────────────────
  const handleToggleConsent = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'revoked' : 'active';
    try {
      await publicHealthService.toggleHealthRecordConsent(id, newStatus);
      showToast(`Access consent ${newStatus === 'active' ? 'granted' : 'revoked'}`, 'success');
      fetchConsents();
      fetchAuditEvents();
    } catch (err: any) {
      showToast('Failed to update consent status', 'error');
    }
  };

  // Determine Patient Profile Attributes
  const displayName = abha.name || user?.name || 'Patient';
  const displayAge = profile?.age ? `${profile.age} Years` : 'Age not specified';
  const displayGender = profile?.gender ? profile.gender.toUpperCase() : (abha.gender || 'Not specified');
  const displayState = profile?.location?.state || abha.state || 'Maharashtra';
  const isAbhaConnected = abha.status === 'connected' || abha.status === 'verified' || abha.status === 'pending';

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-12">
      {/* ── 1. Header Banner ──────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-900/40">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              <span>ABDM Public Health Network • Longitudinal Health Records & ABHA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Health Records & ABHA
            </h1>
            <p className="text-blue-100/90 text-sm max-w-2xl leading-relaxed">
              Your consolidated health record timeline connecting consultations across Sub-Centres, PHCs, and District Facilities. Controlled by your consent and backed by official health data standards.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={handleDownloadFHIR}
              disabled={isExporting}
              id="export-fhir-button"
              className="px-4 py-2.5 rounded-xl bg-blue-500/30 hover:bg-blue-500/40 border border-blue-400/40 text-white font-bold text-xs shadow flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Export FHIR JSON'}</span>
            </button>
            <button
              onClick={() => setIsNewRecordModalOpen(true)}
              id="add-visit-entry-button"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Visit Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. ABHA Digital Identity Card ─────────────────────────────────── */}
      <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative overflow-hidden border ${
        isAbhaConnected
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-700/60'
          : 'bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/70 border-slate-800'
      }`}>
        <div className="space-y-3 z-10 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>Ayushman Bharat Health Account (ABHA)</span>
            </div>

            {isAbhaConnected ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {abha.verificationStatus || 'Connected'}
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 border border-amber-400/30 text-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                ABHA not connected
              </span>
            )}
          </div>

          {/* ABHA Identifier Display */}
          {isAbhaConnected ? (
            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-mono font-black tracking-wider text-indigo-100">
                {abha.abhaNumber || abha.abhaAddress}
              </h2>
              {abha.abhaNumber && abha.abhaAddress && (
                <p className="text-xs text-indigo-300/80 font-mono">
                  Address: {abha.abhaAddress}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-300">
                No ABHA account linked
              </h2>
              <p className="text-xs text-slate-400 max-w-md">
                Connect your 14-digit ABHA Number or ABHA address to securely link your health records across public facilities.
              </p>
            </div>
          )}

          {/* Patient Profile Attributes from Authenticated Session */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-indigo-200/90 pt-1">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Name: <strong>{displayName}</strong></span>
            </span>
            <span>DOB / Age: <strong>{displayAge}</strong></span>
            <span>Gender: <strong>{displayGender}</strong></span>
            <span>State: <strong>{displayState}</strong></span>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {isAbhaConnected ? (
              <button
                onClick={handleDisconnectAbha}
                className="text-xs text-rose-300 hover:text-rose-200 underline font-medium cursor-pointer"
              >
                Disconnect ABHA
              </button>
            ) : (
              <button
                onClick={() => setIsConnectAbhaModalOpen(true)}
                id="connect-abha-button"
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Connect ABHA</span>
              </button>
            )}
          </div>
        </div>

        {/* QR Code Container — Honest Non-Mock Handling */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg shrink-0 flex flex-col items-center justify-center gap-2 z-10 text-slate-900 dark:text-white min-w-[160px] border border-slate-200 dark:border-slate-700">
          {abha.qrAvailable && abha.qrData ? (
            <>
              {/* If official QR data exists from real ABDM */}
              <QrCode className="w-20 h-20 text-slate-800 dark:text-slate-200" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Official ABDM QR
              </span>
            </>
          ) : (
            <>
              {/* Honest message per Rule 3 — no fake/decorative QR code */}
              <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                <Lock className="w-6 h-6 mb-1 text-slate-400" />
                <span className="text-[9px] font-semibold leading-tight">ABHA QR unavailable</span>
              </div>
              <span className="text-[10px] text-center font-medium text-slate-500 dark:text-slate-400 max-w-[140px] leading-tight">
                {isAbhaConnected ? 'Official QR pending gateway sync' : 'Link ABHA to enable QR'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── 3. Navigation Tabs (Timeline, Consent, Audit) ────────────────── */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'timeline'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Record Timeline ({records.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('consents')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'consents'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Access & Consent ({consents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Security Audit Trail ({auditEvents.length})</span>
        </button>
      </div>

      {/* ── TAB 1: RECORD TIMELINE ────────────────────────────────────────── */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <span>Chronological Care History ({records.length} Records)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every record displays its authentic origin and verification status.
              </p>
            </div>

            {/* Honest Synchronization Indicator */}
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 font-medium ${
                syncStatus === 'synchronized'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                {syncStatus === 'synchronized'
                  ? `Last synchronized: ${abha.lastSyncTime ? new Date(abha.lastSyncTime).toLocaleDateString() : 'Active'}`
                  : 'Not synchronized across external grid'}
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
              Loading your chronological health records...
            </div>
          ) : records.length === 0 ? (
            /* ── Honest Empty State (Per Spec Section 20) ─────────────────── */
            <div className="py-12 px-4 text-center space-y-4 max-w-md mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                <FileText className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  No health records available yet.
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your consultations, health summaries, and diagnostic reports will appear here in chronological order. Add your first visit entry or link an ABHA account.
                </p>
              </div>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setIsNewRecordModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Visit Entry</span>
                </button>
                {!isAbhaConnected && (
                  <button
                    onClick={() => setIsConnectAbhaModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Connect ABHA</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ── Real Records Timeline ────────────────────────────────────── */
            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-indigo-200 dark:before:bg-indigo-900">
              {records.map((rec, idx) => {
                let vitals: any = null;
                let prescription: any = null;
                try { if (rec.vitals_json) vitals = JSON.parse(rec.vitals_json); } catch {}
                try { if (rec.prescription_json) prescription = JSON.parse(rec.prescription_json); } catch {}

                const isPatientEntered = rec.record_source === 'patient_entered';
                const isHospitalVerified = rec.record_source === 'hospital_verified';
                const isPatientUploaded = rec.record_source === 'patient_uploaded';

                return (
                  <div key={rec.id || idx} className="relative group">
                    {/* Node Dot */}
                    <div className={`absolute -left-6 sm:-left-8 top-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full ring-4 flex items-center justify-center text-white text-[10px] ${
                      isHospitalVerified
                        ? 'bg-emerald-600 ring-emerald-100 dark:ring-emerald-950'
                        : isPatientEntered
                        ? 'bg-amber-600 ring-amber-100 dark:ring-amber-950'
                        : 'bg-indigo-600 ring-indigo-100 dark:ring-indigo-950'
                    }`} />

                    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all space-y-4">
                      {/* Entry Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 uppercase">
                              {rec.record_type}
                            </span>

                            {/* Provenance Badge — Clear Distinction */}
                            {isHospitalVerified && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Verified healthcare-provider record
                              </span>
                            )}
                            {isPatientEntered && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                Patient-entered record
                              </span>
                            )}
                            {isPatientUploaded && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                Patient uploaded document
                              </span>
                            )}

                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {rec.record_date}
                            </span>
                          </div>

                          <h4 className="font-bold text-base text-slate-900 dark:text-white pt-1">
                            {rec.diagnosis}
                          </h4>
                        </div>

                        <div className="text-xs text-slate-500 sm:text-right shrink-0">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                            {rec.doctor_name}
                          </span>
                          <span className="flex items-center sm:justify-end gap-1 mt-0.5 text-slate-500">
                            <Building2 className="w-3 h-3 text-indigo-500" /> {rec.facility_name}
                          </span>
                        </div>
                      </div>

                      {/* Vitals */}
                      {vitals && typeof vitals === 'object' && Object.keys(vitals).length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {Object.entries(vitals).map(([k, v]) => (
                            <span
                              key={k}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-2xs"
                            >
                              <Activity className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                              <span className="uppercase text-slate-400 font-bold">{k}:</span>
                              <strong className="text-slate-900 dark:text-white">{String(v)}</strong>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Prescriptions */}
                      {prescription && Array.isArray(prescription) && prescription.length > 0 && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                          <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                            <Pill className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            Prescribed Medications
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {prescription.map((m: any, pIdx: number) => (
                              <div
                                key={pIdx}
                                className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                              >
                                <strong className="text-slate-900 dark:text-white block">{m.name}</strong>
                                <span className="text-slate-500 text-[11px]">{m.dosage} • {m.duration}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes / Advice */}
                      {rec.notes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                          <strong>Clinical Advice & Notes:</strong> {rec.notes}
                        </p>
                      )}

                      {/* Source Footnote */}
                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800">
                        <span>Source: <strong>{rec.record_source}</strong></span>
                        {rec.created_at && (
                          <span>Recorded on: {new Date(rec.created_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: ACCESS & CONSENT ───────────────────────────────────────── */}
      {activeTab === 'consents' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Health Record Access & Consent Control</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Under ABDM patient privacy principles, external healthcare providers and emergency services can only access your protected records if you have granted active consent.
            </p>
          </div>

          <div className="space-y-3">
            {consents.length === 0 ? (
              <p className="text-sm text-slate-500">No active consent requests.</p>
            ) : (
              consents.map((c) => {
                const isActive = c.status === 'active';
                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-sm text-slate-900 dark:text-white">{c.requester_name}</strong>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Scope: <code className="bg-slate-200/60 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">{c.data_scope}</code>
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleConsent(c.id, c.status)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        isActive
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow'
                      }`}
                    >
                      {isActive ? 'Revoke Consent' : 'Grant Consent'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: SECURITY AUDIT TRAIL ───────────────────────────────────── */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <span>Record Access & Security Audit Trail</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Immutable log of every time your health records were accessed, modified, or exported.
            </p>
          </div>

          {auditEvents.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No audit events recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Event</th>
                    <th className="py-2.5 px-3">Actor</th>
                    <th className="py-2.5 px-3">Result</th>
                    <th className="py-2.5 px-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                        {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
                          {evt.event_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {evt.actor_name} ({evt.actor_role})
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evt.result === 'SUCCESS' || evt.result === 'ALLOWED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {evt.result}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        {evt.notes || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: ADD VISIT ENTRY ────────────────────────────────────────── */}
      {isNewRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Add Health Record Entry
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record a consultation, follow-up, or diagnostic report.
                </p>
              </div>
              <button
                onClick={() => setIsNewRecordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Prominent Provenance Disclaimer (Per Spec Rule 12) */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Provenance Notice:</strong> This entry will be saved in your records with the clear label <strong>Patient-entered record</strong>. It will not be represented as hospital-verified.
              </p>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4 text-xs">
              {/* Healthcare Facility */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Healthcare Facility *
                </label>
                <select
                  value={selectedFacilityName}
                  onChange={(e) => setSelectedFacilityName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  <option value="">Select healthcare facility...</option>
                  {hospitals.map((h) => {
                    const hid = h._id || '';
                    return (
                      <option key={hid} value={h.name}>
                        {h.name} ({h.type || 'Facility'})
                      </option>
                    );
                  })}
                  <option value="other">+ Enter another facility name manually</option>
                </select>

                {selectedFacilityName === 'other' && (
                  <input
                    type="text"
                    value={customFacilityName}
                    onChange={(e) => setCustomFacilityName(e.target.value)}
                    placeholder="Enter full facility name..."
                    className="mt-2 w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                )}
              </div>

              {/* Record Type & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Visit / Record Type *
                  </label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  >
                    <option value="OPD Consultation">OPD Consultation</option>
                    <option value="Follow-up Visit">Follow-up Visit</option>
                    <option value="Diagnostic Report">Diagnostic Report</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Immunization">Immunization</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Visit *
                  </label>
                  <input
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              {/* Doctor Name */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Doctor / Provider Name (Optional)
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="e.g. Dr. R. Verma, MBBS (Leave blank if unknown)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Visit Summary / Diagnosis */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Diagnosis / Visit Summary *
                </label>
                <textarea
                  rows={2}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Describe health concern, diagnosis, or reason for this visit..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  required
                />
              </div>

              {/* Optional Vitals */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    BP (Optional)
                  </label>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    placeholder="120/80"
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Pulse (Optional)
                  </label>
                  <input
                    type="text"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    placeholder="72 bpm"
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    SpO2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    placeholder="98%"
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-xs"
                  />
                </div>
              </div>

              {/* Advice / Notes */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Doctor Advice / Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Medications advised, lifestyle changes, follow-up instructions..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEntry}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEntry ? 'Saving...' : 'Save Visit Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CONNECT ABHA ───────────────────────────────────────────── */}
      {isConnectAbhaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Connect ABHA Account
                </h3>
              </div>
              <button
                onClick={() => setIsConnectAbhaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
              <strong>Official ABDM Notice:</strong> Enter your verified 14-digit ABHA Number or ABHA Address. The connection will be linked to your authenticated patient profile.
            </div>

            <form onSubmit={handleConnectAbha} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  14-Digit ABHA Number
                </label>
                <input
                  type="text"
                  value={inputAbhaNumber}
                  onChange={(e) => setInputAbhaNumber(e.target.value)}
                  placeholder="e.g. 14-1234-5678-9012"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 dark:border-slate-700 w-full"></div>
                <span className="bg-white dark:bg-slate-900 px-2 text-[10px] text-slate-400 font-bold uppercase">
                  OR
                </span>
                <div className="border-t border-slate-200 dark:border-slate-700 w-full"></div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  ABHA Address (e.g. username@abdm)
                </label>
                <input
                  type="text"
                  value={inputAbhaAddress}
                  onChange={(e) => setInputAbhaAddress(e.target.value)}
                  placeholder="yourname@abdm"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConnectAbhaModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConnectingAbha}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isConnectingAbha ? 'Connecting...' : 'Link ABHA Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
