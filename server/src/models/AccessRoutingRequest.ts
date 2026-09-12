import { createSQLModel } from '../database/sqlModel.js';

/**
 * AccessRoutingRequest — persists every non-clinical facility routing request.
 * This model stores ONLY logistical / access information.
 * No symptom data, no clinical information, no diagnosis data.
 */
export interface IAccessRoutingRequest {
  _id?: string;
  id?: string;
  requestId: string;
  patientId: string;
  // Non-clinical service requested (e.g. "General healthcare visit", "Diagnostic test")
  serviceNeeded: string;
  serviceNote?: string;
  // Location provided by patient
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  // Travel & access logistics
  travelMode: string;
  accessibilityNeeds?: string; // JSON array stored as string
  appointmentStatus: string;
  // Routing result summary stored for audit trail
  routingResultJson?: string; // JSON array of matched hospital IDs & scores
  resultCount: number;
  // Request lifecycle
  status: 'COMPLETED' | 'NO_RESULTS' | 'ERROR';
  createdAt: Date | string;
  save?: () => Promise<any>;
}

export const AccessRoutingRequest: any = createSQLModel<IAccessRoutingRequest>('access_routing_requests');
