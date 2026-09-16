import { Router } from 'express';
import {
  getHierarchy,
  getIndividualFriction,
  getVillageFriction,
  getDistrictFriction,
  simulateIntervention,
  approveIntervention,
  recordOutcome,
  getInterventionsLedger,
} from '../controllers/multiLevelFrictionController.js';

const router = Router();

// Hierarchy of districts and villages
router.get('/hierarchy', getHierarchy);

// Individual patient / journey calculations
router.get('/individual/:journeyId', getIndividualFriction);

// Village-level calculations
router.get('/village', getVillageFriction);

// District-level calculations
router.get('/district', getDistrictFriction);

// What-If Intervention Simulator
router.post('/simulate', simulateIntervention);

// Human Officer Approval
router.post('/approve', approveIntervention);

// Measure & Learn Outcome Recording
router.post('/outcome', recordOutcome);

// Interventions Ledger
router.get('/ledger', getInterventionsLedger);

export default router;
