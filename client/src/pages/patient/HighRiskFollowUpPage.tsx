import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { publicHealthService, HighRiskPatient, HighRiskAuditEvent } from '../../services/publicHealthService';
import { useToast } from '../../context/ToastContext';
import {
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Plus,
  RefreshCw,
  ShieldAlert,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  History,
  XCircle,
  Lock,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type HighRiskStatus = 'Active' | 'Overdue' | 'Completed' | 'Escalated' | 'Missed' | 'Referred';

const STATUS_META: Record<string, { label: string; classes: string; pulse?: boolean }> = {
  Active:    { label: 'Active',             classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  Overdue:   { label: 'Follow-Up Overdue',  classes: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300', pulse: true },
  Completed: { label: 'Follow-Up Completed',classes: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  Escalated: { label: 'Escalated',          classes: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  Missed:    { label: 'Missed',             classes: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300' },
  Referred:  { label: 'Referred',           classes: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
};

function getStatusMeta(status: string) {
  return STATUS_META[status] || { label: status, classes: 'bg-slate-100 text-slate-600' };
}

const COHORT_TABS = ['All', 'Maternal (HRP)', 'Child (Immunization)', 'Chronic NCD', 'Tuberculosis'];

const STAFF_ROLES = ['hospital', 'admin', 'doctor', 'asha_worker', 'government'];
const WRITE_ROLES = ['hospital', 'admin', 'doctor'];

// ─── Sub-components ────────────────────────────────────────────────────────────

interface AuditPanelProps {
  caseId: string;
}

const AuditPanel: React.FC<AuditPanelProps> = ({ caseId }) => {
  const [events, setEvents] = useState<HighRiskAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    publicHealthService
      .getHighRiskAuditEvents(caseId)
      .then((data) => { if (!cancelled) setEvents(data); })
      .catch((err) => { if (!cancelled) setError(err?.response?.data?.message || err.message || 'Failed to load audit log.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [caseId]);

  if (loading) {
    return <p className="text-xs text-slate-400 italic py-2">Loading audit log…</p>;
  }
  if (error) {
    return <p className="text-xs text-rose-500 py-2">{error}</p>;
  }
  if (events.length === 0) {
    return <p className="text-xs text-slate-400 italic py-2">No audit events recorded yet.</p>;
  }
  return (
    <ol className="relative border-l border-slate-200 dark:border-slate-700 ml-2 space-y-3">
      {events.map((ev) => (
        <li key={ev.id} className="ml-4">
          <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 bg-rose-500" />
          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
            {ev.action.replace(/_/g, ' ')}
            {ev.previous_status && ev.new_status && (
              <span className="font-normal text-slate-500"> — {ev.previous_status} → {ev.new_status}</span>
            )}
          </p>
          <p className="text-[10px] text-slate-400">
            {ev.actor_name || 'Unknown'} ({ev.actor_role || '—'}) · {new Date(ev.timestamp).toLocaleString('en-IN')}
          </p>
          {ev.notes && <p className="text-[10px] text-slate-500 italic">{ev.notes}</p>}
        </li>
      ))}
    </ol>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────

export const HighRiskFollowUpPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const isStaff   = STAFF_ROLES.includes(user?.role || '');
  const canWrite  = WRITE_ROLES.includes(user?.role || '');

  const [patients, setPatients]         = useState<HighRiskPatient[]>([]);
  const [selectedCohort, setSelectedCohort] = useState('All');
  const [isLoading, setIsLoading]       = useState(true);
  const [fetchError, setFetchError]     = useState<string | null>(null);

  // Expanded audit panel per card
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null);
  // Modal
  const [isModalOpen, setIsModalOpen]   = useState(false);
  // Status-update loading per card
  const [updatingId, setUpdatingId]     = useState<string | null>(null);

  // Registration form state
  const [formPatientId, setFormPatientId]       = useState('');
  const [formPatientName, setFormPatientName]   = useState('');
  const [formCohortType, setFormCohortType]     = useState('Maternal (HRP)');
  const [formRiskLevel, setFormRiskLevel]       = useState('High Risk');
  const [formCondition, setFormCondition]       = useState('');
  const [formMilestone, setFormMilestone]       = useState('');
  const [formDueDate, setFormDueDate]           = useState('');
  const [formAshaName, setFormAshaName]         = useState('');
  const [formNotes, setFormNotes]               = useState('');
  const [isSubmitting, setIsSubmitting]         = useState(false);

  const fetchPatients = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      setFetchError(null);
      const cohortParam = selectedCohort === 'All' ? undefined : selectedCohort;
      const data = await publicHealthService.getHighRiskRegistry({ cohort: cohortParam });
      setPatients(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Failed to load follow-up records.';
      setFetchError(msg);
      if (err?.response?.status !== 401) {
        showToast(msg, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedCohort]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleMarkStatus = async (patient: HighRiskPatient, newStatus: string, notes?: string) => {
    try {
      setUpdatingId(patient.id);
      await publicHealthService.updateHighRiskStatus(patient.id, newStatus, notes);
      showToast(`Follow-up status updated to "${newStatus}".`, 'success');
      fetchPatients();
    } catch (err: any) {
      showToast(err?.response?.data?.message || err.message || 'Failed to update status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await publicHealthService.createHighRiskEntry({
        patientId:        formPatientId.trim(),
        patientName:      formPatientName.trim(),
        cohortType:       formCohortType,
        riskLevel:        formRiskLevel,
        primaryCondition: formCondition.trim(),
        currentMilestone: formMilestone.trim(),
        nextDueDate:      formDueDate,
        assignedAshaName: formAshaName.trim() || undefined,
        followUpNotes:    formNotes.trim() || undefined,
      });
      showToast('Follow-up case registered successfully.', 'success');
      setIsModalOpen(false);
      // Reset form
      setFormPatientId(''); setFormPatientName(''); setFormCondition('');
      setFormMilestone(''); setFormDueDate(''); setFormAshaName(''); setFormNotes('');
      setFormCohortType('Maternal (HRP)'); setFormRiskLevel('High Risk');
      fetchPatients();
    } catch (err: any) {
      showToast(err?.response?.data?.message || err.message || 'Failed to register follow-up case.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── UI helpers ────────────────────────────────────────────────────────────

  const renderEmptyState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center px-6">
      <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        {isStaff
          ? `No follow-up cases found${selectedCohort !== 'All' ? ` in the "${selectedCohort}" cohort` : ''}.`
          : 'No active follow-up cases found for your account.'}
      </p>
      {!isStaff && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
          If you expect to see follow-up records, please contact your healthcare provider.
        </p>
      )}
      {isStaff && canWrite && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Register a Case
        </button>
      )}
    </div>
  );

  const renderErrorState = () => (
    <div className="col-span-full flex flex-col items-center justify-center py-14 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900 text-center px-6">
      <XCircle className="w-10 h-10 text-rose-400 mb-3" />
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Follow-up information could not be loaded.</p>
      <p className="text-xs text-slate-400 mt-1">{fetchError}</p>
      <button
        onClick={fetchPatients}
        className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Retry
      </button>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">

      {/* ── Header Banner ── */}
      <div className="bg-gradient-to-r from-rose-800 via-red-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-200 text-xs font-semibold uppercase tracking-wider">
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Public Health Follow-Up Coordination</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              High-Risk Care & Doorstep Follow-Up
            </h1>
            <p className="text-rose-100/80 text-sm max-w-2xl leading-relaxed">
              Track authorised follow-ups and help reduce missed care through timely coordination for{' '}
              <strong>High-Risk Pregnancies (ANC)</strong>, <strong>Child Immunization Schedules</strong>, and{' '}
              <strong>Chronic Diseases (Hypertension, Diabetes, TB)</strong>.
            </p>
            {!isStaff && (
              <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-1 bg-slate-800/40 rounded-lg text-xs text-rose-200 border border-rose-700/30">
                <Lock className="w-3 h-3" />
                <span>Showing your own follow-up records only</span>
              </div>
            )}
          </div>

          {canWrite && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="self-start sm:self-auto px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Follow-Up Case</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Cohort Tabs + Refresh ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {COHORT_TABS.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCohort(c)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCohort === c
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {c}
          </button>
        ))}
        <button
          onClick={fetchPatients}
          disabled={isLoading}
          className="ml-auto p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all cursor-pointer disabled:opacity-40"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* ── Patient Cards Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-slate-400 text-sm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading follow-up records…
          </div>
        ) : fetchError ? (
          renderErrorState()
        ) : patients.length === 0 ? (
          renderEmptyState()
        ) : (
          patients.map((p) => {
            const meta      = getStatusMeta(p.status);
            const isOverdue = p.status === 'Overdue';
            const isDone    = p.status === 'Completed';
            const auditing  = expandedAudit === p.id;
            const isUpdating = updatingId === p.id;

            return (
              <div
                key={p.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                  isOverdue
                    ? 'border-rose-400 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Card header */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {p.cohort_type}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${meta.classes} ${meta.pulse ? 'animate-pulse' : ''}`}
                    >
                      {isOverdue && <AlertTriangle className="w-3 h-3" />}
                      {isDone && <CheckCircle2 className="w-3 h-3" />}
                      {meta.label}
                    </span>
                  </div>

                  {/* Patient name — shown to staff; redacted label for patient-self view if looking at others */}
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    {isStaff ? p.patient_name : 'Your Follow-Up Record'}
                  </h3>

                  {/* Primary condition — always labeled as provider-recorded, shown to staff */}
                  {isStaff && p.primary_condition && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1">
                      <span className="text-slate-400 font-normal">Provider-recorded condition: </span>
                      {p.primary_condition}
                    </p>
                  )}

                  {/* Milestone block */}
                  {p.current_milestone && (
                    <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Target Milestone / Scheduled Intervention
                      </span>
                      <strong className="text-slate-900 dark:text-white block">{p.current_milestone}</strong>
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Due: <strong className="text-slate-700 dark:text-slate-300">{p.next_due_date}</strong>
                      </span>
                    </div>
                  )}

                  {/* Notes */}
                  {p.follow_up_notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 italic border-l-2 border-slate-200 dark:border-slate-700 pl-2">
                      {p.follow_up_notes}
                    </p>
                  )}
                </div>

                {/* Card footer */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    {p.assigned_asha_name && (
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-rose-600" />
                        Assigned: <strong>{p.assigned_asha_name}</strong>
                      </span>
                    )}

                    {/* Action buttons — staff only */}
                    {isStaff && !isDone && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          disabled={isUpdating}
                          onClick={() => handleMarkStatus(p, 'Completed', 'Follow-up visit confirmed by staff.')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isUpdating ? 'Saving…' : 'Log Doorstep Check'}</span>
                        </button>
                        {!isOverdue && (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleMarkStatus(p, 'Overdue', 'Manually flagged as overdue by staff.')}
                            className="px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            Mark Overdue
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Audit trail toggle — staff only */}
                  {isStaff && (
                    <button
                      onClick={() => setExpandedAudit(auditing ? null : p.id)}
                      className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer mt-1"
                    >
                      <History className="w-3 h-3" />
                      {auditing ? 'Hide' : 'View'} audit trail
                      {auditing ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}

                  {auditing && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <AuditPanel caseId={p.id} />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Registration Modal — hospital/admin/doctor only ── */}
      {isModalOpen && canWrite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Register Follow-Up Case
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                This form registers a follow-up coordination case. Clinical diagnoses and treatment decisions must be made by licensed healthcare professionals through authorised systems.
              </span>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-4 text-xs">
              {/* Patient ID */}
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Patient User ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="System user ID of the patient being enrolled"
                  value={formPatientId}
                  onChange={(e) => setFormPatientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  required
                />
                <p className="mt-1 text-[10px] text-slate-400">The unique system ID associated with the patient's account.</p>
              </div>

              {/* Patient Name */}
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Patient / Beneficiary Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Full name as recorded in health records"
                  value={formPatientName}
                  onChange={(e) => setFormPatientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  required
                />
              </div>

              {/* Cohort + Risk Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Follow-Up Cohort
                  </label>
                  <select
                    value={formCohortType}
                    onChange={(e) => setFormCohortType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="Maternal (HRP)">Maternal (HRP – High Risk)</option>
                    <option value="Child (Immunization)">Child (National Immunization)</option>
                    <option value="Chronic NCD (Hypertension)">Chronic NCD (Hypertension)</option>
                    <option value="Chronic NCD (Diabetes)">Chronic NCD (Diabetes)</option>
                    <option value="Tuberculosis (DOTS)">Tuberculosis (DOTS)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Risk Severity
                  </label>
                  <select
                    value={formRiskLevel}
                    onChange={(e) => setFormRiskLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="High Risk">High Risk</option>
                    <option value="Critical">Critical</option>
                    <option value="Moderate Risk">Moderate Risk</option>
                  </select>
                </div>
              </div>

              {/* Clinical condition (provider input) */}
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Provider-Recorded Condition <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="As documented in clinical records (e.g. gestational anemia, pulmonary TB)"
                  value={formCondition}
                  onChange={(e) => setFormCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  required
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  This must reflect a documented diagnosis from an authorised health provider. Not a self-assessment.
                </p>
              </div>

              {/* Milestone + Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Follow-Up Milestone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4th ANC visit, OPV-3 immunization"
                    value={formMilestone}
                    onChange={(e) => setFormMilestone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Follow-Up Due Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    required
                  />
                </div>
              </div>

              {/* ASHA worker */}
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Assigned ASHA / Frontline Worker (optional)
                </label>
                <input
                  type="text"
                  placeholder="Name of assigned community health worker"
                  value={formAshaName}
                  onChange={(e) => setFormAshaName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Follow-Up Coordination Notes (optional)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Logistics, access barriers, transport arrangements, caregiver instructions…"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering…' : 'Register Follow-Up Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
