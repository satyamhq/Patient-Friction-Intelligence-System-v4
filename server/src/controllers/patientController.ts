import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Patient, IPatient } from '../models/Patient.js';
import { FrictionProfile } from '../models/FrictionProfile.js';
import { CareRisk } from '../models/CareRisk.js';
import { FrictionInteraction } from '../models/FrictionInteraction.js';
import { CareJourney } from '../models/CareJourney.js';
import { HospitalRequest } from '../models/HospitalRequest.js';
import { Hospital } from '../models/Hospital.js';
import { FrictionEngine } from '../intelligence/friction/frictionEngine.js';
import { FrictionInteractionEngine } from '../intelligence/causal/frictionInteractionEngine.js';
import { RiskEngine } from '../intelligence/risk/riskEngine.js';
import { AuditService } from '../services/auditService.js';

async function calculateRealFrictionForPatient(patientObj: any) {
  let nearestHosp: any = null;
  let minDistance = 2.7;
  const pLat = patientObj.location?.latitude;
  const pLng = patientObj.location?.longitude;

  if (pLat && pLng) {
    const allHospitals = await Hospital.find({});
    if (allHospitals && allHospitals.length > 0) {
      let lowest = 999999;
      for (const h of allHospitals) {
        const d = FrictionEngine.calculateHaversineDistance(pLat, pLng, h.latitude, h.longitude);
        if (d < lowest) {
          lowest = d;
          nearestHosp = h;
        }
      }
      if (lowest < 999999) {
        minDistance = Math.round(lowest * 10) / 10;
      }
    }
  }

  return FrictionEngine.calculate(patientObj, nearestHosp, minDistance);
}

export class PatientController {
  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let patient = await Patient.findOne({ userId: req.user?._id })
        .populate('preferredHospitalId')
        .populate('activeFrictionProfileId')
        .populate('activeCareRiskId');

      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient profile not found. Please complete your health profile setup.' });
        return;
      }

      const activeRequests = await HospitalRequest.find({
        patientId: patient._id,
        status: { $nin: ['COMPLETED', 'CANCELLED', 'REJECTED'] },
      })
        .populate('hospitalId', 'name address phone emergencyAvailable')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        patient,
        activeRequests,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch patient.' });
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let patient = await Patient.findOne({ userId: req.user?._id });
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient profile not found. Please complete your health profile setup.' });
        return;
      }

      const {
        age,
        gender,
        preferredLanguage,
        phone,
        emergencyContactName,
        emergencyContactPhone,
        transportAvailability,
        digitalAccessLevel,
        familySupport,
        documentationStatus,
        financialAccessibility,
        appointmentFlexibility,
        residenceType,
        location,
      } = req.body;

      if (age !== undefined) patient.age = age;
      if (gender) patient.gender = gender;
      if (preferredLanguage) patient.preferredLanguage = preferredLanguage;
      if (phone) patient.phone = phone;
      if (emergencyContactName) patient.emergencyContactName = emergencyContactName;
      if (emergencyContactPhone) patient.emergencyContactPhone = emergencyContactPhone;
      if (transportAvailability) patient.transportAvailability = transportAvailability;
      if (digitalAccessLevel) patient.digitalAccessLevel = digitalAccessLevel;
      if (familySupport) patient.familySupport = familySupport;
      if (documentationStatus) patient.documentationStatus = documentationStatus;
      if (financialAccessibility) patient.financialAccessibility = financialAccessibility;
      if (appointmentFlexibility) patient.appointmentFlexibility = appointmentFlexibility;
      if (residenceType) patient.residenceType = residenceType;

      if (location) {
        let existingLoc = patient.location || {};
        if (typeof existingLoc === 'string') {
          try {
            existingLoc = JSON.parse(existingLoc);
          } catch {
            existingLoc = {};
          }
        }
        const newLat = location.latitude !== undefined ? location.latitude : (existingLoc.latitude || 31.2533);
        const newLng = location.longitude !== undefined ? location.longitude : (existingLoc.longitude || 75.7042);
        patient.location = {
          address: location.address || existingLoc.address || 'UniCenter, LPU Campus',
          city: location.city || existingLoc.city || 'Phagwara',
          state: location.state || existingLoc.state || 'Punjab',
          pincode: location.pincode || existingLoc.pincode || '144411',
          latitude: newLat,
          longitude: newLng,
          geoJSON: {
            type: 'Point',
            coordinates: [newLng, newLat],
          },
        };
      }

      // Re-run Friction and Risk Engines using real nearest hospital distance
      const pObj = typeof patient.toObject === 'function' ? patient.toObject() : patient;
      const frictionCalc = await calculateRealFrictionForPatient(pObj);
      const frictionProfile = await FrictionProfile.create({
        patientId: patient._id,
        ...frictionCalc,
      });

      // Detect Compound Synergies
      const interactions = FrictionInteractionEngine.detectInteractions(frictionCalc);
      await FrictionInteraction.deleteMany({ patientId: patient._id });
      if (interactions.length > 0) {
        await FrictionInteraction.insertMany(
          interactions.map((i) => ({
            patientId: patient._id,
            frictionProfileId: frictionProfile._id,
            ...i,
          }))
        );
      }

      const riskCalc = RiskEngine.evaluate(frictionCalc);
      const careRisk = await CareRisk.create({
        patientId: patient._id,
        frictionProfileId: frictionProfile._id,
        ...riskCalc,
      });

      patient.activeFrictionProfileId = frictionProfile._id as any;
      patient.activeCareRiskId = careRisk._id as any;
      await patient.save();

      await AuditService.log('PATIENT_PROFILE_UPDATED', 'Patient', req, {
        userId: req.user?._id,
        resourceId: patient._id.toString(),
        details: { frictionScore: frictionCalc.overallFrictionScore },
      });

      res.status(200).json({
        success: true,
        message: 'Patient profile and friction metrics updated successfully.',
        patient,
        frictionProfile,
        careRisk,
        interactions,
      });
    } catch (error: any) {
      console.error('[PatientController.updateProfile Error]', error);
      res.status(500).json({ success: false, message: error.message || 'Update failed.' });
    }
  }

  public static async getFrictionProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let patient = await Patient.findOne({ userId: req.user?._id });
      if (!patient) {
        patient = await Patient.findOne({});
      }
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient profile not found.' });
        return;
      }

      let profile = await FrictionProfile.findOne({ patientId: patient._id }).sort({
        createdAt: -1,
      });

      if (!profile) {
        const pObj = typeof patient.toObject === 'function' ? patient.toObject() : patient;
        const frictionCalc = await calculateRealFrictionForPatient(pObj);
        profile = await FrictionProfile.create({
          patientId: patient._id,
          ...frictionCalc,
        });
      }

      const interactions = await FrictionInteraction.find({ patientId: patient._id });

      res.status(200).json({
        success: true,
        frictionProfile: profile,
        interactions,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch friction profile.' });
    }
  }

  public static async getAccessibilityRisk(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let patient = await Patient.findOne({ userId: req.user?._id });
      if (!patient) {
        patient = await Patient.findOne({});
      }
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient not found.' });
        return;
      }

      let risk = await CareRisk.findOne({ patientId: patient._id }).sort({ createdAt: -1 });

      if (!risk) {
        const pObj = typeof patient.toObject === 'function' ? patient.toObject() : patient;
        const frictionCalc = await calculateRealFrictionForPatient(pObj);
        const riskCalc = RiskEngine.evaluate(frictionCalc);
        risk = await CareRisk.create({
          patientId: patient._id,
          ...riskCalc,
        });
      }

      if (risk) {
        if (typeof risk.primaryRiskFactors === 'string') {
          try {
            risk.primaryRiskFactors = JSON.parse(risk.primaryRiskFactors);
          } catch {}
        }
        if (typeof risk.mitigationPathways === 'string') {
          try {
            risk.mitigationPathways = JSON.parse(risk.mitigationPathways);
          } catch {}
        }
      }

      res.status(200).json({
        success: true,
        careRisk: risk,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch risk.' });
    }
  }

  public static async getCareJourney(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let patient = await Patient.findOne({ userId: req.user?._id });
      if (!patient) {
        patient = await Patient.findOne({});
      }
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient not found.' });
        return;
      }

      let journey = await CareJourney.findOne({ patientId: patient._id }).sort({ createdAt: -1 });

      if (journey && typeof journey.stages === 'string') {
        try {
          journey.stages = JSON.parse(journey.stages);
        } catch {}
      }

      if (!journey || !journey.stages || !Array.isArray(journey.stages) || journey.stages.length === 0) {
        // Initialize 9 standard stages
        const stages = [
          {
            stageName: 'Medical Need',
            order: 1,
            status: 'COMPLETED',
            frictionLevel: 'LOW',
            observedBarrier: 'Symptom recognized by household',
          },
          {
            stageName: 'Hospital Search',
            order: 2,
            status: 'COMPLETED',
            frictionLevel: 'LOW',
            observedBarrier: 'Facility identified via PFIS',
          },
          {
            stageName: 'Travel',
            order: 3,
            status: patient.transportAvailability === 'none' ? 'AT_RISK' : 'IN_PROGRESS',
            frictionLevel: patient.transportAvailability === 'none' ? 'CRITICAL' : 'MEDIUM',
            observedBarrier: '35 km transit across rural roads',
            mitigationSuggestion: 'Community Health Shuttle voucher',
          },
          {
            stageName: 'Transport',
            order: 4,
            status: 'PENDING',
            frictionLevel: 'HIGH',
            observedBarrier: 'Shared auto timetable irregularity',
          },
          {
            stageName: 'Appointment',
            order: 5,
            status: 'PENDING',
            frictionLevel: 'MEDIUM',
            observedBarrier: 'OPD queue token wait time',
          },
          {
            stageName: 'Hospital Visit',
            order: 6,
            status: 'PENDING',
            frictionLevel: 'LOW',
            observedBarrier: 'Registration desk verification',
          },
          {
            stageName: 'Service',
            order: 7,
            status: 'PENDING',
            frictionLevel: 'MEDIUM',
            observedBarrier: 'Diagnostic test routing',
          },
          {
            stageName: 'Treatment',
            order: 8,
            status: 'PENDING',
            frictionLevel: 'LOW',
            observedBarrier: 'Doctor consultation & prescription',
          },
          {
            stageName: 'Follow-up',
            order: 9,
            status: 'PENDING',
            frictionLevel: 'HIGH',
            observedBarrier: 'Repeat 30-day travel fatigue',
          },
        ];

        if (!journey) {
          journey = await CareJourney.create({
            patientId: patient._id,
            stages: stages as any,
            currentStageIndex: 2,
            overallJourneyHealth: 'SLIGHT_FRICTION',
          });
        } else {
          journey.stages = stages;
          if (typeof journey.currentStageIndex !== 'number') journey.currentStageIndex = 2;
          if (!journey.overallJourneyHealth) journey.overallJourneyHealth = 'SLIGHT_FRICTION';
          await journey.save();
        }
      }

      if (journey && typeof journey.stages === 'string') {
        try {
          journey.stages = JSON.parse(journey.stages);
        } catch {}
      }

      res.status(200).json({
        success: true,
        careJourney: journey,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch journey.' });
    }
  }
}
