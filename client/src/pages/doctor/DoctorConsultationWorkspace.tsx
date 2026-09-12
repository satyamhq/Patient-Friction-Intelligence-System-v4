import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doctorService, ConsultationRecord } from '../../services/doctorService';
import { queueService } from '../../services/queueService';
import { useToast } from '../../context/ToastContext';
import {
  Stethoscope,
  User,
  Activity,
  Pill,
  FileText,
  Clock,
  Plus,
  Trash2,
  Send,
  ArrowLeft,
  CheckCircle2,
  GitFork,
  AlertTriangle,
  History,
} from 'lucide-react';

export const DoctorConsultationWorkspace: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const patientNameParam = searchParams.get('patient') || 'Sunita Devi';
  const tokenParam = searchParams.get('token') || '104';

  const [patientName, setPatientName] = useState(patientNameParam);
  const [age, setAge] = useState('60');
  const [gender, setGender] = useState('Female');
  const [bloodPressure, setBloodPressure] = useState('138/88 mmHg');
  const [pulse, setPulse] = useState('76 bpm');
  const [spO2, setSpO2] = useState('98%');

  const [symptoms, setSymptoms] = useState('Persistent morning dizziness, joint pain in knees, occasional chest heaviness');
  const [diagnosis, setDiagnosis] = useState('Essential Primary Hypertension with Mild Osteoarthritis');

  const [prescription, setPrescription] = useState([
    { medicine: 'Tab. Telmisartan 40mg', dosage: '1 Tablet', frequency: 'Once daily (Morning)', duration: '30 Days' },
    { medicine: 'Tab. Paracetamol 650mg', dosage: '1 Tablet', frequency: 'As needed for joint pain', duration: '5 Days' },
  ]);

  const [labTests, setLabTests] = useState<string[]>(['Serum Creatinine', 'Lipid Profile (Fasting)', 'ECG (12 Lead)']);
  const [newLabTest, setNewLabTest] = useState('');
  const [followUpDays, setFollowUpDays] = useState(14);
  const [referralHospital, setReferralHospital] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add medicine row
  const addMedicine = () => {
    setPrescription([...prescription, { medicine: '', dosage: '1 Tab', frequency: 'Once daily', duration: '14 Days' }]);
  };

  const removeMedicine = (index: number) => {
    setPrescription(prescription.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: string, value: string) => {
    const updated = [...prescription];
    (updated[index] as any)[field] = value;
    setPrescription(updated);
  };

  const addLabTest = () => {
    if (newLabTest.trim() && !labTests.includes(newLabTest.trim())) {
      setLabTests([...labTests, newLabTest.trim()]);
      setNewLabTest('');
    }
  };

  const removeLabTest = (test: string) => {
    setLabTests(labTests.filter((t) => t !== test));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      showToast('Please enter a clinical diagnosis.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const data: ConsultationRecord = {
        patientId: 'pt-' + Date.now(),
        patientName,
        symptoms,
        diagnosis,
        prescription,
        labTests,
        followUpDays,
        referralHospital: referralHospital || undefined,
      };

      const res = await doctorService.recordConsultation(data);
      if (res.success) {
        showToast('Consultation saved & digital prescription dispatched to patient vault.', 'success');
        navigate('/doctor/dashboard');
      }
    } catch {
      showToast('Failed to record consultation. Please retry.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-teal-600" />
              Clinical Consultation Desk & e-Prescription
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live OPD Desk • Token #{tokenParam} • {patientName}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Active Clinical Session
        </span>
      </div>

      {/* Patient Vitals Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-teal-600" />
            Patient Vitals & Intake Snapshot
          </span>
          <span className="text-slate-400 font-normal">Recorded by OPD Triage Desk</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <span className="text-slate-400 block">Patient</span>
            <strong className="text-slate-900 dark:text-white text-sm">{patientName}</strong>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <span className="text-slate-400 block">Demographics</span>
            <strong className="text-slate-900 dark:text-white text-sm">{age} yrs • {gender}</strong>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <span className="text-slate-400 block">Blood Pressure</span>
            <strong className="text-teal-600 text-sm">{bloodPressure}</strong>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <span className="text-slate-400 block">Pulse Rate</span>
            <strong className="text-slate-900 dark:text-white text-sm">{pulse}</strong>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
            <span className="text-slate-400 block">Oxygen SpO2</span>
            <strong className="text-emerald-600 text-sm">{spO2}</strong>
          </div>
        </div>
      </div>

      {/* Consultation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Symptoms & Clinical Examination */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            1. Symptoms & Clinical Examination
          </h3>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Chief Complaints & Patient Symptoms
            </label>
            <textarea
              rows={2}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Clinical Diagnosis (ICD Standard)
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Type 2 Diabetes Mellitus / Acute Bronchitis"
              className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white outline-none font-semibold"
            />
          </div>
        </div>

        {/* Digital e-Prescription */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" />
              2. Digital e-Prescription (e-Aushadhi Formularies)
            </h3>
            <button
              type="button"
              onClick={addMedicine}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-xl border border-teal-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Medicine
            </button>
          </div>

          <div className="space-y-3">
            {prescription.map((rx, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 items-center"
              >
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    placeholder="Medicine Name & Strength"
                    value={rx.medicine}
                    onChange={(e) => updateMedicine(idx, 'medicine', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Dosage (e.g. 1 Tab)"
                    value={rx.dosage}
                    onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    placeholder="Frequency (e.g. Twice Daily)"
                    value={rx.frequency}
                    onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-1">
                  <input
                    type="text"
                    placeholder="Duration"
                    value={rx.duration}
                    onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => removeMedicine(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostic Lab Tests & Referrals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lab Orders */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              3. Laboratory Diagnostic Orders
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Thyroid Panel / Urine Routine"
                value={newLabTest}
                onChange={(e) => setNewLabTest(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
              <button
                type="button"
                onClick={addLabTest}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
              >
                Add Test
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {labTests.map((test) => (
                <span
                  key={test}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                >
                  {test}
                  <button type="button" onClick={() => removeLabTest(test)} className="text-slate-400 hover:text-rose-500">
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Follow-up & Referral */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <GitFork className="w-5 h-5 text-teal-600" />
              4. Follow-up & Specialty Referral
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Next Follow-up Window
              </label>
              <select
                value={followUpDays}
                onChange={(e) => setFollowUpDays(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value={7}>After 7 Days (1 Week)</option>
                <option value={14}>After 14 Days (2 Weeks)</option>
                <option value={30}>After 30 Days (1 Month)</option>
                <option value={90}>After 90 Days (Quarterly Chronic Review)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Referral to Tertiary Facility (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. PGIMER Chandigarh (Cardiology Department)"
                value={referralHospital}
                onChange={(e) => setReferralHospital(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Submit Consultation */}
        <div className="pt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/doctor/dashboard')}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-teal-600/25 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Complete Consultation & Issue e-Prescription
          </button>
        </div>
      </form>
    </div>
  );
};
