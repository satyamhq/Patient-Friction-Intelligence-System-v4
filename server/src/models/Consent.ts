import { createSQLModel } from '../database/sqlModel.js';

export type ConsentStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'PENDING';

export interface IConsent {
  _id?: any;
  id?: any;
  patientId: any;
  hospitalId: any;
  dataShared?: string[];
  purpose?: string;
  status: ConsentStatus | string;
  grantedAt?: Date | string;
  revokedAt?: Date | string;
  expiresAt?: Date | string;
  termsVersion?: string;
  ipAddress?: string;
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const Consent: any = createSQLModel<IConsent>('requests');
