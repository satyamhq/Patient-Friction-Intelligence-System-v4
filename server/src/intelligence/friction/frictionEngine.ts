import { IPatient } from '../../models/Patient.js';
import { IHospital } from '../../models/Hospital.js';
import { IFrictionFactor, IFrictionProfile } from '../../models/FrictionProfile.js';
import { TranslationService } from '../../services/translationService.js';

export interface FrictionCalculationResult {
  travel: IFrictionFactor;
  transport: IFrictionFactor;
  digitalAccess: IFrictionFactor;
  language: IFrictionFactor;
  familySupport: IFrictionFactor;
  documentation: IFrictionFactor;
  cost: IFrictionFactor;
  appointmentTiming: IFrictionFactor;
  overallFrictionScore: number;
  overallAccessibilityScore: number;
  frictionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  topBarrier: string;
  secondaryBarrier: string;
  explanation: string;
}

export class FrictionEngine {
  /**
   * Calculate deterministic friction scores across 8 dimensions for a patient relative to an optional hospital
   */
  public static calculate(
    patient: Partial<IPatient>,
    hospital?: Partial<IHospital> | null,
    distanceKmOverride?: number
  ): FrictionCalculationResult {
    // 1. Calculate Travel Friction (Distance & Road Terrain)
    let distanceKm = distanceKmOverride ?? 15;
    if (
      !distanceKmOverride &&
      patient.location?.latitude &&
      patient.location?.longitude &&
      hospital?.latitude &&
      hospital?.longitude
    ) {
      distanceKm = this.calculateHaversineDistance(
        patient.location.latitude,
        patient.location.longitude,
        hospital.latitude,
        hospital.longitude
      );
    }

    const travelFactor = this.evaluateTravel(distanceKm, patient.residenceType || 'rural_remote');
    const transportFactor = this.evaluateTransport(patient.transportAvailability || 'low', distanceKm);
    const digitalFactor = this.evaluateDigitalAccess(patient.digitalAccessLevel || 'basic');
    const languageFactor = this.evaluateLanguage(
      patient.preferredLanguage || 'English',
      hospital?.languagesSupported || ['English', 'Hindi']
    );
    const familySupportFactor = this.evaluateFamilySupport(patient.familySupport || 'low', patient.age || 45);
    const documentationFactor = this.evaluateDocumentation(patient.documentationStatus || 'partial');
    const costFactor = this.evaluateCost(patient.financialAccessibility || 'severely_constrained', distanceKm);
    const appointmentTimingFactor = this.evaluateAppointmentTiming(
      patient.appointmentFlexibility || 'inflexible_daily_wage'
    );

    // Dimension weights
    const weights = {
      travel: 0.15,
      transport: 0.18,
      digitalAccess: 0.12,
      language: 0.08,
      familySupport: 0.12,
      documentation: 0.10,
      cost: 0.15,
      appointmentTiming: 0.10,
    };

    const weightedScore =
      travelFactor.score * weights.travel +
      transportFactor.score * weights.transport +
      digitalFactor.score * weights.digitalAccess +
      languageFactor.score * weights.language +
      familySupportFactor.score * weights.familySupport +
      documentationFactor.score * weights.documentation +
      costFactor.score * weights.cost +
      appointmentTimingFactor.score * weights.appointmentTiming;

    const overallFrictionScore = Math.round(Math.min(100, Math.max(0, weightedScore)));
    const overallAccessibilityScore = 100 - overallFrictionScore;

    let frictionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (overallFrictionScore >= 70) frictionLevel = 'CRITICAL';
    else if (overallFrictionScore >= 50) frictionLevel = 'HIGH';
    else if (overallFrictionScore >= 30) frictionLevel = 'MEDIUM';

    // Find top and secondary barriers
    const allFactors = [
      { name: 'Transport Availability', factor: transportFactor },
      { name: 'Travel Distance & Terrain', factor: travelFactor },
      { name: 'Financial Accessibility', factor: costFactor },
      { name: 'Family / Caregiver Support', factor: familySupportFactor },
      { name: 'Digital Access & Literacy', factor: digitalFactor },
      { name: 'Documentation Readiness', factor: documentationFactor },
      { name: 'Appointment Timing Flexibility', factor: appointmentTimingFactor },
      { name: 'Language & Communication', factor: languageFactor },
    ].sort((a, b) => b.factor.score - a.factor.score);

    const topBarrier = allFactors[0].name;
    const secondaryBarrier = allFactors[1].name;

    const explanation = `Overall accessibility friction is evaluated at ${overallFrictionScore}/100 (${frictionLevel} friction). The most severe operational barrier is ${topBarrier} (Score: ${allFactors[0].factor.score}/100), followed by ${secondaryBarrier} (Score: ${allFactors[1].factor.score}/100). ${allFactors[0].factor.reason}`;

    return {
      travel: travelFactor,
      transport: transportFactor,
      digitalAccess: digitalFactor,
      language: languageFactor,
      familySupport: familySupportFactor,
      documentation: documentationFactor,
      cost: costFactor,
      appointmentTiming: appointmentTimingFactor,
      overallFrictionScore,
      overallAccessibilityScore,
      frictionLevel,
      topBarrier,
      secondaryBarrier,
      explanation,
    };
  }

  private static evaluateTravel(distanceKm: number, residenceType: string): IFrictionFactor {
    let baseScore = 10;
    if (distanceKm > 80) baseScore = 95;
    else if (distanceKm > 50) baseScore = 80;
    else if (distanceKm > 25) baseScore = 60;
    else if (distanceKm > 10) baseScore = 35;
    else baseScore = 15;

    // Terrain modifier
    if (residenceType === 'rural_remote') baseScore = Math.min(100, baseScore + 10);
    else if (residenceType === 'urban_slum') baseScore = Math.min(100, baseScore + 5);

    const level = this.getSeverityLevel(baseScore);
    const reason =
      distanceKm > 30
        ? `Patient is located ${distanceKm.toFixed(1)} km from the facility across ${residenceType.replace('_', ' ')} roads, imposing high physical transit fatigue.`
        : `Facility is located within ${distanceKm.toFixed(1)} km, representing manageable geographic proximity.`;

    return {
      dimension: 'Travel',
      score: baseScore,
      weight: 0.15,
      level,
      reason,
      contributingParameters: { distanceKm, residenceType },
    };
  }

  private static evaluateTransport(transportLevel: string, distanceKm: number): IFrictionFactor {
    let score = 15;
    let reason = 'Patient has personal vehicle access or reliable regular transit connectivity.';

    if (transportLevel === 'none') {
      score = distanceKm > 10 ? 95 : 75;
      reason = 'No personal transport and zero direct public transit routes to specialized health center.';
    } else if (transportLevel === 'low') {
      score = distanceKm > 20 ? 85 : 70;
      reason = 'Dependent on infrequent rural buses or high-cost shared autos with irregular timetables.';
    } else if (transportLevel === 'moderate') {
      score = 40;
      reason = 'Moderate access via public bus or train network, requiring 1-2 interchange hops.';
    } else {
      score = 15;
      reason = 'High transport autonomy with dedicated two-wheeler or four-wheeler available.';
    }

    return {
      dimension: 'Transport',
      score,
      weight: 0.18,
      level: this.getSeverityLevel(score),
      reason,
      contributingParameters: { transportLevel, distanceKm },
    };
  }

  private static evaluateDigitalAccess(digitalLevel: string): IFrictionFactor {
    let score = 15;
    let reason = 'High digital literacy; comfortable booking slots, tracking alerts, and viewing digital records.';

    if (digitalLevel === 'none') {
      score = 90;
      reason = 'Zero smartphone or internet access; completely dependent on physical in-person queues.';
    } else if (digitalLevel === 'basic') {
      score = 65;
      reason = 'Feature phone or shared family smartphone with intermittent 2G/3G connectivity.';
    } else if (digitalLevel === 'moderate') {
      score = 30;
      reason = 'Basic smartphone user needing assistance for multi-step verification and document uploads.';
    }

    return {
      dimension: 'Digital Access',
      score,
      weight: 0.12,
      level: this.getSeverityLevel(score),
      reason,
      contributingParameters: { digitalLevel },
    };
  }

  private static evaluateLanguage(preferredLanguage: string, hospitalLanguages: string[]): IFrictionFactor {
    const langRes = TranslationService.calculateLanguageFriction(preferredLanguage, hospitalLanguages);

    return {
      dimension: 'Language',
      score: langRes.score,
      weight: 0.08,
      level: langRes.level,
      reason: langRes.reason,
      contributingParameters: { preferredLanguage, hospitalLanguages },
    };
  }

  private static evaluateFamilySupport(familyLevel: string, age: number): IFrictionFactor {
    let score = 20;
    let reason = 'Strong caregiver and family network available to accompany patient during hospital visits.';

    if (familyLevel === 'none') {
      score = age >= 60 || age <= 16 ? 90 : 75;
      reason = 'Patient lives alone or lacks an escort to navigate crowded registration and diagnostic corridors.';
    } else if (familyLevel === 'low') {
      score = 65;
      reason = 'Caregiver has conflicting wage-earning commitments and cannot consistently escort the patient.';
    } else if (familyLevel === 'moderate') {
      score = 35;
      reason = 'Family assistance available on weekends or with prior scheduling.';
    }

    return {
      dimension: 'Family Support',
      score,
      weight: 0.12,
      level: this.getSeverityLevel(score),
      reason,
      contributingParameters: { familyLevel, age },
    };
  }

  private static evaluateDocumentation(docStatus: string): IFrictionFactor {
    let score = 15;
    let reason = 'Complete identity, scheme entitlement (e.g. Ayushman Bharat/PM-JAY), and past medical records ready.';

    if (docStatus === 'incomplete') {
      score = 85;
      reason = 'Missing national ID, unlinked ration card, or lost previous diagnostic baseline papers.';
    } else if (docStatus === 'partial') {
      score = 50;
      reason = 'Has identity proof but lacks formalized doctor referral slip or scheme registration.';
    }

    return {
      dimension: 'Documentation',
      score,
      weight: 0.10,
      level: this.getSeverityLevel(score),
      reason,
      contributingParameters: { docStatus },
    };
  }

  private static evaluateCost(financialLevel: string, distanceKm: number): IFrictionFactor {
    let score = 20;
    let reason = 'Out-of-pocket travel and registration expenses are within comfortable budgetary bounds.';

    if (financialLevel === 'severely_constrained') {
      score = distanceKm > 25 ? 90 : 80;
      reason = 'Daily transit costs and out-of-pocket medicines pose an acute financial barrier for the household.';
    } else if (financialLevel === 'moderate_budget') {
      score = 50;
      reason = 'Can manage basic consultation, but unplanned diagnostic fees or repeated journeys cause financial strain.';
    } else if (financialLevel === 'insured') {
      score = 10;
      reason = 'Comprehensive cashless coverage with minimal out-of-pocket exposure.';
    }

    return {
      dimension: 'Cost',
      score,
      weight: 0.15,
      level: this.getSeverityLevel(score),
      reason,
      contributingParameters: { financialLevel, distanceKm },
    };
  }

  private static evaluateAppointmentTiming(flexibility: string): IFrictionFactor {
    let score = 15;
    let reason = 'Flexible schedule permitting attendance during standard morning OPD slots.';

    if (flexibility === 'inflexible_daily_wage') {
      score = 85;
      reason = 'Visiting the hospital during working hours results in direct loss of critical daily subsistence wages.';
    } else if (flexibility === 'rigid_hours') {
      score = 60;
      reason = 'Fixed employer shifts make weekday morning hospital visits difficult without leave penalties.';
    } else if (flexibility === 'moderate') {
      score = 30;
      reason = 'Can take half-day leave with advance notice for scheduled appointments.';
    }

    return {
      dimension: 'Appointment Timing',
      score,
      weight: 0.10,
      level: this.getSeverityLevel(score),
      reason,
      contributingParameters: { flexibility },
    };
  }

  private static getSeverityLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  }

  public static calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
