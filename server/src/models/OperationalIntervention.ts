import { createSQLModel } from '../database/sqlModel.js';

export interface IOperationalIntervention {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category: 'OPD_CAPACITY' | 'REFERRAL_OPTIMIZATION' | 'APPOINTMENT_EXPANSION' | 'DATA_QUALITY' | 'TRANSPORT_ASSISTANCE' | 'PHARMACY_STOCK';
  targetDistrict: string;
  targetFacilityId?: string;
  targetFacilityName?: string;
  status: 'CREATED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  projectedImpact: string;
  baselineMetric?: string;
  currentMetric?: string;
  assignedTo?: string;
  estimatedBudget?: number;
  plannedStartDate?: string;
  actualCompletionDate?: string;
  created_at?: string;
  updated_at?: string;
  save?: () => Promise<any>;
}

export const OperationalIntervention: any = createSQLModel<IOperationalIntervention>('operational_interventions');
