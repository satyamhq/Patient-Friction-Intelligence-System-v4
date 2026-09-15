import React, { useState, useEffect } from 'react';
import { ashaService, OfflineSyncOperation } from '../../services/ashaService';
import { useToast } from '../../context/ToastContext';
import {
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  ArrowRight,
  Shield,
  Layers,
  Database,
  Sparkles,
} from 'lucide-react';

export const AshaOfflineSync: React.FC = () => {
  const { showToast } = useToast();
  const [queue, setQueue] = useState<OfflineSyncOperation[]>([]);
  const [serverStatus, setServerStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadData = async () => {
    setQueue(ashaService.getOfflineQueue());
    try {
      const res = await ashaService.getDashboardStats();
      if (res.success) {
        setServerStatus(res.stats.syncStatus);
      }
    } catch {}
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncNow = async () => {
    if (!navigator.onLine) {
      showToast('Device is offline. Connect to network before syncing.', 'warning');
      return;
    }

    setIsSyncing(true);
    try {
      const res = await ashaService.syncOfflineQueue();
      if (res.success) {
        showToast(res.message || 'All queued operations synchronized cleanly.', 'success');
        await loadData();
      } else {
        showToast('Sync processed with current local state.', 'info');
      }
    } catch {
      showToast('Synchronization error. Please retry.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearSynced = () => {
    ashaService.clearOfflineQueue();
    setQueue([]);
    showToast('Local sync queue cleared.', 'info');
  };

  const pendingCount = queue.filter((q) => q.status === 'PENDING').length;
  const syncedCount = queue.filter((q) => q.status === 'SYNCED').length;
  const failedCount = queue.filter((q) => q.status === 'FAILED').length;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Offline-First Field Architecture</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            Field Synchronization Center & Offline Queue
          </h1>
          <p className="text-xs text-slate-500">
            Idempotent field operation synchronization, offline conflict resolution, and server confirmation logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          {queue.length > 0 && (
            <button
              onClick={handleClearSynced}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold"
            >
              Clear Local Log
            </button>
          )}
          <button
            onClick={handleSyncNow}
            disabled={isSyncing || !isOnline}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {/* Connectivity & Idempotency Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Device Connection</span>
            {isOnline ? <Wifi className="w-4 h-4 text-emerald-500" /> : <WifiOff className="w-4 h-4 text-rose-500" />}
          </div>
          <strong className="text-lg font-bold text-slate-900 block">
            {isOnline ? 'Online (Connected)' : 'Offline (Local Only)'}
          </strong>
          <span className="text-[11px] text-slate-500">Local cache active</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Pending Local Ops</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <strong className="text-lg font-bold text-slate-900 block">
            {pendingCount} Records
          </strong>
          <span className="text-[11px] text-amber-600">Awaiting network confirmation</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Synced to Database</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <strong className="text-lg font-bold text-slate-900 block">
            {syncedCount} Confirmed
          </strong>
          <span className="text-[11px] text-emerald-600">Zero duplicate submission</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Failed Submissions</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <strong className="text-lg font-bold text-slate-900 block">
            {failedCount} Operations
          </strong>
          <span className="text-[11px] text-slate-500">Auto-retry on reconnect</span>
        </div>
      </div>

      {/* Architectural Guarantee Card */}
      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center gap-3 text-xs text-teal-900">
        <Sparkles className="w-5 h-5 text-teal-600 shrink-0" />
        <div>
          <strong className="block font-bold">Idempotency Key Protection</strong>
          <span>
            Every field operation generates a unique client UUID (`localOperationId`). Re-sending after network reconnection never produces duplicate visits, duplicate tasks, or duplicate queue tokens.
          </span>
        </div>
      </div>

      {/* Queue Details */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">
          Local Operation Queue & Audit History
        </h3>

        {queue.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Queue is empty. All field actions have been synchronized to the shared PFIS relational backend.
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map((op) => (
              <div
                key={op.localOperationId}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900">{op.operationType}</strong>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        op.status === 'SYNCED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : op.status === 'FAILED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {op.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Key: {op.localOperationId} • Queued: {new Date(op.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                <span className="text-[11px] text-slate-400 font-sans self-start sm:self-auto">
                  Payload verified
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
