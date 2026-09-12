import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  MapPin,
  ShieldAlert,
  FolderLock,
  User,
  Building2,
  ListOrdered,
  Users,
  GitFork,
  BarChart3,
  Cpu,
  History,
  Sliders,
  Layers,
  Settings,
  Activity,
  FileText,
  Pill,
  HeartPulse,
  HeartHandshake,
  Stethoscope,
  Landmark,
  ToggleRight,
  Shield,
  Video,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  forceRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ forceRole }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const role = forceRole || user?.role;
  if (!role) return null;


  const patientLinks = [
    { name: t('nav.dashboard', 'Dashboard'), path: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Report Healthcare Barrier', path: '/patient/report-friction', icon: ShieldAlert },
    { name: 'Healthcare Access & Facility Router', path: '/patient/triage', icon: Navigation },
    { name: 'Referral Tracking Hub', path: '/patient/referrals', icon: GitFork },
    { name: 'Health Records & ABHA', path: '/patient/health-records', icon: FileText },
    { name: 'Diagnostic Network & Uptime', path: '/patient/diagnostics', icon: Activity },
    { name: 'e-Aushadhi Medicines', path: '/patient/medicines', icon: Pill },
    { name: 'High-Risk Care & Follow-up', path: '/patient/high-risk', icon: HeartPulse },
    { name: 'ASHA Frontline Seva', path: '/patient/frontline', icon: HeartHandshake },
    { name: 'Digital Twin Simulator', path: '/patient/digital-twin', icon: Sliders },
    { name: 'Live Teleconsultation', path: '/patient/teleconsult', icon: Layers },
    { name: t('nav.hospitals', 'Find Nearby Hospitals'), path: '/patient/hospitals', icon: MapPin },
    { name: t('nav.frictionProfile', 'Friction Profile'), path: '/patient/friction', icon: Activity },
    { name: t('nav.accessibilityRisk', 'Accessibility Risk'), path: '/patient/risk', icon: ShieldAlert },
    { name: t('nav.myRequests', 'My Hospital Requests'), path: '/patient/requests', icon: ListOrdered },
    { name: t('nav.myDocuments', 'Document Vault'), path: '/patient/documents', icon: FolderLock },
    { name: t('auth.fullName', 'Profile & Location'), path: '/patient/profile', icon: User },
    { name: t('nav.settings', 'Settings & Language'), path: '/patient/settings', icon: Settings },
  ];

  const hospitalLinks = [
    { name: t('nav.dashboard', 'Hospital Dashboard'), path: '/hospital/dashboard', icon: LayoutDashboard },
    { name: 'Tiered Referral Management', path: '/hospital/referrals', icon: GitFork },
    { name: 'Facility Quality & NQAS', path: '/hospital/facility-metrics', icon: BarChart3 },
    { name: 'Pharmacy Stock (e-Aushadhi)', path: '/hospital/medicines', icon: Pill },
    { name: 'Diagnostic Equipment Status', path: '/hospital/diagnostics', icon: Activity },
    { name: t('nav.triageQueue', 'Patient Requests Queue'), path: '/hospital/requests', icon: ListOrdered },
    { name: 'Teleconsultation Triage', path: '/hospital/teleconsult', icon: Layers },
    { name: t('nav.opdManagement', 'Departments & OPD'), path: '/hospital/departments', icon: Layers },
    { name: t('nav.hospitalProfile', 'Hospital Profile'), path: '/hospital/profile', icon: Building2 },
    { name: t('nav.settings', 'Settings & Language'), path: '/hospital/settings', icon: Settings },
  ];

  const doctorLinks = [
    { name: 'Doctor Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'Consultation Desk', path: '/doctor/consultation', icon: Stethoscope },
    { name: 'Clinical Profile & OPD', path: '/doctor/profile', icon: Stethoscope },
    { name: 'Assigned Patients Queue', path: '/doctor/patients', icon: Users },
    { name: 'Live Teleconsultation', path: '/doctor/teleconsult', icon: Video },
    { name: 'Longitudinal EHR & ABHA', path: '/doctor/health-records', icon: FileText },
    { name: 'Digital Triage Protocol', path: '/doctor/triage', icon: Activity },
    { name: 'Lab Diagnostics Network', path: '/doctor/diagnostics', icon: Activity },
    { name: t('nav.settings', 'Settings & Language'), path: '/doctor/settings', icon: Settings },
  ];

  const ashaLinks = [
    { name: 'ASHA Field Dashboard', path: '/asha/dashboard', icon: LayoutDashboard },
    { name: 'Village Patient Registry', path: '/asha/patients', icon: Users },
    { name: 'High-Risk Escalations', path: '/asha/high-risk', icon: HeartPulse },
    { name: 'Frontline Worker Portal', path: '/asha/frontline', icon: HeartHandshake },
    { name: 'Referral Tracking', path: '/asha/referrals', icon: GitFork },
    { name: t('nav.settings', 'Settings & Language'), path: '/asha/settings', icon: Settings },
  ];

  const governmentLinks = [
    { name: 'State Health Overview', path: '/government/dashboard', icon: LayoutDashboard },
    { name: 'System Impact Evaluation', path: '/admin/judge-mode', icon: BarChart3 },
    { name: 'Hospital Bed Oversight', path: '/government/hospitals', icon: Building2 },
    { name: 'Population Friction Map', path: '/government/friction-map', icon: MapPin },
    { name: 'Resource Interventions', path: '/government/interventions', icon: Sliders },
    { name: t('nav.settings', 'Settings & Language'), path: '/government/settings', icon: Settings },
  ];

  const adminLinks = [
    { name: t('nav.dashboard', 'System Dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'System Impact Evaluation', path: '/admin/judge-mode', icon: BarChart3 },
    { name: 'State Referral Pipeline', path: '/admin/referrals', icon: GitFork },
    { name: 'High-Risk Follow-up Registry', path: '/admin/high-risk', icon: HeartPulse },
    { name: 'NQAS Facility Quality Index', path: '/admin/facility-metrics', icon: BarChart3 },
    { name: 'Friction Digital Twin', path: '/admin/digital-twin', icon: Activity },
    { name: t('nav.whatIfSimulator', 'What-If Simulator'), path: '/admin/simulator', icon: Cpu },
    { name: t('nav.budgetOptimizer', 'Budget Optimizer'), path: '/admin/interventions', icon: Sliders },
    { name: t('nav.populationMap', 'Population Friction Map'), path: '/admin/friction-map', icon: MapPin },
    { name: t('nav.careLeakage', 'Care Leakage Funnel'), path: '/admin/care-leakage', icon: GitFork },
    { name: t('nav.whyCareFailed', 'Why Did Care Fail'), path: '/admin/care-failure', icon: BarChart3 },
    { name: t('nav.patientRegistry', 'Patient Registry'), path: '/admin/patients', icon: Users },
    { name: t('nav.hospitalRegistry', 'Hospital Registry'), path: '/admin/hospitals', icon: Building2 },
    { name: 'User Directory & Roles', path: '/admin/users', icon: Shield },
    { name: 'Dynamic Feature Flags', path: '/admin/feature-flags', icon: ToggleRight },
    { name: t('nav.auditLogs', 'Audit & Compliance Logs'), path: '/admin/audit-logs', icon: History },
    { name: t('nav.settings', 'Settings & Language'), path: '/admin/settings', icon: Settings },
  ];

  const roleLinkMap: Record<string, typeof patientLinks> = {
    patient: patientLinks,
    hospital: hospitalLinks,
    doctor: doctorLinks,
    asha_worker: ashaLinks,
    government: governmentLinks,
    admin: adminLinks,
  };

  const links = roleLinkMap[role] || patientLinks;

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden lg:flex shrink-0">
      <div className="space-y-6">
        <div>
          <h5 className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {role.toUpperCase()} {t('nav.dashboard', 'PORTAL')}
          </h5>
          <div className="mt-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 border border-brand-200 dark:border-brand-800 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Non-Clinical Safeguard Card */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-snug space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <ShieldAlert className="w-3.5 h-3.5 text-teal-600" />
          <span>Non-Clinical AI</span>
        </div>
        <p>{t('common.nonClinicalNotice', 'Operational access barrier intelligence only. No medical diagnosis.')}</p>
      </div>
    </aside>
  );
};
