import { getDB } from '../db.js';
import crypto from 'crypto';
import { PatientProfileEntity } from './PatientRepository.js';

export interface FrictionProfileEntity {
  id: string;
  patient_id: string;
  overall_score: number;
  category: string;
  journey_completion_prob: number;
  primary_barrier: string;
  calculated_at?: string;
  factors?: FrictionFactorEntity[];
}

export interface FrictionFactorEntity {
  id?: string;
  friction_profile_id?: string;
  factor_name: string;
  score: number;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  explanation: string;
  suggested_intervention: string;
}

export interface AccessibilityRiskEntity {
  id: string;
  patient_id: string;
  risk_level: string;
  barrier_title: string;
  explanation: string;
  mitigation_action: string;
  created_at?: string;
}

export class FrictionRepository {
  static calculateExplainableFriction(profile: PatientProfileEntity): {
    overallScore: number;
    category: string;
    completionProb: number;
    primaryBarrier: string;
    factors: FrictionFactorEntity[];
  } {
    const factors: FrictionFactorEntity[] = [];

    // 1. Distance Friction (0 - 20 pts)
    const dist = Number(profile.distance_to_hospital_km) || 25;
    let distScore = Math.min(20, Math.round((dist / 60) * 20));
    factors.push({
      factor_name: 'Travel Distance & Terrain',
      score: distScore,
      severity: distScore > 14 ? 'Critical' : distScore > 9 ? 'High' : distScore > 4 ? 'Moderate' : 'Low',
      explanation: `Distance of ${dist} km requires significant travel coordination and physical effort.`,
      suggested_intervention: 'Route to nearest sub-district hospital or community healthcare escort.',
    });

    // 2. Transportation Availability (0 - 15 pts)
    let transScore = 5;
    const mode = (profile.transport_mode || '').toLowerCase();
    if (mode.includes('infrequent') || mode.includes('none') || mode.includes('walking')) {
      transScore = 15;
    } else if (mode.includes('bus') || mode.includes('shared')) {
      transScore = 9;
    } else if (mode.includes('own') || mode.includes('car') || mode.includes('ambulance')) {
      transScore = 2;
    }
    factors.push({
      factor_name: 'Transportation & Transit',
      score: transScore,
      severity: transScore > 10 ? 'High' : transScore > 5 ? 'Moderate' : 'Low',
      explanation: `Primary mode (${profile.transport_mode}) has scheduled dependencies or physical strain.`,
      suggested_intervention: 'Connect with doorstep patient ambulance or volunteer transit shuttle.',
    });

    // 3. Digital Literacy & Device Access (0 - 15 pts)
    let digScore = 4;
    const digLit = (profile.digital_literacy || '').toLowerCase();
    if (digLit.includes('none') || !profile.smartphone_access) {
      digScore = 14;
    } else if (digLit.includes('low') || digLit.includes('basic')) {
      digScore = 9;
    } else {
      digScore = 2;
    }
    factors.push({
      factor_name: 'Digital & System Literacy',
      score: digScore,
      severity: digScore > 10 ? 'High' : digScore > 5 ? 'Moderate' : 'Low',
      explanation: 'Difficulty navigating online portals, OTP verifications, and digital appointment slots.',
      suggested_intervention: 'Activate Simple Language Mode and Voice (TTS) Assisted Navigation.',
    });

    // 4. Family & Caregiver Support (0 - 15 pts)
    let famScore = 4;
    const fam = (profile.family_support || '').toLowerCase();
    if (fam.includes('constrained') || fam.includes('alone') || fam.includes('low')) {
      famScore = 13;
    } else if (fam.includes('moderate')) {
      famScore = 7;
    } else {
      famScore = 2;
    }
    factors.push({
      factor_name: 'Caregiver & Escort Availability',
      score: famScore,
      severity: famScore > 9 ? 'High' : famScore > 4 ? 'Moderate' : 'Low',
      explanation: 'Patient lacks dedicated family member to assist with hospital navigation and registration queues.',
      suggested_intervention: 'Assign Sahayak Community Care Escort for hospital day-journey.',
    });

    // 5. Wage / Income Timing Friction (0 - 15 pts)
    let wageScore = 4;
    const wage = (profile.wage_loss_risk || '').toLowerCase();
    if (wage.includes('daily') || wage.includes('high')) {
      wageScore = 14;
    } else if (wage.includes('moderate')) {
      wageScore = 8;
    } else {
      wageScore = 2;
    }
    factors.push({
      factor_name: 'Wage Loss & Scheduling Timing',
      score: wageScore,
      severity: wageScore > 10 ? 'High' : wageScore > 5 ? 'Moderate' : 'Low',
      explanation: 'Hospital visit causes loss of daily earnings; requires exact-time OPD token to minimize waiting.',
      suggested_intervention: 'Priority Fast-Track OPD token booking for morning window.',
    });

    // 6. Language & Communication (0 - 10 pts)
    let langScore = 2;
    const lang = (profile.preferred_language || 'en').toLowerCase();
    if (lang !== 'en') {
      langScore = 8;
    }
    factors.push({
      factor_name: 'Language & Form Comprehension',
      score: langScore,
      severity: langScore > 6 ? 'Moderate' : 'Low',
      explanation: `Preferred communication in local language (${profile.preferred_language.toUpperCase()}) rather than complex medical English.`,
      suggested_intervention: 'Provide multilingual vernacular forms and audio-assisted summaries.',
    });

    // 7. Documentation Readiness (0 - 10 pts)
    let docScore = 2;
    const doc = (profile.document_readiness || '').toLowerCase();
    if (doc.includes('missing') || doc.includes('none')) {
      docScore = 9;
    } else if (doc.includes('partial') || doc.includes('paper')) {
      docScore = 6;
    } else {
      docScore = 1;
    }
    factors.push({
      factor_name: 'Document & Identification Readiness',
      score: docScore,
      severity: docScore > 6 ? 'Moderate' : 'Low',
      explanation: 'Missing or unorganized physical ID/insurance cards causing registration friction.',
      suggested_intervention: 'Upload and verify documents in digital Document Vault before leaving home.',
    });

    // Calculate total score (0 - 100)
    const rawSum = distScore + transScore + digScore + famScore + wageScore + langScore + docScore;
    const overallScore = Math.min(100, Math.max(5, rawSum));

    // Category
    let category = 'Low Friction';
    if (overallScore > 80) category = 'Critical Access Difficulty';
    else if (overallScore > 60) category = 'Very High Friction';
    else if (overallScore > 40) category = 'High Friction';
    else if (overallScore > 20) category = 'Moderate Friction';

    // Journey Completion Forecast
    const completionProb = Math.max(15, Math.min(95, Math.round(100 - overallScore * 0.52)));

    // Sort factors to find primary barrier
    factors.sort((a, b) => b.score - a.score);
    const primaryBarrier = factors[0]?.factor_name || 'Travel Distance & Terrain';

    return {
      overallScore,
      category,
      completionProb,
      primaryBarrier,
      factors,
    };
  }

  static async getByPatientId(patientId: string): Promise<FrictionProfileEntity | null> {
    const db = getDB();
    const res = await db.query<FrictionProfileEntity>(
      'SELECT * FROM friction_profiles WHERE patient_id = $1 ORDER BY calculated_at DESC LIMIT 1',
      [patientId]
    );
    if (!res.rows[0]) return null;

    const profile = res.rows[0];
    const factorsRes = await db.query<FrictionFactorEntity>(
      'SELECT * FROM friction_factors WHERE friction_profile_id = $1',
      [profile.id]
    );
    profile.factors = factorsRes.rows;
    return profile;
  }

  static async saveCalculatedFriction(
    patientId: string,
    calculated: ReturnType<typeof FrictionRepository.calculateExplainableFriction>
  ): Promise<FrictionProfileEntity> {
    const db = getDB();
    const profileId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.query(
      'INSERT INTO friction_profiles (id, patient_id, overall_score, category, journey_completion_prob, primary_barrier, calculated_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [
        profileId,
        patientId,
        calculated.overallScore,
        calculated.category,
        calculated.completionProb,
        calculated.primaryBarrier,
        now,
      ]
    );

    // Insert factors
    for (const f of calculated.factors) {
      await db.query(
        'INSERT INTO friction_factors (id, friction_profile_id, factor_name, score, severity, explanation, suggested_intervention) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          crypto.randomUUID(),
          profileId,
          f.factor_name,
          f.score,
          f.severity,
          f.explanation,
          f.suggested_intervention,
        ]
      );
    }

    return {
      id: profileId,
      patient_id: patientId,
      overall_score: calculated.overallScore,
      category: calculated.category,
      journey_completion_prob: calculated.completionProb,
      primary_barrier: calculated.primaryBarrier,
      calculated_at: now,
      factors: calculated.factors,
    };
  }

  static async getAccessibilityRisks(patientId: string): Promise<AccessibilityRiskEntity[]> {
    const db = getDB();
    const res = await db.query<AccessibilityRiskEntity>(
      'SELECT * FROM accessibility_risks WHERE patient_id = $1 ORDER BY created_at DESC',
      [patientId]
    );
    return res.rows;
  }

  static async createAccessibilityRisk(
    risk: Omit<AccessibilityRiskEntity, 'id'> & { id?: string }
  ): Promise<AccessibilityRiskEntity> {
    const db = getDB();
    const id = risk.id || crypto.randomUUID();
    const now = new Date().toISOString();

    await db.query(
      'INSERT INTO accessibility_risks (id, patient_id, risk_level, barrier_title, explanation, mitigation_action, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, risk.patient_id, risk.risk_level, risk.barrier_title, risk.explanation, risk.mitigation_action, now]
    );

    return {
      id,
      ...risk,
      created_at: now,
    };
  }
}
