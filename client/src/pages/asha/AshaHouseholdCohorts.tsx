import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  HeartPulse,
  Baby,
  Activity,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface CohortGroup {
  id: string;
  name: string;
  count: number;
  icon: React.ElementType;
  description: string;
  priorityLevel: 'High' | 'Routine' | 'Immediate';
  badgeColor: string;
  members: { name: string; ageGender: string; houseNo: string; status: string; lastVisit: string }[];
}

export const AshaHouseholdCohorts: React.FC = () => {
  const [selectedCohort, setSelectedCohort] = useState<string>('maternal');
  const [searchQuery, setSearchQuery] = useState('');

  const cohorts: CohortGroup[] = [
    {
      id: 'maternal',
      name: 'Pregnant Women (ANC)',
      count: 14,
      icon: HeartPulse,
      description: 'Mothers in 1st, 2nd, and 3rd trimesters requiring mandatory ANC 1-4 visits, IFA tablets, and birth preparedness.',
      priorityLevel: 'High',
      badgeColor: 'bg-rose-100 text-rose-800',
      members: [
        { name: 'Pooja Devi', ageGender: '24F', houseNo: 'H-042', status: '3rd Trimester (High BP)', lastVisit: 'Yesterday' },
        { name: 'Kavita Kumari', ageGender: '21F', houseNo: 'H-018', status: '2nd Trimester (Routine)', lastVisit: '4 days ago' },
        { name: 'Anita Devi', ageGender: '29F', houseNo: 'H-104', status: '1st Trimester (Reg Completed)', lastVisit: '1 week ago' },
        { name: 'Reena Kumari', ageGender: '26F', houseNo: 'H-088', status: '3rd Trimester (JSY Enrolled)', lastVisit: '3 days ago' },
      ],
    },
    {
      id: 'infants',
      name: 'Infants & Under-5 (Immunization)',
      count: 32,
      icon: Baby,
      description: 'Children 0 to 5 years tracking National Immunization Schedule (BCG, Pentavalent, MR, Polio) and growth monitoring.',
      priorityLevel: 'Immediate',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      members: [
        { name: 'Master Aarav', ageGender: '9 Months (M)', houseNo: 'H-012', status: 'MR-1 Due Next Tuesday', lastVisit: '5 days ago' },
        { name: 'Baby Pari', ageGender: '14 Weeks (F)', houseNo: 'H-034', status: 'Pentavalent-3 Completed', lastVisit: '2 days ago' },
        { name: 'Master Vihaan', ageGender: '2 Years (M)', houseNo: 'H-076', status: 'Normal Growth (Green MUAC)', lastVisit: '10 days ago' },
      ],
    },
    {
      id: 'elderly_ncd',
      name: 'Elderly & Chronic NCD (30+ Yrs)',
      count: 48,
      icon: Activity,
      description: 'Adults with hypertension, diabetes mellitus, or chronic joint disease requiring monthly BP/sugar checks and refill support.',
      priorityLevel: 'Routine',
      badgeColor: 'bg-teal-100 text-teal-800',
      members: [
        { name: 'Ramswaroop Mahto', ageGender: '68M', houseNo: 'H-003', status: 'BP 142/90 mmHg (Amlodipine)', lastVisit: '1 week ago' },
        { name: 'Shanti Devi', ageGender: '62F', houseNo: 'H-055', status: 'Type 2 Diabetes (Refill Due)', lastVisit: '3 days ago' },
        { name: 'Gopal Prasad', ageGender: '71M', houseNo: 'H-091', status: 'Geriatric Mobility Support', lastVisit: '2 weeks ago' },
      ],
    },
  ];

  const currentCohort = cohorts.find((c) => c.id === selectedCohort) || cohorts[0];

  const filteredMembers = currentCohort.members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.houseNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold mb-2">
              <Users className="w-3.5 h-3.5" />
              <span>Village Sector Demographics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Household Cohorts & Target Populations
            </h1>
            <p className="text-teal-100/80 text-sm max-w-2xl mt-1 leading-relaxed">
              Targeted community grouping across Village Sector 4 (Rampur Block). Plan home visits by vulnerable beneficiary cohorts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/10 text-teal-200 border border-white/10">
              Total Village Households: 184
            </span>
          </div>
        </div>
      </div>

      {/* Cohort Summary Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cohorts.map((cohort) => {
          const Icon = cohort.icon;
          const isSelected = selectedCohort === cohort.id;
          return (
            <button
              key={cohort.id}
              type="button"
              onClick={() => setSelectedCohort(cohort.id)}
              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-teal-50/80 border-teal-500 shadow-sm ring-2 ring-teal-500/20'
                  : 'bg-white border-slate-200 hover:border-teal-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${cohort.badgeColor}`}>
                    {cohort.priorityLevel} Priority
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900">{cohort.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {cohort.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Registered:</span>
                <span className="font-black text-slate-900 text-base">{cohort.count} Citizens</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Cohort Beneficiaries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${currentCohort.name}...`}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-600"
            />
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Showing {filteredMembers.length} beneficiaries in {currentCohort.name}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-extrabold text-[10px]">
              <tr>
                <th className="py-3 px-4">Beneficiary Name</th>
                <th className="py-3 px-4">Age / Gender</th>
                <th className="py-3 px-4">House No.</th>
                <th className="py-3 px-4">Health Status / Milestone</th>
                <th className="py-3 px-4">Last Field Visit</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{m.name}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600">{m.ageGender}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-teal-800">{m.houseNo}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{m.lastVisit}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs"
                    >
                      Log Visit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
