import React, { useState, useEffect } from 'react';
import { ashaService } from '../../services/ashaService';
import { useToast } from '../../context/ToastContext';
import {
  CheckSquare,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  PhoneCall,
  User,
  X,
  AlertCircle,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export const AshaFollowUps: React.FC = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('PENDING');

  // Task Action Modal
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [taskOutcome, setTaskOutcome] = useState('Patient contacted; agreed to attend scheduled OPD.');
  const [taskStatus, setTaskStatus] = useState('COMPLETED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Task Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');
  const [taskType, setTaskType] = useState('Appointment Follow-up');
  const [dueDate, setDueDate] = useState('Tomorrow, 10:00 AM');
  const [priority, setPriority] = useState('Medium');
  const [notes, setNotes] = useState('');

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await ashaService.getTasks();
      if (res.success) {
        setTasks(res.tasks || []);
      }
    } catch {
      showToast('Failed to load tasks.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask) return;

    setIsSubmitting(true);
    try {
      const res = await ashaService.updateTaskStatus(activeTask.id, taskStatus, taskOutcome);
      if (res.success) {
        showToast(`Task updated to ${taskStatus}.`, 'success');
        setActiveTask(null);
        await fetchTasks();
      }
    } catch {
      showToast('Failed to update task status.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beneficiaryName.trim()) {
      showToast('Please enter beneficiary name.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ashaService.createTask({
        beneficiaryName: beneficiaryName.trim(),
        beneficiaryPhone: beneficiaryPhone.trim(),
        taskType,
        dueDate,
        priority,
        notes,
      });

      if (res.success) {
        showToast('Follow-up task created successfully.', 'success');
        setShowAddModal(false);
        setBeneficiaryName('');
        setBeneficiaryPhone('');
        setNotes('');
        await fetchTasks();
      }
    } catch {
      showToast('Failed to create follow-up task.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = tasks.filter((t) => {
    if (activeTab === 'PENDING') return t.status !== 'COMPLETED';
    if (activeTab === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Care Continuity & Missed Care Outreach</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            Follow-up Tasks & Missed Care Coordination
          </h1>
          <p className="text-xs text-slate-500">
            Field outreach for missed appointments, referral reminders, medication adherence, and hospital follow-up
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTasks}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Task
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'PENDING', label: `Active Tasks (${tasks.filter(t => t.status !== 'COMPLETED').length})` },
          { id: 'COMPLETED', label: 'Completed' },
          { id: 'ALL', label: 'All Tasks' },
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

      {/* Task Cards */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading follow-up tasks...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
            No tasks in the "{activeTab}" view. All reminders up to date.
          </div>
        ) : (
          filtered.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm text-slate-900">{t.patientName}</strong>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                    {t.villageName || 'Rampur Kalan'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      t.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'IN_PROGRESS'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {t.status}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                    {t.priority || 'Medium'}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-semibold">
                  {t.taskType}
                </p>

                {t.notes && <p className="text-[11px] text-slate-500 italic">"{t.notes}"</p>}

                <p className="text-[11px] text-slate-400">
                  Due: <strong>{t.dueDate}</strong> • Contact: {t.phone || '+91 98765 00000'}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {t.status !== 'COMPLETED' ? (
                  <button
                    onClick={() => {
                      setActiveTask(t);
                      setTaskStatus('COMPLETED');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Record Outcome
                  </button>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Record Outcome Modal */}
      {activeTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-teal-600" />
                  Follow-up Outreach Outcome
                </h3>
                <p className="text-xs text-slate-500">{activeTask.patientName} • {activeTask.taskType}</p>
              </div>
              <button onClick={() => setActiveTask(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="COMPLETED">Completed (Outreach Successful)</option>
                  <option value="IN_PROGRESS">In Progress (Re-contact Needed)</option>
                  <option value="UNABLE_TO_REACH">Unable to Reach Beneficiary</option>
                  <option value="ESCALATED">Escalated to Supervisor / MO</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Outreach Outcome Notes</label>
                <textarea
                  rows={3}
                  value={taskOutcome}
                  onChange={(e) => setTaskOutcome(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Record outcome of contact..."
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTask(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Outcome'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-teal-600" />
                Create Follow-up Task
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Beneficiary Name</label>
                <input
                  type="text"
                  placeholder="e.g. Harpreet Singh"
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Type</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Appointment Follow-up">Appointment Follow-up</option>
                  <option value="Referral Follow-up">Referral Follow-up</option>
                  <option value="Missed Appointment Outreach">Missed Appointment Outreach</option>
                  <option value="Document Assistance">Document Assistance (ABHA/PM-JAY)</option>
                  <option value="Hospital Arrival Coordination">Hospital Arrival Coordination</option>
                  <option value="Visit Reminder">Visit Reminder</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765..."
                    value={beneficiaryPhone}
                    onChange={(e) => setBeneficiaryPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Due Date / Time</label>
                <input
                  type="text"
                  placeholder="e.g. Tomorrow, 11:00 AM"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Specific task details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
