import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';
import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { Hospital } from '../models/Hospital.js';
import { HospitalDepartment } from '../models/HospitalDepartment.js';
import { HospitalRequest } from '../models/HospitalRequest.js';
import { Consent } from '../models/Consent.js';
import { PatientDocument } from '../models/PatientDocument.js';
import { FrictionProfile } from '../models/FrictionProfile.js';
import { FrictionInteraction } from '../models/FrictionInteraction.js';
import { CareRisk } from '../models/CareRisk.js';
import { Intervention } from '../models/Intervention.js';
import { Simulation } from '../models/Simulation.js';
import { CareJourney } from '../models/CareJourney.js';
import { CareLeakage } from '../models/CareLeakage.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { SEED_HOSPITALS } from './seedData.js';
import { INTERVENTION_CATALOG } from '../intelligence/optimization/whatIfSimulator.js';
import { FrictionEngine } from '../intelligence/friction/frictionEngine.js';
import { FrictionInteractionEngine } from '../intelligence/causal/frictionInteractionEngine.js';
import { RiskEngine } from '../intelligence/risk/riskEngine.js';

export const runAutomaticSeed = async () => {
  console.log('===========================================================');
  console.log('  PFIS DATABASE SEEDER: POPULATING DEMO DATASET');
  console.log('===========================================================');

  // Clear existing collections
  console.log('[Seed] Cleaning old database collections...');
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Hospital.deleteMany({}),
    HospitalDepartment.deleteMany({}),
    HospitalRequest.deleteMany({}),
    Consent.deleteMany({}),
    PatientDocument.deleteMany({}),
    FrictionProfile.deleteMany({}),
    FrictionInteraction.deleteMany({}),
    CareRisk.deleteMany({}),
    Intervention.deleteMany({}),
    Simulation.deleteMany({}),
    CareJourney.deleteMany({}),
    CareLeakage.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  console.log('[Seed] Hashing passwords...');
  const salt = await bcrypt.genSalt(10);
  const patientPasswordHash = await bcrypt.hash('Patient@123', salt);
  const hospitalPasswordHash = await bcrypt.hash('Hospital@123', salt);
  const adminPasswordHash = await bcrypt.hash('Admin@123', salt);

  // 1. Create Admin Accounts
  console.log('[Seed] Creating Admin Accounts (admin@pfis.org, dhirajkumar464748@gmail.com)...');
  await User.create({
    name: 'PFIS Regional Health Director',
    email: 'admin@pfis.org',
    passwordHash: adminPasswordHash,
    role: 'admin',
    phone: '+91 98765 00001',
    isActive: true,
  });

  await User.create({
    name: 'Dhiraj Kumar (Executive Admin)',
    email: 'dhirajkumar464748@gmail.com',
    passwordHash: adminPasswordHash,
    role: 'admin',
    phone: '+91 98765 00002',
    isActive: true,
  });

  // 2. Create Hospitals & Departments
  console.log('[Seed] Seeding 12 Hospitals & Clinical Departments...');
  const createdHospitals: any[] = [];

  for (let i = 0; i < SEED_HOSPITALS.length; i++) {
    const hDef = SEED_HOSPITALS[i];
    let hospitalEmail = `hospital${i + 1}@pfis.org`;
    if (i === 0) hospitalEmail = 'hospital@rims.org';
    if (i === 1) hospitalEmail = 'hospital@sadar.org';
    if (i === 2) hospitalEmail = 'hospital@apollo.org';

    const hospUser = await User.create({
      name: `${hDef.name} Admin`,
      email: hospitalEmail,
      passwordHash: hospitalPasswordHash,
      role: 'hospital',
      phone: hDef.phone,
      isActive: true,
    });

    const hospitalDoc = await Hospital.create({
      userId: hospUser._id,
      name: hDef.name,
      type: hDef.type,
      tagline: hDef.tagline,
      address: hDef.address,
      city: hDef.city,
      state: hDef.state,
      pincode: hDef.pincode,
      latitude: hDef.latitude,
      longitude: hDef.longitude,
      geoJSON: {
        type: 'Point',
        coordinates: [hDef.longitude, hDef.latitude],
      },
      phone: hDef.phone,
      emergencyPhone: hDef.emergencyPhone,
      email: hDef.email,
      website: hDef.website,
      workingHours: hDef.workingHours,
      emergencyAvailable: hDef.emergencyAvailable,
      totalBeds: hDef.totalBeds,
      availableBeds: hDef.availableBeds,
      specialistAvailable: hDef.specialistAvailable,
      diagnosticFacilities: hDef.diagnosticFacilities,
      languagesSupported: hDef.languagesSupported,
      averageWaitTimeMinutes: hDef.averageWaitTimeMinutes,
      rating: hDef.rating,
      isVerified: true,
    });

    createdHospitals.push(hospitalDoc);

    // Create Departments
    for (const dept of hDef.departments) {
      await HospitalDepartment.create({
        hospitalId: hospitalDoc._id,
        name: dept.name,
        description: dept.description,
        headDoctorName: dept.headDoctorName,
        opdDays: dept.opdDays,
        opdTimings: dept.opdTimings,
        dailyTokenCapacity: dept.dailyTokenCapacity,
        availableTokensToday: dept.availableTokensToday,
        consultationFee: dept.consultationFee,
        isAcceptingRequests: true,
      });
    }
  }

  // 3. Create Seed Patients
  console.log('[Seed] Seeding Diverse Demographic & Accessibility Patients...');
  const patientProfilesDef = [
    {
      name: 'Sunita Devi',
      email: 'patient@pfis.org',
      phone: '+91 94311 87210',
      patientCode: 'PAT-1048',
      age: 48,
      gender: 'female' as const,
      preferredLanguage: 'Hindi',
      transportAvailability: 'low' as const,
      digitalAccessLevel: 'basic' as const,
      familySupport: 'low' as const,
      documentationStatus: 'partial' as const,
      financialAccessibility: 'severely_constrained' as const,
      appointmentFlexibility: 'inflexible_daily_wage' as const,
      residenceType: 'rural_remote' as const,
      location: {
        address: 'Village Ramgarh, Block B, Near Panchayat Bhavan',
        city: 'Ramgarh',
        state: 'Jharkhand',
        pincode: '829101',
        latitude: 23.6312,
        longitude: 85.5143,
        geoJSON: { type: 'Point' as const, coordinates: [85.5143, 23.6312] as [number, number] },
      },
    },
    {
      name: 'Ramesh Soren',
      email: 'ramesh.soren@pfis.org',
      phone: '+91 98351 22910',
      patientCode: 'PAT-1049',
      age: 56,
      gender: 'male' as const,
      preferredLanguage: 'Santali',
      transportAvailability: 'none' as const,
      digitalAccessLevel: 'none' as const,
      familySupport: 'moderate' as const,
      documentationStatus: 'incomplete' as const,
      financialAccessibility: 'severely_constrained' as const,
      appointmentFlexibility: 'inflexible_daily_wage' as const,
      residenceType: 'rural_remote' as const,
      location: {
        address: 'Murhu Village, Khunti Rural',
        city: 'Khunti',
        state: 'Jharkhand',
        pincode: '835210',
        latitude: 23.0745,
        longitude: 85.2798,
        geoJSON: { type: 'Point' as const, coordinates: [85.2798, 23.0745] as [number, number] },
      },
    },
    {
      name: 'Anita Sharma',
      email: 'anita.sharma@pfis.org',
      phone: '+91 91223 44810',
      patientCode: 'PAT-1050',
      age: 34,
      gender: 'female' as const,
      preferredLanguage: 'Hindi',
      transportAvailability: 'moderate' as const,
      digitalAccessLevel: 'moderate' as const,
      familySupport: 'high' as const,
      documentationStatus: 'complete' as const,
      financialAccessibility: 'moderate_budget' as const,
      appointmentFlexibility: 'moderate' as const,
      residenceType: 'semi_urban' as const,
      location: {
        address: 'Bariatu Colony, Near Oxygen Park',
        city: 'Ranchi',
        state: 'Jharkhand',
        pincode: '834009',
        latitude: 23.3850,
        longitude: 85.3520,
        geoJSON: { type: 'Point' as const, coordinates: [85.3520, 23.3850] as [number, number] },
      },
    },
    {
      name: 'Md. Imran Ansari',
      email: 'imran.ansari@pfis.org',
      phone: '+91 93344 71190',
      patientCode: 'PAT-1051',
      age: 42,
      gender: 'male' as const,
      preferredLanguage: 'Urdu',
      transportAvailability: 'low' as const,
      digitalAccessLevel: 'basic' as const,
      familySupport: 'low' as const,
      documentationStatus: 'partial' as const,
      financialAccessibility: 'severely_constrained' as const,
      appointmentFlexibility: 'inflexible_daily_wage' as const,
      residenceType: 'urban_slum' as const,
      location: {
        address: 'Hindpiri Ward 14, Ranchi Central',
        city: 'Ranchi',
        state: 'Jharkhand',
        pincode: '834001',
        latitude: 23.3610,
        longitude: 85.3210,
        geoJSON: { type: 'Point' as const, coordinates: [85.3210, 23.3610] as [number, number] },
      },
    },
    {
      name: 'Kavita Singh',
      email: 'kavita.singh@pfis.org',
      phone: '+91 97711 02938',
      patientCode: 'PAT-1052',
      age: 68,
      gender: 'female' as const,
      preferredLanguage: 'Hindi',
      transportAvailability: 'none' as const,
      digitalAccessLevel: 'none' as const,
      familySupport: 'none' as const,
      documentationStatus: 'incomplete' as const,
      financialAccessibility: 'severely_constrained' as const,
      appointmentFlexibility: 'rigid_hours' as const,
      residenceType: 'rural_remote' as const,
      location: {
        address: 'Kisko Block, Lohardaga Remote',
        city: 'Lohardaga',
        state: 'Jharkhand',
        pincode: '835302',
        latitude: 23.4421,
        longitude: 84.6812,
        geoJSON: { type: 'Point' as const, coordinates: [84.6812, 23.4421] as [number, number] },
      },
    },
    {
      name: 'Vikram Patel',
      email: 'vikram.patel@pfis.org',
      phone: '+91 98112 33445',
      patientCode: 'PAT-1053',
      age: 29,
      gender: 'male' as const,
      preferredLanguage: 'English',
      transportAvailability: 'high' as const,
      digitalAccessLevel: 'advanced' as const,
      familySupport: 'high' as const,
      documentationStatus: 'complete' as const,
      financialAccessibility: 'insured' as const,
      appointmentFlexibility: 'flexible' as const,
      residenceType: 'urban_metro' as const,
      location: {
        address: 'Harmu Housing Colony, Sector 2',
        city: 'Ranchi',
        state: 'Jharkhand',
        pincode: '834002',
        latitude: 23.3490,
        longitude: 85.3080,
        geoJSON: { type: 'Point' as const, coordinates: [85.3080, 23.3490] as [number, number] },
      },
    },
  ];

  const createdPatients: any[] = [];

  for (const pDef of patientProfilesDef) {
    const user = await User.create({
      name: pDef.name,
      email: pDef.email,
      passwordHash: patientPasswordHash,
      role: 'patient',
      phone: pDef.phone,
      isActive: true,
    });

    const patient = await Patient.create({
      userId: user._id,
      patientCode: pDef.patientCode,
      age: pDef.age,
      gender: pDef.gender,
      preferredLanguage: pDef.preferredLanguage,
      phone: pDef.phone,
      emergencyContactName: 'Family Escort',
      emergencyContactPhone: pDef.phone,
      transportAvailability: pDef.transportAvailability,
      digitalAccessLevel: pDef.digitalAccessLevel,
      familySupport: pDef.familySupport,
      documentationStatus: pDef.documentationStatus,
      financialAccessibility: pDef.financialAccessibility,
      appointmentFlexibility: pDef.appointmentFlexibility,
      residenceType: pDef.residenceType,
      location: pDef.location,
      preferredHospitalId: createdHospitals[0]._id,
    });

    // Compute Friction & Risk relative to primary hospital
    const distanceKm = pDef.name === 'Sunita Devi' ? 42.5 : pDef.name === 'Ramesh Soren' ? 38.0 : 12.0;
    const frictionCalc = FrictionEngine.calculate(patient.toObject(), createdHospitals[0].toObject(), distanceKm);

    const frictionProfile = await FrictionProfile.create({
      patientId: patient._id,
      hospitalId: createdHospitals[0]._id,
      ...frictionCalc,
    });

    // Detect Interaction Synergies
    const interactions = FrictionInteractionEngine.detectInteractions(frictionCalc);
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

    // Create Sample Documents for Patient
    const doc1 = await PatientDocument.create({
      patientId: patient._id,
      title: 'Previous Prescription & Baseline ECG',
      type: 'Prescription',
      originalFilename: 'prescription_dr_mitra_2025.pdf',
      storedFilename: 'doc-seed-sample-rx.pdf',
      filePath: 'uploads/doc-seed-sample-rx.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 245000,
      notes: 'Prescribed by CHC Medical Officer for recurrent palpitations.',
    });

    const doc2 = await PatientDocument.create({
      patientId: patient._id,
      title: 'Ayushman Bharat PM-JAY Health Card Copy',
      type: 'ID Card',
      originalFilename: 'pmjay_card_scan.jpg',
      storedFilename: 'doc-seed-sample-id.jpg',
      filePath: 'uploads/doc-seed-sample-id.jpg',
      mimeType: 'image/jpeg',
      fileSizeBytes: 180000,
      notes: 'Family beneficiary registration document.',
    });

    createdPatients.push({ patient, user, doc1, doc2, frictionProfile, careRisk });
  }

  // 4. Seed Seed Interventions
  console.log('[Seed] Seeding Community Health Interventions Catalog...');
  for (const item of INTERVENTION_CATALOG) {
    await Intervention.create({
      code: item.code,
      name: item.name,
      category: item.category as any,
      description: item.description,
      targetBarrier: item.category === 'Transport' ? 'Transport Availability' : 'Diagnostic Delays',
      unitCostINR: item.unitCostINR,
      estimatedCompletionGainPercent: item.baseGainPercent,
      estimatedReachPatients: item.reachPatientsPerUnit,
      costPerPatientINR: Math.round(item.unitCostINR / item.reachPatientsPerUnit),
      geographicSuitability: item.geographicSuitability,
      isActive: true,
    });
  }

  // 5. Seed Care Leakage Data
  console.log('[Seed] Seeding 6-Milestone Care Leakage Funnel...');
  await CareLeakage.create({
    cohortName: 'Q1-2026 Regional Healthcare Access Cohort',
    totalReferred: 1000,
    funnelMilestones: [
      {
        stageName: 'Referred',
        patientCount: 1000,
        retentionPercentage: 100,
        dropOffCount: 0,
        dropOffPercentage: 0,
        primaryBarrierCausingDropOff: 'Initial Baseline Cohort',
      },
      {
        stageName: 'Consulted',
        patientCount: 820,
        retentionPercentage: 82.0,
        dropOffCount: 180,
        dropOffPercentage: 18.0,
        primaryBarrierCausingDropOff: 'Physical Transport Scarcity & Travel Fatigue',
      },
      {
        stageName: 'Diagnosed',
        patientCount: 650,
        retentionPercentage: 65.0,
        dropOffCount: 170,
        dropOffPercentage: 20.7,
        primaryBarrierCausingDropOff: 'Offsite Multi-day Diagnostic Delays',
      },
      {
        stageName: 'Treatment Started',
        patientCount: 470,
        retentionPercentage: 47.0,
        dropOffCount: 180,
        dropOffPercentage: 27.7,
        primaryBarrierCausingDropOff: 'Out-of-Pocket Prescription Expense & Pharmacy Stockouts',
      },
      {
        stageName: 'Treatment Completed',
        patientCount: 290,
        retentionPercentage: 29.0,
        dropOffCount: 180,
        dropOffPercentage: 38.3,
        primaryBarrierCausingDropOff: 'Inflexible Working Hours & Loss of Subsistence Wages',
      },
      {
        stageName: 'Follow-up Completed',
        patientCount: 180,
        retentionPercentage: 18.0,
        dropOffCount: 110,
        dropOffPercentage: 37.9,
        primaryBarrierCausingDropOff: 'Long Repeat Travel Distance & Lack of Escort Caregiver',
      },
    ],
    highestLeakageStage: 'Treatment Started -> Treatment Completed (38.3% Dropout)',
    totalLeakagePercentage: 82.0,
    observedPeriod: 'Last 90 Days',
  });

  // 6. Seed Sample Active Request for Demo Patient #1 (Sunita Devi -> Apollo)
  console.log('[Seed] Seeding Live Patient Intake Request & Consent for Demo...');
  const mainPatient = createdPatients[0].patient;
  const targetHospital = createdHospitals[2]; // Apollo Hospital

  const consent = await Consent.create({
    patientId: mainPatient._id,
    hospitalId: targetHospital._id,
    dataShared: ['demographics', 'reason_for_visit', 'accessibility_friction', 'uploaded_documents'],
    purpose: 'Cardiac OPD Consultation & Accessibility Assistance',
    status: 'ACTIVE',
    grantedAt: new Date(),
  });

  const demoRequest = await HospitalRequest.create({
    requestCode: 'REQ-2026-1048',
    patientId: mainPatient._id,
    hospitalId: targetHospital._id,
    departmentName: 'Cardiology',
    reasonForVisit: 'Chronic chest tightness upon exertion and fatigue over last 3 weeks.',
    preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 days
    preferredTimeSlot: 'Morning (09:00 AM - 12:00 PM)',
    additionalMessage:
      'I am traveling from Ramgarh village (42 km) by rural bus. Requesting morning slot to return before dark.',
    consentId: consent._id,
    documentIds: [createdPatients[0].doc1._id, createdPatients[0].doc2._id],
    status: 'HOSPITAL_RECEIVED',
    distanceKm: 42.5,
    estimatedTravelTimeMinutes: 75,
    accessibilityScoreAtRequest: 38,
    topBarrierAtRequest: 'Transport Availability',
    timeline: [
      {
        status: 'REQUEST_CREATED',
        timestamp: new Date(Date.now() - 3600000 * 4),
        note: 'Request drafted by patient.',
        actorRole: 'patient',
      },
      {
        status: 'CONSENT_GIVEN',
        timestamp: new Date(Date.now() - 3600000 * 3),
        note: 'Patient authorized sharing of non-clinical friction barriers and ECG report.',
        actorRole: 'patient',
      },
      {
        status: 'REQUEST_SENT',
        timestamp: new Date(Date.now() - 3600000 * 2),
        note: 'Request transmitted securely via PFIS.',
        actorRole: 'patient',
      },
      {
        status: 'HOSPITAL_RECEIVED',
        timestamp: new Date(Date.now() - 3600000 * 1),
        note: 'Received in Apollo Cardiology triage queue.',
        actorRole: 'system',
      },
    ],
  });

  // Seed Notifications
  await Notification.create({
    userId: targetHospital.userId,
    role: 'hospital',
    title: 'New Patient Intake Request',
    message: `New request #${demoRequest.requestCode} received from Sunita Devi for Cardiology.`,
    type: 'NEW_REQUEST',
    relatedId: demoRequest._id,
    relatedType: 'HospitalRequest',
    actionUrl: `/hospital/requests/${demoRequest._id}`,
  });

  await Notification.create({
    userId: mainPatient.userId,
    role: 'patient',
    title: 'Request Transmitted to Apollo Hospital',
    message: `Your request #${demoRequest.requestCode} has been received by Apollo Super Speciality Hospital.`,
    type: 'REQUEST_UPDATE',
    relatedId: demoRequest._id,
    relatedType: 'HospitalRequest',
    actionUrl: `/patient/requests/${demoRequest._id}`,
  });

  // Seed Initial Audit Logs
  await AuditLog.create([
    {
      actorRole: 'admin',
      action: 'SYSTEM_INITIALIZATION',
      resource: 'System',
      details: { environment: 'production-ready-seed', version: '1.0.0' },
      timestamp: new Date(),
    },
    {
      userId: mainPatient.userId,
      actorRole: 'patient',
      action: 'REQUEST_CREATED',
      resource: 'HospitalRequest',
      resourceId: demoRequest._id.toString(),
      details: { requestCode: demoRequest.requestCode },
      timestamp: new Date(),
    },
  ]);

  console.log('===========================================================');
  console.log('  PFIS DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  console.log('===========================================================');
};

const seedDatabase = async () => {
  await connectDB();
  await runAutomaticSeed();
  await mongoose.disconnect();
  process.exit(0);
};

// Check if running as direct CLI script
if (process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed.js')) {
  seedDatabase().catch((err) => {
    console.error('[PFIS Seed Error]', err);
    process.exit(1);
  });
}
