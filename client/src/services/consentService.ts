import { api } from './api';

export interface PatientConsentItem {
  id?: string;
  _id?: string;
  patientId: string;
  scope: string;
  recipientName: string;
  purpose: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  validUntil: string;
  createdAt: string;
}

export const consentService = {
  async getMyConsents(): Promise<{ success: boolean; count: number; consents: PatientConsentItem[] }> {
    const res = await api.get('/consents/my');
    return res.data;
  },

  async grantConsent(data: {
    scope: string;
    recipientName: string;
    purpose: string;
    durationMonths?: number;
  }): Promise<{ success: boolean; message: string; consent: PatientConsentItem }> {
    const res = await api.post('/consents/grant', data);
    return res.data;
  },

  async revokeConsent(id: string): Promise<{ success: boolean; message: string; consent: PatientConsentItem }> {
    const res = await api.put(`/consents/${id}/revoke`);
    return res.data;
  },
};
