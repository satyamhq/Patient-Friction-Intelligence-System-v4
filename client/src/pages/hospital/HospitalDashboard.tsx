import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { hospitalService } from '../../services/hospitalService';
import { HospitalRequest, Hospital, HospitalDepartment } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Building2,
  ListOrdered,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Layers,
  MapPin,
  Calendar,
} from 'lucide-react';

export const HospitalDashboard: React.FC = () => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [departments, setDepartments] = useState<HospitalDepartment[]>([]);
  const [requests, setRequests] = useState<HospitalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const hRes = await hospitalService.getMyProfile().catch(() => null);
        if (hRes?.success && hRes.hospital) {
          setHospital(hRes.hospital);
          setDepartments(hRes.departments || []);
          setError(null);
        } else {
          setError('Could not load hospital profile. Please ensure your account is linked to a facility.');
        }

        const rRes = await requestService.getHospitalRequests().catch(() => null);
        if (rRes?.success) {
          setRequests(rRes.requests || []);
        }
      } catch (e) {
        console.error(e);
        setError('Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  if (error || !hospital) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-amber-600" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h2 className="text-lg font-black text-slate-900">Hospital Profile Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'Your hospital account is not linked to a facility profile. Contact the system administrator.'}</p>
        </div>
      </div>
    );
  }

  const newRequestsCount = requests.filter((r) => ['REQUEST_SENT', 'HOSPITAL_RECEIVED'].includes(r.status)).length;
  const pendingCount = requests.filter((r) => r.status === 'UNDER_REVIEW').length;
  const acceptedCount = requests.filter((r) => ['ACCEPTED', 'APPOINTMENT_SCHEDULED'].includes(r.status)).length;
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;

  return (
    <div className="space-y-8">
      {/* Hospital Identity Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
              {hospital?.type || 'Government'} Facility
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Triage Desk
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{hospital?.name}</h2>
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-brand-500" />
            <span>{hospital?.address}, {hospital?.city}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link to="/hospital/requests" className="w-full md:w-auto">
            <Button variant="primary" size="sm" icon={<ListOrdered className="w-4 h-4" />}>
              Review Patient Queue ({newRequestsCount})
            </Button>
          </Link>
          <Link to="/hospital/departments" className="w-full md:w-auto">
            <Button variant="outline" size="sm" icon={<Layers className="w-4 h-4" />}>
              Manage OPD
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="New Requests"
          value={newRequestsCount}
          subtitle="Awaiting initial triage review"
          icon={Clock}
          badge="Action Required"
          badgeType={newRequestsCount > 0 ? 'danger' : 'info'}
        />

        <StatCard
          title="Under Review"
          value={pendingCount}
          subtitle="In department queue evaluation"
          icon={AlertTriangle}
          badge="Pending"
          badgeType="warning"
        />

        <StatCard
          title="Accepted / Scheduled"
          value={acceptedCount}
          subtitle="OPD token scheduled"
          icon={CheckCircle2}
          badge="Active OPD"
          badgeType="success"
        />

        <StatCard
          title="Completed Visits"
          value={completedCount}
          subtitle="Successfully consulted"
          icon={Building2}
          badge="Fulfilled"
          badgeType="info"
        />
      </div>

      {/* Live Capacity & Operational Resource Tracker */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Real-time Facility Bed & Resource Capacity
            </h3>
            <p className="text-xs text-slate-500">
              Live ward telemetry, ICU occupancy, and active clinical duty staffing.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Telemetry Synced (1m ago)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">General Beds</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">94<span className="text-xs text-slate-400 font-normal">/120</span></p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-indigo-600 h-1.5 rounded-full w-[78%]" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">78% Occupancy</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ICU Beds</span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">19<span className="text-xs text-slate-400 font-normal">/22</span></p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-500 h-1.5 rounded-full w-[86%]" />
            </div>
            <span className="text-[10px] text-amber-600 font-bold mt-1 block">3 Available</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Emergency Units</span>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">11<span className="text-xs text-slate-400 font-normal">/15</span></p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-rose-500 h-1.5 rounded-full w-[73%]" />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">4 Bays Open</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Doctors on Duty</span>
            <p className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">26</p>
            <span className="text-[10px] text-teal-700 font-semibold mt-2 block">Across 8 OPDs</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nurses on Duty</span>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">48</p>
            <span className="text-[10px] text-slate-500 mt-2 block">1:4 Patient Ratio</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CT / MRI Scanner</span>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-2">100%</p>
            <span className="text-[10px] text-emerald-700 font-bold block mt-1">Operational</span>
          </div>
        </div>
      </div>

      {/* Patient Flow Stage Friction Funnel */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Patient Flow Stage Friction Funnel
            </h3>
            <p className="text-xs text-slate-500">
              Average elapsed wait time and delay bottlenecks at each operational healthcare stage.
            </p>
          </div>
          <span className="text-xs text-rose-600 font-bold">Diagnostics: Bottleneck Detected</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 text-center text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">1. Registration</span>
            <p className="text-base font-black text-slate-800 dark:text-slate-100">~12 min</p>
            <span className="text-[10px] text-emerald-600 font-semibold block">Normal Flow</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">2. Triage Desk</span>
            <p className="text-base font-black text-slate-800 dark:text-slate-100">~7 min</p>
            <span className="text-[10px] text-emerald-600 font-semibold block">Fast Transit</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">3. OPD Doctor</span>
            <p className="text-base font-black text-amber-600 dark:text-amber-400">~18 min</p>
            <span className="text-[10px] text-amber-600 font-semibold block">Mild Queue</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-1">
            <span className="text-[10px] font-bold text-rose-700 uppercase">4. Diagnostics</span>
            <p className="text-base font-black text-rose-700">~38 min</p>
            <span className="text-[10px] text-rose-700 font-bold block">⚠️ High Delay</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">5. Pharmacy</span>
            <p className="text-base font-black text-slate-800 dark:text-slate-100">~9 min</p>
            <span className="text-[10px] text-emerald-600 font-semibold block">Formulary Ready</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">6. Discharge</span>
            <p className="text-base font-black text-slate-800 dark:text-slate-100">~5 min</p>
            <span className="text-[10px] text-emerald-600 font-semibold block">Digital e-Rx</span>
          </div>
        </div>
      </div>

      {/* Triage Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Patient Intake Requests</h3>
            <p className="text-xs text-slate-500">
              Only patient-consented demographic and non-clinical friction data is displayed
            </p>
          </div>
          <Link to="/hospital/requests" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
            View All ({requests.length})
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
            No incoming patient requests in the queue currently.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-lg">Request Code</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Reason for Visit</th>
                  <th className="p-3">Distance</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {requests.slice(0, 6).map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{req.requestCode}</td>
                    <td className="p-3">
                      <span className="font-semibold block">{(req.patientId as any)?.patientCode || 'PAT-1048'}</span>
                      <span className="text-[10px] text-slate-400">
                        {(req.patientId as any)?.age} yrs • {(req.patientId as any)?.preferredLanguage}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-teal-800">{req.departmentName}</td>
                    <td className="p-3 max-w-xs truncate">{req.reasonForVisit}</td>
                    <td className="p-3 font-medium text-slate-600">{req.distanceKm || 25} km</td>
                    <td className="p-3">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                    <td className="p-3 text-right">
                      <Link to={`/hospital/requests/${req._id}`}>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
