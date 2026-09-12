import { createSQLModel } from '../database/sqlModel.js';

export interface IIntervention {
  _id?: any;
  id?: any;
  code: string;
  name: string;
  category: 'Transport' | 'Diagnostics' | 'Community Staff' | 'Digital' | 'Logistics' | 'Administrative' | string;
  description: string;
  targetBarrier: string;
  unitCostINR: number;
  estimatedCompletionGainPercent: number;
  estimatedReachPatients: number;
  costPerPatientINR: number;
  geographicSuitability?: string[];
  isActive?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const Intervention: any = createSQLModel<IIntervention>('accessibility_risks');
