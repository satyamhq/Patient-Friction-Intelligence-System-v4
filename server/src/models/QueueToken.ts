import { createSQLModel } from '../database/sqlModel.js';

export interface IQueueToken {
  _id?: string;
  id?: string;
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
  issueTime: Date | string;
  servedTime?: Date | string;
  completedTime?: Date | string;
  save?: () => Promise<any>;
}

export const QueueToken: any = createSQLModel<IQueueToken>('queue_tokens');
