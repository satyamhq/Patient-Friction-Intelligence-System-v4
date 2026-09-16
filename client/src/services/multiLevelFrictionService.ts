import { api } from './api';

export type FrictionTier = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface IStageFriction {
  stage: string;
  stageName: string;
  score: number;
  latencyMinutes: number;
  barriers: string[];
  severity: FrictionTier;
}

export interface IEvidencePoint {
  signal: string;
  observedValue: string | number;
  benchmark: string | number;
  impactWeight: number;
}

export interface IRecommendation {
  id: string;
  level: 'individual' | 'village' | 'district';
  targetEntity: string;
  problem: string;
  rootCause: string;
  frictionScore: number;
  frictionTier: FrictionTier;
  affectedPopulation: number;
  responsibleAuthority: string;
  recommendedIntervention: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  expectedImpact: {
    frictionReductionPct: number;
    completionGainPct: number;
    qalySavedEst: number;
  };
  requiredResources: string[];
  costEstimateInr: number;
  suggestedTimeline: string;
  successKpi: string;
  evidence: IEvidencePoint[];
  whatIfCandidates?: {
    name: string;
    description: string;
    costInr: number;
    timeHours: number;
    riskReductionPct: number;
  }[];
}

export interface IIndividualFrictionResult {
  journeyId: string;
  patientId: string;
  patientNameMasked: string;
  district: string;
  village: string;
  serviceCategory: string;
  overallFrictionScore: number;
  frictionTier: FrictionTier;
  careFailureRisk: number;
  completionProbability: number;
  confidenceScore: number;
  topContributingFactors: { factor: string; score: number; description: string }[];
  stages: IStageFriction[];
  rootCauses: string[];
  recommendation: IRecommendation;
}

export interface IVillageFrictionResult {
  district: string;
  village: string;
  sampleSize: number;
  hasSufficientData: boolean;
  insufficientDataReason?: string;
  missingDataRequirements?: string[];
  overallFrictionScore: number;
  frictionTier: FrictionTier;
  averageCareFailureRisk: number;
  affectedPopulationEstimate: number;
  topBarriers: { barrier: string; frequencyPct: number; severity: FrictionTier }[];
  affectedServiceCategories: { category: string; sharePct: number; avgFriction: number }[];
  affectedCohorts: { cohort: string; riskLevel: FrictionTier; description: string }[];
  journeyStageBottlenecks: IStageFriction[];
  trendVsLastMonth: { scoreDelta: number; direction: 'improving' | 'deteriorating' | 'stable' };
  recommendation: IRecommendation;
}

export interface IDistrictFrictionResult {
  district: string;
  totalVillagesAssessed: number;
  totalJourneysAssessed: number;
  hasSufficientData: boolean;
  overallDistrictScore: number;
  frictionTier: FrictionTier;
  interVillageDisparityIndex: number;
  systemicHotspots: {
    village: string;
    score: number;
    tier: FrictionTier;
    population: number;
    primaryRootCause: string;
  }[];
  facilityPerformance: {
    facilityName: string;
    avgOpdWaitMinutes: number;
    bedOccupancyPct: number;
    stockoutRatePct: number;
    frictionContribution: number;
  }[];
  systemicBottlenecks: {
    stage: string;
    avgDelayHours: number;
    contributingPct: number;
    rootCause: string;
  }[];
  trendOverTime: { month: string; score: number }[];
  recommendations: IRecommendation[];
}

export interface IDistrictHierarchy {
  district: string;
  totalJourneys: number;
  avgFriction: number;
  tier: FrictionTier;
  villages: {
    village: string;
    journeyCount: number;
    avgFriction: number;
    tier: FrictionTier;
  }[];
}

export const multiLevelFrictionService = {
  async getHierarchy(): Promise<IDistrictHierarchy[]> {
    const res = await api.get('/friction/hierarchy');
    return res.data?.data || [];
  },

  async getAllJourneys(): Promise<any[]> {
    const res = await api.get('/friction/individual/all');
    return res.data?.data || [];
  },

  async getIndividualFriction(journeyId: string): Promise<IIndividualFrictionResult> {
    const res = await api.get(`/friction/individual/${journeyId}`);
    return res.data?.data;
  },

  async getVillageFriction(district: string, village: string): Promise<IVillageFrictionResult> {
    const res = await api.get('/friction/village', { params: { district, village } });
    return res.data?.data;
  },

  async getDistrictFriction(district: string): Promise<IDistrictFrictionResult> {
    const res = await api.get('/friction/district', { params: { district } });
    return res.data?.data;
  },

  async simulateIntervention(params: {
    baselineScore: number;
    candidateName: string;
    costBudgetInr: number;
    implementationType: string;
  }): Promise<any> {
    const res = await api.post('/friction/simulate', params);
    return res.data?.data;
  },

  async approveIntervention(params: {
    recommendationId: string;
    officerName: string;
    officerRole: string;
    remarks: string;
    chosenCandidate?: string;
    targetEntity?: string;
  }): Promise<any> {
    const res = await api.post('/friction/approve', params);
    return res.data?.data;
  },

  async recordOutcome(params: {
    approvalId: string;
    actualCompletionAchieved: boolean;
    delayHours: number;
    patientSatisfactionRating: number;
    fieldNotes?: string;
  }): Promise<any> {
    const res = await api.post('/friction/outcome', params);
    return res.data?.data;
  },

  async getInterventionsLedger(): Promise<any[]> {
    const res = await api.get('/friction/ledger');
    return res.data?.data || [];
  },
};
