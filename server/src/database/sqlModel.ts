import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';

// In-memory document fallback store for MongoDB offline/local testing
const memoryStore: Record<string, any[]> = {
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

export function normalizeCollectionName(name: string): string {
  const lower = name.toLowerCase();
  if (lower === 'patient_profiles') return 'patients';
  return lower;
}

export class MongoQuery<T = any> {
  private collectionName: string;
  private filter: any;
  private sortObj?: any;
  private limitNum?: number;
  private skipNum?: number;

  constructor(collectionName: string, filter: any = {}) {
    this.collectionName = normalizeCollectionName(collectionName);
    this.filter = filter;
  }

  sort(sortObj: any): this {
    this.sortObj = sortObj;
    return this;
  }

  limit(num: number): this {
    this.limitNum = num;
    return this;
  }

  skip(num: number): this {
    this.skipNum = num;
    return this;
  }

  populate(_path: string, _select?: string): this {
    return this;
  }

  select(_fields: any): this {
    return this;
  }

  async exec(): Promise<T[]> {
    // 1. If MongoDB is live and connected via Mongoose
    if (mongoose.connection.readyState === 1) {
      try {
        const col = mongoose.connection.collection(this.collectionName);
        let cursor = col.find(sanitizeMongoFilter(this.filter));
        if (this.sortObj) cursor = cursor.sort(this.sortObj);
        if (this.skipNum) cursor = cursor.skip(this.skipNum);
        if (this.limitNum) cursor = cursor.limit(this.limitNum);
        const docs = await cursor.toArray();
        return docs.map((d) => wrapMongoInstance(this.collectionName, d));
      } catch (err) {
        console.warn(`[MongoDB Query Warning] Fallback for ${this.collectionName}:`, err);
      }
    }

    // 2. Resilient memory store fallback
    let list = (memoryStore[this.collectionName] || []).map((item) => ({ ...item }));

    if (this.filter && Object.keys(this.filter).length > 0) {
      list = list.filter((row) => matchMongoFilter(row, this.filter));
    }

    if (this.sortObj) {
      const entries = Object.entries(this.sortObj);
      list.sort((a, b) => {
        for (const [key, dir] of entries) {
          const valA = a[key];
          const valB = b[key];
          const mult = dir === -1 || dir === 'desc' || dir === 'DESC' ? -1 : 1;
          if (valA < valB) return -1 * mult;
          if (valA > valB) return 1 * mult;
        }
        return 0;
      });
    }

    if (this.skipNum) list = list.slice(this.skipNum);
    if (this.limitNum) list = list.slice(0, this.limitNum);

    return list.map((item) => wrapMongoInstance(this.collectionName, item));
  }

  then(onfulfilled?: (value: T[]) => any, onrejected?: (reason: any) => any): Promise<any> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

export function createMongoModel<T = any>(rawCollectionName: string) {
  const collectionName = normalizeCollectionName(rawCollectionName);
  return {
    collectionName,

    find(filter: any = {}): MongoQuery<T> {
      return new MongoQuery<T>(collectionName, filter);
    },

    async findOne(filter: any = {}): Promise<T | null> {
      const query = new MongoQuery<T>(collectionName, filter).limit(1);
      const results = await query.exec();
      return results.length > 0 ? results[0] : null;
    },

    async findById(id: any): Promise<T | null> {
      if (!id) return null;
      return this.findOne({ $or: [{ _id: id }, { id: id }] });
    },

    async create(data: any | any[]): Promise<any> {
      const items = Array.isArray(data) ? data : [data];
      const createdItems: any[] = [];

      for (const item of items) {
        const id = item._id || item.id || crypto.randomUUID();
        const doc = {
          ...item,
          _id: id,
          id: id,
          createdAt: item.createdAt || new Date(),
          updatedAt: item.updatedAt || new Date(),
        };

        if (mongoose.connection.readyState === 1) {
          try {
            const col = mongoose.connection.collection(collectionName);
            await col.insertOne(doc);
          } catch (err) {
            console.warn(`[MongoDB Insert Warning] ${collectionName}:`, err);
          }
        }

        if (!memoryStore[collectionName]) memoryStore[collectionName] = [];
        const existingIdx = memoryStore[collectionName].findIndex(
          (r) => (r._id && r._id === id) || (r.id && r.id === id)
        );
        if (existingIdx >= 0) {
          memoryStore[collectionName][existingIdx] = { ...memoryStore[collectionName][existingIdx], ...doc };
        } else {
          memoryStore[collectionName].push(doc);
        }

        createdItems.push(wrapMongoInstance(collectionName, doc));
      }

      return Array.isArray(data) ? createdItems : createdItems[0];
    },

    async findByIdAndUpdate(id: any, update: any, options: any = { new: true }): Promise<T | null> {
      if (!id) return null;
      const targetFilter = { $or: [{ _id: id }, { id: id }] };
      return this.findOneAndUpdate(targetFilter, update, options);
    },

    async findOneAndUpdate(filter: any, update: any, options: any = { new: true }): Promise<T | null> {
      const existing = await this.findOne(filter);
      if (!existing) {
        if (options.upsert) {
          return this.create({ ...filter, ...(update.$set || update) });
        }
        return null;
      }

      const updateData = update.$set ? { ...update.$set } : { ...update };
      delete updateData.$set;
      updateData.updatedAt = new Date();

      const merged = { ...(existing as any).toObject(), ...updateData };

      if (mongoose.connection.readyState === 1) {
        try {
          const col = mongoose.connection.collection(collectionName);
          await col.updateOne(sanitizeMongoFilter(filter), { $set: updateData });
        } catch (err) {
          console.warn(`[MongoDB Update Warning] ${collectionName}:`, err);
        }
      }

      if (memoryStore[collectionName]) {
        const idx = memoryStore[collectionName].findIndex((r) => r.id === merged.id || r._id === merged._id);
        if (idx >= 0) memoryStore[collectionName][idx] = merged;
      }

      return wrapMongoInstance(collectionName, merged);
    },

    async updateOne(filter: any, update: any): Promise<{ modifiedCount: number }> {
      const res = await this.findOneAndUpdate(filter, update);
      return { modifiedCount: res ? 1 : 0 };
    },

    async updateMany(filter: any, update: any): Promise<{ modifiedCount: number }> {
      const docs = await this.find(filter).exec();
      for (const doc of docs) {
        await this.findByIdAndUpdate((doc as any).id || (doc as any)._id, update);
      }
      return { modifiedCount: docs.length };
    },

    async deleteOne(filter: any): Promise<{ deletedCount: number }> {
      const doc = await this.findOne(filter);
      if (!doc) return { deletedCount: 0 };

      const id = (doc as any).id || (doc as any)._id;
      if (mongoose.connection.readyState === 1) {
        try {
          const col = mongoose.connection.collection(collectionName);
          await col.deleteOne(sanitizeMongoFilter(filter));
        } catch (err) {
          console.warn(`[MongoDB Delete Warning] ${collectionName}:`, err);
        }
      }

      if (memoryStore[collectionName]) {
        memoryStore[collectionName] = memoryStore[collectionName].filter((r) => r.id !== id && r._id !== id);
      }

      return { deletedCount: 1 };
    },

    async deleteMany(filter: any = {}): Promise<{ deletedCount: number }> {
      if (mongoose.connection.readyState === 1) {
        try {
          const col = mongoose.connection.collection(collectionName);
          const res = await col.deleteMany(sanitizeMongoFilter(filter));
          return { deletedCount: res.deletedCount || 0 };
        } catch (err) {
          console.warn(`[MongoDB DeleteMany Warning] ${collectionName}:`, err);
        }
      }

      const initialCount = (memoryStore[collectionName] || []).length;
      if (Object.keys(filter).length === 0) {
        memoryStore[collectionName] = [];
        return { deletedCount: initialCount };
      }

      memoryStore[collectionName] = (memoryStore[collectionName] || []).filter(
        (row) => !matchMongoFilter(row, filter)
      );
      const deletedCount = initialCount - memoryStore[collectionName].length;
      return { deletedCount };
    },

    async countDocuments(filter: any = {}): Promise<number> {
      if (mongoose.connection.readyState === 1) {
        try {
          const col = mongoose.connection.collection(collectionName);
          return await col.countDocuments(sanitizeMongoFilter(filter));
        } catch (err) {
          console.warn(`[MongoDB Count Warning] ${collectionName}:`, err);
        }
      }
      const list = await this.find(filter).exec();
      return list.length;
    },

    async distinct(field: string, filter: any = {}): Promise<any[]> {
      const docs = await this.find(filter).exec();
      const set = new Set();
      docs.forEach((d: any) => {
        if (d[field] !== undefined) set.add(d[field]);
      });
      return Array.from(set);
    },

    async aggregate(pipeline: any[]): Promise<any[]> {
      if (mongoose.connection.readyState === 1) {
        try {
          const col = mongoose.connection.collection(collectionName);
          return await col.aggregate(pipeline).toArray();
        } catch (err) {
          console.warn(`[MongoDB Aggregate Warning] ${collectionName}:`, err);
        }
      }
      return [];
    },

    async insertMany(docs: any[]): Promise<any[]> {
      return this.create(docs);
    },
  };
}

// Alias for existing imports
export const createSQLModel = createMongoModel;

function wrapMongoInstance(collectionName: string, data: any): any {
  if (!data) return data;
  const instance = { ...data };

  // Ensure both _id and id are accessible
  if (instance._id && !instance.id) instance.id = instance._id;
  if (instance.id && !instance._id) instance._id = instance.id;

  instance.toObject = () => ({ ...instance });
  instance.toJSON = () => ({ ...instance });
  instance.save = async () => {
    instance.updatedAt = new Date();
    if (mongoose.connection.readyState === 1) {
      try {
        const col = mongoose.connection.collection(collectionName);
        await col.updateOne({ _id: instance._id }, { $set: instance }, { upsert: true });
      } catch (err) {
        console.warn(`[MongoDB Save Warning] ${collectionName}:`, err);
      }
    }
    if (memoryStore[collectionName]) {
      const idx = memoryStore[collectionName].findIndex(
        (r) => r._id === instance._id || r.id === instance.id
      );
      if (idx >= 0) memoryStore[collectionName][idx] = { ...instance };
      else memoryStore[collectionName].push({ ...instance });
    }
    return instance;
  };

  return instance;
}

function sanitizeMongoFilter(filter: any): any {
  if (!filter || typeof filter !== 'object') return {};
  const cleaned: any = {};
  for (const [k, v] of Object.entries(filter)) {
    if (k === 'id' && !filter._id) {
      cleaned._id = v;
    } else {
      cleaned[k] = v;
    }
  }
  return cleaned;
}

function matchMongoFilter(doc: any, filter: any): boolean {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, target] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(target)) {
      return target.some((f) => matchMongoFilter(doc, f));
    }
    if (key === '$and' && Array.isArray(target)) {
      return target.every((f) => matchMongoFilter(doc, f));
    }

    let val = doc[key];
    if (val === undefined) {
      if (key === 'id') val = doc._id || doc.id;
      else if (key === '_id') val = doc.id || doc._id;
      else if (key === 'hospitalId') val = doc.hospitalid || doc.hospital_id;
      else if (key === 'patientId') val = doc.patientid || doc.patient_id;
    }

    if (target && typeof target === 'object' && !Array.isArray(target)) {
      const tAny = target as any;
      if (tAny.$in && Array.isArray(tAny.$in)) {
        if (!tAny.$in.includes(val)) return false;
      } else if (tAny.$ne !== undefined) {
        if (val === tAny.$ne) return false;
      } else if (tAny.$regex) {
        const reg = new RegExp(tAny.$regex, tAny.$options || 'i');
        if (!reg.test(String(val || ''))) return false;
      }
    } else {
      if (String(val ?? '').toLowerCase() !== String(target ?? '').toLowerCase()) {
        return false;
      }
    }
  }

  return true;
}
