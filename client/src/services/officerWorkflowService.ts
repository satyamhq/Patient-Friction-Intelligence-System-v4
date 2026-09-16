import { api } from './api';

export interface RawJourneyData {
  journeyId: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  district: string;
  village?: string;
  primaryCondition: string;
  facilityName: string;
  transitDistanceKm: number;
  estimatedTransitHours: number;
  expectedOopCostInr: number;
  dailyWageLossInr: number;
  primaryLanguage: string;
  hospitalStaffLanguage: string;
  hasCaregiverEscort: boolean;
  appointmentBooked: boolean;
  isAbhaLinked: boolean;
  isPmjayEligible: boolean;
  stagesCompleted: string[];
  observedDelaysMinutes: number;
  previousDropoutsCount: number;
}

export interface IngestionValidationResult {
  isValid: boolean;
  completenessScore: number;
  qualityGrade: 'A_EXCELLENT' | 'B_ACCEPTABLE' | 'C_DEFICIENT' | 'REJECTED';
  errors: Array<{ field: string; issue: string; recoveryAction: string }>;
  warnings: string[];
  normalizedAt?: string;
}

export interface NormalizedJourney {
  journeyId: string;
  patientMaskedId: string;
  district: string;
  clinicalCategory: string;
  transitIndex: number;
  financialBurdenRatio: number;
  linguisticDissonance: boolean;
  escortDeficit: boolean;
  queueCongestionFactor: number;
  stages: Array<{ name: string; status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'AT_RISK'; latencyMin: number }>;
}

export interface FrictionFingerprint {
  physicalTransitScore: number;
  financialToxicityScore: number;
  clinicalQueueScore: number;
  navigationalLanguageScore: number;
  administrativeVerificationScore: number;
  compositePfiScore: number;
  primaryBottleneck: string;
  barrierVector: Array<{ axis: string; magnitude: number; description: string }>;
}

export interface InteractionAnalysis {
  touchpoints: Array<{ touchpoint: string; durationMin: number; frictionPoints: string[]; dropoffRisk: number }>;
  highestDelayTouchpoint: string;
  cumulativeDelayHours: number;
  recurringFrictionFlags: string[];
}

export interface CareFailureRiskAssessment {
  completionProbabilityPct: number;
  failureRiskScore: number;
  riskTier: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  topRiskDrivers: Array<{ driver: string; weightPct: number; impact: string }>;
  decisionFlow: 'MONITOR_PASSIVE' | 'ACTIVATE_SIMULATOR';
  clinicalSummary: string;
}

export interface InterventionCandidate {
  id: string;
  title: string;
  description: string;
  responsibleAuthority: string;
  costInr: number;
  implementationHours: number;
  expectedRiskReductionPct: number;
  expectedCompletionProbAfterPct: number;
  projectedQalySaved: number;
  recommended: boolean;
}

export interface ApprovalRecord {
  approvalId: string;
  journeyId: string;
  selectedIntervention: InterventionCandidate;
  officerName: string;
  officerRole: string;
  officerBadge: string;
  digitalSignatureHash: string;
  approvedAt: string;
  implementationSlaHours: number;
  dispatchStatus: 'DISPATCHED' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface OutcomeFeedback {
  outcomeId: string;
  journeyId: string;
  interventionId: string;
  actualCompletionAchieved: boolean;
  actualDelayHours: number;
  predictedCompletionProb: number;
  accuracyDeltaPct: number;
  patientSatisfactionScore: number;
  feedbackNotes: string;
  populationIntelligenceUpdated: boolean;
  retrainedModelVersion: string;
}

export const officerWorkflowService = {
  async getCohortJourneys(district?: string): Promise<{ data: RawJourneyData[]; totalCount: number }> {
    const params = district ? { district } : {};
    const res = await api.get('/government/workflow/cohort-journeys', { params });
    return res.data;
  },

  async verifyAuth(officer: {
    officerName: string;
    role: string;
    district?: string;
    officerBadge?: string;
  }): Promise<{ verified: boolean; sessionToken: string; officer: any }> {
    const res = await api.post('/government/workflow/verify-auth', officer);
    return res.data;
  },

  async validateAndClean(rawJourney: Partial<RawJourneyData>): Promise<{
    validation: IngestionValidationResult;
    normalized?: NormalizedJourney;
  }> {
    const res = await api.post('/government/workflow/validate-and-clean', { rawJourney });
    return res.data;
  },

  async analyzeFriction(
    rawJourney: RawJourneyData,
    normalized: NormalizedJourney
  ): Promise<{
    friction: FrictionFingerprint;
    interactions: InteractionAnalysis;
    risk: CareFailureRiskAssessment;
  }> {
    const res = await api.post('/government/workflow/analyze-friction', { rawJourney, normalized });
    return res.data;
  },

  async simulateInterventions(
    rawJourney: RawJourneyData,
    friction: FrictionFingerprint,
    risk: CareFailureRiskAssessment
  ): Promise<{ candidates: InterventionCandidate[] }> {
    const res = await api.post('/government/workflow/simulate-interventions', { rawJourney, friction, risk });
    return res.data;
  },

  async approveIntervention(payload: {
    journeyId: string;
    selectedIntervention: InterventionCandidate;
    officerName: string;
    officerRole: string;
    officerBadge: string;
    remarks?: string;
  }): Promise<{ approvalRecord: ApprovalRecord; message: string }> {
    const res = await api.post('/government/workflow/approve-intervention', payload);
    return res.data;
  },

  async recordOutcome(payload: {
    journeyId: string;
    interventionId: string;
    actualCompletionAchieved: boolean;
    actualDelayHours: number;
    predictedCompletionProb: number;
    patientSatisfactionScore: number;
    feedbackNotes?: string;
  }): Promise<{ outcome: OutcomeFeedback; message: string }> {
    const res = await api.post('/government/workflow/record-outcome', payload);
    return res.data;
  },

  async getOutcomes(): Promise<{ data: OutcomeFeedback[] }> {
    const res = await api.get('/government/workflow/outcomes');
    return res.data;
  },
};
