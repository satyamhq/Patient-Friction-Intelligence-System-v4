import { createSQLModel } from '../database/sqlModel.js';

export interface IAuditLog {
  _id?: any;
  id?: any;
  userId?: any;
  actorRole?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp?: Date | string;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const AuditLog: any = createSQLModel<IAuditLog>('audit_logs');
