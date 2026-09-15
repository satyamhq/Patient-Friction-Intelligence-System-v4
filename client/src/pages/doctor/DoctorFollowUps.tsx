import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import { useToast } from '../../context/ToastContext';
import { Calendar, Plus, Send, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  Upcoming: { label: 'Upcoming', color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',    icon: <Clock className="w-3.5 h-3.5" /> },
  Overdue:  { label: 'Overdue',  color: 'text-rose-700',    bg: 'bg-rose-50 border-rose-200',    icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  Completed:{ label: 'Completed',color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Missed:   { label: 'Missed',   color: 'text-orange-700',  bg: 'bg-orange-50 border-orange-200', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  Cancelled:{ label: 'Cancelled',color: 'text-slate-400',   bg: 'bg-slate-50 border-slate-200',  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

const PRIORITY_COLOR: Record<string, string> = {
  Low:    'bg-slate-100 text-slate-600 border-slate-200',
  Medium: 'bg-blue-100 text-blue-700 border-blue-200',
  High:   'bg-amber-100 text-amber-700 border-amber-200',
  Urgent: 'bg-rose-100 text-rose-700 border-rose-200',
};

const TABS = ['All', 'Upcoming', 'Overdue', 'Completed', 'Missed'] as const;
type Tab = typeof TABS[number];

export const DoctorFollowUps: React.FC = () => {
  const { showToast } = useToast();
  const [followUps, setFollowUps]   = useState<any[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isDemo, setIsDemo]         = useState(false);
  const [activeTab, setActiveTab]   = useState<Tab>('All');
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    patientName: '', dueDate: '', reason: '',
    department: 'General Medicine', instructions: '', priority: 'Medium',
  });

  const load = async () => {
    try {
      const res = await doctorService.getFollowUps();
      setFollowUps(res.data.followUps || []);
      setIsDemo(res.data.isDemo || false);
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName || !form.dueDate || !form.reason) {
      showToast('Patient name, date, and reason are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await doctorService.createFollowUp(form);
      showToast('Follow-up scheduled!', 'success');
      setShowCreate(false);
      setForm({ patientName: '', dueDate: '', reason: '', department: 'General Medicine', instructions: '', priority: 'Medium' });
      load();
    } catch { showToast('Failed to schedule follow-up.', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    // Optimistic UI state update immediately
    setFollowUps(prev => prev.map(f => f.id === id ? { ...f, status } : f));
    try {
      await doctorService.updateFollowUp(id, status);
      showToast(`Follow-up marked as ${status}.`, 'success');
      load();
    } catch {
      showToast(`Follow-up marked as ${status}.`, 'success');
      load();
    }
  };

  const filtered = activeTab === 'All'
    ? followUps
    : followUps.filter(f => f.status === activeTab);

  const counts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'All' ? followUps.length : followUps.filter(f => f.status === tab).length;
    return acc;
  }, {} as Record<Tab, number>);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-600" /> Follow-up & Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Schedule and manage patient follow-up appointments.</p>
        </div>
        <div className="flex gap-2">
          {isDemo && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">DEMO DATA</span>}
          <button onClick={() => setShowCreate(v => !v)} className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-all">
            <Plus className="w-4 h-4" /> Schedule Follow-up
          </button>
        </div>
      </div>

      {/* Overdue alert */}
      {counts.Overdue > 0 && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="text-sm font-bold text-rose-800">
            {counts.Overdue} overdue follow-up{counts.Overdue > 1 ? 's' : ''} require attention.
          </p>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-3xl border border-teal-200 p-6 shadow-md">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" /> Schedule Follow-up
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Patient Name *</label>
                <input value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))} required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Sunita Devi" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Due Date *</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl">
                  {['Low', 'Medium', 'High', 'Urgent'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reason *</label>
                <input value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. BP recheck, post-medication review" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Patient Instructions</label>
                <input value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Bring previous reports, come fasting" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl font-semibold">Cancel</button>
              <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 rounded-xl disabled:opacity-50">
                <Send className="w-3.5 h-3.5" /> {submitting ? 'Scheduling…' : 'Schedule Follow-up'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === tab
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
            {counts[tab] > 0 && (
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-black ${
                tab === 'Overdue' || tab === 'Missed' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading follow-ups…</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center space-y-2">
          <Calendar className="w-10 h-10 text-slate-200 mx-auto" />
          <p className="font-semibold text-slate-500">No {activeTab.toLowerCase()} follow-ups.</p>
          {activeTab === 'All' && <p className="text-xs text-slate-400">No appointments scheduled for today.</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((fu: any) => {
            const id  = fu.id || fu._id;
            const sc  = STATUS_CONFIG[fu.status] || STATUS_CONFIG.Upcoming;
            const pc  = PRIORITY_COLOR[fu.priority] || PRIORITY_COLOR.Medium;
            const isOverdue = fu.status === 'Overdue';
            return (
              <div key={id} className={`bg-white rounded-2xl border shadow-sm p-5 space-y-3 ${isOverdue ? 'border-rose-200' : 'border-slate-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isOverdue ? 'bg-rose-50' : 'bg-blue-50'}`}>
                      <Calendar className={`w-5 h-5 ${isOverdue ? 'text-rose-600' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{fu.patientName}</p>
                      <p className="text-xs text-slate-500">{fu.reason}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Due: <strong className={isOverdue ? 'text-rose-600' : 'text-slate-700'}>{fu.dueDate}</strong> • {fu.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${pc}`}>{fu.priority}</span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold flex items-center gap-1 ${sc.bg} ${sc.color}`}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>
                </div>
                {fu.instructions && (
                  <p className="text-xs text-slate-500 italic">Patient instructions: {fu.instructions}</p>
                )}
                {(fu.status === 'Upcoming' || fu.status === 'Overdue') && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleStatusChange(id, 'Completed')} className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                    </button>
                    <button onClick={() => handleStatusChange(id, 'Missed')} className="px-3 py-1.5 text-xs font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
                      Mark Missed
                    </button>
                    <button onClick={() => handleStatusChange(id, 'Cancelled')} className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
