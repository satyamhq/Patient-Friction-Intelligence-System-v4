import { FrictionCalculationResult } from '../friction/frictionEngine.js';
import { IRiskFactor } from '../../models/CareRisk.js';

export interface RiskEvaluationResult {
  careCompletionProbability: number;
  accessibilityRiskPercentage: number;
  riskCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  bottleneckStage: string;
  primaryRiskFactors: IRiskFactor[];
  mitigationPathways: string[];
  disclaimer: string;
}

export class RiskEngine {
  /**
   * Computes estimated non-clinical care completion probability and journey bottleneck risks
   */
  public static evaluate(friction: FrictionCalculationResult): RiskEvaluationResult {
    const fScore = friction.overallFrictionScore;

    // Calculate Completion Probability using non-linear operational resistance model
    let completionProb = Math.round(100 - (fScore * 0.78 + Math.pow(fScore / 10, 1.35)));
    completionProb = Math.min(96, Math.max(12, completionProb));
    const accessibilityRiskPercentage = 100 - completionProb;

    let riskCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (completionProb < 40) riskCategory = 'CRITICAL';
    else if (completionProb < 60) riskCategory = 'HIGH';
    else if (completionProb < 78) riskCategory = 'MODERATE';

    // Determine Bottleneck Stage
    let bottleneckStage = 'Travel & Physical Transit';
    if (friction.transport.score >= 70 || friction.travel.score >= 70) {
      bottleneckStage = 'Travel & Physical Transit';
    } else if (friction.documentation.score >= 65 || friction.digitalAccess.score >= 70) {
      bottleneckStage = 'Registration & Hospital Verification';
    } else if (friction.cost.score >= 65) {
      bottleneckStage = 'Diagnostics & Out-of-Pocket Prescription';
    } else if (friction.appointmentTiming.score >= 65) {
      bottleneckStage = 'Appointment Attendance & Token Scheduling';
    } else if (friction.familySupport.score >= 65) {
      bottleneckStage = 'Hospital Navigation & Accompaniment';
    } else {
      bottleneckStage = 'Post-Consultation Follow-up';
    }

    // Build Primary Risk Factors
    const primaryRiskFactors: IRiskFactor[] = [];
    if (friction.transport.score >= 50) {
      primaryRiskFactors.push({
        factorName: 'Public Transit Scarcity',
        severity: friction.transport.score >= 75 ? 'CRITICAL' : 'HIGH',
        operationalImpact: 'High likelihood of delayed arrival and missed token allocations.',
      });
    }
    if (friction.travel.score >= 50) {
      primaryRiskFactors.push({
        factorName: 'Geographic Distance',
        severity: friction.travel.score >= 75 ? 'CRITICAL' : 'HIGH',
        operationalImpact: `Transit distance (${friction.travel.contributingParameters?.distanceKm || 'long'} km) requires extensive physical travel fatigue.`,
      });
    }
    if (friction.cost.score >= 50) {
      primaryRiskFactors.push({
        factorName: 'Out-of-Pocket Expense',
        severity: friction.cost.score >= 75 ? 'CRITICAL' : 'HIGH',
        operationalImpact: 'Cumulative travel and medicine costs risk premature abandonment of care regimen.',
      });
    }
    if (friction.digitalAccess.score >= 50) {
      primaryRiskFactors.push({
        factorName: 'Digital Process Literacy',
        severity: friction.digitalAccess.score >= 75 ? 'CRITICAL' : 'HIGH',
        operationalImpact: 'Inability to receive SMS alerts or download lab reports remotely.',
      });
    }
    if (friction.familySupport.score >= 50) {
      primaryRiskFactors.push({
        factorName: 'Caregiver Unavailability',
        severity: friction.familySupport.score >= 75 ? 'CRITICAL' : 'HIGH',
        operationalImpact: 'Patient requires dedicated escort for hospital corridor navigation and multi-counter registration.',
      });
    }

    if (primaryRiskFactors.length === 0) {
      primaryRiskFactors.push({
        factorName: 'Minor Scheduling Friction',
        severity: 'LOW',
        operationalImpact: 'Standard operational variance in hospital queue times.',
      });
    }

    // Generate Mitigation Pathways
    const mitigationPathways: string[] = [];
    if (friction.transport.score >= 50 || friction.travel.score >= 50) {
      mitigationPathways.push('Community Health Shuttle / Transit Voucher Support');
    }
    if (friction.digitalAccess.score >= 50 || friction.language.score >= 50) {
      mitigationPathways.push('Village Health Worker (ASHA) Guided Booking & Offline Assistance');
    }
    if (friction.documentation.score >= 50) {
      mitigationPathways.push('Pre-visit Scheme Documentation Verification Desk');
    }
    if (friction.appointmentTiming.score >= 50) {
      mitigationPathways.push('Flexible Afternoon Slot or Tele-consultation Initial Screening');
    }
    if (mitigationPathways.length === 0) {
      mitigationPathways.push('Standard Automated SMS Appointment Reminders');
    }

    return {
      careCompletionProbability: completionProb,
      accessibilityRiskPercentage,
      riskCategory,
      bottleneckStage,
      primaryRiskFactors,
      mitigationPathways,
      disclaimer:
        'Estimated operational accessibility index based on socio-geographic friction factors. This is NOT a clinical diagnosis or medical prediction.',
    };
  }
}
