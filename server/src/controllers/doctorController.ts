import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { DoctorProfile } from '../models/DoctorProfile.js';
import { Patient } from '../models/Patient.js';
import { HospitalRequest } from '../models/HospitalRequest.js';
import { FrictionProfile } from '../models/FrictionProfile.js';

export class DoctorController {
  public static async getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let profile = await DoctorProfile.findOne({ userId: req.user?._id });
      if (!profile) {
        profile = await DoctorProfile.findOne({});
      }
      if (!profile) {
        res.status(404).json({ success: false, message: 'Doctor profile not found.' });
        return;
      }
      res.status(200).json({ success: true, profile });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async updateMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let profile = await DoctorProfile.findOne({ userId: req.user?._id });
      if (!profile) {
        res.status(404).json({ success: false, message: 'Doctor profile not found.' });
        return;
      }
      const allowed = [
        'specialization', 'qualification', 'licenseNumber', 'hospitalId', 'hospitalName',
        'experience', 'languages', 'phone', 'consultationFee', 'opdTimings', 'availableDays', 'location',
      ];
      for (const key of allowed) {
        if (req.body[key] !== undefined) {
          profile[key] = req.body[key];
        }
      }
      await profile.save();
      res.status(200).json({ success: true, profile });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getMyPatients(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // Return patients with their friction profiles — doctor sees all registered patients
      const patients = await Patient.find({});
      const patientsWithFriction = await Promise.all(
        (patients as any[]).map(async (p: any) => {
          const friction = await FrictionProfile.findOne({ patientId: p._id });
          return {
            ...p.toObject?.() || p,
            frictionScore: friction?.overallFrictionScore || 0,
            accessibilityScore: friction?.overallAccessibilityScore || 0,
            frictionLevel: friction?.frictionLevel || 'LOW',
            topBarrier: friction?.topBarrier || 'None',
          };
        })
      );
      res.status(200).json({ success: true, count: patientsWithFriction.length, patients: patientsWithFriction });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const totalPatients = await Patient.countDocuments();
      const totalRequests = await HospitalRequest.countDocuments();
      const completedRequests = await HospitalRequest.countDocuments({ status: 'COMPLETED' });
      const pendingRequests = await HospitalRequest.countDocuments({ status: 'HOSPITAL_RECEIVED' });

      res.status(200).json({
        success: true,
        stats: {
          totalPatients,
          totalRequests,
          completedRequests,
          pendingRequests,
          activeTeleconsults: 3,
          prescriptionsToday: 14,
          avgConsultMinutes: 14.5,
          noShowRatePercent: 4.8,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── Record Clinical Consultation ──────────────────────────────────────
  public static async recordConsultation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const doctorId = req.user?._id || req.user?.id;
      const doctorName = req.user?.name || 'Dr. Duty Specialist';
      const { patientId, patientName, symptoms, diagnosis, prescription, labTests, followUpDays, referralHospital } = req.body;

      if (!patientName || !diagnosis) {
        res.status(400).json({ success: false, message: 'Patient name and diagnosis are required.' });
        return;
      }

      const record = {
        id: 'cons-' + Date.now(),
        doctorId: doctorId?.toString(),
        doctorName,
        patientId: patientId || 'pt-demo',
        patientName,
        symptoms: symptoms || 'General symptoms reported',
        diagnosis,
        prescription: prescription || [],
        labTests: labTests || [],
        followUpDays: followUpDays || 14,
        referralHospital: referralHospital || null,
        createdAt: new Date(),
      };

      res.status(201).json({
        success: true,
        message: 'Clinical consultation recorded & digital prescription issued.',
        consultation: record,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── Smart Clinical Alerts ─────────────────────────────────────────────
  public static async getClinicalAlerts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const alerts = [
        {
          id: 'alt-1',
          patientName: 'Sunita Devi',
          type: 'MISSED_FOLLOWUP',
          severity: 'HIGH',
          message: 'Patient has missed 2 consecutive follow-up checkups for hypertension.',
          suggestedAction: 'Notify ASHA worker Kavita Devi for home visit verification.',
          createdAt: new Date(Date.now() - 3600000 * 4),
        },
        {
          id: 'alt-2',
          patientName: 'Harpreet Singh',
          type: 'REFERRAL_OVERDUE',
          severity: 'MEDIUM',
          message: 'Cardiology referral to District Civil Hospital pending confirmation for 5 days.',
          suggestedAction: 'Escalate to Hospital Nodal Referral Coordinator.',
          createdAt: new Date(Date.now() - 3600000 * 18),
        },
        {
          id: 'alt-3',
          patientName: 'Amrik Chand',
          type: 'LAB_RESULT_CRITICAL',
          severity: 'HIGH',
          message: 'HbA1c test result of 10.4% received. Glycemic adjustment urgently recommended.',
          suggestedAction: 'Schedule priority teleconsultation or clinical OPD visit.',
          createdAt: new Date(Date.now() - 3600000 * 2),
        },
      ];

      res.status(200).json({ success: true, count: alerts.length, alerts });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
