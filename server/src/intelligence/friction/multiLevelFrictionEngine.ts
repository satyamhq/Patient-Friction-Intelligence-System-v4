import crypto from 'crypto';
import { IPatientJourneyRecord } from '../../models/MultiLevelFriction.js';

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

export interface ISimulationRequest {
  level: 'individual' | 'village' | 'district';
  targetId: string; // journeyId, village name, or district name
  scenarioType: SimulationScenarioType;
  parameterModifications?: {
    capacityIncreasePct?: number; // e.g. 10 - 100%
    waitReductionMinutes?: number; // e.g. 15 - 120
    waitReductionPct?: number; // e.g. 10 - 75%
    staffCountAdded?: number; // e.g. 1 - 20
    referralCoordinationLevel?: 'basic' | 'advanced' | 'digital_instant';
    mobileServiceFrequencyDays?: number; // e.g. 1 - 7
    transitSubsidyPct?: number; // e.g. 20 - 100%
    serviceHoursExtended?: number; // e.g. 2 - 12 hours
    processStepsRemoved?: number; // e.g. 1 - 4 steps
    informationInterventionLevel?: 'signage' | 'audio_navigator' | 'comprehensive_vernacular';
    budgetAllocationInr?: number;
  };
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
  scoreDifference: number; // baseline - simulated (positive = improvement)
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
    confidenceScore: number; // 0 - 100
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
  impactWeight: number; // percentage
}

export interface IRecommendation {
  id: string;
  level: 'individual' | 'village' | 'district';
  targetEntity: string; // Patient ID, Village Name, or District Name
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
  careFailureRisk: number; // 0 - 100
  completionProbability: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  topContributingFactors: { factor: string; score: number; description: string }[];
  stages: IStageFriction[];
  rootCauses: string[];
  factors: IFrictionFactors;
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
  factors: IFrictionFactors;
  recommendation: IRecommendation;
}

export interface IDistrictFrictionResult {
  district: string;
  totalVillagesAssessed: number;
  totalJourneysAssessed: number;
  hasSufficientData: boolean;
  overallDistrictScore: number;
  frictionTier: FrictionTier;
  interVillageDisparityIndex: number; // 0 - 100
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
  factors: IFrictionFactors;
  recommendations: IRecommendation[];
}

export class MultiLevelFrictionEngine {
  private static instance: MultiLevelFrictionEngine;

  private constructor() {}

  public static getInstance(): MultiLevelFrictionEngine {
    if (!MultiLevelFrictionEngine.instance) {
      MultiLevelFrictionEngine.instance = new MultiLevelFrictionEngine();
    }
    return MultiLevelFrictionEngine.instance;
  }

  // -------------------------------------------------------------------------
  // 1. Scoring Threshold Helper
  // -------------------------------------------------------------------------
  public getFrictionTier(score: number): FrictionTier {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MODERATE';
    return 'LOW';
  }

  // -------------------------------------------------------------------------
  // 2. Eight Operational Factors Calculator
  // -------------------------------------------------------------------------
  public calculateFactors(journey: Partial<IPatientJourneyRecord>): IFrictionFactors {
    const transitDist = journey.transitDistanceKm ?? 15;
    const transitDuration = journey.transitDurationMinutes ?? Math.round(transitDist * 3.5);
    const transitCost = journey.transitCostInr ?? 120;
    const waitMins = journey.queueWaitMinutes ?? 60;
    const diagDelayHrs = journey.diagnosticDelayHours ?? 2;
    const wageLoss = journey.dailyWageLossInr ?? 400;
    const outOfPocket = journey.outOfPocketExpensesInr ?? 250;
    const isBpl = journey.householdIncomeTier === 'bpl';
    const procSteps = journey.processStepsCount ?? (journey.documentationStatus === 'complete' ? 3 : 5);
    const isDocComplete = journey.documentationStatus === 'complete';
    const isMissingGolden = journey.documentationStatus === 'missing_golden_card';
    const refDays = journey.referralDelayDays ?? 2;
    const capacityUtil = journey.facilityCapacityUtilizationPct ?? 85;
    const staffScore = journey.staffingRatioScore ?? 65;
    const langDissonance = journey.languageDissonance ?? false;
    const infoScore = journey.informationAvailabilityScore ?? 60;
    const hasEscort = journey.caregiverEscortAvailable !== false;
    const isStockout = journey.pharmacyStockoutExperienced ?? false;

    // 1. Accessibility (0 - 100)
    const accessibility = Math.min(100, Math.max(5, Math.round(
      (transitDist / 50) * 45 + (transitDuration / 150) * 35 + (transitCost / 300) * 20
    )));

    // 2. Waiting Time (0 - 100)
    const waitingTime = Math.min(100, Math.max(5, Math.round(
      (waitMins / 180) * 65 + (diagDelayHrs / 6) * 35
    )));

    // 3. Cost (0 - 100)
    const cost = Math.min(100, Math.max(5, Math.round(
      (wageLoss / 600) * 40 + (outOfPocket / 800) * 35 + (transitCost / 300) * 15 + (isBpl ? 10 : 0)
    )));

    // 4. Process Complexity (0 - 100)
    const docPenalty = isDocComplete ? 10 : (isMissingGolden ? 65 : 85);
    const processComplexity = Math.min(100, Math.max(5, Math.round(
      (procSteps / 6) * 45 + docPenalty * 0.55
    )));

    // 5. Referral Delays (0 - 100)
    const referralDelays = Math.min(100, Math.max(5, Math.round(
      (refDays / 8) * 75 + (capacityUtil > 90 ? 25 : 10)
    )));

    // 6. Facility Capacity (0 - 100)
    const facilityCapacity = Math.min(100, Math.max(5, Math.round(
      (capacityUtil / 115) * 60 + ((100 - staffScore) / 100) * 40
    )));

    // 7. Information Barriers (0 - 100)
    const informationBarriers = Math.min(100, Math.max(5, Math.round(
      (langDissonance ? 55 : 15) + ((100 - infoScore) / 100) * 45
    )));

    // 8. Continuity of Care (0 - 100)
    const continuityOfCare = Math.min(100, Math.max(5, Math.round(
      (!hasEscort ? 35 : 10) + (isStockout ? 45 : 10) + (isBpl ? 20 : 5)
    )));

    return {
      accessibility,
      waitingTime,
      cost,
      processComplexity,
      referralDelays,
      facilityCapacity,
      informationBarriers,
      continuityOfCare,
    };
  }

  // -------------------------------------------------------------------------
  // 3. Individual Patient Friction Calculation
  // -------------------------------------------------------------------------
  public calculateIndividualFriction(journey: Partial<IPatientJourneyRecord>): IIndividualFrictionResult {
    const factors = this.calculateFactors(journey);

    // Weighted Overall PFI across 8 factors (0 - 100)
    const overallScore = Math.min(100, Math.max(5, Math.round(
      factors.accessibility * 0.15 +
      factors.waitingTime * 0.15 +
      factors.cost * 0.15 +
      factors.processComplexity * 0.12 +
      factors.referralDelays * 0.11 +
      factors.facilityCapacity * 0.12 +
      factors.informationBarriers * 0.10 +
      factors.continuityOfCare * 0.10
    )));

    const frictionTier = this.getFrictionTier(overallScore);

    // Care Failure Risk Model
    const hasEscort = journey.caregiverEscortAvailable !== false;
    const completionProb = Math.max(5, Math.min(95, Math.round(100 - overallScore * 0.85 - (!hasEscort ? 10 : 0))));
    const failureRisk = 100 - completionProb;

    const transitDist = journey.transitDistanceKm || 15;
    const transitCost = journey.transitCostInr || 120;
    const wageLoss = journey.dailyWageLossInr || 450;
    const waitMins = journey.queueWaitMinutes || 60;
    const diagDelayHrs = journey.diagnosticDelayHours || 2;
    const isDocComplete = journey.documentationStatus === 'complete';
    const isStockout = journey.pharmacyStockoutExperienced || false;

    // Stages Breakdown
    const stages: IStageFriction[] = [
      {
        stage: 'pre_visit_transit',
        stageName: 'Pre-Visit Transit',
        score: factors.accessibility,
        latencyMinutes: journey.transitDurationMinutes || Math.round(transitDist * 3.5),
        barriers: [
          `${transitDist} km transit distance`,
          `₹${transitCost} transport tariff`
        ],
        severity: this.getFrictionTier(factors.accessibility),
      },
      {
        stage: 'facility_intake',
        stageName: 'Facility Intake & Triage',
        score: factors.processComplexity,
        latencyMinutes: Math.round(waitMins * 0.35),
        barriers: isDocComplete ? ['Routine registration verification'] : ['ABDM / PM-JAY verification latency', 'Documentation mismatch'],
        severity: this.getFrictionTier(factors.processComplexity),
      },
      {
        stage: 'clinical_queue',
        stageName: 'Clinical OPD Queuing',
        score: factors.waitingTime,
        latencyMinutes: waitMins,
        barriers: [`${waitMins} min doctor consultation wait`, 'High specialist demand ratio'],
        severity: this.getFrictionTier(factors.waitingTime),
      },
      {
        stage: 'diagnostics_pharmacy',
        stageName: 'Diagnostics & Pharmacy',
        score: factors.facilityCapacity,
        latencyMinutes: diagDelayHrs * 60,
        barriers: [
          isStockout ? 'Essential medicine stockout at dispensary' : 'Jan Aushadhi generic availability normal',
          `${diagDelayHrs}h pathology turnaround delay`
        ],
        severity: this.getFrictionTier(factors.facilityCapacity),
      },
      {
        stage: 'admin_insurance',
        stageName: 'Administrative & Continuity',
        score: factors.continuityOfCare,
        latencyMinutes: 45,
        barriers: isDocComplete ? ['Cashless claim authorized'] : ['Biometric Aadhaar authentication failure', 'Follow-up coordination risk'],
        severity: this.getFrictionTier(factors.continuityOfCare),
      },
    ];

    // Contributing Factors ranked
    const factorDescriptions: Record<keyof IFrictionFactors, { label: string; desc: string }> = {
      accessibility: { label: 'Physical Transit & Geographic Isolation', desc: `${transitDist} km travel distance and lack of direct feeder transport.` },
      waitingTime: { label: 'Facility Wait & OPD Latency', desc: `${waitMins} mins queuing before physician touchpoint.` },
      cost: { label: 'Financial Exposure & Wage Loss', desc: `₹${wageLoss} lost daily wage plus ₹${transitCost} direct transit expenditure.` },
      processComplexity: { label: 'Administrative & Verification Gateways', desc: `Documentation friction under ${journey.documentationStatus || 'standard verification'}.` },
      referralDelays: { label: 'Referral & Tertiary Clearance Delays', desc: `Delay in specialist clearance and inter-facility coordination.` },
      facilityCapacity: { label: 'Facility Overcrowding & Specialist Deficit', desc: `High bed occupancy and clinical load on local facility.` },
      informationBarriers: { label: 'Information Barriers & Language Dissonance', desc: `${journey.languageDissonance ? 'Preferred dialect unaligned with tertiary hospital clinical staff.' : 'Limited pre-intake guidance.'}` },
      continuityOfCare: { label: 'Continuity & Secondary Care Dropout', desc: `${isStockout ? 'Dispensary drug stockout experienced.' : 'Caregiver escort dependency for follow-up.'}` },
    };

    const topContributingFactors = (Object.keys(factors) as (keyof IFrictionFactors)[])
      .map((key) => ({
        factor: factorDescriptions[key].label,
        score: factors[key],
        description: factorDescriptions[key].desc,
      }))
      .sort((a, b) => b.score - a.score);

    // Root causes
    const rootCauses: string[] = [];
    if (factors.accessibility >= 60) rootCauses.push('Remote geographic corridor lacking subsidized feeder transport');
    if (factors.cost >= 60) rootCauses.push('Severe daily-wage dependency causing high economic abandonment risk');
    if (factors.waitingTime >= 60) rootCauses.push('Specialist clinical queuing deficit and un-triaged OPD crowd');
    if (factors.processComplexity >= 60) rootCauses.push('Biometric authentication mismatch and multi-window intake process');
    if (factors.referralDelays >= 60) rootCauses.push('Secondary-to-tertiary referral backlog and transfer latency');
    if (factors.facilityCapacity >= 60) rootCauses.push('Clinical facility bed occupancy exceeding design threshold');
    if (factors.informationBarriers >= 60) rootCauses.push('Linguistic dissonance between patient dialect and hospital staff');
    if (factors.continuityOfCare >= 60) rootCauses.push('Dispensary stockout and absent caregiver escort assistance');
    if (rootCauses.length === 0) rootCauses.push('Routine operational latency');

    // Individual Recommendation
    const recommendation = this.generateIndividualRecommendation(
      journey.journeyId || 'JRN-UNKNOWN',
      journey.patientNameMasked || 'Patient',
      overallScore,
      frictionTier,
      failureRisk,
      journey.district || 'Patna',
      journey.village || 'Danapur Diara',
      rootCauses,
      stages
    );

    return {
      journeyId: journey.journeyId || 'JRN-DEMO',
      patientId: journey.patientId || 'PAT-DEMO',
      patientNameMasked: journey.patientNameMasked || 'Citizen Anonymous',
      district: journey.district || 'Patna',
      village: journey.village || 'Danapur Diara',
      serviceCategory: journey.serviceCategory || 'Maternal Health',
      overallFrictionScore: overallScore,
      frictionTier,
      careFailureRisk: failureRisk,
      completionProbability: completionProb,
      confidenceScore: 94,
      topContributingFactors,
      stages,
      rootCauses,
      factors,
      recommendation,
    };
  }

  // -------------------------------------------------------------------------
  // 3. Village-Level Friction Aggregation
  // -------------------------------------------------------------------------
  public aggregateVillageFriction(district: string, village: string, journeys: IPatientJourneyRecord[]): IVillageFrictionResult {
    const villageJourneys = journeys.filter(
      (j) => j.district.toLowerCase() === district.toLowerCase() && j.village.toLowerCase() === village.toLowerCase()
    );

    // Insufficient Data Protection Gate (Minimum 3 records required to ensure privacy and statistical integrity)
    if (villageJourneys.length < 3) {
      return {
        district,
        village,
        sampleSize: villageJourneys.length,
        hasSufficientData: false,
        insufficientDataReason: `Only ${villageJourneys.length} verified journey records available for ${village}. Minimum sample threshold is 3 to preserve statistical validity and avoid bias.`,
        missingDataRequirements: [
          'At least 3 complete patient journey telemetry records',
          'Facility touchpoint queue timestamps',
          'Household economic vulnerability profile',
          'Field ASHA screening verification records'
        ],
        overallFrictionScore: 0,
        frictionTier: 'LOW',
        averageCareFailureRisk: 0,
        affectedPopulationEstimate: 0,
        topBarriers: [],
        affectedServiceCategories: [],
        affectedCohorts: [],
        journeyStageBottlenecks: [],
        trendVsLastMonth: { scoreDelta: 0, direction: 'stable' },
        factors: {
          accessibility: 0,
          waitingTime: 0,
          cost: 0,
          processComplexity: 0,
          referralDelays: 0,
          facilityCapacity: 0,
          informationBarriers: 0,
          continuityOfCare: 0,
        },
        recommendation: {
          id: `REC-VIL-INSUF-${Date.now()}`,
          level: 'village',
          targetEntity: village,
          problem: 'Insufficient Telemetry Data for Reliable Population Friction Assessment',
          rootCause: 'Low frontline reporting frequency and missing digital health records',
          frictionScore: 0,
          frictionTier: 'LOW',
          affectedPopulation: 0,
          responsibleAuthority: `District Health Society, ${district}`,
          recommendedIntervention: `Dispatch ASHA supervisor to ${village} for active cohort journey enumeration and offline telemetry synchronization.`,
          priority: 'LOW',
          expectedImpact: { frictionReductionPct: 0, completionGainPct: 0, qalySavedEst: 0 },
          requiredResources: ['ASHA Tablet Sync Kit', 'Field Survey Protocol'],
          costEstimateInr: 2500,
          suggestedTimeline: '7 days',
          successKpi: 'Collect >= 15 verified patient journeys to calibrate village baseline',
          evidence: [{ signal: 'Sample Size', observedValue: villageJourneys.length, benchmark: 3, impactWeight: 100 }],
        }
      };
    }

    // Sufficient Data: Aggregate metrics
    const totalScore = villageJourneys.reduce((sum, j) => sum + (j.frictionScore || 0), 0);
    const avgScore = Math.round(totalScore / villageJourneys.length);
    const avgRisk = Math.round(villageJourneys.reduce((sum, j) => sum + (j.careFailureRisk || 0), 0) / villageJourneys.length);
    const tier = this.getFrictionTier(avgScore);

    // Service category breakdown
    const catMap: Record<string, { count: number; totalFriction: number }> = {};
    villageJourneys.forEach((j) => {
      const cat = j.serviceCategory || 'General Medicine';
      if (!catMap[cat]) catMap[cat] = { count: 0, totalFriction: 0 };
      catMap[cat].count += 1;
      catMap[cat].totalFriction += j.frictionScore || 0;
    });

    const affectedServiceCategories = Object.entries(catMap).map(([cat, data]) => ({
      category: cat,
      sharePct: Math.round((data.count / villageJourneys.length) * 100),
      avgFriction: Math.round(data.totalFriction / data.count),
    })).sort((a, b) => b.avgFriction - a.avgFriction);

    // Top Barriers aggregated
    const barrierFrequency: Record<string, number> = {
      'Riverine Transit & Lack of Feeder Transport': 0,
      'Severe Daily Wage Loss Exposure': 0,
      'Clinical OPD Queue Delays > 60 mins': 0,
      'Missing PM-JAY Golden Card / Biometric Mismatch': 0,
      'Pharmacy Stockout of Essential Antibiotics/Iron': 0,
    };

    villageJourneys.forEach((j) => {
      if (j.transitDistanceKm > 15 || j.transitDurationMinutes > 45) barrierFrequency['Riverine Transit & Lack of Feeder Transport'] += 1;
      if (j.dailyWageLossInr > 350) barrierFrequency['Severe Daily Wage Loss Exposure'] += 1;
      if (j.queueWaitMinutes > 50) barrierFrequency['Clinical OPD Queue Delays > 60 mins'] += 1;
      if (j.documentationStatus !== 'complete') barrierFrequency['Missing PM-JAY Golden Card / Biometric Mismatch'] += 1;
      if (j.pharmacyStockoutExperienced) barrierFrequency['Pharmacy Stockout of Essential Antibiotics/Iron'] += 1;
    });

    const topBarriers = Object.entries(barrierFrequency)
      .map(([barrier, count]) => {
        const pct = Math.round((count / villageJourneys.length) * 100);
        return {
          barrier,
          frequencyPct: pct,
          severity: pct >= 65 ? 'CRITICAL' : (pct >= 45 ? 'HIGH' : (pct >= 25 ? 'MODERATE' : 'LOW')) as FrictionTier,
        };
      })
      .sort((a, b) => b.frequencyPct - a.frequencyPct);

    // Vulnerable Cohorts
    const affectedCohorts = [
      {
        cohort: 'Antenatal & High-Risk Maternal Women',
        riskLevel: avgScore >= 65 ? 'CRITICAL' : 'HIGH' as FrictionTier,
        description: 'Vulnerable to delivery drop-out due to 45+ minute transit over unpaved riverine routes.',
      },
      {
        cohort: 'Elderly Daily-Wage Earners (Chronic HTN/Diabetes)',
        riskLevel: avgScore >= 60 ? 'HIGH' : 'MODERATE' as FrictionTier,
        description: 'High prescription abandonment when wait time forces whole-day income forfeit.',
      },
      {
        cohort: 'Pediatric Immunization Defaulters',
        riskLevel: 'MODERATE' as FrictionTier,
        description: 'Secondary immunization doses delayed due to travel costs exceeding ₹150.',
      },
    ];

    // Journey Stage Bottlenecks
    const journeyStageBottlenecks: IStageFriction[] = [
      {
        stage: 'pre_visit_transit',
        stageName: 'Pre-Visit Transit',
        score: Math.round(villageJourneys.reduce((s, j) => s + (j.transitDistanceKm * 2.2), 0) / villageJourneys.length),
        latencyMinutes: Math.round(villageJourneys.reduce((s, j) => s + j.transitDurationMinutes, 0) / villageJourneys.length),
        barriers: ['Absence of scheduled feeder transport to Sub-Divisional Hospital'],
        severity: tier,
      },
      {
        stage: 'clinical_queue',
        stageName: 'OPD Queuing Latency',
        score: Math.round(villageJourneys.reduce((s, j) => s + (j.queueWaitMinutes * 0.8), 0) / villageJourneys.length),
        latencyMinutes: Math.round(villageJourneys.reduce((s, j) => s + j.queueWaitMinutes, 0) / villageJourneys.length),
        barriers: ['Peak morning rush causing 2+ hours queue delays before physician consultation'],
        severity: this.getFrictionTier(Math.round(villageJourneys.reduce((s, j) => s + (j.queueWaitMinutes * 0.8), 0) / villageJourneys.length)),
      },
    ];

    const recommendation = this.generateVillageRecommendation(
      district,
      village,
      avgScore,
      tier,
      villageJourneys.length * 140, // estimated affected village population
      topBarriers[0]?.barrier || 'Transit Distance',
      avgRisk
    );

    const factorsList = villageJourneys.map((j) => (j as any).factors || this.calculateFactors(j));
    const factors: IFrictionFactors = {
      accessibility: Math.round(factorsList.reduce((s, f) => s + f.accessibility, 0) / factorsList.length),
      waitingTime: Math.round(factorsList.reduce((s, f) => s + f.waitingTime, 0) / factorsList.length),
      cost: Math.round(factorsList.reduce((s, f) => s + f.cost, 0) / factorsList.length),
      processComplexity: Math.round(factorsList.reduce((s, f) => s + f.processComplexity, 0) / factorsList.length),
      referralDelays: Math.round(factorsList.reduce((s, f) => s + f.referralDelays, 0) / factorsList.length),
      facilityCapacity: Math.round(factorsList.reduce((s, f) => s + f.facilityCapacity, 0) / factorsList.length),
      informationBarriers: Math.round(factorsList.reduce((s, f) => s + f.informationBarriers, 0) / factorsList.length),
      continuityOfCare: Math.round(factorsList.reduce((s, f) => s + f.continuityOfCare, 0) / factorsList.length),
    };

    return {
      district,
      village,
      sampleSize: villageJourneys.length,
      hasSufficientData: true,
      overallFrictionScore: avgScore,
      frictionTier: tier,
      averageCareFailureRisk: avgRisk,
      affectedPopulationEstimate: villageJourneys.length * 140,
      topBarriers,
      affectedServiceCategories,
      affectedCohorts,
      journeyStageBottlenecks,
      trendVsLastMonth: { scoreDelta: -4, direction: 'improving' },
      factors,
      recommendation,
    };
  }

  // -------------------------------------------------------------------------
  // 4. District-Level Friction Aggregation
  // -------------------------------------------------------------------------
  public aggregateDistrictFriction(district: string, journeys: IPatientJourneyRecord[]): IDistrictFrictionResult {
    const districtJourneys = journeys.filter(
      (j) => j.district.toLowerCase() === district.toLowerCase()
    );

    if (districtJourneys.length === 0) {
      return {
        district,
        totalVillagesAssessed: 0,
        totalJourneysAssessed: 0,
        hasSufficientData: false,
        overallDistrictScore: 0,
        frictionTier: 'LOW',
        interVillageDisparityIndex: 0,
        systemicHotspots: [],
        facilityPerformance: [],
        systemicBottlenecks: [],
        trendOverTime: [],
        factors: {
          accessibility: 0,
          waitingTime: 0,
          cost: 0,
          processComplexity: 0,
          referralDelays: 0,
          facilityCapacity: 0,
          informationBarriers: 0,
          continuityOfCare: 0,
        },
        recommendations: [],
      };
    }

    // Unique villages
    const villageNames = Array.from(new Set(districtJourneys.map((j) => j.village)));
    const villageSummaries = villageNames.map((v) => {
      const vJourneys = districtJourneys.filter((j) => j.village === v);
      const avg = Math.round(vJourneys.reduce((s, j) => s + (j.frictionScore || 0), 0) / vJourneys.length);
      return {
        village: v,
        score: avg,
        tier: this.getFrictionTier(avg),
        population: vJourneys.length * 180,
        primaryRootCause: avg >= 70 ? 'Riverine isolation & transit poverty' : 'OPD queue congestion & documentation friction',
      };
    }).sort((a, b) => b.score - a.score);

    const overallDistrictScore = Math.round(
      districtJourneys.reduce((s, j) => s + (j.frictionScore || 0), 0) / districtJourneys.length
    );
    const frictionTier = this.getFrictionTier(overallDistrictScore);

    // Calculate disparity (max village score - min village score)
    const scores = villageSummaries.map((v) => v.score);
    const disparity = scores.length > 1 ? Math.max(...scores) - Math.min(...scores) : 10;

    // Facility Performance
    const facilityPerformance = [
      {
        facilityName: `${district} Sadar District Hospital`,
        avgOpdWaitMinutes: 72,
        bedOccupancyPct: 88,
        stockoutRatePct: 14,
        frictionContribution: 42,
      },
      {
        facilityName: `${district} Sub-Divisional Hospital`,
        avgOpdWaitMinutes: 54,
        bedOccupancyPct: 76,
        stockoutRatePct: 18,
        frictionContribution: 32,
      },
      {
        facilityName: `Primary Health Centre (Diara Corridor)`,
        avgOpdWaitMinutes: 38,
        bedOccupancyPct: 45,
        stockoutRatePct: 28,
        frictionContribution: 26,
      },
    ];

    // Systemic Bottlenecks
    const systemicBottlenecks = [
      {
        stage: 'Specialist OPD Consultation Latency',
        avgDelayHours: 2.8,
        contributingPct: 38,
        rootCause: 'Shortage of obstetricians and cardiologists at district level',
      },
      {
        stage: 'Pre-Visit Transit in Flood-Prone Corridors',
        avgDelayHours: 1.9,
        contributingPct: 32,
        rootCause: 'Absence of public bus/ambulance feeders connecting remote panchayats',
      },
      {
        stage: 'PM-JAY Golden Card Biometric Rejection',
        avgDelayHours: 1.2,
        contributingPct: 30,
        rootCause: 'Poor optical fingerprint scanners and intermittent ABDM server sync',
      },
    ];

    const trendOverTime = [
      { month: 'Jun', score: Math.min(100, overallDistrictScore + 6) },
      { month: 'Jul', score: Math.min(100, overallDistrictScore + 4) },
      { month: 'Aug', score: Math.min(100, overallDistrictScore + 2) },
      { month: 'Sep (Live)', score: overallDistrictScore },
    ];

    const recommendations = [
      this.generateDistrictRecommendation(
        district,
        overallDistrictScore,
        frictionTier,
        villageSummaries[0]?.village || 'High-Risk Block',
        villageSummaries.length * 3500
      ),
    ];

    const districtFactorsList = districtJourneys.map((j) => (j as any).factors || this.calculateFactors(j));
    const factors: IFrictionFactors = {
      accessibility: Math.round(districtFactorsList.reduce((s, f) => s + f.accessibility, 0) / districtFactorsList.length),
      waitingTime: Math.round(districtFactorsList.reduce((s, f) => s + f.waitingTime, 0) / districtFactorsList.length),
      cost: Math.round(districtFactorsList.reduce((s, f) => s + f.cost, 0) / districtFactorsList.length),
      processComplexity: Math.round(districtFactorsList.reduce((s, f) => s + f.processComplexity, 0) / districtFactorsList.length),
      referralDelays: Math.round(districtFactorsList.reduce((s, f) => s + f.referralDelays, 0) / districtFactorsList.length),
      facilityCapacity: Math.round(districtFactorsList.reduce((s, f) => s + f.facilityCapacity, 0) / districtFactorsList.length),
      informationBarriers: Math.round(districtFactorsList.reduce((s, f) => s + f.informationBarriers, 0) / districtFactorsList.length),
      continuityOfCare: Math.round(districtFactorsList.reduce((s, f) => s + f.continuityOfCare, 0) / districtFactorsList.length),
    };

    return {
      district,
      totalVillagesAssessed: villageNames.length,
      totalJourneysAssessed: districtJourneys.length,
      hasSufficientData: true,
      overallDistrictScore,
      frictionTier,
      interVillageDisparityIndex: disparity,
      systemicHotspots: villageSummaries,
      facilityPerformance,
      systemicBottlenecks,
      trendOverTime,
      factors,
      recommendations,
    };
  }

  // -------------------------------------------------------------------------
  // 5. Actionable Recommendation Generators
  // -------------------------------------------------------------------------
  private generateIndividualRecommendation(
    journeyId: string,
    patientName: string,
    score: number,
    tier: FrictionTier,
    risk: number,
    district: string,
    village: string,
    rootCauses: string[],
    stages: IStageFriction[]
  ): IRecommendation {
    const isHigh = score >= 60;
    return {
      id: `REC-IND-${journeyId}`,
      level: 'individual',
      targetEntity: `Patient: ${patientName} (${journeyId})`,
      problem: isHigh
        ? `Severe composite friction (${score}/100) causing ${risk}% Care Abandonment Risk during hospital visit.`
        : `Moderate travel and queue friction (${score}/100) requiring digital fast-tracking.`,
      rootCause: rootCauses.join('; '),
      frictionScore: score,
      frictionTier: tier,
      affectedPopulation: 1,
      responsibleAuthority: `Civil Surgeon Office, ${district} & ASHA Coordinator (${village})`,
      recommendedIntervention: isHigh
        ? `Assign Dedicated ASHA Transport Escort with Pre-Issued Fast-Track OPD Token & Jan Aushadhi Travel Voucher.`
        : `Issue Digital SMS OPD Token and route consultation through Sub-Health Centre Teleconsultation Desk.`,
      priority: isHigh ? (score >= 80 ? 'URGENT' : 'HIGH') : 'MEDIUM',
      expectedImpact: {
        frictionReductionPct: isHigh ? 52 : 35,
        completionGainPct: isHigh ? 44 : 28,
        qalySavedEst: isHigh ? 0.38 : 0.15,
      },
      requiredResources: ['ASHA Chaperone Stipend (₹150)', 'Priority OPD Digital Token', 'Jan Aushadhi Subsidy Voucher (₹350)'],
      costEstimateInr: isHigh ? 500 : 150,
      suggestedTimeline: isHigh ? 'Within 24 Hours' : 'Within 3 Days',
      successKpi: 'Patient completes full specialist consultation without journey abandonment; zero out-of-pocket expenditure.',
      evidence: [
        { signal: 'Transit Distance', observedValue: `${stages[0]?.latencyMinutes || 45} mins`, benchmark: '20 mins', impactWeight: 28 },
        { signal: 'OPD Queue Wait', observedValue: `${stages[2]?.latencyMinutes || 60} mins`, benchmark: '25 mins', impactWeight: 32 },
        { signal: 'Failure Risk Probability', observedValue: `${risk}%`, benchmark: '< 15%', impactWeight: 40 },
      ],
      whatIfCandidates: [
        {
          name: 'Candidate A: ASHA Chaperone + Priority Token',
          description: 'ASHA escorts patient from village with pre-booked OPD slot.',
          costInr: 500,
          timeHours: 24,
          riskReductionPct: 52,
        },
        {
          name: 'Candidate B: Sub-Centre Teleconsultation',
          description: 'Specialist connects via video at village Health & Wellness Centre.',
          costInr: 200,
          timeHours: 12,
          riskReductionPct: 38,
        },
      ],
    };
  }

  private generateVillageRecommendation(
    district: string,
    village: string,
    score: number,
    tier: FrictionTier,
    population: number,
    topBarrier: string,
    avgRisk: number
  ): IRecommendation {
    const isHigh = score >= 60;
    return {
      id: `REC-VIL-${village.replace(/\s+/g, '-').toUpperCase()}`,
      level: 'village',
      targetEntity: `Village: ${village} (${district})`,
      problem: `High village-wide accessibility barrier (${score}/100) disproportionately delaying critical maternal and chronic care.`,
      rootCause: `Primary barrier: ${topBarrier}. Peripheral health sub-centres lack point-of-care diagnostics and scheduled transport feeders.`,
      frictionScore: score,
      frictionTier: tier,
      affectedPopulation: population,
      responsibleAuthority: `District Magistrate & Chief Medical Officer (CMO), ${district}`,
      recommendedIntervention: isHigh
        ? `Deploy Mobile Medical Unit (MMU) with Portable Ultrasound & Point-of-Care Lab 3 days/week to ${village}.`
        : `Establish Weekly Jan Aushadhi Generic Medicine Distribution & Digital ABDM Registration Camp at Panchayat Bhavan.`,
      priority: isHigh ? 'HIGH' : 'MEDIUM',
      expectedImpact: {
        frictionReductionPct: isHigh ? 48 : 30,
        completionGainPct: isHigh ? 42 : 25,
        qalySavedEst: 2.8,
      },
      requiredResources: ['1 Mobile Medical Van (Equipped)', '2 Medical Officers + 1 Lab Technician', 'Monthly Operating Fuel (₹24,000)'],
      costEstimateInr: isHigh ? 85000 : 25000,
      suggestedTimeline: 'Within 7 Days',
      successKpi: 'Reduce average village travel distance by 65%; increase first-trimester ANC registration to > 90%.',
      evidence: [
        { signal: 'Village Mean Friction Score', observedValue: score, benchmark: 35, impactWeight: 35 },
        { signal: 'Average Care Abandonment Risk', observedValue: `${avgRisk}%`, benchmark: '10%', impactWeight: 35 },
        { signal: 'Population Affected', observedValue: population, benchmark: 'N/A', impactWeight: 30 },
      ],
      whatIfCandidates: [
        {
          name: 'Candidate 1: Mobile Medical Unit Divert',
          description: 'Route district MMU-04 to cover village panchayat bi-weekly.',
          costInr: 85000,
          timeHours: 72,
          riskReductionPct: 48,
        },
        {
          name: 'Candidate 2: ASHA Feeder E-Rickshaw Cooperative',
          description: 'Subsidize local e-rickshaws to ferry patients to primary health centre.',
          costInr: 45000,
          timeHours: 48,
          riskReductionPct: 36,
        },
      ],
    };
  }

  private generateDistrictRecommendation(
    district: string,
    score: number,
    tier: FrictionTier,
    hotspotVillage: string,
    population: number
  ): IRecommendation {
    return {
      id: `REC-DIST-${district.toUpperCase()}`,
      level: 'district',
      targetEntity: `District: ${district}`,
      problem: `Systemic healthcare delivery bottlenecks (${score}/100) causing high inter-village health inequality and OPD drop-offs.`,
      rootCause: `Highest friction concentrated in ${hotspotVillage}. Chronic district hospital queue latency and rural pharmacy stockouts.`,
      frictionScore: score,
      frictionTier: tier,
      affectedPopulation: population,
      responsibleAuthority: `State Health Society & District Health Command, ${district}`,
      recommendedIntervention: `Implement District Digital Token Dispatch System & Fast-Track Jan Aushadhi Pharmacy Supply Chain Hub at Sadar Hospital.`,
      priority: score >= 70 ? 'URGENT' : 'HIGH',
      expectedImpact: {
        frictionReductionPct: 38,
        completionGainPct: 32,
        qalySavedEst: 14.5,
      },
      requiredResources: ['District Cloud OPD Queue Server', 'Buffer Generic Medicine Inventory (₹3.5 Lakh)', 'Biometric Scanner Refresh (50 Units)'],
      costEstimateInr: 450000,
      suggestedTimeline: 'Within 15 Days',
      successKpi: 'Lower peak OPD registration wait from 72 mins to < 20 mins; achieve zero generic drug stockout across all CHCs.',
      evidence: [
        { signal: 'District Friction Mean', observedValue: score, benchmark: 30, impactWeight: 40 },
        { signal: 'District Hospital Peak Wait', observedValue: '72 mins', benchmark: '20 mins', impactWeight: 35 },
        { signal: 'Assessed Villages', observedValue: 'Multiple Corridors', benchmark: 'N/A', impactWeight: 25 },
      ],
      whatIfCandidates: [
        {
          name: 'Candidate A: Cloud Token Dispatch & Pharmacy Hub',
          description: 'Centralized queue management with automated buffer stock dispatch.',
          costInr: 450000,
          timeHours: 120,
          riskReductionPct: 38,
        },
        {
          name: 'Candidate B: Weekend Specialized Medical Camps',
          description: 'Deploy specialists for focused weekend clinical drives at block CHCs.',
          costInr: 280000,
          timeHours: 96,
          riskReductionPct: 26,
        },
      ],
    };
  }

  // -------------------------------------------------------------------------
  // 6. Predefined Healthcare-System Scenario Catalog
  // -------------------------------------------------------------------------
  public getScenarioCatalog(): {
    id: SimulationScenarioType;
    title: string;
    description: string;
    targetFactor: keyof IFrictionFactors;
    defaultCostInr: number;
    recommendedAuthority: string;
    defaultParameters: Record<string, any>;
  }[] {
    return [
      {
        id: 'increase_facility_capacity',
        title: 'Increase Facility Capacity & Beds',
        description: 'Expand bed capacity by 20-50% and optimize specialist consultation slots to relieve ward overcrowding.',
        targetFactor: 'facilityCapacity',
        defaultCostInr: 320000,
        recommendedAuthority: 'District Health Society & Civil Surgeon',
        defaultParameters: { capacityIncreasePct: 35 },
      },
      {
        id: 'reduce_waiting_time',
        title: 'Automated OPD Token Queue & Fast-Track Triage',
        description: 'Implement QR digital token dispatch to slash manual OPD registration queues and lab waiting bottlenecks.',
        targetFactor: 'waitingTime',
        defaultCostInr: 85000,
        recommendedAuthority: 'Hospital Superintendent & Civil Surgeon',
        defaultParameters: { waitReductionPct: 50, waitReductionMinutes: 45 },
      },
      {
        id: 'add_healthcare_staff',
        title: 'Deploy Additional Healthcare Staff & Specialists',
        description: 'Sanction and post additional medical officers, auxiliary nurse midwives (ANMs), and rotational specialists.',
        targetFactor: 'facilityCapacity',
        defaultCostInr: 180000,
        recommendedAuthority: 'State Health Mission Directorate & Chief Medical Officer',
        defaultParameters: { staffCountAdded: 4 },
      },
      {
        id: 'improve_referral_coordination',
        title: 'Inter-Facility Referral Transit & Bed Coordination',
        description: 'Establish bidirectional digital referral handshakes with auto-reserved secondary/tertiary beds.',
        targetFactor: 'referralDelays',
        defaultCostInr: 120000,
        recommendedAuthority: 'District Referral Command Centre & Civil Surgeon',
        defaultParameters: { referralCoordinationLevel: 'advanced' },
      },
      {
        id: 'add_mobile_health_services',
        title: 'Mobile Medical Units (MMUs) & Doorstep Care',
        description: 'Deploy scheduled Mobile Health Vans equipped with point-of-care diagnostics into remote corridors.',
        targetFactor: 'accessibility',
        defaultCostInr: 250000,
        recommendedAuthority: 'District Magistrate & National Health Mission',
        defaultParameters: { mobileServiceFrequencyDays: 3 },
      },
      {
        id: 'improve_transportation_access',
        title: 'Subsidized Community Feeder Transport / Shuttles',
        description: 'Contract local electric feeder shuttles from isolated villages directly to the nearest Community Health Centre.',
        targetFactor: 'accessibility',
        defaultCostInr: 65000,
        recommendedAuthority: 'District Transport Department & Panchayati Raj',
        defaultParameters: { transitSubsidyPct: 60 },
      },
      {
        id: 'extend_service_hours',
        title: 'Extend OPD Clinic & Pharmacy Service Hours',
        description: 'Shift from standard morning-only OPD to 2-shift evening clinics to eliminate patient daily wage losses.',
        targetFactor: 'waitingTime',
        defaultCostInr: 95000,
        recommendedAuthority: 'Chief Medical Officer & Sub-Divisional Hospital MOIC',
        defaultParameters: { serviceHoursExtended: 4 },
      },
      {
        id: 'reduce_process_steps',
        title: 'Single-Window Intake & Instant ABHA Verification',
        description: 'Consolidate multiple registration checkpoints into a unified biometric cashless service window.',
        targetFactor: 'processComplexity',
        defaultCostInr: 45000,
        recommendedAuthority: 'National Health Authority (NHA) State Mission Unit',
        defaultParameters: { processStepsRemoved: 3 },
      },
      {
        id: 'improve_information_availability',
        title: 'Dialect Navigators & Multilingual Patient Guidance',
        description: 'Station native dialect navigators (Bhojpuri/Maithili/Magahi) and deploy automated SMS queue audio alerts.',
        targetFactor: 'informationBarriers',
        defaultCostInr: 35000,
        recommendedAuthority: 'District Health Society & Rogi Kalyan Samiti',
        defaultParameters: { informationInterventionLevel: 'comprehensive_vernacular' },
      },
    ];
  }

  // -------------------------------------------------------------------------
  // 7. Counterfactual Simulation Engine
  // -------------------------------------------------------------------------
  public simulateScenario(
    level: 'individual' | 'village' | 'district',
    targetId: string,
    scenarioType: SimulationScenarioType,
    parameterModifications: Record<string, any> = {},
    allJourneys: IPatientJourneyRecord[] = []
  ): ISimulationResult {
    const simulationId = `SIM-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 1. Resolve Target and Baseline Factors
    let targetName = targetId;
    let baselineFactors: IFrictionFactors;
    let baselineScore = 65;
    let affectedPopulation = 1000;
    let sampleSize = 1;

    if (level === 'individual') {
      const journey = allJourneys.find(
        (j) => j.journeyId.toLowerCase() === targetId.toLowerCase() || j.patientId.toLowerCase() === targetId.toLowerCase()
      ) || allJourneys[0];

      if (journey) {
        targetName = journey.patientNameMasked || journey.patientId;
        baselineFactors = (journey as any).factors || this.calculateFactors(journey);
        baselineScore = journey.frictionScore || this.calculateIndividualFriction(journey).overallFrictionScore;
      } else {
        baselineFactors = {
          accessibility: 70,
          waitingTime: 65,
          cost: 75,
          processComplexity: 60,
          referralDelays: 45,
          facilityCapacity: 60,
          informationBarriers: 50,
          continuityOfCare: 55,
        };
      }
      affectedPopulation = 1;
      sampleSize = 1;
    } else if (level === 'village') {
      const vJourneys = allJourneys.filter((j) => j.village.toLowerCase() === targetId.toLowerCase());
      targetName = `Village: ${targetId}`;
      sampleSize = Math.max(1, vJourneys.length);

      if (vJourneys.length > 0) {
        const factorSums = vJourneys.map((j) => (j as any).factors || this.calculateFactors(j));
        baselineFactors = {
          accessibility: Math.round(factorSums.reduce((s, f) => s + f.accessibility, 0) / factorSums.length),
          waitingTime: Math.round(factorSums.reduce((s, f) => s + f.waitingTime, 0) / factorSums.length),
          cost: Math.round(factorSums.reduce((s, f) => s + f.cost, 0) / factorSums.length),
          processComplexity: Math.round(factorSums.reduce((s, f) => s + f.processComplexity, 0) / factorSums.length),
          referralDelays: Math.round(factorSums.reduce((s, f) => s + f.referralDelays, 0) / factorSums.length),
          facilityCapacity: Math.round(factorSums.reduce((s, f) => s + f.facilityCapacity, 0) / factorSums.length),
          informationBarriers: Math.round(factorSums.reduce((s, f) => s + f.informationBarriers, 0) / factorSums.length),
          continuityOfCare: Math.round(factorSums.reduce((s, f) => s + f.continuityOfCare, 0) / factorSums.length),
        };
        baselineScore = Math.round(vJourneys.reduce((s, j) => s + (j.frictionScore || 65), 0) / vJourneys.length);
        affectedPopulation = vJourneys.length * 150;
      } else {
        baselineFactors = {
          accessibility: 65,
          waitingTime: 60,
          cost: 70,
          processComplexity: 55,
          referralDelays: 40,
          facilityCapacity: 60,
          informationBarriers: 45,
          continuityOfCare: 50,
        };
        baselineScore = 62;
        affectedPopulation = 2800;
      }
    } else {
      // District level
      const dJourneys = allJourneys.filter((j) => j.district.toLowerCase() === targetId.toLowerCase());
      targetName = `District: ${targetId}`;
      sampleSize = Math.max(1, dJourneys.length);

      if (dJourneys.length > 0) {
        const factorSums = dJourneys.map((j) => (j as any).factors || this.calculateFactors(j));
        baselineFactors = {
          accessibility: Math.round(factorSums.reduce((s, f) => s + f.accessibility, 0) / factorSums.length),
          waitingTime: Math.round(factorSums.reduce((s, f) => s + f.waitingTime, 0) / factorSums.length),
          cost: Math.round(factorSums.reduce((s, f) => s + f.cost, 0) / factorSums.length),
          processComplexity: Math.round(factorSums.reduce((s, f) => s + f.processComplexity, 0) / factorSums.length),
          referralDelays: Math.round(factorSums.reduce((s, f) => s + f.referralDelays, 0) / factorSums.length),
          facilityCapacity: Math.round(factorSums.reduce((s, f) => s + f.facilityCapacity, 0) / factorSums.length),
          informationBarriers: Math.round(factorSums.reduce((s, f) => s + f.informationBarriers, 0) / factorSums.length),
          continuityOfCare: Math.round(factorSums.reduce((s, f) => s + f.continuityOfCare, 0) / factorSums.length),
        };
        baselineScore = Math.round(dJourneys.reduce((s, j) => s + (j.frictionScore || 60), 0) / dJourneys.length);
        affectedPopulation = dJourneys.length * 1800;
      } else {
        baselineFactors = {
          accessibility: 58,
          waitingTime: 55,
          cost: 65,
          processComplexity: 50,
          referralDelays: 45,
          facilityCapacity: 65,
          informationBarriers: 40,
          continuityOfCare: 45,
        };
        baselineScore = 58;
        affectedPopulation = 185000;
      }
    }

    // 2. Compute Counterfactual Factors
    const simulatedFactors: IFrictionFactors = { ...baselineFactors };
    let scenarioTitle = '';
    let scenarioDescription = '';
    let estimatedCostInr = 100000;
    let suggestedTimeline = 'Within 14 Days';
    let policyMandateCode = 'NHM-PFI-DIR-2026-01';

    switch (scenarioType) {
      case 'increase_facility_capacity': {
        const gain = (parameterModifications.capacityIncreasePct || 35) / 100;
        scenarioTitle = `Increase Facility Capacity by +${Math.round(gain * 100)}%`;
        scenarioDescription = `Augments operational clinical bed capacity and adds specialist consultation rooms.`;
        simulatedFactors.facilityCapacity = Math.max(10, Math.round(baselineFactors.facilityCapacity * (1 - gain * 0.60)));
        simulatedFactors.waitingTime = Math.max(10, Math.round(baselineFactors.waitingTime * (1 - gain * 0.40)));
        estimatedCostInr = 320000;
        suggestedTimeline = '30 Days';
        policyMandateCode = 'NHM-CAP-EXP-04';
        break;
      }

      case 'reduce_waiting_time': {
        const waitDrop = (parameterModifications.waitReductionPct || 50) / 100;
        scenarioTitle = `Automated OPD Fast-Track (Slashing Wait by ${Math.round(waitDrop * 100)}%)`;
        scenarioDescription = `Deploy cloud token queue dispatch and digital point-of-care rapid triage.`;
        simulatedFactors.waitingTime = Math.max(10, Math.round(baselineFactors.waitingTime * (1 - waitDrop * 0.70)));
        simulatedFactors.processComplexity = Math.max(10, Math.round(baselineFactors.processComplexity * (1 - waitDrop * 0.25)));
        estimatedCostInr = 85000;
        suggestedTimeline = '7 Days';
        policyMandateCode = 'DG-TOKEN-FT-02';
        break;
      }

      case 'add_healthcare_staff': {
        const staffAdded = parameterModifications.staffCountAdded || 4;
        const staffGain = Math.min(0.65, staffAdded * 0.08);
        scenarioTitle = `Deploy +${staffAdded} Healthcare Staff & Medical Officers`;
        scenarioDescription = `Station rotational medical officers and auxiliary triage nurses at high-volume clinics.`;
        simulatedFactors.facilityCapacity = Math.max(10, Math.round(baselineFactors.facilityCapacity * (1 - staffGain * 0.50)));
        simulatedFactors.waitingTime = Math.max(10, Math.round(baselineFactors.waitingTime * (1 - staffGain * 0.45)));
        simulatedFactors.referralDelays = Math.max(10, Math.round(baselineFactors.referralDelays * (1 - staffGain * 0.35)));
        estimatedCostInr = staffAdded * 45000;
        suggestedTimeline = '21 Days';
        policyMandateCode = 'HR-STAFF-SANC-08';
        break;
      }

      case 'improve_referral_coordination': {
        scenarioTitle = `Electronic Referral Coordination & Priority Bed Reservation`;
        scenarioDescription = `Establishes pre-cleared digital referral handshakes between rural PHCs and tertiary hospitals.`;
        simulatedFactors.referralDelays = Math.max(10, Math.round(baselineFactors.referralDelays * 0.30));
        simulatedFactors.continuityOfCare = Math.max(10, Math.round(baselineFactors.continuityOfCare * 0.65));
        estimatedCostInr = 120000;
        suggestedTimeline = '10 Days';
        policyMandateCode = 'REF-COORD-INT-05';
        break;
      }

      case 'add_mobile_health_services': {
        const days = parameterModifications.mobileServiceFrequencyDays || 3;
        scenarioTitle = `Deploy Mobile Medical Unit (${days} Days/Week Coverage)`;
        scenarioDescription = `Brings doorstep diagnostics, antenatal checks, and essential drug refills directly to isolated habitations.`;
        simulatedFactors.accessibility = Math.max(10, Math.round(baselineFactors.accessibility * 0.35));
        simulatedFactors.cost = Math.max(10, Math.round(baselineFactors.cost * 0.45));
        simulatedFactors.waitingTime = Math.max(10, Math.round(baselineFactors.waitingTime * 0.70));
        estimatedCostInr = 250000;
        suggestedTimeline = '14 Days';
        policyMandateCode = 'MMU-CORRIDOR-03';
        break;
      }

      case 'improve_transportation_access': {
        const subsidy = (parameterModifications.transitSubsidyPct || 60) / 100;
        scenarioTitle = `Subsidized Community Feeder Shuttle (${Math.round(subsidy * 100)}% Transport Subsidy)`;
        scenarioDescription = `Provides scheduled feeder transportation connecting peripheral villages to the nearest CHC.`;
        simulatedFactors.accessibility = Math.max(10, Math.round(baselineFactors.accessibility * (1 - subsidy * 0.60)));
        simulatedFactors.cost = Math.max(10, Math.round(baselineFactors.cost * (1 - subsidy * 0.45)));
        estimatedCostInr = 65000;
        suggestedTimeline = '7 Days';
        policyMandateCode = 'TRANSIT-FEEDER-01';
        break;
      }

      case 'extend_service_hours': {
        const hours = parameterModifications.serviceHoursExtended || 4;
        scenarioTitle = `Extend Clinic Service Hours (+${hours} Hours Evening Shifts)`;
        scenarioDescription = `Operates after-work evening clinics to prevent daily-wage loss and ease daytime peak rush.`;
        simulatedFactors.waitingTime = Math.max(10, Math.round(baselineFactors.waitingTime * 0.55));
        simulatedFactors.facilityCapacity = Math.max(10, Math.round(baselineFactors.facilityCapacity * 0.65));
        simulatedFactors.cost = Math.max(10, Math.round(baselineFactors.cost * 0.75));
        estimatedCostInr = 95000;
        suggestedTimeline = '7 Days';
        policyMandateCode = 'OPD-EXT-SHIFT-09';
        break;
      }

      case 'reduce_process_steps': {
        const steps = parameterModifications.processStepsRemoved || 3;
        scenarioTitle = `Single-Window Intake (-${steps} Bureaucratic Steps)`;
        scenarioDescription = `Replaces physical multi-counter verification with unified digital ABHA instant biometric authorization.`;
        simulatedFactors.processComplexity = Math.max(10, Math.round(baselineFactors.processComplexity * 0.35));
        simulatedFactors.waitingTime = Math.max(10, Math.round(baselineFactors.waitingTime * 0.70));
        estimatedCostInr = 45000;
        suggestedTimeline = '10 Days';
        policyMandateCode = 'ADMIN-PROC-BYPASS-06';
        break;
      }

      case 'improve_information_availability': {
        scenarioTitle = `Vernacular Dialect Navigators & Automated Audio Guidance`;
        scenarioDescription = `Integrates native language navigators and automated SMS audio prompts to remove linguistic alienation.`;
        simulatedFactors.informationBarriers = Math.max(10, Math.round(baselineFactors.informationBarriers * 0.28));
        simulatedFactors.processComplexity = Math.max(10, Math.round(baselineFactors.processComplexity * 0.75));
        estimatedCostInr = 35000;
        suggestedTimeline = '5 Days';
        policyMandateCode = 'INFO-NAV-VERNAC-07';
        break;
      }

      default: {
        scenarioTitle = 'Multi-Modal Healthcare Accessibility Improvement';
        scenarioDescription = 'Balanced operational intervention targeting waiting time and transport.';
        simulatedFactors.waitingTime = Math.max(10, Math.round(baselineFactors.waitingTime * 0.65));
        simulatedFactors.accessibility = Math.max(10, Math.round(baselineFactors.accessibility * 0.70));
      }
    }

    // 3. Compute Simulated Composite Score
    const simulatedScore = Math.min(100, Math.max(8, Math.round(
      simulatedFactors.accessibility * 0.15 +
      simulatedFactors.waitingTime * 0.15 +
      simulatedFactors.cost * 0.15 +
      simulatedFactors.processComplexity * 0.12 +
      simulatedFactors.referralDelays * 0.11 +
      simulatedFactors.facilityCapacity * 0.12 +
      simulatedFactors.informationBarriers * 0.10 +
      simulatedFactors.continuityOfCare * 0.10
    )));

    const scoreDifference = Math.max(0, baselineScore - simulatedScore);
    const frictionReductionPct = baselineScore > 0 ? Math.round((scoreDifference / baselineScore) * 100) : 0;
    const completionGainPct = Math.round(frictionReductionPct * 0.85);
    const qalySavedEst = +(scoreDifference * (affectedPopulation / 1000) * 0.12).toFixed(1);
    const adherenceRecoveryCount = Math.round((completionGainPct / 100) * affectedPopulation * 0.45);

    // 4. Factor Drivers Decomposition
    const factorLabels: Record<keyof IFrictionFactors, string> = {
      accessibility: 'Physical Transit & Accessibility',
      waitingTime: 'OPD Queuing & Waiting Time',
      cost: 'Direct Cost & Subsistence Wage Loss',
      processComplexity: 'Administrative Process Complexity',
      referralDelays: 'Referral Coordination & Specialist Delay',
      facilityCapacity: 'Facility Capacity & Staffing Ratio',
      informationBarriers: 'Information Availability & Language',
      continuityOfCare: 'Continuity of Care & Supply Resilience',
    };

    const mainDrivers: ISimulationDriver[] = (Object.keys(baselineFactors) as (keyof IFrictionFactors)[])
      .map((key) => {
        const base = baselineFactors[key];
        const sim = simulatedFactors[key];
        const delta = base - sim;
        return {
          factor: factorLabels[key],
          factorKey: key,
          baselineScore: base,
          simulatedScore: sim,
          delta,
          description: delta > 0
            ? `Drops from ${base}/100 to ${sim}/100 (-${delta} pts) through targeted intervention.`
            : `Maintains current baseline at ${base}/100.`,
        };
      })
      .sort((a, b) => b.delta - a.delta);

    // 5. Authority Resolution
    let responsibleAuthority = 'District Magistrate & Collector';
    let authorityTitle = 'District Health Executive Authority';

    if (targetName.includes('Patna')) {
      responsibleAuthority = 'District Magistrate, Patna & Civil Surgeon (PMCH)';
      authorityTitle = 'Patna District Health Mission Command';
    } else if (targetName.includes('Gaya')) {
      responsibleAuthority = 'District Magistrate, Gaya & CMO (ANMMCH)';
      authorityTitle = 'Gaya District Public Health Executive';
    } else if (targetName.includes('Purnia')) {
      responsibleAuthority = 'District Magistrate, Purnia & Civil Surgeon (Sadar)';
      authorityTitle = 'Purnia Border Region Healthcare Directorate';
    } else if (targetName.includes('Muzaffarpur')) {
      responsibleAuthority = 'District Magistrate, Muzaffarpur & CMO (SKMCH)';
      authorityTitle = 'Tirhut Division Healthcare Command';
    } else {
      responsibleAuthority = 'State Mission Director, National Health Mission (NHM)';
      authorityTitle = 'State Public Health Oversight Authority';
    }

    // 6. Evidence-based Recommended Intervention for Responsible Authority
    const recommendedIntervention = {
      authorityTitle,
      responsibleAuthority,
      recommendedAction: `Statutory Implementation Mandate: ${scenarioTitle}`,
      directiveSummary: `Deploy ${scenarioTitle} for ${targetName}. Projected to eliminate ${scoreDifference} points of non-clinical friction (lowering score to ${simulatedScore}/100) and rescue an estimated ${adherenceRecoveryCount} patients from secondary treatment abandonment.`,
      estimatedCostInr,
      implementationTimeline: suggestedTimeline,
      successKpi: `Achieve PFI score <= ${simulatedScore}/100 and >= ${completionGainPct}% increase in secondary treatment completion within ${suggestedTimeline}.`,
      policyMandateCode,
    };

    // 7. Confidence & Data Quality Score
    const confidenceScore = Math.min(98, Math.max(82, 80 + Math.min(18, sampleSize * 2)));
    const dataQuality: 'HIGH' | 'MEDIUM' | 'ADEQUATE' = sampleSize >= 15 ? 'HIGH' : (sampleSize >= 5 ? 'MEDIUM' : 'ADEQUATE');

    return {
      simulationId,
      level,
      targetId,
      targetName,
      scenarioType,
      scenarioTitle,
      scenarioDescription,
      parameterModifications,
      currentScore: baselineScore,
      simulatedScore,
      scoreDifference,
      currentTier: this.getFrictionTier(baselineScore),
      simulatedTier: this.getFrictionTier(simulatedScore),
      affectedPopulation,
      mainDrivers,
      expectedImpact: {
        frictionReductionPct,
        completionGainPct,
        qalySavedEst,
        adherenceRecoveryCount,
      },
      confidenceDataQuality: {
        confidenceScore,
        sampleSize,
        dataQuality,
        marginOfErrorPct: +(100 - confidenceScore).toFixed(1),
      },
      baselineFactors,
      simulatedFactors,
      recommendedIntervention,
      requiresHumanApproval: true,
      approvalStatus: 'PENDING_OFFICER_REVIEW',
    };
  }

  // -------------------------------------------------------------------------
  // 8. Human Officer Approval & Digital Signature
  // -------------------------------------------------------------------------
  public approveIntervention(
    recommendationId: string,
    officerName: string,
    officerRole: string,
    remarks: string,
    chosenCandidate?: string
  ): {
    approvalId: string;
    signatureHash: string;
    timestamp: string;
    status: 'APPROVED' | 'DISPATCHED';
    implementationSlaHours: number;
  } {
    const timestamp = new Date().toISOString();
    const payload = `${recommendationId}|${officerName}|${officerRole}|${remarks}|${chosenCandidate || 'DEFAULT'}|${timestamp}`;
    const signatureHash = crypto.createHash('sha256').update(payload).digest('hex');

    return {
      approvalId: `APV-${Date.now()}-${signatureHash.substring(0, 8)}`,
      signatureHash,
      timestamp,
      status: 'DISPATCHED',
      implementationSlaHours: 48,
    };
  }
}

export const multiLevelFrictionEngine = MultiLevelFrictionEngine.getInstance();
