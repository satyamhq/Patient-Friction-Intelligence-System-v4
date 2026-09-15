import React, { useState, useEffect } from 'react';
import { ashaService } from '../../services/ashaService';
import { useToast } from '../../context/ToastContext';
import {
  GitFork,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  User,
  Truck,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  X,
  Phone,
  Sparkles,
} from 'lucide-react';

export const AshaReferrals: React.FC = () => {
  const { showToast } = useToast();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTION_REQUIRED' | 'COMPLETED'>('ACTION_REQUIRED');

  // Navigation Modal
  const [selectedReferral, setSelectedReferral] = useState<any | null>(null);
  const [navigationNotes, setNavigationNotes] = useState('');
  const [transportArranged, setTransportArranged] = useState('102 Janani Shishu Ambulance');
  const [scheduledDate, setScheduledDate] = useState('2026-09-17');
  const [newStatus, setNewStatus] = useState('ACCEPTED');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReferrals = async () => {
    setIsLoading(true);
    try {
      const res = await ashaService.getReferrals();
      if (res.success) {
        setReferrals(res.referrals || []);
      }
    } catch {
      showToast('Failed to load referrals.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleNavigationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReferral) return;

    setIsSubmitting(true);
    try {
      const res = await ashaService.assistReferral(selectedReferral.id, {
        navigationNotes,
        transportArranged,
        scheduledDate,
        status: newStatus,
      });

      if (res.success) {
        showToast('Referral navigation updated! Patient and tertiary hospital synchronized.', 'success');
        setSelectedReferral(null);
        setNavigationNotes('');
        await fetchReferrals();
      }
    } catch {
      showToast('Failed to update referral navigation.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = referrals.filter((r) => {
    if (activeTab === 'ACTION_REQUIRED') return r.status === 'SENT' || r.status === 'RECEIVED' || r.status === 'ACCEPTED' || r.status === 'Initiated';
    if (activeTab === 'COMPLETED') return r.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <GitFork className="w-3.5 h-3.5" />
            <span>Referral Navigator Desk</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            Inter-Facility Referral Tracking & Navigation
          </h1>
          <p className="text-xs text-slate-500">
            Assisting village patients through tertiary referrals, arranging transport, and closing the referral care loop
          </p>
        </div>

        <button
          onClick={fetchReferrals}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Feature Explanation Banner */}
      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center gap-3 text-xs text-teal-900">
        <Sparkles className="w-5 h-5 text-teal-600 shrink-0" />
        <div>
          <strong className="block font-bold">Referral Navigator Workflow</strong>
          <span>
            When a doctor refers a patient to a secondary/tertiary hospital, the ASHA worker receives an immediate coordination task to assist with transit, document packaging, and appointment arrival. ASHA does not alter clinical referral decisions.
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'ACTION_REQUIRED', label: 'Navigation Required' },
          { id: 'COMPLETED', label: 'Completed Referrals' },
          { id: 'ALL', label: 'All Tracked Cases' },
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

      {/* Referral Cards */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading referral pipeline...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
            No referrals found in this view.
          </div>
        ) : (
          filtered.map((r: any) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-teal-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-teal-50 text-teal-800 border border-teal-200">
                    {r.referralCode || 'REF-2026-001'}
                  </span>
                  <strong className="text-sm text-slate-900">{r.patientName}</strong>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      r.priority === 'Emergency'
                        ? 'bg-red-500 text-white animate-pulse'
                        : r.priority === 'Urgent'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {r.priority} Priority
                  </span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase self-start sm:self-auto ${
                    r.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  Status: {r.status}
                </span>
              </div>

              {/* Transit Pathway */}
              <div className="p-3 bg-slate-50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Origin Facility</span>
                  <p className="font-semibold text-slate-800">{r.fromFacilityName}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-teal-600 hidden sm:block shrink-0" />
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Destination Specialist Facility</span>
                  <p className="font-semibold text-teal-700">{r.toFacilityName}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Specialty Required</span>
                  <p className="font-semibold text-slate-800">{r.specialtyRequired}</p>
                </div>
              </div>

              <div className="text-xs text-slate-600">
                Reason: <strong>{r.reason}</strong>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <span>Transport Mode: <strong>{r.transportMode || '102 Janani Shishu'}</strong></span>
                <button
                  onClick={() => {
                    setSelectedReferral(r);
                    setNavigationNotes(`Assisted ${r.patientName} with referral transit & appointment confirmation.`);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" /> Navigate Patient
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Navigation Modal */}
      {selectedReferral && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Truck className="w-5 h-5 text-teal-600" />
                  Referral Navigation: {selectedReferral.patientName}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedReferral.referralCode} • {selectedReferral.toFacilityName}
                </p>
              </div>
              <button onClick={() => setSelectedReferral(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleNavigationSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Transport Arrangement</label>
                <select
                  value={transportArranged}
                  onChange={(e) => setTransportArranged(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="102 Janani Shishu Ambulance">102 Janani Shishu Ambulance (Free Transit)</option>
                  <option value="108 Advanced Emergency Transit">108 Advanced Emergency Transit</option>
                  <option value="Community Shared Shuttle">Community Shared Shuttle</option>
                  <option value="Family Arranged Transit">Family Arranged Transit</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Referral Status Update</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="ACCEPTED">Transit Facilitated / Accepted</option>
                    <option value="SCHEDULED">Specialist Appointment Scheduled</option>
                    <option value="COMPLETED">Attended & Consulted (Closed)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Navigation Assistance Notes</label>
                <textarea
                  rows={3}
                  value={navigationNotes}
                  onChange={(e) => setNavigationNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Record how patient was assisted (e.g. accompanied family to Civil Hospital, verified documents)..."
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 border border-slate-200">
                Notice: Clinical referral criteria and physician decisions are immutable. ASHA worker navigates transit and patient adherence.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedReferral(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Save Navigation Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
