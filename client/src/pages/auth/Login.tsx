import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import {
  Mail,
  Lock,
  User,
  Building2,
  Shield,
  CheckCircle2,
  Activity,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  Globe,
  Loader2,
  Zap,
  Stethoscope,
  HeartHandshake,
  Landmark,
} from 'lucide-react';

type PortalRole = 'patient' | 'doctor' | 'hospital' | 'asha_worker' | 'government' | 'admin';

interface PortalConfig {
  id: PortalRole;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  defaultEmail: string;
  defaultPass: string;
  accentBorder: string;
  features: string[];
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as PortalRole) || 'admin';

  const [activePortal, setActivePortal] = useState<PortalRole>(initialRole);
  const [email, setEmail] = useState('admin@pfis.org');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [redirectingMessage, setRedirectingMessage] = useState<string | null>(null);

  const { user, isAuthenticated, login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const roleRedirectMap: Record<string, string> = {
    patient: '/patient/dashboard',
    doctor: '/doctor/dashboard',
    hospital: '/hospital/dashboard',
    asha_worker: '/asha/dashboard',
    government: '/government/dashboard',
    admin: '/admin/dashboard',
  };

  // If already authenticated, redirect to requested redirect or role dashboard immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectParam = searchParams.get('redirect');
      if (redirectParam && redirectParam.startsWith('/')) {
        navigate(redirectParam, { replace: true });
      } else {
        navigate(roleRedirectMap[user.role] || '/patient/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, searchParams]);


  // Set default credentials whenever active portal switches
  useEffect(() => {
    const creds: Record<PortalRole, { email: string; pass: string }> = {
      patient: { email: 'patient@pfis.org', pass: 'Patient@123' },
      doctor: { email: 'doctor@pfis.org', pass: 'Doctor@123' },
      hospital: { email: 'hospital@apollo.org', pass: 'Hospital@123' },
      asha_worker: { email: 'asha@pfis.org', pass: 'Asha@123' },
      government: { email: 'government@pfis.org', pass: 'Govt@123' },
      admin: { email: 'admin@pfis.org', pass: 'Admin@123' },
    };
    if (creds[activePortal]) {
      setEmail(creds[activePortal].email);
      setPassword(creds[activePortal].pass);
    }
  }, [activePortal]);

  const activePortalRef = useRef(activePortal);
  useEffect(() => {
    activePortalRef.current = activePortal;
  }, [activePortal]);

  const isGsiInitialized = useRef(false);

  // Initialize Google Identity Services once when available
  useEffect(() => {
    try {
      if ((window as any).google?.accounts?.id && !isGsiInitialized.current) {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (response.credential) {
              setIsGoogleLoading(true);
              setRedirectingMessage('Verifying Google credentials...');
              try {
                const res = await loginWithGoogle(response.credential, activePortalRef.current);
                if (res.success) {
                  setRedirectingMessage('Authenticated! Redirecting to Dashboard...');
                  setTimeout(() => {
                    navigate(roleRedirectMap[res.user.role] || '/patient/dashboard', { replace: true });
                  }, 200);
                }
              } catch (err: any) {
                setRedirectingMessage(null);
                setError(err.response?.data?.message || 'Google authentication failed.');
              } finally {
                setIsGoogleLoading(false);
              }
            }
          },
        });
        isGsiInitialized.current = true;
      }
    } catch (e) {
      console.warn('GIS notice', e);
    }
  }, [loginWithGoogle, navigate]);

  const portals: PortalConfig[] = [
    {
      id: 'patient',
      title: 'Patient & Citizen Portal',
      subtitle: 'Non-clinical barrier check, nearby hospitals, OPD token request & EHR vault',
      badge: 'Citizen Access',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300',
      icon: <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      defaultEmail: 'patient@pfis.org',
      defaultPass: 'Patient@123',
      accentBorder: 'border-emerald-500 ring-emerald-500/20',
      features: [
        'Personal Friction Fingerprint & Barriers',
        'Nearby Hospital Locator & Travel Times',
        'OPD Token Booking & Live Teleconsult',
      ],
    },
    {
      id: 'doctor',
      title: 'Doctor & Clinical Specialist',
      subtitle: 'OPD queue management, teleconsultation room, and patient health records',
      badge: 'Clinical Specialist',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300',
      icon: <Stethoscope className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
      defaultEmail: 'doctor@pfis.org',
      defaultPass: 'Doctor@123',
      accentBorder: 'border-teal-500 ring-teal-500/20',
      features: [
        'Live Video Teleconsultation Suite',
        'Longitudinal ABHA Health Records',
        'Clinical Triage & Prescription Desk',
      ],
    },
    {
      id: 'hospital',
      title: 'Hospital & Clinical Facility',
      subtitle: 'Triage desk, patient intake review, & OPD department capacity management',
      badge: 'Clinical Desk',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300',
      icon: <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      defaultEmail: 'hospital@apollo.org',
      defaultPass: 'Hospital@123',
      accentBorder: 'border-blue-500 ring-blue-500/20',
      features: [
        'Live Patient Triage & Risk Prioritization',
        'Daily Department Token Allocation',
        'Pharmacy & Diagnostic Equipment Status',
      ],
    },
    {
      id: 'asha_worker',
      title: 'ASHA Frontline Health Worker',
      subtitle: 'Village household cohort, maternal health register, and high-risk case escalation',
      badge: 'Frontline Seva',
      badgeColor: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300',
      icon: <HeartHandshake className="w-5 h-5 text-green-600 dark:text-green-400" />,
      defaultEmail: 'asha@pfis.org',
      defaultPass: 'Asha@123',
      accentBorder: 'border-green-500 ring-green-500/20',
      features: [
        'Community Household & Village Register',
        'High-Risk Escalation Flagging System',
        'Maternal & Immunization Follow-ups',
      ],
    },
    {
      id: 'government',
      title: 'Government & Health Authority',
      subtitle: 'District health analytics, hospital accreditation oversight & population friction maps',
      badge: 'Health Authority',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300',
      icon: <Landmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      defaultEmail: 'government@pfis.org',
      defaultPass: 'Govt@123',
      accentBorder: 'border-indigo-500 ring-indigo-500/20',
      features: [
        'District Bed & ICU Capacity Oversight',
        'Hospital Accreditation & Regulatory Controls',
        'Population Friction Geo-Spatial Heatmaps',
      ],
    },
    {
      id: 'admin',
      title: 'Health Ministry & Administration',
      subtitle: 'Statewide population health intelligence, policy simulation, user roles & audit logs',
      badge: 'Security Level 1',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950 dark:text-purple-300',
      icon: <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      defaultEmail: 'admin@pfis.org',
      defaultPass: 'Admin@123',
      accentBorder: 'border-purple-500 ring-purple-500/20',
      features: [
        'Population Friction Heatmaps & Geo-Analytics',
        'What-If Policy & Intervention Simulator',
        'User Directory & Dynamic Feature Flags',
      ],
    },
  ];

  const currentPortalConfig = portals.find((p) => p.id === activePortal) || portals[0];

  const handlePortalSwitch = (role: PortalRole) => {
    setActivePortal(role);
    setError(null);
    setSuccessMessage(null);
  };

  const handleDirectSignIn = async (roleEmail: string, rolePass: string, role: PortalRole) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setRedirectingMessage(`Authenticating ${roleEmail}...`);

    try {
      const res = await login(roleEmail, rolePass);
      if (res.success) {
        const redirectParam = searchParams.get('redirect');
        const targetUrl = (redirectParam && redirectParam.startsWith('/'))
          ? redirectParam
          : (roleRedirectMap[res.user.role] || '/patient/dashboard');
        setRedirectingMessage(`Welcome back! Redirecting to ${targetUrl.includes('judge-mode') ? 'Impact Evaluation Dashboard' : role + ' dashboard'}...`);
        setTimeout(() => {
          navigate(targetUrl, { replace: true });
        }, 200);
      }
    } catch (err: any) {
      setRedirectingMessage(null);
      setError(err.response?.data?.message || 'Invalid credentials or server connection error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }
    await handleDirectSignIn(email, password, activePortal);
  };

  // DIRECT REAL GOOGLE OAUTH 2.0 LOGIN
  const handleDirectRealGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);
    setRedirectingMessage('Opening official Google Cloud OAuth dialog...');

    try {
      const res = await authService.getGoogleAuthUrl(activePortal, GOOGLE_CLIENT_ID);
      if (res.success && res.url) {
        window.location.href = res.url;
        return;
      }
    } catch (err: any) {
      console.warn('Backend getGoogleAuthUrl did not return URL, navigating directly to backend Google OAuth route:', err);
    }

    // Direct backend OAuth endpoint navigation
    window.location.href = authService.getGoogleOAuthRedirectUrl(activePortal);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl p-6 sm:p-10 space-y-8 transition-all relative">
      {/* Redirecting Overlay */}
      {redirectingMessage && (
        <div className="absolute inset-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {redirectingMessage}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Synchronizing session with PFIS Intelligence Engine...
            </p>
          </div>
        </div>
      )}

      {/* Top Header & Localization */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            PFIS Universal Authentication Engine
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <LanguageSelector compact />
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="text-center space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>PFIS Integrated Multi-Role Healthcare Portal</span>
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          {currentPortalConfig.title} Sign In
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          {currentPortalConfig.subtitle}
        </p>
      </div>

      {/* All 6 Dedicated Portal Selection Cards with 1-Click Entry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {portals.map((portal) => {
          const isSelected = activePortal === portal.id;
          return (
            <div
              key={portal.id}
              onClick={() => handlePortalSwitch(portal.id)}
              className={`text-left p-4 rounded-2xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? `bg-slate-50/95 dark:bg-slate-800/95 border-2 shadow-lg ${portal.accentBorder}`
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-xs border border-slate-100 dark:border-slate-800">
                    {portal.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${portal.badgeColor}`}>
                    {portal.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {portal.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {portal.subtitle}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 truncate max-w-[130px]">
                  {portal.defaultEmail}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectSignIn(portal.defaultEmail, portal.defaultPass, portal.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors ${
                    portal.id === 'admin'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : portal.id === 'doctor'
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : portal.id === 'hospital'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : portal.id === 'asha_worker'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : portal.id === 'government'
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  <span>Enter</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Specific Notice */}
      {activePortal === 'admin' && (
        <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-center gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-bold text-purple-900 dark:text-purple-200 block">
              Authorized Executive Admin Email: dhirajkumar464748@gmail.com & admin@pfis.org
            </span>
            <span className="text-[11px] text-purple-700 dark:text-purple-300">
              Only authorized administrative emails get access to the Admin Intelligence Suite. All other accounts are automatically routed to Patient or Clinical portals.
            </span>
          </div>
        </div>
      )}

      {/* Feature Highlights of the Active Portal */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-500" />
            <span>Portal Capabilities for {currentPortalConfig.title}:</span>
          </span>
          <span className="text-[10px] text-slate-400">Live Dynamic System</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
          {currentPortalConfig.features.map((feat, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 1-Click Verified Demo Accounts Bar */}
      <div className="p-4 bg-slate-100/70 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-brand-600" />
            <span>1-Click Verified Database Credentials (Click to Sign In):</span>
          </span>
          <span className="text-[10px] text-slate-500 font-normal">Real Database Accounts</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleDirectSignIn('patient@pfis.org', 'Patient@123', 'patient')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              activePortal === 'patient'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
            }`}
          >
            👤 Sunita Devi (Patient)
          </button>
          <button
            type="button"
            onClick={() => handleDirectSignIn('doctor@pfis.org', 'Doctor@123', 'doctor')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              activePortal === 'doctor'
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-400'
            }`}
          >
            🩺 Dr. Priya Sharma (Doctor)
          </button>
          <button
            type="button"
            onClick={() => handleDirectSignIn('hospital@apollo.org', 'Hospital@123', 'hospital')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              activePortal === 'hospital'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
            }`}
          >
            🏥 Apollo Hospital (Clinical)
          </button>
          <button
            type="button"
            onClick={() => handleDirectSignIn('asha@pfis.org', 'Asha@123', 'asha_worker')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              activePortal === 'asha_worker'
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-green-400'
            }`}
          >
            🤝 Kavita Devi (ASHA Worker)
          </button>
          <button
            type="button"
            onClick={() => handleDirectSignIn('government@pfis.org', 'Govt@123', 'government')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              activePortal === 'government'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
            }`}
          >
            🏛️ Rajesh Verma (Government)
          </button>
          <button
            type="button"
            onClick={() => handleDirectSignIn('admin@pfis.org', 'Admin@123', 'admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              email === 'admin@pfis.org'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
            }`}
          >
            🛡️ Admin (admin@pfis.org)
          </button>
          <button
            type="button"
            onClick={() => handleDirectSignIn('dhirajkumar464748@gmail.com', 'Admin@123', 'admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-xs ${
              email === 'dhirajkumar464748@gmail.com'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400'
            }`}
          >
            🛡️ Dhiraj Kumar (Executive Admin)
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {successMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* REAL DIRECT GOOGLE OAUTH 2.0 BUTTON (NO POPUP SETUP MODAL) */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleDirectRealGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full py-3.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold text-sm rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-center gap-3 transition-all hover:shadow-md disabled:opacity-50 group cursor-pointer"
        >
          {/* Official Google G SVG Icon */}
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>
            {isGoogleLoading
              ? 'Opening Google Cloud OAuth Dialog...'
              : `Sign In with Real Google Account (${currentPortalConfig.title})`}
          </span>
        </button>

        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-1 px-1">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Google Cloud OAuth 2.0 Active & Verified</span>
          </div>
          <span className="text-slate-400">
            Real Google Accounts Login
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 dark:border-slate-700 w-full" />
        <span className="bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider absolute">
          Or sign in with email credentials
        </span>
      </div>

      {/* Dynamic Portal Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('auth.emailLabel', 'Email Address')}
          type="email"
          placeholder={currentPortalConfig.defaultEmail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label={t('auth.passwordLabel', 'Password')}
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<Lock className="w-4 h-4" />}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={isLoading}
        >
          <span>{`Sign In to ${currentPortalConfig.title}`}</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      {/* Bottom Footer & Account Registration */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
        <div>
          {t('auth.noAccount', "Don't have an account?")}{' '}
          <Link
            to={`/register?role=${activePortal}`}
            className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            {t('auth.createAccount', 'Register for PFIS')}
          </Link>
        </div>
        <div className="text-[11px] text-slate-400">
          Role: <strong className="text-slate-700 dark:text-slate-300 capitalize">{activePortal}</strong> • Non-Clinical Healthcare Platform
        </div>
      </div>
    </div>
  );
};
