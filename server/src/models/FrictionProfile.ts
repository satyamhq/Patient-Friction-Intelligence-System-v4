import { createSQLModel } from '../database/sqlModel.js';

export interface IFrictionFactor {
  dimension: string;
  score: number;
  weight: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  contributingParameters?: Record<string, any>;
}

export interface IFrictionProfile {
  _id?: any;
  id?: any;
  patientId: any;
  hospitalId?: any;
  travel?: IFrictionFactor;
  transport?: IFrictionFactor;
  digitalAccess?: IFrictionFactor;
  language?: IFrictionFactor;
  familySupport?: IFrictionFactor;
  documentation?: IFrictionFactor;
  cost?: IFrictionFactor;
  appointmentTiming?: IFrictionFactor;
  overallFrictionScore: number;
  overallAccessibilityScore: number;
  frictionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  topBarrier: string;
  secondaryBarrier: string;
  explanation: string;
  calculatedAt?: Date | string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const FrictionProfile: any = createSQLModel<IFrictionProfile>('friction_profiles');
