import { getDB } from '../db.js';
import crypto from 'crypto';

export interface AuditLogEntity {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  ip_address?: string;
  created_at?: string;
}

export class AuditRepository {
  static async log(entry: Omit<AuditLogEntity, 'id'>): Promise<AuditLogEntity> {
    const db = getDB();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.query(
      'INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, ip_address, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id, entry.user_id || null, entry.action, entry.entity_type, entry.entity_id || null, entry.ip_address || null, now]
    );

    return {
      id,
      ...entry,
      created_at: now,
    };
  }

  static async findRecent(limit: number = 50): Promise<AuditLogEntity[]> {
    const db = getDB();
    const res = await db.query<AuditLogEntity>('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1', [limit]);
    return res.rows;
  }
}
