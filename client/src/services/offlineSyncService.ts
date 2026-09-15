// offlineSyncService.ts - Resilient offline-first queue and synchronization engine

export interface QueuedAction {
  id: string;
  type: 'log_visit' | 'book_token' | 'record_vitals' | 'create_referral' | 'update_followup';
  payload: any;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
  error?: string;
}

const OFFLINE_QUEUE_STORAGE_KEY = 'pfis_offline_sync_queue';
const LAST_SYNCED_STORAGE_KEY = 'pfis_last_synced_timestamp';

type SyncListener = (isOnline: boolean, queueLength: number, lastSynced: string | null) => void;

class OfflineSyncEngine {
  private static instance: OfflineSyncEngine;
  private queue: QueuedAction[] = [];
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private isSyncing: boolean = false;
  private listeners: Set<SyncListener> = new Set();

  private constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyListeners();
        this.processQueue();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyListeners();
      });
    }
  }

  public static getInstance(): OfflineSyncEngine {
    if (!OfflineSyncEngine.instance) {
      OfflineSyncEngine.instance = new OfflineSyncEngine();
    }
    return OfflineSyncEngine.instance;
  }

  private loadQueue() {
    try {
      const data = localStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY);
      if (data) {
        this.queue = JSON.parse(data);
      }
    } catch {
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.error('[OfflineSync] Failed to persist queue to localStorage', e);
    }
  }

  public enqueueAction(type: QueuedAction['type'], payload: any): QueuedAction {
    const action: QueuedAction = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'pending',
    };
    this.queue.push(action);
    this.saveQueue();
    this.notifyListeners();

    if (this.isOnline) {
      this.processQueue();
    }
    return action;
  }

  public async processQueue(): Promise<void> {
    if (this.isSyncing || !this.isOnline || this.queue.length === 0) return;
    this.isSyncing = true;
    this.notifyListeners();

    const pendingActions = this.queue.filter((a) => a.status === 'pending' || a.status === 'failed');

    for (const action of pendingActions) {
      action.status = 'syncing';
      this.saveQueue();
      this.notifyListeners();

      try {
        // Dispatch to appropriate API endpoint
        let endpoint = '/api/sync';
        if (action.type === 'log_visit') endpoint = '/api/asha/field-visits';
        else if (action.type === 'book_token') endpoint = '/api/appointments';
        else if (action.type === 'create_referral') endpoint = '/api/doctor/referrals';
        else if (action.type === 'update_followup') endpoint = '/api/asha/follow-ups';

        const token = localStorage.getItem('pfis_token');
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(action.payload),
        });

        if (res.ok) {
          action.status = 'synced';
        } else {
          action.retryCount += 1;
          action.status = action.retryCount >= 3 ? 'failed' : 'pending';
          action.error = `HTTP ${res.status}`;
        }
      } catch (err: any) {
        action.retryCount += 1;
        action.status = 'failed';
        action.error = err.message || 'Network error';
      }
    }

    // Keep only non-synced actions, or last 20 synced for audit
    this.queue = this.queue.filter((a) => a.status !== 'synced');
    this.saveQueue();

    const now = new Date().toISOString();
    try {
      localStorage.setItem(LAST_SYNCED_STORAGE_KEY, now);
    } catch {}

    this.isSyncing = false;
    this.notifyListeners();
  }

  public getStatus() {
    const lastSynced = typeof localStorage !== 'undefined' ? localStorage.getItem(LAST_SYNCED_STORAGE_KEY) : null;
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingCount: this.queue.filter((a) => a.status === 'pending' || a.status === 'failed').length,
      lastSynced,
      queue: [...this.queue],
    };
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.isOnline, this.queue.length, this.getStatus().lastSynced);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const lastSynced = typeof localStorage !== 'undefined' ? localStorage.getItem(LAST_SYNCED_STORAGE_KEY) : null;
    this.listeners.forEach((l) => l(this.isOnline, this.queue.length, lastSynced));
  }
}

export const offlineSyncService = OfflineSyncEngine.getInstance();
