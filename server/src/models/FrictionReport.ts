import { createSQLModel } from '../database/sqlModel.js';

export interface IFrictionReport {
  _id?: string;
  id?: string;
  reportId?: string;
  patientId: string;
  patientName: string;
  hospitalId?: string;
  hospitalName?: string;
  category:
    | 'WAITING_TIME'
    | 'DOCTOR_UNAVAILABLE'
    | 'MEDICINE_STOCKOUT'
    | 'STAFF_BEHAVIOR'
    | 'REGISTRATION_ISSUE'
    | 'FACILITY_ACCESSIBILITY'
    | 'UNEXPECTED_COST'
    | 'NAVIGATION_ISSUE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'ACTION_TAKEN' | 'RESOLVED' | 'PENDING' | 'INVESTIGATING';
  resolutionNotes?: string;
  createdAt: Date | string;
  save?: () => Promise<any>;
}

export const FrictionReport: any = createSQLModel<IFrictionReport>('friction_reports');
