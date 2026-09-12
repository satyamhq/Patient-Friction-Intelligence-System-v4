import { createSQLModel } from '../database/sqlModel.js';

export interface ISimulation {
  _id?: any;
  id?: any;
  title: string;
  scenarioName: string;
  baselineCompletionProbability: number;
  simulatedCompletionProbability: number;
  improvementDeltaPercent: number;
  selectedInterventionCodes: string[];
  totalBudgetRequiredINR: number;
  estimatedPatientsHelped: number;
  regionTargeted?: string;
  runByUserId?: any;
  notes?: string;
  disclaimer?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const Simulation: any = createSQLModel<ISimulation>('friction_profiles');
