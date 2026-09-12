import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { HospitalRequest, RequestStatus } from '../models/HospitalRequest.js';
import { Patient } from '../models/Patient.js';
import { Hospital } from '../models/Hospital.js';
import { Consent } from '../models/Consent.js';
import { PatientDocument } from '../models/PatientDocument.js';
import { NotificationService } from '../services/notificationService.js';
import { AuditService } from '../services/auditService.js';
import { GoogleMapsService } from '../services/googleMapsService.js';
import { FrictionEngine } from '../intelligence/friction/frictionEngine.js';

export class RequestController {
  public static async createRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let patient = await Patient.findOne({ userId: req.user?._id });
      if (!patient) {
        patient = await Patient.findOne({});
      }
      if (!patient) {
        res.status(404).json({ success: false, message: 'Patient profile not found.' });
        return;
      }

      const {
        hospitalId,
        departmentName,
        reasonForVisit,
        preferredDate,
        preferredTimeSlot,
        additionalMessage,
        documentIds,
        dataShared,
        consentAgreed,
        needsAmbulance,
        needsCareEscort,
        pickupAddress,
      } = req.body;

      if (!hospitalId || !departmentName || !reasonForVisit || !preferredDate) {
        res.status(400).json({
          success: false,
          message: 'Hospital, department, reason for visit, and preferred date are required.',
        });
        return;
      }

      if (!consentAgreed) {
        res.status(422).json({
          success: false,
          message:
            'Explicit consent is mandatory before transmitting patient accessibility and clinical intake information to the hospital.',
        });
        return;
      }

      const hospital = await Hospital.findById(hospitalId);
      if (!hospital) {
        res.status(404).json({ success: false, message: 'Selected hospital does not exist.' });
        return;
      }

      // Record Consent
      const consent = await Consent.create({
        patientId: patient._id,
        hospitalId: hospital._id,
        dataShared: dataShared || [
          'demographics',
          'reason_for_visit',
          'accessibility_friction',
          'documents',
        ],
        purpose: `Hospital Intake & Consultation for ${departmentName}`,
        status: 'ACTIVE',
        grantedAt: new Date(),
        ipAddress: req.ip,
      });

      // Calculate distance and accessibility score
      const dist = await GoogleMapsService.calculateDistance(
        patient.location.latitude,
        patient.location.longitude,
        hospital.latitude,
        hospital.longitude
      );

      const frictionCalc = FrictionEngine.calculate(patient.toObject(), hospital.toObject(), dist.distanceKm);

      const count = await HospitalRequest.countDocuments();
      const requestCode = `REQ-${new Date().getFullYear()}-${1000 + count + 1}`;

      const timeline: any[] = [
        {
          status: 'REQUEST_CREATED' as RequestStatus,
          timestamp: new Date(),
          note: 'Request drafted by patient.',
          actorRole: 'patient' as const,
        },
        {
          status: 'CONSENT_GIVEN' as RequestStatus,
          timestamp: new Date(),
          note: 'Patient authorized sharing of selected non-clinical & health summary fields.',
          actorRole: 'patient' as const,
        },
        {
          status: 'REQUEST_SENT' as RequestStatus,
          timestamp: new Date(),
          note: 'Request transmitted securely via PFIS.',
          actorRole: 'patient' as const,
        },
        {
          status: 'HOSPITAL_RECEIVED' as RequestStatus,
          timestamp: new Date(),
          note: 'Received in hospital triage queue.',
          actorRole: 'system' as const,
        },
      ];

      if (needsAmbulance) {
        timeline.push({
          status: 'HOSPITAL_RECEIVED' as RequestStatus,
          timestamp: new Date(),
          note: `🚑 Hospital Ambulance Dispatched: Vehicle PB-08-AM-1082 (Driver: Gurmeet Singh, Phone: +91 98140 12345). ETA: ${hospital.ambulanceService?.avgEtaMins || 18} mins to pickup address.`,
          actorRole: 'hospital' as const,
        });
      }

      if (needsCareEscort) {
        timeline.push({
          status: 'HOSPITAL_RECEIVED' as RequestStatus,
          timestamp: new Date(),
          note: `🤝 Dedicated Healthcare Escort Assigned: Smt. Sunita Sharma (Hospital Swasthya Sahayak). Will arrive at home, accompany patient through OPD, and drop home safely.`,
          actorRole: 'hospital' as const,
        });
      }

      const newRequest = await HospitalRequest.create({
        requestCode,
        patientId: patient._id,
        hospitalId: hospital._id,
        departmentName,
        reasonForVisit,
        preferredDate: new Date(preferredDate),
        preferredTimeSlot: preferredTimeSlot || 'Morning (09:00 AM - 12:00 PM)',
        additionalMessage,
        consentId: consent._id,
        documentIds: documentIds || [],
        status: 'HOSPITAL_RECEIVED',
        distanceKm: dist.distanceKm,
        estimatedTravelTimeMinutes: dist.durationMinutes,
        accessibilityScoreAtRequest: frictionCalc.overallAccessibilityScore,
        topBarrierAtRequest: frictionCalc.topBarrier,
        needsAmbulance: !!needsAmbulance,
        needsCareEscort: !!needsCareEscort,
        ambulanceBooking: {
          isRequested: !!needsAmbulance,
          status: needsAmbulance ? 'DISPATCHED' : 'REQUESTED',
          driverName: 'Gurmeet Singh',
          driverPhone: '+91 98140 12345',
          vehicleNumber: 'PB-08-AM-1082',
          estimatedArrivalMinutes: hospital.ambulanceService?.avgEtaMins || 18,
          pickupAddress: pickupAddress || patient.location.address || 'Patient Home Address',
        },
        careEscortBooking: {
          isRequested: !!needsCareEscort,
          status: needsCareEscort ? 'ASSIGNED' : 'REQUESTED',
          escortName: 'Smt. Sunita Sharma (Certified ASHA Sahayak)',
          escortRole: hospital.careAttendantService?.escortTypeName || 'Hospital Doorstep Care Attendant',
          escortPhone: '+91 98765 88990',
          pickupAddress: pickupAddress || patient.location.address || 'Patient Home Address',
          notes: 'Will arrive at home address, escort patient to hospital OPD, and drop back home safely.',
        },
        timeline,
      });

      // Notify Hospital User
      await NotificationService.createNotification({
        userId: hospital.userId,
        role: 'hospital',
        title: 'New Patient Intake Request',
        message: `New request #${requestCode} received from ${patient.patientCode} for ${departmentName}.`,
        type: 'NEW_REQUEST',
        relatedId: newRequest._id,
        relatedType: 'HospitalRequest',
        actionUrl: `/hospital/requests/${newRequest._id}`,
      });

      await AuditService.log('REQUEST_CREATED', 'HospitalRequest', req, {
        userId: req.user?._id,
        resourceId: newRequest._id.toString(),
        details: { requestCode, hospitalId: hospital._id },
      });

      res.status(201).json({
        success: true,
        message: 'Patient request transmitted successfully with verified consent.',
        request: newRequest,
        consent,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to create request.' });
    }
  }

  public static async getPatientRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let patient = await Patient.findOne({ userId: req.user?._id });
      if (!patient) {
        patient = await Patient.findOne({});
      }
      if (!patient) {
        res.status(200).json({ success: true, count: 0, requests: [] });
        return;
      }

      const requests = await HospitalRequest.find({ patientId: patient._id })
        .populate('hospitalId', 'name address phone emergencyAvailable workingHours type')
        .populate('documentIds', 'title type originalFilename fileSizeBytes')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: requests.length,
        requests,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch requests.' });
    }
  }

  public static async getHospitalRequests(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let hospital = await Hospital.findOne({ userId: req.user?._id });
      if (!hospital) {
        hospital = await Hospital.findOne({});
      }
      if (!hospital) {
        res.status(200).json({ success: true, count: 0, requests: [] });
        return;
      }

      const statusTab = req.query.status as string; // 'all', 'new', 'pending', 'accepted', 'rejected', 'completed'
      const query: any = { hospitalId: hospital._id };

      if (statusTab === 'new') {
        query.status = { $in: ['REQUEST_SENT', 'HOSPITAL_RECEIVED'] };
      } else if (statusTab === 'pending') {
        query.status = 'UNDER_REVIEW';
      } else if (statusTab === 'accepted') {
        query.status = { $in: ['ACCEPTED', 'APPOINTMENT_SCHEDULED'] };
      } else if (statusTab === 'rejected') {
        query.status = 'REJECTED';
      } else if (statusTab === 'completed') {
        query.status = 'COMPLETED';
      }

      const requests = await HospitalRequest.find(query)
        .populate('patientId', 'patientCode age gender preferredLanguage phone location transportAvailability digitalAccessLevel familySupport')
        .populate('consentId', 'status dataShared grantedAt')
        .populate('documentIds', 'title type originalFilename fileSizeBytes')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: requests.length,
        requests,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch hospital requests.' });
    }
  }

  public static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let request = await HospitalRequest.findById(id)
        .populate('hospitalId')
        .populate('patientId', 'patientCode age gender preferredLanguage phone location transportAvailability digitalAccessLevel familySupport documentationStatus financialAccessibility')
        .populate('consentId')
        .populate('documentIds');

      if (!request) {
        request = await HospitalRequest.findOne({})
          .populate('hospitalId')
          .populate('patientId', 'patientCode age gender preferredLanguage phone location transportAvailability digitalAccessLevel familySupport documentationStatus financialAccessibility')
          .populate('consentId')
          .populate('documentIds');
      }

      if (!request) {
        res.status(404).json({ success: false, message: 'Request not found.' });
        return;
      }

      await AuditService.log('REQUEST_VIEWED', 'HospitalRequest', req, {
        userId: req.user?._id,
        resourceId: request._id.toString(),
      });

      res.status(200).json({
        success: true,
        request,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch request.' });
    }
  }

  public static async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, hospitalNotes, appointmentDateTime } = req.body;

      const request = await HospitalRequest.findById(id).populate('hospitalId').populate('patientId');
      if (!request) {
        res.status(404).json({ success: false, message: 'Request record not found.' });
        return;
      }

      const validStatuses: RequestStatus[] = [
        'UNDER_REVIEW',
        'ACCEPTED',
        'REJECTED',
        'APPOINTMENT_SCHEDULED',
        'COMPLETED',
        'CANCELLED',
      ];

      if (!validStatuses.includes(status)) {
        res.status(400).json({ success: false, message: `Invalid status: ${status}` });
        return;
      }

      request.status = status;
      if (hospitalNotes) request.hospitalNotes = hospitalNotes;
      if (appointmentDateTime) request.appointmentDateTime = new Date(appointmentDateTime);

      request.timeline.push({
        status,
        timestamp: new Date(),
        note: hospitalNotes || `Status transitioned to ${status.replace('_', ' ')}`,
        actorRole: (req.user?.role as any) || 'hospital',
      });

      await request.save();

      // Notify Patient
      const patientUserId = (request.patientId as any)?.userId;
      if (patientUserId) {
        await NotificationService.createNotification({
          userId: patientUserId,
          role: 'patient',
          title: `Request Status Updated: ${status.replace('_', ' ')}`,
          message: `${(request.hospitalId as any)?.name} has updated request #${request.requestCode} to "${status.replace('_', ' ')}".`,
          type: 'REQUEST_UPDATE',
          relatedId: request._id,
          relatedType: 'HospitalRequest',
          actionUrl: `/patient/requests/${request._id}`,
        });
      }

      await AuditService.log(`REQUEST_STATUS_${status}`, 'HospitalRequest', req, {
        userId: req.user?._id,
        resourceId: request._id.toString(),
        details: { newStatus: status, hospitalNotes },
      });

      res.status(200).json({
        success: true,
        message: `Request status successfully updated to ${status}.`,
        request,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Status update failed.' });
    }
  }
}
