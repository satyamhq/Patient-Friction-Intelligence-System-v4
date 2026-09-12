import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  publicHealthService,
  FrontlineVisit,
  FrontlineTask,
  FrontlineMetrics,
  FrontlineAuditEvent,
  DoorstepRequest,
  frontlineOfflineManager,
} from '../../services/publicHealthService';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Phone,
  Plus,
  Wifi,
  WifiOff,
  Video,
  Activity,
  HeartHandshake,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  FileText,
  Send,
  Navigation,
  Check,
  UserCheck,
  AlertCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const NON_CLINICAL_BARRIERS = [
  'Transport unavailable',
  'Long travel distance',
  'Cost barrier',
  'Mobility / disability barrier',
  'Facility navigation problem',
  'Documentation / ID problem',
  'Appointment access problem',
  'Communication / language barrier',
];

export const FrontlineWorkerPortal: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const isPatient = user?.role === 'patient';

  // Worker Desk State
  const [metrics, setMetrics] = useState<FrontlineMetrics>({
    totalVisits: 0,
    pending: 0,
    completed: 0,
    overdue: 0,
    inProgress: 0,
    assignedTasks: 0,
  });
  const [visits, setVisits] = useState<FrontlineVisit[]>([]);
  const [tasks, setTasks] = useState<FrontlineTask[]>([]);
  const [auditEvents, setAuditEvents] = useState<FrontlineAuditEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'visits' | 'tasks' | 'audit'>('visits');
  const [visitFilter, setVisitFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Offline Sync State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlinePendingCount, setOfflinePendingCount] = useState(frontlineOfflineManager.getQueue().length);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(frontlineOfflineManager.getLastSyncTimestamp());
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals State (Worker)
  const [activeVisitForCompletion, setActiveVisitForCompletion] = useState<FrontlineVisit | null>(null);
  const [completionBarriers, setCompletionBarriers] = useState<string[]>([]);
  const [completionNotes, setCompletionNotes] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskBeneficiary, setNewTaskBeneficiary] = useState('');
  const [newTaskPhone, setNewTaskPhone] = useState('');
  const [newTaskVillage, setNewTaskVillage] = useState('Medha Valley, Satara');
  const [newTaskType, setNewTaskType] = useState('Household Visit');
  const [newTaskDue, setNewTaskDue] = useState('Tomorrow, 10:00 AM');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // Patient Desk State (Citizen Support)
  const [myRequests, setMyRequests] = useState<DoorstepRequest[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqArea, setReqArea] = useState('Medha Valley, Satara District');
  const [reqType, setReqType] = useState('Elderly Mobility / Vitals Check');
  const [reqPreferredDate, setReqPreferredDate] = useState('Tomorrow morning');
  const [reqBarrierDesc, setReqBarrierDesc] = useState('');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);

  // Fetch worker desk data
  const fetchWorkerData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [m, v, t, a] = await Promise.all([
        publicHealthService.getFrontlineMetrics().catch(() => ({
          totalVisits: 0,
          pending: 0,
          completed: 0,
          overdue: 0,
          inProgress: 0,
          assignedTasks: 0,
        })),
        publicHealthService.getFrontlineVisits({ status: visitFilter !== 'ALL' ? visitFilter : undefined }),
        publicHealthService.getFrontlineTasks(),
        publicHealthService.getFrontlineAuditEvents().catch(() => []),
      ]);
      setMetrics(m);
      setVisits(v);
      setTasks(t);
      setAuditEvents(a);
      setOfflinePendingCount(frontlineOfflineManager.getQueue().length);
      setLastSyncTime(frontlineOfflineManager.getLastSyncTimestamp());
    } catch (err: any) {
      if (isOnline) {
        showToast(err.message || 'Unable to load frontline records from backend.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [visitFilter, isOnline, showToast]);

  // Fetch patient requests
  const fetchPatientData = useCallback(async () => {
    try {
      setIsLoading(true);
      const reqs = await publicHealthService.getDoorstepRequests();
      setMyRequests(reqs);
    } catch (err: any) {
      showToast(err.message || 'Unable to load doorstep assistance requests.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isPatient) {
      fetchPatientData();
    } else {
      fetchWorkerData();
    }

    const handleOnline = () => {
      setIsOnline(true);
      handleSyncNow();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isPatient, fetchWorkerData, fetchPatientData]);

  // Trigger Offline / Online Sync
  const handleSyncNow = async () => {
    if (!navigator.onLine) {
      showToast('Cannot synchronize: device is currently offline.', 'warning');
      return;
    }
    setIsSyncing(true);
    try {
      const res = await frontlineOfflineManager.syncNow();
      setOfflinePendingCount(frontlineOfflineManager.getQueue().length);
      setLastSyncTime(res.serverTimestamp);
      if (res.syncedCount > 0) {
        showToast(`Synchronized ${res.syncedCount} queued field records to backend database!`, 'success');
        fetchWorkerData();
      } else {
        showToast('All field records are fully synchronized with server.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Sync failed. Your changes remain saved in local protected queue.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Start Visit Handler
  const handleStartVisit = async (v: FrontlineVisit) => {
    try {
      if (!isOnline) {
        frontlineOfflineManager.enqueue('START_VISIT', { visit_id: v.id });
        setOfflinePendingCount(frontlineOfflineManager.getQueue().length);
        setVisits(prev => prev.map(item => item.id === v.id ? { ...item, status: 'IN_PROGRESS', started_at: new Date().toISOString() } : item));
        showToast('Offline Mode: Visit marked IN_PROGRESS locally (queued for sync).', 'info');
        return;
      }
      const updated = await publicHealthService.startFrontlineVisit(v.id);
      showToast(`Visit started for ${v.patient_name}. Timestamp logged in audit trail.`, 'success');
      setVisits(prev => prev.map(item => item.id === v.id ? updated : item));
      setMetrics(prev => ({ ...prev, pending: Math.max(0, prev.pending - 1), inProgress: prev.inProgress + 1 }));
    } catch (err: any) {
      showToast(err.message || 'Failed to start visit.', 'error');
    }
  };

  // Complete Visit Handler
  const handleCompleteVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisitForCompletion) return;
    setIsCompleting(true);
    try {
      if (!isOnline) {
        frontlineOfflineManager.enqueue('COMPLETE_VISIT', {
          visit_id: activeVisitForCompletion.id,
          barriers: completionBarriers,
          notes: completionNotes,
        });
        setOfflinePendingCount(frontlineOfflineManager.getQueue().length);
        setVisits(prev => prev.map(item => item.id === activeVisitForCompletion.id ? {
          ...item,
          status: 'COMPLETED',
          accessibility_barriers: JSON.stringify(completionBarriers),
          completed_at: new Date().toISOString(),
        } : item));
        showToast('Offline Mode: Visit completion queued for sync.', 'info');
        setActiveVisitForCompletion(null);
        return;
      }

      const updated = await publicHealthService.completeFrontlineVisit(activeVisitForCompletion.id, {
        barriers: completionBarriers,
        notes: completionNotes,
      });
      showToast(`Doorstep visit for ${activeVisitForCompletion.patient_name} completed & audited!`, 'success');
      setVisits(prev => prev.map(item => item.id === activeVisitForCompletion.id ? updated : item));
      setMetrics(prev => ({ ...prev, inProgress: Math.max(0, prev.inProgress - 1), completed: prev.completed + 1 }));
      setActiveVisitForCompletion(null);
      setCompletionBarriers([]);
      setCompletionNotes('');
      fetchWorkerData();
    } catch (err: any) {
      showToast(err.message || 'Failed to complete visit.', 'error');
    } finally {
      setIsCompleting(false);
    }
  };

  // Create Task Handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const taskPayload = {
        village_name: newTaskVillage,
        beneficiary_name: newTaskBeneficiary,
        beneficiary_phone: newTaskPhone,
        task_type: newTaskType,
        due_date: newTaskDue,
        priority: newTaskPriority,
        notes: newTaskNotes,
      };

      if (!isOnline) {
        frontlineOfflineManager.enqueue('CREATE_TASK', taskPayload);
        setOfflinePendingCount(frontlineOfflineManager.getQueue().length);
        showToast('Offline Mode: Task queued locally for synchronization.', 'info');
        setIsNewTaskModalOpen(false);
        return;
      }

      await publicHealthService.createFrontlineTask(taskPayload);
      showToast('Household task logged in backend database & audit log!', 'success');
      setIsNewTaskModalOpen(false);
      setNewTaskBeneficiary('');
      setNewTaskPhone('');
      setNewTaskNotes('');
      fetchWorkerData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create task.', 'error');
    }
  };

  // Mark Task Complete
  const handleTaskStatusToggle = async (t: FrontlineTask) => {
    try {
      const nextStatus = t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await publicHealthService.updateFrontlineTaskStatus(t.id, nextStatus, 'Status updated from field portal');
      showToast(`Task marked ${nextStatus}.`, 'success');
      setTasks(prev => prev.map(item => item.id === t.id ? { ...item, status: nextStatus } : item));
    } catch (err: any) {
      showToast(err.message || 'Failed to update task status.', 'error');
    }
  };

  // Citizen Request Submission
  const handleCreateDoorstepRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReq(true);
    try {
      const req = await publicHealthService.createDoorstepRequest({
        village_or_area: reqArea,
        assistance_type: reqType,
        preferred_date: reqPreferredDate,
        barrier_description: reqBarrierDesc,
      });
      showToast('Doorstep assistance request submitted to your local ASHA desk!', 'success');
      setMyRequests(prev => [req, ...prev]);
      setIsRequestModalOpen(false);
      setReqBarrierDesc('');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit doorstep request.', 'error');
    } finally {
      setIsSubmittingReq(false);
    }
  };

  // =========================================================================
  // VIEW 1: CITIZEN / PATIENT DOORSTEP ASSISTANCE DESK (REQUIREMENT 39)
  // =========================================================================
  if (isPatient) {
    return (
      <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
        {/* Patient Header Banner */}
        <div className="bg-gradient-to-r from-teal-800 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>National Health Mission • Ayushman Arogya Mandir (AAM)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                ASHA Frontline Seva & Doorstep Support
              </h1>
              <p className="text-emerald-100/90 text-sm max-w-2xl leading-relaxed">
                Connect directly with your village <strong>ASHA worker (Accredited Social Health Activist)</strong> and local Sub-Centre for home vitals checks, maternal guidance, ABHA card assistance, and assisted teleconsultations.
              </p>
            </div>

            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Request Doorstep Visit</span>
            </button>
          </div>
        </div>

        {/* Non-clinical safety advisory */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong>Non-Clinical Operational Platform:</strong> ASHA Frontline Seva assists with non-clinical health navigation, travel/distance barriers, and routine doorstep checks. PFIS does not provide clinical diagnoses or prescriptions. For medical emergencies, call <strong>108 (Ambulance)</strong> immediately or visit your nearest Primary Health Centre (PHC).
          </div>
        </div>

        {/* Quick Links for Patient */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/patient/hospitals"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 transition-all flex items-center gap-4 group shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Find Nearby PHC & Sub-Centres</h4>
              <p className="text-xs text-slate-500 mt-0.5">Locate nearest public facility with travel directions</p>
            </div>
          </Link>

          <Link
            to="/patient/medicines"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 transition-all flex items-center gap-4 group shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Medicine Stock (e-Aushadhi)</h4>
              <p className="text-xs text-slate-500 mt-0.5">Check verified stock at PHC & Rural Hospitals</p>
            </div>
          </Link>

          <Link
            to="/patient/teleconsult"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-all flex items-center gap-4 group shadow-xs"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Assisted Teleconsultation</h4>
              <p className="text-xs text-slate-500 mt-0.5">Consult certified Medical Officer via video link</p>
            </div>
          </Link>
        </div>

        {/* Patient's Active Requests */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>My Doorstep Assistance Requests ({myRequests.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track status of home visits requested for your household
              </p>
            </div>
            <button
              onClick={fetchPatientData}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading your assistance requests...</div>
          ) : myRequests.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No household visits assigned today.</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Need doorstep assistance for an elderly family member, BP check, or ABHA verification? Click "Request Doorstep Visit" above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {req.assistance_type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        req.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{req.patient_name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {req.village_or_area}
                    </p>
                  </div>

                  {req.barrier_description && (
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Barrier noted: </span>
                      {req.barrier_description}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Preferred: {req.preferred_date || 'Earliest available'}</span>
                    <span>{req.assigned_worker_name ? `Assigned to: ${req.assigned_worker_name}` : 'Awaiting ASHA assignment'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal: Request Doorstep Assistance */}
        {isRequestModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Request Doorstep Assistance</h3>
                  <p className="text-xs text-slate-500">Your request will be routed to your assigned village ASHA</p>
                </div>
                <button
                  onClick={() => setIsRequestModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateDoorstepRequest} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Assistance Category
                  </label>
                  <select
                    value={reqType}
                    onChange={(e) => setReqType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="Elderly Mobility / Vitals Check">Elderly Mobility / Vitals Check (Doorstep BP)</option>
                    <option value="ABHA Card Assistance">ABHA Card Registration & Verification Assistance</option>
                    <option value="Maternal ANC Guidance">Maternal ANC Nutrition & Institutional Delivery Planning</option>
                    <option value="Medicine Delivery / Refill Verification">Essential Medicine Refill / Adherence Check</option>
                    <option value="Transportation Barrier Guidance">Transportation Friction Guidance (102 / 108)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Village / Hamlet / Landmark
                  </label>
                  <input
                    type="text"
                    value={reqArea}
                    onChange={(e) => setReqArea(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Visit Timeframe
                  </label>
                  <input
                    type="text"
                    value={reqPreferredDate}
                    onChange={(e) => setReqPreferredDate(e.target.value)}
                    placeholder="e.g. Tomorrow morning, between 9am - 12pm"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Non-Clinical Access Barrier (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={reqBarrierDesc}
                    onChange={(e) => setReqBarrierDesc(e.target.value)}
                    placeholder="Describe any travel, distance, cost, or mobility friction experienced..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReq}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingReq ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: AUTHORIZED FRONTLINE WORKER OPERATIONAL DESK (ASHA / ANM / CHO)
  // =========================================================================
  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Frontline Worker Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>National Health Mission • Frontline Worker Operational Workspace ({user?.role?.toUpperCase()})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Frontline Worker Desk & Doorstep Operations
            </h1>
            <p className="text-emerald-100/90 text-sm max-w-2xl leading-relaxed">
              Assigned Worker: <strong>{user?.name}</strong> • Role: <strong>{user?.role?.toUpperCase()}</strong> • Scope: <strong>Assigned Household Visits & Village Tasks Only</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Real Offline / Online Status Pill */}
            <div
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                !isOnline
                  ? 'bg-amber-500/20 border-amber-400/40 text-amber-200'
                  : offlinePendingCount > 0
                  ? 'bg-yellow-500/20 border-yellow-400/40 text-yellow-200'
                  : 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
              }`}
            >
              {!isOnline ? (
                <>
                  <WifiOff className="w-4 h-4 text-amber-300" />
                  <span>Offline Mode (Queue: {offlinePendingCount})</span>
                </>
              ) : offlinePendingCount > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4 text-yellow-300 animate-spin" />
                  <span>Sync Pending ({offlinePendingCount})</span>
                </>
              ) : (
                <>
                  <Wifi className="w-4 h-4 text-emerald-300" />
                  <span>Online Synchronized</span>
                </>
              )}
            </div>

            {/* Sync Now Button */}
            <button
              onClick={handleSyncNow}
              disabled={isSyncing || !isOnline}
              className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Trigger instant sync with server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>

            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Household Task</span>
            </button>
          </div>
        </div>

        {lastSyncTime && (
          <div className="mt-4 pt-3 border-t border-emerald-700/40 text-[11px] text-emerald-200/80 flex items-center justify-between">
            <span>Last synchronized: {new Date(lastSyncTime).toLocaleString()}</span>
            <span>Database: Real Persistent Backend (Zero Mock Records)</span>
          </div>
        )}
      </div>

      {/* Real Backend Generated Metrics Bar (Requirement 5) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Today's Visits</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics.totalVisits}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Assigned to you</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Pending</div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{metrics.pending}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Not yet started</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">In Progress</div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{metrics.inProgress}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active at doorstep</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Completed</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{metrics.completed}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Verified & audited</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Follow-up Tasks</div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{metrics.assignedTasks}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active reminders</div>
        </div>
      </div>

      {/* Non-clinical compliance alert banner (Requirements 1 & 10) */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong>Frontline Non-Clinical Operational Standard:</strong> ASHA workers log non-clinical access barriers (travel friction, out-of-pocket costs, language difficulties). PFIS must NOT independently diagnose, prescribe medication, or alter clinical treatment. If clinical intervention is required, route the patient via <strong>Assisted Teleconsultation</strong> or initiate a formal <strong>Tiered Referral</strong> to an authorized Medical Officer.
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('visits')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'visits'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Today's Household Visits ({visits.length})
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Household Tasks & Reminders ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Field Audit Trail ({auditEvents.length})
        </button>
      </div>

      {/* TAB 1: HOUSEHOLD VISITS */}
      {activeTab === 'visits' && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold">Filter:</span>
            {['ALL', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map(f => (
              <button
                key={f}
                onClick={() => setVisitFilter(f)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  visitFilter === f
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading assigned household visits...</div>
          ) : visits.length === 0 ? (
            <div className="py-16 text-center space-y-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No household visits assigned today.</h4>
              <p className="text-xs text-slate-500">You have completed all scheduled visits or none have been assigned to your worker ID.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visits.map(v => {
                let barriers: string[] = [];
                try {
                  barriers = v.accessibility_barriers ? JSON.parse(v.accessibility_barriers) : [];
                } catch {
                  barriers = [];
                }

                return (
                  <div
                    key={v.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                      v.status === 'COMPLETED'
                        ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'
                        : v.status === 'IN_PROGRESS'
                        ? 'bg-blue-50/30 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {v.visit_type}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            v.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : v.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800 animate-pulse'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {v.status}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {v.patient_name}
                      </h4>

                      <div className="text-xs text-slate-500 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{v.village_name} ({v.household_id})</span>
                        </div>
                        {v.facility_name && (
                          <div className="text-[11px] text-slate-400">
                            Attached Facility: {v.facility_name}
                          </div>
                        )}
                      </div>

                      {v.notes && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-xs text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">Instructions: </span>
                          {v.notes}
                        </div>
                      )}

                      {barriers.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-semibold text-slate-500">Reported Access Barriers:</span>
                          <div className="flex flex-wrap gap-1">
                            {barriers.map((b, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-medium"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Operational Action Workflow */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                      {v.status === 'ASSIGNED' || v.status === 'SCHEDULED' ? (
                        <button
                          onClick={() => handleStartVisit(v)}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Start Visit (Log In Progress)</span>
                        </button>
                      ) : v.status === 'IN_PROGRESS' ? (
                        <div className="space-y-2">
                          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Started: {v.started_at ? new Date(v.started_at).toLocaleTimeString() : 'Active'}</span>
                          </div>
                          <button
                            onClick={() => {
                              setActiveVisitForCompletion(v);
                              setCompletionBarriers(barriers);
                              setCompletionNotes('');
                            }}
                            className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Complete Visit & Log Barriers</span>
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Visit Completed ({v.completed_at ? new Date(v.completed_at).toLocaleTimeString() : 'Verified'})</span>
                        </div>
                      )}

                      {/* Quick Assisted Links */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        <Link
                          to="/patient/teleconsult"
                          className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-semibold hover:bg-slate-50 flex items-center justify-center gap-1 text-center"
                        >
                          <Video className="w-3 h-3 text-blue-500" />
                          <span>Teleconsult</span>
                        </Link>
                        <Link
                          to="/patient/referrals"
                          className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-semibold hover:bg-slate-50 flex items-center justify-center gap-1 text-center"
                        >
                          <ExternalLink className="w-3 h-3 text-emerald-500" />
                          <span>Referral Hub</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HOUSEHOLD TASKS & REMINDERS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Household Task Registry ({tasks.length})
            </h3>
            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Household Task</span>
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="py-16 text-center space-y-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <FileText className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No pending household tasks.</h4>
              <p className="text-xs text-slate-500">Click "Log Household Task" above to schedule a new visit, reminder, or follow-up call.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map(t => {
                const isCompleted = t.status === 'COMPLETED';
                return (
                  <div
                    key={t.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isCompleted
                        ? 'bg-slate-50/70 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 opacity-75'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {t.task_type}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {t.beneficiary_name}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" /> {t.village_name}
                        </span>
                        {t.beneficiary_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {t.beneficiary_phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> Due: {t.due_date}
                        </span>
                      </div>

                      {t.notes && (
                        <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          {t.notes}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Worker: {t.worker_name}</span>
                      <button
                        onClick={() => handleTaskStatusToggle(t)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCompleted
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {isCompleted ? 'Mark Pending' : 'Mark Completed'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FIELD AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Field Activity Audit Trail (Immutable Server Records)
            </h3>
            <span className="text-xs text-slate-400">Total events: {auditEvents.length}</span>
          </div>

          {auditEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              No audit events recorded yet for this session.
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
              {auditEvents.map(e => (
                <div key={e.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-bold text-[10px]">
                        {e.action}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {e.resource_type}: {e.resource_id}
                      </span>
                    </div>
                    {e.notes && <p className="text-slate-500 text-[11px]">{e.notes}</p>}
                  </div>
                  <div className="text-slate-400 text-[11px] sm:text-right shrink-0">
                    <div>{e.actor_name} ({e.actor_role})</div>
                    <div>{new Date(e.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: COMPLETE VISIT & RECORD BARRIERS */}
      {activeVisitForCompletion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Complete Visit: {activeVisitForCompletion.patient_name}
                </h3>
                <p className="text-xs text-slate-500">Record non-clinical operational barriers identified during visit</p>
              </div>
              <button
                onClick={() => setActiveVisitForCompletion(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCompleteVisitSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Access & Logistics Barriers Encountered
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {NON_CLINICAL_BARRIERS.map(b => (
                    <label
                      key={b}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        completionBarriers.includes(b)
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={completionBarriers.includes(b)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCompletionBarriers(prev => [...prev, b]);
                          } else {
                            setCompletionBarriers(prev => prev.filter(item => item !== b));
                          }
                        }}
                        className="rounded-sm text-emerald-600"
                      />
                      <span className="text-[11px] font-medium">{b}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Doorstep Completion Notes
                </label>
                <textarea
                  rows={3}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Record observations (e.g. Vitals checked, blister packs counted, dietary counseling delivered)..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-500">
                Completing this visit writes an immutable completion audit event with current server timestamp and stores recorded barriers in the database.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveVisitForCompletion(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCompleting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCompleting ? 'Saving...' : 'Confirm & Complete Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG HOUSEHOLD TASK */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Log Household Task</h3>
                <p className="text-xs text-slate-500">Create a real operational task assigned to your worker profile</p>
              </div>
              <button
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Beneficiary / Patient Name
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={newTaskBeneficiary}
                  onChange={(e) => setNewTaskBeneficiary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98123 45678"
                    value={newTaskPhone}
                    onChange={(e) => setNewTaskPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Village / Area
                  </label>
                  <input
                    type="text"
                    value={newTaskVillage}
                    onChange={(e) => setNewTaskVillage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Task Type
                  </label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="Household Visit">Household Visit</option>
                    <option value="Follow-up Call">Follow-up Call</option>
                    <option value="Appointment Reminder">Appointment Reminder</option>
                    <option value="Referral Follow-up">Referral Follow-up</option>
                    <option value="Transport Coordination">Transport Coordination</option>
                    <option value="Document Assistance">Document Assistance (ABHA)</option>
                    <option value="Teleconsultation Assistance">Teleconsultation Assistance</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Scheduled Due Time
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tomorrow, 10:30 AM"
                  value={newTaskDue}
                  onChange={(e) => setNewTaskDue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes & Objective
                </label>
                <textarea
                  rows={2}
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  placeholder="Specific task checklist or reminders..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
