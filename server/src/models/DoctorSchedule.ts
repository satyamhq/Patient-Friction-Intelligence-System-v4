import { createSQLModel } from '../database/sqlModel.js';

export interface IScheduleSlot {
  day: string;
  start: string;
  end: string;
  breakStart?: string;
  breakEnd?: string;
  slotDurationMinutes: number;
}

export interface IDoctorSchedule {
  _id?: string;
  id?: string;
  doctorId: string;
  doctorName?: string;
  workingDays: string[] | string; // stored as JSON string in embedded DB
  opdStart: string;
  opdEnd: string;
  breakStart?: string;
  breakEnd?: string;
  slotDurationMinutes: number;
  teleconsultAvailable: boolean;
  teleconsultDays?: string[] | string;
  teleconsultStart?: string;
  teleconsultEnd?: string;
  unavailableDates?: string[] | string; // JSON array of date strings
  maxPatientsPerDay?: number;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const DoctorSchedule: any = createSQLModel<IDoctorSchedule>('doctor_schedules');
