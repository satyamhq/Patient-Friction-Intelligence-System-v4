import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Shield,
  Users,
  Building2,
  ListOrdered,
  TrendingUp,
  Cpu,
  Sliders,
  MapPin,
  GitFork,
  BarChart3,
  ArrowRight,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
  KeyRound,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          adminService.getDashboardStats().catch(() => null),
          adminService.getAuditLogs(15).catch(() => null),
        ]);

        if (statsRes?.success) {
          setStats(statsRes.stats);
          setStatsError(false);
        } else {
          setStatsError(true);
        }

        if (logsRes?.success) {
          const authEvents = (logsRes.logs || []).filter((l: any) =>
            l.action?.startsWith('AUTH_') || l.action === 'PATIENT_PROFILE_UPDATED'
          );
          setRecentLogs(authEvents.length > 0 ? authEvents : logsRes.logs.slice(0, 10));
        }
      } catch (e) {
        console.error(e);
        setStatsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  const googleLoginsCount = recentLogs.filter(
    (l) => l.action === 'AUTH_GOOGLE_LOGIN' || l.details?.provider === 'google'
  ).length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-tr from-slate-900 via-navy-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 text-teal-300 text-xs font-bold border border-teal-800">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>Population Health Intelligence & Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            PFIS Administrative Control Suite
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Live real-time monitoring of all authenticated user logins (Patient, Clinical Hospital, and Google accounts),
            friction heatmaps, and population-level care completion metrics.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link to="/admin/judge-mode">
            <button className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold text-xs shadow-md transition-all">
              <BarChart3 className="w-4 h-4 text-white" />
              <span>System Impact Evaluation</span>
            </button>
          </Link>
          <Link to="/admin/simulator">
            <Button variant="secondary" size="sm" icon={<Cpu className="w-4 h-4" />}>
              What-If Simulator
            </Button>
          </Link>
          <Link to="/admin/audit-logs">
            <Button variant="outline" size="sm" icon={<Activity className="w-4 h-4" />}>
              Audit Trail
            </Button>
          </Link>
        </div>
      </div>

      {/* Official Master Admin Verification Bar */}
      <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Master Administrator Account:</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 font-mono text-[11px] font-bold">
                admin@pfis.org
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Role: System Health Director • System Administration • Relational Database Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            Audit Stream Live
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {statsError ? (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>Could not load real-time statistics. Check server connectivity or API status.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Monitored Population"
            value={stats?.totalPatients ?? '-'}
            subtitle="Registered patients in registry"
            icon={Users}
            badge="Live DB"
            badgeType="success"
          />

          <StatCard
            title="Connected Hospitals"
            value={stats?.totalHospitals ?? '-'}
            subtitle="Verified facility network"
            icon={Building2}
            badge="State Network"
            badgeType="info"
          />

          <StatCard
            title="Active Intake Requests"
            value={stats?.activeRequests ?? '-'}
            subtitle="Tokens & consults pending triage"
            icon={ListOrdered}
            badge="Needs Review"
            badgeType={stats?.activeRequests > 0 ? 'warning' : 'info'}
          />

          <StatCard
            title="Avg Friction Index"
            value={stats?.averageFrictionScore ?? '-'}
            subtitle="0 (Zero Friction) to 100"
            icon={TrendingUp}
            trend="State Target: <40"
            trendPositive={false}
            badge="State Average"
            badgeType={stats?.averageFrictionScore > 55 ? 'danger' : 'warning'}
          />
        </div>
      )}

      {/* Live Who Is Logged In & Recent Security Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-brand-600" />
              <span>User Logins & Security Activity Feed</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit log stream recording user logins and operational administrative events.
            </p>
          </div>

          <Link
            to="/admin/audit-logs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            <span>View Full Audit Stream</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No login events recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pr-4">User / Account</th>
                  <th className="pb-3 px-4">Role</th>
                  <th className="pb-3 px-4">Auth Method</th>
                  <th className="pb-3 px-4">Timestamp</th>
                  <th className="pb-3 pl-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentLogs.map((log: any, idx: number) => {
                  const isGoogle =
                    log.action === 'AUTH_GOOGLE_LOGIN' ||
                    log.details?.provider === 'google';
                  const userName = log.userId?.name || log.details?.name || 'Verified User';
                  const userEmail = log.userId?.email || log.details?.email || 'user@pfis.org';
                  const userRole = log.actorRole || log.userId?.role || 'patient';
                  const timeStr = log.createdAt || log.timestamp;
                  const dateFormatted = timeStr ? new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Just now';

                  return (
                    <tr key={log._id || idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            userRole === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : userRole === 'hospital'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-100 block">{userName}</span>
                            <span className="text-[11px] text-slate-400 font-mono">{userEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 capitalize font-semibold text-slate-700 dark:text-slate-300">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          userRole === 'admin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : userRole === 'hospital'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {userRole}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {isGoogle ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[10px] font-bold">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            Google Cloud OAuth
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium">
                            <KeyRound className="w-3 h-3" />
                            Direct Password
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{dateFormatted}</span>
                        </span>
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Navigation Cards into Intelligence Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/patients"
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card hover:shadow-card-hover hover:border-teal-300 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center border border-teal-200 dark:border-teal-800">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors flex items-center justify-between">
            Patient Registry <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            View all registered patients and Google users with individual friction fingerprints and contact records.
          </p>
        </Link>

        <Link
          to="/admin/friction-map"
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card hover:shadow-card-hover hover:border-teal-300 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center border border-blue-200 dark:border-blue-800">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors flex items-center justify-between">
            Population Friction Map <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Geographic heatmap identifying high-friction clusters, travel deserts, and district barrier distributions.
          </p>
        </Link>

        <Link
          to="/admin/simulator"
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-card hover:shadow-card-hover hover:border-teal-300 transition-all space-y-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors flex items-center justify-between">
            What-If Simulator <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Simulate completion gains from Community Shuttles, Satellite Diagnostics, and ASHA escorts in real-time.
          </p>
        </Link>
      </div>
    </div>
  );
};
