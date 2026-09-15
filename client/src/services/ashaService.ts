import { api } from './api';

export interface AshaProfile {
  id: string;
  asha_code: string;
  name: string;
  phone: string;
  email: string;
  village: string;
  sub_centre: string;
  phc: string;
  block: string;
  district: string;
  state: string;
  assigned_area: string;
  assigned_villages: string[];
  supervisor_name: string;
  supervisor_phone: string;
  total_patients_tracked: number;
  high_risk_patient_count: number;
  referrals_made: number;
  field_visits_this_month: number;
  certification_level: string;
}

export interface AshaDashboardStats {
  assignedHouseholds: number;
  totalPatientsTracked: number;
  todayVisitsCount: number;
  scheduledVisitsCount: number;
  inProgressVisitsCount: number;
  completedVisitsCount: number;
  missedVisitsCount: number;
  followUpTasksCount: number;
  pendingReferralsCount: number;
  accessBarriersCount: number;
  barrierCounts: {
    TRANSPORT: number;
    COST: number;
    DOCUMENTATION: number;
    'DIGITAL ACCESS': number;
    AVAILABILITY: number;
    OTHER: number;
  };
  syncStatus: {
    pendingRecords: number;
    failedRecords: number;
    lastSuccessfulSync: string;
    isOnline: boolean;
  };
}

export interface OfflineSyncOperation {
  localOperationId: string;
  operationType: string;
  payload: any;
  timestamp: string;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
}

const OFFLINE_QUEUE_KEY = 'pfis_asha_offline_queue';

export const ashaService = {
  // ── Profile ───────────────────────────────────────────────────────────────
  async getProfile(): Promise<{ success: boolean; profile: AshaProfile }> {
    const res = await api.get('/asha/profile/me');
    return res.data;
  },

  async updateProfile(data: Partial<AshaProfile>): Promise<{ success: boolean; profile: AshaProfile }> {
    const res = await api.put('/asha/profile/me', data);
    return res.data;
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  async getDashboardStats(): Promise<{ success: boolean; stats: AshaDashboardStats }> {
    const res = await api.get('/asha/dashboard');
    return res.data;
  },

  // ── Patients Registry ─────────────────────────────────────────────────────
  async getPatients(params?: { search?: string; filter?: string; village?: string }): Promise<{ success: boolean; count: number; patients: any[] }> {
    const res = await api.get('/asha/patients', { params });
    return res.data;
  },

  // ── Households ────────────────────────────────────────────────────────────
  async getHouseholds(): Promise<{ success: boolean; count: number; households: any[] }> {
    const res = await api.get('/asha/households');
    return res.data;
  },

  async createHousehold(data: any): Promise<{ success: boolean; household: any }> {
    const res = await api.post('/asha/households', data);
    return res.data;
  },

  // ── Field Visits ──────────────────────────────────────────────────────────
  async getVisits(): Promise<{ success: boolean; count: number; visits: any[] }> {
    const res = await api.get('/asha/visits');
    return res.data;
  },

  async createVisit(data: any): Promise<{ success: boolean; visit: any }> {
    const res = await api.post('/asha/visits', data);
    return res.data;
  },

  async startVisit(id: string): Promise<{ success: boolean; visit: any }> {
    const res = await api.post(`/asha/visits/${id}/start`);
    return res.data;
  },

  async completeVisit(id: string, data: { notes?: string; accessibilityBarriers?: string[]; nextAction?: string; observations?: string }): Promise<{ success: boolean; visit: any }> {
    const res = await api.post(`/asha/visits/${id}/complete`, data);
    return res.data;
  },

  // ── Tasks & Follow-ups ────────────────────────────────────────────────────
  async getTasks(): Promise<{ success: boolean; count: number; tasks: any[] }> {
    const res = await api.get('/asha/tasks');
    return res.data;
  },

  async createTask(data: any): Promise<{ success: boolean; task: any }> {
    const res = await api.post('/asha/tasks', data);
    return res.data;
  },

  async updateTaskStatus(id: string, status: string, notes?: string): Promise<{ success: boolean }> {
    const res = await api.patch(`/asha/tasks/${id}/status`, { status, notes });
    return res.data;
  },

  // ── Referrals ─────────────────────────────────────────────────────────────
  async getReferrals(): Promise<{ success: boolean; count: number; referrals: any[] }> {
    const res = await api.get('/asha/referrals');
    return res.data;
  },

  async assistReferral(id: string, data: { navigationNotes?: string; transportArranged?: string; scheduledDate?: string; status?: string }): Promise<{ success: boolean }> {
    const res = await api.post(`/asha/referrals/${id}/assist`, data);
    return res.data;
  },

  // ── Appointment Assistance ────────────────────────────────────────────────
  async getAppointments(): Promise<{ success: boolean; count: number; appointments: any[] }> {
    const res = await api.get('/asha/appointments');
    return res.data;
  },

  async createAppointment(data: any): Promise<{ success: boolean; appointment: any }> {
    const res = await api.post('/asha/appointments', data);
    return res.data;
  },

  // ── OPD Tokens ────────────────────────────────────────────────────────────
  async getOPDTokens(): Promise<{ success: boolean; count: number; tokens: any[] }> {
    const res = await api.get('/asha/opd-tokens');
    return res.data;
  },

  async requestOPDToken(data: { patientId?: string; patientName: string; department?: string; priority?: string }): Promise<{ success: boolean; token: any }> {
    const res = await api.post('/asha/opd-tokens', data);
    return res.data;
  },

  // ── Access Barriers ───────────────────────────────────────────────────────
  async getAccessBarriers(): Promise<{ success: boolean; count: number; barriers: any[] }> {
    const res = await api.get('/asha/access-barriers');
    return res.data;
  },

  async recordAccessBarrier(data: { patientId?: string; patientName: string; householdId?: string; villageName?: string; category: string; barrierType: string; details?: string; actionTaken?: string }): Promise<{ success: boolean; message?: string; barrier: any }> {
    const res = await api.post('/asha/access-barriers', data);
    return res.data;
  },

  // ── Escalations ───────────────────────────────────────────────────────────
  async getEscalations(): Promise<{ success: boolean; count: number; escalations: any[] }> {
    const res = await api.get('/asha/escalations');
    return res.data;
  },

  async createEscalation(data: { patientId?: string; patientName: string; householdId?: string; villageName?: string; type: 'CLINICAL_CONCERN' | 'HIGH_ACCESS_PRIORITY'; urgency: 'Medium' | 'High' | 'Emergency'; reason: string; reportedObservations?: string; routedToFacility?: string }): Promise<{ success: boolean; message?: string; escalation: any }> {
    const res = await api.post('/asha/escalations', data);
    return res.data;
  },

  // ── Audit Trail ───────────────────────────────────────────────────────────
  async getAuditTrail(): Promise<{ success: boolean; count: number; events: any[] }> {
    const res = await api.get('/asha/audit');
    return res.data;
  },

  // ── Notifications ─────────────────────────────────────────────────────────
  async getNotifications(): Promise<{ success: boolean; count: number; notifications: any[] }> {
    const res = await api.get('/asha/notifications');
    return res.data;
  },

  // ── Offline Sync Local Queue Manager ──────────────────────────────────────
  getOfflineQueue(): OfflineSyncOperation[] {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  addToOfflineQueue(operationType: string, payload: any): OfflineSyncOperation {
    const queue = this.getOfflineQueue();
    const op: OfflineSyncOperation = {
      localOperationId: 'loc-op-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      operationType,
      payload,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
    };
    queue.push(op);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    return op;
  },

  clearOfflineQueue(): void {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  },

  async syncOfflineQueue(): Promise<{ success: boolean; message?: string; processedCount: number; results?: any[] }> {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) {
      return { success: true, processedCount: 0 };
    }

    const pendingOps = queue.filter(op => op.status === 'PENDING' || op.status === 'FAILED');
    if (pendingOps.length === 0) {
      return { success: true, processedCount: 0 };
    }

    try {
      const res = await api.post('/asha/sync', { operations: pendingOps });
      if (res.data.success) {
        // Mark synced
        const updated = queue.map(op => ({ ...op, status: 'SYNCED' as const }));
        localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(updated));
      }
      return res.data;
    } catch (err: any) {
      return { success: false, processedCount: 0 };
    }
  },
};
