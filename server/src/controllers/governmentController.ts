import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { GovernmentProfile } from '../models/GovernmentProfile.js';
import { Hospital } from '../models/Hospital.js';
import { Patient } from '../models/Patient.js';
import { HospitalRequest } from '../models/HospitalRequest.js';
import { FrictionProfile } from '../models/FrictionProfile.js';
import { CareRisk } from '../models/CareRisk.js';
import { AuditService } from '../services/auditService.js';

export class GovernmentController {
  public static async getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let profile = await GovernmentProfile.findOne({ userId: req.user?._id });
      if (!profile) profile = await GovernmentProfile.findOne({});
      if (!profile) {
        res.status(404).json({ success: false, message: 'Government profile not found.' });
        return;
      }
      res.status(200).json({ success: true, profile });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getDashboardAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const totalHospitals = await Hospital.countDocuments();
      const totalPatients = await Patient.countDocuments();
      const totalRequests = await HospitalRequest.countDocuments();
      const completedRequests = await HospitalRequest.countDocuments({ status: 'COMPLETED' });
      const highRisk = await CareRisk.countDocuments({ riskCategory: { $in: ['HIGH', 'CRITICAL'] } });

      const frictionProfiles = await FrictionProfile.find({});
      const avgFriction = frictionProfiles.length > 0
        ? Math.round(frictionProfiles.reduce((s: number, p: any) => s + (p.overallFrictionScore || 0), 0) / frictionProfiles.length)
        : 58;

      const barrierCounts: Record<string, number> = {};
      (frictionProfiles as any[]).forEach((p: any) => {
        const b = p.topBarrier || 'Transport';
        barrierCounts[b] = (barrierCounts[b] || 0) + 1;
      });

      res.status(200).json({
        success: true,
        analytics: {
          totalHospitals,
          totalPatients,
          totalRequests,
          completedRequests,
          highRiskPatients: highRisk,
          averageFrictionScore: avgFriction,
          careCompletionRate: Math.max(10, Math.round(completedRequests / Math.max(totalRequests, 1) * 100)),
          barrierDistribution: barrierCounts,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getAllHospitals(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const hospitals = await Hospital.find({});
      res.status(200).json({ success: true, count: (hospitals as any[]).length, hospitals });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async approveHospital(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : Array.isArray(req.params.id) ? req.params.id[0] : '';
      if (!id) {
        res.status(400).json({ success: false, message: 'Hospital ID is required.' });
        return;
      }
      const hospital = await Hospital.findById(id);
      if (!hospital) {
        res.status(404).json({ success: false, message: 'Hospital not found.' });
        return;
      }
      hospital.isVerified = true;
      hospital.govApprovalStatus = 'APPROVED';
      hospital.govApprovedBy = req.user?.name || 'Government Officer';
      hospital.govApprovedAt = new Date().toISOString();
      await hospital.save();

      await AuditService.log('HOSPITAL_APPROVED', 'Hospital', req, {
        userId: req.user?._id,
        resourceId: id,
        details: { hospitalName: hospital.name },
      });
      res.status(200).json({ success: true, message: `${hospital.name} has been approved.`, hospital });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async rejectHospital(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : Array.isArray(req.params.id) ? req.params.id[0] : '';
      if (!id) {
        res.status(400).json({ success: false, message: 'Hospital ID is required.' });
        return;
      }
      const { reason } = req.body;
      const hospital = await Hospital.findById(id);
      if (!hospital) {
        res.status(404).json({ success: false, message: 'Hospital not found.' });
        return;
      }
      hospital.isVerified = false;
      hospital.govApprovalStatus = 'REJECTED';
      hospital.govRejectionReason = reason || 'Does not meet criteria.';
      hospital.govApprovedBy = req.user?.name || 'Government Officer';
      hospital.govApprovedAt = new Date().toISOString();
      await hospital.save();

      await AuditService.log('HOSPITAL_REJECTED', 'Hospital', req, {
        userId: req.user?._id,
        resourceId: id,
        details: { reason },
      });
      res.status(200).json({ success: true, message: `${hospital.name} has been rejected.`, hospital });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
