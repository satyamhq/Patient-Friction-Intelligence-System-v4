import { createSQLModel } from '../database/sqlModel.js';

export interface IAshaWorkerProfile {
  _id?: string;
  id?: string;
  userId: string;
  ashaCode?: string;
  name?: string;
  phone?: string;
  email?: string;
  zone?: string;
  district?: string;
  state?: string;
  assignedVillages?: string[];
  supervisorName?: string;
  supervisorPhone?: string;
  totalPatientsTracked?: number;
  highRiskPatientCount?: number;
  referralsMade?: number;
  fieldVisitsThisMonth?: number;
  certificationLevel?: string;   // 'Basic' | 'Advanced' | 'Certified'
  isActive?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const AshaWorkerProfile: any = createSQLModel<IAshaWorkerProfile>('asha_profiles');
