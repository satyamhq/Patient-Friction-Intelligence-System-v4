import { createSQLModel } from '../database/sqlModel.js';

export interface IHospitalDepartment {
  _id?: any;
  id?: any;
  hospitalId: any;
  name: string;
  description?: string;
  headDoctorName?: string;
  opdDays?: string[];
  opdTimings?: string;
  dailyTokenCapacity?: number;
  availableTokensToday?: number;
  consultationFee?: number;
  isAcceptingRequests?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const HospitalDepartment: any = createSQLModel<IHospitalDepartment>('hospital_services');
