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
  Home,
  Calendar,
  AlertTriangle,
  Clock,
  Ticket,
  CheckSquare,
  RefreshCw,
  Bell,
  Bed,
  Scale,
  KeyRound,
  Database,
  Network,
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
    { name: t('nav.hospitals', 'Nearby Hospitals'), path: '/patient/hospitals', icon: MapPin },
    { name: 'Live Teleconsultation', path: '/patient/teleconsult', icon: Layers },
    { name: 'Report Healthcare Barrier', path: '/patient/report-friction', icon: ShieldAlert },
    { name: 'Health Records & ABHA', path: '/patient/health-records', icon: FileText },
    { name: 'Healthcare Access & Facility Router', path: '/patient/triage', icon: Navigation },
    { name: 'Referral Tracking Hub', path: '/patient/referrals', icon: GitFork },
    { name: 'Diagnostic Network & Uptime', path: '/patient/diagnostics', icon: Activity },
    { name: 'e-Aushadhi Medicines', path: '/patient/medicines', icon: Pill },
    { name: 'High-Risk Care & Follow-up', path: '/patient/high-risk', icon: HeartPulse },
    { name: 'ASHA Frontline Seva', path: '/patient/frontline', icon: HeartHandshake },
    { name: 'Digital Twin Simulator', path: '/patient/digital-twin', icon: Sliders },
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
    { name: t('nav.bedManagement', 'Bed Management'), path: '/hospital/beds', icon: Building2 },
    { name: t('nav.opdQueue', 'OPD Token Queue'), path: '/hospital/opd-queue', icon: ListOrdered },
    { name: t('nav.incomingPatients', 'Incoming Patients'), path: '/hospital/incoming', icon: Users },
    { name: t('nav.interventions', 'Resource Interventions'), path: '/hospital/interventions', icon: Sliders },
    { name: t('nav.settings', 'Settings & Language'), path: '/hospital/settings', icon: Settings },
  ];

  const doctorLinks = [
    { name: 'Doctor Dashboard',          path: '/doctor/dashboard',    icon: LayoutDashboard },
    { name: 'Consultation Desk',         path: '/doctor/consultation', icon: Stethoscope },
    { name: 'Clinical Profile & OPD',    path: '/doctor/profile',      icon: User },
    { name: 'Assigned Patients Queue',   path: '/doctor/opd-queue',    icon: Users },
    { name: 'Live Teleconsultation',     path: '/doctor/teleconsult',  icon: Video },
    { name: 'Longitudinal EHR & ABHA',   path: '/doctor/health-records', icon: FileText },
    { name: 'Digital Triage Protocol',   path: '/doctor/triage',       icon: Activity },
    { name: 'Lab Diagnostics Network',   path: '/doctor/lab-orders',   icon: Pill },
    { name: 'Referrals',                 path: '/doctor/referrals',    icon: GitFork },
    { name: 'Prescriptions & Notes',     path: '/doctor/prescriptions', icon: FileText },
    { name: 'Follow-up & Alerts',        path: '/doctor/follow-ups',   icon: HeartPulse },
    { name: 'My Patients',               path: '/doctor/patients',     icon: Users },
    { name: 'Schedule & Availability',   path: '/doctor/schedule',     icon: ListOrdered },
    { name: t('nav.notifications', 'Notifications'), path: '/doctor/notifications', icon: Sliders },
    { name: t('nav.settings', 'Settings & Language'), path: '/doctor/settings', icon: Settings },
  ];

  const ashaLinks = [
    { name: 'ASHA Field Dashboard', path: '/asha/dashboard', icon: LayoutDashboard },
    { name: 'Village Patient Registry', path: '/asha/patients', icon: Users },
    { name: 'Household Visits', path: '/asha/households', icon: Home },
    { name: 'Field Visit Planner', path: '/asha/visits', icon: Calendar },
    { name: 'High-Risk Escalations', path: '/asha/escalations', icon: AlertTriangle },
    { name: 'Frontline Worker Desk', path: '/asha/desk', icon: HeartHandshake },
    { name: 'Appointment Assistance', path: '/asha/appointments', icon: Clock },
    { name: 'OPD / Token Assistance', path: '/asha/opd-tokens', icon: Ticket },
    { name: 'Referral Tracking', path: '/asha/referrals', icon: GitFork },
    { name: 'Follow-up Tasks', path: '/asha/follow-ups', icon: CheckSquare },
    { name: 'Teleconsultation Assistance', path: '/asha/teleconsult', icon: Video },
    { name: 'Access Barriers', path: '/asha/access-barriers', icon: ShieldAlert },
    { name: 'Documents & Service Assistance', path: '/asha/documents', icon: FileText },
    { name: 'Offline Sync', path: '/asha/sync', icon: RefreshCw },
    { name: 'Notifications', path: '/asha/notifications', icon: Bell },
    { name: 'Field Audit Trail', path: '/asha/audit', icon: History },
    { name: t('nav.settings', 'Settings & Language'), path: '/asha/settings', icon: Settings },
  ];

  const governmentLinks = [
    { name: 'State / District Health Overview', path: '/government/dashboard', icon: LayoutDashboard },
    { name: 'System Impact Evaluation', path: '/admin/judge-mode', icon: BarChart3 },
    { name: 'Hospital Registry', path: '/government/hospitals', icon: Building2 },
    { name: 'Hospital Bed & Resource Oversight', path: '/government/beds', icon: Bed },
    { name: 'Population Access & Friction Map', path: '/government/friction-map', icon: MapPin },
    { name: 'Resource Interventions', path: '/government/interventions', icon: Sliders },
    { name: 'Referral Network', path: '/government/referrals', icon: GitFork },
    { name: 'Facility Quality & NQAS Tracking', path: '/government/facility-metrics', icon: CheckSquare },
    { name: 'Service Availability', path: '/government/services', icon: Activity },
    { name: 'OPD & Waiting-Time Analytics', path: '/government/opd-analytics', icon: Clock },
    { name: 'Lab Network Overview', path: '/government/labs', icon: Pill },
    { name: 'Pharmacy Availability', path: '/government/pharmacy', icon: Pill },
    { name: 'ASHA Field Coverage', path: '/government/asha-coverage', icon: HeartHandshake },
    { name: 'District Comparison', path: '/government/district-comparison', icon: Scale },
    { name: 'Alerts & Action Center', path: '/government/alerts', icon: AlertTriangle },
    { name: 'Reports', path: '/government/reports', icon: FileText },
    { name: 'Audit Logs', path: '/government/audit-logs', icon: History },
    { name: t('nav.settings', 'Settings & Language'), path: '/government/settings', icon: Settings },
  ];

  const adminLinks = [
    { name: t('nav.dashboard', 'Admin Dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'State Health Intelligence', path: '/admin/state-command', icon: Network },
    { name: 'System Impact Evaluation', path: '/admin/judge-mode', icon: BarChart3 },
    { name: 'State Referral Pipeline', path: '/admin/referrals', icon: GitFork },
    { name: 'High-Priority Follow-up Registry', path: '/admin/high-risk', icon: HeartPulse },
    { name: 'Facility Quality Index', path: '/admin/facility-metrics', icon: BarChart3 },
    { name: 'Healthcare Friction Digital Twin', path: '/admin/digital-twin', icon: Activity },
    { name: t('nav.whatIfSimulator', 'What-If Policy Simulator'), path: '/admin/simulator', icon: Cpu },
    { name: t('nav.budgetOptimizer', 'Budget & Resource Optimizer'), path: '/admin/interventions', icon: Sliders },
    { name: t('nav.populationMap', 'Population Heatmap'), path: '/admin/friction-map', icon: MapPin },
    { name: t('nav.careLeakage', 'Care Leakage Funnel'), path: '/admin/care-leakage', icon: GitFork },
    { name: 'Why Care Failed', path: '/admin/care-failure', icon: AlertTriangle },
    { name: t('nav.patientRegistry', 'Patient Registry'), path: '/admin/patients', icon: Users },
    { name: t('nav.hospitalRegistry', 'Hospital Registry'), path: '/admin/hospitals', icon: Building2 },
    { name: 'User Directory & Roles', path: '/admin/users', icon: Shield },
    { name: 'Permissions', path: '/admin/permissions', icon: KeyRound },
    { name: 'Integration Center', path: '/admin/integrations', icon: Database },
    { name: 'Data Quality Center', path: '/admin/data-quality', icon: CheckSquare },
    { name: t('nav.auditLogs', 'Audit Logs'), path: '/admin/audit-logs', icon: History },
    { name: 'System Health', path: '/admin/system-health', icon: Activity },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
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
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden lg:flex shrink-0">
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
                        ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
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
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-snug space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <ShieldAlert className="w-3.5 h-3.5 text-teal-600" />
          <span>Non-Clinical AI</span>
        </div>
        <p>{t('common.nonClinicalNotice', 'Operational access barrier intelligence only. No medical diagnosis.')}</p>
      </div>
    </aside>
  );
};
