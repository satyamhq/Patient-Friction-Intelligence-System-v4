import { IFrictionFactor } from '../../models/FrictionProfile.js';

export interface InteractionEvaluation {
  primaryDimension: string;
  secondaryDimension: string;
  baseScorePrimary: number;
  baseScoreSecondary: number;
  interactionMultiplier: number;
  combinedFrictionScore: number;
  interactionSeverity: 'LOW' | 'MODERATE' | 'HIGH' | 'COMPOUND_CRITICAL';
  mechanismExplanation: string;
  recommendedMitigation: string;
}

export class FrictionInteractionEngine {
  /**
   * Detects non-linear barrier synergies across 8 dimensions
   */
  public static detectInteractions(factors: {
    travel: IFrictionFactor;
    transport: IFrictionFactor;
    digitalAccess: IFrictionFactor;
    language: IFrictionFactor;
    familySupport: IFrictionFactor;
    documentation: IFrictionFactor;
    cost: IFrictionFactor;
    appointmentTiming: IFrictionFactor;
  }): InteractionEvaluation[] {
    const interactions: InteractionEvaluation[] = [];

    // 1. Transport + Travel Distance
    if (factors.transport.score >= 50 && factors.travel.score >= 50) {
      const avg = (factors.transport.score + factors.travel.score) / 2;
      const multiplier = 1.25;
      const combined = Math.min(100, Math.round(avg * multiplier));
      interactions.push({
        primaryDimension: 'Transport',
        secondaryDimension: 'Travel Distance',
        baseScorePrimary: factors.transport.score,
        baseScoreSecondary: factors.travel.score,
        interactionMultiplier: multiplier,
        combinedFrictionScore: combined,
        interactionSeverity: combined >= 80 ? 'COMPOUND_CRITICAL' : 'HIGH',
        mechanismExplanation:
          'Long travel distance (>25km) compounded by lack of dedicated personal or direct public transit produces an acute geographic barrier, resulting in severe physical transit fatigue and high risk of journey cancellation.',
        recommendedMitigation:
          'Deploy scheduled Community Health Transit van or connect patient with village-level patient transport pool.',
      });
    }

    // 2. Digital Access + Language
    if (factors.digitalAccess.score >= 50 && factors.language.score >= 50) {
      const avg = (factors.digitalAccess.score + factors.language.score) / 2;
      const multiplier = 1.20;
      const combined = Math.min(100, Math.round(avg * multiplier));
      interactions.push({
        primaryDimension: 'Digital Access',
        secondaryDimension: 'Language',
        baseScorePrimary: factors.digitalAccess.score,
        baseScoreSecondary: factors.language.score,
        interactionMultiplier: multiplier,
        combinedFrictionScore: combined,
        interactionSeverity: combined >= 75 ? 'COMPOUND_CRITICAL' : 'HIGH',
        mechanismExplanation:
          'Inability to read digital interfaces in mainstream languages leads to digital exclusion, rendering digital token systems and automated SMS alerts unusable.',
        recommendedMitigation:
          'Enable local language voice IVR notifications and assign an ASHA/Health Worker for manual booking assistance.',
      });
    }

    // 3. Documentation + Digital Access
    if (factors.documentation.score >= 50 && factors.digitalAccess.score >= 50) {
      const avg = (factors.documentation.score + factors.digitalAccess.score) / 2;
      const multiplier = 1.15;
      const combined = Math.min(100, Math.round(avg * multiplier));
      interactions.push({
        primaryDimension: 'Documentation',
        secondaryDimension: 'Digital Access',
        baseScorePrimary: factors.documentation.score,
        baseScoreSecondary: factors.digitalAccess.score,
        interactionMultiplier: multiplier,
        combinedFrictionScore: combined,
        interactionSeverity: 'HIGH',
        mechanismExplanation:
          'Incomplete physical scheme credentials coupled with lack of digital scanning tools prevents pre-authorization under welfare schemes (e.g. Ayushman Bharat/PM-JAY).',
        recommendedMitigation:
          'Facilitate on-ground document verification at local Common Service Center (CSC) or Gram Panchayat office.',
      });
    }

    // 4. Cost + Travel Distance
    if (factors.cost.score >= 55 && factors.travel.score >= 45) {
      const avg = (factors.cost.score + factors.travel.score) / 2;
      const multiplier = 1.22;
      const combined = Math.min(100, Math.round(avg * multiplier));
      interactions.push({
        primaryDimension: 'Financial Accessibility',
        secondaryDimension: 'Travel Distance',
        baseScorePrimary: factors.cost.score,
        baseScoreSecondary: factors.travel.score,
        interactionMultiplier: multiplier,
        combinedFrictionScore: combined,
        interactionSeverity: combined >= 80 ? 'COMPOUND_CRITICAL' : 'HIGH',
        mechanismExplanation:
          'High cumulative travel expense (shared auto / bus fares) across long distances consumes a disproportionate share of daily household income, creating direct economic resistance.',
        recommendedMitigation:
          'Provide travel reimbursement vouchers or route patient to closer satellite primary diagnostic center.',
      });
    }

    // 5. Appointment Timing + Transport
    if (factors.appointmentTiming.score >= 55 && factors.transport.score >= 55) {
      const avg = (factors.appointmentTiming.score + factors.transport.score) / 2;
      const multiplier = 1.18;
      const combined = Math.min(100, Math.round(avg * multiplier));
      interactions.push({
        primaryDimension: 'Appointment Timing',
        secondaryDimension: 'Transport',
        baseScorePrimary: factors.appointmentTiming.score,
        baseScoreSecondary: factors.transport.score,
        interactionMultiplier: multiplier,
        combinedFrictionScore: combined,
        interactionSeverity: 'HIGH',
        mechanismExplanation:
          'Rigid OPD morning slots conflict with infrequent rural transit schedules, causing patients to arrive late, miss queue tokens, or lose entire daily wages.',
        recommendedMitigation:
          'Grant guaranteed afternoon/evening OPD slot or offer initial tele-consultation triage.',
      });
    }

    return interactions;
  }
}
