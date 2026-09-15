import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { offlineSyncService } from '../../services/offlineSyncService';

export const OfflineSyncIndicator: React.FC = () => {
  const { showToast } = useToast();
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const unsubscribe = offlineSyncService.subscribe((online, count) => {
      setIsOnline(online);
      setPendingCount(count);
    });
    return () => unsubscribe();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await offlineSyncService.processQueue();
      showToast('All local offline records successfully synchronized with the Health Grid!', 'success');
    } catch {
      showToast('Sync attempt encountered network issues. Will retry automatically.', 'warning');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSync}
        type="button"
        title={isOnline ? (pendingCount > 0 ? `${pendingCount} items waiting to sync. Click to sync now.` : 'Online - All records synced') : 'Offline Mode active - Records queued locally'}
        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
          isOnline
            ? pendingCount > 0
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-emerald-50 text-emerald-700 border-emerald-300'
            : 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
        }`}
      >
        {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">
          {isOnline
            ? pendingCount > 0
              ? `Sync Queue (${pendingCount})`
              : 'Online Grid'
            : `Offline Queue (${pendingCount})`}
        </span>
        {isSyncing && <RefreshCw className="w-3 h-3 animate-spin ml-0.5" />}
      </button>
    </div>
  );
};
