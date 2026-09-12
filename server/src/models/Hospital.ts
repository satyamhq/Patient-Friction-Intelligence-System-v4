import { createSQLModel } from '../database/sqlModel.js';

export interface IHospital {
  _id?: any;
  id?: any;
  userId?: any;
  name: string;
  type: 'Government' | 'Private' | 'Charitable' | 'Autonomous' | string;
  tagline?: string;
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  geoJSON?: {
    type: 'Point';
    coordinates: [number, number];
  };
  phone: string;
  emergencyPhone?: string;
  email?: string;
  website?: string;
  workingHours?: string;
  emergencyAvailable?: boolean;
  totalBeds: number;
  availableBeds: number;
  specialistAvailable?: boolean;
  diagnosticFacilities?: string[];
  languagesSupported?: string[];
  averageWaitTimeMinutes?: number;
  rating?: number;
  isVerified?: boolean;
  imageUrl?: string;
  distanceKm?: number;
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
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const Hospital: any = createSQLModel<IHospital>('hospitals');
