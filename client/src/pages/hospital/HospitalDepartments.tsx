import React, { useState, useEffect } from 'react';
import { hospitalService } from '../../services/hospitalService';
import { HospitalDepartment, Hospital } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useToast } from '../../context/ToastContext';
import {
  Layers,
  Plus,
  CheckCircle2,
  Clock,
  Users,
  Building2,
  Stethoscope,
  Trash2,
  Edit2,
  X,
  AlertTriangle,
} from 'lucide-react';

export const HospitalDepartments: React.FC = () => {
  const { showToast } = useToast();
  const [departments, setDepartments] = useState<HospitalDepartment[]>([]);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<HospitalDepartment | null>(null);
  const [deptToDelete, setDeptToDelete] = useState<HospitalDepartment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDoctor, setFormDoctor] = useState('');
  const [formTimings, setFormTimings] = useState('09:00 AM - 02:00 PM');
  const [formCapacity, setFormCapacity] = useState(50);
  const [formAvailable, setFormAvailable] = useState(25);
  const [formFee, setFormFee] = useState(0);
  const [formDescription, setFormDescription] = useState('');
  const [formConditions, setFormConditions] = useState('');
  const [formDays, setFormDays] = useState<string[]>([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]);

  const allWeekDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const loadDepts = async () => {
    try {
      setIsLoading(true);
      const res = await hospitalService.getMyProfile();
      if (res.success) {
        setHospital(res.hospital);
        setDepartments(res.departments || []);
      }
    } catch (e) {
      console.error(e);
      showToast('Failed to load departments.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDepts();
  }, []);

  const openAddModal = () => {
    setEditingDept(null);
    setFormName('');
    setFormDoctor('');
    setFormTimings('09:00 AM - 02:00 PM');
    setFormCapacity(50);
    setFormAvailable(25);
    setFormFee(0);
    setFormDescription('');
    setFormConditions('Viral Fever, Diabetes, High Blood Pressure');
    setFormDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
    setIsAddModalOpen(true);
  };

  const openEditModal = (dept: HospitalDepartment) => {
    setEditingDept(dept);
    setFormName(dept.name);
    setFormDoctor(dept.headDoctorName || (dept as any).head_doctor_name || '');
    setFormTimings(dept.opdTimings || '09:00 AM - 02:00 PM');
    setFormCapacity(dept.dailyTokenCapacity || (dept as any).total_daily_tokens || 50);
    setFormAvailable(dept.availableTokensToday || (dept as any).available_tokens || 25);
    setFormFee(dept.consultationFee || (dept as any).fee || 0);
    setFormDescription(dept.description || '');
    const conds = Array.isArray(dept.treatedConditions)
      ? dept.treatedConditions.join(', ')
      : 'General Consultation, Triage';
    setFormConditions(conds);
    setFormDays(
      Array.isArray(dept.opdDays) && dept.opdDays.length > 0
        ? dept.opdDays
        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    );
    setIsAddModalOpen(true);
  };

  const toggleDay = (day: string) => {
    setFormDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDoctor.trim()) {
      showToast('Please enter both Department Name and Doctor Name.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const condList = formConditions
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

      const payload = {
        name: formName.trim(),
        headDoctorName: formDoctor.trim(),
        head_doctor_name: formDoctor.trim(),
        opdDays: formDays,
        opdTimings: formTimings.trim(),
        dailyTokenCapacity: parseInt(String(formCapacity), 10) || 50,
        availableTokensToday: parseInt(String(formAvailable), 10) || 25,
        consultationFee: parseFloat(String(formFee)) || 0,
        description: formDescription.trim(),
        treatedConditions: condList,
      };

      if (editingDept) {
        const did = editingDept._id || (editingDept as any).id;
        const res = await hospitalService.updateDepartment(did, payload);
        if (res.success) {
          showToast(`Department and Doctor "${formDoctor}" updated successfully!`, 'success');
          setIsAddModalOpen(false);
          await loadDepts();
        }
      } else {
        const res = await hospitalService.addDepartment(payload);
        if (res.success) {
          showToast(`Doctor "${formDoctor}" & Department added successfully!`, 'success');
          setIsAddModalOpen(false);
          await loadDepts();
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to save department.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!deptToDelete) return;
    const did = deptToDelete._id || (deptToDelete as any).id;
    setIsSubmitting(true);

    try {
      const res = await hospitalService.deleteDepartment(did);
      if (res.success) {
        showToast(`Department "${deptToDelete.name}" removed successfully.`, 'success');
        setDepartments((prev) => prev.filter((d) => (d._id || (d as any).id) !== did));
        setDeptToDelete(null);
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to delete department.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-500" />
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Hospital Clinical Departments & Doctor Roster
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure your real doctors on duty, clinical specializations, operating schedules & live token seat allocations
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={openAddModal}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Doctor & Department
        </Button>
      </div>

      {/* Department Cards Grid */}
      {departments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card space-y-3">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base">
            No Doctors or Clinical Departments Configured
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Add your active clinical departments and specialist doctors on duty so patients can view and book OPD token seats.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={openAddModal}
            icon={<Plus className="w-4 h-4" />}
          >
            Add First Doctor & Department
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept) => {
            const did = dept._id || (dept as any).id;
            const docName = dept.headDoctorName || (dept as any).head_doctor_name || 'Senior Consultant';
            const conditions = dept.treatedConditions || (dept as any).treated_conditions || [];

            return (
              <div
                key={did}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">
                        Clinical Department
                      </span>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        {dept.name}
                      </h4>
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-bold flex items-center gap-1.5 mt-0.5">
                        <Stethoscope className="w-3.5 h-3.5" />
                        <span>Doctor: {docName}</span>
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {dept.consultationFee === 0 ? 'FREE OPD' : `₹${dept.consultationFee}`}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {dept.description || 'Outpatient clinical consultation, diagnosis, prescription, and token appointment triage.'}
                  </p>

                  {/* Treated Diseases & Clinical Specializations */}
                  {conditions.length > 0 && (
                    <div className="space-y-1 bg-emerald-50/60 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                        🩺 Bimariyon Ka Ilaaj (Treated Illnesses):
                      </span>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {conditions.map((cond: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md font-medium border border-emerald-200 dark:border-emerald-800"
                          >
                            ✓ {cond}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Schedule & Tokens */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">OPD Schedule</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {dept.opdTimings || '09:00 AM - 02:00 PM'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Token Seats Today</span>
                      <span className="font-bold text-teal-700 dark:text-teal-300">
                        {dept.availableTokensToday ?? (dept as any).available_tokens ?? 25} / {dept.dailyTokenCapacity ?? (dept as any).total_daily_tokens ?? 50} Seats
                      </span>
                    </div>
                  </div>

                  {/* Operating Days */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Operating Days:</span>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {(Array.isArray(dept.opdDays)
                        ? dept.opdDays
                        : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                      ).map((day, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-medium"
                        >
                          {day.slice(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions: Edit & Remove */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => openEditModal(dept)}
                    className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Doctor & Dept</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeptToDelete(dept)}
                    className="py-1.5 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-900 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Remove Department"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADD OR EDIT DEPARTMENT & DOCTOR */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-5 animate-fadeIn text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-brand-500" />
                  {editingDept ? 'Edit Doctor & Department' : 'Add Doctor & Department'}
                </h3>
                <p className="text-xs text-slate-500">
                  Enter real doctor qualifications, consultation schedules, and treated diseases
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

            <form onSubmit={handleSaveDepartment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Department Name *"
                  placeholder="e.g. Cardiology / Orthopedics / General Medicine"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
                <Input
                  label="Doctor Name & Qualifications *"
                  placeholder="e.g. Dr. Rajesh Sharma, MD, DM"
                  value={formDoctor}
                  onChange={(e) => setFormDoctor(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input
                  label="OPD Timings"
                  placeholder="09:00 AM - 02:00 PM"
                  value={formTimings}
                  onChange={(e) => setFormTimings(e.target.value)}
                />
                <Input
                  label="Total Daily Tokens"
                  type="number"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(parseInt(e.target.value, 10) || 0)}
                />
                <Input
                  label="Available Tokens Today"
                  type="number"
                  value={formAvailable}
                  onChange={(e) => setFormAvailable(parseInt(e.target.value, 10) || 0)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Consultation Fee (₹)"
                  type="number"
                  placeholder="0 for Free OPD"
                  value={formFee}
                  onChange={(e) => setFormFee(parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Department Overview / Tagline"
                  placeholder="Brief description of care"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              {/* Treated Conditions Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Bimariyon Ka Ilaaj (Treated Diseases - comma separated)
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                  placeholder="e.g. Heart Attack, Chest Pain, High BP, Cholesterol, Arrhythmia"
                  value={formConditions}
                  onChange={(e) => setFormConditions(e.target.value)}
                />
              </div>

              {/* Operating Days Selection */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Operating OPD Days
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {allWeekDays.map((day) => {
                    const isSelected = formDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Saving...' : editingDept ? 'Update Doctor & Dept' : 'Add Doctor & Dept'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM DELETE DEPARTMENT */}
      {deptToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900 max-w-sm w-full p-6 shadow-2xl space-y-4 animate-fadeIn text-xs">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 dark:bg-rose-950/60 rounded-2xl">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete Department?
                </h3>
                <p className="text-[11px] text-slate-500">
                  This will remove the department & doctor from OPD.
                </p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <strong>{deptToDelete.name}</strong>? Patients will no longer be able to book token appointments with this doctor.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteDepartment}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeptToDelete(null)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
