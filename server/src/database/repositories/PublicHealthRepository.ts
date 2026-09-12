import { getDB } from '../db.js';
import crypto from 'crypto';

export interface PublicHealthTriageEntity {
  id: string;
  patient_id?: string;
  chief_complaint: string;
  acuity_level: 'Emergency' | 'Urgent' | 'Routine' | 'Preventive';
  recommended_tier: string;
  recommended_hospital_id?: string;
  recommended_hospital_name?: string;
  symptoms_json: string;
  vitals_json: string;
  operational_barriers_json: string;
  triage_notes: string;
  created_at?: string;
}

export interface ReferralEntity {
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
    // Legacy statuses kept for backward compatibility
    | 'Initiated'
    | 'In Transit'
    | 'Arrived'
    | 'Specialist Consulted'
    | 'Counter-Referred';
  rejection_reason?: string;
  counter_referral_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReferralEventEntity {
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

export type AbhaStatus = 'not_connected' | 'pending' | 'connected' | 'verified' | 'unavailable' | 'failed';
export type RecordSource = 'patient_entered' | 'hospital_verified' | 'abdm_imported' | 'patient_uploaded';

export interface PatientAbhaEntity {
  id: string;
  patient_id: string;
  status: AbhaStatus;
  abha_number?: string | null;
  abha_address?: string | null;
  name?: string | null;
  dob?: string | null;
  gender?: string | null;
  state?: string | null;
  verification_status: string;
  qr_data?: string | null;
  last_sync_time?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface HealthRecordConsentEntity {
  id: string;
  patient_id: string;
  requester_name: string;
  data_scope: string;
  status: 'active' | 'revoked' | 'expired';
  valid_until?: string | null;
  created_at?: string;
}

export interface HealthRecordAuditEntity {
  id: string;
  patient_id: string;
  event_type: 'RECORD_REQUESTED' | 'CONSENT_CHECKED' | 'RECORD_ACCESSED' | 'RECORD_EXPORTED' | 'VISIT_ENTRY_CREATED' | 'ABHA_CONNECTION_CHANGED' | 'RECORD_UPLOADED';
  actor_id: string;
  actor_name: string;
  actor_role: string;
  record_id?: string | null;
  result: 'ALLOWED' | 'DENIED' | 'SUCCESS' | 'FAILED';
  notes?: string | null;
  timestamp?: string;
}

export interface HealthRecordEntity {
  id: string;
  patient_id: string;
  abha_id?: string | null;
  facility_id?: string | null;
  facility_name: string;
  doctor_name: string;
  record_type: string;
  record_date: string;
  diagnosis: string;
  record_source: RecordSource;
  vitals_json?: string | null;
  prescription_json?: string | null;
  notes?: string | null;
  document_url?: string | null;
  fhir_bundle_json?: string | null;
  created_at?: string;
}

export type EquipmentStatus = 'FUNCTIONAL' | 'UNDER_MAINTENANCE' | 'OUT_OF_SERVICE' | 'UNKNOWN';
export type ServiceAvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'UNKNOWN';
export type DiagVerificationStatus = 'VERIFIED' | 'PENDING_VERIFICATION' | 'UNVERIFIED' | 'UNAVAILABLE';
export type DiagBookingStatus = 'SUBMITTED' | 'ACCEPTED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';

export interface DiagnosticServiceEntity {
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
  fee?: number | null;               // null = fee information unavailable
  currency?: string;
  fee_verified?: boolean;
  opening_time?: string | null;      // null = service hours unavailable
  closing_time?: string | null;
  tat_hours?: number | null;         // null = turnaround unknown
  verification_status: DiagVerificationStatus;
  source?: string;
  last_updated?: string | null;      // null = update time unavailable
  created_at?: string;
  updated_at?: string;
}

export interface DiagnosticBookingEntity {
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

export interface DiagnosticAuditEntity {
  id: string;
  diagnostic_id?: string | null;
  facility_id?: string | null;
  booking_id?: string | null;
  event_type: string; // 'SERVICE_CREATED' | 'STATUS_CHANGED' | 'BOOKING_CREATED' | 'BOOKING_CANCELLED' | 'BOOKING_COMPLETED' | 'EQUIPMENT_STATUS_CHANGED'
  actor_id: string;
  actor_name: string;
  actor_role: string;
  previous_state?: string | null;
  new_state?: string | null;
  notes?: string | null;
  timestamp?: string;
}

export type MedicineStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Availability Unknown';
export type DispensingMethod = 'OPD dispensing' | 'Walk-in available' | 'Appointment required' | 'Emergency only' | 'Unknown';

export interface EssentialMedicineEntity {
  id: string;
  facility_id: string;
  facility_name: string;
  facility_tier: string;
  medicine_name: string;
  generic_name: string;
  category: string;
  dosage_form: string;
  stock_count: number | null; // null = quantity unavailable
  min_threshold: number;
  status: MedicineStatus;
  dispensing_method: DispensingMethod;
  batch_number?: string | null;
  expiry_date?: string | null;
  source?: string;
  verification_status?: 'VERIFIED' | 'PENDING_VERIFICATION' | 'UNVERIFIED';
  updated_at?: string;
}

export interface MedicineAuditEntity {
  id: string;
  medicine_id: string;
  facility_id: string;
  previous_quantity: number | null;
  new_quantity: number | null;
  previous_status: string;
  new_status: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  reason?: string | null;
  timestamp: string;
}

export interface HighRiskRegistryEntity {
  id: string;
  patient_id: string;
  patient_name: string;
  cohort_type: string;
  risk_level: string;
  primary_condition: string;
  current_milestone: string;
  next_due_date: string;
  status: string;
  assigned_asha_name?: string;
  assigned_facility_id?: string;
  follow_up_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type FrontlineVisitStatus = 'ASSIGNED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'RESCHEDULED' | 'CANCELLED';

export interface FrontlineVisitEntity {
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
  status: FrontlineVisitStatus;
  priority: 'Routine' | 'Urgent' | 'High';
  accessibility_barriers?: string | null;
  transport_barriers?: string | null;
  notes?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FrontlineTaskEntity {
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

export interface FrontlineAuditEntity {
  id: string;
  resource_type: 'VISIT' | 'TASK' | 'SYNC' | 'REFERRAL' | 'TELECONSULT';
  resource_id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: 'VISIT_STARTED' | 'VISIT_COMPLETED' | 'TASK_CREATED' | 'TASK_STATUS_UPDATED' | 'SYNC_PROCESSED' | 'REFERRAL_INITIATED';
  previous_status?: string | null;
  new_status?: string | null;
  notes?: string | null;
  timestamp: string;
}

export interface DoorstepRequestEntity {
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

export interface HighRiskAuditEntity {
  id: string;
  case_id: string;
  actor_id?: string | null;
  actor_name?: string | null;
  actor_role?: string | null;
  action: 'CASE_CREATED' | 'STATUS_CHANGED' | 'NOTES_UPDATED' | 'ASSIGNMENT_CHANGED';
  previous_status?: string | null;
  new_status?: string | null;
  notes?: string | null;
  timestamp: string;
}

export interface EmergencyDispatchEntity {
  id: string;
  dispatch_number: string;
  patient_name: string;
  phone: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  emergency_type: string;
  assigned_ambulance_vehicle: string;
  eta_minutes: number;
  destination_hospital_id?: string;
  destination_hospital_name: string;
  status: string;
  created_at?: string;
}

export class PublicHealthRepository {
  // 1. Triage
  static async createTriage(data: Omit<PublicHealthTriageEntity, 'id'> & { id?: string }): Promise<PublicHealthTriageEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO public_health_triage (id, patient_id, chief_complaint, acuity_level, recommended_tier, recommended_hospital_id, symptoms_json, vitals_json, operational_barriers_json, triage_notes, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        id,
        data.patient_id || null,
        data.chief_complaint,
        data.acuity_level,
        data.recommended_tier,
        data.recommended_hospital_id || null,
        data.symptoms_json,
        data.vitals_json,
        data.operational_barriers_json,
        data.triage_notes,
        now,
      ]
    );
    return { ...data, id, created_at: now };
  }

  static async findTriageByPatient(patientId: string): Promise<PublicHealthTriageEntity[]> {
    const db = getDB();
    const res = await db.query<PublicHealthTriageEntity>(
      'SELECT * FROM public_health_triage WHERE patient_id = $1 ORDER BY created_at DESC',
      [patientId]
    );
    return res.rows;
  }

  // 2. Referrals
  static async createReferral(data: Omit<ReferralEntity, 'id' | 'referral_code'> & { id?: string; referral_code?: string }): Promise<ReferralEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    // PFIS-REF- prefix with 6 uppercase alphanumeric characters
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const suffix = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const referral_code = data.referral_code || `PFIS-REF-${suffix}`;
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO referrals (id, referral_code, patient_id, patient_name, from_facility_id, from_facility_name, from_tier, to_facility_id, to_facility_name, to_tier, specialty_required, reason_for_referral, priority, transport_mode, status, counter_referral_notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [
        id,
        referral_code,
        data.patient_id,
        data.patient_name,
        data.from_facility_id,
        data.from_facility_name,
        data.from_tier,
        data.to_facility_id,
        data.to_facility_name,
        data.to_tier,
        data.specialty_required,
        data.reason_for_referral,
        data.priority || 'Routine',
        data.transport_mode || 'Not specified',
        data.status || 'SUBMITTED',
        data.counter_referral_notes || null,
        now,
        now,
      ]
    );
    return { ...data, id, referral_code, created_at: now, updated_at: now };
  }

  static async getReferralById(id: string): Promise<ReferralEntity | null> {
    const db = getDB();
    const res = await db.query<ReferralEntity>('SELECT * FROM referrals WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  }

  static async getReferrals(filter?: { patient_id?: string; facility_id?: string }): Promise<ReferralEntity[]> {
    const db = getDB();
    let sql = 'SELECT * FROM referrals';
    const params: any[] = [];
    if (filter?.patient_id) {
      sql += ' WHERE patient_id = $1';
      params.push(filter.patient_id);
    } else if (filter?.facility_id) {
      sql += ' WHERE to_facility_id = $1 OR from_facility_id = $1';
      params.push(filter.facility_id);
    }
    sql += ' ORDER BY created_at DESC';
    const res = await db.query<ReferralEntity>(sql, params);
    return res.rows;
  }

  static async updateReferralStatus(id: string, status: string, notes?: string, actorId?: string, actorName?: string, reason?: string): Promise<ReferralEntity | null> {
    const db = getDB();
    const now = new Date().toISOString();
    // Fetch current status before update (for audit event)
    const before = await db.query<ReferralEntity>('SELECT * FROM referrals WHERE id = $1 LIMIT 1', [id]);
    const previousStatus = before.rows[0]?.status || 'UNKNOWN';
    await db.query(
      'UPDATE referrals SET status = $1, counter_referral_notes = COALESCE($2, counter_referral_notes), updated_at = $3 WHERE id = $4',
      [status, notes || null, now, id]
    );
    // Create immutable audit event
    await PublicHealthRepository.createReferralEvent({
      referral_id: id,
      previous_status: previousStatus,
      new_status: status,
      timestamp: now,
      actor_id: actorId,
      actor_name: actorName || 'System',
      reason: reason || notes,
    });
    const res = await db.query<ReferralEntity>('SELECT * FROM referrals WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  }

  // Referral Audit Event Log
  static async createReferralEvent(data: Omit<ReferralEventEntity, 'id'> & { id?: string }): Promise<ReferralEventEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const timestamp = data.timestamp || new Date().toISOString();
    try {
      await db.query(
        `INSERT INTO referral_events (id, referral_id, previous_status, new_status, timestamp, actor_id, actor_name, facility_name, reason) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          id,
          data.referral_id,
          data.previous_status || '',
          data.new_status,
          timestamp,
          data.actor_id || null,
          data.actor_name || 'System',
          data.facility_name || null,
          data.reason || null,
        ]
      );
    } catch (_err) {
      // If referral_events table doesn't exist yet (before migration), create it then retry
      await db.query(`
        CREATE TABLE IF NOT EXISTS referral_events (
          id TEXT PRIMARY KEY,
          referral_id TEXT NOT NULL,
          previous_status TEXT NOT NULL DEFAULT '',
          new_status TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          actor_id TEXT,
          actor_name TEXT DEFAULT 'System',
          facility_name TEXT,
          reason TEXT
        )
      `);
      await db.query(
        `INSERT INTO referral_events (id, referral_id, previous_status, new_status, timestamp, actor_id, actor_name, facility_name, reason) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [id, data.referral_id, data.previous_status || '', data.new_status, timestamp, data.actor_id || null, data.actor_name || 'System', data.facility_name || null, data.reason || null]
      );
    }
    return { ...data, id, timestamp };
  }

  static async getEventsByReferralId(referralId: string): Promise<ReferralEventEntity[]> {
    const db = getDB();
    try {
      const res = await db.query<ReferralEventEntity>(
        'SELECT * FROM referral_events WHERE referral_id = $1 ORDER BY timestamp ASC',
        [referralId]
      );
      return res.rows;
    } catch (_err) {
      return [];
    }
  }

  // 3. Health Records (Longitudinal & ABHA)
  static async getPatientAbha(patientId: string): Promise<PatientAbhaEntity | null> {
    const db = getDB();
    try {
      const res = await db.query<PatientAbhaEntity>(
        'SELECT * FROM patient_abha WHERE patient_id = $1 LIMIT 1',
        [patientId]
      );
      return res.rows[0] || null;
    } catch (_err) {
      return null;
    }
  }

  static async upsertPatientAbha(data: Partial<PatientAbhaEntity> & { patient_id: string }): Promise<PatientAbhaEntity> {
    const db = getDB();
    const now = new Date().toISOString();
    const existing = await this.getPatientAbha(data.patient_id);

    if (existing) {
      const updated: PatientAbhaEntity = {
        ...existing,
        ...data,
        updated_at: now,
      };
      await db.query(
        `UPDATE patient_abha SET status = $1, abha_number = $2, abha_address = $3, name = $4, dob = $5, gender = $6, state = $7, verification_status = $8, qr_data = $9, last_sync_time = $10, updated_at = $11 WHERE id = $12`,
        [
          updated.status,
          updated.abha_number || null,
          updated.abha_address || null,
          updated.name || null,
          updated.dob || null,
          updated.gender || null,
          updated.state || null,
          updated.verification_status,
          updated.qr_data || null,
          updated.last_sync_time || null,
          now,
          existing.id,
        ]
      );
      return updated;
    }

    const id = data.id || crypto.randomUUID();
    const newRecord: PatientAbhaEntity = {
      id,
      patient_id: data.patient_id,
      status: data.status || 'not_connected',
      abha_number: data.abha_number || null,
      abha_address: data.abha_address || null,
      name: data.name || null,
      dob: data.dob || null,
      gender: data.gender || null,
      state: data.state || null,
      verification_status: data.verification_status || 'ABHA not connected',
      qr_data: data.qr_data || null,
      last_sync_time: data.last_sync_time || null,
      created_at: now,
      updated_at: now,
    };

    await db.query(
      `INSERT INTO patient_abha (id, patient_id, status, abha_number, abha_address, name, dob, gender, state, verification_status, qr_data, last_sync_time, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        id,
        newRecord.patient_id,
        newRecord.status,
        newRecord.abha_number,
        newRecord.abha_address,
        newRecord.name,
        newRecord.dob,
        newRecord.gender,
        newRecord.state,
        newRecord.verification_status,
        newRecord.qr_data,
        newRecord.last_sync_time,
        now,
        now,
      ]
    );
    return newRecord;
  }

  static async getHealthRecords(patientId: string): Promise<HealthRecordEntity[]> {
    const db = getDB();
    const res = await db.query<HealthRecordEntity>(
      'SELECT * FROM health_records WHERE patient_id = $1 ORDER BY record_date DESC',
      [patientId]
    );
    return res.rows;
  }

  static async createHealthRecord(data: Omit<HealthRecordEntity, 'id'> & { id?: string }): Promise<HealthRecordEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();
    const source: RecordSource = data.record_source || 'patient_entered';

    await db.query(
      `INSERT INTO health_records (id, patient_id, abha_id, facility_id, facility_name, doctor_name, record_type, record_date, diagnosis, record_source, vitals_json, prescription_json, notes, document_url, fhir_bundle_json, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        id,
        data.patient_id,
        data.abha_id || null,
        data.facility_id || null,
        data.facility_name,
        data.doctor_name,
        data.record_type,
        data.record_date,
        data.diagnosis,
        source,
        data.vitals_json || null,
        data.prescription_json || null,
        data.notes || null,
        data.document_url || null,
        data.fhir_bundle_json || null,
        now,
      ]
    );
    return { ...data, id, record_source: source, created_at: now };
  }

  static async getHealthRecordConsents(patientId: string): Promise<HealthRecordConsentEntity[]> {
    const db = getDB();
    try {
      const res = await db.query<HealthRecordConsentEntity>(
        'SELECT * FROM health_record_consents WHERE patient_id = $1 ORDER BY created_at DESC',
        [patientId]
      );
      return res.rows;
    } catch (_err) {
      return [];
    }
  }

  static async createHealthRecordConsent(data: Omit<HealthRecordConsentEntity, 'id'> & { id?: string }): Promise<HealthRecordConsentEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO health_record_consents (id, patient_id, requester_name, data_scope, status, valid_until, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        data.patient_id,
        data.requester_name,
        data.data_scope,
        data.status || 'active',
        data.valid_until || null,
        now,
      ]
    );
    return { ...data, id, created_at: now };
  }

  static async toggleHealthRecordConsent(id: string, status: 'active' | 'revoked' | 'expired'): Promise<HealthRecordConsentEntity | null> {
    const db = getDB();
    await db.query(
      'UPDATE health_record_consents SET status = $1 WHERE id = $2',
      [status, id]
    );
    const res = await db.query<HealthRecordConsentEntity>(
      'SELECT * FROM health_record_consents WHERE id = $1 LIMIT 1',
      [id]
    );
    return res.rows[0] || null;
  }

  static async createHealthRecordAuditEvent(data: Omit<HealthRecordAuditEntity, 'id'> & { id?: string }): Promise<HealthRecordAuditEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const now = data.timestamp || new Date().toISOString();
    await db.query(
      `INSERT INTO health_record_audit_events (id, patient_id, event_type, actor_id, actor_name, actor_role, record_id, result, notes, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        data.patient_id,
        data.event_type,
        data.actor_id,
        data.actor_name,
        data.actor_role || 'patient',
        data.record_id || null,
        data.result || 'SUCCESS',
        data.notes || null,
        now,
      ]
    );
    return { ...data, id, timestamp: now };
  }

  static async getHealthRecordAuditEvents(patientId: string): Promise<HealthRecordAuditEntity[]> {
    const db = getDB();
    try {
      const res = await db.query<HealthRecordAuditEntity>(
        'SELECT * FROM health_record_audit_events WHERE patient_id = $1 ORDER BY timestamp DESC LIMIT 50',
        [patientId]
      );
      return res.rows;
    } catch (_err) {
      return [];
    }
  }

  // 4. Diagnostics & Equipment
  static async getDiagnostics(filter?: {
    facilityId?: string;
    search?: string;
    category?: string;
    availabilityStatus?: string;
    equipmentStatus?: string;
  }): Promise<DiagnosticServiceEntity[]> {
    const db = getDB();
    let sql = 'SELECT * FROM diagnostics';
    const params: any[] = [];
    if (filter?.facilityId) {
      sql += ' WHERE facility_id = $1';
      params.push(filter.facilityId);
    }
    sql += ' ORDER BY category ASC, service_name ASC';
    const res = await db.query<DiagnosticServiceEntity>(sql, params);
    let list = res.rows;

    // In-memory filters for embedded engine compatibility
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (d) =>
          (d.service_name || '').toLowerCase().includes(q) ||
          (d.facility_name || '').toLowerCase().includes(q) ||
          (d.category || '').toLowerCase().includes(q) ||
          (d.description || '').toLowerCase().includes(q)
      );
    }
    if (filter?.category && filter.category !== 'All') {
      list = list.filter((d) => d.category === filter.category);
    }
    if (filter?.availabilityStatus && filter.availabilityStatus !== 'All') {
      list = list.filter((d) => d.availability_status === filter.availabilityStatus);
    }
    if (filter?.equipmentStatus && filter.equipmentStatus !== 'All') {
      list = list.filter((d) => d.equipment_status === filter.equipmentStatus);
    }
    return list;
  }

  static async getDiagnosticById(id: string): Promise<DiagnosticServiceEntity | null> {
    const db = getDB();
    const res = await db.query<DiagnosticServiceEntity>(
      'SELECT * FROM diagnostics WHERE id = $1 LIMIT 1',
      [id]
    );
    return res.rows[0] || null;
  }

  static async updateDiagnosticEquipmentStatus(
    id: string,
    equipmentStatus: EquipmentStatus,
    availabilityStatus: ServiceAvailabilityStatus,
    actorId: string,
    actorName: string,
    actorRole: string,
    notes?: string
  ): Promise<DiagnosticServiceEntity | null> {
    const db = getDB();
    const now = new Date().toISOString();

    // Get current state for audit
    const current = await this.getDiagnosticById(id);
    const previousState = current ? `equipment:${current.equipment_status},availability:${current.availability_status}` : 'unknown';
    const newState = `equipment:${equipmentStatus},availability:${availabilityStatus}`;

    await db.query(
      'UPDATE diagnostics SET equipment_status = $1, availability_status = $2, last_updated = $3, updated_at = $4 WHERE id = $5',
      [equipmentStatus, availabilityStatus, now, now, id]
    );

    // Audit event
    await this.createDiagnosticAuditEvent({
      diagnostic_id: id,
      facility_id: current?.facility_id || null,
      event_type: 'EQUIPMENT_STATUS_CHANGED',
      actor_id: actorId,
      actor_name: actorName,
      actor_role: actorRole,
      previous_state: previousState,
      new_state: newState,
      notes: notes || `Equipment status updated to ${equipmentStatus}`,
    });

    return this.getDiagnosticById(id);
  }

  static async createDiagnosticBooking(
    data: Omit<DiagnosticBookingEntity, 'id' | 'booking_number'> & { id?: string; booking_number?: string }
  ): Promise<DiagnosticBookingEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    // PFIS-DXB prefix with 8 uppercase alphanumeric characters
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const suffix = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const booking_number = data.booking_number || `PFIS-DXB-${suffix}`;
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO diagnostic_bookings (id, booking_number, diagnostic_id, patient_id, patient_name, facility_id, facility_name, service_name, requested_date, requested_time, accessibility_notes, status, rejection_reason, report_url, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        id,
        booking_number,
        data.diagnostic_id,
        data.patient_id,
        data.patient_name,
        data.facility_id || null,
        data.facility_name,
        data.service_name,
        data.requested_date,
        data.requested_time || null,
        data.accessibility_notes || null,
        data.status || 'SUBMITTED',
        data.rejection_reason || null,
        data.report_url || null,
        now,
        now,
      ]
    );

    // Audit
    await this.createDiagnosticAuditEvent({
      diagnostic_id: data.diagnostic_id,
      booking_id: id,
      event_type: 'BOOKING_CREATED',
      actor_id: data.patient_id,
      actor_name: data.patient_name,
      actor_role: 'patient',
      new_state: 'SUBMITTED',
      notes: `Booking ${booking_number} created for ${data.service_name} at ${data.facility_name} on ${data.requested_date}`,
    });

    return { ...data, id, booking_number, status: data.status || 'SUBMITTED', created_at: now, updated_at: now };
  }

  static async getDiagnosticBookings(patientId?: string): Promise<DiagnosticBookingEntity[]> {
    const db = getDB();
    let sql = 'SELECT * FROM diagnostic_bookings';
    const params: any[] = [];
    if (patientId) {
      sql += ' WHERE patient_id = $1';
      params.push(patientId);
    }
    sql += ' ORDER BY created_at DESC';
    const res = await db.query<DiagnosticBookingEntity>(sql, params);
    return res.rows;
  }

  static async updateDiagnosticBookingStatus(
    bookingId: string,
    status: DiagBookingStatus,
    actorId: string,
    actorName: string,
    actorRole: string,
    rejectionReason?: string
  ): Promise<DiagnosticBookingEntity | null> {
    const db = getDB();
    const now = new Date().toISOString();

    // Get current booking for audit
    const res0 = await db.query<DiagnosticBookingEntity>(
      'SELECT * FROM diagnostic_bookings WHERE id = $1 LIMIT 1',
      [bookingId]
    );
    const current = res0.rows[0] || null;
    if (!current) return null;

    const previousState = current.status;

    await db.query(
      'UPDATE diagnostic_bookings SET status = $1, rejection_reason = $2, updated_at = $3 WHERE id = $4',
      [status, rejectionReason || null, now, bookingId]
    );

    await this.createDiagnosticAuditEvent({
      diagnostic_id: current.diagnostic_id,
      booking_id: bookingId,
      event_type: status === 'CANCELLED' ? 'BOOKING_CANCELLED' : status === 'COMPLETED' ? 'BOOKING_COMPLETED' : 'STATUS_CHANGED',
      actor_id: actorId,
      actor_name: actorName,
      actor_role: actorRole,
      previous_state: previousState,
      new_state: status,
      notes: rejectionReason || `Booking status updated to ${status}`,
    });

    const res2 = await db.query<DiagnosticBookingEntity>(
      'SELECT * FROM diagnostic_bookings WHERE id = $1 LIMIT 1',
      [bookingId]
    );
    return res2.rows[0] || null;
  }

  static async createDiagnosticAuditEvent(
    data: Omit<DiagnosticAuditEntity, 'id'> & { id?: string }
  ): Promise<DiagnosticAuditEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const now = data.timestamp || new Date().toISOString();
    await db.query(
      `INSERT INTO diagnostic_audit_events (id, diagnostic_id, facility_id, booking_id, event_type, actor_id, actor_name, actor_role, previous_state, new_state, notes, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        data.diagnostic_id || null,
        data.facility_id || null,
        data.booking_id || null,
        data.event_type,
        data.actor_id,
        data.actor_name,
        data.actor_role || 'patient',
        data.previous_state || null,
        data.new_state || null,
        data.notes || null,
        now,
      ]
    );
    return { ...data, id, timestamp: now };
  }

  static async getDiagnosticAuditEvents(filter?: { diagnosticId?: string; facilityId?: string; bookingId?: string }): Promise<DiagnosticAuditEntity[]> {
    const db = getDB();
    const sql = 'SELECT * FROM diagnostic_audit_events ORDER BY timestamp DESC LIMIT 100';
    const res = await db.query<DiagnosticAuditEntity>(sql);
    let list = res.rows;
    if (filter?.diagnosticId) list = list.filter(e => e.diagnostic_id === filter.diagnosticId);
    if (filter?.facilityId) list = list.filter(e => e.facility_id === filter.facilityId);
    if (filter?.bookingId) list = list.filter(e => e.booking_id === filter.bookingId);
    return list;
  }

  // 5. Essential Medicines (Verified Facility Inventory)
  static async getMedicines(filter?: { facilityId?: string; search?: string; category?: string; status?: string }): Promise<EssentialMedicineEntity[]> {
    const db = getDB();
    let sql = 'SELECT * FROM essential_medicines';
    const params: any[] = [];
    if (filter?.facilityId) {
      sql += ' WHERE facility_id = $1';
      params.push(filter.facilityId);
    }
    sql += ' ORDER BY medicine_name ASC';
    const res = await db.query<EssentialMedicineEntity>(sql, params);
    let list = res.rows;
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (m) =>
          (m.medicine_name || '').toLowerCase().includes(q) ||
          (m.generic_name || '').toLowerCase().includes(q) ||
          (m.category || '').toLowerCase().includes(q) ||
          (m.facility_name || '').toLowerCase().includes(q) ||
          (m.dosage_form || '').toLowerCase().includes(q)
      );
    }
    if (filter?.category && filter.category !== 'All') {
      list = list.filter((m) => m.category === filter.category);
    }
    if (filter?.status && filter.status !== 'All') {
      list = list.filter((m) => m.status === filter.status);
    }
    return list;
  }

  static async getMedicineById(id: string): Promise<EssentialMedicineEntity | null> {
    const db = getDB();
    const res = await db.query<EssentialMedicineEntity>(
      'SELECT * FROM essential_medicines WHERE id = $1 LIMIT 1',
      [id]
    );
    return res.rows[0] || null;
  }

  static async updateMedicineStock(
    id: string,
    newQuantity: number | null,
    newStatus: MedicineStatus | undefined,
    actorId: string,
    actorName: string,
    actorRole: string,
    reason?: string
  ): Promise<EssentialMedicineEntity | null> {
    const db = getDB();
    const current = await this.getMedicineById(id);
    if (!current) return null;

    // Automatic status evaluation if not explicitly supplied
    let determinedStatus: MedicineStatus = newStatus || current.status;
    if (!newStatus) {
      if (newQuantity === null || newQuantity === undefined) {
        determinedStatus = 'Availability Unknown';
      } else if (newQuantity === 0) {
        determinedStatus = 'Out of Stock';
      } else if (newQuantity <= current.min_threshold) {
        determinedStatus = 'Low Stock';
      } else {
        determinedStatus = 'In Stock';
      }
    }

    const now = new Date().toISOString();
    await db.query(
      'UPDATE essential_medicines SET stock_count = $1, status = $2, updated_at = $3 WHERE id = $4',
      [newQuantity, determinedStatus, now, id]
    );

    // Persist audit record
    await this.createMedicineAuditEvent({
      medicine_id: id,
      facility_id: current.facility_id,
      previous_quantity: current.stock_count,
      new_quantity: newQuantity,
      previous_status: current.status,
      new_status: determinedStatus,
      actor_id: actorId,
      actor_name: actorName,
      actor_role: actorRole,
      reason: reason || 'Inventory update by authorized facility staff',
      timestamp: now,
    });

    return this.getMedicineById(id);
  }

  static async createMedicineAuditEvent(
    data: Omit<MedicineAuditEntity, 'id'> & { id?: string }
  ): Promise<MedicineAuditEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const now = data.timestamp || new Date().toISOString();
    await db.query(
      `INSERT INTO medicine_audit_events (id, medicine_id, facility_id, previous_quantity, new_quantity, previous_status, new_status, actor_id, actor_name, actor_role, reason, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        data.medicine_id,
        data.facility_id,
        data.previous_quantity ?? null,
        data.new_quantity ?? null,
        data.previous_status,
        data.new_status,
        data.actor_id,
        data.actor_name,
        data.actor_role,
        data.reason || null,
        now,
      ]
    );
    return { ...data, id, timestamp: now };
  }

  static async getMedicineAuditEvents(filter?: { medicineId?: string; facilityId?: string }): Promise<MedicineAuditEntity[]> {
    const db = getDB();
    const sql = 'SELECT * FROM medicine_audit_events ORDER BY timestamp DESC LIMIT 100';
    const res = await db.query<MedicineAuditEntity>(sql);
    let list = res.rows;
    if (filter?.medicineId) list = list.filter((e) => e.medicine_id === filter.medicineId);
    if (filter?.facilityId) list = list.filter((e) => e.facility_id === filter.facilityId);
    return list;
  }

  // 6. High-Risk Registry
  static async getHighRiskRegistry(filter?: { patient_id?: string; cohort?: string }): Promise<HighRiskRegistryEntity[]> {
    const db = getDB();
    let sql = 'SELECT * FROM high_risk_registry';
    const params: any[] = [];
    if (filter?.patient_id) {
      sql += ' WHERE patient_id = $1';
      params.push(filter.patient_id);
    }
    sql += ' ORDER BY next_due_date ASC';
    const res = await db.query<HighRiskRegistryEntity>(sql, params);
    let rows = res.rows;
    if (filter?.cohort && filter.cohort !== 'All') {
      rows = rows.filter(r => r.cohort_type.toLowerCase().includes(filter.cohort!.toLowerCase()));
    }
    return rows;
  }

  static async createHighRiskEntry(data: Omit<HighRiskRegistryEntity, 'id'> & { id?: string }): Promise<HighRiskRegistryEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO high_risk_registry (id, patient_id, patient_name, cohort_type, risk_level, primary_condition, current_milestone, next_due_date, status, assigned_asha_name, assigned_facility_id, follow_up_notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        id,
        data.patient_id,
        data.patient_name,
        data.cohort_type,
        data.risk_level || 'Moderate',
        data.primary_condition,
        data.current_milestone,
        data.next_due_date,
        data.status || 'Active',
        data.assigned_asha_name || null,
        data.assigned_facility_id || null,
        data.follow_up_notes || null,
        now,
        now,
      ]
    );
    return { ...data, id, created_at: now, updated_at: now };
  }

  static async getHighRiskById(id: string): Promise<HighRiskRegistryEntity | null> {
    const db = getDB();
    const res = await db.query<HighRiskRegistryEntity>('SELECT * FROM high_risk_registry WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  }

  static async updateHighRiskStatus(id: string, status: string, notes?: string): Promise<HighRiskRegistryEntity | null> {
    const db = getDB();
    const now = new Date().toISOString();
    await db.query(
      'UPDATE high_risk_registry SET status = $1, follow_up_notes = COALESCE($2, follow_up_notes), updated_at = $3 WHERE id = $4',
      [status, notes || null, now, id]
    );
    const res = await db.query<HighRiskRegistryEntity>('SELECT * FROM high_risk_registry WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  }

  // 6b. High-Risk Audit Events
  static async createHighRiskAuditEvent(data: Omit<HighRiskAuditEntity, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): Promise<HighRiskAuditEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const timestamp = data.timestamp || new Date().toISOString();
    await db.query(
      `INSERT INTO high_risk_audit_events (id, case_id, actor_id, actor_name, actor_role, action, previous_status, new_status, notes, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        data.case_id,
        data.actor_id || null,
        data.actor_name || null,
        data.actor_role || null,
        data.action,
        data.previous_status || null,
        data.new_status || null,
        data.notes || null,
        timestamp,
      ]
    );
    return { ...data, id, timestamp };
  }

  static async getHighRiskAuditEvents(filter?: { caseId?: string }): Promise<HighRiskAuditEntity[]> {
    const db = getDB();
    const res = await db.query<HighRiskAuditEntity>('SELECT * FROM high_risk_audit_events ORDER BY timestamp DESC LIMIT 200');
    let list = res.rows;
    if (filter?.caseId) list = list.filter(e => e.case_id === filter.caseId);
    return list;
  }

  // 7. Frontline Operational Visits & Tasks (ASHA / ANM / CHO)
  static async getFrontlineVisits(filter?: { workerId?: string; status?: string; patientId?: string }): Promise<FrontlineVisitEntity[]> {
    const db = getDB();
    const res = await db.query<FrontlineVisitEntity>('SELECT * FROM frontline_visits ORDER BY scheduled_date ASC');
    let list = res.rows;
    if (filter?.workerId) list = list.filter(v => v.assigned_worker_id === filter.workerId);
    if (filter?.status && filter.status !== 'ALL') list = list.filter(v => v.status === filter.status);
    if (filter?.patientId) list = list.filter(v => v.patient_id === filter.patientId);
    return list;
  }

  static async getFrontlineVisitById(id: string): Promise<FrontlineVisitEntity | null> {
    const db = getDB();
    const res = await db.query<FrontlineVisitEntity>('SELECT * FROM frontline_visits WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  }

  static async createFrontlineVisit(data: Omit<FrontlineVisitEntity, 'id'> & { id?: string }): Promise<FrontlineVisitEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO frontline_visits (id, household_id, patient_id, patient_name, village_name, assigned_worker_id, assigned_worker_name, facility_id, facility_name, visit_type, scheduled_date, status, priority, accessibility_barriers, transport_barriers, notes, started_at, completed_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
      [
        id,
        data.household_id,
        data.patient_id || null,
        data.patient_name,
        data.village_name,
        data.assigned_worker_id,
        data.assigned_worker_name,
        data.facility_id || null,
        data.facility_name || null,
        data.visit_type,
        data.scheduled_date,
        data.status || 'ASSIGNED',
        data.priority || 'Routine',
        data.accessibility_barriers || null,
        data.transport_barriers || null,
        data.notes || null,
        data.started_at || null,
        data.completed_at || null,
        now,
        now,
      ]
    );
    return { ...data, id, created_at: now, updated_at: now };
  }

  static async startFrontlineVisit(id: string, actor: { id: string; name: string; role: string }): Promise<FrontlineVisitEntity | null> {
    const db = getDB();
    const current = await this.getFrontlineVisitById(id);
    if (!current) return null;

    const now = new Date().toISOString();
    await db.query(
      'UPDATE frontline_visits SET status = $1, started_at = $2, updated_at = $3 WHERE id = $4',
      ['IN_PROGRESS', now, now, id]
    );

    // Audit log
    await this.createFrontlineAuditEvent({
      resource_type: 'VISIT',
      resource_id: id,
      actor_id: actor.id,
      actor_name: actor.name,
      actor_role: actor.role,
      action: 'VISIT_STARTED',
      previous_status: current.status,
      new_status: 'IN_PROGRESS',
      notes: `Visit commenced at doorstep by ${actor.name}`,
    });

    return this.getFrontlineVisitById(id);
  }

  static async completeFrontlineVisit(
    id: string,
    data: { barriers?: string[]; notes?: string },
    actor: { id: string; name: string; role: string }
  ): Promise<FrontlineVisitEntity | null> {
    const db = getDB();
    const current = await this.getFrontlineVisitById(id);
    if (!current) return null;

    const now = new Date().toISOString();
    const barriersJson = data.barriers && data.barriers.length > 0 ? JSON.stringify(data.barriers) : current.accessibility_barriers;
    const combinedNotes = data.notes
      ? (current.notes ? `${current.notes} | Completion note: ${data.notes}` : data.notes)
      : current.notes;

    await db.query(
      'UPDATE frontline_visits SET status = $1, accessibility_barriers = $2, notes = $3, completed_at = $4, updated_at = $5 WHERE id = $6',
      ['COMPLETED', barriersJson, combinedNotes, now, now, id]
    );

    // Audit log
    await this.createFrontlineAuditEvent({
      resource_type: 'VISIT',
      resource_id: id,
      actor_id: actor.id,
      actor_name: actor.name,
      actor_role: actor.role,
      action: 'VISIT_COMPLETED',
      previous_status: current.status,
      new_status: 'COMPLETED',
      notes: `Doorstep visit completed. Barriers recorded: ${data.barriers?.join(', ') || 'None reported'}`,
    });

    return this.getFrontlineVisitById(id);
  }

  static async getFrontlineTasks(filter?: { workerId?: string; status?: string }): Promise<FrontlineTaskEntity[]> {
    const db = getDB();
    const res = await db.query<FrontlineTaskEntity>('SELECT * FROM frontline_tasks ORDER BY due_date ASC');
    let list = res.rows;
    if (filter?.workerId) list = list.filter(t => t.worker_id === filter.workerId);
    if (filter?.status && filter.status !== 'ALL') list = list.filter(t => t.status === filter.status);
    return list;
  }

  static async getFrontlineTaskById(id: string): Promise<FrontlineTaskEntity | null> {
    const db = getDB();
    const res = await db.query<FrontlineTaskEntity>('SELECT * FROM frontline_tasks WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  }

  static async createFrontlineTask(
    data: Omit<FrontlineTaskEntity, 'id'> & { id?: string },
    actor?: { id: string; name: string; role: string }
  ): Promise<FrontlineTaskEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO frontline_tasks (id, household_id, patient_id, worker_id, worker_name, worker_role, village_name, beneficiary_name, beneficiary_phone, task_type, due_date, priority, status, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      [
        id,
        data.household_id || null,
        data.patient_id || null,
        data.worker_id,
        data.worker_name,
        data.worker_role || 'ASHA',
        data.village_name,
        data.beneficiary_name,
        data.beneficiary_phone || null,
        data.task_type,
        data.due_date,
        data.priority || 'Medium',
        data.status || 'PENDING',
        data.notes || null,
        now,
        now,
      ]
    );

    if (actor) {
      await this.createFrontlineAuditEvent({
        resource_type: 'TASK',
        resource_id: id,
        actor_id: actor.id,
        actor_name: actor.name,
        actor_role: actor.role,
        action: 'TASK_CREATED',
        previous_status: null,
        new_status: data.status || 'PENDING',
        notes: `Task '${data.task_type}' logged for ${data.beneficiary_name}`,
      });
    }

    return { ...data, id, created_at: now, updated_at: now };
  }

  static async updateFrontlineTaskStatus(
    id: string,
    status: string,
    notes?: string,
    actor?: { id: string; name: string; role: string }
  ): Promise<FrontlineTaskEntity | null> {
    const db = getDB();
    const current = await this.getFrontlineTaskById(id);
    if (!current) return null;

    const now = new Date().toISOString();
    await db.query(
      'UPDATE frontline_tasks SET status = $1, notes = COALESCE($2, notes), updated_at = $3 WHERE id = $4',
      [status, notes || null, now, id]
    );

    if (actor) {
      await this.createFrontlineAuditEvent({
        resource_type: 'TASK',
        resource_id: id,
        actor_id: actor.id,
        actor_name: actor.name,
        actor_role: actor.role,
        action: 'TASK_STATUS_UPDATED',
        previous_status: current.status,
        new_status: status,
        notes: notes || `Task status transitioned to ${status}`,
      });
    }

    return this.getFrontlineTaskById(id);
  }

  static async getFrontlineMetrics(workerId?: string): Promise<{
    totalVisits: number;
    pending: number;
    completed: number;
    overdue: number;
    inProgress: number;
    assignedTasks: number;
  }> {
    const visits = await this.getFrontlineVisits(workerId ? { workerId } : undefined);
    const tasks = await this.getFrontlineTasks(workerId ? { workerId } : undefined);

    const pending = visits.filter(v => v.status === 'ASSIGNED' || v.status === 'SCHEDULED').length;
    const inProgress = visits.filter(v => v.status === 'IN_PROGRESS').length;
    const completed = visits.filter(v => v.status === 'COMPLETED').length;
    const overdue = visits.filter(v => v.status === 'MISSED').length;

    return {
      totalVisits: visits.length,
      pending,
      completed,
      overdue,
      inProgress,
      assignedTasks: tasks.length,
    };
  }

  static async processOfflineSync(
    actions: Array<{ id: string; action_type: string; payload: any; offline_created_at: string }>,
    actor: { id: string; name: string; role: string }
  ): Promise<{ syncedIds: string[]; failedItems: any[]; serverTimestamp: string }> {
    const syncedIds: string[] = [];
    const failedItems: any[] = [];
    const serverTimestamp = new Date().toISOString();

    for (const item of actions) {
      try {
        if (item.action_type === 'START_VISIT' && item.payload?.visit_id) {
          await this.startFrontlineVisit(item.payload.visit_id, actor);
          syncedIds.push(item.id);
        } else if (item.action_type === 'COMPLETE_VISIT' && item.payload?.visit_id) {
          await this.completeFrontlineVisit(item.payload.visit_id, {
            barriers: item.payload.barriers,
            notes: item.payload.notes,
          }, actor);
          syncedIds.push(item.id);
        } else if (item.action_type === 'CREATE_TASK' && item.payload) {
          await this.createFrontlineTask(item.payload, actor);
          syncedIds.push(item.id);
        } else if (item.action_type === 'UPDATE_TASK' && item.payload?.task_id) {
          await this.updateFrontlineTaskStatus(item.payload.task_id, item.payload.status, item.payload.notes, actor);
          syncedIds.push(item.id);
        } else {
          failedItems.push({ id: item.id, error: 'Unknown action type' });
        }
      } catch (err: any) {
        failedItems.push({ id: item.id, error: err.message });
      }
    }

    await this.createFrontlineAuditEvent({
      resource_type: 'SYNC',
      resource_id: `sync-${Date.now()}`,
      actor_id: actor.id,
      actor_name: actor.name,
      actor_role: actor.role,
      action: 'SYNC_PROCESSED',
      previous_status: null,
      new_status: 'SYNCED',
      notes: `Offline sync processed ${syncedIds.length} items successfully, ${failedItems.length} failed.`,
    });

    return { syncedIds, failedItems, serverTimestamp };
  }

  static async createFrontlineAuditEvent(
    data: Omit<FrontlineAuditEntity, 'id' | 'timestamp'> & { id?: string; timestamp?: string }
  ): Promise<FrontlineAuditEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const timestamp = data.timestamp || new Date().toISOString();
    await db.query(
      `INSERT INTO frontline_audit_events (id, resource_type, resource_id, actor_id, actor_name, actor_role, action, previous_status, new_status, notes, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        id,
        data.resource_type,
        data.resource_id,
        data.actor_id,
        data.actor_name,
        data.actor_role,
        data.action,
        data.previous_status || null,
        data.new_status || null,
        data.notes || null,
        timestamp,
      ]
    );
    return { ...data, id, timestamp };
  }

  static async getFrontlineAuditEvents(filter?: { resourceId?: string; workerId?: string }): Promise<FrontlineAuditEntity[]> {
    const db = getDB();
    const res = await db.query<FrontlineAuditEntity>('SELECT * FROM frontline_audit_events ORDER BY timestamp DESC LIMIT 200');
    let list = res.rows;
    if (filter?.resourceId) list = list.filter(e => e.resource_id === filter.resourceId);
    if (filter?.workerId) list = list.filter(e => e.actor_id === filter.workerId);
    return list;
  }

  // 7b. Citizen Doorstep Assistance Requests
  static async createDoorstepRequest(
    data: Omit<DoorstepRequestEntity, 'id' | 'created_at' | 'updated_at'> & { id?: string }
  ): Promise<DoorstepRequestEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO doorstep_visit_requests (id, patient_id, patient_name, patient_phone, village_or_area, assistance_type, preferred_date, barrier_description, status, assigned_worker_id, assigned_worker_name, notes, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        id,
        data.patient_id,
        data.patient_name,
        data.patient_phone || null,
        data.village_or_area,
        data.assistance_type,
        data.preferred_date || null,
        data.barrier_description || null,
        data.status || 'REQUESTED',
        data.assigned_worker_id || null,
        data.assigned_worker_name || null,
        data.notes || null,
        now,
        now,
      ]
    );
    return { ...data, id, created_at: now, updated_at: now };
  }

  static async getDoorstepRequests(patientId?: string): Promise<DoorstepRequestEntity[]> {
    const db = getDB();
    const res = await db.query<DoorstepRequestEntity>('SELECT * FROM doorstep_visit_requests ORDER BY created_at DESC');
    let list = res.rows;
    if (patientId) list = list.filter(r => r.patient_id === patientId);
    return list;
  }

  // 8. Emergency 108 SOS Dispatches
  static async createEmergencyDispatch(data: Omit<EmergencyDispatchEntity, 'id' | 'dispatch_number'> & { id?: string; dispatch_number?: string }): Promise<EmergencyDispatchEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const dispatch_number = data.dispatch_number || `SOS-108-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO emergency_dispatches (id, dispatch_number, patient_name, phone, location_name, latitude, longitude, emergency_type, assigned_ambulance_vehicle, eta_minutes, destination_hospital_id, destination_hospital_name, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        id,
        dispatch_number,
        data.patient_name,
        data.phone,
        data.location_name,
        data.latitude || null,
        data.longitude || null,
        data.emergency_type,
        data.assigned_ambulance_vehicle || 'MH-11-AX-1081 (Advanced Life Support)',
        data.eta_minutes || 11,
        data.destination_hospital_id || null,
        data.destination_hospital_name,
        data.status || 'Dispatched',
        now,
      ]
    );
    return { ...data, id, dispatch_number, created_at: now };
  }

  static async getEmergencyDispatches(): Promise<EmergencyDispatchEntity[]> {
    const db = getDB();
    const res = await db.query<EmergencyDispatchEntity>('SELECT * FROM emergency_dispatches ORDER BY created_at DESC');
    return res.rows;
  }
}
