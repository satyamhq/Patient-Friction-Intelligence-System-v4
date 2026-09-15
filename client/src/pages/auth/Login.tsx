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
  ArrowRight,
  ShieldCheck,
  Globe,
  Loader2,
  Stethoscope,
  HeartHandshake,
  Landmark,
  Eye,
  EyeOff,
} from 'lucide-react';

type PortalRole = 'patient' | 'doctor' | 'hospital' | 'asha_worker' | 'government' | 'admin';

interface PortalConfig {
  id: PortalRole;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  accentBorder: string;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const Login: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') as PortalRole) || 'patient';

  const [activePortal, setActivePortal] = useState<PortalRole>(
    ['patient', 'doctor', 'hospital', 'asha_worker', 'government', 'admin'].includes(initialRole)
      ? initialRole
      : 'patient'
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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

  // If already authenticated, redirect immediately
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
              setRedirectingMessage('Verifying Google Security Token...');
              try {
                const res = await loginWithGoogle(response.credential, activePortalRef.current);
                if (res.success) {
                  setRedirectingMessage('Authenticated! Redirecting to Portal...');
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
      title: 'Patient & Citizen',
      subtitle: 'Non-clinical barrier check, nearby hospitals & health records vault',
      badge: 'Citizen Access',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <User className="w-4 h-4 text-emerald-600" />,
      accentBorder: 'border-emerald-500 ring-emerald-500/20',
    },
    {
      id: 'doctor',
      title: 'Doctor & Specialist',
      subtitle: 'Clinical OPD queue, teleconsultation room & patient health records',
      badge: 'Clinical Specialist',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: <Stethoscope className="w-4 h-4 text-teal-600" />,
      accentBorder: 'border-teal-500 ring-teal-500/20',
    },
    {
      id: 'hospital',
      title: 'Hospital & Facility',
      subtitle: 'Triage desk, patient intake review & OPD department capacity',
      badge: 'Clinical Facility',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: <Building2 className="w-4 h-4 text-blue-600" />,
      accentBorder: 'border-blue-500 ring-blue-500/20',
    },
    {
      id: 'asha_worker',
      title: 'ASHA Field Worker',
      subtitle: 'Village household cohort, maternal register & referral escalation',
      badge: 'Frontline Seva',
      badgeColor: 'bg-green-50 text-green-700 border-green-200',
      icon: <HeartHandshake className="w-4 h-4 text-green-600" />,
      accentBorder: 'border-green-500 ring-green-500/20',
    },
    {
      id: 'government',
      title: 'Health Authority',
      subtitle: 'District health analytics, hospital accreditation & population friction maps',
      badge: 'District / State Oversight',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: <Landmark className="w-4 h-4 text-indigo-600" />,
      accentBorder: 'border-indigo-500 ring-indigo-500/20',
    },
    {
      id: 'admin',
      title: 'Health Ministry & Admin',
      subtitle: 'Statewide population health intelligence, policy simulation & security logs',
      badge: 'Executive Admin',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: <Shield className="w-4 h-4 text-purple-600" />,
      accentBorder: 'border-purple-500 ring-purple-500/20',
    },
  ];

  const currentPortalConfig = portals.find((p) => p.id === activePortal) || portals[0];

  const handlePortalSwitch = (role: PortalRole) => {
    setActivePortal(role);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setRedirectingMessage('Verifying credentials...');

    try {
      const res = await login(email.trim(), password);
      if (res.success) {
        const redirectParam = searchParams.get('redirect');
        const targetUrl =
          redirectParam && redirectParam.startsWith('/')
            ? redirectParam
            : roleRedirectMap[res.user.role] || '/patient/dashboard';

        setRedirectingMessage('Authentication successful! Redirecting...');
        setTimeout(() => {
          navigate(targetUrl, { replace: true });
        }, 200);
      }
    } catch (err: any) {
      setRedirectingMessage(null);
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsGoogleLoading(true);
    setRedirectingMessage('Connecting to Google Identity Services...');

    try {
      const res = await authService.getGoogleAuthUrl(activePortal, GOOGLE_CLIENT_ID);
      if (res.success && res.url) {
        window.location.href = res.url;
        return;
      }
    } catch (err: any) {
      console.warn('Redirecting directly to backend Google OAuth route:', err);
    }

    window.location.href = authService.getGoogleOAuthRedirectUrl(activePortal);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-10 space-y-8 relative">
      {/* Loading & Redirect Overlay */}
      {redirectingMessage && (
        <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-brand-600 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {redirectingMessage}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Securing session with PFIS Core Engine...
            </p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-slate-600">
            PFIS Enterprise Portal
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <LanguageSelector compact />
        </div>
      </div>

      {/* Title & Description */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In to PFIS
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          {currentPortalConfig.subtitle}
        </p>
      </div>

      {/* Enterprise Role Context Selector */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-700 block">
          Select Portal Context:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {portals.map((portal) => {
            const isSelected = activePortal === portal.id;
            return (
              <button
                key={portal.id}
                type="button"
                onClick={() => handlePortalSwitch(portal.id)}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? `bg-slate-50 border-2 shadow-sm ${portal.accentBorder}`
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-slate-100">
                    {portal.icon}
                  </div>
                  {isSelected ? (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${portal.badgeColor}`}>
                      Selected
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">{portal.badge}</span>
                  )}
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block leading-snug">
                    {portal.title}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5 line-clamp-1">
                    {portal.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
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

      {/* Official Google Sign In Option */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isLoading}
          className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-xl border border-slate-300 shadow-xs flex items-center justify-center gap-3 transition-all hover:shadow-md disabled:opacity-50 cursor-pointer"
        >
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
              ? 'Opening Google Sign In...'
              : `Sign in with Google`}
          </span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-xs font-medium text-slate-400 uppercase tracking-wider absolute">
            Or sign in with email
          </span>
        </div>
      </div>

      {/* Production Credentials Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('auth.emailLabel', 'Email Address')}
          type="email"
          placeholder="e.g. name@health.gov.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4 text-slate-400" />}
          required
        />

        <div className="space-y-1">
          <div className="relative">
            <Input
              label={t('auth.passwordLabel', 'Password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-600">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span>Remember this device</span>
          </label>
          <a href="#forgot" className="font-semibold text-brand-600 hover:text-brand-700">
            Forgot password?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-3"
          isLoading={isLoading}
        >
          <span>{`Sign In to ${currentPortalConfig.title}`}</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </form>

      {/* Security Compliance Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-100 text-xs text-slate-500">
        <div>
          {t('auth.noAccount', "Don't have an account?")}{' '}
          <Link
            to={`/register?role=${activePortal}`}
            className="font-bold text-brand-600 hover:text-brand-700"
          >
            {t('auth.createAccount', 'Register for PFIS')}
          </Link>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-bit SSL Encrypted • ABHA Health Security Compliant</span>
        </div>
      </div>
    </div>
  );
};
