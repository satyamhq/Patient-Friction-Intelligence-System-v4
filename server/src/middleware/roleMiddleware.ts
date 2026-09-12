import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';
import { UserRole } from '../models/User.js';

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    // Admin has superuser access across all portal endpoints
    if (!req.user || (!allowedRoles.includes(req.user.role) && req.user.role !== 'admin')) {
      res.status(403).json({
        success: false,
        message: `Access denied. Authorized roles: [${allowedRoles.join(', ')}]. Current role: [${
          req.user?.role || 'unauthenticated'
        }].`,
      });
      return;
    }
    next();
  };
};
