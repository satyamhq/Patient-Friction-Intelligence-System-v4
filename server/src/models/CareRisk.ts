import { createSQLModel } from '../database/sqlModel.js';

export interface IRiskFactor {
  factorName: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  operationalImpact: string;
}

export interface ICareRisk {
  _id?: any;
  id?: any;
  patientId: any;
  frictionProfileId?: any;
  careCompletionProbability: number;
  accessibilityRiskPercentage: number;
  riskCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  bottleneckStage: string;
  primaryRiskFactors?: IRiskFactor[];
  mitigationPathways?: string[];
  disclaimer?: string;
  evaluatedAt?: Date | string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const CareRisk: any = createSQLModel<ICareRisk>('accessibility_risks');
