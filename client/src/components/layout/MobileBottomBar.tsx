// MobileBottomBar.tsx - Thumb-friendly bottom navigation bar for mobile viewports

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  HeartPulse,
  FileText,
  Menu,
  Users,
  ClipboardList,
  Stethoscope,
  RefreshCw,
  Sparkles,
  GitFork,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { openElevenLabsCalling } from '../../services/elevenlabsCallingService';

interface MobileBottomBarProps {
  onOpenMoreMenu?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ onOpenMoreMenu }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const role = user?.role || 'patient';

  // Do not show bottom bar on auth pages or consultation room
  if (['/login', '/register', '/forgot-password', '/reset-password'].includes(location.pathname)) {
    return null;
  }
  if (location.pathname.includes('/teleconsultation/') || location.pathname.includes('/doctor/consultation/')) {
    return null;
  }

  // Define role-specific mobile tabs (Max 4-5 items)
  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Triage', path: '/patient/triage', icon: Activity },
        { label: 'Hospitals', path: '/patient/hospitals', icon: HeartPulse },
        { label: 'Emergency', path: '/emergency', icon: Stethoscope, isEmergency: true },
      ];
    }

    switch (role as string) {
      case 'asha':
      case 'asha_worker':
        return [
          { label: 'Today', path: '/asha/dashboard', icon: ClipboardList },
          { label: 'Visits', path: '/asha/field-visits', icon: Users },
          { label: 'Referrals', path: '/asha/referrals', icon: GitFork },
          { label: 'Sync', path: '/asha/sync', icon: RefreshCw },
        ];
      case 'doctor':
        return [
          { label: 'Today', path: '/doctor/dashboard', icon: Home },
          { label: 'OPD Queue', path: '/doctor/queue', icon: ClipboardList },
          { label: 'Consult', path: '/doctor/consultation', icon: Stethoscope },
          { label: 'Referrals', path: '/doctor/referrals', icon: GitFork },
        ];
      case 'government':
      case 'admin':
        return [
          { label: 'Overview', path: role === 'admin' ? '/admin/dashboard' : '/government/dashboard', icon: Home },
          { label: 'Access', path: '/government/services', icon: Activity },
          { label: 'Facilities', path: '/government/hospitals', icon: HeartPulse },
          { label: 'Quality', path: '/hospital/quality', icon: ClipboardList },
        ];
      case 'patient':
      default:
        return [
          { label: 'Home', path: '/patient/dashboard', icon: Home },
          { label: 'Appts', path: '/patient/requests', icon: Calendar },
          { label: 'My Care', path: '/patient/triage', icon: HeartPulse },
          { label: 'Records', path: '/patient/records', icon: FileText },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pb-safe"
    >
      <div className="flex items-center justify-around h-15 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors cursor-pointer ${
                isActive
                  ? 'text-teal-700 font-bold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-teal-50 text-teal-700' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>
              <span className="text-[10px] tracking-tight leading-none mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}

        {/* Quick Call Button */}
        <button
          type="button"
          onClick={() => openElevenLabsCalling()}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-teal-600 hover:text-teal-700 cursor-pointer"
          title="Voice Call Assistant"
        >
          <div className="p-1 rounded-xl bg-teal-500/10 text-teal-700">
            <span className="text-base leading-none">📞</span>
          </div>
          <span className="text-[10px] font-bold text-teal-800 tracking-tight leading-none mt-0.5">Call</span>
        </button>

        {/* More / Menu Drawer Toggle */}
        {onOpenMoreMenu && (
          <button
            type="button"
            onClick={onOpenMoreMenu}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-500 hover:text-slate-900 cursor-pointer"
          >
            <div className="p-1 rounded-xl">
              <Menu className="w-5 h-5 stroke-[1.8]" />
            </div>
            <span className="text-[10px] font-medium tracking-tight leading-none mt-0.5">More</span>
          </button>
        )}
      </div>
    </nav>
  );
};
