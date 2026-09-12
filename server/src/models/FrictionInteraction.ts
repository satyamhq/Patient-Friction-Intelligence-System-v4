import { createSQLModel } from '../database/sqlModel.js';

export interface IFrictionInteraction {
  _id?: any;
  id?: any;
  patientId: any;
  frictionProfileId?: any;
  primaryDimension: string;
  secondaryDimension: string;
  baseScorePrimary: number;
  baseScoreSecondary: number;
  interactionMultiplier: number;
  combinedFrictionScore: number;
  interactionSeverity: 'LOW' | 'MODERATE' | 'HIGH' | 'COMPOUND_CRITICAL';
  mechanismExplanation: string;
  recommendedMitigation: string;
  detectedAt?: Date | string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const FrictionInteraction: any = createSQLModel<IFrictionInteraction>('friction_factors');
