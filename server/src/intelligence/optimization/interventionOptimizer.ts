import { INTERVENTION_CATALOG, InterventionMeta, WhatIfSimulator } from './whatIfSimulator.js';

export interface OptimizationRecommendation {
  availableBudgetINR: number;
  totalAllocatedCostINR: number;
  remainingBudgetINR: number;
  selectedInterventions: InterventionMeta[];
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
}

export class InterventionOptimizer {
  /**
   * Optimizes intervention selection to maximize accessibility score gain within a specified budget
   */
  public static optimize(
    budgetINR: number = 1000000,
    baselineProbability: number = 37,
    cohortSize: number = 1000
  ): OptimizationRecommendation {
    const items = [...INTERVENTION_CATALOG];
    const n = items.length;

    // Use 0/1 Knapsack optimization based on cost-efficiency score (Gain * Reach / UnitCost)
    let bestSubset: InterventionMeta[] = [];
    let bestScore = -1;
    let bestSimResult: any = null;

    const totalSubsets = 1 << n; // 2^8 = 256 combinations (fast & exact)

    for (let i = 1; i < totalSubsets; i++) {
      const subset: InterventionMeta[] = [];
      let currentCost = 0;

      for (let j = 0; j < n; j++) {
        if ((i & (1 << j)) !== 0) {
          subset.push(items[j]);
          currentCost += items[j].unitCostINR;
        }
      }

      if (currentCost <= budgetINR) {
        const codes = subset.map((s) => s.code);
        const sim = WhatIfSimulator.simulate(codes, baselineProbability, cohortSize);
        // Objective: maximize estimated improvement and patient reach efficiency
        const score = sim.improvementDeltaPercent * 100 + sim.estimatedPatientsHelped;

        if (score > bestScore) {
          bestScore = score;
          bestSubset = subset;
          bestSimResult = sim;
        }
      }
    }

    // If no combination fit within a very small budget, pick the cheapest item if it fits
    if (bestSubset.length === 0) {
      const cheapest = [...items].sort((a, b) => a.unitCostINR - b.unitCostINR)[0];
      if (cheapest.unitCostINR <= budgetINR) {
        bestSubset = [cheapest];
        bestSimResult = WhatIfSimulator.simulate([cheapest.code], baselineProbability, cohortSize);
      } else {
        return {
          availableBudgetINR: budgetINR,
          totalAllocatedCostINR: 0,
          remainingBudgetINR: budgetINR,
          selectedInterventions: [],
          projectedBaselineProbability: baselineProbability,
          projectedOptimizedProbability: baselineProbability,
          projectedGainPercent: 0,
          estimatedPatientsHelped: 0,
          costPerPatientHelpedINR: 0,
          rationale: `Budget of ₹${budgetINR.toLocaleString('en-IN')} is insufficient to fund the lowest-cost community intervention (Minimum needed: ₹${cheapest.unitCostINR.toLocaleString('en-IN')}).`,
          sensitivityAnalysis: {
            reducedBudgetScenario: { budgetINR: budgetINR * 0.75, projectedGainPercent: 0, items: [] },
            expandedBudgetScenario: { budgetINR: budgetINR * 1.5, projectedGainPercent: 15, items: [cheapest.name] },
          },
        };
      }
    }

    const totalAllocated = bestSubset.reduce((sum, item) => sum + item.unitCostINR, 0);
    const remaining = budgetINR - totalAllocated;
    const costPerPatient = Math.round(totalAllocated / (bestSimResult.estimatedPatientsHelped || 1));

    const itemNames = bestSubset.map((s) => s.name).join(', ');
    const rationale = `Recommended optimal portfolio (${bestSubset.length} interventions: ${itemNames}) yields the highest estimated care completion improvement (+${bestSimResult.improvementDeltaPercent} percentage points) and reaches ~${bestSimResult.estimatedPatientsHelped} patients within the ₹${budgetINR.toLocaleString('en-IN')} budget cap (₹${costPerPatient.toLocaleString('en-IN')} per patient helped).`;

    // Sensitivity scenarios
    const reducedBudget = Math.round(budgetINR * 0.7);
    const expandedBudget = Math.round(budgetINR * 1.3);
    const reducedOpt = this.quickOptimize(reducedBudget, baselineProbability, cohortSize);
    const expandedOpt = this.quickOptimize(expandedBudget, baselineProbability, cohortSize);

    return {
      availableBudgetINR: budgetINR,
      totalAllocatedCostINR: totalAllocated,
      remainingBudgetINR: remaining,
      selectedInterventions: bestSubset,
      projectedBaselineProbability: baselineProbability,
      projectedOptimizedProbability: bestSimResult.simulatedCompletionProbability,
      projectedGainPercent: bestSimResult.improvementDeltaPercent,
      estimatedPatientsHelped: bestSimResult.estimatedPatientsHelped,
      costPerPatientHelpedINR: costPerPatient,
      rationale,
      sensitivityAnalysis: {
        reducedBudgetScenario: {
          budgetINR: reducedBudget,
          projectedGainPercent: reducedOpt.gain,
          items: reducedOpt.items,
        },
        expandedBudgetScenario: {
          budgetINR: expandedBudget,
          projectedGainPercent: expandedOpt.gain,
          items: expandedOpt.items,
        },
      },
    };
  }

  private static quickOptimize(
    budget: number,
    baseline: number,
    cohort: number
  ): { gain: number; items: string[] } {
    const items = [...INTERVENTION_CATALOG].sort(
      (a, b) => b.baseGainPercent / b.unitCostINR - a.baseGainPercent / a.unitCostINR
    );
    const selected: string[] = [];
    let spent = 0;
    for (const item of items) {
      if (spent + item.unitCostINR <= budget) {
        selected.push(item.code);
        spent += item.unitCostINR;
      }
    }
    const sim = WhatIfSimulator.simulate(selected, baseline, cohort);
    const names = INTERVENTION_CATALOG.filter((i) => selected.includes(i.code)).map((i) => i.name);
    return { gain: sim.improvementDeltaPercent, items: names };
  }
}
