import { Outlet, Navigate, useLocation, Link, useOutlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';
import { DemoModeBanner } from '../components/common/DemoModeBanner';
import { useAuth } from '../context/AuthContext';
import { Loader2, BarChart3, LogIn } from 'lucide-react';
import { JudgeImpactDashboard } from '../pages/admin/JudgeImpactDashboard';

export const AdminLayout: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const outlet = useOutlet();
  console.log('[AdminLayout DEBUG] path:', location.pathname, 'outlet.type:', outlet?.type);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  // Detect whether the current admin route is the Platform Impact Evaluation Mode
  const isJudgeMode = location.pathname.toLowerCase().includes('judge-mode');

  // Authorization check:
  // - Judge Mode allows direct evaluation access so evaluators opening the direct URL can immediately inspect the system.
  // - All other administrative pages require authentication and redirect to /login preserving the return path.
  if (!isAuthenticated || !user) {
    if (!isJudgeMode) {
      return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} state={{ from: location }} replace />;
    }
  } else if (user.role !== 'admin') {
    if (!isJudgeMode) {
      const redirectMap: Record<string, string> = {
        hospital: '/hospital/dashboard',
        doctor: '/doctor/dashboard',
        asha_worker: '/asha/dashboard',
        government: '/government/dashboard',
      };
      return <Navigate to={redirectMap[user.role] || '/patient/dashboard'} replace />;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {isJudgeMode && (!isAuthenticated || user?.role !== 'admin') ? (
        <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 text-white px-4 py-2.5 border-b border-purple-500/30 text-xs flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-amber-300" />
            <span className="font-semibold text-purple-100">
              System Impact Evaluation Hub • Viewing with Evaluator Privileges
            </span>
          </div>
          <Link
            to="/login?role=admin&redirect=/admin/judge-mode"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-500/30 hover:bg-purple-500/50 text-purple-100 font-bold border border-purple-400/40 transition-all text-[11px]"
          >
            <LogIn className="w-3 h-3" />
            <span>Sign In as Admin</span>
          </Link>
        </div>
      ) : (
        <DemoModeBanner message="ADMINISTRATIVE HEALTH OPERATIONS SUITE: Population friction heatmaps, care leakage analytics, and intervention budget simulations." />
      )}
      <Navbar />
      <div className="flex-grow flex max-w-7xl mx-auto w-full">
        <Sidebar forceRole={isJudgeMode && (!user || user.role !== 'admin') ? 'admin' : undefined} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {isJudgeMode ? <JudgeImpactDashboard /> : <Outlet />}
        </main>
      </div>
      <Footer />
    </div>
  );
};
