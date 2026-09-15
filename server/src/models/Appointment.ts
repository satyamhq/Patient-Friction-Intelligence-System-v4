import mongoose, { Schema, Document } from 'mongoose';
import { createSQLModel } from '../database/sqlModel.js';

export type AppointmentStatus =
  | 'pending'
  | 'calling'
  | 'confirmed'
  | 'alternative_offered'
  | 'unavailable'
  | 'failed'
  | 'cancelled'
  | 'rescheduled';

export interface IAppointment {
  _id?: any;
  id?: any;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  hospitalId?: string;
  hospitalName: string;
  hospitalPhone?: string;
  department: string;
  preferredDate: string;
  preferredTime: string;
  reason?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  status: AppointmentStatus;
  source: string;
  conversationId?: string;
  callId?: string;
  assistedBy?: string;
  operationalNotes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: String, index: true },
    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true },
    hospitalId: { type: String, index: true },
    hospitalName: { type: String, required: true },
    hospitalPhone: { type: String },
    department: { type: String, required: true },
    preferredDate: { type: String, required: true },
    preferredTime: { type: String, required: true },
    reason: { type: String },
    appointmentDate: { type: String },
    appointmentTime: { type: String },
    status: {
      type: String,
      enum: [
        'pending',
        'calling',
        'confirmed',
        'alternative_offered',
        'unavailable',
        'failed',
        'cancelled',
        'rescheduled',
      ],
      default: 'pending',
      index: true,
    },
    source: {
      type: String,
      default: 'ai_voice_agent',
      index: true,
    },
    conversationId: { type: String, index: true },
    callId: { type: String, index: true },
    assistedBy: { type: String, default: 'AI Voice Agent' },
    operationalNotes: { type: String },
  },
  {
    timestamps: true,
    collection: 'appointments',
    bufferCommands: false,
  }
);

export const AppointmentModel =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export const Appointment: any = createSQLModel<IAppointment>('appointments');
