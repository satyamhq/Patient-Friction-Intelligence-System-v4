import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  Video,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building,
  User,
  Phone,
  ArrowRight,
  Info,
  Sliders,
  X,
} from 'lucide-react';

export const AshaTeleconsult: React.FC = () => {
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [patientName, setPatientName] = useState('Sunita Devi');
  const [specialist, setSpecialist] = useState('Dr. Priya Sharma (General Medicine)');
  const [slot, setSlot] = useState('Today, 04:00 PM');
  const [reason, setReason] = useState('Quarterly hypertension review & lab report evaluation');

  const [sessions, setSessions] = useState([
    {
      id: 'tc-101',
      patientName: 'Sunita Devi',
      doctorName: 'Dr. Priya Sharma',
      specialty: 'General Medicine',
      scheduledTime: 'Today, 04:00 PM',
      status: 'SCHEDULED',
      reason: 'Doorstep assisted review for hypertension & blood sugar',
      facility: 'Phagwara Rural PHC Tele-hub',
    },
    {
      id: 'tc-102',
      patientName: 'Amrik Chand',
      doctorName: 'Dr. Anand Shinde',
      specialty: 'Endocrinology / Diabetes',
      scheduledTime: 'Tomorrow, 11:30 AM',
      status: 'CONFIRMED',
      reason: 'Insulin titration & diet review following elevated HbA1c',
      facility: 'Civil Hospital Kapurthala eSanjeevani Node',
    },
  ]);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const newS = {
      id: 'tc-' + Date.now(),
      patientName,
      doctorName: specialist,
      specialty: 'General Medicine',
      scheduledTime: slot,
      status: 'CONFIRMED',
      reason,
      facility: 'Phagwara Rural PHC Tele-hub',
    };
    setSessions([newS, ...sessions]);
    setShowModal(false);
    showToast('Assisted teleconsultation slot reserved.', 'success');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Video className="w-3.5 h-3.5" />
            <span>Assisted Teleconsultation Desk</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            Frontline Teleconsultation Assistance
          </h1>
          <p className="text-xs text-slate-500">
            Connecting rural beneficiaries directly to specialist medical officers from the village sub-centre
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Request Assisted Teleconsult
        </button>
      </div>

      {/* Integration Required Notice (Section 19 & 31) */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold">
            Telemedicine API Status: Integration Required (Demo / Test Workflow Engine Active)
          </strong>
          <p className="text-slate-600">
            PFIS maintains full schedule, booking, and doctor-patient queue synchronisation. Live WebRTC video streams require the national eSanjeevani or institutional telemedicine gateway integration. Real clinical records and consultation desk entries are processed securely through the PFIS backend.
          </p>
        </div>
      </div>

      {/* Teleconsultation Sessions */}
      <div className="space-y-3">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3 hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-sm text-slate-900">{s.patientName}</strong>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                  {s.specialty}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                  {s.status}
                </span>
              </div>

              <p className="text-xs text-slate-600">
                Clinician: <strong>{s.doctorName}</strong> • Node: <strong>{s.facility}</strong>
              </p>

              <p className="text-[11px] text-slate-500">
                Reason: <strong>{s.reason}</strong>
              </p>

              <p className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Scheduled Slot: {s.scheduledTime}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => showToast('Connecting to teleconsultation node... External API gateway integration required.', 'info')}
                className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
              >
                <Video className="w-3.5 h-3.5" /> Open Session Room
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Video className="w-5 h-5 text-teal-600" />
                Schedule Assisted Teleconsultation
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3 text-xs">
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
                <label className="block font-bold text-slate-700 mb-1">Select Physician / Specialist</label>
                <select
                  value={specialist}
                  onChange={(e) => setSpecialist(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Dr. Priya Sharma (General Medicine)">Dr. Priya Sharma (General Medicine OPD Lead)</option>
                  <option value="Dr. Anand Shinde (Internal Medicine)">Dr. Anand Shinde (Internal Medicine / NCD)</option>
                  <option value="Dr. Sneha Kulkarni (Paediatrics)">Dr. Sneha Kulkarni (Paediatrics & Child Health)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Preferred Slot</label>
                <input
                  type="text"
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chief Clinical Reason</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
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
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm"
                >
                  Reserve Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
