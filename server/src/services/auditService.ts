import { Types } from 'mongoose';
import { AuditLog } from '../models/AuditLog.js';
import { Request } from 'express';

export class AuditService {
  public static async log(
    action: string,
    resource: string,
    req?: Request,
    options?: {
      userId?: string | Types.ObjectId;
      actorRole?: string;
      resourceId?: string;
      details?: Record<string, any>;
    }
  ) {
    try {
      const ipAddress =
        req?.headers['x-forwarded-for']?.toString() || req?.socket?.remoteAddress || '127.0.0.1';
      const userAgent = req?.headers['user-agent'] || 'system-agent';

      await AuditLog.create({
        userId: options?.userId,
        actorRole: options?.actorRole || (req as any)?.user?.role || 'system',
        action,
        resource,
        resourceId: options?.resourceId,
        ipAddress,
        userAgent,
        details: options?.details || {},
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('[AuditService Error] Failed to write audit log:', error);
    }
  }
}
