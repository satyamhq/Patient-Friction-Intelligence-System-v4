import { api } from './api';

export interface QueueTokenData {
  id?: string;
  _id?: string;
  tokenNumber: number;
  patientId: string;
  patientName: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  doctorName?: string;
  priority: 'EMERGENCY' | 'HIGH' | 'STANDARD' | 'FOLLOW_UP';
  status: 'WAITING' | 'SERVING' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
  estimatedWaitMinutes: number;
  patientsAhead: number;
  issueTime: string;
}

export const queueService = {
  async getLiveQueue(hospitalId?: string, department?: string): Promise<{
    success: boolean;
    patientToken: QueueTokenData | null;
    currentlyServing: QueueTokenData | null;
    waitingCount: number;
    estimatedWaitMinutes: number;
    tokens: QueueTokenData[];
  }> {
    const res = await api.get('/queue/live', { params: { hospitalId, department } });
    return res.data;
  },

  async issueToken(data: {
    hospitalId?: string;
    hospitalName: string;
    department: string;
    priority?: string;
  }): Promise<{ success: boolean; message: string; token: QueueTokenData }> {
    const res = await api.post('/queue/issue', data);
    return res.data;
  },

  async callNext(tokenId?: string): Promise<{ success: boolean; message: string; token: QueueTokenData }> {
    const res = await api.post('/queue/call-next', { tokenId });
    return res.data;
  },

  async completeToken(id: string): Promise<{ success: boolean; message: string; token: QueueTokenData }> {
    const res = await api.put(`/queue/${id}/complete`);
    return res.data;
  },
};
