import { getDB } from '../db.js';
import crypto from 'crypto';

export interface NotificationEntity {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read?: boolean;
  link?: string;
  created_at?: string;
}

export class NotificationRepository {
  static async findByUserId(userId: string): Promise<NotificationEntity[]> {
    const db = getDB();
    const res = await db.query<NotificationEntity>(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return res.rows;
  }

  static async create(notif: Omit<NotificationEntity, 'id'> & { id?: string }): Promise<NotificationEntity> {
    const db = getDB();
    const id = notif.id || crypto.randomUUID();
    const now = new Date().toISOString();

    await db.query(
      'INSERT INTO notifications (id, user_id, title, message, type, is_read, link, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        id,
        notif.user_id,
        notif.title,
        notif.message,
        notif.type || 'info',
        notif.is_read ?? false,
        notif.link || null,
        now,
      ]
    );

    return {
      id,
      ...notif,
      is_read: notif.is_read ?? false,
      created_at: now,
    };
  }

  static async markAsRead(id: string): Promise<boolean> {
    const db = getDB();
    const res = await db.query('UPDATE notifications SET is_read = $1 WHERE id = $2', [true, id]);
    return res.rowCount > 0;
  }

  static async markAllAsRead(userId: string): Promise<boolean> {
    const db = getDB();
    const res = await db.query('UPDATE notifications SET is_read = $1 WHERE user_id = $2', [true, userId]);
    return res.rowCount > 0;
  }

  static async delete(id: string): Promise<boolean> {
    const db = getDB();
    const res = await db.query('DELETE FROM notifications WHERE id = $1', [id]);
    return res.rowCount > 0;
  }
}
