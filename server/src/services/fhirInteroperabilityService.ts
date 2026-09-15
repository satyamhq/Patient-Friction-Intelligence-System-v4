// fhirInteroperabilityService.ts - FHIR R4 standard adapters for ABDM / Public Health interoperability

export interface FhirPatient {
  resourceType: 'Patient';
  id: string;
  identifier: Array<{
    system: string;
    value: string;
  }>;
  name: Array<{
    text: string;
    family?: string;
    given?: string[];
  }>;
  telecom?: Array<{
    system: 'phone' | 'email';
    value: string;
    use: 'home' | 'mobile' | 'work';
  }>;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: Array<{
    line?: string[];
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
}

export interface FhirEncounter {
  resourceType: 'Encounter';
  id: string;
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'finished' | 'cancelled';
  class: {
    system: string;
    code: 'AMB' | 'EMER' | 'VR';
    display: string;
  };
  subject: {
    reference: string;
    display: string;
  };
  period: {
    start: string;
    end?: string;
  };
  serviceProvider?: {
    reference: string;
    display: string;
  };
}

export interface FhirBundle {
  resourceType: 'Bundle';
  type: 'collection' | 'transaction';
  timestamp: string;
  entry: Array<{
    fullUrl?: string;
    resource: any;
  }>;
}

export class FhirInteroperabilityService {
  public static toFhirPatient(patientDoc: any): FhirPatient {
    return {
      resourceType: 'Patient',
      id: String(patientDoc._id || patientDoc.id || 'anonymous'),
      identifier: [
        {
          system: 'https://healthid.abdm.gov.in',
          value: patientDoc.abhaNumber || `ABHA-${patientDoc._id || 'TEMP'}`,
        },
      ],
      name: [
        {
          text: patientDoc.name || 'Citizen Beneficiary',
        },
      ],
      telecom: patientDoc.phone
        ? [
            {
              system: 'phone',
              value: patientDoc.phone,
              use: 'mobile',
            },
          ]
        : [],
      gender: patientDoc.gender ? (patientDoc.gender.toLowerCase() as any) : 'unknown',
      address: [
        {
          line: [patientDoc.address || patientDoc.village || 'Rural Sector'],
          district: patientDoc.district || 'Kapurthala',
          state: patientDoc.state || 'Punjab',
          country: 'India',
        },
      ],
    };
  }

  public static toFhirEncounter(appointmentDoc: any): FhirEncounter {
    return {
      resourceType: 'Encounter',
      id: String(appointmentDoc._id || appointmentDoc.id || 'enc-temp'),
      status: appointmentDoc.status === 'confirmed' ? 'in-progress' : 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: appointmentDoc.teleconsult ? 'VR' : 'AMB',
        display: appointmentDoc.teleconsult ? 'Virtual Teleconsultation' : 'Ambulatory OPD Encounter',
      },
      subject: {
        reference: `Patient/${appointmentDoc.patientId || 'unknown'}`,
        display: appointmentDoc.patientName || 'Patient',
      },
      period: {
        start: appointmentDoc.preferredDate || new Date().toISOString(),
      },
      serviceProvider: {
        reference: `Organization/${appointmentDoc.hospitalId || 'hosp-001'}`,
        display: appointmentDoc.hospitalName || 'Community Health Center',
      },
    };
  }

  public static createExportBundle(patient: any, appointments: any[] = []): FhirBundle {
    const fhirPatient = this.toFhirPatient(patient);
    const encounterEntries = appointments.map((apt) => ({
      resource: this.toFhirEncounter(apt),
    }));

    return {
      resourceType: 'Bundle',
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: [
        { resource: fhirPatient },
        ...encounterEntries,
      ],
    };
  }
}

export const fhirService = new FhirInteroperabilityService();
