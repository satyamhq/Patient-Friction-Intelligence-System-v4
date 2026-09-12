import { createSQLModel } from '../database/sqlModel.js';

export type TransportLevel = 'none' | 'low' | 'moderate' | 'high';
export type DigitalAccessLevel = 'none' | 'basic' | 'moderate' | 'advanced';
export type FamilySupportLevel = 'none' | 'low' | 'moderate' | 'high';
export type DocumentationLevel = 'incomplete' | 'partial' | 'complete';
export type FinancialAccessLevel = 'severely_constrained' | 'moderate_budget' | 'adequate' | 'insured';
export type AppointmentFlexibility = 'inflexible_daily_wage' | 'rigid_hours' | 'moderate' | 'flexible';
export type ResidenceType = 'rural_remote' | 'semi_urban' | 'urban_slum' | 'urban_metro';

export interface IPatientLocation {
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  geoJSON?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

export interface IPatient {
  _id?: any;
  id?: any;
  userId: any;
  patientCode: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  preferredLanguage: string;
  preferredDialect?: string;
  simpleLanguageMode?: boolean;
  voiceEnabled?: boolean;
  textToSpeechEnabled?: boolean;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  location: IPatientLocation | any;
  transportAvailability: TransportLevel;
  digitalAccessLevel: DigitalAccessLevel;
  familySupport: FamilySupportLevel;
  documentationStatus: DocumentationLevel;
  financialAccessibility: FinancialAccessLevel;
  appointmentFlexibility: AppointmentFlexibility;
  residenceType: ResidenceType;
  preferredHospitalId?: any;
  activeFrictionProfileId?: any;
  activeCareRiskId?: any;
  currentJourneyStage?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const Patient: any = createSQLModel<IPatient>('patient_profiles');
