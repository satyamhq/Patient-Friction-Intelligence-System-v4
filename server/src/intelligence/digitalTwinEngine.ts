/**
 * PFIS - Patient Friction Digital Twin Simulation Engine
 * Pure Non-Clinical Access Friction & Operational Modeling
 * 
 * Simulates non-clinical barriers:
 * - Travel distance & transport availability
 * - Digital access & literacy
 * - Caregiver / escort constraints
 * - Economic wage loss risk
 * - Queue / wait time pressure
 * - Diagnostic & essential medicine availability
 * - Facility physical accessibility & navigation
 * 
 * ABSOLUTELY NO CLINICAL DIAGNOSES, PROGNOSES, PRESCRIPTIONS, OR MEDICAL PREDICTIONS.
 */

export interface PatientAccessProfileInput {
  distance_to_hospital_km: number;
  transport_mode: string;
  digital_literacy: string;
  family_support: string;
  wage_loss_risk: string;
  smartphone_access: boolean;
  internet_type: string;
  disability_needs?: string;
  is_rural: boolean;
  appointment_flexibility?: string;
  document_readiness?: string;
}

export interface FacilityAccessStatusInput {
  id: string;
  name: string;
  type?: string;
  city?: string;
  distanceKm?: number;
  available_beds?: number;
  total_beds?: number;
  emergency_24x7?: boolean;
  teleconsult_available?: boolean;
  accessibility_facilities?: string;
  current_queue_wait_minutes?: number;
  diagnostic_availability_ratio?: number;
  medicine_stock_ratio?: number;
}

export interface NonClinicalIntervention {
  code: string;
  name: string;
  category: 'TRANSPORT' | 'CARE' | 'FINANCIAL' | 'DIGITAL' | 'LOGISTICS';
  description: string;
  friction_reduction_description: string;
  affects: string[];
}

export interface JourneyMilestone {
  milestone_id: string;
  name: string;
  step_number: number;
  stage_friction_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  simulated_status: 'PASSED' | 'BARRIER_ENCOUNTERED' | 'MITIGATED_PASS';
  dropout_risk_score: number;
  friction_factors: string[];
  active_mitigations: string[];
}

export interface SimulationResult {
  baseline_friction_score: number;
  simulated_friction_score: number;
  friction_reduction_points: number;
  baseline_completion_rate: number;
  simulated_completion_rate: number;
  sub_scores: {
    travel_burden_score: number;
    transport_burden_score: number;
    waiting_burden_score: number;
    digital_access_burden_score: number;
    administrative_burden_score: number;
    diagnostic_burden_score: number;
    medicine_burden_score: number;
    caregiver_burden_score: number;
    accessibility_burden_score: number;
  };
  mitigated_sub_scores: {
    travel_burden_score: number;
    transport_burden_score: number;
    waiting_burden_score: number;
    digital_access_burden_score: number;
    administrative_burden_score: number;
    diagnostic_burden_score: number;
    medicine_burden_score: number;
    caregiver_burden_score: number;
    accessibility_burden_score: number;
  };
  selected_interventions: string[];
  journey_milestones: JourneyMilestone[];
  profile_snapshot: PatientAccessProfileInput;
  facility_snapshot: FacilityAccessStatusInput;
  model_version: string;
  timestamp: string;
}

export const NON_CLINICAL_INTERVENTIONS: NonClinicalIntervention[] = [
  {
    code: 'ASHA_ESCORT',
    name: 'ASHA / Frontline Companion Escort',
    category: 'CARE',
    description: 'Accredited community health worker accompanies patient throughout transit, check-in, and department navigation.',
    friction_reduction_description: 'Reduces caregiver burden by 70%, accessibility hurdles by 65%, and registration queue confusion by 25%.',
    affects: ['caregiver', 'accessibility', 'waiting'],
  },
  {
    code: 'TRANSPORT_SUBSIDY',
    name: 'Arranged Rural Transit / Travel Voucher',
    category: 'TRANSPORT',
    description: 'Subsidized community shuttle or government travel concession for scheduled appointments.',
    friction_reduction_description: 'Reduces transport burden by 70%, distance friction perception by 35%, and travel expenditure strain.',
    affects: ['transport', 'travel', 'wage_loss'],
  },
  {
    code: 'TELECONSULT_TRIAGE',
    name: 'Pre-Visit Teleconsultation & Triage',
    category: 'DIGITAL',
    description: 'Remote frontline-assisted video/audio triage with hospital team to verify documentation and eliminate exploratory visits.',
    friction_reduction_description: 'Reduces on-site queue waiting by 60%, unneeded travel by 40%, and administrative friction by 45%.',
    affects: ['waiting', 'travel', 'administrative'],
  },
  {
    code: 'FAST_TRACK_TOKEN',
    name: 'Priority Logistics Pass / Queue Fast-Track',
    category: 'LOGISTICS',
    description: 'Digital priority token issued for patients traveling >25 km or with high daily wage vulnerability.',
    friction_reduction_description: 'Reduces waiting room time by 65% and mitigates economic wage loss by 40%.',
    affects: ['waiting', 'wage_loss'],
  },
  {
    code: 'MEDICINE_HOME_DISPATCH',
    name: 'Doorstep Medicine & Sample Collection',
    category: 'LOGISTICS',
    description: 'Prescribed maintenance medicines delivered to doorstep via postal/community network, with local sample pickup.',
    friction_reduction_description: 'Reduces pharmacy stockout repeat visits by 85% and diagnostic travel requirements by 75%.',
    affects: ['medicine', 'diagnostic'],
  },
  {
    code: 'DIGITAL_ASSISTANCE_KIOSK',
    name: 'Frontline Assisted Digital Booking',
    category: 'DIGITAL',
    description: 'Facilitated digital appointment booking, ABHA token generation, and records sync through ASHA or village kiosk.',
    friction_reduction_description: 'Reduces digital literacy burden by 85% and administrative documentation delay by 60%.',
    affects: ['digital_access', 'administrative'],
  },
  {
    code: 'WAGE_PROTECTION_STIPEND',
    name: 'Patient Travel Loss Subsidy / Direct Benefit',
    category: 'FINANCIAL',
    description: 'Direct compensation support mitigating daily wage loss incurred while seeking institutional care.',
    friction_reduction_description: 'Reduces wage loss vulnerability burden by 75%.',
    affects: ['wage_loss'],
  },
];

export class DigitalTwinEngine {
  public static readonly MODEL_VERSION = 'PFIS-DT-v2.4';

  public static getInterventions(): NonClinicalIntervention[] {
    return NON_CLINICAL_INTERVENTIONS;
  }

  public static simulate(
    profile: PatientAccessProfileInput,
    facility: FacilityAccessStatusInput,
    selectedInterventionCodes: string[] = []
  ): SimulationResult {
    // 1. Calculate Baseline Sub-scores (0 - 100)
    
    // Dimension 1: Travel Distance Burden
    let travel_burden = 20;
    const distance = profile.distance_to_hospital_km || facility.distanceKm || 15;
    if (distance <= 3) travel_burden = 15;
    else if (distance <= 10) travel_burden = 35;
    else if (distance <= 25) travel_burden = 60;
    else if (distance <= 50) travel_burden = 80;
    else travel_burden = 95;

    if (profile.is_rural) travel_burden = Math.min(100, travel_burden + 10);

    // Dimension 2: Transport Availability Burden
    let transport_burden = 40;
    const mode = (profile.transport_mode || 'bus').toLowerCase();
    switch (mode) {
      case 'walking':
        transport_burden = distance > 2 ? 90 : 50;
        break;
      case 'bicycle':
        transport_burden = distance > 5 ? 75 : 45;
        break;
      case 'bus':
        transport_burden = profile.is_rural ? 65 : 40;
        break;
      case 'auto_rickshaw':
        transport_burden = 50;
        break;
      case 'train':
        transport_burden = 45;
        break;
      case 'private_vehicle':
        transport_burden = 20;
        break;
      case 'ambulance':
        transport_burden = 30;
        break;
      default:
        transport_burden = 55;
    }
    if (profile.is_rural) transport_burden = Math.min(100, transport_burden + 10);

    // Dimension 3: Digital Access Burden
    let digital_access_burden = 30;
    const lit = (profile.digital_literacy || 'basic').toLowerCase();
    if (lit === 'none') digital_access_burden = 90;
    else if (lit === 'basic') digital_access_burden = 60;
    else if (lit === 'intermediate') digital_access_burden = 30;
    else digital_access_burden = 10;

    if (!profile.smartphone_access) digital_access_burden = Math.min(100, digital_access_burden + 20);
    const net = (profile.internet_type || '4g_5g').toLowerCase();
    if (net === 'none') digital_access_burden = Math.min(100, digital_access_burden + 15);
    else if (net === '2g_3g') digital_access_burden = Math.min(100, digital_access_burden + 5);

    // Dimension 4: Caregiver / Escort Burden
    let caregiver_burden = 30;
    const fam = (profile.family_support || 'moderate').toLowerCase();
    if (fam === 'none') caregiver_burden = 85;
    else if (fam === 'dependent_elderly') caregiver_burden = 80;
    else if (fam === 'single_parent') caregiver_burden = 70;
    else if (fam === 'moderate') caregiver_burden = 40;
    else caregiver_burden = 15;

    if (profile.disability_needs && profile.disability_needs !== 'none') {
      caregiver_burden = Math.min(100, caregiver_burden + 25);
    }

    // Dimension 5: Wage Loss / Economic Friction Burden
    let wage_loss_burden = 30;
    const wageRisk = (profile.wage_loss_risk || 'moderate').toLowerCase();
    if (wageRisk === 'critical_daily_wage') wage_loss_burden = 95;
    else if (wageRisk === 'high') wage_loss_burden = 75;
    else if (wageRisk === 'moderate') wage_loss_burden = 45;
    else wage_loss_burden = 15;

    if (distance > 25) wage_loss_burden = Math.min(100, wage_loss_burden + 10);

    // Dimension 6: Queue Waiting Burden
    let waiting_burden = 40;
    const waitMins = facility.current_queue_wait_minutes ?? (profile.is_rural ? 120 : 65);
    if (waitMins >= 180) waiting_burden = 90;
    else if (waitMins >= 120) waiting_burden = 75;
    else if (waitMins >= 60) waiting_burden = 50;
    else if (waitMins >= 30) waiting_burden = 30;
    else waiting_burden = 15;

    // Dimension 7: Diagnostic Availability Burden
    const diagRatio = facility.diagnostic_availability_ratio ?? 0.70;
    const diagnostic_burden = Math.max(5, Math.min(100, Math.round((1 - diagRatio) * 100)));

    // Dimension 8: Medicine Availability Burden
    const medRatio = facility.medicine_stock_ratio ?? 0.75;
    const medicine_burden = Math.max(5, Math.min(100, Math.round((1 - medRatio) * 100)));

    // Dimension 9: Administrative & Documentation Burden
    let administrative_burden = 35;
    const docReady = (profile.document_readiness || 'partial').toLowerCase();
    if (docReady === 'none') administrative_burden = 85;
    else if (docReady === 'partial') administrative_burden = 55;
    else administrative_burden = 20;

    // Dimension 10: Accessibility / Facility Navigation Burden
    let accessibility_burden = 25;
    const hasDisability = profile.disability_needs && profile.disability_needs !== 'none';
    if (hasDisability) {
      const facilityAccessible = facility.accessibility_facilities && facility.accessibility_facilities !== 'none';
      accessibility_burden = facilityAccessible ? 45 : 85;
    }

    const baselineSubScores = {
      travel_burden_score: travel_burden,
      transport_burden_score: transport_burden,
      waiting_burden_score: waiting_burden,
      digital_access_burden_score: digital_access_burden,
      administrative_burden_score: administrative_burden,
      diagnostic_burden_score: diagnostic_burden,
      medicine_burden_score: medicine_burden,
      caregiver_burden_score: caregiver_burden,
      accessibility_burden_score: accessibility_burden,
    };

    // Calculate baseline weighted composite score (0 - 100)
    const baselineFriction = Math.round(
      travel_burden * 0.15 +
      transport_burden * 0.15 +
      waiting_burden * 0.15 +
      wage_loss_burden * 0.10 +
      digital_access_burden * 0.10 +
      diagnostic_burden * 0.10 +
      medicine_burden * 0.10 +
      caregiver_burden * 0.10 +
      accessibility_burden * 0.05
    );
    const baseline_friction_score = Math.max(5, Math.min(99, baselineFriction));
    const baseline_completion_rate = Math.max(5, Math.min(98, Math.round(100 - (baseline_friction_score * 0.85))));

    // 2. Apply Selected Non-Clinical Interventions
    let mit_travel = travel_burden;
    let mit_transport = transport_burden;
    let mit_waiting = waiting_burden;
    let mit_digital = digital_access_burden;
    let mit_admin = administrative_burden;
    let mit_diag = diagnostic_burden;
    let mit_med = medicine_burden;
    let mit_caregiver = caregiver_burden;
    let mit_accessibility = accessibility_burden;
    let mit_wage = wage_loss_burden;

    const interventionsSet = new Set(selectedInterventionCodes);

    if (interventionsSet.has('ASHA_ESCORT')) {
      mit_caregiver = Math.round(mit_caregiver * 0.30); // 70% reduction
      mit_accessibility = Math.round(mit_accessibility * 0.35); // 65% reduction
      mit_waiting = Math.round(mit_waiting * 0.75); // 25% reduction
    }

    if (interventionsSet.has('TRANSPORT_SUBSIDY')) {
      mit_transport = Math.round(mit_transport * 0.30); // 70% reduction
      mit_travel = Math.round(mit_travel * 0.65); // 35% reduction
      mit_wage = Math.round(mit_wage * 0.75); // 25% reduction
    }

    if (interventionsSet.has('TELECONSULT_TRIAGE')) {
      mit_waiting = Math.round(mit_waiting * 0.40); // 60% reduction
      mit_travel = Math.round(mit_travel * 0.60); // 40% reduction
      mit_admin = Math.round(mit_admin * 0.55); // 45% reduction
    }

    if (interventionsSet.has('FAST_TRACK_TOKEN')) {
      mit_waiting = Math.round(mit_waiting * 0.35); // 65% reduction
      mit_wage = Math.round(mit_wage * 0.60); // 40% reduction
    }

    if (interventionsSet.has('MEDICINE_HOME_DISPATCH')) {
      mit_med = Math.round(mit_med * 0.15); // 85% reduction
      mit_diag = Math.round(mit_diag * 0.25); // 75% reduction
    }

    if (interventionsSet.has('DIGITAL_ASSISTANCE_KIOSK')) {
      mit_digital = Math.round(mit_digital * 0.15); // 85% reduction
      mit_admin = Math.round(mit_admin * 0.40); // 60% reduction
    }

    if (interventionsSet.has('WAGE_PROTECTION_STIPEND')) {
      mit_wage = Math.round(mit_wage * 0.25); // 75% reduction
    }

    const mitigatedSubScores = {
      travel_burden_score: Math.max(5, mit_travel),
      transport_burden_score: Math.max(5, mit_transport),
      waiting_burden_score: Math.max(5, mit_waiting),
      digital_access_burden_score: Math.max(5, mit_digital),
      administrative_burden_score: Math.max(5, mit_admin),
      diagnostic_burden_score: Math.max(5, mit_diag),
      medicine_burden_score: Math.max(5, mit_med),
      caregiver_burden_score: Math.max(5, mit_caregiver),
      accessibility_burden_score: Math.max(5, mit_accessibility),
    };

    const simulatedFriction = Math.round(
      mitigatedSubScores.travel_burden_score * 0.15 +
      mitigatedSubScores.transport_burden_score * 0.15 +
      mitigatedSubScores.waiting_burden_score * 0.15 +
      mit_wage * 0.10 +
      mitigatedSubScores.digital_access_burden_score * 0.10 +
      mitigatedSubScores.diagnostic_burden_score * 0.10 +
      mitigatedSubScores.medicine_burden_score * 0.10 +
      mitigatedSubScores.caregiver_burden_score * 0.10 +
      mitigatedSubScores.accessibility_burden_score * 0.05
    );

    const simulated_friction_score = Math.max(5, Math.min(baseline_friction_score, simulatedFriction));
    const friction_reduction_points = baseline_friction_score - simulated_friction_score;
    const simulated_completion_rate = Math.max(10, Math.min(99, Math.round(100 - (simulated_friction_score * 0.85))));

    // 3. Generate 7 Virtual Journey Milestones
    const milestones: JourneyMilestone[] = [
      // Milestone 1
      this.evaluateMilestone(
        'DECISION_TO_SEEK',
        'Decision to Seek Care & Appointment Booking',
        1,
        (digital_access_burden * 0.5 + administrative_burden * 0.3 + wage_loss_burden * 0.2),
        (mit_digital * 0.5 + mit_admin * 0.3 + mit_wage * 0.2),
        [
          lit === 'none' ? 'Low digital literacy restricts independent portal navigation' : null,
          !profile.smartphone_access ? 'Lack of personal smartphone requires family borrowing' : null,
          wageRisk === 'critical_daily_wage' ? 'Fear of daily wage loss discourages booking weekday visit' : null,
        ].filter(Boolean) as string[],
        selectedInterventionCodes,
        ['DIGITAL_ASSISTANCE_KIOSK', 'TELECONSULT_TRIAGE', 'WAGE_PROTECTION_STIPEND']
      ),
      // Milestone 2
      this.evaluateMilestone(
        'TRANSIT_DEPARTURE',
        'Home Departure & Physical Transit',
        2,
        (travel_burden * 0.5 + transport_burden * 0.5),
        (mit_travel * 0.5 + mit_transport * 0.5),
        [
          distance > 20 ? `Long transit corridor (${distance} km) to reach secondary facility` : null,
          profile.is_rural ? 'Rural feeder roads have intermittent bus and shared transport' : null,
          mode === 'walking' && distance > 2 ? 'Patient travels by walking over unreasonable access distance' : null,
        ].filter(Boolean) as string[],
        selectedInterventionCodes,
        ['TRANSPORT_SUBSIDY', 'ASHA_ESCORT']
      ),
      // Milestone 3
      this.evaluateMilestone(
        'FACILITY_ARRIVAL',
        'Campus Arrival, Gate Navigation & Registration',
        3,
        (accessibility_burden * 0.5 + caregiver_burden * 0.3 + administrative_burden * 0.2),
        (mit_accessibility * 0.5 + mit_caregiver * 0.3 + mit_admin * 0.2),
        [
          hasDisability ? 'Mobility restriction requires barrier-free ramps or wheelchair support' : null,
          fam === 'none' ? 'Unaccompanied arrival complicates queue-holding and document submission' : null,
          docReady === 'none' ? 'Incomplete identification documents trigger registration delay' : null,
        ].filter(Boolean) as string[],
        selectedInterventionCodes,
        ['ASHA_ESCORT', 'DIGITAL_ASSISTANCE_KIOSK']
      ),
      // Milestone 4
      this.evaluateMilestone(
        'OPD_CONSULTATION_QUEUE',
        'OPD Consultation Waiting Room',
        4,
        (waiting_burden * 0.7 + wage_loss_burden * 0.3),
        (mit_waiting * 0.7 + mit_wage * 0.3),
        [
          waitMins > 90 ? `Estimated waiting period (${waitMins} min) risks patient abandonment` : null,
          wageRisk === 'critical_daily_wage' ? 'Extended waiting time incurs severe wage loss anxiety' : null,
        ].filter(Boolean) as string[],
        selectedInterventionCodes,
        ['FAST_TRACK_TOKEN', 'TELECONSULT_TRIAGE', 'WAGE_PROTECTION_STIPEND']
      ),
      // Milestone 5
      this.evaluateMilestone(
        'DIAGNOSTIC_SERVICES',
        'Laboratory & Diagnostic Testing Desk',
        5,
        (diagnostic_burden * 0.7 + waiting_burden * 0.3),
        (mit_diag * 0.7 + mit_waiting * 0.3),
        [
          diagRatio < 0.6 ? 'Local diagnostic desk reports reagent/equipment downtime risks' : null,
          'Potential need for multiple cross-departmental queues for routine lab work',
        ].filter(Boolean) as string[],
        selectedInterventionCodes,
        ['MEDICINE_HOME_DISPATCH', 'ASHA_ESCORT']
      ),
      // Milestone 6
      this.evaluateMilestone(
        'PHARMACY_DISPENSATION',
        'Hospital Pharmacy & Medicine Dispensation',
        6,
        (medicine_burden * 0.8 + waiting_burden * 0.2),
        (mit_med * 0.8 + mit_waiting * 0.2),
        [
          medRatio < 0.6 ? 'Essential formulary items experience periodic stockouts' : null,
          'Secondary queue at drug dispensation counter extends total visit duration',
        ].filter(Boolean) as string[],
        selectedInterventionCodes,
        ['MEDICINE_HOME_DISPATCH', 'FAST_TRACK_TOKEN']
      ),
      // Milestone 7
      this.evaluateMilestone(
        'SAFE_RETURN_HOME',
        'Safe Return Transit & Household Resumption',
        7,
        (transport_burden * 0.4 + travel_burden * 0.3 + wage_loss_burden * 0.3),
        (mit_transport * 0.4 + mit_travel * 0.3 + mit_wage * 0.3),
        [
          profile.is_rural ? 'Late return transit risks missing scheduled rural bus departures' : null,
          'Physical and financial exhaustion increases non-compliance with follow-up protocols',
        ].filter(Boolean) as string[],
        selectedInterventionCodes,
        ['TRANSPORT_SUBSIDY', 'ASHA_ESCORT', 'WAGE_PROTECTION_STIPEND']
      ),
    ];

    return {
      baseline_friction_score,
      simulated_friction_score,
      friction_reduction_points,
      baseline_completion_rate,
      simulated_completion_rate,
      sub_scores: baselineSubScores,
      mitigated_sub_scores: mitigatedSubScores,
      selected_interventions: selectedInterventionCodes,
      journey_milestones: milestones,
      profile_snapshot: profile,
      facility_snapshot: facility,
      model_version: this.MODEL_VERSION,
      timestamp: new Date().toISOString(),
    };
  }

  private static evaluateMilestone(
    id: string,
    name: string,
    step: number,
    baselineRisk: number,
    mitigatedRisk: number,
    factors: string[],
    selectedCodes: string[],
    relevantMitigationCodes: string[]
  ): JourneyMilestone {
    const activeMitigations = selectedCodes.filter((c) => relevantMitigationCodes.includes(c));
    const finalScore = Math.max(5, Math.min(100, Math.round(mitigatedRisk)));

    let level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (finalScore >= 70) level = 'CRITICAL';
    else if (finalScore >= 50) level = 'HIGH';
    else if (finalScore >= 30) level = 'MODERATE';

    let status: 'PASSED' | 'BARRIER_ENCOUNTERED' | 'MITIGATED_PASS' = 'PASSED';
    if (baselineRisk >= 50) {
      if (finalScore < 50 && activeMitigations.length > 0) {
        status = 'MITIGATED_PASS';
      } else {
        status = 'BARRIER_ENCOUNTERED';
      }
    } else {
      status = 'PASSED';
    }

    const defaultFactor = factors.length === 0 ? ['Normal operational flow without major non-clinical friction detected'] : factors;

    return {
      milestone_id: id,
      name,
      step_number: step,
      stage_friction_level: level,
      simulated_status: status,
      dropout_risk_score: finalScore,
      friction_factors: defaultFactor,
      active_mitigations: activeMitigations,
    };
  }
}
