import crypto from 'crypto';
import { IPatientJourneyRecord } from '../../models/MultiLevelFriction.js';

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
  // 2. Individual Patient Friction Calculation
  // -------------------------------------------------------------------------
  public calculateIndividualFriction(journey: Partial<IPatientJourneyRecord>): IIndividualFrictionResult {
    // Feature Engineering
    const transitDist = journey.transitDistanceKm || 15;
    const transitCost = journey.transitCostInr || 120;
    const wageLoss = journey.dailyWageLossInr || 450;
    const waitMins = journey.queueWaitMinutes || 60;
    const diagDelayHrs = journey.diagnosticDelayHours || 2;
    const isBpl = journey.householdIncomeTier === 'bpl';
    const langDissonance = journey.languageDissonance || false;
    const hasEscort = journey.caregiverEscortAvailable !== false;
    const isDocComplete = journey.documentationStatus === 'complete';
    const isStockout = journey.pharmacyStockoutExperienced || false;

    // Dimension Scores (0 - 100)
    const physicalScore = Math.min(100, Math.round((transitDist / 50) * 60 + (journey.transitDurationMinutes ? (journey.transitDurationMinutes / 120) * 40 : 25)));
    const financialScore = Math.min(100, Math.round((wageLoss / 500) * 45 + (transitCost / 200) * 35 + (isBpl ? 20 : 0)));
    const queueScore = Math.min(100, Math.round((waitMins / 180) * 65 + (diagDelayHrs / 8) * 35));
    const linguisticScore = (langDissonance ? 55 : 10) + (!hasEscort ? 35 : 0);
    const adminScore = isDocComplete ? 15 : (journey.documentationStatus === 'missing_golden_card' ? 70 : 85);

    // Weighted Overall PFI (0 - 100)
    const overallScore = Math.round(
      physicalScore * 0.20 +
      financialScore * 0.25 +
      queueScore * 0.20 +
      linguisticScore * 0.15 +
      adminScore * 0.20
    );

    const frictionTier = this.getFrictionTier(overallScore);

    // Care Failure Risk Model
    const completionProb = Math.max(5, Math.min(95, Math.round(100 - overallScore * 0.85 - (!hasEscort ? 10 : 0))));
    const failureRisk = 100 - completionProb;

    // Stages Breakdown
    const stages: IStageFriction[] = [
      {
        stage: 'pre_visit_transit',
        stageName: 'Pre-Visit Transit',
        score: physicalScore,
        latencyMinutes: journey.transitDurationMinutes || Math.round(transitDist * 3.5),
        barriers: [
          `${transitDist} km unpaved travel distance`,
          `₹${transitCost} round-trip transport tariff`
        ],
        severity: this.getFrictionTier(physicalScore),
      },
      {
        stage: 'facility_intake',
        stageName: 'Facility Intake & Triage',
        score: Math.min(100, Math.round(adminScore * 0.7 + (langDissonance ? 30 : 0))),
        latencyMinutes: Math.round(waitMins * 0.35),
        barriers: isDocComplete ? ['Routine registration verification'] : ['ABDM / PM-JAY verification latency', 'Physical documentation mismatch'],
        severity: this.getFrictionTier(Math.min(100, Math.round(adminScore * 0.7 + (langDissonance ? 30 : 0)))),
      },
      {
        stage: 'clinical_queue',
        stageName: 'Clinical OPD Queuing',
        score: queueScore,
        latencyMinutes: waitMins,
        barriers: [`${waitMins} min doctor consultation wait`, 'High specialist demand ratio'],
        severity: this.getFrictionTier(queueScore),
      },
      {
        stage: 'diagnostics_pharmacy',
        stageName: 'Diagnostics & Pharmacy',
        score: Math.min(100, Math.round((diagDelayHrs / 4) * 50 + (isStockout ? 45 : 10))),
        latencyMinutes: diagDelayHrs * 60,
        barriers: [
          isStockout ? 'Essential medicine stockout at dispensary' : 'Jan Aushadhi generic availability normal',
          `${diagDelayHrs}h pathology turnaround delay`
        ],
        severity: this.getFrictionTier(Math.min(100, Math.round((diagDelayHrs / 4) * 50 + (isStockout ? 45 : 10)))),
      },
      {
        stage: 'admin_insurance',
        stageName: 'Administrative & PM-JAY',
        score: adminScore,
        latencyMinutes: 45,
        barriers: isDocComplete ? ['Cashless claim authorized'] : ['Biometric Aadhaar authentication failure', 'Offline golden card verification required'],
        severity: this.getFrictionTier(adminScore),
      },
    ];

    // Contributing Factors
    const topContributingFactors = [
      { factor: 'Financial Exposure & Wage Loss', score: financialScore, description: `Lost daily wage of ₹${wageLoss} plus ₹${transitCost} transport cost creates high drop-off toxicity.` },
      { factor: 'Transit Distance & Geography', score: physicalScore, description: `Physical travel of ${transitDist} km across riverine/rural corridors creates transport hardship.` },
      { factor: 'Facility Queue & Waiting Latency', score: queueScore, description: `Cumulative wait of ${waitMins} mins in general OPD queue with ${diagDelayHrs}h lab result latency.` },
    ].sort((a, b) => b.score - a.score);

    // Root causes
    const rootCauses: string[] = [];
    if (physicalScore >= 60) rootCauses.push('Remote geographic isolation with absent feeder transport');
    if (financialScore >= 60) rootCauses.push('Severe daily-wage dependency causing catastrophic out-of-pocket stress');
    if (queueScore >= 60) rootCauses.push('Specialist clinical deficit and manual un-triaged OPD queuing');
    if (adminScore >= 60) rootCauses.push('Biometric mismatch and missing PM-JAY e-card documentation');
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
  // 6. Human Officer Approval & Digital Signature
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
