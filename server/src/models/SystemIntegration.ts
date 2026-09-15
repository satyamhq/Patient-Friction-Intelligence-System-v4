import { createSQLModel } from '../database/sqlModel.js';

export interface ISystemIntegration {
  _id?: string;
  id?: string;
  name: string;
  category: 'ABDM' | 'EMERGENCY' | 'PHARMACY' | 'LABORATORY' | 'TELEMEDICINE' | 'DATABASE' | 'SECURITY';
  description: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'PENDING' | 'ERROR' | 'NOT_CONFIGURED' | 'INTEGRATION_REQUIRED';
  endpointUrl?: string;
  lastHealthCheck?: string;
  healthResponseTimeMs?: number;
  environment: 'PRODUCTION' | 'STAGING' | 'SANDBOX' | 'DEMO_TEST';
  complianceLevel?: string;
  auditNotes?: string;
  created_at?: string;
  updated_at?: string;
  save?: () => Promise<any>;
}

export const SystemIntegration: any = createSQLModel<ISystemIntegration>('system_integrations');
