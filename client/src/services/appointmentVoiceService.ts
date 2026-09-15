import { api } from './api';

export interface BookVoiceAppointmentPayload {
  patientId?: string;
  patientName: string;
  patientPhone: string;
  hospitalId?: string;
  hospitalName: string;
  department: string;
  preferredDate: string;
  preferredTime: string;
  reason?: string;
  operationalNotes?: string;
  frictionBarrier?: string;
  barrierSeverity?: number;
}

export interface VoiceCallLogPayload {
  conversationId: string;
  patientId?: string;
  appointmentId?: string;
  callStatus: 'initiated' | 'in_progress' | 'completed' | 'failed' | 'dropped';
  callOutcome?: string;
  durationSeconds?: number;
  transcriptReference?: string;
  operationalBarriersIdentified?: string[];
}

export interface VoiceFrictionPayload {
  type: string;
  severity: number;
  patientId?: string;
  patientName?: string;
  notes?: string;
}

export const appointmentVoiceService = {
  // 1. Get context and directory guidelines for voice agent
  async getContextDirectory() {
    const res = await api.get('/appointments/voice-agent/context');
    return res.data;
  },

  // 2. Book appointment from Voice Assistant
  async bookAppointment(payload: BookVoiceAppointmentPayload) {
    const res = await api.post('/appointments/voice-agent/book', payload);
    return res.data;
  },

  // 3. Log Call session
  async logCall(payload: VoiceCallLogPayload) {
    const res = await api.post('/appointments/voice-agent/call-log', payload);
    return res.data;
  },

  // 4. Log identified operational friction barrier
  async recordFriction(payload: VoiceFrictionPayload) {
    const res = await api.post('/appointments/voice-agent/friction', payload);
    return res.data;
  },

  // 5. Get latest status for dashboard
  async getLatestStatus(patientId?: string) {
    const endpoint = patientId ? `/appointments/voice-agent/status/${patientId}` : '/appointments/voice-agent/status';
    const res = await api.get(endpoint);
    return res.data;
  },

  // 6. Core Appointment REST APIs (MongoDB Collection: appointments)
  async createAppointment(payload: any) {
    const res = await api.post('/appointments', payload);
    return res.data;
  },

  async callHospital(appointmentId: string, hospitalPhone?: string) {
    const res = await api.post('/appointments/call', { appointmentId, hospitalPhone });
    return res.data;
  },

  async getAppointment(id: string) {
    const res = await api.get(`/appointments/${id}`);
    return res.data;
  },

  async updateAppointment(id: string, updates: any) {
    const res = await api.patch(`/appointments/${id}`, updates);
    return res.data;
  },
};
