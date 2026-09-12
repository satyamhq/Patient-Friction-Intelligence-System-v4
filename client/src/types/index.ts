export type UserRole = 'patient' | 'hospital' | 'admin' | 'doctor' | 'asha_worker' | 'government';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
}

export interface PatientLocation {
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
}

export interface Patient {
  _id: string;
  userId: string;
  patientCode: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  preferredLanguage: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  location: PatientLocation;
  transportAvailability: 'none' | 'low' | 'moderate' | 'high';
  digitalAccessLevel: 'none' | 'basic' | 'moderate' | 'advanced';
  familySupport: 'none' | 'low' | 'moderate' | 'high';
  documentationStatus: 'incomplete' | 'partial' | 'complete';
  financialAccessibility: 'severely_constrained' | 'moderate_budget' | 'adequate' | 'insured';
  appointmentFlexibility: 'inflexible_daily_wage' | 'rigid_hours' | 'moderate' | 'flexible';
  residenceType: 'rural_remote' | 'semi_urban' | 'urban_slum' | 'urban_metro';
  preferredHospitalId?: any;
  activeFrictionProfileId?: any;
  activeCareRiskId?: any;
  currentJourneyStage: string;
}

export interface HospitalDepartment {
  _id: string;
  hospitalId: string;
  name: string;
  description?: string;
  headDoctorName?: string;
  opdDays: string[];
  opdTimings: string;
  dailyTokenCapacity: number;
  availableTokensToday: number;
  consultationFee: number;
  isAcceptingRequests: boolean;
  treatedConditions?: string[];
}

export interface Hospital {
  _id: string;
  userId: string;
  name: string;
  type: 'Government' | 'Private' | 'Charitable' | 'Autonomous';
  tagline?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  phone: string;
  emergencyPhone?: string;
  email: string;
  website?: string;
  workingHours: string;
  emergencyAvailable: boolean;
  totalBeds: number;
  availableBeds: number;
  specialistAvailable: boolean;
  diagnosticFacilities: string[];
  languagesSupported: string[];
  averageWaitTimeMinutes: number;
  rating: number;
  isVerified: boolean;
  distanceKm?: number;
  estimatedTravelTimeMinutes?: number;
  accessibilityFriction?: string;
  departments?: any[];
  doctorsList?: {
    name: string;
    department: string;
    opdTimings?: string;
    availableTokens?: number;
    headDoctorName?: string;
  }[];
  totalAvailableTokens?: number;
  totalDailyTokens?: number;
  allTreatedConditions?: string[];
  ambulanceService?: {
    totalAmbulances: number;
    availableAmbulances: number;
    emergencyContact: string;
    avgEtaMins: number;
    isAvailable: boolean;
  };
  careAttendantService?: {
    availableEscorts: number;
    escortTypeName: string;
    homePickupDropAvailable: boolean;
    contactNumber: string;
    isAvailable: boolean;
  };
}

export interface FrictionFactor {
  dimension: string;
  score: number;
  weight: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  contributingParameters: Record<string, any>;
}

export interface FrictionProfile {
  _id: string;
  patientId: string;
  travel: FrictionFactor;
  transport: FrictionFactor;
  digitalAccess: FrictionFactor;
  language: FrictionFactor;
  familySupport: FrictionFactor;
  documentation: FrictionFactor;
  cost: FrictionFactor;
  appointmentTiming: FrictionFactor;
  overallFrictionScore: number;
  overallAccessibilityScore: number;
  frictionLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  topBarrier: string;
  secondaryBarrier: string;
  explanation: string;
  calculatedAt: string;
}

export interface FrictionInteraction {
  _id: string;
  patientId: string;
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

export interface RiskFactor {
  factorName: string;
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  operationalImpact: string;
}

export interface CareRisk {
  _id: string;
  patientId: string;
  careCompletionProbability: number;
  accessibilityRiskPercentage: number;
  riskCategory: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  bottleneckStage: string;
  primaryRiskFactors: RiskFactor[];
  mitigationPathways: string[];
  disclaimer: string;
}

export interface TimelineEvent {
  status: string;
  timestamp: string;
  note?: string;
  actorRole: 'patient' | 'hospital' | 'admin' | 'system';
}

export interface HospitalRequest {
  _id: string;
  requestCode: string;
  patientId: any;
  hospitalId: any;
  departmentName: string;
  reasonForVisit: string;
  preferredDate: string;
  preferredTimeSlot: string;
  additionalMessage?: string;
  consentId: any;
  documentIds: any[];
  status:
    | 'REQUEST_CREATED'
    | 'CONSENT_GIVEN'
    | 'REQUEST_SENT'
    | 'HOSPITAL_RECEIVED'
    | 'UNDER_REVIEW'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'APPOINTMENT_SCHEDULED'
    | 'COMPLETED'
    | 'CANCELLED';
  distanceKm: number;
  estimatedTravelTimeMinutes: number;
  accessibilityScoreAtRequest: number;
  topBarrierAtRequest: string;
  hospitalNotes?: string;
  appointmentDateTime?: string;
  needsAmbulance?: boolean;
  needsCareEscort?: boolean;
  ambulanceBooking?: {
    isRequested: boolean;
    status: 'REQUESTED' | 'DISPATCHED' | 'ARRIVED_AT_HOME' | 'COMPLETED' | 'CANCELLED';
    driverName?: string;
    driverPhone?: string;
    vehicleNumber?: string;
    estimatedArrivalMinutes?: number;
    pickupAddress?: string;
  };
  careEscortBooking?: {
    isRequested: boolean;
    status: 'REQUESTED' | 'ASSIGNED' | 'EN_ROUTE_TO_HOME' | 'ACCOMPANYING_PATIENT' | 'RETURN_TRIP_COMPLETED';
    escortName?: string;
    escortRole?: string;
    escortPhone?: string;
    pickupAddress?: string;
    notes?: string;
  };
  timeline: TimelineEvent[];
  createdAt: string;
}

export interface PatientDocument {
  _id: string;
  patientId: string;
  title: string;
  type: 'Prescription' | 'Medical Report' | 'Referral' | 'ID Card' | 'Other';
  originalFilename: string;
  storedFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  notes?: string;
}

export interface Consent {
  _id: string;
  patientId: any;
  hospitalId: any;
  dataShared: string[];
  purpose: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'PENDING';
  grantedAt: string;
  revokedAt?: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  role: 'patient' | 'hospital' | 'admin';
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface InterventionItem {
  code: string;
  name: string;
  category: string;
  unitCostINR: number;
  baseGainPercent: number;
  reachPatientsPerUnit: number;
  description: string;
  geographicSuitability: string[];
}
