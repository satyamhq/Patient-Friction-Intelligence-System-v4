import mongoose, { Schema, Document } from 'mongoose';

export interface IJourneyStageFriction {
  stage: 'pre_visit_transit' | 'facility_intake' | 'clinical_queue' | 'diagnostics_pharmacy' | 'admin_insurance';
  stageName: string;
  score: number; // 0 - 100
  latencyMinutes: number;
  barriers: string[];
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
}

export interface IFrictionFactors {
  accessibility: number; // 0 - 100
  waitingTime: number; // 0 - 100
  cost: number; // 0 - 100
  processComplexity: number; // 0 - 100
  referralDelays: number; // 0 - 100
  facilityCapacity: number; // 0 - 100
  informationBarriers: number; // 0 - 100
  continuityOfCare: number; // 0 - 100
}

export interface IPatientJourneyRecord extends Document {
  journeyId: string;
  patientId: string;
  patientNameMasked: string;
  abhaIdMasked: string;
  age: number;
  gender: string;
  district: string;
  village: string;
  facilityId: string;
  facilityName: string;
  serviceCategory: string; // Maternal, Cardiology, Oncology, General Medicine, Pediatrics, Orthopedics, Nephrology
  transitDistanceKm: number;
  transitDurationMinutes: number;
  transitCostInr: number;
  dailyWageLossInr: number;
  outOfPocketExpensesInr: number;
  householdIncomeTier: 'bpl' | 'low_income' | 'middle_income';
  languageDissonance: boolean;
  preferredLanguage: string;
  caregiverEscortAvailable: boolean;
  documentationStatus: 'complete' | 'partial' | 'missing_golden_card' | 'missing_id';
  queueWaitMinutes: number;
  diagnosticDelayHours: number;
  pharmacyStockoutExperienced: boolean;
  processStepsCount: number;
  referralDelayDays: number;
  facilityCapacityUtilizationPct: number;
  staffingRatioScore: number;
  serviceHoursPerDay: number;
  informationAvailabilityScore: number;
  factors: IFrictionFactors;
  frictionScore: number;
  frictionTier: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  careFailureRisk: number; // 0 - 100%
  stages: IJourneyStageFriction[];
  rootCauses: string[];
  timestamp: Date;
}

const PatientJourneyRecordSchema = new Schema<IPatientJourneyRecord>(
  {
    journeyId: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientNameMasked: { type: String, required: true },
    abhaIdMasked: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    district: { type: String, required: true, index: true },
    village: { type: String, required: true, index: true },
    facilityId: { type: String, required: true },
    facilityName: { type: String, required: true },
    serviceCategory: { type: String, required: true },
    transitDistanceKm: { type: Number, required: true },
    transitDurationMinutes: { type: Number, required: true },
    transitCostInr: { type: Number, required: true },
    dailyWageLossInr: { type: Number, required: true },
    outOfPocketExpensesInr: { type: Number, default: 150 },
    householdIncomeTier: { type: String, default: 'bpl' },
    languageDissonance: { type: Boolean, default: false },
    preferredLanguage: { type: String, default: 'Hindi' },
    caregiverEscortAvailable: { type: Boolean, default: true },
    documentationStatus: { type: String, default: 'complete' },
    queueWaitMinutes: { type: Number, default: 45 },
    diagnosticDelayHours: { type: Number, default: 2 },
    pharmacyStockoutExperienced: { type: Boolean, default: false },
    processStepsCount: { type: Number, default: 3 },
    referralDelayDays: { type: Number, default: 0 },
    facilityCapacityUtilizationPct: { type: Number, default: 80 },
    staffingRatioScore: { type: Number, default: 65 },
    serviceHoursPerDay: { type: Number, default: 8 },
    informationAvailabilityScore: { type: Number, default: 70 },
    factors: {
      accessibility: { type: Number, default: 50 },
      waitingTime: { type: Number, default: 50 },
      cost: { type: Number, default: 50 },
      processComplexity: { type: Number, default: 50 },
      referralDelays: { type: Number, default: 30 },
      facilityCapacity: { type: Number, default: 50 },
      informationBarriers: { type: Number, default: 40 },
      continuityOfCare: { type: Number, default: 45 },
    },
    frictionScore: { type: Number, required: true, index: true },
    frictionTier: { type: String, enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'], required: true },
    careFailureRisk: { type: Number, required: true },
    stages: [
      {
        stage: { type: String, required: true },
        stageName: { type: String, required: true },
        score: { type: Number, required: true },
        latencyMinutes: { type: Number, required: true },
        barriers: [{ type: String }],
        severity: { type: String, enum: ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'] },
      },
    ],
    rootCauses: [{ type: String }],
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PatientJourneyRecordSchema.index({ district: 1, village: 1 });

export const PatientJourneyModel = mongoose.model<IPatientJourneyRecord>(
  'PatientJourneyRecord',
  PatientJourneyRecordSchema
);
