import React, { useState, useEffect } from 'react';
import { ashaService } from '../../services/ashaService';
import { useToast } from '../../context/ToastContext';
import {
  ShieldAlert,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Truck,
  IndianRupee,
  FileText,
  Languages,
  Smartphone,
  Calendar,
  HelpCircle,
  X,
  ArrowRight,
} from 'lucide-react';

export const AshaAccessBarriers: React.FC = () => {
  const { showToast } = useToast();
  const [barriers, setBarriers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [category, setCategory] = useState<string>('TRANSPORT');
  const [barrierType, setBarrierType] = useState('');
  const [details, setDetails] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBarriers = async () => {
    setIsLoading(true);
    try {
      const res = await ashaService.getAccessBarriers();
      if (res.success) {
        setBarriers(res.barriers || []);
      }
    } catch {
      showToast('Failed to load access barrier intelligence.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBarriers();
  }, []);

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !barrierType.trim()) {
      showToast('Patient name and barrier description are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ashaService.recordAccessBarrier({
        patientName: patientName.trim(),
        householdId: 'HH-PB-02',
        villageName: 'Rampur Kalan',
        category,
        barrierType: barrierType.trim(),
        details: details.trim(),
        actionTaken: actionTaken.trim() || 'Coordinated local mitigation plan',
      });

      if (res.success) {
        showToast(res.message || 'Access barrier logged into PFIS intelligence engine.', 'success');
        setShowModal(false);
        setPatientName('');
        setBarrierType('');
        setDetails('');
        setActionTaken('');
        await fetchBarriers();
      }
    } catch {
      showToast('Failed to log barrier.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = barriers.filter((b) => {
    if (filterCategory === 'ALL') return true;
    return b.category === filterCategory;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'TRANSPORT': return <Truck className="w-4 h-4 text-rose-600" />;
      case 'COST': return <IndianRupee className="w-4 h-4 text-amber-600" />;
      case 'DOCUMENTATION': return <FileText className="w-4 h-4 text-teal-600" />;
      case 'LANGUAGE': return <Languages className="w-4 h-4 text-blue-600" />;
      case 'DIGITAL ACCESS': return <Smartphone className="w-4 h-4 text-indigo-600" />;
      case 'AVAILABILITY': return <Calendar className="w-4 h-4 text-purple-600" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Core PFIS Field Access Intelligence</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            Non-Clinical Access Barriers & Friction Assessment
          </h1>
          <p className="text-xs text-slate-500">
            Field-identified social determinants, travel obstacles, financial constraints, and digital literacy barriers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBarriers}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Record Barrier
          </button>
        </div>
      </div>

      {/* Critical Rule Notice (Section 10) */}
      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center gap-3 text-xs text-teal-900">
        <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
        <div>
          <strong className="block font-bold">Operational Indicator: Healthcare Access Friction</strong>
          <span>
            This score measures structural access friction (e.g. transport, digital access, cost, availability). It is purely operational and must never be used as a medical disease diagnosis.
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'ALL', label: 'All Categories' },
          { id: 'TRANSPORT', label: 'Transport' },
          { id: 'COST', label: 'Cost / Financial' },
          { id: 'DOCUMENTATION', label: 'Documentation' },
          { id: 'DIGITAL ACCESS', label: 'Digital Access' },
          { id: 'AVAILABILITY', label: 'OPD Availability' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterCategory === tab.id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Barriers List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading access barriers...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
            No access barriers recorded under this category.
          </div>
        ) : (
          filtered.map((b: any) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-teal-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-slate-100">
                    {getCategoryIcon(b.category)}
                  </span>
                  <span className="text-xs font-bold uppercase text-slate-600">
                    {b.category}
                  </span>
                  <span className="text-slate-300">•</span>
                  <strong className="text-sm text-slate-900">{b.patientName}</strong>
                  <span className="text-xs text-slate-400">({b.villageName || 'Rampur Kalan'})</span>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      b.frictionScore === 'Critical'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : b.frictionScore === 'High'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : b.frictionScore === 'Moderate'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    Access Friction: {b.frictionScore}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                    {b.status}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-800 font-semibold">
                Barrier: <span className="font-normal">{b.barrierType}</span>
              </div>

              {b.details && (
                <p className="text-[11px] text-slate-500 italic">
                  Details: "{b.details}"
                </p>
              )}

              {b.actionTaken && (
                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-teal-800 font-medium">
                  Action Taken: {b.actionTaken}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-teal-600" />
                Record Non-Clinical Access Barrier
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Beneficiary Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sunita Devi"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Barrier Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="TRANSPORT">TRANSPORT (Distance, no bus, emergency transit failure)</option>
                  <option value="COST">COST (Travel cost, diagnostic fee affordability)</option>
                  <option value="DOCUMENTATION">DOCUMENTATION (Missing document, ABHA/card problem)</option>
                  <option value="LANGUAGE">LANGUAGE (Communication / vernacular barrier)</option>
                  <option value="DIGITAL ACCESS">DIGITAL ACCESS (No smartphone, low literacy)</option>
                  <option value="AVAILABILITY">AVAILABILITY (Doctor slot unavailable, facility closed)</option>
                  <option value="OTHER">OTHER (Non-clinical access issue)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Barrier Description</label>
                <input
                  type="text"
                  placeholder="e.g. 32km distance to Civil Hospital with no morning bus"
                  value={barrierType}
                  onChange={(e) => setBarrierType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Additional Observations / Context</label>
                <textarea
                  rows={2}
                  placeholder="Specific field details..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Immediate Action Plan / Mitigation</label>
                <input
                  type="text"
                  placeholder="e.g. Enrolled for 102 Janani Shishu transit / assisted token"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
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
                  {isSubmitting ? 'Logging...' : 'Record Access Barrier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
