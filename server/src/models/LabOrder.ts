import { createSQLModel } from '../database/sqlModel.js';

export interface ILabOrder {
  _id?: string;
  id?: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  facilityId?: string;
  facilityName?: string;
  testName: string;
  category: string; // 'Pathology' | 'Radiology' | 'Cardiology' | 'Microbiology' | 'Other'
  instructions?: string;
  priority: 'Routine' | 'Urgent' | 'Emergency';
  status: 'Ordered' | 'Collected' | 'Processing' | 'Ready' | 'Reviewed' | 'Cancelled';
  isCritical?: boolean;
  reportUrl?: string;
  reportSummary?: string;
  reviewedAt?: string | Date;
  reviewNotes?: string;
  orderedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const LabOrder: any = createSQLModel<ILabOrder>('doctor_lab_orders');
