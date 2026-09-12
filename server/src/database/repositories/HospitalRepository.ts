import { getDB } from '../db.js';
import crypto from 'crypto';

export interface HospitalEntity {
  id: string;
  name: string;
  type: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  total_beds: number;
  available_beds: number;
  emergency_24x7: boolean;
  teleconsult_available: boolean;
  accessibility_facilities: string;
  created_at?: string;
  updated_at?: string;
  // Computed distance
  distanceKm?: number;
}

export interface HospitalServiceEntity {
  id: string;
  hospital_id: string;
  name: string;
  department: string;
  total_daily_tokens: number;
  available_tokens: number;
  fee: number;
  is_active: boolean;
  created_at?: string;
}

export class HospitalRepository {
  static async findAll(): Promise<HospitalEntity[]> {
    const db = getDB();
    const res = await db.query<HospitalEntity>('SELECT * FROM hospitals ORDER BY name ASC');
    return res.rows;
  }

  static async findById(id: string): Promise<HospitalEntity | null> {
    const db = getDB();
    const res = await db.query<HospitalEntity>('SELECT * FROM hospitals WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  }

  static async create(hosp: Omit<HospitalEntity, 'id'> & { id?: string }): Promise<HospitalEntity> {
    const db = getDB();
    const id = hosp.id || crypto.randomUUID();
    const now = new Date().toISOString();

    await db.query(
      'INSERT INTO hospitals (id, name, type, city, address, latitude, longitude, phone, total_beds, available_beds, emergency_24x7, teleconsult_available, accessibility_facilities, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)',
      [
        id,
        hosp.name,
        hosp.type || 'General',
        hosp.city,
        hosp.address,
        hosp.latitude,
        hosp.longitude,
        hosp.phone || '',
        hosp.total_beds ?? 100,
        hosp.available_beds ?? 25,
        hosp.emergency_24x7 ?? true,
        hosp.teleconsult_available ?? true,
        hosp.accessibility_facilities || 'Wheelchair Ramp, Ground Floor OPD, Simple Signage',
        now,
        now,
      ]
    );

    return {
      id,
      ...hosp,
      created_at: now,
      updated_at: now,
    };
  }

  static async findNearby(
    lat: number,
    lng: number,
    radiusKm: number = 25,
    typeFilter: string = 'All',
    emergencyOnly: boolean = false
  ): Promise<HospitalEntity[]> {
    const all = await this.findAll();

    // Haversine formula calculation
    const toRad = (v: number) => (v * Math.PI) / 180;
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371; // Earth's radius in km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c * 10) / 10;
    };

    let filtered = all.map((h) => {
      const distanceKm = calculateDistance(lat, lng, Number(h.latitude), Number(h.longitude));
      return {
        ...h,
        distanceKm,
      };
    });

    if (typeFilter && typeFilter !== 'All') {
      filtered = filtered.filter((h) => h.type.toLowerCase().includes(typeFilter.toLowerCase()));
    }

    if (emergencyOnly) {
      filtered = filtered.filter((h) => h.emergency_24x7);
    }

    // Filter within radius
    const withinRadius = filtered.filter((h) => (h.distanceKm ?? 9999) <= radiusKm);
    withinRadius.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

    // Fallback: If 0 found within radius, return closest facilities
    if (withinRadius.length === 0) {
      filtered.sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
      return filtered.slice(0, 10);
    }

    return withinRadius;
  }

  static async getServices(hospitalId: string): Promise<HospitalServiceEntity[]> {
    const db = getDB();
    const res = await db.query<HospitalServiceEntity>(
      'SELECT * FROM hospital_services WHERE hospital_id = $1',
      [hospitalId]
    );
    return res.rows;
  }

  static async getServicesByHospital(hospitalId: string): Promise<HospitalServiceEntity[]> {
    return this.getServices(hospitalId);
  }

  static async addService(service: Omit<HospitalServiceEntity, 'id'> & { id?: string }): Promise<HospitalServiceEntity> {
    const db = getDB();
    const id = service.id || crypto.randomUUID();
    const now = new Date().toISOString();

    await db.query(
      'INSERT INTO hospital_services (id, hospital_id, name, department, total_daily_tokens, available_tokens, fee, is_active, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [
        id,
        service.hospital_id,
        service.name,
        service.department,
        service.total_daily_tokens ?? 50,
        service.available_tokens ?? 20,
        service.fee ?? 0.0,
        service.is_active ?? true,
        now,
      ]
    );

    return {
      id,
      ...service,
      created_at: now,
    };
  }

  static async count(): Promise<number> {
    const db = getDB();
    const res = await db.query<HospitalEntity>('SELECT * FROM hospitals');
    return res.rows.length;
  }
}
