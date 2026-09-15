import { createSQLModel } from '../database/sqlModel.js';

export interface IFacilityVerification {
  _id?: string;
  id?: string;
  facilityId: string;
  facilityName: string;
  facilityType: string;
  district: string;
  state: string;
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | 'SUSPENDED';
  previousStatus: string;
  newStatus: string;
  reviewedBy: string;
  reviewerRole: string;
  notes?: string;
  documentsReviewed?: string[];
  timestamp: string;
  created_at?: string;
  updated_at?: string;
  save?: () => Promise<any>;
}

export const FacilityVerification: any = createSQLModel<IFacilityVerification>('facility_verifications');
