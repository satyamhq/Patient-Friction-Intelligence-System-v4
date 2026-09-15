import React, { useState, useEffect } from 'react';
import { ashaService } from '../../services/ashaService';
import { useToast } from '../../context/ToastContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Home,
  User,
  ShieldAlert,
  HelpCircle,
  X,
  FileText,
} from 'lucide-react';

export const AshaFieldVisits: React.FC = () => {
  const { showToast } = useToast();
  const [visits, setVisits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'TODAY' | 'UPCOMING' | 'MISSED' | 'COMPLETED'>('TODAY');

  // Modal State for Visit Workflow
  const [activeVisit, setActiveVisit] = useState<any | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [visitObservations, setVisitObservations] = useState('');
  const [selectedBarriers, setSelectedBarriers] = useState<string[]>([]);
  const [newBarrier, setNewBarrier] = useState('');
  const [nextAction, setNextAction] = useState('Continue regular adherence & schedule review');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Visit Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newHouseholdId, setNewHouseholdId] = useState('HH-PB-02');
  const [newVisitType, setNewVisitType] = useState('Doorstep NCD Blood Pressure Check');
  const [newScheduledDate, setNewScheduledDate] = useState('Today, 03:00 PM');
  const [newPriority, setNewPriority] = useState('Routine');
  const [newNotes, setNewNotes] = useState('');

  const fetchVisits = async () => {
    setIsLoading(true);
    try {
      const res = await ashaService.getVisits();
      if (res.success) {
        setVisits(res.visits || []);
      }
    } catch {
      showToast('Failed to load field visits.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleStartVisit = async (visit: any) => {
    try {
      const res = await ashaService.startVisit(visit.id);
      if (res.success) {
        showToast(`Field visit started for ${visit.patientName}. Doorstep check initiated.`, 'info');
        await fetchVisits();
      }
    } catch {
      showToast('Failed to start visit.', 'error');
    }
  };

  const handleOpenCompleteModal = (visit: any) => {
    setActiveVisit(visit);
    setVisitObservations(visit.notes || '');
    setSelectedBarriers(Array.isArray(visit.accessibilityBarriers) ? visit.accessibilityBarriers : []);
    setIsCompleting(true);
  };

  const handleAddBarrier = () => {
    if (newBarrier.trim() && !selectedBarriers.includes(newBarrier.trim())) {
      setSelectedBarriers([...selectedBarriers, newBarrier.trim()]);
      setNewBarrier('');
    }
  };

  const handleRemoveBarrier = (barrier: string) => {
    setSelectedBarriers(selectedBarriers.filter((b) => b !== barrier));
  };

  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeVisit) return;

    setIsSubmitting(true);
    try {
      const res = await ashaService.completeVisit(activeVisit.id, {
        notes: visitObservations,
        accessibilityBarriers: selectedBarriers,
        nextAction,
        observations: visitObservations,
      });

      if (res.success) {
        showToast(`Visit completed for ${activeVisit.patientName}. Data synced to shared records.`, 'success');
        setIsCompleting(false);
        setActiveVisit(null);
        await fetchVisits();
      }
    } catch {
      showToast('Failed to complete visit.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newVisitType.trim()) {
      showToast('Patient name and visit purpose are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ashaService.createVisit({
        patientName: newPatientName.trim(),
        householdId: newHouseholdId,
        villageName: 'Rampur Kalan',
        visitType: newVisitType,
        scheduledDate: newScheduledDate,
        priority: newPriority,
        notes: newNotes,
      });

      if (res.success) {
        showToast('Visit scheduled successfully.', 'success');
        setShowScheduleModal(false);
        setNewPatientName('');
        setNewNotes('');
        await fetchVisits();
      }
    } catch {
      showToast('Failed to schedule visit.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVisits = visits.filter((v) => {
    if (activeTab === 'TODAY') return v.status === 'IN_PROGRESS' || v.status === 'SCHEDULED' || v.scheduledDate?.toLowerCase().includes('today');
    if (activeTab === 'UPCOMING') return v.scheduledDate?.toLowerCase().includes('tomorrow') || v.scheduledDate?.toLowerCase().includes('thursday') || (v.status === 'SCHEDULED' && !v.scheduledDate?.toLowerCase().includes('today'));
    if (activeTab === 'MISSED') return v.status === 'MISSED';
    if (activeTab === 'COMPLETED') return v.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Field Visit Planner & Verification Desk</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            Doorstep Household Visits & Coordination
          </h1>
          <p className="text-xs text-slate-500">
            Scheduled field appointments, non-clinical barrier recording, and service facilitation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchVisits}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Schedule Visit
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'TODAY', label: `Today's Visits` },
          { id: 'UPCOMING', label: 'Upcoming' },
          { id: 'MISSED', label: 'Missed Visits' },
          { id: 'COMPLETED', label: 'Completed' },
          { id: 'ALL', label: 'All Scheduled' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visits List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading visit planner...</div>
        ) : filteredVisits.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
            No visits in the "{activeTab}" view.
          </div>
        ) : (
          filteredVisits.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-teal-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm text-slate-900">{v.patientName}</strong>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 flex items-center gap-1">
                    <Home className="w-3 h-3" /> {v.householdId}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      v.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : v.status === 'IN_PROGRESS'
                        ? 'bg-teal-100 text-teal-800 animate-pulse'
                        : v.status === 'MISSED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {v.status}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                    {v.priority}
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  <strong>{v.visitType}</strong> • Scheduled: <strong>{v.scheduledDate}</strong>
                </div>

                {v.notes && <p className="text-[11px] text-slate-500 italic">Notes: "{v.notes}"</p>}

                {Array.isArray(v.accessibilityBarriers) && v.accessibilityBarriers.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 text-[11px]">
                    <span className="text-slate-400">Identified Access Barriers:</span>
                    {v.accessibilityBarriers.map((b: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-medium border border-rose-200">
                        {b}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {v.status === 'SCHEDULED' && (
                  <button
                    onClick={() => handleStartVisit(v)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-sm flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Start Visit
                  </button>
                )}

                {v.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => handleOpenCompleteModal(v)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 animate-pulse"
                  >
                    <Check className="w-3.5 h-3.5" /> Complete Visit
                  </button>
                )}

                {v.status === 'COMPLETED' && (
                  <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Visit Logged
                  </span>
                )}

                {v.status === 'MISSED' && (
                  <button
                    onClick={() => {
                      setNewPatientName(v.patientName);
                      setNewHouseholdId(v.householdId);
                      setNewVisitType(v.visitType);
                      setNewScheduledDate('Tomorrow, 10:00 AM');
                      setShowScheduleModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center gap-1"
                  >
                    Reschedule
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Complete Visit Modal */}
      {isCompleting && activeVisit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Complete Doorstep Visit
                </h3>
                <p className="text-xs text-slate-500">
                  {activeVisit.patientName} • {activeVisit.householdId}
                </p>
              </div>
              <button onClick={() => setIsCompleting(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Permitted Field Observations & Wellness Check
                </label>
                <textarea
                  rows={3}
                  value={visitObservations}
                  onChange={(e) => setVisitObservations(e.target.value)}
                  placeholder="Record non-clinical observations (e.g. digital BP verified at 134/86, medicine blister pack stock verified, dietary advice given)..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Identify Non-Clinical Access Barriers
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Transport distance to PHC, financial barrier..."
                    value={newBarrier}
                    onChange={(e) => setNewBarrier(e.target.value)}
                    className="flex-grow p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={handleAddBarrier}
                    className="px-3.5 py-2 bg-slate-200 rounded-xl font-bold text-slate-700"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedBarriers.map((barrier, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px]"
                    >
                      {barrier}
                      <button type="button" onClick={() => handleRemoveBarrier(barrier)} className="hover:text-rose-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Next Action / Service Coordination
                </label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
                Notice: All recorded visit data synchronizes automatically to the patient longitudinal record and frontline audit trail. ASHA workers do not formulate independent clinical diagnoses.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCompleting(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Save & Complete Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Visit Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                Schedule New Field Visit
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Beneficiary Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sunita Devi"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Household ID</label>
                  <input
                    type="text"
                    value={newHouseholdId}
                    onChange={(e) => setNewHouseholdId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Routine">Routine</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Visit Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Doorstep BP & T2DM Adherence Check"
                  value={newVisitType}
                  onChange={(e) => setNewVisitType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scheduled Date / Time</label>
                <input
                  type="text"
                  placeholder="e.g. Today, 03:30 PM"
                  value={newScheduledDate}
                  onChange={(e) => setNewScheduledDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Instructions / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Carry digital glucometer, verify IFA tablet blister"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
