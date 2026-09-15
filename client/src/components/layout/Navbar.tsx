import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  Bell,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  Menu,
  X,
  Settings,
  HeartPulse,
  Calendar,
  Building2,
  Stethoscope,
  Phone,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { LanguageSelector } from '../common/LanguageSelector';
import { OfflineSyncIndicator } from '../common/OfflineSyncIndicator';
import { SimpleModeToggle } from '../common/SimpleModeToggle';
import { EmergencySOSModal } from '../common/EmergencySOSModal';
import { openElevenLabsCalling } from '../../services/elevenlabsCallingService';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key and body scroll lock for mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsNotifOpen(false);
        setIsProfileOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  // Primary top links based on role
  const renderTopLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <Link
            to="/patient/triage"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/patient/triage') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Health Check
          </Link>
          <Link
            to="/patient/hospitals"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/patient/hospitals') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Find Facilities
          </Link>
          <Link
            to="/architecture"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/architecture') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Architecture
          </Link>
        </>
      );
    }

    const role = user?.role?.toLowerCase();
    if (role === 'patient') {
      return (
        <>
          <Link
            to="/patient/dashboard"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/patient/dashboard') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home
          </Link>
          <Link
            to="/patient/requests"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/patient/requests') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Appointments
          </Link>
          <Link
            to="/patient/triage"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/patient/triage') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Care
          </Link>
          <Link
            to="/patient/health-records"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/patient/health-records') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Records
          </Link>
          <Link
            to="/patient/referrals"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/patient/referrals') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Referrals
          </Link>
        </>
      );
    }

    if (role === 'asha' || role === 'asha_worker') {
      return (
        <>
          <Link
            to="/asha/dashboard"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/asha/dashboard') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today's Visits
          </Link>
          <Link
            to="/asha/patients"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/asha/patients') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Patients
          </Link>
          <Link
            to="/asha/households"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/asha/households') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Households
          </Link>
          <Link
            to="/asha/follow-ups"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/asha/follow-ups') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Follow-ups
          </Link>
        </>
      );
    }

    if (role === 'doctor') {
      return (
        <>
          <Link
            to="/doctor/dashboard"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/doctor/dashboard') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today
          </Link>
          <Link
            to="/doctor/opd-queue"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/doctor/opd-queue') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Queue
          </Link>
          <Link
            to="/doctor/consultation"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/doctor/consultation') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Consultation Desk
          </Link>
          <Link
            to="/doctor/referrals"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/doctor/referrals') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Referrals
          </Link>
        </>
      );
    }

    if (role === 'hospital') {
      return (
        <>
          <Link
            to="/hospital/dashboard"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/hospital/dashboard') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </Link>
          <Link
            to="/hospital/requests"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/hospital/requests') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            OPD Queue
          </Link>
          <Link
            to="/hospital/departments"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/hospital/departments') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Departments
          </Link>
          <Link
            to="/hospital/facility-metrics"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/hospital/facility-metrics') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quality
          </Link>
        </>
      );
    }

    if (role === 'government') {
      return (
        <>
          <Link
            to="/government/dashboard"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/government/dashboard') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </Link>
          <Link
            to="/government/friction-map"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/government/friction-map') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Access Map
          </Link>
          <Link
            to="/government/hospitals"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/government/hospitals') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Facilities
          </Link>
          <Link
            to="/government/interventions"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isActive('/government/interventions') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Interventions
          </Link>
        </>
      );
    }

    // Default / Admin
    return (
      <>
        <Link
          to="/admin/dashboard"
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isActive('/admin/dashboard') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview
        </Link>
        <Link
          to="/admin/users"
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isActive('/admin/users') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Users
        </Link>
        <Link
          to="/admin/hospitals"
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isActive('/admin/hospitals') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Facilities
        </Link>
        <Link
          to="/admin/system-health"
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            isActive('/admin/system-health') ? 'bg-teal-50 text-teal-800 font-bold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          System Health
        </Link>
      </>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs select-none">
      {/* Accessible Skip to Content Link */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={isMobileMenuOpen}
              className="lg:hidden touch-target flex items-center justify-center p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                  PFIS
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 font-bold hidden sm:inline">
                    v4.0
                  </span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 -mt-0.5 hidden md:inline">
                  Patient Friction Intelligence System
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Center Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {renderTopLinks()}
          </nav>

          {/* Right Action Tools: Connectivity, Language, SOS, Calling, Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Offline Sync State */}
            <OfflineSyncIndicator />

            {/* Simple Mode Toggle */}
            <SimpleModeToggle />

            {/* Language Selector */}
            <LanguageSelector />

            {/* AI Voice Assistant Trigger */}
            <button
              type="button"
              onClick={() => openElevenLabsCalling()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-all cursor-pointer"
              title="Speak with AI Healthcare Assistant"
            >
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>Voice Assist</span>
            </button>

            {/* Emergency SOS Button */}
            <button
              type="button"
              onClick={() => setIsEmergencyModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-xs transition-all cursor-pointer"
              title="108 Emergency Ambulance & SOS"
            >
              <ShieldAlert className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">108 SOS</span>
            </button>

            {/* Notifications Dropdown */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  aria-label="Notifications"
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-xl py-3 z-50 animate-fade-in">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                      <span className="font-bold text-xs text-slate-900">Care Notifications</span>
                      <span className="text-[10px] text-teal-700 font-semibold">Real-time alerts</span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications && notifications.length > 0 ? (
                        notifications.slice(0, 5).map((n: any) => (
                          <div key={n.id || n._id} className="p-3 hover:bg-slate-50 text-xs">
                            <p className="font-semibold text-slate-900">{n.title || n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {n.createdAt ? new Date(n.createdAt).toLocaleTimeString() : 'Just now'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-500">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                          No pending alerts
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Dropdown or Login */}
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-expanded={isProfileOpen}
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center border border-teal-200">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline text-xs font-bold text-slate-800 max-w-[100px] truncate">
                    {user?.name || 'User'}
                  </span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-xs text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{user?.role} Portal</p>
                    </div>

                    <Link
                      to={`/${user?.role}/profile`}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>Profile & ABHA</span>
                    </Link>

                    <Link
                      to={`/${user?.role}/settings`}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Settings</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border-t border-slate-100 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-50 bg-slate-950/40 backdrop-blur-xs">
          <div className="w-4/5 max-w-xs h-full bg-white border-r border-slate-200 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  {user?.role ? `${user.role.toUpperCase()} NAVIGATION` : 'NAVIGATION'}
                </span>
              </div>
              <div className="flex flex-col gap-1" onClick={() => setIsMobileMenuOpen(false)}>
                {renderTopLinks()}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openElevenLabsCalling();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 text-teal-800 font-bold text-xs border border-teal-200"
              >
                <Phone className="w-4 h-4 text-teal-600" />
                <span>AI Voice Assistant</span>
              </button>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emergency SOS Modal */}
      <EmergencySOSModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </header>
  );
};
