import React, { useState } from 'react';
import {
  Building2,
  Phone,
  ShieldCheck,
  Save,
  CheckCircle2,
  Sliders,
  MapPin,
  Clock,
  KeyRound,
  FileCheck,
} from 'lucide-react';

export const HospitalSettings: React.FC = () => {
  const [success, setSuccess] = useState(false);

  const [hospitalName, setHospitalName] = useState('District Civil Hospital & Trauma Centre');
  const [rohirCode, setRohirCode] = useState('ROHINI-HOSP-DL-1094');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 6205844155');
  const [casualtyBeds, setCasualtyBeds] = useState('12');
  const [icuBeds, setIcuBeds] = useState('16');
  const [autoSurgeAlerts, setAutoSurgeAlerts] = useState(true);
  const [pmjayEmpaneled, setPmjayEmpaneled] = useState(true);
  const [nabhAccredited, setNabhAccredited] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-teal-300">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-300">
            Facility Profile & Operations
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Hospital & Facility Settings
        </h1>
        <p className="text-teal-100/80 text-sm max-w-2xl mt-1 leading-relaxed">
          Manage facility registration credentials, emergency casualty telephone routing, PM-JAY empanelment status, and automated surge thresholds.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Hospital configuration and facility quotas updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Facility Credentials */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-teal-600" />
            <h2 className="font-extrabold text-sm text-slate-900">Hospital Identification</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Facility Name</label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">ROHINI / Registry Code</label>
              <input
                type="text"
                value={rohirCode}
                onChange={(e) => setRohirCode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">24/7 Casualty Emergency Helpline</label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-teal-700"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Patients dialing from the app will be directed to this line (+91 6205844155).
              </p>
            </div>
          </div>
        </div>

        {/* 2. Quotas & Beds Allocation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-teal-600" />
            <h2 className="font-extrabold text-sm text-slate-900">Bed Quotas & Surge Thresholds</h2>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ICU Bed Total</label>
                <input
                  type="number"
                  value={icuBeds}
                  onChange={(e) => setIcuBeds(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Casualty Beds</label>
                <input
                  type="number"
                  value={casualtyBeds}
                  onChange={(e) => setCasualtyBeds(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">Automated Surge Notifications</span>
                <span className="text-[11px] text-slate-500">
                  Alert Chief Medical Officer when bed occupancy surpasses 85%
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoSurgeAlerts}
                onChange={(e) => setAutoSurgeAlerts(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* 3. Accreditation & Compliance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <h2 className="font-extrabold text-sm text-slate-900">National Accreditation</h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">PM-JAY Empanelment Active</span>
                <span className="text-[11px] text-slate-500">
                  Allows direct cashless claims up to ₹5 Lakh per beneficiary
                </span>
              </div>
              <input
                type="checkbox"
                checked={pmjayEmpaneled}
                onChange={(e) => setPmjayEmpaneled(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-md"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-bold text-slate-900 block">NABH / NQAS Certified</span>
                <span className="text-[11px] text-slate-500">
                  Validated against National Quality Assurance Standards
                </span>
              </div>
              <input
                type="checkbox"
                checked={nabhAccredited}
                onChange={(e) => setNabhAccredited(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="lg:col-span-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Facility Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
