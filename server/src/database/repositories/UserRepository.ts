import { getDB } from '../db.js';
import crypto from 'crypto';

export interface UserEntity {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'patient' | 'hospital' | 'admin' | 'doctor' | 'asha_worker' | 'government';
  phone?: string;
  google_id?: string;
  created_at?: string;
  updated_at?: string;
}

export class UserRepository {
  static async findByEmail(email: string): Promise<UserEntity | null> {
    const db = getDB();
    const res = await db.query<UserEntity>(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email.toLowerCase().trim()]
    );
    return res.rows[0] || null;
  }

  static async findById(id: string): Promise<UserEntity | null> {
    const db = getDB();
    const res = await db.query<UserEntity>(
      'SELECT * FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return res.rows[0] || null;
  }

  static async create(user: Omit<UserEntity, 'id'> & { id?: string }): Promise<UserEntity> {
    const db = getDB();
    const id = user.id || crypto.randomUUID();
    const now = new Date().toISOString();

    await db.query(
      'INSERT INTO users (id, email, password_hash, name, role, phone, google_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        id,
        user.email.toLowerCase().trim(),
        user.password_hash,
        user.name,
        user.role,
        user.phone || null,
        user.google_id || null,
        now,
        now,
      ]
    );

    return {
      id,
      email: user.email.toLowerCase().trim(),
      password_hash: user.password_hash,
      name: user.name,
      role: user.role,
      phone: user.phone,
      google_id: user.google_id,
      created_at: now,
      updated_at: now,
    };
  }

  static async updatePassword(id: string, newHash: string): Promise<boolean> {
    const db = getDB();
    const res = await db.query(
      'UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3',
      [newHash, new Date().toISOString(), id]
    );
    return res.rowCount > 0;
  }

  static async countByRole(role: string): Promise<number> {
    const db = getDB();
    const res = await db.query<UserEntity>('SELECT * FROM users WHERE role = $1', [role]);
    return res.rows.length;
  }

  static async findAll(): Promise<UserEntity[]> {
    const db = getDB();
    const res = await db.query<UserEntity>('SELECT * FROM users ORDER BY created_at DESC');
    return res.rows;
  }
}
