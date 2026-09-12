import { Response } from 'express';
import { PatientConsent } from '../models/PatientConsent.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class ConsentController {
  // Get active consents for patient
  public static async getMyConsents(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patientId = (req.user?._id || req.user?.id || 'demo-patient-id').toString();
      let consents = await PatientConsent.find({ patientId });

      // Seed defaults if empty
      if (consents.length === 0) {
        const defaults = [
          {
            patientId,
            scope: 'DOCTOR_CONSULT',
            recipientName: 'Registered PFIS Doctors & Specialists',
            purpose: 'Clinical diagnosis, OPD consultations & e-prescriptions',
            status: 'ACTIVE',
            validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
          },
          {
            patientId,
            scope: 'HOSPITAL_TRIAGE',
            recipientName: 'Empaneled District Civil Hospitals',
            purpose: 'Bed allocation, emergency intake & referral transfer',
            status: 'ACTIVE',
            validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
          },
          {
            patientId,
            scope: 'RESEARCH_ANALYTICS',
            recipientName: 'Health Ministry Non-Clinical Population Analytics',
            purpose: 'Waiting time reduction & public health friction mapping (anonymized)',
            status: 'ACTIVE',
            validUntil: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
            createdAt: new Date(),
          },
        ];
        for (const def of defaults) {
          await PatientConsent.create(def);
        }
        consents = await PatientConsent.find({ patientId });
      }

      res.status(200).json({
        success: true,
        count: consents.length,
        consents,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch consents.' });
    }
  }

  // Grant new consent
  public static async grantConsent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patientId = (req.user?._id || req.user?.id || 'demo-patient-id').toString();
      const { scope, recipientName, purpose, durationMonths } = req.body;

      const validUntil = new Date();
      validUntil.setMonth(validUntil.getMonth() + (durationMonths || 12));

      const consent = await PatientConsent.create({
        patientId,
        scope: scope || 'DOCTOR_CONSULT',
        recipientName: recipientName || 'Empaneled Health Provider',
        purpose: purpose || 'Clinical care and referral support',
        status: 'ACTIVE',
        validUntil,
        createdAt: new Date(),
      });

      res.status(201).json({
        success: true,
        message: 'Consent granted successfully.',
        consent,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to grant consent.' });
    }
  }

  // Revoke consent
  public static async revokeConsent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const consent = await PatientConsent.findById(id);
      if (!consent) {
        res.status(404).json({ success: false, message: 'Consent record not found.' });
        return;
      }
      consent.status = consent.status === 'ACTIVE' ? 'REVOKED' : 'ACTIVE';
      await consent.save();

      res.status(200).json({
        success: true,
        message: `Consent has been ${consent.status === 'ACTIVE' ? 'restored' : 'revoked'}.`,
        consent,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to toggle consent.' });
    }
  }
}
