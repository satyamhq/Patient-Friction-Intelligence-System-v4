import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment.js';
import { CallLog } from '../models/CallLog.js';
import { FrictionEvent } from '../models/FrictionEvent.js';
import { Hospital } from '../models/Hospital.js';
import { telephonyBridge } from '../services/telephonyBridgeService.js';

// 1. POST /api/appointments - Create or register appointment in MongoDB
export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      patientName,
      patientPhone,
      hospitalId,
      hospitalName,
      hospitalPhone,
      department,
      preferredDate,
      preferredTime,
      reason,
      appointmentDate,
      appointmentTime,
      status,
      source,
      conversationId,
      callId,
      operationalNotes,
      frictionBarrier,
      barrierSeverity,
    } = req.body;

    if (!patientName || !patientPhone || !department) {
      res.status(400).json({
        success: false,
        message: 'Missing required appointment fields: patientName, patientPhone, and department are mandatory.',
      });
      return;
    }

    const resolvedHospitalName = hospitalName || 'District Civil Hospital (Empanelled)';
    const resolvedDate = appointmentDate || preferredDate || new Date().toISOString().split('T')[0];
    const resolvedTime = appointmentTime || preferredTime || '10:30 AM';
    const resolvedStatus = status || 'confirmed';
    const resolvedSource = source || 'ai_voice_agent';

    const appointment = await Appointment.create({
      patientId: patientId || (req as any).user?.id || 'citizen-guest',
      patientName: String(patientName).trim(),
      patientPhone: String(patientPhone).trim(),
      hospitalId: hospitalId || undefined,
      hospitalName: String(resolvedHospitalName).trim(),
      hospitalPhone: hospitalPhone ? String(hospitalPhone).trim() : undefined,
      department: String(department).trim(),
      preferredDate: String(resolvedDate).trim(),
      preferredTime: String(resolvedTime).trim(),
      appointmentDate: String(resolvedDate).trim(),
      appointmentTime: String(resolvedTime).trim(),
      reason: reason ? String(reason).trim() : 'Booked via AI Voice Agent',
      status: resolvedStatus,
      source: resolvedSource,
      conversationId: conversationId || undefined,
      callId: callId || undefined,
      assistedBy: 'AI Voice Agent (ElevenLabs)',
      operationalNotes: operationalNotes || 'Stored in MongoDB appointments collection',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // If an operational friction barrier was identified, record in friction_events MongoDB collection
    if (frictionBarrier) {
      try {
        await FrictionEvent.create({
          patientId: appointment.patientId,
          appointmentId: appointment.id || appointment._id,
          type: normalizeFrictionType(frictionBarrier),
          severity: Number(barrierSeverity) || 0.72,
          source: 'ai_voice_agent',
          notes: operationalNotes || reason || 'Operational barrier detected during voice appointment assistance',
          createdAt: new Date(),
        });
      } catch (err) {
        console.warn('[Appointment] Warning saving friction event:', err);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Appointment recorded in MongoDB collection',
      data: appointment,
      appointment,
    });
  } catch (error: any) {
    console.error('[Appointment Controller Error - Create]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create appointment in MongoDB',
    });
  }
};

// 2. POST /api/appointments/call - Trigger outbound call relay
export const initiateAppointmentCall = async (req: Request, res: Response): Promise<void> => {
  try {
    const { appointmentId, hospitalPhone, patientId, patientName, patientPhone, reason } = req.body;

    let targetAppointment: any = null;
    if (appointmentId) {
      targetAppointment = await Appointment.findById(appointmentId);
    }

    const resolvedPatientName = patientName || targetAppointment?.patientName || 'Citizen Patient';
    const resolvedPatientPhone = patientPhone || targetAppointment?.patientPhone || '98140-12345';
    const resolvedHospitalPhone = hospitalPhone || targetAppointment?.hospitalPhone || '1800-180-1108';

    const relayResult = await telephonyBridge.initiateHospitalRelayCall({
      patientId: patientId || targetAppointment?.patientId,
      patientName: resolvedPatientName,
      patientPhone: resolvedPatientPhone,
      hospitalPhone: resolvedHospitalPhone,
      appointmentId: appointmentId || undefined,
      serviceType: targetAppointment?.department || 'OPD Desk',
      notes: reason || targetAppointment?.reason,
    });

    const callId = relayResult.trackingId || `CALL_${Date.now()}`;

    // Update appointment status to 'calling' in MongoDB
    if (targetAppointment) {
      targetAppointment.status = 'calling';
      targetAppointment.callId = callId;
      await targetAppointment.save();
    }

    // Register call log in MongoDB
    const callLog = await CallLog.create({
      conversationId: `conv_${Date.now()}`,
      callId,
      patientId: patientId || targetAppointment?.patientId || 'citizen-guest',
      appointmentId: appointmentId || undefined,
      status: 'initiated',
      outcome: 'calling',
      duration: 0,
      transcriptReference: `Dispatched to hospital ${resolvedHospitalPhone} via ${relayResult.channel}`,
      telephonyProvider: relayResult.channel,
      agentId: 'agent_2901m2hw983kfcesprd47f904gbk',
      createdAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: relayResult.message,
      callId,
      channel: relayResult.channel,
      appointment: targetAppointment,
      callLog,
    });
  } catch (error: any) {
    console.error('[Appointment Controller Error - Call]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate appointment call',
    });
  }
};

// 3. GET /api/appointments/:id - Retrieve appointment by ID from MongoDB
export const getAppointmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: `Appointment with ID ${id} not found in MongoDB`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: appointment,
      appointment,
    });
  } catch (error: any) {
    console.error('[Appointment Controller Error - GetById]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve appointment',
    });
  }
};

// 4. PATCH /api/appointments/:id - Update appointment details in MongoDB
export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: `Appointment with ID ${id} not found in MongoDB`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully in MongoDB',
      data: appointment,
      appointment,
    });
  } catch (error: any) {
    console.error('[Appointment Controller Error - Update]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update appointment',
    });
  }
};

// 5. POST /api/webhooks/elevenlabs - Webhook for ElevenLabs Voice Agent events
export const handleElevenLabsWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body || {};
    const conversationId = payload.conversation_id || payload.call_id || `conv_${Date.now()}`;
    const callDuration = Number(payload.duration_secs || payload.duration || 0);
    const transcript = payload.transcript || payload.summary || 'ElevenLabs conversational session completed.';
    const metadata = payload.metadata || payload.custom_data || {};

    const appointmentId = metadata.appointmentId || payload.appointment_id;
    const patientId = metadata.patientId || payload.patient_id || 'citizen-guest';
    const status = payload.status === 'failed' ? 'failed' : 'completed';
    const outcome = payload.outcome || (appointmentId ? 'appointment_booked' : 'hospital_info_provided');

    // Save or update call_logs MongoDB collection
    const callLog = await CallLog.create({
      conversationId,
      callId: payload.call_id || conversationId,
      patientId,
      appointmentId,
      status,
      outcome,
      duration: callDuration,
      transcriptReference: String(transcript).substring(0, 500),
      telephonyProvider: 'web_elevenlabs',
      agentId: 'agent_2901m2hw983kfcesprd47f904gbk',
      createdAt: new Date(),
    });

    // If metadata identified operational barriers, log into friction_events MongoDB collection
    if (metadata.friction_type || payload.barrier_type) {
      const barrierType = metadata.friction_type || payload.barrier_type;
      const severity = Number(metadata.severity || payload.severity || 0.72);
      await FrictionEvent.create({
        patientId,
        appointmentId,
        type: normalizeFrictionType(barrierType),
        severity,
        source: 'ai_voice_agent',
        notes: `Recorded via ElevenLabs Webhook for session ${conversationId}`,
        createdAt: new Date(),
      });
    }

    // If appointment is attached and call succeeded, confirm appointment
    if (appointmentId && status === 'completed') {
      await Appointment.findByIdAndUpdate(appointmentId, {
        $set: {
          status: 'confirmed',
          conversationId,
          updatedAt: new Date(),
        },
      });
    }

    res.status(200).json({
      success: true,
      message: 'ElevenLabs webhook received and persisted to MongoDB collections',
      callLogId: callLog.id || callLog._id,
    });
  } catch (error: any) {
    console.error('[ElevenLabs Webhook Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process ElevenLabs webhook',
    });
  }
};

// 6. Existing Voice Agent helper endpoints
export const logVoiceCall = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      conversationId,
      callId,
      patientId,
      appointmentId,
      callStatus,
      callOutcome,
      durationSeconds,
      duration,
      transcriptReference,
      operationalBarriersIdentified,
    } = req.body;

    const callLog = await CallLog.create({
      conversationId: conversationId || `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      callId: callId || undefined,
      patientId: patientId || (req as any).user?.id || 'citizen-guest',
      appointmentId: appointmentId || undefined,
      status: callStatus || 'completed',
      outcome: callOutcome || 'hospital_info_provided',
      duration: Number(duration || durationSeconds || 0),
      transcriptReference: transcriptReference ? String(transcriptReference).substring(0, 500) : undefined,
      operationalBarriersIdentified: Array.isArray(operationalBarriersIdentified) ? operationalBarriersIdentified : [],
      telephonyProvider: 'web_elevenlabs',
      agentId: 'agent_2901m2hw983kfcesprd47f904gbk',
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Call log registered in MongoDB collection',
      callLog,
    });
  } catch (error: any) {
    console.error('[AppointmentVoice Error - CallLog]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to log voice call in MongoDB',
    });
  }
};

export const recordVoiceFriction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, severity, patientId, appointmentId, notes } = req.body;

    const frictionEvent = await FrictionEvent.create({
      patientId: patientId || (req as any).user?.id || 'citizen-guest',
      appointmentId: appointmentId || undefined,
      type: normalizeFrictionType(type),
      severity: Number(severity) || 0.72,
      source: 'ai_voice_agent',
      notes: notes || 'Operational barrier recorded via AI Voice Agent interaction',
      createdAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Friction event recorded in MongoDB friction_events collection',
      frictionEvent,
    });
  } catch (error: any) {
    console.error('[AppointmentVoice Error - Friction]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to record friction event in MongoDB',
    });
  }
};

export const getLatestVoiceAppointmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientId = req.params.patientId || (req as any).user?.id;

    let query: any = {};
    if (patientId && patientId !== 'all') {
      query = { patientId };
    }

    const appointments = await Appointment.find(query).sort({ createdAt: -1 }).limit(5).exec();
    const callLogs = await CallLog.find(query).sort({ createdAt: -1 }).limit(5).exec();
    const frictionEvents = await FrictionEvent.find(query).sort({ createdAt: -1 }).limit(5).exec();
    const telephonyStatus = telephonyBridge.getStatus();

    const latestAppointment = appointments.length > 0 ? appointments[0] : null;
    const latestCall = callLogs.length > 0 ? callLogs[0] : null;

    res.status(200).json({
      success: true,
      data: {
        latestAppointment: latestAppointment
          ? {
              id: latestAppointment.id || latestAppointment._id,
              status: latestAppointment.status,
              hospital: latestAppointment.hospitalName,
              department: latestAppointment.department,
              date: latestAppointment.preferredDate || latestAppointment.appointmentDate,
              time: latestAppointment.preferredTime || latestAppointment.appointmentTime,
              assistedBy: latestAppointment.assistedBy || 'AI Voice Agent',
              createdAt: latestAppointment.createdAt,
            }
          : null,
        latestCall: latestCall
          ? {
              id: latestCall.id || latestCall._id,
              status: latestCall.status || latestCall.callStatus,
              outcome: latestCall.outcome || latestCall.callOutcome,
              duration: latestCall.duration || latestCall.durationSeconds,
              createdAt: latestCall.createdAt,
            }
          : null,
        recentAppointments: appointments,
        recentCalls: callLogs,
        recentFrictionEvents: frictionEvents,
        telephonyStatus,
      },
    });
  } catch (error: any) {
    console.error('[AppointmentVoice Error - Status]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch appointment status from MongoDB',
    });
  }
};

export const getVoiceContextDirectory = async (_req: Request, res: Response): Promise<void> => {
  try {
    const hospitals = await Hospital.find({}).limit(10).exec();

    const formattedHospitals = hospitals.map((h: any) => ({
      id: h.id || h._id,
      name: h.name,
      district: h.district || h.city,
      type: h.type || 'District Hospital',
      emergencyPhone: h.emergencyPhone || '108',
      phone: h.phone || '1800-180-1108',
      departments: h.departments || [
        'General Medicine',
        'Cardiology',
        'Orthopedics',
        'Pediatrics',
        'Gynecology & Obstetrics',
        'ENT',
        'Ophthalmology',
      ],
    }));

    res.status(200).json({
      success: true,
      database: 'MongoDB (Exclusive Database)',
      collections: ['users', 'patients', 'hospitals', 'appointments', 'call_logs', 'friction_events'],
      agentId: 'agent_2901m2hw983kfcesprd47f904gbk',
      hospitals: formattedHospitals,
      standardSlots: [
        '09:30 AM',
        '10:30 AM',
        '11:45 AM',
        '02:00 PM',
        '03:30 PM',
        '04:30 PM',
      ],
      requiredDocumentsGuide: [
        'Aadhaar / Voter ID or Government Photo Identity Card',
        'ABHA (Ayushman Bharat Health Account) card or Number, if available',
        'Previous medical reports, discharge cards, or test summaries',
        'Active mobile phone for OTP and SMS booking confirmation',
      ],
      emergencyReminder: 'For critical or life-threatening emergencies (chest pain, trauma, acute breathing distress), immediately use the 108 Emergency SOS option.',
    });
  } catch (error: any) {
    console.error('[AppointmentVoice Error - Context]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch directory from MongoDB',
    });
  }
};

function normalizeFrictionType(rawType?: string): string {
  const t = (rawType || '').toLowerCase().replace(/[\s-]+/g, '_');
  if (t.includes('time') || t.includes('timing') || t.includes('slot')) return 'appointment_timing';
  if (t.includes('transport') || t.includes('bus') || t.includes('vehicle')) return 'transport';
  if (t.includes('dist') || t.includes('km') || t.includes('travel')) return 'distance';
  if (t.includes('digit') || t.includes('phone') || t.includes('internet')) return 'digital_access';
  if (t.includes('lang') || t.includes('dialect')) return 'language';
  if (t.includes('doc') || t.includes('aadhaar') || t.includes('id')) return 'documentation';
  if (t.includes('family') || t.includes('caregiver') || t.includes('attendant')) return 'family_support';
  if (t.includes('cost') || t.includes('wage') || t.includes('fee')) return 'cost';
  return 'appointment_timing';
}
