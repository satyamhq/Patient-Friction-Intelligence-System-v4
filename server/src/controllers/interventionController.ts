import { Request, Response } from 'express';
import { InterventionOptimizer } from '../intelligence/optimization/interventionOptimizer.js';
import { INTERVENTION_CATALOG } from '../intelligence/optimization/whatIfSimulator.js';
import { Intervention } from '../models/Intervention.js';

export class InterventionController {
  public static async getInterventions(req: Request, res: Response): Promise<void> {
    try {
      const dbInterventions = await Intervention.find({ isActive: true });
      if (dbInterventions.length > 0) {
        res.status(200).json({ success: true, interventions: dbInterventions });
        return;
      }
      res.status(200).json({ success: true, interventions: INTERVENTION_CATALOG });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch interventions.' });
    }
  }

  public static async optimize(req: Request, res: Response): Promise<void> {
    try {
      const budgetINR = parseFloat(req.body.budgetINR) || 1000000;
      const baselineProbability = parseFloat(req.body.baselineProbability) || 37;
      const cohortSize = parseInt(req.body.cohortSize, 10) || 1000;

      const recommendation = InterventionOptimizer.optimize(
        budgetINR,
        baselineProbability,
        cohortSize
      );

      res.status(200).json({
        success: true,
        recommendation,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Optimization failed.' });
    }
  }
}
