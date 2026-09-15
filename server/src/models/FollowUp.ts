import { createSQLModel } from '../database/sqlModel.js';

export interface IFollowUp {
  _id?: string;
  id?: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  dueDate: string;
  reason: string;
  department?: string;
  instructions?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Upcoming' | 'Overdue' | 'Completed' | 'Missed' | 'Cancelled';
  ashaTaskCreated?: boolean;
  ashaWorkerId?: string;
  ashaWorkerName?: string;
  completedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const FollowUp: any = createSQLModel<IFollowUp>('doctor_follow_ups');
