import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Lock,
  Users,
  ShieldAlert,
} from 'lucide-react';

export const AdminPermissions: React.FC = () => {
  const { showToast } = useToast();
  const [matrix, setMatrix] = useState<any[]>([]);
  const [rolesSummary, setRolesSummary] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getPermissionsMatrix();
      if (res.success) {
        if (Array.isArray(res.matrix) && res.matrix.length > 0) {
          setMatrix(res.matrix);
        }
        if (Array.isArray(res.rolesSummary)) {
          setRolesSummary(res.rolesSummary);
        }
      }
    } catch {
      showToast('Failed to load permissions matrix.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const defaultMatrix = [
    { capability: 'View Own Health Records & Tokens', patient: true, doctor: true, asha: false, hospital: true, government: false, admin: true, description: 'Direct longitudinal EHR and consultation logs' },
    { capability: 'Conduct Clinical Consultations & Checkups', patient: false, doctor: true, asha: false, hospital: true, government: false, admin: true, description: 'Patient OPD queue review, clinical examination & diagnostic checkup' },
    { capability: 'Prescribe Medicines & Lab Orders', patient: false, doctor: true, asha: false, hospital: false, government: false, admin: false, description: 'Clinical therapeutic decision authority' },
    { capability: 'Initiate & Process Inter-Facility Referrals', patient: false, doctor: true, asha: true, hospital: true, government: true, admin: true, description: 'Inter-hospital emergency and specialty referral network' },
    { capability: 'Conduct Household Visits & High-Risk Triage', patient: false, doctor: false, asha: true, hospital: false, government: false, admin: true, description: 'Frontline field outreach and community registry' },
    { capability: 'Manage Hospital Bed Census & ICU Bays', patient: false, doctor: false, asha: false, hospital: true, government: false, admin: true, description: 'Facility capacity updating and inward admitting' },
    { capability: 'Verify Hospital Licenses & NQAS Approval', patient: false, doctor: false, asha: false, hospital: false, government: true, admin: true, description: 'State and district regulatory accreditation' },
    { capability: 'View De-Identified District Friction Telemetry', patient: false, doctor: false, asha: false, hospital: true, government: true, admin: true, description: 'Macro PFI analytics and access barrier distribution' },
    { capability: 'Read Private Identifiable Clinical Notes', patient: true, doctor: true, asha: false, hospital: true, government: false, admin: false, description: 'Protected clinical notes (Privacy Safeguard: Government/Admin restricted)' },
    { capability: 'Modify Platform Feature Flags & System Config', patient: false, doctor: false, asha: false, hospital: false, government: false, admin: true, description: 'Global administrative configuration & permission controls' },
  ];

  const activeMatrix = matrix.length > 0 && matrix[0].capability ? matrix : defaultMatrix;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              RBAC & PRIVACY BOUNDARIES
            </span>
            <span className="text-xs text-slate-400 font-medium">• DPDP Compliant Access Control</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Role Permissions & Access Control Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict authorization barriers preventing cross-role data leaks between patient clinical confidentiality and government macro oversight.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Matrix</span>
        </button>
      </div>

      {/* Privacy Guarantee Alert */}
      <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <div className="font-bold text-teal-900">
            Enforced Role Separation: Public Health Oversight vs. Clinical Privacy
          </div>
          <div className="text-teal-700/80 mt-0.5">
            Government health officers inspect aggregate district telemetry, bed numbers, and bottlenecks. They have zero cryptographic permission to access private medical prescriptions, lab reports, or identifiable patient names.
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-4">System Capability</th>
                <th className="p-4 text-center">Patient</th>
                <th className="p-4 text-center">Doctor</th>
                <th className="p-4 text-center">ASHA</th>
                <th className="p-4 text-center">Hospital</th>
                <th className="p-4 text-center">Government</th>
                <th className="p-4 text-center">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeMatrix.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{item.capability}</div>
                    <div className="text-[11px] text-slate-400">{item.description}</div>
                  </td>
                  <td className="p-4 text-center">
                    {item.patient ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 inline-block" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 inline-block" />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {item.doctor ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 inline-block" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 inline-block" />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {item.asha ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 inline-block" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 inline-block" />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {item.hospital ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 inline-block" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 inline-block" />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {item.government ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 inline-block" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 inline-block" />
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {item.admin ? (
                      <CheckCircle2 className="w-4 h-4 text-purple-600 inline-block" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-300 inline-block" />
                    )}
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
