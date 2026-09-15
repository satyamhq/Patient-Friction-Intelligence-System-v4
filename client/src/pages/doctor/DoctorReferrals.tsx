import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import { useToast } from '../../context/ToastContext';
import { GitFork, Plus, Send, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

const STATUS_STEPS = ['Initiated', 'In Transit', 'Arrived', 'Specialist Consulted', 'Completed'];
const STATUS_COLOR: Record<string, string> = {
  Initiated:            'bg-blue-50 border-blue-200 text-blue-700',
  'In Transit':         'bg-amber-50 border-amber-200 text-amber-700',
  Arrived:              'bg-indigo-50 border-indigo-200 text-indigo-700',
  'Specialist Consulted':'bg-teal-50 border-teal-200 text-teal-700',
  Completed:            'bg-emerald-50 border-emerald-200 text-emerald-700',
};
const PRIORITY_COLOR: Record<string, string> = {
  Routine:   'bg-slate-100 text-slate-600 border-slate-200',
  Urgent:    'bg-orange-100 text-orange-700 border-orange-200',
  Emergency: 'bg-rose-100 text-rose-700 border-rose-200',
};

export const DoctorReferrals: React.FC = () => {
  const { showToast } = useToast();
  const [referrals, setReferrals]   = useState<any[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    patientName: '', toFacilityName: '', fromFacilityName: 'PHC Ludhiana',
    specialty: '', reason: '', priority: 'Routine', notes: '',
  });

  const load = async () => {
    try {
      const res = await doctorService.getReferrals();
      setReferrals(res.data.referrals || []);
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName || !form.specialty || !form.reason) {
      showToast('Patient name, specialty, and reason are required.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await doctorService.createReferral(form);
      showToast('Referral created and sent!', 'success');
      setShowCreate(false);
      setForm({ patientName: '', toFacilityName: '', fromFacilityName: 'PHC Ludhiana', specialty: '', reason: '', priority: 'Routine', notes: '' });
      load();
    } catch { showToast('Failed to create referral.', 'error'); }
    finally { setSubmitting(false); }
  };

  const getStatusStep = (status: string) => STATUS_STEPS.indexOf(status);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <GitFork className="w-6 h-6 text-teal-600" /> Referral Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Create and track patient referrals to specialist facilities.</p>
        </div>
        <button onClick={() => setShowCreate(v => !v)} className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-all">
          <Plus className="w-4 h-4" /> New Referral
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-3xl border border-teal-200 p-6 shadow-md">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <GitFork className="w-4 h-4 text-teal-600" /> New Referral
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Patient Name *</label>
                <input value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))} required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Harpreet Singh" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Referring From</label>
                <input value={form.fromFacilityName} onChange={e => setForm(f => ({ ...f, fromFacilityName: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Referral Destination *</label>
                <input value={form.toFacilityName} onChange={e => setForm(f => ({ ...f, toFacilityName: e.target.value }))} required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. District Civil Hospital" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Specialty *</label>
                <input value={form.specialty} onChange={e => setForm(f => ({ ...f, specialty: e.target.value }))} required
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Cardiology, Nephrology" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl">
                  {['Routine', 'Urgent', 'Emergency'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reason for Referral *</label>
              <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={2} required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Clinical reason for referral…" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Additional Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Additional clinical notes for receiving doctor…" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl font-semibold">Cancel</button>
              <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 rounded-xl disabled:opacity-50">
                <Send className="w-3.5 h-3.5" /> {submitting ? 'Creating…' : 'Create & Send Referral'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Referrals List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading referrals…</div>
      ) : referrals.length === 0 ? (
        <div className="py-20 text-center space-y-2">
          <GitFork className="w-10 h-10 text-slate-200 mx-auto" />
          <p className="font-semibold text-slate-500">No referrals found.</p>
          <p className="text-xs text-slate-400">Create your first referral above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {referrals.map((ref: any) => {
            const id       = ref.id || ref._id;
            const status   = ref.status || ref.status;
            const priority = ref.priority;
            const stepIdx  = getStatusStep(status);
            return (
              <div key={id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                      <GitFork className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{ref.patientName ?? ref.patient_name}</p>
                      <p className="text-xs text-slate-500">
                        {ref.fromFacilityName ?? ref.from_facility_name} <ArrowRight className="w-3 h-3 inline mx-0.5" /> {ref.toFacilityName ?? ref.to_facility_name}
                      </p>
                      <p className="text-xs text-slate-500">{ref.specialtyRequired ?? ref.specialty_required} • Code: <span className="font-mono">{ref.referralCode ?? ref.referral_code}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${PRIORITY_COLOR[priority] || PRIORITY_COLOR.Routine}`}>{priority}</span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${STATUS_COLOR[status] || 'bg-slate-50 border-slate-200 text-slate-600'}`}>{status}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-1">
                  {STATUS_STEPS.map((step, i) => (
                    <React.Fragment key={step}>
                      <div className={`flex-1 h-1.5 rounded-full transition-all ${i <= stepIdx ? 'bg-teal-500' : 'bg-slate-200'}`} />
                      {i < STATUS_STEPS.length - 1 && <div className="w-1" />}
                    </React.Fragment>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  {STATUS_STEPS.map((s, i) => (
                    <span key={s} className={i <= stepIdx ? 'text-teal-600 font-semibold' : ''}>{s.split(' ')[0]}</span>
                  ))}
                </div>

                <p className="text-xs text-slate-600 italic">
                  {ref.reasonForReferral ?? ref.reason_for_referral}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
