import mongoose, { Schema, Document } from 'mongoose';
import { createSQLModel } from '../database/sqlModel.js';

export type FrictionType =
  | 'appointment_timing'
  | 'transport'
  | 'distance'
  | 'digital_access'
  | 'language'
  | 'documentation'
  | 'family_support'
  | 'cost';

export interface IFrictionEvent {
  _id?: any;
  id?: any;
  patientId?: string;
  appointmentId?: string;
  type: FrictionType | string;
  severity: number;
  source: string;
  notes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export const FrictionEventSchema = new Schema<IFrictionEvent>(
  {
    patientId: { type: String, index: true },
    appointmentId: { type: String, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        'appointment_timing',
        'transport',
        'distance',
        'digital_access',
        'language',
        'documentation',
        'family_support',
        'cost',
      ],
      index: true,
    },
    severity: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
      default: 0.5,
    },
    source: {
      type: String,
      default: 'ai_voice_agent',
      index: true,
    },
    notes: { type: String },
  },
  {
    timestamps: true,
    collection: 'friction_events',
    bufferCommands: false,
  }
);

// Fallback or Mongoose model registration
export const FrictionEventModel =
  mongoose.models.FrictionEvent ||
  mongoose.model<IFrictionEvent>('FrictionEvent', FrictionEventSchema);

export const FrictionEvent: any = createSQLModel<IFrictionEvent>('friction_events');
