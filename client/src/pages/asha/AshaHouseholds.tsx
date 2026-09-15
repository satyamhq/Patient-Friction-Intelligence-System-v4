import React, { useState, useEffect } from 'react';
import { ashaService } from '../../services/ashaService';
import { useToast } from '../../context/ToastContext';
import {
  Home,
  Users,
  Search,
  Plus,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  Phone,
  RefreshCw,
  X,
} from 'lucide-react';

export const AshaHouseholds: React.FC = () => {
  const { showToast } = useToast();
  const [households, setHouseholds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newHhId, setNewHhId] = useState('');
  const [familyHead, setFamilyHead] = useState('');
  const [familyPhone, setFamilyPhone] = useState('');
  const [address, setAddress] = useState('');
  const [totalMembers, setTotalMembers] = useState(4);
  const [barrierInput, setBarrierInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHouseholds = async () => {
    setIsLoading(true);
    try {
      const res = await ashaService.getHouseholds();
      if (res.success) {
        setHouseholds(res.households || []);
      }
    } catch {
      showToast('Failed to load household roster.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHouseholds();
  }, []);

  const handleCreateHousehold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHhId.trim() || !familyHead.trim()) {
      showToast('Please enter Household ID and Family Head name.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ashaService.createHousehold({
        householdId: newHhId.trim(),
        familyHead: familyHead.trim(),
        familyHeadPhone: familyPhone.trim(),
        address: address.trim() || 'Rampur Kalan',
        villageName: 'Rampur Kalan',
        subCentre: 'Rampur Sub-Centre',
        phc: 'Phagwara Rural PHC',
        block: 'Phagwara',
        district: 'Kapurthala',
        state: 'Punjab',
        totalMembers: Number(totalMembers) || 1,
        members: [{ name: familyHead.trim(), relation: 'Head', age: 50, gender: 'Not Specified' }],
        accessBarriers: barrierInput ? [barrierInput] : [],
        coordinationStatus: 'Active',
        accessFrictionLevel: 'Low',
      });

      if (res.success) {
        showToast('Household profile registered successfully.', 'success');
        setShowAddModal(false);
        setNewHhId('');
        setFamilyHead('');
        setFamilyPhone('');
        setAddress('');
        setBarrierInput('');
        await fetchHouseholds();
      }
    } catch {
      showToast('Failed to register household.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = households.filter(
    (h) =>
      h.householdId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.familyHead?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Home className="w-3.5 h-3.5" />
            <span>Assigned Coverage: Rampur Kalan (Ward 4 & 5)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            Household Profiles & Family Roster
          </h1>
          <p className="text-xs text-slate-500">
            Registered village households, family members linked to patient identities, and service coordination
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHouseholds}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Household
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by Household ID (e.g. HH-PB-01), Family Head Name, or Address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
        />
      </div>

      {/* Household Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-3 text-center text-slate-400 text-xs py-12">Loading household profiles...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 text-center text-slate-500 text-xs py-12 bg-white rounded-2xl border border-slate-200">
            No households found matching your search.
          </div>
        ) : (
          filtered.map((h) => {
            const members = Array.isArray(h.members) ? h.members : [];
            const barriers = Array.isArray(h.accessBarriers) ? h.accessBarriers : [];

            return (
              <div
                key={h.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-teal-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-teal-50 text-teal-800 border border-teal-200">
                      {h.householdId}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        h.coordinationStatus === 'Needs Assistance'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : h.coordinationStatus === 'Follow-up Due'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {h.coordinationStatus || 'Active'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {h.familyHead} Household
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {h.address}
                    </p>
                    {h.familyHeadPhone && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {h.familyHeadPhone}
                      </p>
                    )}
                  </div>

                  {/* Members Snapshot */}
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-500 font-medium">
                      <span>Family Members ({h.totalMembers || members.length})</span>
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div className="space-y-1">
                      {members.slice(0, 3).map((m: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-800 font-semibold">
                            {m.name} <span className="text-slate-400 font-normal">({m.relation})</span>
                          </span>
                          {m.chronicConditions && m.chronicConditions.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-rose-50 text-rose-700 rounded font-medium">
                              {m.chronicConditions[0]}
                            </span>
                          )}
                        </div>
                      ))}
                      {members.length > 3 && (
                        <p className="text-[10px] text-slate-400 italic">+{members.length - 3} more members registered</p>
                      )}
                    </div>
                  </div>

                  {/* Barriers Alert */}
                  {barriers.length > 0 && (
                    <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Barrier: {barriers[0]}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Last Visit: <strong>{h.lastVisitDate || 'Recent'}</strong></span>
                  <span>Next Due: <strong>{h.nextPlannedVisit || 'Pending'}</strong></span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Household Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Home className="w-5 h-5 text-teal-600" />
                Register New Household Profile
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateHousehold} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Household ID</label>
                <input
                  type="text"
                  placeholder="e.g. HH-PB-07"
                  value={newHhId}
                  onChange={(e) => setNewHhId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Family Head Name</label>
                <input
                  type="text"
                  placeholder="e.g. Gurmukh Singh"
                  value={familyHead}
                  onChange={(e) => setFamilyHead(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98765..."
                    value={familyPhone}
                    onChange={(e) => setFamilyPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Members</label>
                  <input
                    type="number"
                    min={1}
                    value={totalMembers}
                    onChange={(e) => setTotalMembers(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address / Locality</label>
                <input
                  type="text"
                  placeholder="e.g. House 31, Ward 4, Rampur Kalan"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Identified Access Barrier (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Long travel distance, no smartphone"
                  value={barrierInput}
                  onChange={(e) => setBarrierInput(e.target.value)}
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
                  {isSubmitting ? 'Saving...' : 'Save Household'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
