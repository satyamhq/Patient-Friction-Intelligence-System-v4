import { api } from './api';
import { Patient, FrictionProfile, FrictionInteraction, CareRisk } from '../types';

export const patientService = {
  async getMe(): Promise<{ success: boolean; patient: Patient; activeRequests: any[] }> {
    const res = await api.get('/patients/me');
    return res.data;
  },

  async updateProfile(data: Partial<Patient>): Promise<{
    success: boolean;
    patient: Patient;
    frictionProfile: FrictionProfile;
    careRisk: CareRisk;
    interactions: FrictionInteraction[];
  }> {
    const res = await api.put('/patients/me', data);
    return res.data;
  },

  async getFrictionProfile(): Promise<{
    success: boolean;
    frictionProfile: FrictionProfile;
    interactions: FrictionInteraction[];
  }> {
    const res = await api.get('/patients/me/friction');
    return res.data;
  },

  async getAccessibilityRisk(): Promise<{ success: boolean; careRisk: CareRisk }> {
    const res = await api.get('/patients/me/risk');
    return res.data;
  },

  async getCareJourney(): Promise<{ success: boolean; careJourney: any }> {
    const res = await api.get('/patients/me/journey');
    return res.data;
  },
};
