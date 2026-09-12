import { api } from './api';

export interface ClinicalAlert {
  id: string;
  patientName: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  suggestedAction: string;
  createdAt: string;
}

export interface ConsultationRecord {
  id?: string;
  doctorId?: string;
  doctorName?: string;
  patientId: string;
  patientName: string;
  symptoms: string;
  diagnosis: string;
  prescription: Array<{ medicine: string; dosage: string; frequency: string; duration: string }>;
  labTests: string[];
  followUpDays: number;
  referralHospital?: string;
  createdAt?: string;
}

export const doctorService = {
  async getProfile(): Promise<{ success: boolean; profile: any }> {
    const res = await api.get('/doctors/profile/me');
    return res.data;
  },

  async updateProfile(data: any): Promise<{ success: boolean; profile: any }> {
    const res = await api.put('/doctors/profile/me', data);
    return res.data;
  },

  async getPatients(): Promise<{ success: boolean; count: number; patients: any[] }> {
    const res = await api.get('/doctors/patients');
    return res.data;
  },

  async getDashboardStats(): Promise<{ success: boolean; stats: any }> {
    const res = await api.get('/doctors/dashboard');
    return res.data;
  },

  async recordConsultation(data: ConsultationRecord): Promise<{ success: boolean; message: string; consultation: any }> {
    const res = await api.post('/doctors/consultation', data);
    return res.data;
  },

  async getClinicalAlerts(): Promise<{ success: boolean; count: number; alerts: ClinicalAlert[] }> {
    const res = await api.get('/doctors/clinical-alerts');
    return res.data;
  },
};
