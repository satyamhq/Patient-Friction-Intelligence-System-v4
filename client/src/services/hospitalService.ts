import { api } from './api';
import { Hospital, HospitalDepartment } from '../types';

export interface NearbyQuery {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  type?: string;
  emergency?: boolean;
  department?: string;
  search?: string;
}

export const hospitalService = {
  async getNearby(params: NearbyQuery): Promise<{
    success: boolean;
    count: number;
    userLocation: { latitude: number; longitude: number };
    isAdaptiveProximity?: boolean;
    adaptiveMessage?: string;
    hospitals: Hospital[];
  }> {
    const res = await api.get('/hospitals/nearby', { params });
    return res.data;
  },

  async getById(
    id: string,
    coords?: { lat?: number; lng?: number }
  ): Promise<{
    success: boolean;
    hospital: Hospital;
    departments: HospitalDepartment[];
    distanceKm: number;
    estimatedTravelTimeMinutes: number;
  }> {
    const res = await api.get(`/hospitals/${id}`, { params: coords });
    return res.data;
  },

  async search(query: string): Promise<{ success: boolean; hospitals: Hospital[] }> {
    const res = await api.get('/hospitals/search', { params: { q: query } });
    return res.data;
  },

  async getMyProfile(): Promise<{
    success: boolean;
    hospital: Hospital;
    departments: HospitalDepartment[];
  }> {
    const res = await api.get('/hospitals/profile/me');
    return res.data;
  },

  async updateMyProfile(data: Partial<Hospital>): Promise<{ success: boolean; hospital: Hospital }> {
    const res = await api.put('/hospitals/profile/me', data);
    return res.data;
  },

  async addDepartment(data: any): Promise<{ success: boolean; department: HospitalDepartment; message: string }> {
    const res = await api.post('/hospitals/departments', data);
    return res.data;
  },

  async updateDepartment(deptId: string, data: any): Promise<{ success: boolean; department: HospitalDepartment; message: string }> {
    const res = await api.put(`/hospitals/departments/${deptId}`, data);
    return res.data;
  },

  async deleteDepartment(deptId: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/hospitals/departments/${deptId}`);
    return res.data;
  },
};
