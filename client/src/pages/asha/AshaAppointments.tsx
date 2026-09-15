import React, { useState, useEffect } from 'react';
import { ashaService } from '../../services/ashaService';
import { useToast } from '../../context/ToastContext';
import {
  Clock,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Calendar,
  Building,
  User,
  X,
  Phone,
  ArrowRight,
} from 'lucide-react';

export const AshaAppointments: React.FC = () => {
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [patientName, setPatientName] = useState('Sunita Devi');
  const [hospitalName, setHospitalName] = useState('Phagwara Rural PHC');
  const [department, setDepartment] = useState('General Medicine OPD');
  const [scheduledDate, setScheduledDate] = useState('2026-09-16');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [notes, setNotes] = useState('Patient requires assisted transport and vernacular language escort.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await ashaService.getAppointments();
      if (res.success) {
        setAppointments(res.appointments || []);
      }
    } catch {
      showToast('Failed to load appointments.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      showToast('Please enter beneficiary name.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ashaService.createAppointment({
        patientName,
        hospitalName,
        department,
        scheduledDate,
        timeSlot,
        notes,
      });

      if (res.success) {
        showToast(`Appointment confirmed! Token #${res.appointment.tokenNumber} issued to patient & hospital queue.`, 'success');
        setShowModal(false);
        await fetchAppointments();
      }
    } catch {
      showToast('Failed to book appointment assistance.', 'error');
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
            <Clock className="w-3.5 h-3.5" />
            <span>Shared Appointment Assistance Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            Beneficiary Appointment Assistance Desk
          </h1>
          <p className="text-xs text-slate-500">
            Assisting non-digital villagers with doctor appointments. Synchronized across Patient, Hospital, and Doctor portals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAppointments}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        </div>
      </div>

      {/* Shared Architecture Notice */}
      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center gap-3 text-xs text-teal-900">
        <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
        <div>
          <strong className="block font-bold">Single Canonical Appointment Entity</strong>
          <span>
            Appointments booked here appear instantly in the Hospital check-in roster, Doctor's consultation schedule, and the patient's personal appointment vault.
          </span>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
            No assisted appointments on record yet. Click "Book Appointment" to assist a patient.
          </div>
        ) : (
          appointments.map((apt: any) => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 hover:border-teal-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold font-mono bg-teal-50 text-teal-800 border border-teal-200">
                    Token #{apt.token_number || apt.tokenNumber || '105'}
                  </span>
                  <strong className="text-sm text-slate-900">
                    {apt.patient_name || apt.patientName || 'Sunita Devi'}
                  </strong>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                    {apt.status || 'CONFIRMED'}
                  </span>
                </div>

                <span className="text-xs font-semibold text-slate-500">
                  Scheduled: {apt.scheduled_date || apt.scheduledDate} ({apt.time_slot || apt.timeSlot || '10:00 AM'})
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Facility: <strong>Phagwara Rural PHC</strong> • Department: <strong>{apt.service_id || 'General Medicine OPD'}</strong>
              </p>

              {apt.friction_notes && (
                <p className="text-[11px] text-slate-500 italic">
                  Assistance Notes: "{apt.friction_notes}"
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                Book Appointment on Behalf of Beneficiary
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-3 text-xs">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Health Facility</label>
                  <select
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Phagwara Rural PHC">Phagwara Rural PHC</option>
                    <option value="Civil Hospital Kapurthala">Civil Hospital Kapurthala</option>
                    <option value="Sub-Centre Rampur">Sub-Centre Rampur</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="General Medicine OPD">General Medicine OPD</option>
                    <option value="Maternal ANC & Gynaecology">Maternal ANC & Gynaecology</option>
                    <option value="NCD Screening & Diabetes Desk">NCD Screening & Diabetes Desk</option>
                    <option value="Paediatrics & Immunization">Paediatrics & Immunization</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time Slot</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                    <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assistance Notes (Transport / Escort Details)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400"
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
                  {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
