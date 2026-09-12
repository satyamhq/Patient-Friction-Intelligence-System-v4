import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { WhatIfSimulator, INTERVENTION_CATALOG } from '../intelligence/optimization/whatIfSimulator.js';
import { Simulation } from '../models/Simulation.js';
import { AuditService } from '../services/auditService.js';

export class SimulationController {
  public static async getCatalog(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      count: INTERVENTION_CATALOG.length,
      interventions: INTERVENTION_CATALOG,
    });
  }

  public static async runSimulation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { selectedCodes, baselineProbability, cohortSize, saveScenario, scenarioName } = req.body;

      const baseline = baselineProbability !== undefined ? parseFloat(baselineProbability) : 37;
      const cohort = cohortSize !== undefined ? parseInt(cohortSize, 10) : 1000;
      const codes = Array.isArray(selectedCodes) ? selectedCodes : [];

      const result = WhatIfSimulator.simulate(codes, baseline, cohort);

      let savedDoc: any = null;
      if (saveScenario && scenarioName) {
        savedDoc = await Simulation.create({
          title: scenarioName,
          scenarioName,
          baselineCompletionProbability: result.baselineCompletionProbability,
          simulatedCompletionProbability: result.simulatedCompletionProbability,
          improvementDeltaPercent: result.improvementDeltaPercent,
          selectedInterventionCodes: codes,
          totalBudgetRequiredINR: result.totalBudgetINR,
          estimatedPatientsHelped: result.estimatedPatientsHelped,
          runByUserId: req.user?._id,
        });

        await AuditService.log('SIMULATION_SAVED', 'Simulation', req, {
          userId: req.user?._id,
          resourceId: savedDoc._id.toString(),
        });
      }

      res.status(200).json({
        success: true,
        simulation: result,
        savedScenario: savedDoc,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Simulation execution failed.' });
    }
  }

  public static async getSavedSimulations(req: Request, res: Response): Promise<void> {
    try {
      const simulations = await Simulation.find().sort({ createdAt: -1 }).limit(20);
      res.status(200).json({ success: true, simulations });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch simulations.' });
    }
  }
}
