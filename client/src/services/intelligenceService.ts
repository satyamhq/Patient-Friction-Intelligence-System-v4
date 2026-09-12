import { api } from './api';
import { InterventionItem } from '../types';

export interface SimulationResponse {
  success: boolean;
  simulation: {
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
  };
  savedScenario?: any;
}

export interface OptimizationResponse {
  success: boolean;
  recommendation: {
    availableBudgetINR: number;
    totalAllocatedCostINR: number;
    remainingBudgetINR: number;
    selectedInterventions: InterventionItem[];
    projectedBaselineProbability: number;
    projectedOptimizedProbability: number;
    projectedGainPercent: number;
    estimatedPatientsHelped: number;
    costPerPatientHelpedINR: number;
    rationale: string;
    sensitivityAnalysis: {
      reducedBudgetScenario: { budgetINR: number; projectedGainPercent: number; items: string[] };
      expandedBudgetScenario: { budgetINR: number; projectedGainPercent: number; items: string[] };
    };
  };
}

export const intelligenceService = {
  async getCatalog(): Promise<{ success: boolean; interventions: InterventionItem[] }> {
    const res = await api.get('/simulation/catalog');
    return res.data;
  },

  async runSimulation(payload: {
    selectedCodes: string[];
    baselineProbability?: number;
    cohortSize?: number;
    saveScenario?: boolean;
    scenarioName?: string;
  }): Promise<SimulationResponse> {
    const res = await api.post('/simulation', payload);
    return res.data;
  },

  async getSavedSimulations(): Promise<{ success: boolean; simulations: any[] }> {
    const res = await api.get('/simulation/saved');
    return res.data;
  },

  async optimizeBudget(payload: {
    budgetINR: number;
    baselineProbability?: number;
    cohortSize?: number;
  }): Promise<OptimizationResponse> {
    const res = await api.post('/interventions/optimize', payload);
    return res.data;
  },
};
