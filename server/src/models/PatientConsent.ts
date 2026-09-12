import { createSQLModel } from '../database/sqlModel.js';

export interface IPatientConsent {
  _id?: string;
  id?: string;
  patientId: string;
  scope: 'EHR_FULL' | 'DOCTOR_CONSULT' | 'HOSPITAL_TRIAGE' | 'RESEARCH_ANALYTICS' | 'GOVERNMENT_AUDIT';
  recipientName: string;
  purpose: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  validUntil: Date | string;
  createdAt: Date | string;
  save?: () => Promise<any>;
}

export const PatientConsent: any = createSQLModel<IPatientConsent>('patient_consents');
