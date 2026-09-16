import { api } from './api';

export type FrictionTier = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface IFrictionFactors {
  accessibility: number; // 0 - 100
  waitingTime: number; // 0 - 100
  cost: number; // 0 - 100
  processComplexity: number; // 0 - 100
  referralDelays: number; // 0 - 100
  facilityCapacity: number; // 0 - 100
  informationBarriers: number; // 0 - 100
  continuityOfCare: number; // 0 - 100
}

export type SimulationScenarioType =
  | 'increase_facility_capacity'
  | 'reduce_waiting_time'
  | 'add_healthcare_staff'
  | 'improve_referral_coordination'
  | 'add_mobile_health_services'
  | 'improve_transportation_access'
  | 'extend_service_hours'
  | 'reduce_process_steps'
  | 'improve_information_availability';

export interface IScenarioTemplate {
  id: SimulationScenarioType;
  title: string;
  description: string;
  targetFactor: keyof IFrictionFactors;
  defaultCostInr: number;
  recommendedAuthority: string;
  defaultParameters: Record<string, any>;
}

export interface ISimulationDriver {
  factor: string;
  factorKey: keyof IFrictionFactors;
  baselineScore: number;
  simulatedScore: number;
  delta: number;
  description: string;
}

export interface ISimulationResult {
  simulationId: string;
  level: 'individual' | 'village' | 'district';
  targetId: string;
  targetName: string;
  scenarioType: SimulationScenarioType;
  scenarioTitle: string;
  scenarioDescription: string;
  parameterModifications: Record<string, any>;
  currentScore: number;
  simulatedScore: number;
  scoreDifference: number;
  currentTier: FrictionTier;
  simulatedTier: FrictionTier;
  affectedPopulation: number;
  mainDrivers: ISimulationDriver[];
  expectedImpact: {
    frictionReductionPct: number;
    completionGainPct: number;
    qalySavedEst: number;
    adherenceRecoveryCount: number;
  };
  confidenceDataQuality: {
    confidenceScore: number;
    sampleSize: number;
    dataQuality: 'HIGH' | 'MEDIUM' | 'ADEQUATE';
    marginOfErrorPct: number;
  };
  baselineFactors: IFrictionFactors;
  simulatedFactors: IFrictionFactors;
  recommendedIntervention: {
    authorityTitle: string;
    responsibleAuthority: string;
    recommendedAction: string;
    directiveSummary: string;
    estimatedCostInr: number;
    implementationTimeline: string;
    successKpi: string;
    policyMandateCode: string;
  };
  requiresHumanApproval: boolean;
  approvalStatus: 'PENDING_OFFICER_REVIEW' | 'APPROVED' | 'REJECTED';
}

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
  factors?: IFrictionFactors;
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
  factors?: IFrictionFactors;
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
  factors?: IFrictionFactors;
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

  async getScenarios(): Promise<IScenarioTemplate[]> {
    const res = await api.get('/friction/scenarios');
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

  async runMultiLevelSimulation(params: {
    level: 'individual' | 'village' | 'district';
    targetId: string;
    scenarioType: SimulationScenarioType;
    parameterModifications?: Record<string, any>;
  }): Promise<ISimulationResult> {
    const res = await api.post('/friction/simulate', params);
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
