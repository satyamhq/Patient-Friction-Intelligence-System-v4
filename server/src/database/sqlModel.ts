import crypto from 'crypto';
import { getDB } from './db.js';

export class SQLQuery<T = any> {
  private tableName: string;
  private filter: any;
  private sortObj: any = null;
  private limitNum: number | null = null;
  private skipNum: number | null = null;
  private populateList: { path: string; select?: string }[] = [];

  constructor(tableName: string, filter: any = {}) {
    this.tableName = tableName;
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

  populate(path: string, select?: string): this {
    this.populateList.push({ path, select });
    return this;
  }

  select(_fields: any): this {
    return this;
  }

  async exec(): Promise<T[]> {
    const db = getDB();
    const res = await db.query(`SELECT * FROM ${this.tableName}`);
    let rows = (res.rows || []).map((r) => wrapModelInstance(this.tableName, r));

    // Apply in-memory filter matching for complex/mongo-like filters
    if (this.filter && Object.keys(this.filter).length > 0) {
      rows = rows.filter((row) => matchFilter(row, this.filter));
    }

    // Apply sorting
    if (this.sortObj) {
      const entries = Object.entries(this.sortObj);
      rows.sort((a, b) => {
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

    // Apply skip & limit
    if (this.skipNum && this.skipNum > 0) {
      rows = rows.slice(this.skipNum);
    }
    if (this.limitNum && this.limitNum > 0) {
      rows = rows.slice(0, this.limitNum);
    }

    // Apply populates (foreign keys)
    for (const pop of this.populateList) {
      const targetTable = resolveForeignTable(pop.path);
      if (targetTable) {
        for (const row of rows) {
          const foreignKeyVal = row[pop.path];
          if (foreignKeyVal) {
            // Find target record in foreign table
            const fRes = await db.query(`SELECT * FROM ${targetTable}`);
            const fMatch = (fRes.rows || []).find(
              (fr) => fr.id === foreignKeyVal || fr._id === foreignKeyVal
            );
            if (fMatch) {
              row[pop.path] = wrapModelInstance(targetTable, fMatch);
            }
          }
        }
      }
    }

    return rows as T[];
  }

  then<TResult1 = T[], TResult2 = never>(
    onfulfilled?: ((value: T[]) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

function resolveForeignTable(path: string): string | null {
  const p = path.toLowerCase();
  if (p.includes('user')) return 'users';
  if (p.includes('patient')) return 'patient_profiles';
  if (p.includes('hospital')) return 'hospitals';
  if (p.includes('friction') || p.includes('profile')) return 'friction_profiles';
  if (p.includes('risk')) return 'accessibility_risks';
  if (p.includes('document')) return 'documents';
  if (p.includes('request')) return 'requests';
  return null;
}

function wrapModelInstance(tableName: string, raw: any): any {
  if (!raw) return null;
  const instance = { ...raw };

  // Ensure both _id and id are accessible
  const actualId = instance.id || instance._id || crypto.randomUUID();
  instance._id = actualId;
  instance.id = actualId;

  // Auto-mirror snake_case to camelCase
  for (const [k, v] of Object.entries(raw)) {
    if (k.includes('_')) {
      const camel = k.replace(/_([a-z0-9])/g, (_, g) => g.toUpperCase());
      if (instance[camel] === undefined) {
        instance[camel] = v;
      }
    }
  }

  // Domain-specific lowercase SQL column mappings to standard camelCase
  const keyMap: Record<string, string> = {
    overallfrictionscore: 'overallFrictionScore',
    overallaccessibilityscore: 'overallAccessibilityScore',
    frictionlevel: 'frictionLevel',
    digitalaccess: 'digitalAccess',
    familysupport: 'familySupport',
    appointmenttiming: 'appointmentTiming',
    topbarrier: 'topBarrier',
    secondarybarrier: 'secondaryBarrier',
    emergencyavailable: 'emergencyAvailable',
    emergencyphone: 'emergencyPhone',
    workinghours: 'workingHours',
    totalbeds: 'totalBeds',
    availablebeds: 'availableBeds',
    specialistavailable: 'specialistAvailable',
    diagnosticfacilities: 'diagnosticFacilities',
    languagessupported: 'languagesSupported',
    averagewaittimeminutes: 'averageWaitTimeMinutes',
    ambulanceservice: 'ambulanceService',
    careescortservice: 'careEscortService',
    patientcode: 'patientCode',
    preferredlanguage: 'preferredLanguage',
    emergencycontactname: 'emergencyContactName',
    emergencycontactphone: 'emergencyContactPhone',
    transportavailability: 'transportAvailability',
    digitalaccesslevel: 'digitalAccessLevel',
    documentationstatus: 'documentationStatus',
    financialaccessibility: 'financialAccessibility',
    appointmentflexibility: 'appointmentFlexibility',
    residencetype: 'residenceType',
    headdoctorname: 'headDoctorName',
    opddays: 'opdDays',
    opdtimings: 'opdTimings',
    dailytokencapacity: 'dailyTokenCapacity',
    availabletokenstoday: 'availableTokensToday',
    consultationfee: 'consultationFee',
    isacceptingrequests: 'isAcceptingRequests',
    passwordhash: 'passwordHash',
    password_hash: 'passwordHash',
    userid: 'userId',
    user_id: 'userId',
    patientid: 'patientId',
    patient_id: 'patientId',
    hospitalid: 'hospitalId',
    hospital_id: 'hospitalId',
    createdat: 'createdAt',
    created_at: 'createdAt',
    updatedat: 'updatedAt',
    updated_at: 'updatedAt',
    currentstageindex: 'currentStageIndex',
    current_stage_index: 'currentStageIndex',
    overalljourneyhealth: 'overallJourneyHealth',
    overall_journey_health: 'overallJourneyHealth',
    primaryriskfactors: 'primaryRiskFactors',
    primary_risk_factors: 'primaryRiskFactors',
    mitigationpathways: 'mitigationPathways',
    mitigation_pathways: 'mitigationPathways',
    bottleneckstage: 'bottleneckStage',
    bottleneck_stage: 'bottleneckStage',
    carecompletionprobability: 'careCompletionProbability',
    accessibilityriskpercentage: 'accessibilityRiskPercentage',
    riskcategory: 'riskCategory',
    frictionprofileid: 'frictionProfileId',
  };

  for (const [lowerK, camelK] of Object.entries(keyMap)) {
    if (instance[lowerK] !== undefined && instance[camelK] === undefined) {
      instance[camelK] = instance[lowerK];
    }
    if (instance[camelK] !== undefined && instance[lowerK] === undefined) {
      instance[lowerK] = instance[camelK];
    }
  }

  // Parse JSON string fields safely
  const jsonFields = [
    'diagnosticFacilities',
    'languagesSupported',
    'ambulanceService',
    'careEscortService',
    'careAttendantService',
    'location',
    'opdDays',
    'travel',
    'transport',
    'digitalAccess',
    'language',
    'familySupport',
    'documentation',
    'cost',
    'appointmentTiming',
    'topBarrier',
    'secondaryBarrier',
    // Request fields stored as JSON strings in SQLite
    'timeline',
    'ambulanceBooking',
    'careEscortBooking',
    'treatedConditions',
    'vitals_json',
    'prescription_json',
    'geoJSON',
    'dataShared',
    'documentIds',
    'stages',
    'primaryRiskFactors',
    'mitigationPathways',
    'primaryriskfactors',
    'mitigationpathways',
  ];

  for (const f of jsonFields) {
    if (typeof instance[f] === 'string' && (instance[f].startsWith('{') || instance[f].startsWith('['))) {
      try {
        instance[f] = JSON.parse(instance[f]);
      } catch {}
    }
  }

  // Parse any remaining stringified JSON arrays or objects on the instance
  for (const k of Object.keys(instance)) {
    if (
      typeof instance[k] === 'string' &&
      (instance[k].startsWith('{') || instance[k].startsWith('['))
    ) {
      try {
        instance[k] = JSON.parse(instance[k]);
      } catch {}
    }
  }

  // Safe defaults for hospital arrays & booleans
  if (tableName === 'hospitals') {
    if (!instance.languagesSupported || !Array.isArray(instance.languagesSupported)) {
      instance.languagesSupported = ['Hindi', 'Punjabi', 'English'];
    }
    if (!instance.diagnosticFacilities || !Array.isArray(instance.diagnosticFacilities)) {
      instance.diagnosticFacilities = [
        '24/7 Emergency Triage',
        'Digital X-Ray',
        'Pathology Lab',
        'ECG & Cardiac Care',
        'Ultrasound Sonography',
      ];
    }
    if (instance.emergencyAvailable === undefined) {
      instance.emergencyAvailable = true;
    }
  }

  // Safe defaults and rich metadata for hospital clinical departments (hospital_services)
  if (tableName === 'hospital_services') {
    if (!instance.opdDays || !Array.isArray(instance.opdDays)) {
      instance.opdDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    }
    if (!instance.opdTimings) {
      instance.opdTimings = '09:00 AM - 02:00 PM';
    }
    if (instance.availableTokensToday === undefined) {
      instance.availableTokensToday = instance.available_tokens ?? 25;
    }
    if (instance.dailyTokenCapacity === undefined) {
      instance.dailyTokenCapacity = instance.total_daily_tokens ?? 50;
    }
    if (instance.consultationFee === undefined) {
      instance.consultationFee = instance.fee ?? 0;
    }
    // Prioritize actual doctor name from database fields
    instance.headDoctorName =
      instance.headDoctorName ||
      instance.head_doctor_name ||
      instance.headdoctorname ||
      'Senior Clinical Consultant';

    if (!instance.treatedConditions || !Array.isArray(instance.treatedConditions)) {
      const deptName = (instance.name || instance.department || '').toLowerCase();
      if (deptName.includes('cardio') || deptName.includes('heart')) {
        instance.treatedConditions = [
          'Acute Chest Pain & Angina',
          'Heart Attack Emergency',
          'High Blood Pressure / Hypertension',
          'Heart Failure & Palpitations',
          'Coronary Artery Disease',
          'Cholesterol & Lipid Management',
        ];
      } else if (deptName.includes('ortho') || deptName.includes('joint')) {
        instance.treatedConditions = [
          'Knee & Joint Arthritis',
          'Bone Fractures & Accident Trauma',
          'Slipped Disc & Sciatica',
          'Joint & Knee Replacement Care',
          'Chronic Back & Neck Pain',
          'Ligament Tears & Sports Injury',
        ];
      } else if (deptName.includes('pediatric') || deptName.includes('child')) {
        instance.treatedConditions = [
          'Pediatric Viral Fevers & Dengue',
          'Childhood Pneumonia & Asthma',
          'Newborn & Infant Jaundice',
          'Routine Child Vaccinations',
          'Malnutrition & Growth Milestones',
        ];
      } else if (deptName.includes('gynae') || deptName.includes('maternity') || deptName.includes('obs')) {
        instance.treatedConditions = [
          'Normal & Cesarean Delivery',
          'High-Risk Pregnancy Care',
          'PCOS / PCOD Hormonal Care',
          'Antenatal Regular Sonography',
          'Anemia & Iron Deficiency',
        ];
      } else {
        instance.treatedConditions = [
          'Viral Fever, Dengue & Malaria',
          'Diabetes Mellitus Type 1 & 2',
          'High BP & Hypertension Management',
          'Respiratory Infections & Asthma',
          'Typhoid & Gastrointestinal Care',
          'Geriatric Elderly Health Checks',
        ];
      }
    }
  }

  instance.toObject = function () {
    return { ...this };
  };
  instance.toJSON = function () {
    return { ...this };
  };

  instance.save = async function () {
    const db = getDB();
    const now = new Date().toISOString();
    this.updated_at = now;
    this.updatedAt = now;

    // Check if exists
    const checkRes = await db.query(`SELECT * FROM ${tableName} WHERE id = $1 LIMIT 1`, [this.id]);
    if (checkRes.rows && checkRes.rows.length > 0) {
      // Update
      const keys = Object.keys(this).filter(
        (k) => !['id', '_id', 'save', 'toObject', 'toJSON'].includes(k) && typeof this[k] !== 'function'
      );
      const setClauses = keys.map((k, idx) => `${k} = $${idx + 1}`).join(', ');
      const params = keys.map((k) => (typeof this[k] === 'object' && this[k] !== null ? JSON.stringify(this[k]) : this[k]));
      params.push(this.id);
      await db.query(`UPDATE ${tableName} SET ${setClauses} WHERE id = $${params.length}`, params);
    } else {
      // Insert
      const keys = Object.keys(this).filter(
        (k) => !['save', 'toObject', 'toJSON'].includes(k) && typeof this[k] !== 'function'
      );
      const colNames = keys.join(', ');
      const placeholders = keys.map((_, idx) => `$${idx + 1}`).join(', ');
      const params = keys.map((k) => (typeof this[k] === 'object' && this[k] !== null ? JSON.stringify(this[k]) : this[k]));
      await db.query(`INSERT INTO ${tableName} (${colNames}) VALUES (${placeholders})`, params);
    }
    return this;
  };

  instance.toObject = function () {
    const copy: any = {};
    for (const key of Object.keys(this)) {
      if (typeof this[key] !== 'function') {
        copy[key] = this[key];
      }
    }
    return copy;
  };

  instance.toJSON = function () {
    return this.toObject();
  };

  return instance;
}

function matchFilter(row: any, filter: any): boolean {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, val] of Object.entries(filter)) {
    if (key === '$or' && Array.isArray(val)) {
      const matchesAny = val.some((subFilter) => matchFilter(row, subFilter));
      if (!matchesAny) return false;
      continue;
    }

    if (key === '$and' && Array.isArray(val)) {
      const matchesAll = val.every((subFilter) => matchFilter(row, subFilter));
      if (!matchesAll) return false;
      continue;
    }

    // Resolving rowVal across camelCase, lowercase, and snake_case
    let rowVal = row[key];
    if (rowVal === undefined) {
      const lower = key.toLowerCase();
      const snake = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      if (row[lower] !== undefined) rowVal = row[lower];
      else if (row[snake] !== undefined) rowVal = row[snake];
      else if (key === '_id') rowVal = row.id;
      else if (key === 'id') rowVal = row._id;
    }

    // Boolean equality matching (supporting 1, 0, '1', '0', 'true', 'false', true, false)
    if (typeof val === 'boolean') {
      const bRow = rowVal === true || rowVal === 1 || rowVal === '1' || rowVal === 'true';
      if (bRow !== val) return false;
      continue;
    }

    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof RegExp) && !(val instanceof Date)) {
      // Operator filters like $in, $ne, $gte, $lte, $regex
      if ('$in' in val && Array.isArray(val.$in)) {
        if (!val.$in.includes(rowVal)) return false;
      }
      if ('$ne' in val) {
        if (rowVal === val.$ne) return false;
      }
      if ('$gte' in val) {
        if (Number(rowVal) < Number(val.$gte)) return false;
      }
      if ('$lte' in val) {
        if (Number(rowVal) > Number(val.$lte)) return false;
      }
      if ('$gt' in val) {
        if (Number(rowVal) <= Number(val.$gt)) return false;
      }
      if ('$lt' in val) {
        if (Number(rowVal) >= Number(val.$lt)) return false;
      }
      if ('$regex' in val) {
        const regex = new RegExp((val as any).$regex, (val as any).$options || 'i');
        if (!regex.test(String(rowVal || ''))) return false;
      }
      continue;
    }

    if (val instanceof RegExp) {
      if (!val.test(String(rowVal || ''))) return false;
      continue;
    }

    // Direct equality
    if (String(rowVal).toLowerCase() !== String(val).toLowerCase()) {
      return false;
    }
  }

  return true;
}

export class SingleSQLQuery<T = any> {
  private query: SQLQuery<T>;

  constructor(tableName: string, filter: any = {}) {
    this.query = new SQLQuery<T>(tableName, filter);
  }

  sort(sortObj: any): this {
    this.query.sort(sortObj);
    return this;
  }

  populate(path: string, select?: string): this {
    this.query.populate(path, select);
    return this;
  }

  select(fields: any): this {
    this.query.select(fields);
    return this;
  }

  async exec(): Promise<T | null> {
    const results = await this.query.exec();
    return results[0] || null;
  }

  then<TResult1 = T | null, TResult2 = never>(
    onfulfilled?: ((value: T | null) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

export function createSQLModel<T = any>(tableName: string) {
  return class Model {
    static find(filter: any = {}): any {
      return new SQLQuery<T>(tableName, filter);
    }

    static findOne(filter: any = {}): any {
      return new SingleSQLQuery<T>(tableName, filter);
    }

    static findById(id: string): any {
      return new SingleSQLQuery<T>(tableName, { $or: [{ id }, { _id: id }] });
    }

    static async create(data: any): Promise<any> {
      const id = data.id || data._id || crypto.randomUUID();
      const now = new Date().toISOString();
      const raw = {
        ...data,
        id,
        _id: id,
        created_at: now,
        createdAt: now,
        updated_at: now,
        updatedAt: now,
      };
      const instance = wrapModelInstance(tableName, raw);
      await instance.save();
      return instance;
    }

    static async insertMany(items: any[]): Promise<any[]> {
      if (!Array.isArray(items) || items.length === 0) return [];
      const instances = [];
      for (const item of items) {
        instances.push(await this.create(item));
      }
      return instances;
    }

    static async countDocuments(filter: any = {}): Promise<number> {
      const q = new SQLQuery<T>(tableName, filter);
      const results = await q.exec();
      return results.length;
    }

    static async distinct(field: string, filter: any = {}): Promise<any[]> {
      const q = new SQLQuery<T>(tableName, filter);
      const results = await q.exec();
      const set = new Set();
      results.forEach((r: any) => {
        if (r[field] !== undefined) set.add(r[field]);
      });
      return Array.from(set);
    }

    static async updateOne(filter: any, update: any): Promise<{ modifiedCount: number }> {
      const item = await this.findOne(filter);
      if (!item) return { modifiedCount: 0 };
      const patch = update.$set || update;
      Object.assign(item, patch);
      await item.save();
      return { modifiedCount: 1 };
    }

    static async updateMany(filter: any, update: any): Promise<{ modifiedCount: number }> {
      const items = await this.find(filter);
      const patch = update.$set || update;
      for (const item of items) {
        Object.assign(item, patch);
        await item.save();
      }
      return { modifiedCount: items.length };
    }

    static async deleteOne(filter: any): Promise<{ deletedCount: number }> {
      const db = getDB();
      const item = await this.findOne(filter);
      if (!item) return { deletedCount: 0 };
      await db.query(`DELETE FROM ${tableName} WHERE id = $1`, [item.id || item._id]);
      return { deletedCount: 1 };
    }

    static async findByIdAndDelete(id: string): Promise<any> {
      const db = getDB();
      const item = await this.findById(id);
      if (!item) return null;
      await db.query(`DELETE FROM ${tableName} WHERE id = $1`, [item.id || item._id]);
      return item;
    }

    static async deleteMany(filter: any = {}): Promise<{ deletedCount: number }> {
      const db = getDB();
      const items = await this.find(filter);
      for (const item of items) {
        await db.query(`DELETE FROM ${tableName} WHERE id = $1`, [item.id || item._id]);
      }
      return { deletedCount: items.length };
    }

    constructor(data: any) {
      return wrapModelInstance(tableName, data);
    }
  };
}
