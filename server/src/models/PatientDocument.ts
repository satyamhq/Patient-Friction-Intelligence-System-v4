import { createSQLModel } from '../database/sqlModel.js';

export type DocumentType = 'Prescription' | 'Medical Report' | 'Referral' | 'ID Card' | 'Other';

export interface IPatientDocument {
  _id?: any;
  id?: any;
  patientId: any;
  title: string;
  type: DocumentType | string;
  originalFilename: string;
  storedFilename?: string;
  filePath: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedAt?: Date | string;
  notes?: string;
  isArchived?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const PatientDocument: any = createSQLModel<IPatientDocument>('documents');
