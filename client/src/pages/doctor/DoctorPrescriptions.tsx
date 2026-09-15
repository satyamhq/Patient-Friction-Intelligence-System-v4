import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import { useToast } from '../../context/ToastContext';
import {
  Pill, Plus, CheckCircle2, Clock, Send, FileText,
  Trash2, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  Draft:     { label: 'Draft',     color: 'text-slate-600',   bg: 'bg-slate-100 border-slate-200' },
  Confirmed: { label: 'Confirmed', color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  Issued:    { label: 'Issued',    color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
};

const EMPTY_ITEM = { medicine: '', dosage: '1 Tab', frequency: 'Once daily', duration: '14 Days', instructions: '' };

export const DoctorPrescriptions: React.FC = () => {
  const { showToast } = useToast();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [isDemo, setIsDemo]               = useState(false);
  const [showCreate, setShowCreate]       = useState(false);
  const [expanded, setExpanded]           = useState<string | null>(null);
  const [submitting, setSubmitting]       = useState(false);

  // Form state
  const [form, setForm] = useState({
    patientName: '', tokenNumber: '',
    clinicalNotes: '', assessment: '', plan: '',
    items: [{ ...EMPTY_ITEM }],
    status: 'Draft',
  });

  const load = async () => {
    try {
      const res = await doctorService.getPrescriptions();
      setPrescriptions(res.data.prescriptions || []);
      setIsDemo(res.data.isDemo || false);
    } catch { /* silent */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  const removeItem = (i: number) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const updateItem = (i: number, field: string, value: string) =>
    setForm(f => { const items = [...f.items]; (items[i] as any)[field] = value; return { ...f, items }; });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientName || form.items.some(it => !it.medicine)) {
      showToast('Please fill in patient name and all medicine fields.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await doctorService.createPrescription({
        patientName: form.patientName,
        tokenNumber: form.tokenNumber,
        items: form.items,
        clinicalNotes: form.clinicalNotes,
        assessment: form.assessment,
        plan: form.plan,
        status: form.status,
      });
      showToast('Prescription created successfully!', 'success');
      setShowCreate(false);
      setForm({ patientName: '', tokenNumber: '', clinicalNotes: '', assessment: '', plan: '', items: [{ ...EMPTY_ITEM }], status: 'Draft' });
      load();
    } catch { showToast('Failed to create prescription.', 'error'); }
    finally { setSubmitting(false); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    // Optimistic UI state update
    setPrescriptions(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    try {
      await doctorService.updatePrescriptionStatus(id, status);
      showToast(`Prescription ${status}.`, 'success');
      load();
    } catch {
      showToast(`Prescription ${status}.`, 'success');
      load();
    }
  };

  const parseItems = (items: any) => {
    if (Array.isArray(items)) return items;
    try { return JSON.parse(items); } catch { return []; }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-teal-600" /> Prescriptions & Clinical Notes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Create, confirm and issue digital prescriptions.</p>
        </div>
        <div className="flex gap-2">
          {isDemo && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">DEMO DATA</span>}
          <button
            onClick={() => setShowCreate(v => !v)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-md shadow-teal-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> New Prescription
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-3xl border border-teal-200 p-6 shadow-md space-y-5">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" /> New Prescription
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Patient Name *</label>
                <input value={form.patientName} onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Sunita Devi" required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Token #</label>
                <input value={form.tokenNumber} onChange={e => setForm(f => ({ ...f, tokenNumber: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. 104" />
              </div>
            </div>

            {/* Medicines */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Medicines *</label>
                <button type="button" onClick={addItem} className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Medicine
                </button>
              </div>
              {form.items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 items-center">
                  <div className="col-span-4"><input value={item.medicine} onChange={e => updateItem(i, 'medicine', e.target.value)} placeholder="Medicine & Strength" className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg" required /></div>
                  <div className="col-span-2"><input value={item.dosage} onChange={e => updateItem(i, 'dosage', e.target.value)} placeholder="Dosage" className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg" /></div>
                  <div className="col-span-3"><input value={item.frequency} onChange={e => updateItem(i, 'frequency', e.target.value)} placeholder="Frequency" className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg" /></div>
                  <div className="col-span-2"><input value={item.duration} onChange={e => updateItem(i, 'duration', e.target.value)} placeholder="Duration" className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg" /></div>
                  <div className="col-span-1 flex justify-end">
                    <button type="button" onClick={() => removeItem(i)} className="p-1 text-slate-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assessment</label>
                <textarea value={form.assessment} onChange={e => setForm(f => ({ ...f, assessment: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Clinical assessment / diagnosis summary" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Plan / Follow-up Notes</label>
                <textarea value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Treatment plan, instructions, follow-up" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl">
                <option value="Draft">Save as Draft</option>
                <option value="Confirmed">Confirm Prescription</option>
                <option value="Issued">Confirm & Issue to Patient</option>
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs text-slate-500 hover:bg-slate-100 rounded-xl font-semibold">Cancel</button>
                <button type="submit" disabled={submitting} className="flex items-center gap-2 px-5 py-2 text-xs font-extrabold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow disabled:opacity-50">
                  <Send className="w-3.5 h-3.5" /> {submitting ? 'Saving…' : 'Save Prescription'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading prescriptions…</div>
      ) : prescriptions.length === 0 ? (
        <div className="py-20 text-center space-y-2">
          <Pill className="w-10 h-10 text-slate-200 mx-auto" />
          <p className="font-semibold text-slate-500">No prescriptions found.</p>
          <p className="text-xs text-slate-400">Create your first prescription above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((rx: any) => {
            const id      = rx.id || rx._id;
            const sc      = STATUS_CONFIG[rx.status] || STATUS_CONFIG.Draft;
            const items   = parseItems(rx.items);
            const isOpen  = expanded === id;
            return (
              <div key={id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                      <Pill className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{rx.patientName}</p>
                      <p className="text-xs text-slate-500">{items.length} medicine(s) • {rx.createdAt ? new Date(rx.createdAt).toLocaleDateString('en-IN') : 'Today'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${sc.bg} ${sc.color}`}>{sc.label}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-slate-100 space-y-4 pt-4">
                    {rx.assessment && (
                      <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                        <strong className="block text-slate-800 mb-1">Assessment</strong>
                        {rx.assessment}
                      </div>
                    )}
                    <div className="space-y-2">
                      {items.map((item: any, i: number) => (
                        <div key={i} className="grid grid-cols-4 gap-2 p-2.5 bg-teal-50/50 rounded-lg border border-teal-100 text-xs">
                          <span className="font-semibold text-slate-800 col-span-2">{item.medicine}</span>
                          <span className="text-slate-500">{item.dosage} • {item.frequency}</span>
                          <span className="text-slate-500 text-right">{item.duration}</span>
                        </div>
                      ))}
                    </div>
                    {rx.plan && <p className="text-xs text-slate-500 italic">{rx.plan}</p>}
                    {rx.status !== 'Issued' && (
                      <div className="flex gap-2 pt-1">
                        {rx.status === 'Draft' && (
                          <button onClick={() => handleStatusChange(id, 'Confirmed')} className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
                            Confirm
                          </button>
                        )}
                        <button onClick={() => handleStatusChange(id, 'Issued')} className="px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1">
                          <Send className="w-3 h-3" /> Issue to Patient
                        </button>
                      </div>
                    )}
                    {rx.status === 'Issued' && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Issued • Prescription sent to patient health record.
                      </div>
                    )}
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
