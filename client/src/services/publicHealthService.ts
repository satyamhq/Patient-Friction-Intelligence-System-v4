import { api } from './api';

// ============================================================
// NON-CLINICAL HEALTHCARE ACCESS & FACILITY ROUTER TYPES
// ============================================================

export interface AccessRouteInput {
  serviceNeeded: string;
  serviceNote?: string;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  travelMode: string;
  accessibilityNeeds?: string[];
  appointmentStatus: string;
}

export interface RoutedFacility {
  facility: {
    id?: string;
    _id?: string;
    name: string;
    type: string;
    address: string;
    city: string;
    state?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    workingHours?: string;
    emergencyAvailable?: boolean;
    totalBeds?: number;
    availableBeds?: number;
    diagnosticFacilities?: string[];
    isVerified?: boolean;
    rating?: number;
    website?: string;
    updatedAt?: string;
  };
  distanceKm: number | null;
  matchScore: number;
  accessibilityMatches: string[];
  routingReasons: string[];
}

export interface AccessRouteResult {
  success: boolean;
  requestId: string;
  routedFacilities: RoutedFacility[];
  resultCount: number;
  routingFactors: string[];
  lastUpdated?: string;
  message?: string;
}

export interface TriageResult {
  triage: {
    id: string;
    chief_complaint: string;
    acuity_level: 'Emergency' | 'Urgent' | 'Routine' | 'Preventive';
    recommended_tier: string;
    recommended_hospital_id?: string;
    symptoms_json: string;
    vitals_json: string;
    operational_barriers_json: string;
    triage_notes: string;
    created_at: string;
  };
  recommendedFacility: any;
  acuityLevel: 'Emergency' | 'Urgent' | 'Routine' | 'Preventive';
  recommendedTier: string;
  triageNotes: string;
  operationalBarriers: string[];
  actionableSteps: string[];
}

export interface Referral {
  id: string;
  referral_code: string;
  patient_id: string;
  patient_name: string;
  from_facility_id: string;
  from_facility_name: string;
  from_tier: string;
  to_facility_id: string;
  to_facility_name: string;
  to_tier: string;
  specialty_required: string;
  requested_service?: string;
  reason_for_referral: string;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  transport_mode: string;
  transport_notes?: string;
  additional_notes?: string;
  status:
    | 'SUBMITTED'
    | 'SENT'
    | 'RECEIVED'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CLOSED'
    | 'CANCELLED'
    | 'EXPIRED'
    | 'Initiated'
    | 'In Transit'
    | 'Arrived'
    | 'Specialist Consulted'
    | 'Counter-Referred';
  rejection_reason?: string;
  counter_referral_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ReferralEvent {
  id: string;
  referral_id: string;
  previous_status: string;
  new_status: string;
  timestamp: string;
  actor_id?: string;
  actor_name?: string;
  facility_name?: string;
  reason?: string;
}

export interface ReferralCreateInput {
  fromFacilityId?: string;
  fromFacilityName: string;
  fromTier?: string;
  toFacilityId?: string;
  toFacilityName: string;
  toTier?: string;
  requestedService: string;
  reasonForReferral?: string;
  priority?: 'Routine' | 'Urgent' | 'Emergency';
  transportNotes?: string;
  additionalNotes?: string;
}

export type AbhaStatus = 'not_connected' | 'pending' | 'connected' | 'verified' | 'unavailable' | 'failed';
export type RecordSource = 'patient_entered' | 'hospital_verified' | 'abdm_imported' | 'patient_uploaded';

export interface AbhaProfile {
  status: AbhaStatus;
  abhaNumber: string | null;
  abhaAddress: string | null;
  name: string | null;
  dob: string | null;
  gender: string | null;
  state: string | null;
  verificationStatus: string;
  qrAvailable: boolean;
  qrData: string | null;
  lastSyncTime: string | null;
}

export interface HealthRecordConsent {
  id: string;
  patient_id: string;
  requester_name: string;
  data_scope: string;
  status: 'active' | 'revoked' | 'expired';
  valid_until?: string | null;
  created_at?: string;
}

export interface HealthRecordAuditEvent {
  id: string;
  patient_id: string;
  event_type: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  record_id?: string | null;
  result: string;
  notes?: string | null;
  timestamp: string;
}

export interface HealthRecordsResponse {
  abha: AbhaProfile;
  records: HealthRecord[];
  syncStatus: string;
  lastSyncTime?: string | null;
}

export interface HealthRecord {
  id: string;
  patient_id: string;
  abha_id?: string | null;
  facility_id?: string;
  facility_name: string;
  doctor_name: string;
  record_type: string;
  record_date: string;
  diagnosis: string;
  record_source: RecordSource;
  vitals?: Record<string, any>;
  vitals_json?: string;
  prescription?: any[];
  prescription_json?: string;
  notes?: string;
  document_url?: string;
  fhir_bundle_json?: string;
  created_at?: string;
}

export type EquipmentStatus = 'FUNCTIONAL' | 'UNDER_MAINTENANCE' | 'OUT_OF_SERVICE' | 'UNKNOWN';
export type ServiceAvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN';
export type DiagVerificationStatus = 'VERIFIED' | 'PENDING_VERIFICATION' | 'UNVERIFIED' | 'UNAVAILABLE';
export type DiagBookingStatus = 'SUBMITTED' | 'ACCEPTED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';

export interface DiagnosticService {
  id: string;
  facility_id: string;
  facility_name: string;
  facility_tier: string;
  service_name: string;
  category: string;
  description?: string | null;
  equipment_status: EquipmentStatus;
  availability_status: ServiceAvailabilityStatus;
  booking_status: ServiceAvailabilityStatus;
  technician_available?: boolean | null;
  fee?: number | null;
  currency?: string;
  fee_verified?: boolean;
  opening_time?: string | null;
  closing_time?: string | null;
  tat_hours?: number | null;
  verification_status: DiagVerificationStatus;
  source?: string;
  last_updated?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DiagnosticBooking {
  id: string;
  booking_number: string;
  diagnostic_id: string;
  patient_id: string;
  patient_name: string;
  facility_id?: string | null;
  facility_name: string;
  service_name: string;
  requested_date: string;
  requested_time?: string | null;
  accessibility_notes?: string | null;
  status: DiagBookingStatus;
  rejection_reason?: string | null;
  report_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ... (EssentialMedicine, HighRiskPatient, FrontlineTask remain unchanged below)

export type MedicineStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Availability Unknown';
export type DispensingMethod = 'OPD dispensing' | 'Walk-in available' | 'Appointment required' | 'Emergency only' | 'Unknown';

export interface EssentialMedicine {
  id: string;
  facility_id: string;
  facility_name: string;
  facility_tier: string;
  medicine_name: string;
  generic_name: string;
  category: string;
  dosage_form: string;
  stock_count: number | null;
  min_threshold: number;
  status: MedicineStatus;
  dispensing_method: DispensingMethod;
  batch_number?: string | null;
  expiry_date?: string | null;
  source?: string;
  verification_status?: 'VERIFIED' | 'PENDING_VERIFICATION' | 'UNVERIFIED';
  updated_at?: string;
}

export interface HighRiskPatient {
  id: string;
  patient_id: string;
  patient_name: string;
  cohort_type: string;
  risk_level: string;
  primary_condition: string;
  current_milestone: string;
  next_due_date: string;
  status: 'Active' | 'Overdue' | 'Completed' | 'Escalated' | 'Missed' | 'Referred' | string;
  assigned_asha_name?: string | null;
  assigned_facility_id?: string | null;
  follow_up_notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface HighRiskAuditEvent {
  id: string;
  case_id: string;
  actor_id?: string | null;
  actor_name?: string | null;
  actor_role?: string | null;
  action: 'CASE_CREATED' | 'STATUS_CHANGED' | 'NOTES_UPDATED' | 'ASSIGNMENT_CHANGED' | string;
  previous_status?: string | null;
  new_status?: string | null;
  notes?: string | null;
  timestamp: string;
}

export interface FrontlineVisit {
  id: string;
  household_id: string;
  patient_id?: string | null;
  patient_name: string;
  village_name: string;
  assigned_worker_id: string;
  assigned_worker_name: string;
  facility_id?: string | null;
  facility_name?: string | null;
  visit_type: string;
  scheduled_date: string;
  status: 'ASSIGNED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'RESCHEDULED' | 'CANCELLED';
  priority: 'Routine' | 'Urgent' | 'High';
  accessibility_barriers?: string | null;
  transport_barriers?: string | null;
  notes?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FrontlineTask {
  id: string;
  household_id?: string | null;
  patient_id?: string | null;
  worker_id: string;
  worker_name: string;
  worker_role: string;
  village_name: string;
  beneficiary_name: string;
  beneficiary_phone?: string;
  task_type: string;
  due_date: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FrontlineMetrics {
  totalVisits: number;
  pending: number;
  completed: number;
  overdue: number;
  inProgress: number;
  assignedTasks: number;
}

export interface FrontlineAuditEvent {
  id: string;
  resource_type: string;
  resource_id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  previous_status?: string | null;
  new_status?: string | null;
  notes?: string | null;
  timestamp: string;
}

export interface DoorstepRequest {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone?: string | null;
  village_or_area: string;
  assistance_type: string;
  preferred_date?: string | null;
  barrier_description?: string | null;
  status: 'REQUESTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assigned_worker_id?: string | null;
  assigned_worker_name?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const publicHealthService = {
  // 0. NON-CLINICAL Healthcare Access & Facility Router
  async runAccessRoute(data: AccessRouteInput): Promise<AccessRouteResult> {
    const res = await api.post('/public-health/triage/access-route', data);
    return res.data;
  },

  // 1. Digital Triage (legacy)
  async runTriage(data: {
    chiefComplaint: string;
    symptoms?: string[];
    vitals?: Record<string, any>;
    mobilityStatus?: string;
    distanceKm?: number;
    hasCaregiver?: boolean;
  }): Promise<TriageResult> {
    const res = await api.post('/public-health/triage', data);
    return res.data.data;
  },

  async getPatientTriageHistory(): Promise<any[]> {
    const res = await api.get('/public-health/triage/patient');
    return res.data.data || [];
  },

  // 2. Referrals — backend infers patient scope from JWT; no patientId needed for patient role
  async getReferrals(): Promise<Referral[]> {
    const res = await api.get('/public-health/referrals');
    return res.data.data || [];
  },

  async getReferralById(id: string): Promise<{ referral: Referral; events: ReferralEvent[] }> {
    const res = await api.get(`/public-health/referrals/${id}`);
    return res.data.data;
  },

  async getReferralEvents(id: string): Promise<ReferralEvent[]> {
    const res = await api.get(`/public-health/referrals/${id}/events`);
    return res.data.data || [];
  },

  async createReferral(data: ReferralCreateInput): Promise<Referral> {
    const res = await api.post('/public-health/referrals', data);
    return res.data.data;
  },

  async updateReferralStatus(id: string, status: string, counterReferralNotes?: string, reason?: string): Promise<Referral> {
    const res = await api.patch(`/public-health/referrals/${id}/status`, { status, counterReferralNotes, reason });
    return res.data.data;
  },

  // 3. Health Records & ABHA
  async getHealthRecords(patientId?: string): Promise<HealthRecordsResponse> {
    const res = await api.get(`/public-health/records${patientId ? `/${patientId}` : ''}`);
    return res.data.data;
  },

  async createHealthRecord(data: Partial<HealthRecord>): Promise<HealthRecord> {
    const res = await api.post('/public-health/records', data);
    return res.data.data;
  },

  async connectAbha(data: { abhaNumber?: string; abhaAddress?: string }): Promise<any> {
    const res = await api.post('/public-health/records/abha/connect', data);
    return res.data;
  },

  async disconnectAbha(): Promise<any> {
    const res = await api.post('/public-health/records/abha/disconnect');
    return res.data;
  },

  async exportFhirJson(): Promise<Blob> {
    const res = await api.get('/public-health/records/export-fhir', { responseType: 'blob' });
    return res.data;
  },

  async getHealthRecordConsents(): Promise<HealthRecordConsent[]> {
    const res = await api.get('/public-health/records/consents');
    return res.data.data || [];
  },

  async toggleHealthRecordConsent(id: string, status: 'active' | 'revoked'): Promise<HealthRecordConsent> {
    const res = await api.patch(`/public-health/records/consents/${id}`, { status });
    return res.data.data;
  },

  async getHealthRecordAuditEvents(): Promise<HealthRecordAuditEvent[]> {
    const res = await api.get('/public-health/records/audit-events');
    return res.data.data || [];
  },

  // 4. Diagnostics & Equipment Status
  async getDiagnostics(params?: {
    facilityId?: string;
    search?: string;
    category?: string;
    availabilityStatus?: string;
    equipmentStatus?: string;
  }): Promise<DiagnosticService[]> {
    const res = await api.get('/public-health/diagnostics', { params });
    return res.data.data || [];
  },

  async getDiagnosticById(id: string): Promise<DiagnosticService> {
    const res = await api.get(`/public-health/diagnostics/${id}`);
    return res.data.data;
  },

  async bookDiagnostic(data: {
    diagnosticId: string;
    requestedDate: string;
    requestedTime?: string;
    accessibilityNotes?: string;
    patientName?: string;
  }): Promise<DiagnosticBooking> {
    const res = await api.post('/public-health/diagnostics/book', data);
    return res.data.data;
  },

  async getDiagnosticBookings(): Promise<DiagnosticBooking[]> {
    const res = await api.get('/public-health/diagnostics/bookings');
    return res.data.data || [];
  },

  async cancelDiagnosticBooking(bookingId: string): Promise<DiagnosticBooking> {
    const res = await api.patch(`/public-health/diagnostics/bookings/${bookingId}/cancel`);
    return res.data.data;
  },

  // 5. Medicines
  async getMedicines(params?: { facilityId?: string; search?: string; category?: string; status?: string }): Promise<EssentialMedicine[]> {
    const res = await api.get('/public-health/medicines', { params });
    return res.data.data || [];
  },

  async getMedicineById(id: string): Promise<EssentialMedicine> {
    const res = await api.get(`/public-health/medicines/${id}`);
    return res.data.data;
  },

  async updateMedicineStock(id: string, data: { stockCount: number | null; status?: string; reason?: string }): Promise<EssentialMedicine> {
    const res = await api.patch(`/public-health/medicines/${id}/stock`, data);
    return res.data.data;
  },

  // 6. High-Risk Registry
  async getHighRiskRegistry(params?: { cohort?: string; patientId?: string }): Promise<HighRiskPatient[]> {
    const res = await api.get('/public-health/high-risk', { params });
    return res.data.data || [];
  },

  async createHighRiskEntry(data: {
    patientId: string;
    patientName: string;
    cohortType: string;
    riskLevel?: string;
    primaryCondition: string;
    currentMilestone?: string;
    nextDueDate: string;
    assignedAshaName?: string;
    followUpNotes?: string;
  }): Promise<HighRiskPatient> {
    const res = await api.post('/public-health/high-risk', data);
    return res.data.data;
  },

  async updateHighRiskStatus(id: string, status: string, followUpNotes?: string): Promise<HighRiskPatient> {
    const res = await api.patch(`/public-health/high-risk/${id}/status`, { status, followUpNotes });
    return res.data.data;
  },

  async getHighRiskAuditEvents(caseId?: string): Promise<HighRiskAuditEvent[]> {
    const res = await api.get('/public-health/high-risk/audit-events', { params: { caseId } });
    return res.data.data || [];
  },

  // 7. Frontline Operational Desk (ASHA / ANM / CHO)
  async getFrontlineMetrics(): Promise<FrontlineMetrics> {
    const res = await api.get('/public-health/frontline/metrics');
    return res.data.data;
  },

  async getFrontlineVisits(params?: { status?: string; workerId?: string }): Promise<FrontlineVisit[]> {
    const res = await api.get('/public-health/frontline/visits', { params });
    return res.data.data || [];
  },

  async createFrontlineVisit(data: Partial<FrontlineVisit>): Promise<FrontlineVisit> {
    const res = await api.post('/public-health/frontline/visits', data);
    return res.data.data;
  },

  async startFrontlineVisit(id: string): Promise<FrontlineVisit> {
    const res = await api.post(`/public-health/frontline/visits/${id}/start`);
    return res.data.data;
  },

  async completeFrontlineVisit(id: string, data: { barriers?: string[]; notes?: string }): Promise<FrontlineVisit> {
    const res = await api.post(`/public-health/frontline/visits/${id}/complete`, data);
    return res.data.data;
  },

  async getFrontlineTasks(workerId?: string): Promise<FrontlineTask[]> {
    const res = await api.get('/public-health/frontline/tasks', { params: { workerId } });
    return res.data.data || [];
  },

  async createFrontlineTask(data: Partial<FrontlineTask>): Promise<FrontlineTask> {
    const res = await api.post('/public-health/frontline/tasks', data);
    return res.data.data;
  },

  async updateFrontlineTaskStatus(id: string, status: string, notes?: string): Promise<FrontlineTask> {
    const res = await api.patch(`/public-health/frontline/tasks/${id}/status`, { status, notes });
    return res.data.data;
  },

  async processOfflineSync(actions: any[]): Promise<{ syncedIds: string[]; failedItems: any[]; serverTimestamp: string }> {
    const res = await api.post('/public-health/frontline/sync', { actions });
    return res.data.data;
  },

  async getFrontlineAuditEvents(params?: { resourceId?: string; workerId?: string }): Promise<FrontlineAuditEvent[]> {
    const res = await api.get('/public-health/frontline/audit-events', { params });
    return res.data.data || [];
  },

  // 7b. Citizen Doorstep Assistance Requests
  async createDoorstepRequest(data: {
    village_or_area: string;
    assistance_type: string;
    preferred_date?: string;
    barrier_description?: string;
  }): Promise<DoorstepRequest> {
    const res = await api.post('/public-health/frontline/doorstep-requests', data);
    return res.data.data;
  },

  async getDoorstepRequests(): Promise<DoorstepRequest[]> {
    const res = await api.get('/public-health/frontline/doorstep-requests');
    return res.data.data || [];
  },

  // 8. Emergency 108 SOS
  async triggerEmergencySOS(data?: { patientName?: string; phone?: string; locationName?: string; emergencyType?: string }): Promise<any> {
    const res = await api.post('/public-health/emergency/sos', data || {});
    return res.data.data;
  },

  // 9. Facility Quality & NQAS Metrics
  async getFacilityMetrics(facilityId: string): Promise<any> {
    const res = await api.get(`/public-health/facilities/${facilityId}/metrics`);
    return res.data.data;
  },
};

// ============================================================
// OFFLINE QUEUE MANAGER (Indexed / LocalStorage Persistence)
// ============================================================
export interface OfflineQueueItem {
  id: string;
  action_type: 'START_VISIT' | 'COMPLETE_VISIT' | 'CREATE_TASK' | 'UPDATE_TASK';
  payload: any;
  offline_created_at: string;
}

const OFFLINE_QUEUE_KEY = 'pfis_frontline_offline_queue';
const LAST_SYNC_KEY = 'pfis_frontline_last_sync_timestamp';

export const frontlineOfflineManager = {
  getQueue(): OfflineQueueItem[] {
    try {
      const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  enqueue(action_type: OfflineQueueItem['action_type'], payload: any): OfflineQueueItem {
    const item: OfflineQueueItem = {
      id: `off-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action_type,
      payload,
      offline_created_at: new Date().toISOString(),
    };
    const queue = this.getQueue();
    queue.push(item);
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch {}
    return item;
  },

  removeItems(idsToRemove: string[]): void {
    const current = this.getQueue();
    const filtered = current.filter(i => !idsToRemove.includes(i.id));
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
    } catch {}
  },

  getLastSyncTimestamp(): string | null {
    try {
      return localStorage.getItem(LAST_SYNC_KEY);
    } catch {
      return null;
    }
  },

  setLastSyncTimestamp(ts: string): void {
    try {
      localStorage.setItem(LAST_SYNC_KEY, ts);
    } catch {}
  },

  async syncNow(): Promise<{ syncedCount: number; failedCount: number; serverTimestamp: string }> {
    const queue = this.getQueue();
    if (queue.length === 0) {
      const now = new Date().toISOString();
      this.setLastSyncTimestamp(now);
      return { syncedCount: 0, failedCount: 0, serverTimestamp: now };
    }

    const res = await publicHealthService.processOfflineSync(queue);
    if (res.syncedIds && res.syncedIds.length > 0) {
      this.removeItems(res.syncedIds);
    }
    if (res.serverTimestamp) {
      this.setLastSyncTimestamp(res.serverTimestamp);
    }

    return {
      syncedCount: res.syncedIds?.length || 0,
      failedCount: res.failedItems?.length || 0,
      serverTimestamp: res.serverTimestamp,
    };
  },
};
