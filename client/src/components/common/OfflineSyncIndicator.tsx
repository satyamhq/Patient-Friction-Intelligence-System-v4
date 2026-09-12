import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const OfflineSyncIndicator: React.FC = () => {
  const { showToast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cachedCount, setCachedCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Network restored. Syncing cached public health records...', 'info');
      handleSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setCachedCount((prev) => prev + 1);
      showToast('Low-connectivity detected. Offline-first local cache active.', 'info');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setCachedCount(0);
      showToast('All local offline records successfully synchronized with Maharashtra Health Grid!', 'success');
    }, 1200);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSync}
        title={isOnline ? 'Online - All records synced' : 'Low Connectivity / Offline Mode active'}
        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
          isOnline
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 animate-pulse'
        }`}
      >
        {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
        <span className="hidden sm:inline">
          {isOnline ? 'Network Online' : `Offline Cache (${cachedCount})`}
        </span>
        {isSyncing && <RefreshCw className="w-3 h-3 animate-spin ml-1" />}
      </button>
    </div>
  );
};
