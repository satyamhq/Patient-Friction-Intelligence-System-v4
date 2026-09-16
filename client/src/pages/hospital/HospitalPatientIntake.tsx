import React, { useState } from 'react';
import {
  ClipboardCheck,
  UserPlus,
  Search,
  ShieldCheck,
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  CreditCard,
  PlusCircle,
} from 'lucide-react';

interface IntakeRecord {
  id: string;
  tokenNumber: string;
  patientName: string;
  ageGender: string;
  department: string;
  triagePriority: 'RED' | 'YELLOW' | 'GREEN';
  schemeType: 'PM-JAY' | 'STATE_SCHEME' | 'SELF_PAY';
  status: 'Waiting' | 'Triaged' | 'Admitted' | 'Consulting';
  intakeTime: string;
}

export const HospitalPatientIntake: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'queue' | 'new_intake'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // New Intake Form States
  const [formPatientName, setFormPatientName] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formGender, setFormGender] = useState('Female');
  const [formPhone, setFormPhone] = useState('');
  const [formDepartment, setFormDepartment] = useState('General Medicine');
  const [formTriage, setFormTriage] = useState<'RED' | 'YELLOW' | 'GREEN'>('GREEN');
  const [formScheme, setFormScheme] = useState<'PM-JAY' | 'STATE_SCHEME' | 'SELF_PAY'>('PM-JAY');

  const [intakeList, setIntakeList] = useState<IntakeRecord[]>([
    {
      id: 'intake-1',
      tokenNumber: 'INT-101',
      patientName: 'Kavita Kumari',
      ageGender: '28F',
      department: 'Obstetrics & Gynaecology',
      triagePriority: 'YELLOW',
      schemeType: 'PM-JAY',
      status: 'Triaged',
      intakeTime: '10 mins ago',
    },
    {
      id: 'intake-2',
      tokenNumber: 'INT-102',
      patientName: 'Devendra Prasad',
      ageGender: '59M',
      department: 'Cardiology',
      triagePriority: 'RED',
      schemeType: 'PM-JAY',
      status: 'Admitted',
      intakeTime: '25 mins ago',
    },
    {
      id: 'intake-3',
      tokenNumber: 'INT-103',
      patientName: 'Sonu Verma',
      ageGender: '12M',
      department: 'Pediatrics',
      triagePriority: 'GREEN',
      schemeType: 'STATE_SCHEME',
      status: 'Waiting',
      intakeTime: '32 mins ago',
    },
    {
      id: 'intake-4',
      tokenNumber: 'INT-104',
      patientName: 'Fatima Khatun',
      ageGender: '42F',
      department: 'General Medicine',
      triagePriority: 'GREEN',
      schemeType: 'SELF_PAY',
      status: 'Consulting',
      intakeTime: '45 mins ago',
    },
  ]);

  const handleCreateIntake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPatientName) return;

    const newRecord: IntakeRecord = {
      id: `intake-${Date.now()}`,
      tokenNumber: `INT-${100 + intakeList.length + 1}`,
      patientName: formPatientName,
      ageGender: `${formAge}${formGender.substring(0, 1)}`,
      department: formDepartment,
      triagePriority: formTriage,
      schemeType: formScheme,
      status: formTriage === 'RED' ? 'Admitted' : 'Waiting',
      intakeTime: 'Just now',
    };

    setIntakeList([newRecord, ...intakeList]);
    setFormPatientName('');
    setFormAge('');
    setFormPhone('');
    setActiveTab('queue');
    setSuccessMessage(`Patient ${newRecord.patientName} intake registered with Token ${newRecord.tokenNumber}`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const filteredList = intakeList.filter((item) =>
    item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold mb-2">
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Frontline Hospital Admissions</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Patient Intake & Registration Desk
            </h1>
            <p className="text-teal-100/80 text-sm max-w-2xl mt-1 leading-relaxed">
              Process incoming ambulatory walk-ins, casualty admissions, and Ayushman Bharat PM-JAY cashless package verifications with immediate triage classification.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('new_intake')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register New Patient</span>
            </button>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'queue'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Intake Roster ({intakeList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('new_intake')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'new_intake'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          + Fast-Track Intake Form
        </button>
      </div>

      {activeTab === 'queue' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by token, patient name, department..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-600"
              />
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Showing {filteredList.length} registered intake cases
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Patient Details</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Triage Priority</th>
                  <th className="py-3 px-4">Scheme / Insurance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Arrival</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {item.tokenNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{item.patientName}</div>
                      <div className="text-[11px] text-slate-500">{item.ageGender}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {item.department}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          item.triagePriority === 'RED'
                            ? 'bg-rose-100 text-rose-800'
                            : item.triagePriority === 'YELLOW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.triagePriority} CODE
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                        {item.schemeType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {item.intakeTime}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Assign Bed
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateIntake} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-3xl mx-auto space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-base text-slate-900">Patient Fast-Track Intake Registration</h2>
            <p className="text-xs text-slate-500 mt-0.5">Enter initial vitals, clinical department, and scheme verification.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Patient Name *</label>
              <input
                type="text"
                required
                value={formPatientName}
                onChange={(e) => setFormPatientName(e.target.value)}
                placeholder="e.g. Meera Devi"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Age</label>
                <input
                  type="number"
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value)}
                  placeholder="35"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Gender</label>
                <select
                  value={formGender}
                  onChange={(e) => setFormGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Contact Phone</label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Clinical Department</label>
              <select
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
              >
                <option value="General Medicine">General Medicine</option>
                <option value="Obstetrics & Gynaecology">Obstetrics & Gynaecology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Emergency Casualty">Emergency Casualty</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Triage Priority</label>
              <select
                value={formTriage}
                onChange={(e) => setFormTriage(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
              >
                <option value="GREEN">GREEN - Non-Urgent (Wait up to 60m)</option>
                <option value="YELLOW">YELLOW - Urgent (Wait up to 15m)</option>
                <option value="RED">RED - Immediate Emergency (0m)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Government Scheme / Insurance</label>
              <select
                value={formScheme}
                onChange={(e) => setFormScheme(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium"
              >
                <option value="PM-JAY">Ayushman Bharat (PM-JAY Cashless)</option>
                <option value="STATE_SCHEME">State Health Assurance Fund</option>
                <option value="SELF_PAY">General Self-Pay</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('queue')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold shadow-sm transition-all"
            >
              Generate Intake Token
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
