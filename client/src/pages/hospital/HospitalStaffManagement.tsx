import React, { useState } from 'react';
import {
  Users,
  Search,
  UserCheck,
  Stethoscope,
  Clock,
  Phone,
  CheckCircle2,
  Calendar,
  Filter,
  Shield,
  Plus,
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  status: 'On Duty' | 'In Surgery' | 'On Call' | 'Off Duty';
  shift: string;
  phone: string;
  opdTokensToday: number;
}

export const HospitalStaffManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  const [staffRoster] = useState<StaffMember[]>([
    {
      id: 'st-1',
      name: 'Dr. Anand Swaroop, MD',
      role: 'Senior Consultant Physician',
      department: 'General Medicine',
      status: 'On Duty',
      shift: 'Morning (08:00 - 14:00)',
      phone: '+91 94310 12844',
      opdTokensToday: 24,
    },
    {
      id: 'st-2',
      name: 'Dr. Shalini Sengupta, MS',
      role: 'Chief Obstetrician & Gynaecologist',
      department: 'Obstetrics & Gynaecology',
      status: 'In Surgery',
      shift: 'Full Day (09:00 - 17:00)',
      phone: '+91 98350 49122',
      opdTokensToday: 18,
    },
    {
      id: 'st-3',
      name: 'Dr. Rajesh Nair, DNB',
      role: 'Pediatric Specialist',
      department: 'Pediatrics',
      status: 'On Duty',
      shift: 'Morning (08:00 - 14:00)',
      phone: '+91 91223 88102',
      opdTokensToday: 31,
    },
    {
      id: 'st-4',
      name: 'Dr. Vikramaditya Rao, MS',
      role: 'Orthopedic Surgeon',
      department: 'Orthopedics',
      status: 'On Call',
      shift: 'On-Call Emergency',
      phone: '+91 97714 55190',
      opdTokensToday: 12,
    },
    {
      id: 'st-5',
      name: 'Sister Mary Joseph, B.Sc Nursing',
      role: 'Casualty Head Nurse',
      department: 'Emergency & Casualty',
      status: 'On Duty',
      shift: 'Night Duty (20:00 - 08:00)',
      phone: '+91 94701 33281',
      opdTokensToday: 45,
    },
    {
      id: 'st-6',
      name: 'Dr. Neeraj Kumar, MD',
      role: 'Casualty Medical Officer (CMO)',
      department: 'Emergency & Casualty',
      status: 'On Duty',
      shift: 'Rotational 24/7',
      phone: '+91 98351 90432',
      opdTokensToday: 29,
    },
  ]);

  const filteredStaff = staffRoster.filter((s) => {
    const matchesDept = departmentFilter === 'all' || s.department === departmentFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Clinical Human Resources</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hospital Doctors & Staff Roster
            </h1>
            <p className="text-teal-100/80 text-sm max-w-2xl mt-1 leading-relaxed">
              Monitor active clinical shift coverage, emergency casualty medical officers (CMO), and departmental consultation rosters in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 text-teal-200 border border-white/10">
              Active Shift: 18 Clinicians On Duty
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {[
            { id: 'all', label: 'All Departments' },
            { id: 'General Medicine', label: 'Medicine' },
            { id: 'Obstetrics & Gynaecology', label: 'OB/GYN' },
            { id: 'Pediatrics', label: 'Pediatrics' },
            { id: 'Emergency & Casualty', label: 'Emergency' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setDepartmentFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                departmentFilter === tab.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctors or nurses..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-600"
          />
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    staff.status === 'On Duty'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : staff.status === 'In Surgery'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : staff.status === 'On Call'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {staff.status}
                </span>
              </div>

              <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{staff.name}</h3>
              <p className="text-xs text-teal-800 font-semibold mt-0.5">{staff.role}</p>
              <p className="text-[11px] text-slate-500">{staff.department}</p>

              <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{staff.shift}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono text-slate-700 font-bold">{staff.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Consultations Today:</span>
              <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                {staff.opdTokensToday} tokens
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
