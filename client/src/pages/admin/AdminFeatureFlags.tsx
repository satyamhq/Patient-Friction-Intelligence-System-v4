import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { ToggleLeft, ToggleRight, Shield, Users, Zap, Activity, RefreshCw } from 'lucide-react';

const ROLE_COLORS: Record<string, string> = {
  patient: 'bg-teal-100 text-teal-700 border-teal-200',
  doctor: 'bg-blue-100 text-blue-700 border-blue-200',
  hospital: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  asha_worker: 'bg-green-100 text-green-700 border-green-200',
  government: 'bg-violet-100 text-violet-700 border-violet-200',
  admin: 'bg-slate-100 text-slate-700 border-slate-200',
};

const FLAG_ICONS: Record<string, React.ReactNode> = {
  teleconsultation: <Zap className="w-5 h-5 text-blue-500" />,
  digital_triage: <Activity className="w-5 h-5 text-teal-500" />,
  asha_portal: <Users className="w-5 h-5 text-green-500" />,
  government_analytics: <Shield className="w-5 h-5 text-violet-500" />,
  default: <Activity className="w-5 h-5 text-indigo-500" />,
};

export const AdminFeatureFlags: React.FC = () => {
  const { showToast } = useToast();
  const [flags, setFlags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const loadFlags = async () => {
    setIsLoading(true);
    try {
      const res = await adminService.getFeatureFlags();
      if (res.success) setFlags(res.flags);
    } catch (e) {
      showToast('Failed to load feature flags.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadFlags(); }, []);

  const handleToggle = async (flag: any) => {
    setToggling(flag.key);
    try {
      await adminService.updateFeatureFlag(flag.key, !flag.enabled);
      setFlags((prev) => prev.map((f) => f.key === flag.key ? { ...f, enabled: !f.enabled } : f));
      showToast(`Feature "${flag.label}" ${!flag.enabled ? 'enabled' : 'disabled'}.`, 'success');
    } catch (e) {
      showToast('Failed to update feature flag.', 'error');
    } finally {
      setToggling(null);
    }
  };

  const enabledCount = flags.filter((f) => f.enabled).length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-300 to-transparent" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-200 text-xs font-semibold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5" />
              <span>Admin Feature Manager</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Feature Flags Control</h1>
            <p className="text-violet-100/80 text-sm">
              Toggle PFIS features on/off per role. Changes take effect immediately across all portals.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center bg-violet-500/20 border border-violet-400/30 rounded-2xl px-5 py-3">
              <p className="text-2xl font-black">{enabledCount}/{flags.length}</p>
              <p className="text-violet-200 text-xs">Features Active</p>
            </div>
            <button
              onClick={loadFlags}
              className="w-10 h-10 rounded-xl bg-violet-500/30 hover:bg-violet-500/50 border border-violet-400/40 flex items-center justify-center transition-all"
            >
              <RefreshCw className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Flags Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {flags.map((flag) => (
            <div
              key={flag.key}
              className={`bg-white rounded-2xl border-2 p-5 shadow-sm space-y-4 transition-all ${
                flag.enabled ? 'border-violet-200 hover:border-violet-400' : 'border-slate-100 hover:border-slate-200 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${flag.enabled ? 'bg-violet-50' : 'bg-slate-50'}`}>
                    {FLAG_ICONS[flag.key] || FLAG_ICONS.default}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">{flag.label}</p>
                    <p className={`text-[10px] font-semibold uppercase tracking-wider ${flag.enabled ? 'text-violet-500' : 'text-slate-400'}`}>
                      {flag.enabled ? '● Active' : '○ Disabled'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(flag)}
                  disabled={toggling === flag.key}
                  className="flex-shrink-0 p-1 rounded-lg hover:bg-slate-50 transition-all"
                  title={flag.enabled ? 'Disable' : 'Enable'}
                >
                  {toggling === flag.key ? (
                    <RefreshCw className="w-7 h-7 animate-spin text-slate-400" />
                  ) : flag.enabled ? (
                    <ToggleRight className="w-8 h-8 text-violet-500" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-slate-300" />
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">{flag.description}</p>

              <div className="flex flex-wrap gap-1.5">
                {(flag.enabledFor || []).map((role: string) => (
                  <span
                    key={role}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_COLORS[role] || 'bg-slate-100 text-slate-500 border-slate-200'}`}
                  >
                    {role.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="font-bold text-slate-800 text-sm mb-3">Role Color Guide</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ROLE_COLORS).map(([role, cls]) => (
            <span key={role} className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${cls}`}>
              {role.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
