import { createSQLModel } from '../database/sqlModel.js';

export type JourneyStageName =
  | 'Medical Need'
  | 'Hospital Search'
  | 'Travel'
  | 'Transport'
  | 'Appointment'
  | 'Hospital Visit'
  | 'Service'
  | 'Treatment'
  | 'Follow-up';

export interface IJourneyStage {
  stageName: JourneyStageName | string;
  order: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK' | 'BLOCKED';
  frictionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  observedBarrier?: string;
  mitigationSuggestion?: string;
  completedAt?: Date | string;
}

export interface ICareJourney {
  _id?: any;
  id?: any;
  patientId: any;
  requestId?: any;
  stages: IJourneyStage[];
  currentStageIndex: number;
  overallJourneyHealth: 'HEALTHY' | 'SLIGHT_FRICTION' | 'CRITICAL_BOTTLENECK';
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const CareJourney: any = createSQLModel<ICareJourney>('appointments');
