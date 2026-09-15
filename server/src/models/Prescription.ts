import { createSQLModel } from '../database/sqlModel.js';

export interface IPrescriptionItem {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface IPrescription {
  _id?: string;
  id?: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  tokenNumber?: string;
  consultationId?: string;
  items: IPrescriptionItem[] | string; // stored as JSON string in embedded DB
  clinicalNotes?: string;
  assessment?: string;
  plan?: string;
  status: 'Draft' | 'Confirmed' | 'Issued';
  issuedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const Prescription: any = createSQLModel<IPrescription>('doctor_prescriptions');
