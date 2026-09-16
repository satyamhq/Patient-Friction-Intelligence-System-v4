import mongoose, { Schema, Document } from 'mongoose';
import { createSQLModel } from '../database/sqlModel.js';

export interface ICallLog {
  _id?: any;
  id?: any;
  conversationId: string;
  callId?: string;
  patientId?: string;
  appointmentId?: string;
  status: string;
  outcome?: string;
  duration?: number;
  durationSeconds?: number;
  transcriptReference?: string;
  operationalBarriersIdentified?: string[];
  telephonyProvider?: string;
  agentId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export const CallLogSchema = new Schema<ICallLog>(
  {
    conversationId: { type: String, required: true, index: true },
    callId: { type: String, index: true },
    patientId: { type: String, index: true },
    appointmentId: { type: String, index: true },
    status: { type: String, default: 'completed', index: true },
    outcome: { type: String },
    duration: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
    transcriptReference: { type: String },
    operationalBarriersIdentified: [{ type: String }],
    telephonyProvider: { type: String, default: 'helpline_direct' },
    agentId: { type: String, default: 'care_helpline_coordinator' },
  },
  {
    timestamps: true,
    collection: 'call_logs',
    bufferCommands: false,
  }
);

export const CallLogModel =
  mongoose.models.CallLog ||
  mongoose.model<ICallLog>('CallLog', CallLogSchema);

export const CallLog: any = createSQLModel<ICallLog>('call_logs');
