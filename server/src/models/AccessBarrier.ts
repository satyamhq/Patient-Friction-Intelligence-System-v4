import { createSQLModel } from '../database/sqlModel.js';

export type BarrierCategory =
  | 'TRANSPORT'
  | 'COST'
  | 'DOCUMENTATION'
  | 'LANGUAGE'
  | 'DIGITAL ACCESS'
  | 'AVAILABILITY'
  | 'OTHER';

export type AccessFrictionScore = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface IAccessBarrier {
  _id?: string;
  id?: string;
  workerId: string;
  workerName: string;
  patientId?: string;
  patientName: string;
  householdId?: string;
  villageName: string;
  category: BarrierCategory;
  barrierType: string; // Specific barrier description
  details?: string;
  frictionScore: AccessFrictionScore;
  status: 'Identified' | 'Action Plan Created' | 'Coordination In Progress' | 'Resolved';
  actionTaken?: string;
  resolutionNotes?: string;
  reportedAt?: string | Date;
  resolvedAt?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const AccessBarrier: any = createSQLModel<IAccessBarrier>('access_barriers');
