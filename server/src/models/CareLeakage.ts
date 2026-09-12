import { createSQLModel } from '../database/sqlModel.js';

export interface IFunnelMilestone {
  stageName: string;
  patientCount: number;
  retentionPercentage: number;
  dropOffCount: number;
  dropOffPercentage: number;
  primaryBarrierCausingDropOff: string;
}

export interface ICareLeakage {
  _id?: any;
  id?: any;
  cohortName: string;
  totalReferred: number;
  funnelMilestones: IFunnelMilestone[];
  highestLeakageStage: string;
  totalLeakagePercentage: number;
  observedPeriod: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const CareLeakage: any = createSQLModel<ICareLeakage>('friction_profiles');
