import React, { useState, useEffect, useMemo } from 'react';
import { governmentService } from '../../services/governmentService';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MapPin,
  Bed,
  Shield,
  Filter,
  Check,
  X,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export const GovernmentHospitals: React.FC = () => {
  const { showToast } = useToast();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionId, setActionId] = useState<string | null>(null);

  // Verification modal state
  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
  const [verifyAction, setVerifyAction] = useState<'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | 'SUSPEND'>('APPROVE');
  const [reviewNotes, setReviewNotes] = useState('');

  const fetchHospitals = async () => {
    setIsLoading(true);
    try {
      const res = await governmentService.getAllHospitals();
      if (res.success && res.hospitals) {
        setHospitals(res.hospitals);
      }
    } catch {
      showToast('Failed to load district hospital registry.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleOpenModal = (hospital: any, action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | 'SUSPEND') => {
    setSelectedHospital(hospital);
    setVerifyAction(action);
    setReviewNotes('');
  };

  const handleExecuteVerification = async () => {
    if (!selectedHospital) return;
    const id = selectedHospital.id || selectedHospital._id;
    setActionId(id);
    try {
      const res = await governmentService.verifyHospital(id, {
        action: verifyAction,
        notes: reviewNotes || `Reviewed by District Health Authority. Status: ${verifyAction}`,
        documentsReviewed: ['Registration_Certificate.pdf', 'NQAS_SelfAssessment.pdf'],
      });

      if (res.success) {
        showToast(`Hospital verification status updated to ${verifyAction}.`, 'success');
        setHospitals((prev) =>
          prev.map((h) =>
            (h.id === id || h._id === id)
              ? { ...h, govApprovalStatus: res.hospital.govApprovalStatus, isVerified: res.hospital.isVerified }
              : h
          )
        );
        setSelectedHospital(null);
      }
    } catch {
      showToast('Verification submission failed.', 'error');
    } finally {
      setActionId(null);
    }
  };

  const filteredHospitals = useMemo(() => {
    return hospitals.filter((h) => {
      const matchesSearch =
        h.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.facilityId?.toLowerCase().includes(searchQuery.toLowerCase());

      const status = h.govApprovalStatus || (h.isVerified ? 'APPROVED' : 'PENDING_REVIEW');
      const matchesStatus = statusFilter === 'ALL' || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [hospitals, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Facility Registry & Verification Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            District Healthcare Facilities
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Operational registry, bed telemetry, data provenance, and formal government verification.
          </p>
        </div>

        <button
          onClick={fetchHospitals}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs shadow-xs flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh Registry
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search facility name, facility ID, district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Verification Statuses</option>
            <option value="APPROVED">Approved & Verified</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="CHANGES_REQUESTED">Changes Requested</option>
            <option value="REJECTED">Rejected</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* Facility Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400">Loading facility registry...</div>
      ) : filteredHospitals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
          <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-600 font-bold text-sm">No facilities found.</p>
          <p className="text-slate-400 text-xs">Adjust search filters or refresh the registry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHospitals.map((h) => {
            const status = h.govApprovalStatus || (h.isVerified ? 'APPROVED' : 'PENDING_REVIEW');
            const provenance = h.dataProvenance || { source: 'FACILITY_REPORTED', status: 'FACILITY_REPORTED', lastUpdated: new Date().toISOString() };
            const cap = h.capacity || { generalBeds: h.totalBeds || 60, generalOccupied: 40, icuBeds: 12, utilizationRate: 65 };

            return (
              <div key={h.id || h._id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400">{h.facilityId || 'FAC-PB-100'}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 font-bold text-slate-600 uppercase">{h.tier || 'CIVIL'}</span>
                    </div>
                    <strong className="text-base font-black text-slate-900 block">{h.name}</strong>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {h.address || 'Civil Lines'}, {h.district || 'Kapurthala'}, {h.state || 'Punjab'}
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shrink-0 ${
                    status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    status === 'CHANGES_REQUESTED' ? 'bg-amber-100 text-amber-800' :
                    status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {status}
                  </span>
                </div>

                {/* Capacity & Provenance Cards */}
                <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Total Beds</span>
                    <strong className="text-xs font-bold text-slate-800">{cap.generalBeds || 60}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Occupied</span>
                    <strong className="text-xs font-bold text-slate-800">{cap.generalOccupied || 38}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">ICU Bays</span>
                    <strong className="text-xs font-bold text-slate-800">{cap.icuBeds || 12}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Utilization</span>
                    <strong className="text-xs font-bold text-indigo-600">{cap.utilizationRate || 65}%</strong>
                  </div>
                </div>

                {/* Data Provenance Details */}
                <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div>
                    <span>Data Source: <strong className="text-slate-800">{provenance.source}</strong></span>
                    <span className="block text-[10px] text-slate-400">
                      Updated: {provenance.lastUpdated ? new Date(provenance.lastUpdated).toLocaleDateString() : 'Today'}
                    </span>
                  </div>

                  {/* Verification Workflow Actions */}
                  <div className="flex gap-1.5">
                    {status !== 'APPROVED' && (
                      <button
                        onClick={() => handleOpenModal(h, 'APPROVE')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    {status === 'APPROVED' ? (
                      <button
                        onClick={() => handleOpenModal(h, 'SUSPEND')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenModal(h, 'REQUEST_CHANGES')}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Request Changes
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Verification Action Modal */}
      {selectedHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block">Government Verification Decision</span>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{selectedHospital.name}</h3>
                <span className="text-xs text-slate-500">{selectedHospital.district} • Facility ID: {selectedHospital.facilityId || 'FAC-PB-100'}</span>
              </div>
              <button
                onClick={() => setSelectedHospital(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Verification Action</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'APPROVE', label: 'Approve Facility', color: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
                  { id: 'REQUEST_CHANGES', label: 'Request Changes', color: 'border-amber-500 text-amber-700 bg-amber-50' },
                  { id: 'SUSPEND', label: 'Suspend Facility', color: 'border-rose-500 text-rose-700 bg-rose-50' },
                  { id: 'REJECT', label: 'Reject Registration', color: 'border-red-500 text-red-700 bg-red-50' },
                ].map((act) => (
                  <button
                    key={act.id}
                    onClick={() => setVerifyAction(act.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      verifyAction === act.id ? act.color : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Official Review & Verification Notes</label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Specify regulatory checks, compliance verification, or reasons for requested changes..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedHospital(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteVerification}
                disabled={actionId !== null}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition-all flex items-center justify-center gap-1.5"
              >
                {actionId ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
