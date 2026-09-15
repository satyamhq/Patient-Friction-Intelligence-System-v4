import { createSQLModel } from '../database/sqlModel.js';

export type EscalationType = 'CLINICAL_CONCERN' | 'HIGH_ACCESS_PRIORITY';

export interface IEscalation {
  _id?: string;
  id?: string;
  workerId: string;
  workerName: string;
  patientId: string;
  patientName: string;
  householdId?: string;
  villageName: string;
  type: EscalationType;
  urgency: 'Medium' | 'High' | 'Emergency';
  reason: string;
  reportedObservations?: string; // non-clinical observations reported by worker
  routedToRole: 'Doctor' | 'Medical Officer' | 'Hospital Admin' | 'Block Health Officer';
  routedToFacility?: string;
  clinicalReviewStatus?: 'Pending Review' | 'Under Clinical Evaluation' | 'Action Planned' | 'Resolved';
  clinicalNotes?: string; // only filled by authorized clinical team
  status: 'Open' | 'In Review' | 'Resolved' | 'Dispatched';
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const Escalation: any = createSQLModel<IEscalation>('escalations');
