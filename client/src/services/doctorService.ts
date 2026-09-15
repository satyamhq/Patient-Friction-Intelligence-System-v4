import { api } from './api';

export interface ConsultationRecord {
  patientId?: string;
  patientName: string;
  symptoms: string;
  diagnosis: string;
  prescription: { medicine: string; dosage: string; frequency: string; duration: string }[];
  labTests: string[];
  followUpDays: number;
  referralHospital?: string;
}

export const doctorService = {
  // Profile
  getProfile: () => api.get('/doctors/profile/me'),
  updateProfile: (data: any) => api.put('/doctors/profile/me', data),

  // Dashboard
  getDashboard: () => api.get('/doctors/dashboard'),
  getClinicalAlerts: () => api.get('/doctors/clinical-alerts'),

  // Patients
  getPatients: () => api.get('/doctors/patients'),

  // Consultation
  recordConsultation: async (data: ConsultationRecord) => {
    const res = await api.post('/doctors/consultation', data);
    return res.data;
  },

  // OPD Queue
  getQueue: () => api.get('/doctors/queue'),
  callNext: () => api.post('/doctors/queue/call-next'),
  callToken: (id: string) => api.post(`/doctors/queue/call/${id}`),
  skipToken: (id: string) => api.put(`/doctors/queue/skip/${id}`),
  markNoShow: (id: string) => api.put(`/doctors/queue/no-show/${id}`),
  completeToken: (id: string) => api.put(`/doctors/queue/complete/${id}`),

  // Prescriptions
  getPrescriptions: () => api.get('/doctors/prescriptions'),
  createPrescription: (data: any) => api.post('/doctors/prescriptions', data),
  updatePrescriptionStatus: (id: string, status: string) =>
    api.put(`/doctors/prescriptions/${id}/status`, { status }),

  // Lab Orders
  getLabOrders: () => api.get('/doctors/lab-orders'),
  createLabOrder: (data: any) => api.post('/doctors/lab-orders', data),
  reviewLabOrder: (id: string, reviewNotes: string) =>
    api.put(`/doctors/lab-orders/${id}/review`, { reviewNotes }),

  // Referrals
  getReferrals: () => api.get('/doctors/referrals'),
  createReferral: (data: any) => api.post('/doctors/referrals', data),

  // Follow-ups
  getFollowUps: () => api.get('/doctors/follow-ups'),
  createFollowUp: (data: any) => api.post('/doctors/follow-ups', data),
  updateFollowUp: (id: string, status: string) =>
    api.put(`/doctors/follow-ups/${id}`, { status }),

  // Schedule
  getSchedule: () => api.get('/doctors/schedule'),
  updateSchedule: (data: any) => api.put('/doctors/schedule', data),

  // Notifications
  getNotifications: () => api.get('/doctors/notifications'),
};
