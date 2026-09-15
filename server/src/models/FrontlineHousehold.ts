import { createSQLModel } from '../database/sqlModel.js';

export interface IHouseholdMember {
  patientId?: string;
  name: string;
  age: number;
  gender: string;
  relation: string;
  phone?: string;
  hasAbha?: boolean;
  chronicConditions?: string[];
}

export interface IFrontlineHousehold {
  _id?: string;
  id?: string;
  householdId: string; // e.g. 'HH-PB-KPT-001'
  address: string;
  villageName: string;
  subCentre: string;
  phc: string;
  block: string;
  district: string;
  state: string;
  assignedWorkerId: string;
  assignedWorkerName: string;
  familyHead: string;
  familyHeadPhone?: string;
  totalMembers: number;
  members: IHouseholdMember[] | string; // JSON string in SQL store
  lastVisitDate?: string;
  nextPlannedVisit?: string;
  pendingTasksCount?: number;
  accessBarriers?: string[] | string;
  coordinationStatus?: 'Active' | 'Follow-up Due' | 'Service Connected' | 'Needs Assistance';
  accessFrictionLevel?: 'Low' | 'Moderate' | 'High' | 'Critical';
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const FrontlineHousehold: any = createSQLModel<IFrontlineHousehold>('frontline_households');
