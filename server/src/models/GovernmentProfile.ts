import { createSQLModel } from '../database/sqlModel.js';

export interface IGovernmentProfile {
  _id?: string;
  id?: string;
  userId: string;
  govCode?: string;
  department?: string;           // e.g. 'Ministry of Health', 'NHM', 'CMHO'
  designation?: string;          // e.g. 'District Health Officer', 'CMO'
  state?: string;
  district?: string;
  accessLevel?: 'district' | 'state' | 'national';
  phone?: string;
  email?: string;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const GovernmentProfile: any = createSQLModel<IGovernmentProfile>('government_profiles');
