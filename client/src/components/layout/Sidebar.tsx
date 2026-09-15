import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Calendar,
  HeartPulse,
  FileText,
  GitFork,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  MapPin,
  Pill,
  Activity,
  ShieldAlert,
  Settings,
  Users,
  Home,
  CheckSquare,
  Clock,
  ClipboardList,
  Stethoscope,
  Building2,
  ListOrdered,
  BarChart3,
  Sliders,
  Landmark,
  Shield,
  RefreshCw,
  Phone,
  FolderLock,
  Layers,
  Database,
  Cpu,
  KeyRound,
  Video,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
}

interface SidebarProps {
  forceRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ forceRole }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const role = forceRole || user?.role;
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  if (!role) return null;

  // Role Navigation Configuration matching Phase 4 Information Architecture
  const getNavConfiguration = (): { title: string; primary: NavItem[]; more: NavItem[] } => {
    switch (role.toLowerCase()) {
      case 'patient':
        return {
          title: 'Patient Portal',
          primary: [
            { name: 'Home', path: '/patient/dashboard', icon: LayoutDashboard },
            { name: 'Appointments', path: '/patient/requests', icon: Calendar },
            { name: 'My Care', path: '/patient/triage', icon: HeartPulse },
            { name: 'Records', path: '/patient/health-records', icon: FileText },
            { name: 'Referrals', path: '/patient/referrals', icon: GitFork },
          ],
          more: [
            { name: 'Find Facility', path: '/patient/hospitals', icon: MapPin },
            { name: 'Medicine Stock', path: '/patient/medicines', icon: Pill },
            { name: 'Diagnostics', path: '/patient/diagnostics', icon: Activity },
            { name: 'High-Risk Follow-up', path: '/patient/high-risk', icon: HeartPulse },
            { name: 'Teleconsultation', path: '/patient/teleconsult', icon: Video },
            { name: 'Document Vault', path: '/patient/documents', icon: FolderLock },
            { name: 'Report Barrier', path: '/patient/report-friction', icon: ShieldAlert },
            { name: 'Settings & Language', path: '/patient/settings', icon: Settings },
          ],
        };

      case 'asha':
      case 'asha_worker':
        return {
          title: 'ASHA Field Desk',
          primary: [
            { name: 'Today', path: '/asha/dashboard', icon: LayoutDashboard },
            { name: 'Patients', path: '/asha/patients', icon: Users },
            { name: 'Households', path: '/asha/households', icon: Home },
            { name: 'Visits', path: '/asha/visits', icon: Calendar },
            { name: 'Follow-ups', path: '/asha/follow-ups', icon: CheckSquare },
            { name: 'Referrals', path: '/asha/referrals', icon: GitFork },
          ],
          more: [
            { name: 'Escalations', path: '/asha/escalations', icon: ShieldAlert },
            { name: 'OPD Tokens', path: '/asha/opd-tokens', icon: ListOrdered },
            { name: 'Teleconsultation', path: '/asha/teleconsult', icon: Video },
            { name: 'Access Barriers', path: '/asha/access-barriers', icon: Activity },
            { name: 'Documents', path: '/asha/documents', icon: FileText },
            { name: 'Offline Sync', path: '/asha/sync', icon: RefreshCw },
            { name: 'Settings', path: '/asha/settings', icon: Settings },
          ],
        };

      case 'doctor':
        return {
          title: 'Doctor Portal',
          primary: [
            { name: 'Today', path: '/doctor/dashboard', icon: LayoutDashboard },
            { name: 'Queue', path: '/doctor/opd-queue', icon: ListOrdered },
            { name: 'Patients', path: '/doctor/patients', icon: Users },
            { name: 'Consultations', path: '/doctor/consultation', icon: Stethoscope },
            { name: 'Diagnostics', path: '/doctor/lab-orders', icon: Activity },
            { name: 'Referrals', path: '/doctor/referrals', icon: GitFork },
            { name: 'Follow-ups', path: '/doctor/follow-ups', icon: Clock },
          ],
          more: [
            { name: 'Prescriptions', path: '/doctor/prescriptions', icon: FileText },
            { name: 'Schedule', path: '/doctor/schedule', icon: Calendar },
            { name: 'Teleconsultation', path: '/doctor/teleconsult', icon: Video },
            { name: 'Longitudinal EHR', path: '/doctor/health-records', icon: Layers },
            { name: 'Clinical Profile', path: '/doctor/profile', icon: Users },
            { name: 'Settings', path: '/doctor/settings', icon: Settings },
          ],
        };

      case 'hospital':
      case 'facility':
        return {
          title: 'Facility Operations',
          primary: [
            { name: 'Overview', path: '/hospital/dashboard', icon: LayoutDashboard },
            { name: 'OPD', path: '/hospital/requests', icon: ListOrdered },
            { name: 'Patients', path: '/hospital/requests', icon: Users },
            { name: 'Services', path: '/hospital/departments', icon: Building2 },
            { name: 'Diagnostics', path: '/hospital/diagnostics', icon: Activity },
            { name: 'Medicines', path: '/hospital/medicines', icon: Pill },
            { name: 'Referrals', path: '/hospital/referrals', icon: GitFork },
            { name: 'Quality', path: '/hospital/facility-metrics', icon: BarChart3 },
          ],
          more: [
            { name: 'Live Triage', path: '/hospital/triage', icon: HeartPulse },
            { name: 'Teleconsultation', path: '/hospital/teleconsult', icon: Video },
            { name: 'Facility Profile', path: '/hospital/profile', icon: Building2 },
            { name: 'Settings', path: '/hospital/settings', icon: Settings },
          ],
        };

      case 'government':
        return {
          title: 'Public Health Command',
          primary: [
            { name: 'Overview', path: '/government/dashboard', icon: LayoutDashboard },
            { name: 'Access', path: '/government/friction-map', icon: Activity },
            { name: 'Facilities', path: '/government/hospitals', icon: Building2 },
            { name: 'Referrals', path: '/government/referrals', icon: GitFork },
            { name: 'Quality', path: '/government/facility-metrics', icon: BarChart3 },
            { name: 'Insights', path: '/government/district-comparison', icon: Sliders },
            { name: 'Interventions', path: '/government/interventions', icon: HeartPulse },
            { name: 'Reports', path: '/government/reports', icon: FileText },
          ],
          more: [
            { name: 'Bed Registry', path: '/government/beds', icon: Building2 },
            { name: 'OPD Analytics', path: '/government/opd-analytics', icon: ListOrdered },
            { name: 'Lab Networks', path: '/government/labs', icon: Activity },
            { name: 'e-Pharmacy', path: '/government/pharmacy', icon: Pill },
            { name: 'ASHA Coverage', path: '/government/asha-coverage', icon: Users },
            { name: 'Action Center', path: '/government/alerts', icon: ShieldAlert },
            { name: 'Audit Logs', path: '/government/audit-logs', icon: FolderLock },
            { name: 'Settings', path: '/government/settings', icon: Settings },
          ],
        };

      case 'admin':
      default:
        return {
          title: 'System Administration',
          primary: [
            { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
            { name: 'Users', path: '/admin/users', icon: Users },
            { name: 'Facilities', path: '/admin/hospitals', icon: Building2 },
            { name: 'Data', path: '/admin/data-quality', icon: Database },
            { name: 'Integrations', path: '/admin/integrations', icon: Cpu },
            { name: 'Security', path: '/admin/permissions', icon: KeyRound },
            { name: 'System Health', path: '/admin/system-health', icon: Activity },
          ],
          more: [
            { name: 'State Command', path: '/admin/state-command', icon: Landmark },
            { name: 'Platform Impact (Judge)', path: '/admin/judge-mode', icon: BarChart3 },
            { name: 'Population Friction Map', path: '/admin/friction-map', icon: Activity },
            { name: 'Intervention Simulator', path: '/admin/simulator', icon: Sliders },
            { name: 'Care Leakage', path: '/admin/care-leakage', icon: GitFork },
            { name: 'Care Failure Analysis', path: '/admin/care-failure', icon: ShieldAlert },
            { name: 'Feature Flags', path: '/admin/feature-flags', icon: Settings },
            { name: 'System Audit Logs', path: '/admin/audit-logs', icon: FolderLock },
            { name: 'Settings', path: '/admin/settings', icon: Settings },
          ],
        };
    }
  };

  const { title, primary, more } = getNavConfiguration();

  return (
    <aside
      aria-label="Sidebar Navigation"
      className="w-64 bg-white border-r border-slate-200/90 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden lg:flex shrink-0 select-none"
    >
      <div className="space-y-4 overflow-y-auto pr-1">
        <div>
          <div className="flex items-center justify-between px-3 py-1 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              {title}
            </span>
          </div>

          {/* Primary Task Navigation Links */}
          <nav className="space-y-1">
            {primary.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-teal-50 text-teal-800 border border-teal-200/80 shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0 text-teal-700" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Progressive Disclosure Section: "More" */}
        {more && more.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
              aria-expanded={isMoreOpen}
            >
              <span className="flex items-center gap-2">
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
                <span>More Services & Tools</span>
              </span>
              {isMoreOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {isMoreOpen && (
              <nav className="mt-1 space-y-1 pl-2 border-l-2 border-slate-100 animate-fade-in">
                {more.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-slate-100 text-slate-900 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  );
                })}
              </nav>
            )}
          </div>
        )}
      </div>

      {/* Non-Clinical Operational Safety Notice */}
      <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <ShieldAlert className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span>Care Coordination Core</span>
        </div>
        <p className="leading-snug text-slate-500 text-[10px]">
          Operational friction intelligence & care access only. Not for autonomous clinical diagnosis.
        </p>
      </div>
    </aside>
  );
};
