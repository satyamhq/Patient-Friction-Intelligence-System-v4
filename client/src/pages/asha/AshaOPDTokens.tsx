import React, { useState, useEffect } from 'react';
import { ashaService } from '../../services/ashaService';
import { useToast } from '../../context/ToastContext';
import {
  Ticket,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Building,
  User,
  X,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const AshaOPDTokens: React.FC = () => {
  const { showToast } = useToast();
  const [tokens, setTokens] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [patientName, setPatientName] = useState('Amrik Chand');
  const [department, setDepartment] = useState('General Medicine OPD');
  const [priority, setPriority] = useState('Routine');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTokens = async () => {
    setIsLoading(true);
    try {
      const res = await ashaService.getOPDTokens();
      if (res.success) {
        setTokens(res.tokens || []);
      }
    } catch {
      showToast('Failed to load OPD tokens.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleTokenRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      showToast('Please enter beneficiary name.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ashaService.requestOPDToken({
        patientName: patientName.trim(),
        department,
        priority,
      });

      if (res.success) {
        showToast(`Token #${res.token.tokenNumber} generated! Live on Doctor Desk and Hospital queue.`, 'success');
        setShowModal(false);
        await fetchTokens();
      }
    } catch {
      showToast('Failed to request queue token.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Ticket className="w-3.5 h-3.5" />
            <span>Shared OPD Token Queue</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            Frontline OPD Token Assistance Desk
          </h1>
          <p className="text-xs text-slate-500">
            Assisting non-digital beneficiaries with live OPD queue tokens. Synchronized with Doctor Desk and Hospital Queue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTokens}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Request Token
          </button>
        </div>
      </div>

      {/* Shared Queue Explanation */}
      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center gap-3 text-xs text-teal-900">
        <Sparkles className="w-5 h-5 text-teal-600 shrink-0" />
        <div>
          <strong className="block font-bold">Synchronized Multi-Role Queue Token</strong>
          <span>
            When you request a token here, Token # is generated directly inside the hospital queue (`queue_tokens` table). Dr. Priya Sharma sees it immediately in the Doctor Queue, and the patient receives status via SMS/vault.
          </span>
        </div>
      </div>

      {/* Tokens List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading live tokens...</div>
        ) : tokens.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
            No active queue tokens on record.
          </div>
        ) : (
          tokens.map((token: any) => (
            <div
              key={token.id || token._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-xl text-sm font-black font-mono bg-teal-600 text-white shadow-sm">
                    Token #{token.tokenNumber || token.token_number}
                  </span>
                  <strong className="text-sm text-slate-900">
                    {token.patientName || token.patient_name}
                  </strong>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      token.status === 'SERVING'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                        : token.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : token.status === 'SKIPPED'
                        ? 'bg-slate-200 text-slate-700'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {token.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  Department: <strong>{token.department || 'General Medicine OPD'}</strong> • Doctor: <strong>{token.doctorName || 'Dr. Priya Sharma'}</strong>
                </p>

                {token.notes && <p className="text-[11px] text-slate-500 italic">"{token.notes}"</p>}
              </div>

              <div className="text-right text-xs text-slate-500 shrink-0">
                <span className="block text-[11px] text-slate-400">Live Hospital Status</span>
                <strong className="text-slate-800">
                  {token.status === 'SERVING' ? 'Now with Doctor' : token.status === 'COMPLETED' ? 'Consultation Finished' : 'Waiting in OPD Area'}
                </strong>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Ticket className="w-5 h-5 text-teal-600" />
                Request Live OPD Token
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTokenRequest} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Beneficiary Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">OPD Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="General Medicine OPD">General Medicine OPD</option>
                  <option value="Non-Communicable Disease Clinic">Non-Communicable Disease Clinic</option>
                  <option value="Maternal & Child Health OPD">Maternal & Child Health OPD</option>
                  <option value="Geriatric Care OPD">Geriatric Care OPD</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Queue Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Routine">Routine Walk-in</option>
                  <option value="Senior Citizen">Senior Citizen Priority</option>
                  <option value="Pregnant Mother">Pregnant Mother (ANC Priority)</option>
                  <option value="Emergency Triage">Urgent Triage Assistance</option>
                </select>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 border border-slate-200">
                Notice: Token will be generated in real time in the Phagwara PHC OPD database. The next available number will be allocated automatically.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Generating...' : 'Issue Live Token'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
