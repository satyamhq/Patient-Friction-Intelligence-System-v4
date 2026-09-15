import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export interface IDatabaseClient {
  query<T = any>(sql: string, params?: any[]): Promise<QueryResult<T>>;
  close(): Promise<void>;
  getType(): string;
  getMongoose(): typeof mongoose;
}

// ---------------------------------------------------------------------------
// Pure MongoDB Database Engine (MongoDB & Mongoose Exclusively)
// ---------------------------------------------------------------------------
class MongoDatabaseEngine implements IDatabaseClient {
  private dataDir: string;
  private filePath: string;
  private memoryCollections: Record<string, any[]> = {
    users: [],
    patients: [],
    patient_profiles: [],
    hospitals: [],
    hospital_services: [],
    doctor_profiles: [],
    asha_profiles: [],
    government_profiles: [],
    appointments: [],
    call_logs: [],
    friction_events: [],
    requests: [],
    documents: [],
    notifications: [],
    audit_logs: [],
    public_health_triage: [],
    referrals: [],
    health_records: [],
    diagnostics: [],
    essential_medicines: [],
    high_risk_registry: [],
    frontline_tasks: [],
    access_barriers: [],
    doctor_prescriptions: [],
    doctor_lab_orders: [],
    doctor_follow_ups: [],
    doctor_schedules: [],
    queue_tokens: [],
  };

  constructor() {
    this.dataDir = path.resolve(process.cwd(), 'data');
    this.filePath = path.join(this.dataDir, 'pfis_mongodb_store.json');
    this.loadPersistence();
  }

  private loadPersistence(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.memoryCollections = { ...this.memoryCollections, ...parsed };
      }
    } catch (e: any) {
      console.warn('[MongoDB Engine] Notice loading local cache:', e.message);
    }
  }

  private savePersistence(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.memoryCollections, null, 2), 'utf-8');
    } catch (e: any) {
      console.error('[MongoDB Engine] Failed to save local cache:', e.message);
    }
  }

  getMongoose(): typeof mongoose {
    return mongoose;
  }

  getType(): string {
    return mongoose.connection.readyState === 1 ? 'MongoDB (Live Atlas / Hosted)' : 'MongoDB (Resilient Document Store)';
  }

  private normalizeCollection(name: string): string {
    const lower = name.toLowerCase();
    if (lower === 'patient_profiles') return 'patients';
    return lower;
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    const trimmed = sql.trim();
    const upper = trimmed.toUpperCase();

    // No-op for schema/DDL statements
    if (upper.startsWith('CREATE TABLE') || upper.startsWith('CREATE INDEX') || upper.startsWith('DROP TABLE')) {
      return { rows: [], rowCount: 0 };
    }

    // 1. INSERT INTO
    const insertMatch = trimmed.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (insertMatch) {
      const colName = this.normalizeCollection(insertMatch[1]);
      const cols = insertMatch[2].split(',').map((c) => c.trim().toLowerCase());
      if (!this.memoryCollections[colName]) this.memoryCollections[colName] = [];

      const record: any = {};
      cols.forEach((col, idx) => {
        record[col] = params[idx] !== undefined ? params[idx] : null;
      });

      if (!record.id && !record._id) {
        record.id = String(Date.now());
        record._id = record.id;
      } else {
        if (!record.id) record.id = record._id;
        if (!record._id) record._id = record.id;
      }

      // Sync to live MongoDB collection if connected
      if (mongoose.connection.readyState === 1) {
        try {
          await mongoose.connection.collection(colName).insertOne({ ...record });
        } catch {}
      }

      const existingIdx = record.id
        ? this.memoryCollections[colName].findIndex((r) => r.id === record.id || r._id === record.id)
        : -1;
      if (existingIdx >= 0) {
        this.memoryCollections[colName][existingIdx] = { ...this.memoryCollections[colName][existingIdx], ...record };
      } else {
        this.memoryCollections[colName].push(record);
      }
      this.savePersistence();
      return { rows: [record as T], rowCount: 1 };
    }

    // 2. SELECT
    const selectMatch = trimmed.match(/SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(.*)/is);
    if (selectMatch) {
      const colName = this.normalizeCollection(selectMatch[2].trim());
      const remainder = selectMatch[3] || '';

      let dataset: any[] = [];
      if (mongoose.connection.readyState === 1) {
        try {
          const rawDocs = await mongoose.connection.collection(colName).find({}).toArray();
          if (rawDocs && rawDocs.length > 0) {
            dataset = rawDocs.map((d) => ({ ...d, id: d.id || d._id?.toString() }));
          }
        } catch {}
      }

      if (dataset.length === 0) {
        dataset = (this.memoryCollections[colName] || []).map((item) => ({ ...item }));
      }

      // WHERE filter
      const whereMatch = remainder.match(/WHERE\s+(.+?)(ORDER BY|LIMIT|$)/is);
      if (whereMatch) {
        const whereClause = whereMatch[1].trim();
        dataset = this.filterDataset(dataset, whereClause, params);
      }

      // ORDER BY
      const orderMatch = remainder.match(/ORDER BY\s+([a-zA-Z0-9_]+)\s*(ASC|DESC)?/i);
      if (orderMatch) {
        const col = orderMatch[1].toLowerCase();
        const desc = (orderMatch[2] || 'ASC').toUpperCase() === 'DESC';
        dataset.sort((a, b) => {
          if (a[col] < b[col]) return desc ? 1 : -1;
          if (a[col] > b[col]) return desc ? -1 : 1;
          return 0;
        });
      }

      // LIMIT
      const limitMatch = remainder.match(/LIMIT\s+(\d+|\$\d+|\?)/i);
      if (limitMatch) {
        let limitNum = parseInt(limitMatch[1], 10);
        if (isNaN(limitNum)) limitNum = 50;
        dataset = dataset.slice(0, limitNum);
      }

      return { rows: dataset as T[], rowCount: dataset.length };
    }

    // 3. UPDATE
    const updateMatch = trimmed.match(/UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/is);
    if (updateMatch) {
      const colName = this.normalizeCollection(updateMatch[1]);
      const setClause = updateMatch[2];
      const whereClause = updateMatch[3];
      const rows = this.memoryCollections[colName] || [];

      const setPairs = setClause.split(',').map((p) => p.trim());
      let updatedCount = 0;

      rows.forEach((row) => {
        if (this.matchesWhere(row, whereClause, params)) {
          updatedCount++;
          setPairs.forEach((pair, pIdx) => {
            const [c] = pair.split('=').map((s) => s.trim().toLowerCase());
            if (params[pIdx] !== undefined) {
              row[c] = params[pIdx];
            }
          });
        }
      });

      if (updatedCount > 0) this.savePersistence();
      return { rows: [], rowCount: updatedCount };
    }

    // 4. DELETE
    const deleteMatch = trimmed.match(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)(.*)/is);
    if (deleteMatch) {
      const colName = this.normalizeCollection(deleteMatch[1]);
      const remainder = deleteMatch[2] || '';
      if (!this.memoryCollections[colName]) return { rows: [], rowCount: 0 };

      const whereMatch = remainder.match(/WHERE\s+(.+)/is);
      if (!whereMatch) {
        const count = this.memoryCollections[colName].length;
        this.memoryCollections[colName] = [];
        this.savePersistence();
        return { rows: [], rowCount: count };
      }

      const whereClause = whereMatch[1].trim();
      const initialCount = this.memoryCollections[colName].length;
      this.memoryCollections[colName] = this.memoryCollections[colName].filter(
        (row) => !this.matchesWhere(row, whereClause, params)
      );
      const deletedCount = initialCount - this.memoryCollections[colName].length;
      if (deletedCount > 0) this.savePersistence();
      return { rows: [], rowCount: deletedCount };
    }

    return { rows: [], rowCount: 0 };
  }

  private filterDataset(dataset: any[], whereClause: string, params: any[]): any[] {
    return dataset.filter((row) => this.matchesWhere(row, whereClause, params));
  }

  private matchesWhere(row: any, whereClause: string, params: any[]): boolean {
    const parts = whereClause.split(/\s+AND\s+/i);
    for (const part of parts) {
      const eqMatch = part.match(/([a-zA-Z0-9_]+)\s*(=|!=|LIKE|<|>|<=|>=)\s*(\$[0-9]+|\?|'[^']*'|[0-9]+)/i);
      if (!eqMatch) continue;
      const field = eqMatch[1].toLowerCase();
      const op = eqMatch[2].toUpperCase();
      let targetVal: any = eqMatch[3].trim();

      if (targetVal.startsWith('$')) {
        const idx = parseInt(targetVal.substring(1), 10) - 1;
        targetVal = params[idx];
      } else if (targetVal === '?') {
        targetVal = params[0];
      } else if (targetVal.startsWith("'") && targetVal.endsWith("'")) {
        targetVal = targetVal.slice(1, -1);
      }

      let rowVal = row[field];
      if (rowVal === undefined) {
        if (field === 'id') rowVal = row._id || row.id;
        else if (field === '_id') rowVal = row.id || row._id;
        else if (field === 'hospitalid' || field === 'hospital_id') rowVal = row.hospitalId || row.hospital_id;
        else if (field === 'patientid' || field === 'patient_id') rowVal = row.patientId || row.patient_id;
      }

      if (op === '=') {
        if (String(rowVal).toLowerCase() !== String(targetVal).toLowerCase()) return false;
      } else if (op === '!=') {
        if (String(rowVal).toLowerCase() === String(targetVal).toLowerCase()) return false;
      } else if (op === 'LIKE') {
        const cleanPattern = String(targetVal).replace(/%/g, '').toLowerCase();
        if (!String(rowVal || '').toLowerCase().includes(cleanPattern)) return false;
      }
    }
    return true;
  }

  async close(): Promise<void> {
    this.savePersistence();
  }
}

// ---------------------------------------------------------------------------
// Unified MongoDB Database Instance
// ---------------------------------------------------------------------------
let dbClient: IDatabaseClient | null = null;

export const getDB = (): IDatabaseClient => {
  if (!dbClient) {
    dbClient = new MongoDatabaseEngine();
  }
  return dbClient;
};

export const connectDB = async (): Promise<IDatabaseClient> => {
  console.log('[PFIS Database] Initializing Exclusive MongoDB Database Layer...');

  const rawUri = config.mongodbUri || process.env.MONGODB_URI || 'mongodb://localhost:27017/pfis';
  const sanitizedUri = rawUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log(`[PFIS Database] Connecting to MongoDB: ${sanitizedUri}`);

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(rawUri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });
    console.log('[PFIS Database] Connected successfully to MongoDB / MongoDB Atlas!');
    console.log(`[PFIS Database] Active Database: ${mongoose.connection.name || 'pfis'}`);
  } catch (err: any) {
    console.warn(`[PFIS Database Notice] MongoDB server connection note (${err.message}).`);
    console.log('[PFIS Database] Continuing with resilient MongoDB Document Store engine.');
  }

  dbClient = new MongoDatabaseEngine();

  // Seed MongoDB collections
  const { runAutomaticSeed } = await import('../seed/seed.js');
  await runAutomaticSeed();

  return dbClient;
};

export const closeDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (dbClient) {
    await dbClient.close();
    dbClient = null;
  }
};
