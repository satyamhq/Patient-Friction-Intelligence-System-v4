export interface InterventionMeta {
  code: string;
  name: string;
  category: string;
  unitCostINR: number;
  baseGainPercent: number;
  reachPatientsPerUnit: number;
  description: string;
  geographicSuitability: string[];
}

export const INTERVENTION_CATALOG: InterventionMeta[] = [
  {
    code: 'COMMUNITY_TRANSPORT',
    name: 'Scheduled Community Health Shuttle',
    category: 'Transport',
    unitCostINR: 400000,
    baseGainPercent: 25,
    reachPatientsPerUnit: 600,
    description: 'Fixed-schedule shared mini-bus connecting rural cluster stops to the district hospital.',
    geographicSuitability: ['Rural Remote', 'Tribal Belts', 'Hilly Terrain'],
  },
  {
    code: 'LOCAL_DIAGNOSTICS',
    name: 'Point-of-Care Satellite Diagnostic Camp',
    category: 'Diagnostics',
    unitCostINR: 300000,
    baseGainPercent: 17,
    reachPatientsPerUnit: 850,
    description: 'Mobile pathology and digital X-ray unit deployed weekly to village primary health centers.',
    geographicSuitability: ['Rural', 'Semi-urban'],
  },
  {
    code: 'HEALTH_WORKER',
    name: 'Dedicated ASHA/Care Coordinator Escort',
    category: 'Community Staff',
    unitCostINR: 150000,
    baseGainPercent: 12,
    reachPatientsPerUnit: 400,
    description: 'Community health worker accompanying elderly and illiterate patients through hospital queues.',
    geographicSuitability: ['All Regions', 'Elderly Clusters'],
  },
  {
    code: 'TELECONSULTATION',
    name: 'Village Tele-Triage & Digital OPD Kiosk',
    category: 'Digital',
    unitCostINR: 120000,
    baseGainPercent: 10,
    reachPatientsPerUnit: 900,
    description: 'Assisted video triage booth at Gram Panchayat to filter cases needing physical travel.',
    geographicSuitability: ['Semi-urban', 'Rural'],
  },
  {
    code: 'MEDICINE_DELIVERY',
    name: 'Last-Mile Essential Drug Postal Delivery',
    category: 'Logistics',
    unitCostINR: 80000,
    baseGainPercent: 8,
    reachPatientsPerUnit: 700,
    description: 'Home courier delivery of 60-day maintenance prescriptions for chronic condition patients.',
    geographicSuitability: ['Rural Remote', 'Urban Slum'],
  },
  {
    code: 'OFFLINE_SUPPORT',
    name: 'Offline Token Booking & Weekend OPD Helpdesk',
    category: 'Administrative',
    unitCostINR: 60000,
    baseGainPercent: 7,
    reachPatientsPerUnit: 500,
    description: 'Physical token booking counter and afternoon appointment slots for daily wage workers.',
    geographicSuitability: ['Urban Slum', 'Semi-urban'],
  },
  {
    code: 'LANGUAGE_SUPPORT',
    name: 'Multi-lingual Voice IVR & Dialect Translators',
    category: 'Digital',
    unitCostINR: 50000,
    baseGainPercent: 6,
    reachPatientsPerUnit: 1200,
    description: 'Automated regional language voice guidance and on-premise dialect translators.',
    geographicSuitability: ['Tribal Belts', 'Migrant Clusters'],
  },
  {
    code: 'DOCUMENTATION_DESK',
    name: 'Gram Panchayat Scheme & PM-JAY Onboarding Desk',
    category: 'Administrative',
    unitCostINR: 40000,
    baseGainPercent: 6,
    reachPatientsPerUnit: 450,
    description: 'On-the-spot biometric verification and scheme card printing at village administrative center.',
    geographicSuitability: ['All Rural Belts'],
  },
];

export interface SimulationResult {
  baselineCompletionProbability: number;
  simulatedCompletionProbability: number;
  improvementDeltaPercent: number;
  totalBudgetINR: number;
  estimatedPatientsHelped: number;
  appliedInterventions: {
    code: string;
    name: string;
    category: string;
    unitCostINR: number;
    estimatedGainPercent: number;
    patientsReached: number;
  }[];
  diminishingReturnsEfficiency: number;
  geographicImpactSummary: string;
  disclaimer: string;
}

export class WhatIfSimulator {
  /**
   * Simulates the combined impact of selected intervention codes on care completion probability
   */
  public static simulate(
    selectedCodes: string[],
    baselineProbability: number = 37,
    cohortSize: number = 1000
  ): SimulationResult {
    const selectedInterventions = INTERVENTION_CATALOG.filter((item) =>
      selectedCodes.includes(item.code)
    );

    if (selectedInterventions.length === 0) {
      return {
        baselineCompletionProbability: baselineProbability,
        simulatedCompletionProbability: baselineProbability,
        improvementDeltaPercent: 0,
        totalBudgetINR: 0,
        estimatedPatientsHelped: 0,
        appliedInterventions: [],
        diminishingReturnsEfficiency: 100,
        geographicImpactSummary: 'No interventions selected.',
        disclaimer: 'Simulation / Estimated Impact. Non-clinical operational forecast.',
      };
    }

    let unaddressedGap = 100 - baselineProbability; // e.g. 100 - 37 = 63%
    let currentGap = unaddressedGap;
    let totalBudget = 0;
    let totalReach = 0;
    const applied: SimulationResult['appliedInterventions'] = [];

    // Apply interventions with diminishing returns factor
    selectedInterventions.forEach((item, index) => {
      totalBudget += item.unitCostINR;
      totalReach += item.reachPatientsPerUnit;

      // Diminishing returns dampener (1st is 1.0, 2nd is 0.88, 3rd is 0.78, etc.)
      const dampener = Math.pow(0.88, index);
      const effectiveGain = item.baseGainPercent * dampener;
      const reduction = currentGap * (effectiveGain / 100);
      currentGap = Math.max(2, currentGap - reduction);

      applied.push({
        code: item.code,
        name: item.name,
        category: item.category,
        unitCostINR: item.unitCostINR,
        estimatedGainPercent: parseFloat(effectiveGain.toFixed(1)),
        patientsReached: item.reachPatientsPerUnit,
      });
    });

    const simulatedProbability = Math.min(94, Math.round(100 - currentGap));
    const improvementDelta = simulatedProbability - baselineProbability;
    const estimatedPatientsHelped = Math.round(cohortSize * (improvementDelta / 100));
    const theoreticalSumOfGains = selectedInterventions.reduce(
      (sum, item) => sum + item.baseGainPercent,
      0
    );
    const diminishingReturnsEfficiency = Math.round(
      (improvementDelta / (theoreticalSumOfGains || 1)) * 100
    );

    const geographicImpactSummary = `Combined deployment across targeted high-friction clusters reaches an estimated ${totalReach.toLocaleString('en-IN')} patient encounters, mitigating geographic transit and administrative dropouts.`;

    return {
      baselineCompletionProbability: baselineProbability,
      simulatedCompletionProbability: simulatedProbability,
      improvementDeltaPercent: improvementDelta,
      totalBudgetINR: totalBudget,
      estimatedPatientsHelped,
      appliedInterventions: applied,
      diminishingReturnsEfficiency: Math.min(100, diminishingReturnsEfficiency),
      geographicImpactSummary,
      disclaimer: 'Simulation / Estimated Impact. Non-clinical operational forecast.',
    };
  }
}
