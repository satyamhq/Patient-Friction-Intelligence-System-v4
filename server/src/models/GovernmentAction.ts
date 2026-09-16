import { createSQLModel } from '../database/sqlModel.js';

export interface IGovernmentAction {
  _id?: string;
  id?: string;
  title: string;
  issue: string;
  facilityId?: string;
  facilityName: string;
  district: string;
  block?: string;
  severity: 'INFO' | 'ATTENTION' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  category: 'CAPACITY' | 'REFERRAL' | 'WAIT_TIME' | 'SERVICE' | 'DATA_STALE' | 'EQUIPMENT' | 'PHARMACY' | 'ASHA_COVERAGE' | string;
  recommendedAction: string;
  assignedOfficer?: string;
  resolutionNotes?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  // Recommendation engine fields
  frictionScore?: number;
  rootCauseCategory?: string;
  rootCauseDetails?: string;
  authorityLevel?: string;
  responsibleDepartment?: string;
  nodalOfficer?: string;
  priorityScore?: number;
  expectedImpact?: string;
  implementationTimeline?: string;
  estimatedBudgetINR?: number;
  successMetrics?: string[];
  evidenceDataPoints?: string[];
  confidenceStatus?: string;
  recommendationId?: string;
  created_at?: string;
  updated_at?: string;
  save?: () => Promise<any>;
}

export const GovernmentAction: any = createSQLModel<IGovernmentAction>('government_actions');

