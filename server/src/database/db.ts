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
}

// ---------------------------------------------------------------------------
// 1. PostgreSQL Driver (pg)
// ---------------------------------------------------------------------------
class PostgresDriver implements IDatabaseClient {
  private pool: any;

  constructor(pool: any) {
    this.pool = pool;
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    const res = await this.pool.query(sql, params);
    return {
      rows: res.rows || [],
      rowCount: res.rowCount ?? (res.rows ? res.rows.length : 0),
    };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  getType(): string {
    return 'PostgreSQL';
  }
}

// ---------------------------------------------------------------------------
// 2. MySQL Driver (mysql2)
// ---------------------------------------------------------------------------
class MySQLDriver implements IDatabaseClient {
  private pool: any;

  constructor(pool: any) {
    this.pool = pool;
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    // Convert $1, $2 style placeholders to ?
    let mysqlSql = sql.replace(/\$(\d+)/g, '?');
    const [rows, fields] = await this.pool.execute(mysqlSql, params);
    const rowList = Array.isArray(rows) ? rows : [rows];
    return {
      rows: rowList as T[],
      rowCount: Array.isArray(rows) ? rows.length : (rows as any)?.affectedRows || 0,
    };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  getType(): string {
    return 'MySQL';
  }
}

// ---------------------------------------------------------------------------
// 3. Embedded Relational SQL Storage Engine (Zero-setup PostgreSQL/MySQL compatible)
// ---------------------------------------------------------------------------
class EmbeddedSQLDriver implements IDatabaseClient {
  private dataDir: string;
  private filePath: string;
  private tables: Record<string, any[]> = {
    users: [],
    patient_profiles: [],
    hospitals: [],
    hospital_services: [],
    doctor_profiles: [],
    asha_profiles: [],
    government_profiles: [],
    feature_flags: [],
    appointments: [],
    teleconsultations: [],
    friction_profiles: [],
    friction_factors: [],
    accessibility_risks: [],
    requests: [],
    documents: [],
    notifications: [],
    audit_logs: [],
    public_health_triage: [],
    referrals: [],
    health_records: [],
    patient_abha: [],
    health_record_consents: [],
    health_record_audit_events: [],
    diagnostics: [],
    diagnostic_bookings: [],
    diagnostic_audit_events: [],
    essential_medicines: [],
    medicine_audit_events: [],
    high_risk_registry: [],
    frontline_tasks: [],
    emergency_dispatches: [],
  };

  constructor() {
    this.dataDir = path.resolve(process.cwd(), 'data');
    this.filePath = path.join(this.dataDir, 'pfis_relational.json');
    this.load();
  }

  private load(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.tables = { ...this.tables, ...parsed };
      }
    } catch (e: any) {
      console.warn('[Embedded DB] Warning loading data file, using fresh store:', e.message);
    }
  }

  private save(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.tables, null, 2), 'utf-8');
    } catch (e: any) {
      console.error('[Embedded DB] Failed to save relational store:', e.message);
    }
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<QueryResult<T>> {
    const trimmed = sql.trim();
    const upper = trimmed.toUpperCase();

    // 1. CREATE TABLE / CREATE INDEX -> No-op for embedded store
    if (upper.startsWith('CREATE TABLE') || upper.startsWith('CREATE INDEX')) {
      return { rows: [], rowCount: 0 };
    }

    // 2. INSERT INTO
    const insertMatch = trimmed.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (insertMatch) {
      const tableName = insertMatch[1].toLowerCase();
      const cols = insertMatch[2].split(',').map((c) => c.trim().toLowerCase());
      if (!this.tables[tableName]) this.tables[tableName] = [];

      const record: any = {};
      cols.forEach((col, idx) => {
        record[col] = params[idx] !== undefined ? params[idx] : null;
      });

      // Avoid duplicates on primary key
      const existingIdx = record.id
        ? this.tables[tableName].findIndex((r) => r.id === record.id)
        : -1;
      if (existingIdx >= 0) {
        this.tables[tableName][existingIdx] = { ...this.tables[tableName][existingIdx], ...record };
      } else {
        this.tables[tableName].push(record);
      }
      this.save();
      return { rows: [record as T], rowCount: 1 };
    }

    // 3. SELECT
    const selectMatch = trimmed.match(/SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(.*)/is);
    if (selectMatch) {
      const tableName = selectMatch[2].trim().toLowerCase();
      const remainder = selectMatch[3] || '';
      let dataset = (this.tables[tableName] || []).map((item) => ({ ...item }));

      // Simple WHERE filter parser
      const whereMatch = remainder.match(/WHERE\s+(.+?)(ORDER BY|LIMIT|$)/is);
      if (whereMatch) {
        const whereClause = whereMatch[1].trim();
        dataset = this.filterDataset(dataset, whereClause, params);
      }

      // ORDER BY parser
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

      // LIMIT parser
      const limitMatch = remainder.match(/LIMIT\s+(\d+|\$\d+|\?)/i);
      if (limitMatch) {
        let limitNum = parseInt(limitMatch[1], 10);
        if (isNaN(limitNum)) {
          // Check if placeholder
          limitNum = 50;
        }
        dataset = dataset.slice(0, limitNum);
      }

      return { rows: dataset as T[], rowCount: dataset.length };
    }

    // 4. UPDATE
    const updateMatch = trimmed.match(/UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.+?)\s+WHERE\s+(.+)/is);
    if (updateMatch) {
      const tableName = updateMatch[1].toLowerCase();
      const setClause = updateMatch[2];
      const whereClause = updateMatch[3];
      const tableRows = this.tables[tableName] || [];

      // Determine param split between SET and WHERE
      const setPairs = setClause.split(',').map((p) => p.trim());
      const updatedIndices: number[] = [];

      tableRows.forEach((row, idx) => {
        if (this.matchesWhere(row, whereClause, params)) {
          updatedIndices.push(idx);
          setPairs.forEach((pair, pIdx) => {
            const [c] = pair.split('=').map((s) => s.trim().toLowerCase());
            if (params[pIdx] !== undefined) {
              row[c] = params[pIdx];
            }
          });
        }
      });

      if (updatedIndices.length > 0) this.save();
      return { rows: [], rowCount: updatedIndices.length };
    }

    // 5. DELETE
    const deleteMatch = trimmed.match(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)(.*)/is);
    if (deleteMatch) {
      const tableName = deleteMatch[1].toLowerCase();
      const remainder = deleteMatch[2] || '';
      if (!this.tables[tableName]) return { rows: [], rowCount: 0 };

      const whereMatch = remainder.match(/WHERE\s+(.+)/is);
      if (!whereMatch) {
        const count = this.tables[tableName].length;
        this.tables[tableName] = [];
        this.save();
        return { rows: [], rowCount: count };
      }

      const whereClause = whereMatch[1].trim();
      const initialCount = this.tables[tableName].length;
      this.tables[tableName] = this.tables[tableName].filter(
        (row) => !this.matchesWhere(row, whereClause, params)
      );
      const deletedCount = initialCount - this.tables[tableName].length;
      if (deletedCount > 0) this.save();
      return { rows: [], rowCount: deletedCount };
    }

    return { rows: [], rowCount: 0 };
  }

  private filterDataset(dataset: any[], whereClause: string, params: any[]): any[] {
    return dataset.filter((row) => this.matchesWhere(row, whereClause, params));
  }

  private matchesWhere(row: any, whereClause: string, params: any[]): boolean {
    // Simple AND tokenizer
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
    this.save();
  }

  getType(): string {
    return 'Embedded Relational SQL Store';
  }
}

// ---------------------------------------------------------------------------
// Unified Database Abstraction Instance
// ---------------------------------------------------------------------------
let dbClient: IDatabaseClient | null = null;

export const getDB = (): IDatabaseClient => {
  if (!dbClient) {
    dbClient = new EmbeddedSQLDriver();
  }
  return dbClient;
};

export const connectDB = async (): Promise<IDatabaseClient> => {
  console.log('[PFIS Database] Initializing Database Abstraction Layer...');

  // 1. Try PostgreSQL if configured
  if (config.databaseType === 'postgres' || config.databaseUrl.startsWith('postgres')) {
    try {
      const { Pool } = (await import('pg')) as any;
      const poolConfig = config.databaseUrl
        ? { connectionString: config.databaseUrl }
        : {
            host: config.pgHost,
            port: config.pgPort,
            user: config.pgUser,
            password: config.pgPassword,
            database: config.pgDatabase,
          };
      const pool = new Pool(poolConfig);
      await pool.query('SELECT 1');
      console.log('[PFIS Database] Connected successfully to PostgreSQL database!');
      dbClient = new PostgresDriver(pool);
      return dbClient;
    } catch (err: any) {
      console.warn(`[PFIS Database Notice] PostgreSQL connection failed (${err.message}). Falling back to Embedded SQL engine.`);
    }
  }

  // 2. Try MySQL if configured
  if (config.databaseType === 'mysql' || config.databaseUrl.startsWith('mysql')) {
    try {
      const mysql = (await import('mysql2/promise')) as any;
      const poolConfig = config.databaseUrl
        ? config.databaseUrl
        : {
            host: config.mysqlHost,
            port: config.mysqlPort,
            user: config.mysqlUser,
            password: config.mysqlPassword,
            database: config.mysqlDatabase,
          };
      const pool = mysql.createPool(poolConfig as any);
      await pool.query('SELECT 1');
      console.log('[PFIS Database] Connected successfully to MySQL database!');
      dbClient = new MySQLDriver(pool);
      return dbClient;
    } catch (err: any) {
      console.warn(`[PFIS Database Notice] MySQL connection failed (${err.message}). Falling back to Embedded SQL engine.`);
    }
  }

  // 3. Zero-setup Embedded Relational SQL Driver
  console.log('[PFIS Database] Operating with Embedded Relational SQL Engine (Zero External Setup Required).');
  dbClient = new EmbeddedSQLDriver();

  // Initialize and seed schema
  const { runRelationalSeed } = await import('../seed/seedRelational.js');
  await runRelationalSeed();

  return dbClient;
};

export const closeDB = async (): Promise<void> => {
  if (dbClient) {
    await dbClient.close();
    dbClient = null;
  }
};
