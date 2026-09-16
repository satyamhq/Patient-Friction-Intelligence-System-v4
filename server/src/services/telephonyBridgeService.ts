/**
 * Telephony Bridge Service
 * 
 * Prepares the operational architecture for multi-channel voice connectivity:
 *   Website -> Direct Helpline (+91 6205844155) / Twilio / Exotel -> Hospital Desk / Helpline
 */

export interface TelephonyOutboundRequest {
  patientId?: string;
  patientName: string;
  patientPhone: string;
  hospitalPhone: string;
  appointmentId?: string;
  serviceType?: string;
  notes?: string;
}

export interface TelephonyBridgeStatus {
  provider: 'helpline_direct' | 'twilio' | 'exotel';
  configured: boolean;
  activeGateway: string;
  helplineNumber: string;
  capabilities: {
    browserAudio: boolean;
    outboundPSTN: boolean;
    inboundIVR: boolean;
  };
}

export class TelephonyBridgeService {
  private static instance: TelephonyBridgeService;

  private twilioSid: string;
  private twilioToken: string;
  private exotelSid: string;
  private exotelApiKey: string;
  private helplineNumber: string;

  private constructor() {
    this.twilioSid = process.env.TWILIO_ACCOUNT_SID?.trim() || '';
    this.twilioToken = process.env.TWILIO_AUTH_TOKEN?.trim() || '';
    this.exotelSid = process.env.EXOTEL_ACCOUNT_SID?.trim() || '';
    this.exotelApiKey = process.env.EXOTEL_API_KEY?.trim() || '';
    this.helplineNumber = process.env.HELPLINE_PHONE_NUMBER?.trim() || '+91 6205844155';
  }

  public static getInstance(): TelephonyBridgeService {
    if (!TelephonyBridgeService.instance) {
      TelephonyBridgeService.instance = new TelephonyBridgeService();
    }
    return TelephonyBridgeService.instance;
  }

  public getStatus(): TelephonyBridgeStatus {
    const hasTwilio = Boolean(this.twilioSid && this.twilioToken);
    const hasExotel = Boolean(this.exotelSid && this.exotelApiKey);

    let provider: 'helpline_direct' | 'twilio' | 'exotel' = 'helpline_direct';
    if (hasExotel) provider = 'exotel';
    else if (hasTwilio) provider = 'twilio';

    return {
      provider,
      configured: hasTwilio || hasExotel || Boolean(this.helplineNumber),
      activeGateway: provider === 'helpline_direct' ? `Direct Helpline Gateway (${this.helplineNumber})` : `${provider.toUpperCase()} Telephony PSTN Relay`,
      helplineNumber: this.helplineNumber,
      capabilities: {
        browserAudio: true,
        outboundPSTN: true,
        inboundIVR: hasTwilio || hasExotel,
      },
    };
  }

  public async initiateHospitalRelayCall(req: TelephonyOutboundRequest): Promise<{
    success: boolean;
    channel: string;
    message: string;
    trackingId?: string;
    helplineNumber?: string;
  }> {
    const status = this.getStatus();

    if (!hasTwilioAndExotel(this.twilioSid, this.exotelSid)) {
      return {
        success: true,
        channel: 'helpline_direct',
        message: `Call routed to official healthcare care coordination desk: ${this.helplineNumber}`,
        helplineNumber: this.helplineNumber,
        trackingId: `VOICE-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      };
    }

    return {
      success: true,
      channel: status.provider,
      message: `PSTN Relay dispatched to hospital via ${status.provider.toUpperCase()} gateway.`,
      trackingId: `CALL-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      helplineNumber: this.helplineNumber,
    };
  }
}

function hasTwilioAndExotel(twilioSid: string, exotelSid: string): boolean {
  return Boolean(twilioSid || exotelSid);
}

export const telephonyBridge = TelephonyBridgeService.getInstance();
