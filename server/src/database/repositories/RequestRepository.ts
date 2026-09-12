import { getDB } from '../db.js';
import crypto from 'crypto';

export interface RequestEntity {
  id: string;
  patient_id: string;
  hospital_id?: string;
  request_type: string;
  status: string;
  details: string;
  priority: string;
  created_at?: string;
  updated_at?: string;
}

export interface AppointmentEntity {
  id: string;
  patient_id: string;
  hospital_id: string;
  service_id?: string;
  scheduled_date: string;
  time_slot: string;
  token_number: number;
  status: string;
  friction_notes?: string;
  created_at?: string;
}

export interface TeleconsultationEntity {
  id: string;
  patient_id: string;
  doctor_name: string;
  specialty: string;
  scheduled_time: string;
  status: string;
  room_id: string;
  channel_type: string;
  created_at?: string;
}

export class RequestRepository {
  // 1. REQUESTS
  static async findByPatientId(patientId: string): Promise<RequestEntity[]> {
    const db = getDB();
    const res = await db.query<RequestEntity>(
      'SELECT * FROM requests WHERE patient_id = $1 ORDER BY created_at DESC',
      [patientId]
    );
    return res.rows;
  }

  static async findById(id: string): Promise<RequestEntity | null> {
    const db = getDB();
    const res = await db.query<RequestEntity>(
      'SELECT * FROM requests WHERE id = $1 LIMIT 1',
      [id]
    );
    return res.rows[0] || null;
  }

  static async create(req: Omit<RequestEntity, 'id'> & { id?: string }): Promise<RequestEntity> {
    const db = getDB();
    const id = req.id || crypto.randomUUID();
    const now = new Date().toISOString();

    await db.query(
      'INSERT INTO requests (id, patient_id, hospital_id, request_type, status, details, priority, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        id,
        req.patient_id,
        req.hospital_id || null,
        req.request_type,
        req.status || 'Pending',
        req.details || '',
        req.priority || 'Standard',
        now,
        now,
      ]
    );

    return {
      id,
      ...req,
      status: req.status || 'Pending',
      created_at: now,
      updated_at: now,
    };
  }

  static async updateStatus(id: string, status: string): Promise<boolean> {
    const db = getDB();
    const res = await db.query(
      'UPDATE requests SET status = $1, updated_at = $2 WHERE id = $3',
      [status, new Date().toISOString(), id]
    );
    return res.rowCount > 0;
  }

  static async findAll(): Promise<RequestEntity[]> {
    const db = getDB();
    const res = await db.query<RequestEntity>('SELECT * FROM requests ORDER BY created_at DESC');
    return res.rows;
  }

  static async countActive(): Promise<number> {
    const db = getDB();
    const res = await db.query<RequestEntity>(
      "SELECT * FROM requests WHERE status = 'Pending' OR status = 'Processing'"
    );
    return res.rows.length;
  }

  // 2. APPOINTMENTS
  static async createAppointment(
    app: Omit<AppointmentEntity, 'id'> & { id?: string }
  ): Promise<AppointmentEntity> {
    const db = getDB();
    const id = app.id || crypto.randomUUID();
    const now = new Date().toISOString();

    await db.query(
      'INSERT INTO appointments (id, patient_id, hospital_id, service_id, scheduled_date, time_slot, token_number, status, friction_notes, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
      [
        id,
        app.patient_id,
        app.hospital_id,
        app.service_id || null,
        app.scheduled_date,
        app.time_slot,
        app.token_number || Math.floor(Math.random() * 50) + 1,
        app.status || 'Confirmed',
        app.friction_notes || '',
        now,
      ]
    );

    return {
      id,
      ...app,
      token_number: app.token_number || 12,
      status: app.status || 'Confirmed',
      created_at: now,
    };
  }

  static async getAppointmentsByPatientId(patientId: string): Promise<AppointmentEntity[]> {
    const db = getDB();
    const res = await db.query<AppointmentEntity>(
      'SELECT * FROM appointments WHERE patient_id = $1 ORDER BY created_at DESC',
      [patientId]
    );
    return res.rows;
  }

  // 3. TELECONSULTATIONS
  static async createTeleconsultation(
    tele: Omit<TeleconsultationEntity, 'id'> & { id?: string }
  ): Promise<TeleconsultationEntity> {
    const db = getDB();
    const id = tele.id || crypto.randomUUID();
    const now = new Date().toISOString();

    await db.query(
      'INSERT INTO teleconsultations (id, patient_id, doctor_name, specialty, scheduled_time, status, room_id, channel_type, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        id,
        tele.patient_id,
        tele.doctor_name,
        tele.specialty,
        tele.scheduled_time,
        tele.status || 'Scheduled',
        tele.room_id || `pfis-room-${Math.floor(1000 + Math.random() * 9000)}`,
        tele.channel_type || 'Video',
        now,
      ]
    );

    return {
      id,
      ...tele,
      room_id: tele.room_id || `pfis-room-9988`,
      status: tele.status || 'Scheduled',
      created_at: now,
    };
  }

  static async getTeleconsultationsByPatientId(patientId: string): Promise<TeleconsultationEntity[]> {
    const db = getDB();
    const res = await db.query<TeleconsultationEntity>(
      'SELECT * FROM teleconsultations WHERE patient_id = $1 ORDER BY created_at DESC',
      [patientId]
    );
    return res.rows;
  }
}
