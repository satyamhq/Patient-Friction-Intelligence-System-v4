import { createSQLModel } from '../database/sqlModel.js';

export type SyncOperationType =
  | 'VISIT_CREATED'
  | 'VISIT_COMPLETED'
  | 'BARRIER_RECORDED'
  | 'TASK_UPDATED'
  | 'APPOINTMENT_REQUESTED'
  | 'TOKEN_REQUESTED'
  | 'ESCALATION_SUBMITTED';

export interface IFrontlineSyncOperation {
  _id?: string;
  id?: string;
  workerId: string;
  localOperationId: string; // Idempotency key from client
  operationType: SyncOperationType;
  payload: any; // JSON payload
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  errorMessage?: string;
  serverEntityId?: string;
  syncedAt?: string | Date;
  createdAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const FrontlineSync: any = createSQLModel<IFrontlineSyncOperation>('frontline_sync_operations');
