import { IPatientJourneyRecord, PatientJourneyModel } from '../models/MultiLevelFriction.js';
import { multiLevelFrictionEngine } from '../intelligence/friction/multiLevelFrictionEngine.js';

export const SYNTHETIC_DISTRICTS = [
  {
    district: 'Patna',
    villages: ['Danapur Diara', 'Phulwari Sharif', 'Fatuha', 'Bakhtiyarpur'],
  },
  {
    district: 'Gaya',
    villages: ['Tekari', 'Bodh Gaya', 'Barachatti', 'Sherghati'],
  },
  {
    district: 'Purnia',
    villages: ['Banmankhi', 'Dhamdaha', 'Baisi', 'Kasba'],
  },
  {
    district: 'Muzaffarpur',
    villages: ['Marwan', 'Kanti', 'Sahebganj', 'Minapur'],
  },
];

// District Facilities Metadata
const DISTRICT_FACILITIES: Record<string, { id: string; name: string }[]> = {
  Patna: [
    { id: 'HOSP-PMCH', name: 'Patna Medical College Hospital (PMCH)' },
    { id: 'HOSP-NMCH', name: 'Nalanda Medical College Hospital (NMCH)' },
    { id: 'HOSP-IGIMS', name: 'Indira Gandhi Institute of Medical Sciences' },
    { id: 'HOSP-FATUHA-CHC', name: 'Fatuha Community Health Centre' },
  ],
  Gaya: [
    { id: 'HOSP-ANMMCH', name: 'Anugrah Narayan Magadh Medical College' },
    { id: 'HOSP-BODHGAYA-CHC', name: 'Bodh Gaya Community Health Centre' },
    { id: 'HOSP-TEKARI-SDH', name: 'Tekari Sub-Divisional Hospital' },
    { id: 'HOSP-SHERGHATI-SDH', name: 'Sherghati Sub-Divisional Hospital' },
  ],
  Purnia: [
    { id: 'HOSP-PURNIA-SADAR', name: 'Purnia Sadar District Hospital' },
    { id: 'HOSP-BANMANKHI-SDH', name: 'Banmankhi Sub-Divisional Hospital' },
    { id: 'HOSP-DHAMDAHA-CHC', name: 'Dhamdaha Community Health Centre' },
    { id: 'HOSP-BAISI-PHC', name: 'Baisi Primary Health Centre' },
  ],
  Muzaffarpur: [
    { id: 'HOSP-SKMCH', name: 'Sri Krishna Medical College Hospital (SKMCH)' },
    { id: 'HOSP-KANTI-RH', name: 'Kanti Referral Hospital' },
    { id: 'HOSP-SAHEBGANJ-CHC', name: 'Sahebganj Community Health Centre' },
    { id: 'HOSP-MARWAN-PHC', name: 'Marwan Primary Health Centre' },
  ],
};

const FIRST_NAMES_FEMALE = [
  'Meera', 'Sunita', 'Anita', 'Pooja', 'Gita', 'Reena', 'Pinky', 'Rekha', 'Pratima', 'Shanti',
  'Malti', 'Babita', 'Sarita', 'Asha', 'Urmila', 'Manju', 'Kiran', 'Sangeeta', 'Kavita', 'Rani',
  'Priyanka', 'Chanda', 'Sobha', 'Lalita', 'Munni', 'Rupa', 'Sanju', 'Kunti', 'Parvati', 'Radha'
];

const FIRST_NAMES_MALE = [
  'Suresh', 'Ramesh', 'Rajesh', 'Manoj', 'Anil', 'Santosh', 'Dharmendra', 'Vinod', 'Ajay', 'Sanjay',
  'Mukesh', 'Arvind', 'Deepak', 'Pramod', 'Rakesh', 'Sunil', 'Vijay', 'Pankaj', 'Dinesh', 'Ashok',
  'Naresh', 'Mahesh', 'Birendra', 'Satendra', 'Ganesh', 'Subhash', 'Amresh', 'Rambabu', 'Ranjit', 'Munna'
];

const SURNAMES = [
  'Devi', 'Yadav', 'Kumari', 'Paswan', 'Sharma', 'Singh', 'Manjhi', 'Ansari', 'Khatoon', 'Sah',
  'Gupta', 'Das', 'Choudhary', 'Jha', 'Mahto', 'Prasad', 'Thakur', 'Mandal', 'Mishra', 'Raza'
];

const SERVICE_CATEGORIES = [
  'Maternal & High-Risk Obstetric',
  'Cardiology & Hypertension',
  'Oncology & Palliative Care',
  'General Medicine & Chronic Fever',
  'Pediatrics & Immunization',
  'Orthopedics & Physical Trauma',
  'Nephrology & Renal Dialysis'
];

const LANGUAGES = ['Hindi', 'Bhojpuri', 'Maithili', 'Magahi', 'Urdu'];

// Deterministic Pseudo-Random Generator based on linear congruential algorithm (Seed = 104729)
class DeterministicPRNG {
  private state: number;

  constructor(seed: number = 104729) {
    this.state = seed;
  }

  public next(): number {
    this.state = (this.state * 1664525 + 1013904223) % 4294967296;
    return this.state / 4294967296;
  }

  public range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  public pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  public boolean(probTrue: number = 0.5): boolean {
    return this.next() < probTrue;
  }
}

// Generate exactly 500 realistic synthetic patient journeys
const generate500SyntheticJourneys = (): Partial<IPatientJourneyRecord>[] => {
  const prng = new DeterministicPRNG(42069);
  const journeys: Partial<IPatientJourneyRecord>[] = [];

  const districtPrefixes: Record<string, string> = {
    Patna: 'PAT',
    Gaya: 'GAY',
    Purnia: 'PUR',
    Muzaffarpur: 'MUZ',
  };

  let globalIndex = 1;

  SYNTHETIC_DISTRICTS.forEach((d) => {
    const districtName = d.district;
    const prefix = districtPrefixes[districtName] || 'BHR';
    const facilities = DISTRICT_FACILITIES[districtName] || [{ id: 'HOSP-GEN', name: 'District General Hospital' }];

    // Exactly 125 records per district (4 * 125 = 500)
    for (let i = 1; i <= 125; i++) {
      const villageName = d.villages[(i - 1) % d.villages.length];
      const isFemale = prng.boolean(0.52);
      const firstName = isFemale ? prng.pick(FIRST_NAMES_FEMALE) : prng.pick(FIRST_NAMES_MALE);
      const surname = isFemale && prng.boolean(0.7) ? 'Devi' : prng.pick(SURNAMES);
      const patientName = `${firstName} ${surname}`;

      // Masked ABHA ID: 91-XXXX-XXXX-XXXX
      const abhaP1 = prng.range(1000, 9999);
      const abhaP2 = prng.range(1000, 9999);
      const abhaP3 = prng.range(1000, 9999);
      const abhaIdMasked = `91-${abhaP1}-${abhaP2}-${abhaP3}`;
      const patientNameMasked = `${patientName} (ABHA: 91-***-${abhaP3})`;

      const age = isFemale && prng.boolean(0.35) ? prng.range(19, 36) : prng.range(18, 79);
      const facility = prng.pick(facilities);
      const serviceCategory = (isFemale && age <= 36 && prng.boolean(0.5))
        ? 'Maternal & High-Risk Obstetric'
        : prng.pick(SERVICE_CATEGORIES);

      // Village-based transit variance
      const isRiverine = villageName.includes('Diara') || villageName.includes('Mand') || villageName.includes('Baisi');
      const baseDist = isRiverine ? prng.range(28, 58) : prng.range(6, 38);
      const transitDistanceKm = baseDist;
      const transitDurationMinutes = Math.round(baseDist * (isRiverine ? prng.range(32, 45) / 10 : prng.range(20, 30) / 10));
      const transitCostInr = Math.round(baseDist * prng.range(45, 80) / 10) + prng.range(20, 60);

      // Household socioeconomics
      const incomeRoll = prng.next();
      const householdIncomeTier: 'bpl' | 'low_income' | 'middle_income' =
        incomeRoll < 0.58 ? 'bpl' : (incomeRoll < 0.90 ? 'low_income' : 'middle_income');

      const dailyWageLossInr = householdIncomeTier === 'bpl' ? prng.range(350, 500) : (householdIncomeTier === 'low_income' ? prng.range(450, 650) : prng.range(200, 400));
      const outOfPocketExpensesInr = prng.range(80, 850);

      // Language & Documentation
      const preferredLanguage = prng.pick(LANGUAGES);
      const languageDissonance = preferredLanguage !== 'Hindi' && prng.boolean(0.65);
      const caregiverEscortAvailable = prng.boolean(householdIncomeTier === 'bpl' ? 0.65 : 0.85);

      const docRoll = prng.next();
      const documentationStatus: 'complete' | 'partial' | 'missing_golden_card' | 'missing_id' =
        docRoll < 0.48 ? 'complete' : (docRoll < 0.76 ? 'partial' : (docRoll < 0.94 ? 'missing_golden_card' : 'missing_id'));

      // Queue & Facilities Telemetry
      const queueWaitMinutes = prng.range(25, 185);
      const diagnosticDelayHours = +(prng.range(5, 65) / 10).toFixed(1);
      const pharmacyStockoutExperienced = prng.boolean(isRiverine ? 0.45 : 0.28);
      const processStepsCount = prng.range(2, 6);
      const referralDelayDays = serviceCategory.includes('Cardiology') || serviceCategory.includes('Oncology') || serviceCategory.includes('Nephrology')
        ? prng.range(2, 11)
        : prng.range(0, 3);
      const facilityCapacityUtilizationPct = prng.range(65, 122);
      const staffingRatioScore = prng.range(42, 88);
      const serviceHoursPerDay = prng.boolean(0.7) ? 8 : (prng.boolean(0.5) ? 12 : 6);
      const informationAvailabilityScore = languageDissonance ? prng.range(30, 60) : prng.range(55, 90);

      const journeyId = `JRN-${prefix}-${String(i).padStart(3, '0')}`;
      const patientId = `PAT-${prefix}-${String(i).padStart(3, '0')}`;

      journeys.push({
        journeyId,
        patientId,
        patientNameMasked,
        abhaIdMasked,
        age,
        gender: isFemale ? 'Female' : 'Male',
        district: districtName,
        village: villageName,
        facilityId: facility.id,
        facilityName: facility.name,
        serviceCategory,
        transitDistanceKm,
        transitDurationMinutes,
        transitCostInr,
        dailyWageLossInr,
        outOfPocketExpensesInr,
        householdIncomeTier,
        languageDissonance,
        preferredLanguage,
        caregiverEscortAvailable,
        documentationStatus,
        queueWaitMinutes,
        diagnosticDelayHours,
        pharmacyStockoutExperienced,
        processStepsCount,
        referralDelayDays,
        facilityCapacityUtilizationPct,
        staffingRatioScore,
        serviceHoursPerDay,
        informationAvailabilityScore,
      });

      globalIndex++;
    }
  });

  return journeys;
};

// Raw 500 Synthetic Healthcare Records
export const RAW_SYNTHETIC_JOURNEYS: Partial<IPatientJourneyRecord>[] = generate500SyntheticJourneys();

// In-memory / persistent seed cache
let cachedJourneys: IPatientJourneyRecord[] = [];

export const getSeedJourneys = (): IPatientJourneyRecord[] => {
  if (cachedJourneys.length > 0) return cachedJourneys;

  // Process all 500 raw synthetic journeys through MultiLevelFrictionEngine
  cachedJourneys = RAW_SYNTHETIC_JOURNEYS.map((raw) => {
    const calculated = multiLevelFrictionEngine.calculateIndividualFriction(raw);
    return {
      ...raw,
      factors: calculated.factors,
      frictionScore: calculated.overallFrictionScore,
      frictionTier: calculated.frictionTier,
      careFailureRisk: calculated.careFailureRisk,
      stages: calculated.stages,
      rootCauses: calculated.rootCauses,
      timestamp: new Date(),
    } as unknown as IPatientJourneyRecord;
  });

  return cachedJourneys;
};

// Seed MongoDB database with 500 synthetic records if empty
export const seedPatientJourneys = async (): Promise<void> => {
  try {
    const count = await PatientJourneyModel.countDocuments();
    if (count >= 500) {
      console.log(`[PFIS Seed] Database already populated with ${count} synthetic journeys.`);
      return;
    }

    const journeys = getSeedJourneys();
    await PatientJourneyModel.deleteMany({});
    await PatientJourneyModel.insertMany(journeys);
    console.log(`[PFIS Seed] Successfully seeded exactly ${journeys.length} realistic synthetic patient journeys into MongoDB.`);
  } catch (error: any) {
    console.warn(`[PFIS Seed] MongoDB seed skipped or offline (using in-memory synthetic seed cache): ${error.message}`);
  }
};
