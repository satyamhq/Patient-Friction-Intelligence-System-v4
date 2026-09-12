import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import {
  Building2,
  MapPin,
  Phone,
  Bed,
  Clock,
  Trash2,
  Eye,
  Download,
  Plus,
  Search,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  Activity,
  FileText,
  Stethoscope,
  Printer,
  AlertTriangle,
} from 'lucide-react';

export const AdminHospitals: React.FC = () => {
  const { showToast } = useToast();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  // Modals state
  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
  const [hospitalToDelete, setHospitalToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // New Hospital Form State
  const [newHosp, setNewHosp] = useState({
    name: '',
    type: 'Government',
    tagline: 'Registered Healthcare Facility - 24/7 Triage',
    address: '',
    city: '',
    state: 'Punjab',
    pincode: '144401',
    latitude: 31.2229,
    longitude: 75.7725,
    phone: '',
    emergencyPhone: '108',
    email: '',
    workingHours: '24/7 Emergency & OPD Services',
    emergencyAvailable: true,
    totalBeds: 150,
    availableBeds: 35,
    primaryDeptName: 'General Medicine & Screening',
    headDoctorName: 'Dr. Senior Consultant, MD',
  });

  const loadHospitals = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getAllHospitals();
      if (res.success) {
        setHospitals(res.hospitals || []);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load registered hospitals.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHospitals();
  }, []);

  // Delete hospital handler
  const handleDeleteConfirm = async () => {
    if (!hospitalToDelete) return;
    const hid = hospitalToDelete._id || hospitalToDelete.id;
    setIsDeleting(true);

    try {
      const res = await adminService.deleteHospital(hid);
      if (res.success) {
        showToast(`Hospital "${hospitalToDelete.name}" removed successfully from database.`, 'success');
        setHospitals((prev) => prev.filter((h) => (h._id || h.id) !== hid));
        setHospitalToDelete(null);
      } else {
        showToast(res.message || 'Failed to delete hospital.', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Error deleting hospital.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Create new hospital handler
  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHosp.name || !newHosp.city || !newHosp.phone || !newHosp.email) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }

    setIsSubmittingNew(true);
    try {
      const payload = {
        name: newHosp.name,
        type: newHosp.type,
        tagline: newHosp.tagline,
        address: newHosp.address || `${newHosp.name} Road`,
        city: newHosp.city,
        state: newHosp.state,
        pincode: newHosp.pincode,
        latitude: parseFloat(String(newHosp.latitude)) || 31.2229,
        longitude: parseFloat(String(newHosp.longitude)) || 75.7725,
        phone: newHosp.phone,
        emergencyPhone: newHosp.emergencyPhone || newHosp.phone,
        email: newHosp.email,
        workingHours: newHosp.workingHours,
        emergencyAvailable: newHosp.emergencyAvailable,
        totalBeds: parseInt(String(newHosp.totalBeds), 10) || 100,
        availableBeds: parseInt(String(newHosp.availableBeds), 10) || 20,
        departments: [
          {
            name: newHosp.primaryDeptName || 'General Medicine',
            headDoctorName: newHosp.headDoctorName || 'Chief Medical Officer',
            dailyTokenCapacity: 50,
            availableTokensToday: 25,
            consultationFee: newHosp.type === 'Government' ? 0 : 250,
          },
        ],
      };

      const res = await adminService.createHospital(payload);
      if (res.success) {
        showToast(`Hospital "${newHosp.name}" registered successfully!`, 'success');
        setIsAddModalOpen(false);
        // Reset form
        setNewHosp({
          name: '',
          type: 'Government',
          tagline: 'Registered Healthcare Facility - 24/7 Triage',
          address: '',
          city: '',
          state: 'Punjab',
          pincode: '144401',
          latitude: 31.2229,
          longitude: 75.7725,
          phone: '',
          emergencyPhone: '108',
          email: '',
          workingHours: '24/7 Emergency & OPD Services',
          emergencyAvailable: true,
          totalBeds: 150,
          availableBeds: 35,
          primaryDeptName: 'General Medicine & Screening',
          headDoctorName: 'Dr. Senior Consultant, MD',
        });
        await loadHospitals();
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to register hospital.', 'error');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Export hospital details as JSON
  const handleExportJSON = (hosp: any) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(hosp, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    const safeName = hosp.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadAnchor.setAttribute('download', `${safeName}_hospital_details.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported full details for ${hosp.name}.`, 'info');
  };

  // Filter hospitals based on search and dropdowns
  const filteredHospitals = hospitals.filter((h) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      h.name?.toLowerCase().includes(q) ||
      h.city?.toLowerCase().includes(q) ||
      h.address?.toLowerCase().includes(q) ||
      h.phone?.includes(q) ||
      (h.allTreatedConditions || []).some((c: string) => c.toLowerCase().includes(q));

    const matchesType = typeFilter === 'All' || h.type?.toLowerCase() === typeFilter.toLowerCase();
    const matchesEmergency = !emergencyOnly || h.emergencyAvailable === true;

    return matchesQuery && matchesType && matchesEmergency;
  });

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-7 h-7 text-brand-500" />
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Connected Hospital Registry
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Registered public and private facilities saved in the database with verified OPD tokens, doctor rosters & disease treatments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              {filteredHospitals.length} Registered Facilities
            </span>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              Register New Hospital
            </Button>
          </div>
        </div>

        {/* Filter Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="sm:col-span-6 relative">
            <Input
              placeholder="Search registered hospitals by Name, City, Phone, or Disease (e.g. Heart, Sugar)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
              className="w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>

          <div className="sm:col-span-3">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { label: 'All Facility Types', value: 'All' },
                { label: 'Government Public Hospital', value: 'Government' },
                { label: 'Private Multi-Speciality', value: 'Private' },
                { label: 'Charitable Trust Center', value: 'Charitable' },
              ]}
            />
          </div>

          <div className="sm:col-span-3 flex items-center">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 w-full">
              <input
                type="checkbox"
                checked={emergencyOnly}
                onChange={(e) => setEmergencyOnly(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
              />
              <span>🚨 24/7 Emergency Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Facilities Grid */}
      {filteredHospitals.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">
            No Registered Hospitals Found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No facilities match your search criteria. Click "Register New Hospital" above to add a real hospital facility to the platform.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Register Facility
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHospitals.map((hosp) => {
            const hid = hosp._id || hosp.id;
            const depts = hosp.departments || [];
            const docCount = hosp.doctorsCount || depts.length || 3;
            const conditions = hosp.allTreatedConditions || [];

            return (
              <div
                key={hid}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card space-y-3.5 text-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div className="space-y-3">
                  {/* Top Badges & Emergency */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            hosp.type === 'Government'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : hosp.type === 'Private'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {hosp.type || 'Government'}
                        </span>
                        {hosp.emergencyAvailable && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-2 py-0.5 rounded-full">
                            🚨 24/7 Emergency
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Saved in Database
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                        {hosp.name}
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{hosp.address}, {hosp.city}</span>
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Rating</span>
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                        ★ {hosp.rating || 4.5}
                      </span>
                    </div>
                  </div>

                  {/* Bed & Token Availability Metrics */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Beds Vacant</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {hosp.availableBeds} <span className="font-normal text-slate-500 text-[10px]">/ {hosp.totalBeds}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">OPD Tokens Today</span>
                      <span className="font-bold text-teal-700 dark:text-teal-400">
                        {hosp.totalAvailableTokens ?? 30} <span className="font-normal text-slate-500 text-[10px]">Seats</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Doctors Active</span>
                      <span className="font-bold text-brand-600 dark:text-brand-400">
                        {docCount} Specialists
                      </span>
                    </div>
                  </div>

                  {/* Treated Illnesses Preview */}
                  {conditions.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        🩺 Bimariyon Ka Ilaaj (Treated Conditions):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {conditions.slice(0, 4).map((cond: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded font-medium"
                          >
                            ✓ {cond}
                          </span>
                        ))}
                        {conditions.length > 4 && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold px-1 py-0.5">
                            +{conditions.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Phone & Working Hours */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {hosp.phone || '01824-260230'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Avg Wait: ~{hosp.averageWaitTimeMinutes || 20}m
                    </span>
                  </div>
                </div>

                {/* Card Actions: View Full Details / Export & Remove Facility */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedHospital(hosp)}
                    className="flex-1 py-2 px-3 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-800 dark:text-teal-300 font-bold text-xs rounded-xl border border-teal-200 dark:border-teal-800 flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Details & Export</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHospitalToDelete(hosp)}
                    className="py-2 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-900 flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    title="Remove hospital from registry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: VIEW FULL DETAILS & EXPORT SPLASH (adin-e-lpash-se-sara-hospital-details-nial-aye) */}
      {selectedHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-brand-50 text-brand-700 border border-brand-200">
                    {selectedHospital.type} Facility
                  </span>
                  {selectedHospital.emergencyAvailable && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      🚨 24/7 Emergency Active
                    </span>
                  )}
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    100% Verified Profile
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {selectedHospital.name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-500" />
                  <span>{selectedHospital.address}, {selectedHospital.city}, {selectedHospital.state || 'Punjab'} - {selectedHospital.pincode || '144401'}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHospital(null)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Bed Availability</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {selectedHospital.availableBeds} / {selectedHospital.totalBeds} Vacant
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">OPD Token Capacity</span>
                <p className="font-bold text-teal-700 dark:text-teal-400">
                  {selectedHospital.totalAvailableTokens ?? 30} Available Today
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Avg Wait Time</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  ~{selectedHospital.averageWaitTimeMinutes || 20} Minutes
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">GPS Coordinates</span>
                <p className="font-bold text-slate-900 dark:text-white truncate">
                  {selectedHospital.latitude?.toFixed(4)}, {selectedHospital.longitude?.toFixed(4)}
                </p>
              </div>
            </div>

            {/* Contact & Registration Information */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
                Registration & Contact Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block">General Phone</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedHospital.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Emergency Helpline</span>
                  <span className="font-semibold text-rose-600">{selectedHospital.emergencyPhone || '108'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Contact Email</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{selectedHospital.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Clinical Departments & Doctors */}
            {selectedHospital.departments && selectedHospital.departments.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-brand-600" />
                  Clinical Departments & Specialist Doctors ({selectedHospital.departments.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedHospital.departments.map((d: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{d.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {d.consultationFee === 0 ? 'FREE OPD' : `₹${d.consultationFee}`}
                        </span>
                      </div>
                      {d.headDoctorName && (
                        <p className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">
                          👨‍⚕️ {d.headDoctorName}
                        </p>
                      )}
                      <div className="text-[10px] text-slate-500 flex justify-between">
                        <span>Timings: {d.opdTimings || '09:00 AM - 02:00 PM'}</span>
                        <span className="font-bold text-teal-600">{d.availableTokensToday ?? 25} Tokens Today</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Treated Diseases & Conditions */}
            {selectedHospital.allTreatedConditions && selectedHospital.allTreatedConditions.length > 0 && (
              <div className="space-y-2 bg-emerald-50/70 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-200/70 dark:border-emerald-900 text-xs">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>🩺</span>
                  बीमारियों का इलाज (Treated Conditions - {selectedHospital.allTreatedConditions.length} Covered)
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedHospital.allTreatedConditions.map((cond: string, cIdx: number) => (
                    <span
                      key={cIdx}
                      className="text-[10px] bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-md font-medium shadow-2xs"
                    >
                      ✓ {cond}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extraction & Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleExportJSON(selectedHospital)}
                  icon={<Download className="w-4 h-4" />}
                  className="flex-1 sm:flex-none"
                >
                  Download JSON Profile
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  icon={<Printer className="w-4 h-4" />}
                  className="flex-1 sm:flex-none"
                >
                  Print Summary
                </Button>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedHospital(null)}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM DELETE HOSPITAL (ye-sara-hospital-reove-ar-do) */}
      {hospitalToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900 max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn text-xs">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/60 rounded-2xl">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Remove Facility from Registry?
                </h3>
                <p className="text-[11px] text-slate-500">
                  This action removes the hospital and its clinical data.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="font-bold text-slate-900 dark:text-white block">
                {hospitalToDelete.name}
              </span>
              <p className="text-[11px] text-slate-500">
                {hospitalToDelete.address}, {hospitalToDelete.city}
              </p>
            </div>

            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to permanently delete this hospital? All associated clinical departments and OPD tokens will be removed from the database.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1"
              >
                {isDeleting ? 'Removing...' : 'Yes, Delete Facility'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHospitalToDelete(null)}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: REGISTER NEW HOSPITAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-fadeIn text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-brand-500" />
                  Register New Hospital Facility
                </h3>
                <p className="text-xs text-slate-500">
                  Save a verified hospital profile to the database with active doctor and token allocations
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHospital} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Hospital Facility Name *"
                  placeholder="e.g. Civil Hospital / City Medical Center"
                  value={newHosp.name}
                  onChange={(e) => setNewHosp({ ...newHosp, name: e.target.value })}
                  required
                />
                <Select
                  label="Facility Type *"
                  value={newHosp.type}
                  onChange={(e) => setNewHosp({ ...newHosp, type: e.target.value })}
                  options={[
                    { label: 'Government Public Hospital', value: 'Government' },
                    { label: 'Private Super Speciality', value: 'Private' },
                    { label: 'Charitable Healthcare Trust', value: 'Charitable' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="City *"
                  placeholder="e.g. Phagwara / Ranchi"
                  value={newHosp.city}
                  onChange={(e) => setNewHosp({ ...newHosp, city: e.target.value })}
                  required
                />
                <Input
                  label="State"
                  value={newHosp.state}
                  onChange={(e) => setNewHosp({ ...newHosp, state: e.target.value })}
                />
                <Input
                  label="Pincode"
                  value={newHosp.pincode}
                  onChange={(e) => setNewHosp({ ...newHosp, pincode: e.target.value })}
                />
              </div>

              <Input
                label="Complete Street Address"
                placeholder="e.g. GT Road, Near Bus Stand"
                value={newHosp.address}
                onChange={(e) => setNewHosp({ ...newHosp, address: e.target.value })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Contact Phone Number *"
                  placeholder="e.g. 01824-260230"
                  value={newHosp.phone}
                  onChange={(e) => setNewHosp({ ...newHosp, phone: e.target.value })}
                  required
                />
                <Input
                  label="Administrator Email *"
                  type="email"
                  placeholder="e.g. contact@civilhospital.org"
                  value={newHosp.email}
                  onChange={(e) => setNewHosp({ ...newHosp, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="Total Beds"
                  type="number"
                  value={newHosp.totalBeds}
                  onChange={(e) => setNewHosp({ ...newHosp, totalBeds: parseInt(e.target.value, 10) || 0 })}
                />
                <Input
                  label="Available Beds Today"
                  type="number"
                  value={newHosp.availableBeds}
                  onChange={(e) => setNewHosp({ ...newHosp, availableBeds: parseInt(e.target.value, 10) || 0 })}
                />
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 pb-2">
                    <input
                      type="checkbox"
                      checked={newHosp.emergencyAvailable}
                      onChange={(e) => setNewHosp({ ...newHosp, emergencyAvailable: e.target.checked })}
                      className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                    />
                    <span>24/7 Emergency Active</span>
                  </label>
                </div>
              </div>

              {/* Initial Clinical Department */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                  Primary OPD Department & Doctor Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Department Name"
                    value={newHosp.primaryDeptName}
                    onChange={(e) => setNewHosp({ ...newHosp, primaryDeptName: e.target.value })}
                  />
                  <Input
                    label="Head Doctor / Specialist"
                    value={newHosp.headDoctorName}
                    onChange={(e) => setNewHosp({ ...newHosp, headDoctorName: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmittingNew}
                  className="flex-1"
                >
                  {isSubmittingNew ? 'Saving Facility to Database...' : 'Save & Register Facility'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmittingNew}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
