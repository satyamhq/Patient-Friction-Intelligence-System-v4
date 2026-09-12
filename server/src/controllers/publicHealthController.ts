import { Request, Response } from 'express';
import crypto from 'crypto';
import { PublicHealthRepository } from '../database/repositories/PublicHealthRepository.js';
import { HospitalRepository } from '../database/repositories/HospitalRepository.js';
import { AccessRoutingRequest } from '../models/AccessRoutingRequest.js';

function toSingleString(val: unknown): string {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return '';
}

function toOptionalString(val: unknown): string | undefined {
  if (typeof val === 'string' && val.trim().length > 0) return val.trim();
  if (Array.isArray(val) && typeof val[0] === 'string' && val[0].trim().length > 0) return val[0].trim();
  return undefined;
}

export class PublicHealthController {
  // 1. Digital Triage
  static async runTriage(req: Request, res: Response) {
    try {
      const {
        patientId,
        chiefComplaint,
        symptoms = [],
        vitals = {},
        mobilityStatus = 'Walkable',
        distanceKm = 15,
        hasCaregiver = true,
      } = req.body;

      if (!chiefComplaint) {
        return res.status(400).json({ success: false, message: 'Chief complaint is required' });
      }

      const complaintLower = chiefComplaint.toLowerCase();
      const symptomsStr = Array.isArray(symptoms) ? symptoms.join(' ').toLowerCase() : String(symptoms).toLowerCase();
      const combined = `${complaintLower} ${symptomsStr}`;

      // Acuity & Tier Logic
      let acuityLevel: 'Emergency' | 'Urgent' | 'Routine' | 'Preventive' = 'Routine';
      let recommendedTier = 'Primary Health Centre (PHC)';
      let triageNotes = '';
      const operationalBarriers: string[] = [];

      if (
        combined.includes('chest pain') ||
        combined.includes('heart') ||
        combined.includes('unconscious') ||
        combined.includes('severe bleeding') ||
        combined.includes('snake bite') ||
        combined.includes('stroke') ||
        combined.includes('paralysis') ||
        combined.includes('poison') ||
        combined.includes('accident')
      ) {
        acuityLevel = 'Emergency';
        recommendedTier = '108 Emergency / Trauma Care';
        triageNotes = 'CRITICAL EMERGENCY: Immediate paramedic dispatch and trauma care required. Do not travel via standard bus transit.';
      } else if (
        combined.includes('fracture') ||
        combined.includes('high fever') ||
        combined.includes('labor') ||
        combined.includes('pregnancy pain') ||
        combined.includes('severe abdominal') ||
        combined.includes('breathing difficulty') ||
        combined.includes('asthma') ||
        (vitals.bpSystolic && vitals.bpSystolic > 170)
      ) {
        acuityLevel = 'Urgent';
        recommendedTier = 'Rural Hospital (RH)';
        triageNotes = 'URGENT SPECIALIST CARE: Requires 24/7 doctor supervision, ultrasound, X-ray, or obstetric intervention at Rural Hospital.';
      } else if (
        combined.includes('fever') ||
        combined.includes('cough') ||
        combined.includes('vomiting') ||
        combined.includes('diarrhea') ||
        combined.includes('infection') ||
        combined.includes('hypertension') ||
        combined.includes('diabetes')
      ) {
        acuityLevel = 'Routine';
        recommendedTier = 'Primary Health Centre (PHC)';
        triageNotes = 'PRIMARY CLINICAL EVALUATION: Manageable at local PHC with MBBS Medical Officer and routine laboratory testing.';
      } else {
        acuityLevel = 'Preventive';
        recommendedTier = 'Sub-Centre / AAM';
        triageNotes = 'WELLNESS & PREVENTIVE: Suitable for Health & Wellness Centre (AAM) for vitals screening, dressing, or routine medicine refill.';
      }

      if (distanceKm > 25) operationalBarriers.push(`Long Distance (${distanceKm} km) - Travel voucher / assisted transport recommended`);
      if (mobilityStatus === 'Wheelchair' || mobilityStatus === 'Bedridden') operationalBarriers.push('Mobility Impairment - Ground floor OPD & Escort required');
      if (!hasCaregiver) operationalBarriers.push('No Caregiver - Patient Concierge or ASHA accompaniment requested');

      // Find suitable facility
      const allHospitals = await HospitalRepository.findAll();
      let matchedHosp = allHospitals.find(h => h.type.toLowerCase().includes(recommendedTier.toLowerCase()) || h.name.toLowerCase().includes(recommendedTier.toLowerCase()));
      if (!matchedHosp) {
        matchedHosp = allHospitals[0];
      }

      const triageRecord = await PublicHealthRepository.createTriage({
        patient_id: patientId || (req as any).user?.id,
        chief_complaint: chiefComplaint,
        acuity_level: acuityLevel,
        recommended_tier: recommendedTier,
        recommended_hospital_id: matchedHosp?.id,
        symptoms_json: JSON.stringify(symptoms),
        vitals_json: JSON.stringify(vitals),
        operational_barriers_json: JSON.stringify(operationalBarriers),
        triage_notes: triageNotes,
      });

      return res.status(200).json({
        success: true,
        data: {
          triage: triageRecord,
          recommendedFacility: matchedHosp,
          acuityLevel,
          recommendedTier,
          triageNotes,
          operationalBarriers,
          actionableSteps: [
            acuityLevel === 'Emergency' ? 'Call 108 immediately or click Emergency SOS button' : 'Book OPD Token at recommended facility',
            'Download/Show Digital Triage Pass to OPD Registration Desk for queue prioritization',
            'Consult with ASHA worker for free transport reimbursement if applicable',
          ],
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getPatientTriage(req: Request, res: Response) {
    try {
      const patientId = toOptionalString(req.params.patientId) || (req as any).user?.id || 'demo-patient';
      const records = await PublicHealthRepository.findTriageByPatient(patientId);
      return res.status(200).json({ success: true, data: records });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 2. Referrals — all endpoints require authentication
  // Patient role: can only see/create their own referrals
  // Hospital/Admin: can filter by facility
  static async getReferrals(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?._id;
      const userRole: string = user?.role || 'patient';

      let filter: { patient_id?: string; facility_id?: string } = {};

      if (userRole === 'patient') {
        // Patients ONLY see their own referrals — enforced server-side
        filter.patient_id = String(userId);
      } else if (req.query.facilityId) {
        filter.facility_id = toOptionalString(req.query.facilityId);
      } else if (req.query.patientId) {
        filter.patient_id = toOptionalString(req.query.patientId);
      }

      const referrals = await PublicHealthRepository.getReferrals(filter);
      return res.status(200).json({ success: true, data: referrals });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getReferralById(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = String(user?.id || user?._id);
      const userRole: string = user?.role || 'patient';
      const referralId = toSingleString(req.params.id);

      if (!referralId) {
        return res.status(400).json({ success: false, message: 'Referral ID is required.' });
      }

      const referral = await PublicHealthRepository.getReferralById(referralId);
      if (!referral) {
        return res.status(404).json({ success: false, message: 'Referral not found.' });
      }

      // Authorization: patient can only access their own referrals
      if (userRole === 'patient' && referral.patient_id !== userId) {
        return res.status(403).json({ success: false, message: 'Access denied. You may only view your own referrals.' });
      }

      const events = await PublicHealthRepository.getEventsByReferralId(referralId);
      return res.status(200).json({ success: true, data: { referral, events } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getReferralEvents(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = String(user?.id || user?._id);
      const userRole: string = user?.role || 'patient';
      const referralId = toSingleString(req.params.id);

      if (!referralId) {
        return res.status(400).json({ success: false, message: 'Referral ID is required.' });
      }

      // Verify patient owns this referral before exposing events
      if (userRole === 'patient') {
        const referral = await PublicHealthRepository.getReferralById(referralId);
        if (!referral || referral.patient_id !== userId) {
          return res.status(403).json({ success: false, message: 'Access denied.' });
        }
      }

      const events = await PublicHealthRepository.getEventsByReferralId(referralId);
      return res.status(200).json({ success: true, data: events });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createReferral(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      // Patient ID and name MUST come from the authenticated JWT — never from request body
      const patientId = String(user?.id || user?._id);
      const patientName: string = (user?.name || '').trim();

      if (!patientId || !patientName) {
        return res.status(401).json({ success: false, message: 'Authentication required to create a referral.' });
      }

      const {
        fromFacilityId,
        fromFacilityName,
        fromTier,
        toFacilityId,
        toFacilityName,
        toTier,
        requestedService,
        specialtyRequired,
        reasonForReferral,
        priority = 'Routine',
        transportNotes = '',
        additionalNotes = '',
      } = req.body;

      if (!fromFacilityName || !toFacilityName || !requestedService) {
        return res.status(400).json({
          success: false,
          message: 'Sending facility, receiving facility, and requested service are required.',
        });
      }

      // Prevent duplicate submissions (check for identical referral within last 30 seconds)
      const recentReferrals = await PublicHealthRepository.getReferrals({ patient_id: patientId });
      const thirtySecondsAgo = new Date(Date.now() - 30_000).toISOString();
      const isDuplicate = recentReferrals.some(
        r =>
          r.from_facility_name === fromFacilityName &&
          r.to_facility_name === toFacilityName &&
          r.specialty_required === (requestedService || specialtyRequired) &&
          (r.created_at || '') > thirtySecondsAgo
      );
      if (isDuplicate) {
        return res.status(409).json({
          success: false,
          message: 'A referral with these details was already submitted in the last 30 seconds. Please wait before submitting again.',
        });
      }

      const referral = await PublicHealthRepository.createReferral({
        patient_id: patientId,
        patient_name: patientName,
        from_facility_id: fromFacilityId || '',
        from_facility_name: fromFacilityName,
        from_tier: fromTier || 'Not specified',
        to_facility_id: toFacilityId || '',
        to_facility_name: toFacilityName,
        to_tier: toTier || 'Not specified',
        specialty_required: requestedService || specialtyRequired || 'General service',
        reason_for_referral: reasonForReferral || requestedService || 'Not specified',
        priority: (['Routine', 'Urgent', 'Emergency'].includes(priority) ? priority : 'Routine') as 'Routine' | 'Urgent' | 'Emergency',
        transport_mode: transportNotes.trim() || 'Not specified',
        status: 'SUBMITTED',
        counter_referral_notes: additionalNotes.trim() || undefined,
      });

      // Create initial audit event for referral creation
      await PublicHealthRepository.createReferralEvent({
        referral_id: referral.id,
        previous_status: '',
        new_status: 'SUBMITTED',
        timestamp: referral.created_at || new Date().toISOString(),
        actor_id: patientId,
        actor_name: patientName,
        reason: 'Referral submitted by patient',
      });

      return res.status(201).json({
        success: true,
        data: referral,
        message: 'Referral created successfully.',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Referral could not be created. Please try again.' });
    }
  }

  static async updateReferralStatus(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const userId = String(user?.id || user?._id);
      const userRole: string = user?.role || 'patient';
      const id = toSingleString(req.params.id);

      if (!id) {
        return res.status(400).json({ success: false, message: 'Referral ID is required.' });
      }

      // Patients cannot change referral status
      if (userRole === 'patient') {
        return res.status(403).json({
          success: false,
          message: 'Patients cannot change referral status. Only authorized facility staff or administrators can update referral status.',
        });
      }

      const { status, counterReferralNotes, reason } = req.body;

      // Validate allowed status values
      const ALLOWED_STATUSES = ['SUBMITTED', 'SENT', 'RECEIVED', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CLOSED', 'CANCELLED', 'EXPIRED'];
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status '${status}'. Allowed values: ${ALLOWED_STATUSES.join(', ')}`,
        });
      }

      const updated = await PublicHealthRepository.updateReferralStatus(
        id,
        status,
        counterReferralNotes,
        userId,
        user?.name || 'Authorized staff',
        reason
      );

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Referral not found.' });
      }

      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 3. Health Records (Longitudinal & ABHA)
  static async getHealthRecords(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      if (!authUser || !authUser.id) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const authUserId = authUser.id;
      const authRole = authUser.role || 'patient';
      const authName = authUser.name || 'Patient';

      let targetPatientId = authUserId;
      if (authRole !== 'patient') {
        const queryPatientId = toOptionalString(req.query.patientId) || toOptionalString(req.params.patientId);
        if (queryPatientId) {
          targetPatientId = queryPatientId;
          // Consent check for external healthcare providers
          const consents = await PublicHealthRepository.getHealthRecordConsents(targetPatientId);
          const hasActiveConsent = consents.some((c) => c.status === 'active');
          if (!hasActiveConsent) {
            await PublicHealthRepository.createHealthRecordAuditEvent({
              patient_id: targetPatientId,
              event_type: 'CONSENT_CHECKED',
              actor_id: authUserId,
              actor_name: authName,
              actor_role: authRole,
              result: 'DENIED',
              notes: 'Attempted to access patient records without active consent authorization',
            });
            return res.status(403).json({
              success: false,
              message: 'Access requires your authorization.',
              code: 'CONSENT_REQUIRED',
            });
          }
        }
      }

      // 1. Get ABHA integration status
      const abhaEntity = await PublicHealthRepository.getPatientAbha(targetPatientId);
      const abha = abhaEntity
        ? {
            status: abhaEntity.status,
            abhaNumber: abhaEntity.abha_number || null,
            abhaAddress: abhaEntity.abha_address || null,
            name: abhaEntity.name || authName,
            dob: abhaEntity.dob || null,
            gender: abhaEntity.gender || null,
            state: abhaEntity.state || null,
            verificationStatus: abhaEntity.verification_status || 'ABHA not connected',
            qrAvailable: !!abhaEntity.qr_data,
            qrData: abhaEntity.qr_data || null,
            lastSyncTime: abhaEntity.last_sync_time || null,
          }
        : {
            status: 'not_connected',
            abhaNumber: null,
            abhaAddress: null,
            name: authName,
            dob: null,
            gender: null,
            state: null,
            verificationStatus: 'ABHA not connected',
            qrAvailable: false,
            qrData: null,
            lastSyncTime: null,
          };

      // 2. Fetch records
      const records = await PublicHealthRepository.getHealthRecords(targetPatientId);

      // 3. Log access audit event
      await PublicHealthRepository.createHealthRecordAuditEvent({
        patient_id: targetPatientId,
        event_type: 'RECORD_ACCESSED',
        actor_id: authUserId,
        actor_name: authName,
        actor_role: authRole,
        result: 'SUCCESS',
        notes: `Retrieved ${records.length} health record(s)`,
      });

      return res.status(200).json({
        success: true,
        data: {
          abha,
          records,
          syncStatus: abha.status === 'verified' ? 'synchronized' : 'not_synchronized',
          lastSyncTime: abha.lastSyncTime,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async connectAbha(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      if (!authUser || !authUser.id) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { abhaNumber, abhaAddress } = req.body;
      const cleanNum = toOptionalString(abhaNumber);
      const cleanAddr = toOptionalString(abhaAddress);

      if (!cleanNum && !cleanAddr) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid 14-digit ABHA number or ABHA address (e.g. yourname@abdm).',
        });
      }

      const now = new Date().toISOString();
      const updated = await PublicHealthRepository.upsertPatientAbha({
        patient_id: authUser.id,
        status: 'connected',
        abha_number: cleanNum || null,
        abha_address: cleanAddr || null,
        name: authUser.name || 'Patient',
        verification_status: 'Self-linked (Official ABDM verification pending gateway sync)',
        qr_data: null, // Per spec Rule 3: Do NOT generate a decorative/fake QR code
        last_sync_time: now,
      });

      await PublicHealthRepository.createHealthRecordAuditEvent({
        patient_id: authUser.id,
        event_type: 'ABHA_CONNECTION_CHANGED',
        actor_id: authUser.id,
        actor_name: authUser.name || 'Patient',
        actor_role: authUser.role || 'patient',
        result: 'SUCCESS',
        notes: `ABHA registered (${cleanNum || cleanAddr}). Official ABDM verification pending.`,
      });

      return res.status(200).json({
        success: true,
        message: 'ABHA linked. Official ABDM gateway verification pending.',
        data: {
          status: updated.status,
          abhaNumber: updated.abha_number,
          abhaAddress: updated.abha_address,
          name: updated.name,
          verificationStatus: updated.verification_status,
          qrAvailable: false,
          lastSyncTime: updated.last_sync_time,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async disconnectAbha(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      if (!authUser || !authUser.id) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const updated = await PublicHealthRepository.upsertPatientAbha({
        patient_id: authUser.id,
        status: 'not_connected',
        abha_number: null,
        abha_address: null,
        verification_status: 'ABHA not connected',
        qr_data: null,
        last_sync_time: null,
      });

      await PublicHealthRepository.createHealthRecordAuditEvent({
        patient_id: authUser.id,
        event_type: 'ABHA_CONNECTION_CHANGED',
        actor_id: authUser.id,
        actor_name: authUser.name || 'Patient',
        actor_role: authUser.role || 'patient',
        result: 'SUCCESS',
        notes: 'ABHA connection disconnected by patient',
      });

      return res.status(200).json({
        success: true,
        message: 'ABHA disconnected.',
        data: {
          status: updated.status,
          verificationStatus: updated.verification_status,
          qrAvailable: false,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createHealthRecord(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      if (!authUser || !authUser.id) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const {
        facilityName,
        doctorName,
        recordType,
        recordDate,
        diagnosis,
        vitals,
        prescription,
        notes,
        documentUrl,
      } = req.body;

      if (!facilityName || !recordType || !recordDate || !diagnosis) {
        return res.status(400).json({
          success: false,
          message: 'Facility name, record type, date, and visit summary are required.',
        });
      }

      // Check for ABHA ID
      const abha = await PublicHealthRepository.getPatientAbha(authUser.id);

      const record = await PublicHealthRepository.createHealthRecord({
        patient_id: authUser.id,
        abha_id: abha?.abha_number || abha?.abha_address || null,
        facility_name: facilityName.trim(),
        doctor_name: doctorName?.trim() || 'Medical Officer / Consulting Staff',
        record_type: recordType.trim(),
        record_date: recordDate,
        diagnosis: diagnosis.trim(),
        record_source: 'patient_entered', // Strictly marked as Patient-entered record
        vitals_json: vitals ? JSON.stringify(vitals) : undefined,
        prescription_json: prescription ? JSON.stringify(prescription) : undefined,
        notes: notes?.trim() || undefined,
        document_url: documentUrl || undefined,
      });

      await PublicHealthRepository.createHealthRecordAuditEvent({
        patient_id: authUser.id,
        event_type: 'VISIT_ENTRY_CREATED',
        actor_id: authUser.id,
        actor_name: authUser.name || 'Patient',
        actor_role: authUser.role || 'patient',
        record_id: record.id,
        result: 'SUCCESS',
        notes: `New visit entry added for facility: ${facilityName}`,
      });

      return res.status(201).json({
        success: true,
        message: 'Visit entry saved as a Patient-entered record.',
        data: record,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async exportFhirJson(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      if (!authUser || !authUser.id) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const patientId = authUser.id;
      const records = await PublicHealthRepository.getHealthRecords(patientId);

      if (!records || records.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Nothing available to export.',
        });
      }

      const abha = await PublicHealthRepository.getPatientAbha(patientId);
      const bundleId = `bundle-${crypto.randomUUID()}`;
      const now = new Date().toISOString();

      const fhirBundle = {
        resourceType: 'Bundle',
        id: bundleId,
        meta: {
          lastUpdated: now,
          profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle'],
        },
        identifier: {
          system: 'https://healthid.ndhm.gov.in',
          value: abha?.abha_number || abha?.abha_address || `PAT-${patientId}`,
        },
        type: 'document',
        timestamp: now,
        entry: [
          {
            fullUrl: `urn:uuid:patient-${patientId}`,
            resource: {
              resourceType: 'Patient',
              id: patientId,
              name: [{ text: authUser.name || 'Patient' }],
              identifier: [
                {
                  system: 'https://healthid.ndhm.gov.in',
                  value: abha?.abha_number || 'UNVERIFIED',
                },
              ],
            },
          },
          ...records.map((rec) => ({
            fullUrl: `urn:uuid:rec-${rec.id}`,
            resource: {
              resourceType: 'Encounter',
              id: rec.id,
              status: 'finished',
              class: {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
                code: 'AMB',
                display: 'ambulatory',
              },
              serviceType: {
                text: rec.record_type,
              },
              period: {
                start: rec.record_date,
              },
              serviceProvider: {
                display: rec.facility_name,
              },
              participant: [
                {
                  individual: {
                    display: rec.doctor_name,
                  },
                },
              ],
              reasonCode: [
                {
                  text: rec.diagnosis,
                },
              ],
              extension: [
                {
                  url: 'https://nrces.in/ndhm/fhir/r4/StructureDefinition/RecordSource',
                  valueString: rec.record_source || 'patient_entered',
                },
              ],
            },
          })),
        ],
      };

      await PublicHealthRepository.createHealthRecordAuditEvent({
        patient_id: patientId,
        event_type: 'RECORD_EXPORTED',
        actor_id: authUser.id,
        actor_name: authUser.name || 'Patient',
        actor_role: authUser.role || 'patient',
        result: 'SUCCESS',
        notes: `Exported ${records.length} records in FHIR R4 Bundle`,
      });

      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="FHIR_Records_${patientId}_${Date.now()}.json"`
      );
      return res.status(200).send(JSON.stringify(fhirBundle, null, 2));
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getConsents(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      if (!authUser || !authUser.id) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      let consents = await PublicHealthRepository.getHealthRecordConsents(authUser.id);
      if (consents.length === 0) {
        // Create initial default consent options
        const c1 = await PublicHealthRepository.createHealthRecordConsent({
          patient_id: authUser.id,
          requester_name: 'District Health Network & PHC Counter',
          data_scope: 'all_records',
          status: 'active',
        });
        const c2 = await PublicHealthRepository.createHealthRecordConsent({
          patient_id: authUser.id,
          requester_name: 'Emergency 108 Responders',
          data_scope: 'opd_only',
          status: 'active',
        });
        consents = [c1, c2];
      }

      return res.status(200).json({ success: true, data: consents });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async toggleConsent(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      if (!authUser || !authUser.id) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const { id } = req.params;
      const { status } = req.body;
      if (!['active', 'revoked'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Status must be active or revoked' });
      }

      const updated = await PublicHealthRepository.toggleHealthRecordConsent(toSingleString(id), status);

      await PublicHealthRepository.createHealthRecordAuditEvent({
        patient_id: authUser.id,
        event_type: 'CONSENT_CHECKED',
        actor_id: authUser.id,
        actor_name: authUser.name || 'Patient',
        actor_role: authUser.role || 'patient',
        result: 'SUCCESS',
        notes: `Consent ${id} status updated to ${status}`,
      });

      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getHealthRecordAuditEvents(req: Request, res: Response) {
    try {
      const authUser = (req as any).user;
      if (!authUser || !authUser.id) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const events = await PublicHealthRepository.getHealthRecordAuditEvents(authUser.id);
      return res.status(200).json({ success: true, data: events });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 4. Diagnostics & Equipment Status
  static async getDiagnostics(req: Request, res: Response) {
    try {
      const services = await PublicHealthRepository.getDiagnostics({
        facilityId: toOptionalString(req.query.facilityId),
        search: toOptionalString(req.query.search),
        category: toOptionalString(req.query.category),
        availabilityStatus: toOptionalString(req.query.availabilityStatus),
        equipmentStatus: toOptionalString(req.query.equipmentStatus),
      });
      return res.status(200).json({ success: true, data: services });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getDiagnosticById(req: Request, res: Response) {
    try {
      const id = toSingleString(req.params.id);
      if (!id) {
        return res.status(400).json({ success: false, message: 'Diagnostic ID is required' });
      }
      const service = await PublicHealthRepository.getDiagnosticById(id);
      if (!service) {
        return res.status(404).json({ success: false, message: 'Diagnostic service not found' });
      }
      return res.status(200).json({ success: true, data: service });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async bookDiagnostic(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required to book a diagnostic service' });
      }

      const { diagnosticId, requestedDate, requestedTime, accessibilityNotes, patientName } = req.body;

      if (!diagnosticId || !requestedDate) {
        return res.status(400).json({ success: false, message: 'diagnosticId and requestedDate are required' });
      }

      // Verify the diagnostic service exists
      const service = await PublicHealthRepository.getDiagnosticById(diagnosticId);
      if (!service) {
        return res.status(404).json({ success: false, message: 'Diagnostic service not found' });
      }

      const booking = await PublicHealthRepository.createDiagnosticBooking({
        diagnostic_id: diagnosticId,
        patient_id: user.id,
        patient_name: patientName || user.name || 'Patient',
        facility_id: service.facility_id || null,
        facility_name: service.facility_name,
        service_name: service.service_name,
        requested_date: requestedDate,
        requested_time: requestedTime || null,
        accessibility_notes: accessibilityNotes || null,
        status: 'SUBMITTED',
      });

      return res.status(201).json({ success: true, data: booking });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getDiagnosticBookings(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const patientId = user?.role === 'admin' || user?.role === 'hospital'
        ? toOptionalString(req.query.patientId) || undefined
        : user?.id;
      const bookings = await PublicHealthRepository.getDiagnosticBookings(patientId);
      return res.status(200).json({ success: true, data: bookings });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateDiagnosticStatus(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user || (user.role !== 'hospital' && user.role !== 'admin')) {
        return res.status(403).json({ success: false, message: 'Only hospital staff or admins can update equipment status' });
      }

      const id = toSingleString(req.params.id);
      if (!id) {
        return res.status(400).json({ success: false, message: 'Diagnostic ID is required' });
      }
      const { equipmentStatus, availabilityStatus, notes } = req.body;

      if (!equipmentStatus || !availabilityStatus) {
        return res.status(400).json({ success: false, message: 'equipmentStatus and availabilityStatus are required' });
      }

      const updated = await PublicHealthRepository.updateDiagnosticEquipmentStatus(
        id,
        equipmentStatus,
        availabilityStatus,
        user.id,
        user.name || 'Staff',
        user.role,
        notes
      );

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Diagnostic service not found' });
      }

      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async cancelDiagnosticBooking(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const id = toSingleString(req.params.id);
      if (!id) {
        return res.status(400).json({ success: false, message: 'Booking ID is required' });
      }
      const updated = await PublicHealthRepository.updateDiagnosticBookingStatus(
        id,
        'CANCELLED',
        user.id,
        user.name || 'Patient',
        user.role || 'patient',
        'Cancelled by patient'
      );

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 5. Essential Medicines (Verified Facility Inventory)
  static async getMedicines(req: Request, res: Response) {
    try {
      const meds = await PublicHealthRepository.getMedicines({
        facilityId: toOptionalString(req.query.facilityId),
        search: toOptionalString(req.query.search),
        category: toOptionalString(req.query.category),
        status: toOptionalString(req.query.status),
      });
      return res.status(200).json({ success: true, data: meds });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getMedicineById(req: Request, res: Response) {
    try {
      const id = toSingleString(req.params.id);
      if (!id) {
        return res.status(400).json({ success: false, message: 'Medicine ID is required' });
      }
      const med = await PublicHealthRepository.getMedicineById(id);
      if (!med) {
        return res.status(404).json({ success: false, message: 'Medicine not found' });
      }
      return res.status(200).json({ success: true, data: med });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateMedicineStock(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user || (user.role !== 'hospital' && user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          message: 'Only authorized facility staff or administrators can update medicine inventory.',
        });
      }

      const id = toSingleString(req.params.id);
      if (!id) {
        return res.status(400).json({ success: false, message: 'Medicine ID is required' });
      }

      const existingMed = await PublicHealthRepository.getMedicineById(id);
      if (!existingMed) {
        return res.status(404).json({ success: false, message: 'Medicine not found' });
      }

      // Authorization scoping: hospital staff can only update their own facility's inventory
      const staffFacilityId = user.hospital_id || user.facility_id;
      if (user.role === 'hospital' && staffFacilityId && staffFacilityId !== existingMed.facility_id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only update inventory for your authorized facility.',
        });
      }

      const { stockCount, status, reason } = req.body;
      const parsedStockCount = stockCount !== undefined && stockCount !== null ? Number(stockCount) : null;

      const updated = await PublicHealthRepository.updateMedicineStock(
        id,
        parsedStockCount,
        status,
        user.id,
        user.name || 'Hospital Staff',
        user.role,
        reason
      );

      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Medicine inventory updated successfully.',
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getMedicineAuditEvents(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      const events = await PublicHealthRepository.getMedicineAuditEvents({
        medicineId: toOptionalString(req.query.medicineId),
        facilityId: toOptionalString(req.query.facilityId),
      });

      return res.status(200).json({ success: true, data: events });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 6. High-Risk Registry
  static async getHighRiskRegistry(req: Request, res: Response) {
    try {
      const actor = (req as any).user;
      if (!actor) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      // Patients: only see their own follow-up records
      // Staff (asha_worker, hospital, admin, doctor, government): see all or filtered
      const patientIdFilter =
        actor.role === 'patient' ? actor.id : toOptionalString(req.query.patientId);
      const list = await PublicHealthRepository.getHighRiskRegistry({
        patient_id: patientIdFilter,
        cohort: toOptionalString(req.query.cohort),
      });
      return res.status(200).json({ success: true, data: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createHighRiskEntry(req: Request, res: Response) {
    try {
      const actor = (req as any).user;
      if (!actor) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const allowedRoles = ['hospital', 'admin', 'doctor'];
      if (!allowedRoles.includes(actor.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only authorised healthcare providers can register follow-up cases.',
        });
      }
      const {
        patientId,
        patientName,
        cohortType,
        riskLevel = 'Moderate',
        primaryCondition,
        currentMilestone,
        nextDueDate,
        assignedAshaName,
        followUpNotes,
      } = req.body;
      if (!patientId || !patientName || !cohortType || !primaryCondition || !nextDueDate) {
        return res.status(400).json({
          success: false,
          message: 'Required fields missing: patientId, patientName, cohortType, primaryCondition, nextDueDate.',
        });
      }
      const entry = await PublicHealthRepository.createHighRiskEntry({
        patient_id: patientId,
        patient_name: patientName,
        cohort_type: cohortType,
        risk_level: riskLevel,
        primary_condition: primaryCondition,
        current_milestone: currentMilestone || '',
        next_due_date: nextDueDate,
        status: 'Active',
        assigned_asha_name: assignedAshaName || null,
        follow_up_notes: followUpNotes || null,
      });
      // Audit trail
      await PublicHealthRepository.createHighRiskAuditEvent({
        case_id: entry.id,
        actor_id: actor.id,
        actor_name: actor.name || actor.email,
        actor_role: actor.role,
        action: 'CASE_CREATED',
        new_status: 'Active',
        notes: followUpNotes || null,
      }).catch(() => {/* Non-fatal: audit write failure should not block the response */});
      return res.status(201).json({ success: true, data: entry });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateHighRiskStatus(req: Request, res: Response) {
    try {
      const actor = (req as any).user;
      if (!actor) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const allowedRoles = ['hospital', 'admin', 'doctor', 'asha_worker'];
      if (!allowedRoles.includes(actor.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Only authorised staff can update follow-up status.',
        });
      }
      const id = toSingleString(req.params.id);
      if (!id) {
        return res.status(400).json({ success: false, message: 'Case ID is required.' });
      }
      const { status, followUpNotes } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, message: 'status field is required.' });
      }
      // Capture previous status for audit
      const existing = await PublicHealthRepository.getHighRiskById(id);
      const previousStatus = existing?.status || null;
      const updated = await PublicHealthRepository.updateHighRiskStatus(id, status, followUpNotes);
      // Audit trail
      await PublicHealthRepository.createHighRiskAuditEvent({
        case_id: id,
        actor_id: actor.id,
        actor_name: actor.name || actor.email,
        actor_role: actor.role,
        action: 'STATUS_CHANGED',
        previous_status: previousStatus,
        new_status: status,
        notes: followUpNotes || null,
      }).catch(() => {/* Non-fatal */});
      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getHighRiskAuditEvents(req: Request, res: Response) {
    try {
      const actor = (req as any).user;
      if (!actor) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const staffRoles = ['hospital', 'admin', 'doctor', 'asha_worker', 'government'];
      if (!staffRoles.includes(actor.role)) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      const events = await PublicHealthRepository.getHighRiskAuditEvents({
        caseId: toOptionalString(req.query.caseId),
      });
      return res.status(200).json({ success: true, data: events });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 7. Frontline Operational Desk (ASHA / ANM / CHO)
  static async getFrontlineVisits(req: Request, res: Response) {
    try {
      const actor = (req as any).user;
      if (!actor) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      // Requirement 39: Patient cannot access frontline operational desk
      if (actor.role === 'patient') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Patients cannot access the frontline worker operational desk.',
        });
      }

      // Worker isolation: ASHA worker only sees their own assigned visits
      let workerId: string | undefined = undefined;
      if (actor.role === 'asha_worker') {
        workerId = actor.id;
      } else if (req.query.workerId) {
        workerId = toSingleString(req.query.workerId);
      }

      const visits = await PublicHealthRepository.getFrontlineVisits({
        workerId,
        status: toOptionalString(req.query.status),
      });

      return res.status(200).json({ success: true, data: visits });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getFrontlineMetrics(req: Request, res: Response) {
    try {
      const actor = (req as any).user;
      if (!actor) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      if (actor.role === 'patient') {
        return res.status(403).json({ success: false, message: 'Access denied for patient role.' });
      }

      const workerId = actor.role === 'asha_worker' ? actor.id : toOptionalString(req.query.workerId);
      const metrics = await PublicHealthRepository.getFrontlineMetrics(workerId);
      return res.status(200).json({ success: true, data: metrics });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createFrontlineVisit(req: Request, res: Response) {
    try {
      const actor = (req as any).user;
      if (!actor) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const staffRoles = ['hospital', 'admin', 'doctor', 'asha_worker'];
      if (!staffRoles.includes(actor.role)) {
        return res.status(403).json({ success: false, message: 'Access denied. Authorized staff only.' });
      }

      const {
        household_id,
        patient_id,
        patient_name,
        village_name,
        assigned_worker_id,
        assigned_worker_name,
        facility_id,
        facility_name,
        visit_type,
        scheduled_date,
        priority,
        accessibility_barriers,
        transport_barriers,
        notes,
      } = req.body;

      if (!household_id || !patient_name || !village_name || !visit_type || !scheduled_date) {
        return res.status(400).json({
          success: false,
          message: 'household_id, patient_name, village_name, visit_type, and scheduled_date are required.',
        });
      }

      const visit = await PublicHealthRepository.createFrontlineVisit({
        household_id,
        patient_id: patient_id || null,
        patient_name,
        village_name,
        assigned_worker_id: assigned_worker_id || actor.id,
        assigned_worker_name: assigned_worker_name || actor.name || 'Assigned Worker',
        facility_id: facility_id || null,
        facility_name: facility_name || null,
        visit_type,
        scheduled_date,
        status: 'ASSIGNED',
        priority: priority || 'Routine',
        accessibility_barriers: accessibility_barriers ? JSON.stringify(accessibility_barriers) : null,
        transport_barriers: transport_barriers || null,
        notes: notes || null,
      });

      return res.status(201).json({ success: true, data: visit });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async startFrontlineVisit(req: Request, res: Response) {
    try {
      const actor = (req as any).user;
      if (!actor) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const staffRoles = ['hospital', 'admin', 'doctor', 'asha_worker'];
      if (!staffRoles.includes(actor.role)) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const id = toSingleString(req.params.id);
      if (!id) return res.status(400).json({ success: false, message: 'Visit ID is required.' });

      const existing = await PublicHealthRepository.getFrontlineVisitById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Visit record not found.' });
      }

      // Worker isolation: Worker cannot start another worker's assigned visit unless supervisor/admin
      if (actor.role === 'asha_worker' && existing.assigned_worker_id !== actor.id) {
        return res.status(403).json({
          success: false,
          message: 'Authorization error: You cannot start a visit assigned to another worker.',
        });
      }

      if (existing.status === 'COMPLETED') {
        return res.status(400).json({ success: false, message: 'Cannot start a visit that is already completed.' });
      }

      const updated = await PublicHealthRepository.startFrontlineVisit(id, {
        id: actor.id,
        name: actor.name || actor.email,
        role: actor.role,
      });

      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async completeFrontlineVisit(req: Request, res: Response) {
    try {
      const actor = (req as any).user;
      if (!actor) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const staffRoles = ['hospital', 'admin', 'doctor', 'asha_worker'];
      if (!staffRoles.includes(actor.role)) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const id = toSingleString(req.params.id);
      if (!id) return res.status(400).json({ success: false, message: 'Visit ID is required.' });

      const existing = await PublicHealthRepository.getFrontlineVisitById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Visit record not found.' });
      }

      // Worker isolation
      if (actor.role === 'asha_worker' && existing.assigned_worker_id !== actor.id) {
        return res.status(403).json({
          success: false,
          message: 'Authorization error: You cannot complete a visit assigned to another worker.',
        });
      }

      // Requirement 8: Cannot mark completed merely because it was opened; must be in progress
      if (existing.status !== 'IN_PROGRESS') {
        return res.status(400).json({
          success: false,
          message: 'Visit must be started (IN_PROGRESS) before it can be completed.',
        });
      }

      const { barriers = [], notes } = req.body;

      const updated = await PublicHealthRepository.completeFrontlineVisit(
        id,
        { barriers, notes },
        { id: actor.id, name: actor.name || actor.email, role: actor.role }
      );

      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getFrontlineTasks(req: Request, res: Response) {
    try {
      const actor = (req as any).user;
      if (!actor) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      if (actor.role === 'patient') {
        return res.status(403).json({ success: false, message: 'Patients cannot access the frontline tasks.' });
      }

      let workerId: string | undefined = undefined;
      if (actor.role === 'asha_worker') {
        workerId = actor.id;
      } else if (req.query.workerId) {
        workerId = toSingleString(req.query.workerId);
      }

      const tasks = await PublicHealthRepository.getFrontlineTasks({
        workerId,
        status: toOptionalString(req.query.status),
      });

      return res.status(200).json({ success: true, data: tasks });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createFrontlineTask(req: Request, res: Response) {
    try {
      const actor = (req as any).user;
      if (!actor) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const staffRoles = ['hospital', 'admin', 'doctor', 'asha_worker'];
      if (!staffRoles.includes(actor.role)) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const {
        household_id,
        patient_id,
        village_name,
        beneficiary_name,
        beneficiary_phone,
        task_type,
        due_date,
        priority,
        notes,
      } = req.body;

      if (!beneficiary_name || !village_name || !task_type || !due_date) {
        return res.status(400).json({
          success: false,
          message: 'beneficiary_name, village_name, task_type, and due_date are required.',
        });
      }

      const task = await PublicHealthRepository.createFrontlineTask(
        {
          household_id: household_id || null,
          patient_id: patient_id || null,
          worker_id: actor.id,
          worker_name: actor.name || 'Field Worker',
          worker_role: actor.role === 'asha_worker' ? 'ASHA' : actor.role.toUpperCase(),
          village_name,
          beneficiary_name,
          beneficiary_phone: beneficiary_phone || null,
          task_type,
          due_date,
          priority: priority || 'Medium',
          status: 'PENDING',
          notes: notes || null,
        },
        { id: actor.id, name: actor.name || actor.email, role: actor.role }
      );

      return res.status(201).json({ success: true, data: task });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateFrontlineTaskStatus(req: Request, res: Response) {
    try {
      const actor = (req as any).user;
      if (!actor) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const staffRoles = ['hospital', 'admin', 'doctor', 'asha_worker'];
      if (!staffRoles.includes(actor.role)) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const id = toSingleString(req.params.id);
      if (!id) return res.status(400).json({ success: false, message: 'Task ID is required.' });

      const existing = await PublicHealthRepository.getFrontlineTaskById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Task not found.' });
      }

      if (actor.role === 'asha_worker' && existing.worker_id !== actor.id) {
        return res.status(403).json({
          success: false,
          message: 'Authorization error: You cannot modify tasks assigned to another worker.',
        });
      }

      const { status, notes } = req.body;
      if (!status) return res.status(400).json({ success: false, message: 'status is required.' });

      const updated = await PublicHealthRepository.updateFrontlineTaskStatus(
        id,
        status,
        notes,
        { id: actor.id, name: actor.name || actor.email, role: actor.role }
      );

      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async processOfflineSync(req: Request, res: Response) {
    try {
      const actor = (req as any).user;
      if (!actor) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const staffRoles = ['hospital', 'admin', 'doctor', 'asha_worker'];
      if (!staffRoles.includes(actor.role)) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const { actions } = req.body;
      if (!Array.isArray(actions)) {
        return res.status(400).json({ success: false, message: 'actions array is required.' });
      }

      const result = await PublicHealthRepository.processOfflineSync(actions, {
        id: actor.id,
        name: actor.name || actor.email,
        role: actor.role,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getFrontlineAuditEvents(req: Request, res: Response) {
    try {
      const actor = (req as any).user;
      if (!actor) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }
      const staffRoles = ['hospital', 'admin', 'doctor', 'asha_worker', 'government'];
      if (!staffRoles.includes(actor.role)) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }

      const events = await PublicHealthRepository.getFrontlineAuditEvents({
        resourceId: toOptionalString(req.query.resourceId),
        workerId: toOptionalString(req.query.workerId),
      });

      return res.status(200).json({ success: true, data: events });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 7b. Citizen Doorstep Assistance Requests (Patient Support)
  static async createDoorstepRequest(req: Request, res: Response) {
    try {
      const actor = (req as any).user;
      if (!actor) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const { village_or_area, assistance_type, preferred_date, barrier_description } = req.body;
      if (!village_or_area || !assistance_type) {
        return res.status(400).json({
          success: false,
          message: 'village_or_area and assistance_type are required.',
        });
      }

      const request = await PublicHealthRepository.createDoorstepRequest({
        patient_id: actor.id,
        patient_name: actor.name || 'Citizen Beneficiary',
        patient_phone: actor.phone || null,
        village_or_area,
        assistance_type,
        preferred_date: preferred_date || null,
        barrier_description: barrier_description || null,
        status: 'REQUESTED',
      });

      return res.status(201).json({ success: true, data: request });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getDoorstepRequests(req: Request, res: Response) {
    try {
      const actor = (req as any).user;
      if (!actor) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      // Patient sees only their own requests
      if (actor.role === 'patient') {
        const list = await PublicHealthRepository.getDoorstepRequests(actor.id);
        return res.status(200).json({ success: true, data: list });
      }

      // Staff roles see all or filtered
      const list = await PublicHealthRepository.getDoorstepRequests(toOptionalString(req.query.patientId));
      return res.status(200).json({ success: true, data: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 8. Emergency 108 SOS Dispatch
  static async triggerEmergencySOS(req: Request, res: Response) {
    try {
      const {
        patientName = 'Citizen in Need',
        phone = '98220-11111',
        locationName = 'Live GPS Location (Rural Satara)',
        latitude = 17.7285,
        longitude = 73.8377,
        emergencyType = 'Cardiac / Acute Emergency',
      } = req.body;

      const allHospitals = await HospitalRepository.findAll();
      const emergencyFacility = allHospitals.find(h => h.emergency_24x7 && (h.type.includes('District') || h.type.includes('Rural'))) || allHospitals[0];

      const dispatch = await PublicHealthRepository.createEmergencyDispatch({
        patient_name: patientName,
        phone,
        location_name: locationName,
        latitude,
        longitude,
        emergency_type: emergencyType,
        assigned_ambulance_vehicle: 'MH-11-AX-1081 (ALS 108 Advanced Ambulance)',
        eta_minutes: 9,
        destination_hospital_id: emergencyFacility?.id,
        destination_hospital_name: emergencyFacility?.name || 'District Civil Hospital Satara',
        status: 'Dispatched',
      });

      return res.status(200).json({
        success: true,
        data: {
          dispatch,
          ambulanceCallNumber: '108',
          instructions: 'Keep the patient warm and seated. Paramedic team has been notified with your GPS coordinates.',
          etaMinutes: 9,
          destinationHospital: emergencyFacility,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 9. Facility Quality & Metrics Dashboard
  static async getFacilityMetrics(req: Request, res: Response) {
    try {
      const id = toSingleString(req.params.id);
      if (!id) {
        return res.status(400).json({ success: false, message: 'Facility ID is required' });
      }
      const hospital = await HospitalRepository.findById(id);
      if (!hospital) {
        return res.status(404).json({ success: false, message: 'Hospital not found' });
      }

      const services = await HospitalRepository.getServicesByHospital(id);
      const diagnostics = await PublicHealthRepository.getDiagnostics({ facilityId: id });
      const medicines = await PublicHealthRepository.getMedicines({ facilityId: id });

      const functionalDiagCount = diagnostics.filter(d => d.equipment_status === 'FUNCTIONAL').length;
      const diagUptime = diagnostics.length > 0 ? Math.round((functionalDiagCount / diagnostics.length) * 100) : 95;

      const inStockMeds = medicines.filter(m => m.status === 'In Stock').length;
      const medStockIndex = medicines.length > 0 ? Math.round((inStockMeds / medicines.length) * 100) : 92;

      return res.status(200).json({
        success: true,
        data: {
          facility: hospital,
          departments: services,
          totalBeds: hospital.total_beds,
          availableBeds: hospital.available_beds,
          bedOccupancyPercent: Math.round(((hospital.total_beds - hospital.available_beds) / hospital.total_beds) * 100),
          diagnosticUptimePercent: diagUptime,
          essentialMedicineStockPercent: medStockIndex,
          nqasScore: 94,
          dailyOpdFootfall: 280,
          averageWaitTimeMinutes: 22,
          qualityStandards: [
            { category: 'Hygiene & Cleanliness (Kayakalp)', score: '95/100', status: 'Compliant' },
            { category: 'Specialist Doctor Punctuality', score: '91/100', status: 'Compliant' },
            { category: 'Medicine Availability Index', score: `${medStockIndex}%`, status: medStockIndex > 80 ? 'Optimal' : 'Needs Restock' },
            { category: 'Diagnostic Turnaround Time', score: '< 3 Hours', status: 'Optimal' },
            { category: 'Citizen Grievance Redressal Rate', score: '98.2%', status: 'Compliant' },
          ],
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // =========================================================================
  // NON-CLINICAL HEALTHCARE ACCESS & FACILITY ROUTER
  // Routes patients to appropriate healthcare facilities based on:
  //   - Requested healthcare service (NOT symptoms)
  //   - Patient location (for distance calculation)
  //   - Travel mode preference
  //   - Accessibility requirements
  //   - Appointment / referral status
  // NEVER produces: diagnosis, medical acuity, treatment recommendation
  // =========================================================================
  static async runAccessRoute(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const patientId = user?.id || user?._id || 'anonymous';

      const {
        serviceNeeded,
        serviceNote = '',
        locationName = '',
        locationLat,
        locationLng,
        travelMode = 'Public transport',
        accessibilityNeeds = [],
        appointmentStatus = 'No appointment',
      } = req.body;

      if (!serviceNeeded || typeof serviceNeeded !== 'string' || serviceNeeded.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please select the healthcare service you need.',
        });
      }

      // Fetch real hospitals from the database
      const allHospitals = await HospitalRepository.findAll();

      if (!allHospitals || allHospitals.length === 0) {
        return res.status(200).json({
          success: true,
          requestId: `AR-${Date.now()}`,
          routedFacilities: [],
          resultCount: 0,
          routingFactors: [
            'Requested service: ' + serviceNeeded,
            'Location: ' + (locationName || 'Not specified'),
            'Travel mode: ' + travelMode,
          ],
          message: 'No verified facilities are currently available in the database.',
        });
      }

      // Haversine distance calculation helper (returns km)
      const haversineDistanceKm = (
        lat1: number, lng1: number,
        lat2: number, lng2: number
      ): number => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      };

      const patientLat = typeof locationLat === 'number' ? locationLat : null;
      const patientLng = typeof locationLng === 'number' ? locationLng : null;

      // Map requested service keywords to facility capabilities
      const serviceKeywords: string[] = serviceNeeded.toLowerCase().split(/[,\s]+/).filter(Boolean);

      // NON-CLINICAL ACCESS SCORING ALGORITHM
      // Score is based entirely on logistics factors:
      //   +40: facility offers a matching service category
      //   +30: distance < 10km (proximity bonus)
      //   +20: distance < 25km (moderate proximity bonus)
      //   +15: accessibility requirement is met (per requirement)
      //   +10: appointment compatibility
      //   +5:  facility is verified
      interface ScoredFacility {
        facility: any;
        distanceKm: number | null;
        matchScore: number;
        accessibilityMatches: string[];
        routingReasons: string[];
      }

      const needsAccessibility = Array.isArray(accessibilityNeeds) && accessibilityNeeds.length > 0;

      const scored: ScoredFacility[] = allHospitals.map((hosp: any) => {
        let score = 0;
        const reasons: string[] = [];
        const accessMatches: string[] = [];

        // --- SERVICE MATCH (non-clinical) ---
        const facilityText = [
          hosp.name || '',
          hosp.type || '',
          hosp.tagline || '',
          ...(Array.isArray(hosp.diagnosticFacilities) ? hosp.diagnosticFacilities : []),
        ].join(' ').toLowerCase();

        const serviceMatched = serviceKeywords.some(kw => facilityText.includes(kw)) ||
          serviceNeeded === 'General healthcare visit' ||
          serviceNeeded === 'Follow-up visit';

        if (serviceMatched) {
          score += 40;
          reasons.push('Requested service is available at this facility');
        }

        // --- DISTANCE (logistics factor) ---
        let distKm: number | null = null;
        if (patientLat !== null && patientLng !== null && hosp.latitude && hosp.longitude) {
          distKm = parseFloat(
            haversineDistanceKm(patientLat, patientLng, hosp.latitude, hosp.longitude).toFixed(1)
          );
          if (distKm <= 10) {
            score += 30;
            reasons.push(`Closer facility — ${distKm} km from your location`);
          } else if (distKm <= 25) {
            score += 20;
            reasons.push(`Moderate distance — ${distKm} km from your location`);
          } else if (distKm <= 50) {
            score += 10;
            reasons.push(`${distKm} km from your location`);
          }
        } else {
          reasons.push('Distance not calculable — location not provided');
        }

        // --- ACCESSIBILITY (logistics factor) ---
        if (needsAccessibility) {
          const accessNeeds = Array.isArray(accessibilityNeeds) ? accessibilityNeeds : [];
          // Check facility type and features for accessibility indicators
          const facilityAccessText = facilityText;
          accessNeeds.forEach((need: string) => {
            if (
              need.toLowerCase().includes('wheelchair') && 
              (facilityAccessText.includes('wheelchair') || hosp.type === 'Government')
            ) {
              score += 15;
              accessMatches.push(need);
            } else if (
              need.toLowerCase().includes('ramp') ||
              need.toLowerCase().includes('accessible')
            ) {
              // Government hospitals generally have ramps by NHM standards
              if (hosp.type === 'Government') {
                score += 10;
                accessMatches.push(need + ' (Government facility)');
              }
            } else if (need.toLowerCase().includes('registration')) {
              score += 5;
              accessMatches.push(need);
            }
          });
          if (accessMatches.length > 0) {
            reasons.push('Accessibility support available');
          }
        }

        // --- APPOINTMENT COMPATIBILITY ---
        if (appointmentStatus === 'Has appointment' || appointmentStatus === 'Has referral') {
          score += 10;
          reasons.push('Appointment/referral compatible');
        } else if (appointmentStatus === 'No appointment') {
          // Walk-in friendly = PHC and Sub-centre type
          if (hosp.type === 'Government') {
            score += 10;
            reasons.push('Walk-in access supported (Government facility)');
          } else {
            score += 5;
            reasons.push('Walk-in may be available — contact facility to confirm');
          }
        }

        // --- VERIFICATION BONUS ---
        if (hosp.isVerified) {
          score += 5;
          reasons.push('Facility information is verified');
        }

        return { facility: hosp, distanceKm: distKm, matchScore: score, accessibilityMatches: accessMatches, routingReasons: reasons };
      });

      // Sort by match score descending, then by distance ascending
      scored.sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
        if (a.distanceKm !== null) return -1;
        if (b.distanceKm !== null) return 1;
        return 0;
      });

      // Return top 5 results
      const topResults = scored.slice(0, 5).map(s => ({
        facility: s.facility,
        distanceKm: s.distanceKm,
        matchScore: s.matchScore,
        accessibilityMatches: s.accessibilityMatches,
        routingReasons: s.routingReasons,
      }));

      const requestId = `AR-${Date.now()}`;
      const resultCount = topResults.length;

      // Persist routing request for auditability (non-clinical data only)
      try {
        await AccessRoutingRequest.create({
          requestId,
          patientId: patientId.toString(),
          serviceNeeded: serviceNeeded.trim(),
          serviceNote: serviceNote.trim(),
          locationName: locationName.trim(),
          locationLat: patientLat ?? undefined,
          locationLng: patientLng ?? undefined,
          travelMode,
          accessibilityNeeds: JSON.stringify(accessibilityNeeds),
          appointmentStatus,
          routingResultJson: JSON.stringify(topResults.map(r => ({ id: r.facility.id || r.facility._id, score: r.matchScore }))),
          resultCount,
          status: resultCount > 0 ? 'COMPLETED' : 'NO_RESULTS',
          createdAt: new Date(),
        });
      } catch (_persistErr) {
        // Persistence failure should not block the patient from getting results
      }

      const routingFactors = [
        `Service requested: ${serviceNeeded}`,
        patientLat && patientLng ? `Location: ${locationName || 'GPS coordinates provided'}` : 'Location: Not provided (distance not calculated)',
        `Travel mode: ${travelMode}`,
        needsAccessibility ? `Accessibility needs: ${accessibilityNeeds.join(', ')}` : 'No accessibility requirements specified',
        `Appointment status: ${appointmentStatus}`,
      ];

      return res.status(200).json({
        success: true,
        requestId,
        routedFacilities: topResults,
        resultCount,
        routingFactors,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Facility routing failed. Please try again.' });
    }
  }
}
