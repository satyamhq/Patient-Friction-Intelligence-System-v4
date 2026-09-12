import { getDB } from '../db.js';
import crypto from 'crypto';

export interface PatientProfileEntity {
  id: string;
  user_id: string;
  full_name: string;
  age: number;
  gender: string;
  location: string;
  is_rural: boolean;
  distance_to_hospital_km: number;
  transport_mode: string;
  digital_literacy: string;
  family_support: string;
  wage_loss_risk: string;
  preferred_language: string;
  smartphone_access: boolean;
  internet_type: string;
  disability_needs?: string;
  appointment_flexibility: string;
  document_readiness: string;
  created_at?: string;
  updated_at?: string;
}

export class PatientRepository {
  static async findByUserId(userId: string): Promise<PatientProfileEntity | null> {
    const db = getDB();
    const res = await db.query<PatientProfileEntity>(
      'SELECT * FROM patient_profiles WHERE user_id = $1 LIMIT 1',
      [userId]
    );
    return res.rows[0] || null;
  }

  static async findById(id: string): Promise<PatientProfileEntity | null> {
    const db = getDB();
    const res = await db.query<PatientProfileEntity>(
      'SELECT * FROM patient_profiles WHERE id = $1 LIMIT 1',
      [id]
    );
    return res.rows[0] || null;
  }

  static async createOrUpdate(profile: Partial<PatientProfileEntity> & { user_id: string }): Promise<PatientProfileEntity> {
    const db = getDB();
    const existing = await this.findByUserId(profile.user_id);
    const now = new Date().toISOString();

    if (existing) {
      const updated: PatientProfileEntity = {
        ...existing,
        ...profile,
        updated_at: now,
      };

      await db.query(
        'UPDATE patient_profiles SET full_name = $1, age = $2, gender = $3, location = $4, is_rural = $5, distance_to_hospital_km = $6, transport_mode = $7, digital_literacy = $8, family_support = $9, wage_loss_risk = $10, preferred_language = $11, smartphone_access = $12, internet_type = $13, disability_needs = $14, appointment_flexibility = $15, document_readiness = $16, updated_at = $17 WHERE user_id = $18',
        [
          updated.full_name,
          updated.age,
          updated.gender,
          updated.location,
          updated.is_rural,
          updated.distance_to_hospital_km,
          updated.transport_mode,
          updated.digital_literacy,
          updated.family_support,
          updated.wage_loss_risk,
          updated.preferred_language,
          updated.smartphone_access,
          updated.internet_type,
          updated.disability_needs || null,
          updated.appointment_flexibility,
          updated.document_readiness,
          now,
          profile.user_id,
        ]
      );
      return updated;
    } else {
      const id = profile.id || crypto.randomUUID();
      const newRecord: PatientProfileEntity = {
        id,
        user_id: profile.user_id,
        full_name: profile.full_name || 'Sunita Devi',
        age: profile.age ?? 60,
        gender: profile.gender || 'Female',
        location: profile.location || 'Rural',
        is_rural: profile.is_rural ?? true,
        distance_to_hospital_km: profile.distance_to_hospital_km ?? 65.0,
        transport_mode: profile.transport_mode || 'Infrequent Bus',
        digital_literacy: profile.digital_literacy || 'None / Feature Phone',
        family_support: profile.family_support || 'Caregiver Constrained',
        wage_loss_risk: profile.wage_loss_risk || 'Daily Wage Loss',
        preferred_language: profile.preferred_language || 'hi',
        smartphone_access: profile.smartphone_access ?? false,
        internet_type: profile.internet_type || '2G / Intermittent',
        disability_needs: profile.disability_needs || 'Limited Mobility / Needs Walking Support',
        appointment_flexibility: profile.appointment_flexibility || 'Early Morning Only',
        document_readiness: profile.document_readiness || 'Physical Paper / Missing Card',
        created_at: now,
        updated_at: now,
      };

      await db.query(
        'INSERT INTO patient_profiles (id, user_id, full_name, age, gender, location, is_rural, distance_to_hospital_km, transport_mode, digital_literacy, family_support, wage_loss_risk, preferred_language, smartphone_access, internet_type, disability_needs, appointment_flexibility, document_readiness, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)',
        [
          newRecord.id,
          newRecord.user_id,
          newRecord.full_name,
          newRecord.age,
          newRecord.gender,
          newRecord.location,
          newRecord.is_rural,
          newRecord.distance_to_hospital_km,
          newRecord.transport_mode,
          newRecord.digital_literacy,
          newRecord.family_support,
          newRecord.wage_loss_risk,
          newRecord.preferred_language,
          newRecord.smartphone_access,
          newRecord.internet_type,
          newRecord.disability_needs,
          newRecord.appointment_flexibility,
          newRecord.document_readiness,
          now,
          now,
        ]
      );
      return newRecord;
    }
  }

  static async count(): Promise<number> {
    const db = getDB();
    const res = await db.query<PatientProfileEntity>('SELECT * FROM patient_profiles');
    return res.rows.length;
  }
}
