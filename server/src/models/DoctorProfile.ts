import { createSQLModel } from '../database/sqlModel.js';

export interface IDoctorProfile {
  _id?: string;
  id?: string;
  userId: string;
  doctorCode?: string;
  name?: string;
  specialization?: string;
  qualification?: string;
  licenseNumber?: string;
  hospitalId?: string;          // Optional affiliation
  hospitalName?: string;
  experience?: number;          // Years
  languages?: string[];
  phone?: string;
  email?: string;
  consultationFee?: number;
  opdTimings?: string;
  availableDays?: string[];
  totalPatientsSeen?: number;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
  };
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const DoctorProfile: any = createSQLModel<IDoctorProfile>('doctor_profiles');
