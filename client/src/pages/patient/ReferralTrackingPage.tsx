import React, { useState, useEffect, useCallback, useRef } from 'react';
import { publicHealthService, Referral, ReferralEvent, ReferralCreateInput } from '../../services/publicHealthService';
import { hospitalService } from '../../services/hospitalService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Hospital } from '../../types';
import {
  GitFork,
  Plus,
  CheckCircle2,
  Clock,
  Building2,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  X,
  FileText,
  Printer,
  ChevronRight,
  Loader2,
  BadgeCheck,
  MapPin,
  Phone,
  Info,
  Search,
  Calendar,
} from 'lucide-react';

// ─── 9-Stage referral lifecycle ────────────────────────────────────────────────
const LIFECYCLE_STAGES = [
  { key: 'SUBMITTED',   label: 'Submitted',    desc: 'Referral submitted by patient' },
  { key: 'SENT',        label: 'Sent',         desc: 'Sent to receiving facility' },
  { key: 'RECEIVED',    label: 'Received',     desc: 'Received by facility' },
  { key: 'ACCEPTED',    label: 'Accepted',     desc: 'Accepted by facility staff' },
  { key: 'IN_PROGRESS', label: 'In Progress',  desc: 'Being processed at facility' },
  { key: 'COMPLETED',   label: 'Completed',    desc: 'Service completed' },
  { key: 'CLOSED',      label: 'Closed',       desc: 'Referral closed' },
];

const TERMINAL_STATUSES = ['COMPLETED', 'CLOSED', 'CANCELLED', 'EXPIRED', 'REJECTED'];
const REJECTED_CANCELLED = ['REJECTED', 'CANCELLED', 'EXPIRED'];

// Legacy status → new status mapping (for older DB records)
const legacyStatusMap: Record<string, string> = {
  'Initiated': 'SUBMITTED',
  'In Transit': 'SENT',
  'Arrived': 'RECEIVED',
  'Specialist Consulted': 'IN_PROGRESS',
  'Counter-Referred': 'IN_PROGRESS',
  'Completed': 'COMPLETED',
};

function normalizeStatus(status: string): string {
  return legacyStatusMap[status] || status;
}

function getStageIndex(status: string): number {
  const normalized = normalizeStatus(status);
  return LIFECYCLE_STAGES.findIndex(s => s.key === normalized);
}

function statusColor(status: string): string {
  const norm = normalizeStatus(status);
  if (norm === 'SUBMITTED') return 'text-sky-700 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-800';
  if (norm === 'SENT') return 'text-violet-700 bg-violet-50 dark:bg-violet-950/40 dark:text-violet-300 border-violet-200 dark:border-violet-800';
  if (norm === 'RECEIVED') return 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  if (norm === 'ACCEPTED') return 'text-teal-700 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-300 border-teal-200 dark:border-teal-800';
  if (norm === 'IN_PROGRESS') return 'text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
  if (norm === 'COMPLETED') return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  if (norm === 'CLOSED') return 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  if (norm === 'REJECTED') return 'text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
  if (norm === 'CANCELLED') return 'text-orange-700 bg-orange-50 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200 dark:border-orange-800';
  return 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return iso; }
}

function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

const SERVICE_OPTIONS = [
  'General healthcare visit',
  'Specialist appointment',
  'Diagnostic / Lab test',
  'Surgical consultation',
  'Maternal & child health',
  'Rehabilitation service',
  'Government scheme support',
  'Follow-up care',
  'Other',
];

// ─── Component ─────────────────────────────────────────────────────────────────
export const ReferralTrackingPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  // The patient's name comes exclusively from the authenticated profile/user
  const patientName: string =
    (profile?.full_name || profile?.name || user?.name || '').trim();

  // ── Referral list state ──────────────────────────────────────────────────────
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'closed'>('all');

  // ── Selected referral + events ───────────────────────────────────────────────
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [referralEvents, setReferralEvents] = useState<ReferralEvent[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // ── Create Referral modal state ──────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(false);
  const [hospitalSearch, setHospitalSearch] = useState('');

  // Form fields
  const [fromFacilityId, setFromFacilityId] = useState('');
  const [fromFacilityName, setFromFacilityName] = useState('');
  const [fromTier, setFromTier] = useState('');
  const [toFacilityId, setToFacilityId] = useState('');
  const [toFacilityName, setToFacilityName] = useState('');
  const [toTier, setToTier] = useState('');
  const [requestedService, setRequestedService] = useState('');
  const [reasonForReferral, setReasonForReferral] = useState('');
  const [priority, setPriority] = useState<'Routine' | 'Urgent' | 'Emergency'>('Routine');
  const [transportNotes, setTransportNotes] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdReferral, setCreatedReferral] = useState<Referral | null>(null);
  const submitLockRef = useRef(false);

  // ── Fetch referral list ──────────────────────────────────────────────────────
  const fetchReferrals = useCallback(async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      // Backend infers patient ID from JWT — no param needed for patient role
      const data = await publicHealthService.getReferrals();
      setReferrals(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Unable to load referrals.';
      setListError(msg);
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchReferrals(); }, [fetchReferrals]);

  // ── Fetch referral detail + events ───────────────────────────────────────────
  const fetchDetail = useCallback(async (id: string) => {
    setIsLoadingDetail(true);
    setSelectedReferral(null);
    setReferralEvents([]);
    try {
      const { referral, events } = await publicHealthService.getReferralById(id);
      setSelectedReferral(referral);
      setReferralEvents(events || []);
    } catch (err: any) {
      showToast('Could not load referral details.', 'error');
    } finally {
      setIsLoadingDetail(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (selectedId) fetchDetail(selectedId);
  }, [selectedId, fetchDetail]);

  // ── Load real hospitals for dropdown ────────────────────────────────────────
  const loadHospitals = useCallback(async (search = '') => {
    setHospitalsLoading(true);
    try {
      if (search.trim().length > 1) {
        const res = await hospitalService.search(search);
        setHospitals(res.hospitals || []);
      } else {
        const res = await hospitalService.getNearby({ radiusKm: 200 });
        setHospitals(res.hospitals || []);
      }
    } catch {
      setHospitals([]);
    } finally {
      setHospitalsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isModalOpen) loadHospitals(hospitalSearch);
  }, [isModalOpen, hospitalSearch, loadHospitals]);

  // ── Reset modal form ─────────────────────────────────────────────────────────
  const resetForm = () => {
    setFromFacilityId(''); setFromFacilityName(''); setFromTier('');
    setToFacilityId(''); setToFacilityName(''); setToTier('');
    setRequestedService(''); setReasonForReferral('');
    setPriority('Routine'); setTransportNotes(''); setAdditionalNotes('');
    setSubmitError(null); setCreatedReferral(null);
    setHospitalSearch('');
  };

  const openModal = () => { resetForm(); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); resetForm(); };

  // ── Create referral ──────────────────────────────────────────────────────────
  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current) return; // Prevent double-submission
    if (!fromFacilityName || !toFacilityName || !requestedService) {
      setSubmitError('Sending facility, receiving facility, and requested service are required.');
      return;
    }
    submitLockRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: ReferralCreateInput = {
        fromFacilityId: fromFacilityId || undefined,
        fromFacilityName,
        fromTier: fromTier || undefined,
        toFacilityId: toFacilityId || undefined,
        toFacilityName,
        toTier: toTier || undefined,
        requestedService,
        reasonForReferral: reasonForReferral.trim() || undefined,
        priority,
        transportNotes: transportNotes.trim() || undefined,
        additionalNotes: additionalNotes.trim() || undefined,
      };

      const created = await publicHealthService.createReferral(payload);
      setCreatedReferral(created);
      showToast(`Referral created successfully. ID: ${created.referral_code}`, 'success');
      await fetchReferrals();
      setSelectedId(created.id);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Referral could not be created. Please try again.';
      setSubmitError(msg);
      // Never show success when creation failed
    } finally {
      setIsSubmitting(false);
      submitLockRef.current = false;
    }
  };

  // ── Filter referrals ─────────────────────────────────────────────────────────
  const filteredReferrals = referrals.filter(ref => {
    const norm = normalizeStatus(ref.status);
    if (filterStatus === 'active') return !TERMINAL_STATUSES.includes(norm);
    if (filterStatus === 'completed') return norm === 'COMPLETED';
    if (filterStatus === 'closed') return ['CLOSED', 'CANCELLED', 'REJECTED', 'EXPIRED'].includes(norm);
    return true;
  });

  const activeCount = referrals.filter(r => !TERMINAL_STATUSES.includes(normalizeStatus(r.status))).length;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              <GitFork className="w-3.5 h-3.5" />
              <span>Referral Tracking Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Track Your Healthcare Referral
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-2xl leading-relaxed">
              Create and track your referral from the sending facility to the receiving facility.
            </p>
          </div>
          <button
            id="create-referral-btn"
            onClick={openModal}
            className="self-start sm:self-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Create Referral
          </button>
        </div>
      </div>

      {/* ── Main Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Left: Referral List ──────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-4">
          {/* List header */}
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Your Referrals
                {activeCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {activeCount} active
                  </span>
                )}
              </h2>
              {patientName && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Showing referrals for: <strong>{patientName}</strong>
                </p>
              )}
            </div>
            <button
              onClick={fetchReferrals}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Refresh referral list"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingList ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {(['all', 'active', 'completed', 'closed'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer capitalize ${
                  filterStatus === f
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* List body */}
          {isLoadingList ? (
            <div className="flex items-center justify-center p-10 gap-3 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading referrals...</span>
            </div>
          ) : listError ? (
            <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" /> Unable to load referrals
              </div>
              <p className="text-xs text-rose-600 dark:text-rose-400">{listError}</p>
              <button
                onClick={fetchReferrals}
                className="text-xs font-semibold text-rose-700 dark:text-rose-300 underline cursor-pointer"
              >
                Try again
              </button>
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
              <GitFork className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <div>
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                  {filterStatus === 'all' ? 'No active referrals found.' : `No ${filterStatus} referrals.`}
                </p>
                {filterStatus === 'all' && (
                  <p className="text-xs text-slate-400 mt-1">
                    Referrals you create will appear here. Only your own referrals are shown.
                  </p>
                )}
              </div>
              {filterStatus === 'all' && (
                <button
                  onClick={openModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Referral
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReferrals.map((ref) => {
                const norm = normalizeStatus(ref.status);
                const isSelected = selectedId === ref.id;
                const isTerminal = TERMINAL_STATUSES.includes(norm);
                return (
                  <div
                    key={ref.id}
                    id={`referral-card-${ref.id}`}
                    onClick={() => setSelectedId(ref.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                    {/* Referral code + priority */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-900/60 px-2 py-0.5 rounded tracking-wide">
                        {ref.referral_code}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                        ref.priority === 'Emergency' ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                        : ref.priority === 'Urgent' ? 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                        : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}>
                        {ref.priority}
                      </span>
                    </div>

                    {/* Requested service */}
                    <p className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {ref.specialty_required || 'Healthcare referral'}
                    </p>

                    {/* Facility pathway */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[110px]">{ref.from_facility_name}</span>
                      <ArrowRight className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="truncate max-w-[110px] text-slate-700 dark:text-slate-200 font-medium">{ref.to_facility_name}</span>
                    </div>

                    {/* Status + date */}
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(ref.status)}`}>
                        {norm.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(ref.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: Referral Detail ───────────────────────────────────── */}
        <div className="lg:col-span-7">
          {!selectedId ? (
            <div className="h-full min-h-[300px] bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-10 text-center space-y-3">
              <GitFork className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Select a referral from the list to view its details and status history.
              </p>
            </div>
          ) : isLoadingDetail ? (
            <div className="h-full min-h-[300px] flex items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">Loading referral details...</span>
            </div>
          ) : selectedReferral ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

              {/* Detail header */}
              <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-md">
                      {selectedReferral.referral_code}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${statusColor(selectedReferral.status)}`}>
                      {normalizeStatus(selectedReferral.status).replace('_', ' ')}
                    </span>
                    {selectedReferral.referral_code.startsWith('PFIS-REF-') && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        <BadgeCheck className="w-3 h-3" /> Verified Record
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    {selectedReferral.specialty_required || 'Healthcare Referral'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Patient: <strong className="text-slate-700 dark:text-slate-200">{selectedReferral.patient_name}</strong>
                    &ensp;·&ensp;Created: {formatDate(selectedReferral.created_at)}
                    &ensp;·&ensp;Last updated: {formatDate(selectedReferral.updated_at)}
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Slip
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-6">

                {/* 9-Stage Timeline Progress Bar */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Referral Status
                  </h3>
                  {REJECTED_CANCELLED.includes(normalizeStatus(selectedReferral.status)) ? (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-rose-800 dark:text-rose-300">
                          Referral {normalizeStatus(selectedReferral.status).toLowerCase()}
                        </p>
                        {selectedReferral.counter_referral_notes && (
                          <p className="text-xs text-rose-700 dark:text-rose-400 mt-0.5">{selectedReferral.counter_referral_notes}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${LIFECYCLE_STAGES.length}, 1fr)` }}>
                      {LIFECYCLE_STAGES.map((stage, idx) => {
                        const currentIdx = getStageIndex(selectedReferral.status);
                        const completed = idx < currentIdx;
                        const current = idx === currentIdx;
                        return (
                          <div key={stage.key} className="flex flex-col items-center text-center">
                            <div className={`w-full h-1.5 rounded-full mb-1.5 transition-all ${completed || current ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                              current ? 'bg-emerald-600 text-white ring-2 ring-emerald-200 dark:ring-emerald-900'
                              : completed ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                              {completed ? <CheckCircle2 className="w-3 h-3" /> : idx + 1}
                            </div>
                            <span className={`mt-1 text-[9px] font-semibold leading-tight ${current ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                              {stage.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Facility pathway */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sending Facility</span>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedReferral.from_facility_name}</p>
                    {selectedReferral.from_tier && selectedReferral.from_tier !== 'Not specified' && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {selectedReferral.from_tier}
                      </span>
                    )}
                  </div>
                  <div className="sm:border-l sm:border-slate-200 sm:dark:border-slate-700 sm:pl-4 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Receiving Facility</span>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedReferral.to_facility_name}</p>
                    {selectedReferral.to_tier && selectedReferral.to_tier !== 'Not specified' && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                        {selectedReferral.to_tier}
                      </span>
                    )}
                  </div>
                </div>

                {/* Requested service */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Requested Service</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    {selectedReferral.specialty_required || '—'}
                  </p>
                </div>

                {/* Transport / Access notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 font-medium block mb-1">Transport / Access Requirements</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      {selectedReferral.transport_mode && selectedReferral.transport_mode !== 'Not specified'
                        ? selectedReferral.transport_mode
                        : 'Transport information unavailable.'}
                    </span>
                  </div>
                  {selectedReferral.counter_referral_notes && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-400 font-medium block mb-1">Notes</span>
                      <span className="text-slate-700 dark:text-slate-200">{selectedReferral.counter_referral_notes}</span>
                    </div>
                  )}
                </div>

                {/* Referral Timeline (audit events from DB) */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> Referral Timeline
                  </h4>
                  {referralEvents.length === 0 ? (
                    <p className="text-xs text-slate-400 italic px-3 py-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                      No timeline events recorded yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {referralEvents.map((ev, idx) => {
                        const isLast = idx === referralEvents.length - 1;
                        return (
                          <div key={ev.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${isLast ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                              {idx < referralEvents.length - 1 && (
                                <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700 mt-1" />
                              )}
                            </div>
                            <div className="pb-3 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor(ev.new_status)}`}>
                                  {ev.new_status.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] text-slate-400">{formatDateTime(ev.timestamp)}</span>
                              </div>
                              {ev.actor_name && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  By: {ev.actor_name}
                                </p>
                              )}
                              {ev.reason && (
                                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 italic">{ev.reason}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Referral ID display (for reference at desk) */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Show this referral ID at the receiving facility registration desk:
                    <span className="ml-2 font-mono font-bold text-slate-900 dark:text-white text-sm">{selectedReferral.referral_code}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Create Referral Modal ──────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Create Referral</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select real facilities from the verified database
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Success state after creation */}
            {createdReferral ? (
              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex flex-col items-center text-center space-y-3 py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-slate-900 dark:text-white">Referral created successfully.</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your referral has been submitted and recorded in the database.</p>
                  </div>
                  <div className="px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Referral ID</p>
                    <p className="font-mono font-extrabold text-2xl text-emerald-700 dark:text-emerald-300 mt-1">{createdReferral.referral_code}</p>
                    <p className="text-[11px] text-slate-400 mt-1">Show this ID at the receiving facility registration desk</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all cursor-pointer"
                >
                  View in Referral List
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateReferral} className="p-6 sm:p-8 space-y-5">

                {/* Patient name — read-only from auth context */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <BadgeCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="text-xs">
                    <span className="text-slate-400">Referral for: </span>
                    <strong className="text-slate-800 dark:text-slate-200">{patientName || 'You (authenticated patient)'}</strong>
                    <span className="text-slate-400 ml-2">(from your account — cannot be changed)</span>
                  </div>
                </div>

                {/* Hospital search */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Search Facilities
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={hospitalSearch}
                      onChange={e => setHospitalSearch(e.target.value)}
                      placeholder="Search by hospital name or city..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                    {hospitalsLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />}
                  </div>
                </div>

                {/* Sending facility */}
                <div>
                  <label htmlFor="from-facility" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Sending Facility <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="from-facility"
                    value={fromFacilityId}
                    onChange={e => {
                    const hosp = hospitals.find(h => h._id === e.target.value);
                      setFromFacilityId(e.target.value);
                      setFromFacilityName(hosp?.name || '');
                      setFromTier(hosp?.type || '');
                    }}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  >
                    <option value="">— Select sending facility —</option>
                    {hospitals.map(h => {
                      const hid = h._id || '';
                      return (
                        <option key={hid} value={hid}>
                          {h.name} {h.city ? `— ${h.city}` : ''} {h.type ? `(${h.type})` : ''}
                        </option>
                      );
                    })}
                  </select>
                  {fromFacilityName && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Selected: {fromFacilityName}
                    </p>
                  )}
                  {!hospitalsLoading && hospitals.length === 0 && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                      No facilities found. Try a different search term.
                    </p>
                  )}
                </div>

                {/* Receiving facility */}
                <div>
                  <label htmlFor="to-facility" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Receiving Facility <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="to-facility"
                    value={toFacilityId}
                    onChange={e => {
                    const hosp = hospitals.find(h => h._id === e.target.value);
                      setToFacilityId(e.target.value);
                      setToFacilityName(hosp?.name || '');
                      setToTier(hosp?.type || '');
                    }}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  >
                    <option value="">— Select receiving facility —</option>
                    {hospitals
                      .filter(h => h._id !== fromFacilityId)
                      .map(h => {
                    const hid = h._id || '';
                        return (
                          <option key={hid} value={hid}>
                            {h.name} {h.city ? `— ${h.city}` : ''} {h.type ? `(${h.type})` : ''}
                          </option>
                        );
                      })}
                  </select>
                  {toFacilityName && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Selected: {toFacilityName}
                    </p>
                  )}
                </div>

                {/* Requested service */}
                <div>
                  <label htmlFor="requested-service" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Requested Service <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="requested-service"
                    value={requestedService}
                    onChange={e => setRequestedService(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                  >
                    <option value="">— Select requested service —</option>
                    {SERVICE_OPTIONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Referral category + additional reason */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="priority" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      Referral Category
                    </label>
                    <select
                      id="priority"
                      value={priority}
                      onChange={e => setPriority(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    >
                      <option value="Routine">Routine</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="transport-notes" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      Transport / Access Requirements
                    </label>
                    <input
                      id="transport-notes"
                      type="text"
                      value={transportNotes}
                      onChange={e => setTransportNotes(e.target.value)}
                      placeholder="Optional — e.g. wheelchair, escort needed"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Additional notes */}
                <div>
                  <label htmlFor="additional-notes" className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="additional-notes"
                    rows={2}
                    value={additionalNotes}
                    onChange={e => setAdditionalNotes(e.target.value)}
                    placeholder="Any additional permitted information for the referral..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>

                {/* Error */}
                {submitError && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    {submitError}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !fromFacilityName || !toFacilityName || !requestedService}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {isSubmitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                      : <><ChevronRight className="w-4 h-4" /> Submit Referral</>
                    }
                  </button>
                </div>

                <p className="text-[10px] text-slate-400 text-center">
                  Your referral will be submitted to the backend database and assigned a unique <strong>PFIS-REF-XXXXXX</strong> ID.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
