import { Request, Response } from 'express';
import {
  multiLevelFrictionEngine,
  FrictionTier,
} from '../intelligence/friction/multiLevelFrictionEngine.js';
import {
  getSeedJourneys,
  SYNTHETIC_DISTRICTS,
} from '../seed/multiLevelFrictionSeed.js';

// Global intervention ledger
const interventionLedger: any[] = [];

export const getHierarchy = async (req: Request, res: Response): Promise<void> => {
  try {
    const journeys = getSeedJourneys();

    const hierarchy = SYNTHETIC_DISTRICTS.map((d) => {
      const districtJourneys = journeys.filter((j) => j.district.toLowerCase() === d.district.toLowerCase());
      const villages = d.villages.map((v) => {
        const vJourneys = districtJourneys.filter((j) => j.village.toLowerCase() === v.toLowerCase());
        const avg = vJourneys.length > 0
          ? Math.round(vJourneys.reduce((s, j) => s + (j.frictionScore || 0), 0) / vJourneys.length)
          : 0;
        return {
          village: v,
          journeyCount: vJourneys.length,
          avgFriction: avg,
          tier: multiLevelFrictionEngine.getFrictionTier(avg),
        };
      });

      const distAvg = districtJourneys.length > 0
        ? Math.round(districtJourneys.reduce((s, j) => s + (j.frictionScore || 0), 0) / districtJourneys.length)
        : 0;

      return {
        district: d.district,
        totalJourneys: districtJourneys.length,
        avgFriction: distAvg,
        tier: multiLevelFrictionEngine.getFrictionTier(distAvg),
        villages,
      };
    });

    res.status(200).json({
      success: true,
      data: hierarchy,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getIndividualFriction = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.journeyId;
    const journeyId = String(Array.isArray(rawId) ? rawId[0] : rawId || '');
    const journeys = getSeedJourneys();

    if (!journeyId || journeyId === 'all') {
      res.status(200).json({
        success: true,
        data: journeys.map((j) => ({
          journeyId: j.journeyId,
          patientId: j.patientId,
          patientNameMasked: j.patientNameMasked,
          district: j.district,
          village: j.village,
          serviceCategory: j.serviceCategory,
          frictionScore: j.frictionScore,
          frictionTier: j.frictionTier,
          careFailureRisk: j.careFailureRisk,
        })),
      });
      return;
    }

    const journey = journeys.find(
      (j) => j.journeyId.toLowerCase() === journeyId.toLowerCase() || j.patientId.toLowerCase() === journeyId.toLowerCase()
    );

    if (!journey) {
      res.status(404).json({
        success: false,
        message: `Patient journey "${journeyId}" not found in database.`,
      });
      return;
    }

    const result = multiLevelFrictionEngine.calculateIndividualFriction(journey);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getVillageFriction = async (req: Request, res: Response): Promise<void> => {
  try {
    const district = (req.query.district as string) || 'Patna';
    const village = (req.query.village as string) || 'Danapur Diara';

    const journeys = getSeedJourneys();
    const result = multiLevelFrictionEngine.aggregateVillageFriction(district, village, journeys);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDistrictFriction = async (req: Request, res: Response): Promise<void> => {
  try {
    const district = (req.query.district as string) || 'Patna';
    const journeys = getSeedJourneys();
    const result = multiLevelFrictionEngine.aggregateDistrictFriction(district, journeys);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const simulateIntervention = async (req: Request, res: Response): Promise<void> => {
  try {
    const { baselineScore, candidateName, costBudgetInr, implementationType } = req.body;
    const base = Number(baselineScore) || 75;

    let frictionReductionPct = 45;
    let completionGainPct = 38;
    let cost = Number(costBudgetInr) || 85000;
    let slaHours = 48;

    if (implementationType === 'mobile_medical_unit') {
      frictionReductionPct = 52;
      completionGainPct = 46;
      cost = 85000;
      slaHours = 72;
    } else if (implementationType === 'asha_chaperone') {
      frictionReductionPct = 44;
      completionGainPct = 40;
      cost = 15000;
      slaHours = 24;
    } else if (implementationType === 'digital_token_fast_track') {
      frictionReductionPct = 36;
      completionGainPct = 30;
      cost = 25000;
      slaHours = 12;
    }

    const projectedScore = Math.max(12, Math.round(base * (1 - frictionReductionPct / 100)));
    const projectedTier: FrictionTier = multiLevelFrictionEngine.getFrictionTier(projectedScore);

    res.status(200).json({
      success: true,
      data: {
        candidateName: candidateName || 'Recommended Intervention',
        baselineScore: base,
        projectedScore,
        baselineTier: multiLevelFrictionEngine.getFrictionTier(base),
        projectedTier,
        frictionReductionPct,
        completionGainPct,
        qalySavedEst: +(frictionReductionPct * 0.05).toFixed(2),
        costInr: cost,
        slaHours,
        recommendationApprovedForExecution: false,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveIntervention = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      recommendationId,
      officerName,
      officerRole,
      remarks,
      chosenCandidate,
      targetEntity,
    } = req.body;

    if (!recommendationId || !officerName) {
      res.status(400).json({
        success: false,
        message: 'Recommendation ID and Authorized Officer Name are mandatory for approval.',
      });
      return;
    }

    const approval = multiLevelFrictionEngine.approveIntervention(
      recommendationId,
      officerName,
      officerRole || 'Authorized Health Officer',
      remarks || 'Statutory review completed. Dispatched for execution.',
      chosenCandidate
    );

    const record = {
      ...approval,
      recommendationId,
      officerName,
      officerRole: officerRole || 'Authorized Health Officer',
      remarks: remarks || 'Approved for frontline implementation',
      targetEntity: targetEntity || 'Selected Cohort',
      chosenCandidate: chosenCandidate || 'Default Fast-Track Intervention',
    };

    interventionLedger.unshift(record);

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recordOutcome = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      approvalId,
      actualCompletionAchieved,
      delayHours,
      patientSatisfactionRating,
      fieldNotes,
    } = req.body;

    const outcomeRecord = {
      outcomeId: `OUT-${Date.now()}`,
      approvalId: approvalId || 'APV-MANUAL',
      actualCompletionAchieved: Boolean(actualCompletionAchieved),
      delayHours: Number(delayHours) || 0,
      patientSatisfactionRating: Number(patientSatisfactionRating) || 5,
      fieldNotes: fieldNotes || 'Field verification completed successfully.',
      timestamp: new Date().toISOString(),
      modelRetrainedVersion: `PFIS-v4.2-REV-${Date.now().toString().slice(-4)}`,
    };

    res.status(200).json({
      success: true,
      data: outcomeRecord,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInterventionsLedger = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    data: interventionLedger,
  });
};
