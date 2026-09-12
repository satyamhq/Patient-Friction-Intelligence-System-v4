import { api } from './api';
import { PatientDocument } from '../types';

export const documentService = {
  async upload(
    formData: FormData
  ): Promise<{ success: boolean; message: string; document: PatientDocument }> {
    const res = await api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async getPatientDocuments(): Promise<{
    success: boolean;
    count: number;
    documents: PatientDocument[];
  }> {
    const res = await api.get('/documents');
    return res.data;
  },

  async deleteDocument(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },

  getDocumentViewUrl(id: string): string {
    return `/api/documents/${id}/file`;
  },
};
