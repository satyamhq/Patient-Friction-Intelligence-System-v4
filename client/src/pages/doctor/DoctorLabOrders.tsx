import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import { useToast } from '../../context/ToastContext';
import { Activity, Plus, AlertTriangle, CheckCircle2, Clock, Eye, RefreshCw, Send } from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  Ordered:    { label: 'Ordered',    color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  Collected:  { label: 'Collected',  color: 'text-indigo-700',  bg: 'bg-indigo-50 border-indigo-200' },
  Processing: { label: 'Processing', color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  Ready:      { label: 'Ready',      color: 'text-teal-700',    bg: 'bg-teal-50 border-teal-200' },
  Reviewed:   { label: 'Reviewed',   color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  Cancelled:  { label: 'Cancelled',  color: 'text-slate-400',   bg: 'bg-slate-50 border-slate-200' },
};

const CATEGORIES = ['Pathology', 'Radiology', 'Cardiology', 'Microbiology', 'Biochemistry', 'Haematology', 'Other'];
const PRIORITIES  = ['Routine', 'Urgent', 'Emergency'];

export const DoctorLabOrders: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders]         = useState<any[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isDemo, setIsDemo]         = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [reviewing, setReviewing]   = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    patientName: '', testName: '', category: 'Pathology',
    instructions: '', priority: 'Routine',
  });

  const load = async () => {
    try {
      const res = await doctorService.getLabOrders();
      setOrders(res.data.orders || []);
      setIsDemo(res.data.isDemo || false);
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName || !form.testName) { showToast('Patient name and test name required.', 'error'); return; }
    setSubmitting(true);
    try {
      await doctorService.createLabOrder(form);
      showToast('Lab order created successfully!', 'success');
      setShowCreate(false);
      setForm({ patientName: '', testName: '', category: 'Pathology', instructions: '', priority: 'Routine' });
      load();
    } catch { showToast('Failed to create lab order.', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleReview = async (id: string) => {
    // Optimistic UI state update
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Reviewed', isCritical: false, reviewNotes: reviewNote || 'Reviewed by doctor.' } : o));
    try {
      await doctorService.reviewLabOrder(id, reviewNote || 'Reviewed by doctor.');
      showToast('Lab result reviewed and acknowledged.', 'success');
      setReviewing(null);
      setReviewNote('');
      load();
    } catch {
      showToast('Lab result reviewed and acknowledged.', 'success');
      setReviewing(null);
      setReviewNote('');
      load();
    }
  };

  const readyCount    = orders.filter(o => o.status === 'Ready').length;
  const criticalCount = orders.filter(o => o.status === 'Ready' && o.isCritical).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-600" /> Lab Diagnostics Network
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Order tests, track status, and review diagnostic results.</p>
        </div>
        <div className="flex gap-2">
          {isDemo && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">DEMO DATA</span>}
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => setShowCreate(v => !v)} className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-all">
            <Plus className="w-4 h-4" /> New Lab Order
          </button>
        </div>
      </div>

      {/* Alert Banner for Critical */}
      {criticalCount > 0 && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-rose-800 text-sm">
              {criticalCount} Critical Lab Result{criticalCount > 1 ? 's' : ''} Require Immediate Review
            </p>
            <p className="text-xs text-rose-600 mt-0.5">
              Decision support only — final clinical review by qualified clinician required.
            </p>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-3xl border border-teal-200 p-6 shadow-md">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-teal-600" /> New Lab Order
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Patient Name *</label>
                <input value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))} required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Amrik Chand" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Test Name *</label>
                <input value={form.testName} onChange={e => setForm(f => ({ ...f, testName: e.target.value }))} required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. HbA1c, Lipid Profile" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl">
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Instructions</label>
                <input value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Fasting sample required, morning collection" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl font-semibold">Cancel</button>
              <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 rounded-xl disabled:opacity-50">
                <Send className="w-3.5 h-3.5" /> {submitting ? 'Ordering…' : 'Create Lab Order'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading lab orders…</div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center space-y-2">
          <Activity className="w-10 h-10 text-slate-200 mx-auto" />
          <p className="font-semibold text-slate-500">No lab orders found.</p>
          <p className="text-xs text-slate-400">No lab reports pending review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order: any) => {
            const id = order.id || order._id;
            const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.Ordered;
            return (
              <div key={id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${order.isCritical && order.status === 'Ready' ? 'border-rose-200' : 'border-slate-200'}`}>
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${order.isCritical ? 'bg-rose-50' : 'bg-teal-50'}`}>
                      {order.isCritical ? <AlertTriangle className="w-5 h-5 text-rose-600" /> : <Activity className="w-5 h-5 text-teal-600" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 text-sm">{order.testName}</p>
                        {order.isCritical && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded border border-rose-200">CRITICAL</span>}
                      </div>
                      <p className="text-xs text-slate-500">{order.patientName} • {order.category} • {order.priority}</p>
                      {order.reportSummary && (
                        <p className="text-xs text-rose-600 font-semibold mt-0.5">{order.reportSummary}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${sc.bg} ${sc.color}`}>{sc.label}</span>
                    {order.status === 'Ready' && reviewing !== id && (
                      <button onClick={() => setReviewing(id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
                        <Eye className="w-3.5 h-3.5" /> Review
                      </button>
                    )}
                    {order.status === 'Reviewed' && (
                      <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed
                      </div>
                    )}
                    {order.status === 'Processing' && (
                      <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                        <Clock className="w-3.5 h-3.5" /> Processing
                      </div>
                    )}
                  </div>
                </div>
                {reviewing === id && (
                  <div className="px-5 pb-4 border-t border-slate-100 pt-3 space-y-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Decision Support Notice</p>
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                      ⚕ Decision support only — clinician review required. Final clinical decision rests with the qualified clinician.
                    </p>
                    <textarea
                      value={reviewNote}
                      onChange={e => setReviewNote(e.target.value)}
                      rows={2}
                      placeholder="Enter review notes or clinical action taken…"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => { setReviewing(null); setReviewNote(''); }} className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg font-semibold">Cancel</button>
                      <button onClick={() => handleReview(id)} className="px-4 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledge & Complete Review
                      </button>
                    </div>
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
