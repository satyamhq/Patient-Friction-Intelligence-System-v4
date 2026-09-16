import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Calendar,
  HeartPulse,
  FileText,
  GitFork,
  MapPin,
  Pill,
  Activity,
  ShieldAlert,
  Settings,
  Users,
  Home,
  CheckSquare,
  Clock,
  Stethoscope,
  Building2,
  ListOrdered,
  BarChart3,
  Sliders,
  Landmark,
  Shield,
  ShieldCheck,
  RefreshCw,
  FolderLock,
  Layers,
  Database,
  Cpu,
  KeyRound,
  Video,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  UserCheck,
  AlertTriangle,
  FileSpreadsheet,
  Bell,
  Sparkles,
  Phone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { initiateHelplineCall, HELPLINE_PHONE_NUMBER } from '../../services/helplineCallingService';

export interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  forceRole?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const SIDEBAR_COLLAPSED_KEY = 'pfis_sidebar_collapsed';

export const Sidebar: React.FC<SidebarProps> = ({
  forceRole,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const role = (forceRole || user?.role || 'patient').toLowerCase();

  // Collapsed state persisted in localStorage (desktop only)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
    } catch {}
  };

  // Close mobile drawer on route change
  useEffect(() => {
    if (onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname]);

  // Role Navigation Sections according to exact specification
  const getSectionsForRole = (): { portalTitle: string; sections: NavSection[] } => {
    switch (role) {
      case 'patient':
        return {
          portalTitle: 'Patient & Citizen',
          sections: [
            {
              title: 'Care & Access',
              items: [
                { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
                { name: 'Barrier Check', path: '/patient/assessment', icon: ShieldAlert, badge: 'PFI' },
                { name: 'Nearby Hospitals', path: '/patient/hospitals', icon: MapPin },
                { name: 'Health Services', path: '/patient/services', icon: Pill },
              ],
            },
            {
              title: 'Records & Visits',
              items: [
                { name: 'Health Records Vault', path: '/patient/health-records', icon: FolderLock },
                { name: 'Appointments', path: '/patient/requests', icon: Calendar },
                { name: 'Care Referrals', path: '/patient/referrals', icon: GitFork },
                { name: 'Teleconsultation', path: '/patient/teleconsult', icon: Video },
              ],
            },
            {
              title: 'Account & Safety',
              items: [
                { name: 'Notifications', path: '/patient/notifications', icon: Bell },
                { name: 'Patient Profile', path: '/patient/profile', icon: Users },
                { name: 'Settings & Language', path: '/patient/settings', icon: Settings },
              ],
            },
          ],
        };

      case 'doctor':
        return {
          portalTitle: 'Doctor & Specialist',
          sections: [
            {
              title: 'Clinical Desk',
              items: [
                { name: 'Doctor Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
                { name: 'OPD Queue', path: '/doctor/opd-queue', icon: ListOrdered, badge: 'Live' },
                { name: 'Patient Directory', path: '/doctor/patients', icon: Users },
                { name: 'Consultation Workspace', path: '/doctor/consultation', icon: Stethoscope },
              ],
            },
            {
              title: 'Care Coordination',
              items: [
                { name: 'Teleconsult Room', path: '/doctor/teleconsult', icon: Video },
                { name: 'Patient EHR Records', path: '/doctor/health-records', icon: Layers },
                { name: 'Prescriptions & Rx', path: '/doctor/prescriptions', icon: FileText },
                { name: 'Lab Orders', path: '/doctor/lab-orders', icon: Activity },
                { name: 'Referrals Network', path: '/doctor/referrals', icon: GitFork },
                { name: 'Clinical Schedule', path: '/doctor/schedule', icon: Calendar },
              ],
            },
            {
              title: 'Preferences',
              items: [
                { name: 'Clinical Alerts', path: '/doctor/notifications', icon: Bell },
                { name: 'Doctor Profile', path: '/doctor/profile', icon: UserCheck },
                { name: 'Practice Settings', path: '/doctor/settings', icon: Settings },
              ],
            },
          ],
        };

      case 'hospital':
      case 'facility':
        return {
          portalTitle: 'Hospital & Facility',
          sections: [
            {
              title: 'Triage & Intake',
              items: [
                { name: 'Facility Dashboard', path: '/hospital/dashboard', icon: LayoutDashboard },
                { name: 'Live Casualty Triage', path: '/hospital/triage', icon: HeartPulse, badge: 'Urgent' },
                { name: 'Patient Intake Desk', path: '/hospital/intake', icon: ClipboardCheck },
                { name: 'OPD Queue Capacity', path: '/hospital/opd-capacity', icon: ListOrdered },
              ],
            },
            {
              title: 'Facility Resources',
              items: [
                { name: 'Departments', path: '/hospital/departments', icon: Building2 },
                { name: 'Doctors & Staff', path: '/hospital/staff', icon: Users },
                { name: 'Resources Hub', path: '/hospital/resources', icon: Pill },
                { name: 'Referral Transfers', path: '/hospital/referrals', icon: GitFork },
              ],
            },
            {
              title: 'Quality & Governance',
              items: [
                { name: 'Facility Analytics', path: '/hospital/facility-metrics', icon: BarChart3 },
                { name: 'Operational Alerts', path: '/hospital/alerts', icon: AlertTriangle },
                { name: 'Facility Settings', path: '/hospital/settings', icon: Settings },
              ],
            },
          ],
        };

      case 'asha':
      case 'asha_worker':
        return {
          portalTitle: 'ASHA Field Worker',
          sections: [
            {
              title: 'Field Operations',
              items: [
                { name: 'Field Desk Today', path: '/asha/dashboard', icon: LayoutDashboard },
                { name: 'Village Households', path: '/asha/households', icon: Home },
                { name: 'Household Cohorts', path: '/asha/cohorts', icon: Users },
                { name: 'Maternal Register', path: '/asha/maternal-register', icon: HeartPulse, badge: 'ANC' },
              ],
            },
            {
              title: 'Frontline Care',
              items: [
                { name: 'Field Visits', path: '/asha/visits', icon: Calendar },
                { name: 'Screening & NCD', path: '/asha/screening', icon: Activity },
                { name: 'Care Referrals', path: '/asha/referrals', icon: GitFork },
                { name: 'High-Risk Escalations', path: '/asha/escalations', icon: ShieldAlert, badge: 'Alert' },
                { name: 'Patient Follow-ups', path: '/asha/follow-ups', icon: CheckSquare },
              ],
            },
            {
              title: 'Toolkit & Settings',
              items: [
                { name: 'OPD Tokens', path: '/asha/opd-tokens', icon: ListOrdered },
                { name: 'Offline Data Sync', path: '/asha/sync', icon: RefreshCw },
                { name: 'Field Notifications', path: '/asha/notifications', icon: Bell },
                { name: 'Field Settings', path: '/asha/settings', icon: Settings },
              ],
            },
          ],
        };

      case 'government':
        return {
          portalTitle: 'Health Authority',
          sections: [
            {
              title: 'Public Health Command',
              items: [
                { name: 'Statewide Dashboard', path: '/government/dashboard', icon: LayoutDashboard },
                { name: 'Friction Intelligence System', path: '/government/friction-intelligence', icon: Activity, badge: 'v4.2' },
                { name: 'Officer Workflow', path: '/government/officer-workflow', icon: ShieldCheck, badge: 'Loop' },
                { name: 'District Analytics', path: '/government/district-comparison', icon: Sliders },
                { name: 'Population Friction Map', path: '/government/friction-map', icon: Activity, badge: 'Map' },
              ],
            },
            {
              title: 'Facilities & Network',
              items: [
                { name: 'Hospitals Network', path: '/government/hospitals', icon: Building2 },
                { name: 'Bed Registry', path: '/government/beds', icon: Building2 },
                { name: 'Accreditation & NQAS', path: '/government/accreditation', icon: BarChart3 },
                { name: 'Referral Analytics', path: '/government/referrals', icon: GitFork },
              ],
            },
            {
              title: 'Interventions & Action',
              items: [
                { name: 'Intervention Optimizer', path: '/government/interventions', icon: HeartPulse },
                { name: 'Government Action Center', path: '/government/alerts', icon: ShieldAlert, badge: 'Action' },
                { name: 'Public Health Reports', path: '/government/reports', icon: FileSpreadsheet },
                { name: 'Audit & Telemetry', path: '/government/audit-logs', icon: FolderLock },
                { name: 'Authority Settings', path: '/government/settings', icon: Settings },
              ],
            },
          ],
        };

      case 'admin':
      default:
        return {
          portalTitle: 'Health Ministry & Admin',
          sections: [
            {
              title: 'Executive Command',
              items: [
                { name: 'Executive Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
                { name: 'Friction Intelligence System', path: '/admin/friction-intelligence', icon: Activity, badge: 'v4.2' },
                { name: 'Officer Workflow', path: '/admin/officer-workflow', icon: ShieldCheck, badge: 'Loop' },
                { name: 'Statewide Command', path: '/admin/state-command', icon: Landmark },
                { name: 'Population Friction', path: '/admin/friction-map', icon: Activity, badge: 'PFI' },
                { name: 'District Comparison', path: '/admin/district-comparison', icon: Sliders },
              ],
            },
            {
              title: 'Policy & Simulation',
              items: [
                { name: 'Policy Simulator', path: '/admin/simulator', icon: Sliders },
                { name: 'Resource Allocation', path: '/admin/resource-allocation', icon: Building2 },
                { name: 'Intervention Impact', path: '/admin/judge-mode', icon: BarChart3, badge: 'Judge' },
                { name: 'Care Leakage Analytics', path: '/admin/care-leakage', icon: GitFork },
                { name: 'Care Failure Analysis', path: '/admin/care-failure', icon: ShieldAlert },
              ],
            },
            {
              title: 'System Governance',
              items: [
                { name: 'User Management', path: '/admin/users', icon: Users },
                { name: 'Role Permissions', path: '/admin/permissions', icon: KeyRound },
                { name: 'System Integrations', path: '/admin/integrations', icon: Cpu },
                { name: 'System Health & Metrics', path: '/admin/system-health', icon: Activity },
                { name: 'System Audit Logs', path: '/admin/audit-logs', icon: FolderLock },
                { name: 'Platform Settings', path: '/admin/settings', icon: Settings },
              ],
            },
          ],
        };
    }
  };

  const { portalTitle, sections } = getSectionsForRole();

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between select-none">
      {/* Top Header & Navigation Links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200">
        {/* Role Portal Indicator Header */}
        <div className={`px-4 pt-4 pb-3 border-b border-slate-100 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed ? (
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60 inline-block mb-1">
                {role.toUpperCase()} WORKSPACE
              </span>
              <h2 className="text-xs font-black text-slate-800 tracking-tight leading-none">
                {portalTitle}
              </h2>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xs shadow-xs" title={portalTitle}>
              {role.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Grouped Navigation Sections */}
        <div className="p-3 space-y-4">
          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed ? (
                <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {section.title}
                </div>
              ) : (
                <div className="my-2 border-t border-slate-100" />
              )}

              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(`${item.path}/`));

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive: exactActive }) => {
                        const active = isActive || exactActive;
                        return `relative group flex items-center rounded-xl transition-all ${
                          isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2 text-xs font-bold'
                        } ${
                          active
                            ? 'bg-teal-600 text-white shadow-sm font-black'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                        }`;
                      }}
                    >
                      <Icon className={`shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />

                      {!isCollapsed && (
                        <>
                          <span className="truncate flex-1">{item.name}</span>
                          {item.badge && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-white/20 text-white tracking-wider">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}

                      {/* Tooltip in Collapsed Mode */}
                      {isCollapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                          {item.name}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Footer Actions: Direct Helpline & Collapse Toggle */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70 shrink-0 space-y-2">
        {/* Direct Helpline Trigger */}
        <button
          type="button"
          onClick={() => initiateHelplineCall()}
          className={`w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center shadow-xs transition-all cursor-pointer ${
            isCollapsed ? 'justify-center p-2.5' : 'gap-2 px-3 py-2 justify-center'
          }`}
          title={`Call 24/7 Healthcare Helpline (${HELPLINE_PHONE_NUMBER})`}
        >
          <Phone className="w-4 h-4 fill-current" />
          {!isCollapsed && <span>Call Helpline</span>}
        </button>

        {/* Desktop Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={toggleCollapsed}
          className="hidden lg:flex w-full items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 text-xs font-bold transition-all cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[11px] font-semibold text-slate-500">Collapse Menu</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidenavbar */}
      <aside
        aria-label="Sidebar Navigation"
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200/90 min-h-[calc(100vh-4rem)] transition-all duration-200 shrink-0 select-none ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Visible when toggled on mobile/tablet) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          {/* Drawer Body */}
          <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
