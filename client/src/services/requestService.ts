import { api } from './api';
import { HospitalRequest } from '../types';

export interface CreateRequestPayload {
  hospitalId: string;
  departmentName: string;
  reasonForVisit: string;
  preferredDate: string;
  preferredTimeSlot?: string;
  additionalMessage?: string;
  documentIds?: string[];
  dataShared?: string[];
  consentAgreed: boolean;
  needsAmbulance?: boolean;
  needsCareEscort?: boolean;
  pickupAddress?: string;
}

export const requestService = {
  async createRequest(payload: CreateRequestPayload): Promise<{
    success: boolean;
    message: string;
    request: HospitalRequest;
    consent: any;
  }> {
    const res = await api.post('/requests', payload);
    return res.data;
  },

  async getPatientRequests(): Promise<{
    success: boolean;
    count: number;
    requests: HospitalRequest[];
  }> {
    const res = await api.get('/requests/patient');
    return res.data;
  },

  async getHospitalRequests(statusTab?: string): Promise<{
    success: boolean;
    count: number;
    requests: HospitalRequest[];
  }> {
    const res = await api.get('/requests/hospital', {
      params: { status: statusTab },
    });
    return res.data;
  },

  async getById(id: string): Promise<{ success: boolean; request: HospitalRequest }> {
    const res = await api.get(`/requests/${id}`);
    return res.data;
  },

  async updateStatus(
    id: string,
    status: string,
    hospitalNotes?: string,
    appointmentDateTime?: string
  ): Promise<{ success: boolean; request: HospitalRequest }> {
    const res = await api.patch(`/requests/${id}/status`, {
      status,
      hospitalNotes,
      appointmentDateTime,
    });
    return res.data;
  },
};
