import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Activity,
  MapPin,
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  Building2,
  Menu,
  X,
  Settings as SettingsIcon,
  Laptop,
  Layers,
  LayoutDashboard,
  Cpu,
  Ambulance,
  GitFork,
  FileText,
  Pill,
  HeartPulse,
  HeartHandshake,
  BarChart3,
  ChevronDown,
  FolderLock,
  Sliders,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { LanguageSelector } from '../common/LanguageSelector';
import { OfflineSyncIndicator } from '../common/OfflineSyncIndicator';
import { EmergencySOSModal } from '../common/EmergencySOSModal';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileNotifExpanded, setIsMobileNotifExpanded] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
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

  // Close mobile drawer on escape key and lock body scroll when open
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

  const isActive = (path: string) => routerLocation.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 lg:gap-4">
          {/* Left: Mobile Hamburger & Logo Brand */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Hamburger Button (Mobile & Tablet) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
              aria-expanded={isMobileMenuOpen}
              className="xl:hidden touch-target flex items-center justify-center p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              {isAuthenticated && unreadCount > 0 && !isMobileMenuOpen && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-sm sm:text-base lg:text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  PFIS
                </span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 -mt-0.5 hidden sm:inline">
                  Patient Friction Index & Access Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation Links (Laptop & Desktop Only) */}
          <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
            {/* PATIENT NAV */}
            {user?.role === 'patient' && (
              <>
                <Link
                  to="/patient/hospitals"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive('/patient/hospitals')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold shadow-xs'
                      : 'hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Find Hospitals & Doctors</span>
                </Link>

                <Link
                  to="/patient/teleconsult"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive('/patient/teleconsult')
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold shadow-xs'
                      : 'hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Live Teleconsult</span>
                </Link>

                <Link
                  to="/patient/digital-twin"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive('/patient/digital-twin')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-bold shadow-xs'
                      : 'hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-teal-600" />
                  <span>Digital Twin</span>
                </Link>

                <Link
                  to="/patient/dashboard"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    isActive('/patient/dashboard')
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                  <span>Dashboard</span>
                </Link>
              </>
            )}

            {/* HOSPITAL NAV */}
            {user?.role === 'hospital' && (
              <>
                <Link
                  to="/hospital/dashboard"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/hospital/dashboard')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Hospital Desk
                </Link>
                <Link
                  to="/hospital/requests"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/hospital/requests')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Patient Queue
                </Link>
                <Link
                  to="/hospital/teleconsult"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    isActive('/hospital/teleconsult')
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5 text-blue-500" />
                  <span>Tele-Triage</span>
                </Link>
                <Link
                  to="/hospital/departments"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/hospital/departments')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Departments & OPD
                </Link>
              </>
            )}

            {/* ADMIN NAV */}
            {user?.role === 'admin' && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/admin/dashboard')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  System Intelligence
                </Link>
                <Link
                  to="/admin/judge-mode"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    isActive('/admin/judge-mode')
                      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-purple-700 dark:text-purple-400 font-semibold'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Judge Mode</span>
                </Link>
                <Link
                  to="/admin/simulator"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    isActive('/admin/simulator')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-teal-700 dark:text-teal-400'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>What-If Simulator</span>
                </Link>
                <Link
                  to="/admin/digital-twin"
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    isActive('/admin/digital-twin')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  <span>Digital Twin</span>
                </Link>
                <Link
                  to="/admin/interventions"
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    isActive('/admin/interventions')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Budget Optimizer
                </Link>
                <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                  <Link
                    to="/patient/dashboard"
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 hover:bg-teal-100 border border-teal-200 dark:border-teal-800 transition-all flex items-center gap-1"
                    title="Open Patient Portal View"
                  >
                    <span>👤 Patient View</span>
                  </Link>
                  <Link
                    to="/hospital/dashboard"
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 transition-all flex items-center gap-1"
                    title="Open Hospital Desk View"
                  >
                    <span>🏥 Hospital View</span>
                  </Link>
                </div>
              </>
            )}

            {/* PUBLIC VISITOR NAV */}
            {!isAuthenticated && (
              <>
                <Link
                  to="/patient/hospitals"
                  className="px-3 py-1.5 rounded-xl hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  <span>Find Hospitals</span>
                </Link>
                <Link
                  to="/assessment"
                  className="px-3 py-1.5 rounded-xl hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200"
                >
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  <span>Access Assessment</span>
                </Link>
                <Link
                  to="/architecture"
                  className="px-3 py-1.5 rounded-xl text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 font-bold transition-colors flex items-center gap-1.5 border border-teal-200 dark:border-teal-800"
                >
                  <Layers className="w-3.5 h-3.5 text-teal-600" />
                  <span>System Architecture</span>
                </Link>
                <Link
                  to="/about"
                  className="px-3 py-1.5 rounded-xl hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  About Platform
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* 108 Emergency SOS Button */}
            <button
              type="button"
              onClick={() => setIsEmergencyModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-black tracking-wide border border-red-700 shadow-sm flex items-center gap-1.5 transition-all cursor-pointer select-none"
              title="Emergency 108 SOS Paramedic Dispatch"
            >
              <Ambulance className="w-4 h-4 text-white shrink-0" />
              <span className="font-extrabold tracking-wider">108 SOS</span>
            </button>

            {/* Desktop & Tablet Action Controls */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-2.5">
              {/* Offline Sync Indicator */}
              <OfflineSyncIndicator />

              {/* Global Language Selector (Compact on md, full on xl) */}
              <div className="hidden md:block">
                <LanguageSelector />
              </div>

              {/* Notification Bell */}
              {isAuthenticated && (
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors touch-target flex items-center justify-center"
                    title={t('nav.notifications', 'Notifications')}
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Desktop Notifications Dropdown */}
                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 overflow-hidden">
                      <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t('nav.notifications', 'Notifications')}</h4>
                        <span className="text-[11px] font-medium text-slate-500">
                          {unreadCount} unread
                        </span>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              onClick={() => {
                                markAsRead(notif._id);
                                if (notif.actionUrl) {
                                  setIsNotifOpen(false);
                                  navigate(notif.actionUrl);
                                }
                              }}
                              className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                                !notif.isRead ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white">{notif.title}</p>
                                {!notif.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Profile Pill with Floating Dropdown */}
              {isAuthenticated && user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
                    title="User Account & Settings"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 dark:from-teal-600 dark:to-teal-400 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                      {user.role === 'hospital' ? (
                        <Building2 className="w-4 h-4 text-teal-300" />
                      ) : user.role === 'admin' ? (
                        <Shield className="w-4 h-4 text-amber-300" />
                      ) : (
                        <UserIcon className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="hidden lg:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
                        {user.name}
                      </span>
                      <span className="text-[9px] font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Floating Profile Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1.5 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {user.role} ACCESS
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to={
                            user.role === 'patient'
                              ? '/patient/profile'
                              : user.role === 'hospital'
                              ? '/hospital/profile'
                              : '/admin/dashboard'
                          }
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>My Profile & Location</span>
                        </Link>

                        <Link
                          to={
                            user.role === 'patient'
                              ? '/patient/settings'
                              : user.role === 'hospital'
                              ? '/hospital/settings'
                              : '/admin/settings'
                          }
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <SettingsIcon className="w-4 h-4 text-slate-400" />
                          <span>Settings & Accessibility</span>
                        </Link>

                        {user.role === 'patient' && (
                          <Link
                            to="/patient/documents"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <FolderLock className="w-4 h-4 text-slate-400" />
                            <span>Document Vault</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProfileOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-teal-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {t('nav.login', 'Sign In')}
                  </Link>
                  <Link
                    to="/register"
                    className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-xl shadow-xs transition-all"
                  >
                    {t('nav.register', 'Register')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Slide Drawer (Slide from Left) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden flex justify-start">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div
            className="relative w-[88vw] max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col z-50 overflow-hidden border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-250"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation Drawer"
          >
            {/* Drawer Header */}
            <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  <Activity className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                    PFIS Menu
                  </span>
                  <span className="text-[10px] text-slate-400">Healthcare Accessibility</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="touch-target flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Profile Card / Auth Section */}
              {isAuthenticated && user ? (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {user.role === 'hospital' ? (
                        <Building2 className="w-5 h-5 text-teal-300" />
                      ) : user.role === 'admin' ? (
                        <Shield className="w-5 h-5 text-amber-300" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                          {user.role}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                    <Link
                      to={
                        user.role === 'patient'
                          ? '/patient/profile'
                          : user.role === 'hospital'
                          ? '/hospital/profile'
                          : '/admin/dashboard'
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex-1 text-center py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                    >
                      View Profile
                    </Link>
                    <Link
                      to={
                        user.role === 'patient'
                          ? '/patient/settings'
                          : user.role === 'hospital'
                          ? '/hospital/settings'
                          : '/admin/settings'
                      }
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 flex items-center justify-center"
                      title="Settings"
                    >
                      <SettingsIcon className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    <UserIcon className="w-4 h-4 mr-2 text-teal-300" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm"
                  >
                    {t('nav.register', 'Register New Patient / Hospital')}
                  </Link>
                </div>
              )}

              {/* Navigation Links Group */}
              <div className="space-y-1 pt-1">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Navigation
                </p>

                {/* Common Primary Links */}
                <Link
                  to="/patient/hospitals"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/patient/hospitals')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Find Hospitals & Doctors</span>
                </Link>

                <Link
                  to="/assessment"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/assessment')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Patient Access Assessment</span>
                </Link>

                <Link
                  to="/architecture"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/architecture')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>System Architecture</span>
                </Link>

                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/about')
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>About Platform</span>
                </Link>

                <Link
                  to={user?.role === 'hospital' ? '/hospital/teleconsult' : '/patient/teleconsult'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/patient/teleconsult') || isActive('/hospital/teleconsult')
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Laptop className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Live Teleconsult</span>
                </Link>

                <Link
                  to={user?.role === 'admin' ? '/admin/digital-twin' : '/patient/digital-twin'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/patient/digital-twin') || isActive('/admin/digital-twin')
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Digital Twin Simulator</span>
                </Link>

                {/* Dashboard Link */}
                <Link
                  to={
                    user?.role === 'patient'
                      ? '/patient/dashboard'
                      : user?.role === 'hospital'
                      ? '/hospital/dashboard'
                      : '/admin/dashboard'
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                    isActive('/patient/dashboard') ||
                    isActive('/hospital/dashboard') ||
                    isActive('/admin/dashboard')
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{t('nav.dashboard', 'Dashboard')}</span>
                </Link>

                {/* Public Health & Universal Access */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Public Health Network Grid
                  </p>


                  <Link
                    to="/patient/triage"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                      isActive('/patient/triage')
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Activity className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Digital Triage & Tier Router</span>
                  </Link>

                  <Link
                    to="/patient/referrals"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                      isActive('/patient/referrals')
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <GitFork className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Referral Tracking Hub</span>
                  </Link>

                  <Link
                    to="/patient/health-records"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                      isActive('/patient/health-records')
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Health Records & ABHA</span>
                  </Link>

                  <Link
                    to="/patient/medicines"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                      isActive('/patient/medicines')
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Pill className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>e-Aushadhi Medicine Stock</span>
                  </Link>

                  <Link
                    to="/patient/diagnostics"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                      isActive('/patient/diagnostics')
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Activity className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Diagnostic Network & Uptime</span>
                  </Link>

                  <Link
                    to="/patient/high-risk"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                      isActive('/patient/high-risk')
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <HeartPulse className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>High-Risk Care Registry</span>
                  </Link>

                  <Link
                    to="/patient/frontline"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                      isActive('/patient/frontline')
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>ASHA Frontline Seva Portal</span>
                  </Link>

                  <Link
                    to={
                      user?.role === 'hospital'
                        ? '/hospital/facility-metrics'
                        : user?.role === 'admin'
                        ? '/admin/facility-metrics'
                        : '/patient/facility-metrics'
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold transition-colors ${
                      isActive('/patient/facility-metrics') ||
                      isActive('/hospital/facility-metrics') ||
                      isActive('/admin/facility-metrics')
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Facility Quality & NQAS Index</span>
                  </Link>
                </div>

                {/* Patient Role Specific */}
                {user?.role === 'patient' && (
                  <>
                    <Link
                      to="/patient/friction"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Activity className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{t('nav.frictionProfile', 'Friction Profile')}</span>
                    </Link>
                    <Link
                      to="/patient/risk"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Shield className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{t('nav.accessibilityRisk', 'Accessibility Risk')}</span>
                    </Link>
                    <Link
                      to="/patient/requests"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Layers className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{t('nav.myRequests', 'My Hospital Requests')}</span>
                    </Link>
                    <Link
                      to="/patient/documents"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Layers className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{t('nav.myDocuments', 'Document Vault')}</span>
                    </Link>
                  </>
                )}

                {/* Hospital Role Specific */}
                {user?.role === 'hospital' && (
                  <>
                    <Link
                      to="/hospital/requests"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Layers className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>{t('nav.triageQueue', 'Patient Requests Queue')}</span>
                    </Link>
                    <Link
                      to="/hospital/departments"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{t('nav.opdManagement', 'Departments & OPD')}</span>
                    </Link>
                  </>
                )}

                {/* Admin Role Specific */}
                {user?.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/judge-mode"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800"
                    >
                      <BarChart3 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>System Impact Evaluation</span>
                    </Link>
                    <Link
                      to="/admin/simulator"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Cpu className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>What-If Simulator</span>
                    </Link>
                    <Link
                      to="/admin/interventions"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Layers className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Budget Optimizer</span>
                    </Link>
                    <Link
                      to="/admin/friction-map"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>Population Friction Map</span>
                    </Link>
                  </>
                )}

                {/* Public Visitor Extra Links */}
                {!isAuthenticated && (
                  <>
                    <Link
                      to="/architecture"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800"
                    >
                      <Layers className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>System Architecture</span>
                    </Link>
                    <Link
                      to="/about"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <span>About Platform</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Notifications Accordion (Mobile) */}
              {isAuthenticated && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsMobileNotifExpanded(!isMobileNotifExpanded)}
                    className="w-full flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <Bell className="w-4 h-4 text-slate-500" />
                      <span>{t('nav.notifications', 'Notifications')}</span>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                      {unreadCount}
                    </span>
                  </button>

                  {isMobileNotifExpanded && (
                    <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto px-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 p-3 text-center">No notifications yet.</p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => {
                              markAsRead(notif._id);
                              if (notif.actionUrl) {
                                setIsMobileMenuOpen(false);
                                navigate(notif.actionUrl);
                              }
                            }}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                              !notif.isRead
                                ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                              {notif.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Preferences & Language Group */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Language Preferences
                </p>

                {/* Language Selector (Full-Width) */}
                <div className="px-1">
                  <LanguageSelector fullWidth={true} />
                </div>

                {/* Settings link */}
                <Link
                  to={
                    user?.role === 'patient'
                      ? '/patient/settings'
                      : user?.role === 'hospital'
                      ? '/hospital/settings'
                      : '/admin/settings'
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-500" />
                  <span>{t('nav.settings', 'Settings & Accessibility')}</span>
                </Link>
              </div>
            </div>

            {/* Drawer Footer (Sign Out or Security Disclaimer) */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 shrink-0">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('nav.logout', 'Sign Out of System')}</span>
                </button>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Patient Friction Index System • Non-Clinical Access Platform
                </p>
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
