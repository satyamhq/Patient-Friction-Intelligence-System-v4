import { createSQLModel } from '../database/sqlModel.js';

export type RequestStatus =
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

export interface ITimelineEvent {
  status: RequestStatus;
  timestamp: Date | string;
  note?: string;
  actorRole: 'patient' | 'hospital' | 'admin' | 'system';
}

export interface IHospitalRequest {
  _id?: any;
  id?: any;
  requestCode?: string;
  patientId: any;
  hospitalId: any;
  departmentName?: string;
  reasonForVisit?: string;
  preferredDate?: Date | string;
  preferredTimeSlot?: string;
  additionalMessage?: string;
  consentId?: any;
  documentIds?: any[];
  status: RequestStatus | string;
  distanceKm?: number;
  estimatedTravelTimeMinutes?: number;
  accessibilityScoreAtRequest?: number;
  topBarrierAtRequest?: string;
  patientLanguage?: string;
  patientDialect?: string;
  originalMessage?: string;
  originalLanguage?: string;
  translatedMessage?: string;
  translatedLanguage?: string;
  hospitalNotes?: string;
  appointmentDateTime?: Date | string;
  needsAmbulance?: boolean;
  needsCareEscort?: boolean;
  ambulanceBooking?: any;
  careEscortBooking?: any;
  timeline?: ITimelineEvent[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const HospitalRequest: any = createSQLModel<IHospitalRequest>('requests');
