import { getDB } from '../db.js';
import crypto from 'crypto';

export interface DocumentEntity {
  id: string;
  patient_id: string;
  category: string;
  file_name: string;
  file_url: string;
  file_size_kb: number;
  mime_type: string;
  uploaded_at?: string;
}

export class DocumentRepository {
  static async findByPatientId(patientId: string): Promise<DocumentEntity[]> {
    const db = getDB();
    const res = await db.query<DocumentEntity>(
      'SELECT * FROM documents WHERE patient_id = $1 ORDER BY uploaded_at DESC',
      [patientId]
    );
    return res.rows;
  }

  static async findById(id: string): Promise<DocumentEntity | null> {
    const db = getDB();
    const res = await db.query<DocumentEntity>('SELECT * FROM documents WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  }

  static async create(doc: Omit<DocumentEntity, 'id'> & { id?: string }): Promise<DocumentEntity> {
    const db = getDB();
    const id = doc.id || crypto.randomUUID();
    const now = new Date().toISOString();

    await db.query(
      'INSERT INTO documents (id, patient_id, category, file_name, file_url, file_size_kb, mime_type, uploaded_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [
        id,
        doc.patient_id,
        doc.category,
        doc.file_name,
        doc.file_url,
        doc.file_size_kb || 120.0,
        doc.mime_type || 'application/pdf',
        now,
      ]
    );

    return {
      id,
      ...doc,
      uploaded_at: now,
    };
  }

  static async delete(id: string): Promise<boolean> {
    const db = getDB();
    const res = await db.query('DELETE FROM documents WHERE id = $1', [id]);
    return res.rowCount > 0;
  }
}
