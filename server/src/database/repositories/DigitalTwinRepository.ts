import { getDB } from '../db.js';
import crypto from 'crypto';

export interface DigitalTwinSimulationEntity {
  id: string;
  user_id: string;
  facility_id?: string | null;
  facility_name: string;
  baseline_friction_score: number;
  simulated_friction_score: number;
  friction_reduction_points: number;
  baseline_completion_rate: number;
  simulated_completion_rate: number;
  travel_burden_score: number;
  transport_burden_score: number;
  waiting_burden_score: number;
  digital_access_burden_score: number;
  administrative_burden_score: number;
  diagnostic_burden_score: number;
  medicine_burden_score: number;
  selected_interventions: string; // JSON string
  journey_milestones_json: string; // JSON string
  profile_snapshot_json: string; // JSON string
  facility_snapshot_json: string; // JSON string
  notes?: string | null;
  model_version?: string;
  created_at?: string;
}

export class DigitalTwinRepository {
  public static async create(data: Omit<DigitalTwinSimulationEntity, 'id' | 'created_at'> & { id?: string }): Promise<DigitalTwinSimulationEntity> {
    const db = getDB();
    const id = data.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const entity: DigitalTwinSimulationEntity = {
      id,
      user_id: data.user_id,
      facility_id: data.facility_id || null,
      facility_name: data.facility_name,
      baseline_friction_score: data.baseline_friction_score,
      simulated_friction_score: data.simulated_friction_score,
      friction_reduction_points: data.friction_reduction_points,
      baseline_completion_rate: data.baseline_completion_rate,
      simulated_completion_rate: data.simulated_completion_rate,
      travel_burden_score: data.travel_burden_score,
      transport_burden_score: data.transport_burden_score,
      waiting_burden_score: data.waiting_burden_score,
      digital_access_burden_score: data.digital_access_burden_score,
      administrative_burden_score: data.administrative_burden_score,
      diagnostic_burden_score: data.diagnostic_burden_score,
      medicine_burden_score: data.medicine_burden_score,
      selected_interventions: data.selected_interventions,
      journey_milestones_json: data.journey_milestones_json,
      profile_snapshot_json: data.profile_snapshot_json,
      facility_snapshot_json: data.facility_snapshot_json,
      notes: data.notes || null,
      model_version: data.model_version || 'PFIS-DT-v2.4',
      created_at: now,
    };

    await db.query(
      `INSERT INTO digital_twin_simulations (
        id, user_id, facility_id, facility_name,
        baseline_friction_score, simulated_friction_score, friction_reduction_points,
        baseline_completion_rate, simulated_completion_rate,
        travel_burden_score, transport_burden_score, waiting_burden_score,
        digital_access_burden_score, administrative_burden_score, diagnostic_burden_score, medicine_burden_score,
        selected_interventions, journey_milestones_json, profile_snapshot_json, facility_snapshot_json,
        notes, model_version, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
      [
        entity.id,
        entity.user_id,
        entity.facility_id,
        entity.facility_name,
        entity.baseline_friction_score,
        entity.simulated_friction_score,
        entity.friction_reduction_points,
        entity.baseline_completion_rate,
        entity.simulated_completion_rate,
        entity.travel_burden_score,
        entity.transport_burden_score,
        entity.waiting_burden_score,
        entity.digital_access_burden_score,
        entity.administrative_burden_score,
        entity.diagnostic_burden_score,
        entity.medicine_burden_score,
        entity.selected_interventions,
        entity.journey_milestones_json,
        entity.profile_snapshot_json,
        entity.facility_snapshot_json,
        entity.notes,
        entity.model_version,
        entity.created_at,
      ]
    );

    return entity;
  }

  public static async findByUserId(userId: string, limit = 50): Promise<DigitalTwinSimulationEntity[]> {
    const db = getDB();
    const res = await db.query<DigitalTwinSimulationEntity>(
      'SELECT * FROM digital_twin_simulations WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return res.rows;
  }

  public static async findAll(limit = 100): Promise<DigitalTwinSimulationEntity[]> {
    const db = getDB();
    const res = await db.query<DigitalTwinSimulationEntity>(
      'SELECT * FROM digital_twin_simulations ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return res.rows;
  }

  public static async findById(id: string): Promise<DigitalTwinSimulationEntity | null> {
    const db = getDB();
    const res = await db.query<DigitalTwinSimulationEntity>(
      'SELECT * FROM digital_twin_simulations WHERE id = $1 LIMIT 1',
      [id]
    );
    return res.rows[0] || null;
  }

  public static async deleteById(id: string, userId?: string, isAdmin = false): Promise<boolean> {
    const db = getDB();
    const existing = await this.findById(id);
    if (!existing) return false;

    if (!isAdmin && userId && existing.user_id !== userId) {
      throw new Error('UNAUTHORIZED_DELETION');
    }

    await db.query('DELETE FROM digital_twin_simulations WHERE id = $1', [id]);
    return true;
  }
}
