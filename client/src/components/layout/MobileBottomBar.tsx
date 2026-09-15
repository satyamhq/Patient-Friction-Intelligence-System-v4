// MobileBottomBar.tsx - Thumb-friendly bottom navigation bar for mobile viewports
// Designed according to Phase 4 Information Architecture and Phase 30 Mobile Standards

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  HeartPulse,
  FileText,
  GitFork,
  Users,
  Home,
  CheckSquare,
  Stethoscope,
  ListOrdered,
  Building2,
  BarChart3,
  Sliders,
  ShieldAlert,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EmergencySOSModal } from '../common/EmergencySOSModal';

interface MobileBottomBarProps {
  onOpenMoreMenu?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ onOpenMoreMenu }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const role = user?.role || 'patient';

  // Do not show bottom bar on auth pages or consultation room
  if (['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname)) {
    return null;
  }
  if (location.pathname.includes('/teleconsultation/') || location.pathname.includes('/doctor/consultation/')) {
    return null;
  }

  // Define role-specific mobile tabs matching Phase 4 (Max 5 items)
  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Home', path: '/', icon: LayoutDashboard },
        { label: 'Triage', path: '/patient/triage', icon: HeartPulse },
        { label: 'Facilities', path: '/patient/hospitals', icon: Building2 },
        { label: 'Login', path: '/login', icon: Users },
      ];
    }

    switch (role as string) {
      case 'asha':
      case 'asha_worker':
        return [
          { label: 'Today', path: '/asha/dashboard', icon: LayoutDashboard },
          { label: 'Visits', path: '/asha/visits', icon: Calendar },
          { label: 'Patients', path: '/asha/patients', icon: Users },
          { label: 'Follow-ups', path: '/asha/follow-ups', icon: CheckSquare },
          { label: 'Referrals', path: '/asha/referrals', icon: GitFork },
        ];

      case 'doctor':
        return [
          { label: 'Today', path: '/doctor/dashboard', icon: LayoutDashboard },
          { label: 'Queue', path: '/doctor/opd-queue', icon: ListOrdered },
          { label: 'Consult', path: '/doctor/consultation', icon: Stethoscope },
          { label: 'Patients', path: '/doctor/patients', icon: Users },
          { label: 'Referrals', path: '/doctor/referrals', icon: GitFork },
        ];

      case 'hospital':
      case 'facility':
        return [
          { label: 'Overview', path: '/hospital/dashboard', icon: LayoutDashboard },
          { label: 'OPD Queue', path: '/hospital/requests', icon: ListOrdered },
          { label: 'Services', path: '/hospital/departments', icon: Building2 },
          { label: 'Referrals', path: '/hospital/referrals', icon: GitFork },
          { label: 'Quality', path: '/hospital/facility-metrics', icon: BarChart3 },
        ];

      case 'government':
        return [
          { label: 'Overview', path: '/government/dashboard', icon: LayoutDashboard },
          { label: 'Access', path: '/government/friction-map', icon: Sliders },
          { label: 'Facilities', path: '/government/hospitals', icon: Building2 },
          { label: 'Referrals', path: '/government/referrals', icon: GitFork },
          { label: 'Quality', path: '/government/facility-metrics', icon: BarChart3 },
        ];

      case 'admin':
        return [
          { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'Users', path: '/admin/users', icon: Users },
          { label: 'Facilities', path: '/admin/hospitals', icon: Building2 },
          { label: 'Integrations', path: '/admin/integrations', icon: Sliders },
          { label: 'Security', path: '/admin/permissions', icon: ShieldAlert },
        ];

      case 'patient':
      default:
        return [
          { label: 'Home', path: '/patient/dashboard', icon: LayoutDashboard },
          { label: 'Appts', path: '/patient/requests', icon: Calendar },
          { label: 'My Care', path: '/patient/triage', icon: HeartPulse },
          { label: 'Records', path: '/patient/health-records', icon: FileText },
          { label: 'Referrals', path: '/patient/referrals', icon: GitFork },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      <nav
        aria-label="Mobile Bottom Navigation Bar"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg pb-safe"
      >
        <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors touch-target select-none cursor-pointer ${
                  isActive
                    ? 'text-teal-700 font-bold'
                    : 'text-slate-500 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-teal-600' : 'stroke-[1.8]'}`} />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-600 rounded-full" />
                  )}
                </div>
                <span className="text-[10px] mt-1 leading-none truncate max-w-[64px]">
                  {item.label}
                </span>
              </NavLink>
            );
          })}

          {/* Emergency 108 Action for Patients */}
          {role === 'patient' && (
            <button
              type="button"
              onClick={() => setIsEmergencyModalOpen(true)}
              className="flex flex-col items-center justify-center px-2 py-1 text-rose-600 hover:text-rose-700 transition-colors touch-target cursor-pointer"
              title="108 Emergency Assistance"
            >
              <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
              <span className="text-[10px] font-bold mt-1 leading-none">108 SOS</span>
            </button>
          )}
        </div>
      </nav>

      <EmergencySOSModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </>
  );
};
