import React, { useState } from 'react';
import {
  Settings,
  Clock,
  FileSignature,
  Bell,
  Stethoscope,
  Save,
  CheckCircle2,
  Calendar,
  Lock,
  Globe,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DoctorSettings: React.FC = () => {
  const { user } = useAuth();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [slotDuration, setSlotDuration] = useState('15');
  const [opdStartTime, setOpdStartTime] = useState('09:00');
  const [opdEndTime, setOpdEndTime] = useState('14:00');
  const [maxDailyPatients, setMaxDailyPatients] = useState('40');
  const [emergencyTriageNotification, setEmergencyTriageNotification] = useState(true);
  const [digitalSignStatus, setDigitalSignStatus] = useState(true);
  const [genericRxDefault, setGenericRxDefault] = useState(true);
  const [consultationMode, setConsultationMode] = useState('hybrid');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-teal-300">
            <Settings className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
            Clinical Practice Configuration
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Doctor & Practice Settings
        </h1>
        <p className="text-teal-100/80 text-sm max-w-2xl mt-1 leading-relaxed">
          Configure your OPD slot duration, digital signature certificates for e-prescriptions, emergency queue alerts, and consultation availability.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Practice settings and clinical preferences saved successfully!</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. OPD Queue & Slot Timing */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-5 h-5 text-teal-600" />
            <h2 className="font-extrabold text-sm text-slate-900">OPD Queue & Timing Rules</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Consultation Slot Duration (Minutes)
              </label>
              <select
                value={slotDuration}
                onChange={(e) => setSlotDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold focus:border-teal-600 focus:bg-white"
              >
                <option value="10">10 Minutes (Rapid follow-ups)</option>
                <option value="15">15 Minutes (Standard clinical)</option>
                <option value="20">20 Minutes (Comprehensive/Geriatric)</option>
                <option value="30">30 Minutes (Multi-morbid / Specialist)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">OPD Shift Start</label>
                <input
                  type="time"
                  value={opdStartTime}
                  onChange={(e) => setOpdStartTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">OPD Shift End</label>
                <input
                  type="time"
                  value={opdEndTime}
                  onChange={(e) => setOpdEndTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Maximum Daily Token Cap
              </label>
              <input
                type="number"
                value={maxDailyPatients}
                onChange={(e) => setMaxDailyPatients(e.target.value)}
                min="10"
                max="120"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Once reached, overflow tokens will be automatically scheduled for the next session.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Clinical e-Prescription & Compliance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileSignature className="w-5 h-5 text-teal-600" />
            <h2 className="font-extrabold text-sm text-slate-900">e-Prescription & Legal Compliance</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">ABDM Digital Signature</span>
                <span className="text-[11px] text-slate-500">
                  Embed tamper-proof cryptographic token on all signed prescriptions
                </span>
              </div>
              <input
                type="checkbox"
                checked={digitalSignStatus}
                onChange={(e) => setDigitalSignStatus(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-md focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Prioritize Generic Names (NLEM)</span>
                <span className="text-[11px] text-slate-500">
                  Auto-suggest Jan Aushadhi generic names before branded formulations
                </span>
              </div>
              <input
                type="checkbox"
                checked={genericRxDefault}
                onChange={(e) => setGenericRxDefault(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-md focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Consultation Delivery Mode</label>
              <select
                value={consultationMode}
                onChange={(e) => setConsultationMode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold"
              >
                <option value="in_person">In-Person Hospital OPD Only</option>
                <option value="teleconsult">Virtual Teleconsultation Only</option>
                <option value="hybrid">Hybrid (Both In-Person & WebRTC Video)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Real-Time Clinical Triage Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Bell className="w-5 h-5 text-teal-600" />
            <h2 className="font-extrabold text-sm text-slate-900">Clinical Emergency Alerts</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Critical Triage Audio Chime</span>
                <span className="text-[11px] text-slate-500">
                  Play subtle chime when a Red-Code casualty or high-risk maternal patient is queued
                </span>
              </div>
              <input
                type="checkbox"
                checked={emergencyTriageNotification}
                onChange={(e) => setEmergencyTriageNotification(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-md focus:ring-teal-500"
              />
            </div>
          </div>
        </div>

        {/* 4. Credentials & Medical Council Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Lock className="w-5 h-5 text-teal-600" />
            <h2 className="font-extrabold text-sm text-slate-900">National Medical Register (NMC)</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="font-bold text-slate-700 block mb-0.5">Registration Number</span>
              <span className="font-mono text-slate-900 font-bold bg-slate-100 px-2.5 py-1 rounded-md inline-block">
                NMC-DL-2018-094821
              </span>
            </div>
            <div>
              <span className="font-bold text-slate-700 block mb-0.5">Primary Specialization</span>
              <span className="text-slate-800 font-medium">Internal Medicine & Non-Communicable Diseases</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="lg:col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Practice Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
