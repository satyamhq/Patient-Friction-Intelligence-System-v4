import bcrypt from 'bcryptjs';
import { UserRepository } from '../database/repositories/UserRepository.js';
import { PatientRepository } from '../database/repositories/PatientRepository.js';
import { HospitalRepository } from '../database/repositories/HospitalRepository.js';
import { FrictionRepository } from '../database/repositories/FrictionRepository.js';
import { RequestRepository } from '../database/repositories/RequestRepository.js';
import { DocumentRepository } from '../database/repositories/DocumentRepository.js';
import { NotificationRepository } from '../database/repositories/NotificationRepository.js';
import { PublicHealthRepository } from '../database/repositories/PublicHealthRepository.js';
import {
  MAHARASHTRA_PUBLIC_HEALTH_FACILITIES,
  SEED_ESSENTIAL_MEDICINES,
  SEED_DIAGNOSTICS,
  SEED_HIGH_RISK_PATIENTS,
  SEED_FRONTLINE_TASKS,
} from './publicHealthSeedData.js';

export const runRelationalSeed = async (): Promise<void> => {
  try {
    console.log('===========================================================');
    console.log('  PFIS RELATIONAL SEEDER: POPULATING DEMO DATASET (SQL)    ');
    console.log('===========================================================');

    // Ensure all 6 role demo accounts exist
    await ensureRoleDemoAccounts();

    // 1. Check if admin exists
    const existingAdmin = await UserRepository.findByEmail('admin@pfis.org');
    if (existingAdmin) {
      console.log('[Seed] Relational database already seeded. Checking SIH public health modules...');
      await seedPublicHealthData();
      return;
    }

    const adminHash = await bcrypt.hash('Admin@123', 10);
    const patientHash = await bcrypt.hash('Patient@123', 10);
    const hospitalHash = await bcrypt.hash('Hospital@123', 10);

    // 2. Admin Accounts
    const admin1 = await UserRepository.create({
      email: 'admin@pfis.org',
      password_hash: adminHash,
      name: 'PFIS Executive Admin',
      role: 'admin',
      phone: '+91 98765 43210',
    });

    const admin2 = await UserRepository.create({
      email: 'dhirajkumar464748@gmail.com',
      password_hash: adminHash,
      name: 'Dhiraj Kumar (Executive Admin)',
      role: 'admin',
      phone: '+91 91234 56789',
    });

    // 3. Hospital Staff Account
    const staffUser = await UserRepository.create({
      email: 'staff@hospital.org',
      password_hash: hospitalHash,
      name: 'Dr. Gurpreet Singh (Nodal Officer)',
      role: 'hospital',
      phone: '+91 98765 11223',
    });

    // 4. Demo Patient Account (Sunita Devi)
    const patientUser = await UserRepository.create({
      email: 'patient@pfis.org',
      password_hash: patientHash,
      name: 'Sunita Devi',
      role: 'patient',
      phone: '+91 98140 12345',
    });

    // 5. Patient Profile (Sunita Devi - Non-Clinical Accessibility Parameters)
    const sunitaProfile = await PatientRepository.createOrUpdate({
      user_id: patientUser.id,
      full_name: 'Sunita Devi',
      age: 60,
      gender: 'Female',
      location: 'Rural (Vill. Mehli, Near Phagwara, Punjab)',
      is_rural: true,
      distance_to_hospital_km: 65.0,
      transport_mode: 'Infrequent Bus',
      digital_literacy: 'None / Feature Phone',
      family_support: 'Caregiver Constrained',
      wage_loss_risk: 'Daily Wage Loss',
      preferred_language: 'pa',
      smartphone_access: false,
      internet_type: '2G / Intermittent',
      disability_needs: 'Limited Mobility / Needs Ground-Floor Wheelchair Support',
      appointment_flexibility: 'Morning Window (Before 11 AM)',
      document_readiness: 'Physical Paper / Missing Health Card',
    });

    // 6. Calculate and store initial explainable friction score
    const calculatedFriction = FrictionRepository.calculateExplainableFriction(sunitaProfile);
    await FrictionRepository.saveCalculatedFriction(patientUser.id, calculatedFriction);

    // Initial Accessibility Risks
    await FrictionRepository.createAccessibilityRisk({
      patient_id: patientUser.id,
      risk_level: 'High',
      barrier_title: 'Long Transit Distance & Irregular Bus Schedule',
      explanation: 'Living 65 km away with infrequent public transit causes high journey attrition risk.',
      mitigation_action: 'Assign hospital transit shuttle or suggest doorstep care escort (Sahayak).',
    });

    await FrictionRepository.createAccessibilityRisk({
      patient_id: patientUser.id,
      risk_level: 'Moderate',
      barrier_title: 'Digital & Form Literacy Barrier',
      explanation: 'Inability to operate smartphone or read English tokens creates queue friction.',
      mitigation_action: 'Enable Simple Language Mode and assign audio assistance tokens.',
    });

    // 7. Seed Hospitals (Verified Facilities in Phagwara / Jalandhar & Hubs)
    const hospitalsData = [
      {
        name: 'Civil Hospital Phagwara (Government 24/7)',
        type: 'Government Sub-Divisional Hospital',
        city: 'Phagwara',
        address: 'GT Road, Near Rest House, Phagwara, Punjab 144401',
        latitude: 31.2229,
        longitude: 75.7725,
        phone: '01824-260232',
        total_beds: 120,
        available_beds: 42,
        emergency_24x7: true,
        teleconsult_available: true,
        accessibility_facilities: 'Wheelchair Ramps, Ground-Floor OPD, Jan Aushadhi Kendra, Free Ambulances',
      },
      {
        name: 'Gandhi Hospital (P) Ltd (Multi-Speciality)',
        type: 'Private Multi-Speciality Hospital',
        city: 'Phagwara',
        address: 'Model Town, Central Town, Phagwara, Punjab 144401',
        latitude: 31.2255,
        longitude: 75.7712,
        phone: '01824-500600',
        total_beds: 85,
        available_beds: 19,
        emergency_24x7: true,
        teleconsult_available: true,
        accessibility_facilities: 'Elevator Access, Fast-Track Senior Citizen Desk, Multilingual Signage',
      },
      {
        name: 'Patel Hospital (Jalandhar Multi-Speciality Hub)',
        type: 'Private Tertiary Super-Speciality',
        city: 'Jalandhar',
        address: 'Civil Lines, Near BMC Chowk, Jalandhar, Punjab 144001',
        latitude: 31.326,
        longitude: 75.5762,
        phone: '0181-5241000',
        total_beds: 250,
        available_beds: 64,
        emergency_24x7: true,
        teleconsult_available: true,
        accessibility_facilities: 'Dedicated Care Escort, Cashless TPA Desk, Disabled Toilet Facilities',
      },
      {
        name: 'Johal Multispeciality Hospital',
        type: 'Private Multi-Speciality Hospital',
        city: 'Jalandhar',
        address: 'Rama Mandi, Hoshiarpur Road, Jalandhar, Punjab 144005',
        latitude: 31.3195,
        longitude: 75.6152,
        phone: '0181-2410700',
        total_beds: 110,
        available_beds: 28,
        emergency_24x7: true,
        teleconsult_available: true,
        accessibility_facilities: 'Ramp Access, Direct Ambulance Bay, Digital Token Screen',
      },
      {
        name: 'Apollo Super Speciality Hospital',
        type: 'Private Tertiary Hospital',
        city: 'Ranchi',
        address: 'Lake Road, Main Road Crossing, Ranchi, Jharkhand',
        latitude: 23.3551,
        longitude: 85.3262,
        phone: '0651-2446600',
        total_beds: 350,
        available_beds: 58,
        emergency_24x7: true,
        teleconsult_available: true,
        accessibility_facilities: '24/7 Patient Concierge, Braille Signboards, Elevator Support',
      },
      {
        name: 'Sadar District Hospital',
        type: 'Government District Hospital',
        city: 'Ranchi',
        address: 'Purulia Road, Ahirtoli, Ranchi, Jharkhand',
        latitude: 23.3712,
        longitude: 85.3341,
        phone: '0651-2200100',
        total_beds: 500,
        available_beds: 72,
        emergency_24x7: true,
        teleconsult_available: true,
        accessibility_facilities: 'Ayushman Bharat Desk, Step-Free Transit Corridors, Help Desk',
      },
    ];

    for (const h of hospitalsData) {
      const createdHosp = await HospitalRepository.create(h);

      // Add departments and token allocations
      await HospitalRepository.addService({
        hospital_id: createdHosp.id,
        name: 'General Medicine & Geriatric Screening',
        department: 'General Medicine',
        total_daily_tokens: 60,
        available_tokens: 28,
        fee: h.type.includes('Government') ? 0 : 350,
        is_active: true,
      });

      await HospitalRepository.addService({
        hospital_id: createdHosp.id,
        name: 'Cardiology & Hypertension Clinic',
        department: 'Cardiology',
        total_daily_tokens: 40,
        available_tokens: 15,
        fee: h.type.includes('Government') ? 0 : 500,
        is_active: true,
      });

      await HospitalRepository.addService({
        hospital_id: createdHosp.id,
        name: 'Orthopedics & Joint Care',
        department: 'Orthopedics',
        total_daily_tokens: 35,
        available_tokens: 12,
        fee: h.type.includes('Government') ? 0 : 450,
        is_active: true,
      });
    }

    // 8. Seed Sample Requests for Sunita Devi
    const firstHosp = (await HospitalRepository.findAll())[0];
    await RequestRepository.create({
      patient_id: patientUser.id,
      hospital_id: firstHosp?.id,
      request_type: 'Transport Support',
      status: 'Processing',
      details: 'Requesting community transit shuttle for morning OPD visit from village Mehli.',
      priority: 'High',
    });

    await RequestRepository.create({
      patient_id: patientUser.id,
      hospital_id: firstHosp?.id,
      request_type: 'Accessibility Support',
      status: 'Approved',
      details: 'Ground floor wheelchair assistance requested upon arrival at hospital gate.',
      priority: 'Standard',
    });

    // 9. Seed Sample Documents in Vault
    await DocumentRepository.create({
      patient_id: patientUser.id,
      category: 'ID Proof',
      file_name: 'Aadhaar_Card_Masked.pdf',
      file_url: '/demo-vault/Aadhaar_Card_Masked.pdf',
      file_size_kb: 245.5,
      mime_type: 'application/pdf',
    });

    await DocumentRepository.create({
      patient_id: patientUser.id,
      category: 'Medical Document',
      file_name: 'Previous_OPD_Prescription_Slip.pdf',
      file_url: '/demo-vault/Previous_OPD_Prescription_Slip.pdf',
      file_size_kb: 412.0,
      mime_type: 'application/pdf',
    });

    // 10. Seed Notifications
    await NotificationRepository.create({
      user_id: patientUser.id,
      title: 'Welcome to PFIS Accessibility Portal',
      message: 'Your non-clinical accessibility profile is active. You can review your travel friction and find nearby verified hospitals.',
      type: 'success',
      link: '/patient/friction-profile',
    });

    await NotificationRepository.create({
      user_id: patientUser.id,
      title: 'Transport Assistance Request Received',
      message: 'Your request for morning transit assistance has been queued with Civil Hospital Phagwara support desk.',
      type: 'info',
      link: '/patient/requests',
    });

    await seedPublicHealthData();

    console.log('[Seed] Relational database seeding finished successfully!');
    console.log('  -> Admin: admin@pfis.org (Admin@123)');
    console.log('  -> Admin: dhirajkumar464748@gmail.com (Admin@123)');
    console.log('  -> Patient: patient@pfis.org (Patient@123)');
    console.log('  -> Hospital: staff@hospital.org (Hospital@123)');
    console.log('===========================================================');
  } catch (err: any) {
    console.error('[Seed Error] Failed to seed relational database:', err.message);
  }
};

async function ensureRoleDemoAccounts(): Promise<void> {
  try {
    const rolesToEnsure = [
      {
        email: 'doctor@pfis.org',
        pass: 'Doctor@123',
        name: 'Dr. Priya Sharma (Clinical Lead)',
        role: 'doctor' as const,
        phone: '+91 98765 22334',
      },
      {
        email: 'asha@pfis.org',
        pass: 'Asha@123',
        name: 'Kavita Devi (ASHA Sangini)',
        role: 'asha_worker' as const,
        phone: '+91 98765 33445',
      },
      {
        email: 'government@pfis.org',
        pass: 'Govt@123',
        name: 'Rajesh Verma (District Health Officer)',
        role: 'government' as const,
        phone: '+91 98765 44556',
      },
      {
        email: 'hospital@apollo.org',
        pass: 'Hospital@123',
        name: 'Apollo Hospital Nodal Admin',
        role: 'hospital' as const,
        phone: '+91 98765 55667',
      },
      {
        email: 'patient@pfis.org',
        pass: 'Patient@123',
        name: 'Sunita Devi',
        role: 'patient' as const,
        phone: '+91 98140 12345',
      },
      {
        email: 'admin@pfis.org',
        pass: 'Admin@123',
        name: 'PFIS Executive Admin',
        role: 'admin' as const,
        phone: '+91 98765 43210',
      },
    ];

    for (const r of rolesToEnsure) {
      const existing = await UserRepository.findByEmail(r.email);
      if (!existing) {
        const hash = await bcrypt.hash(r.pass, 10);
        await UserRepository.create({
          email: r.email,
          password_hash: hash,
          name: r.name,
          role: r.role,
          phone: r.phone,
        });
        console.log(`[Seed] Created demo account: ${r.email} (${r.role})`);
      }
    }
  } catch (err: any) {
    console.warn('[Seed] Warning in ensureRoleDemoAccounts:', err.message);
  }
}

async function seedPublicHealthData(): Promise<void> {
  try {
    const existingMeds = await PublicHealthRepository.getMedicines();
    if (existingMeds && existingMeds.length > 0) {
      console.log('[Seed] SIH Public Health modules already populated.');
      return;
    }

    console.log('[Seed] Populating Maharashtra Public Health Facilities & SIH 26133 modules...');

    // 1. Facilities
    const seededFacilities: any[] = [];
    for (const fac of MAHARASHTRA_PUBLIC_HEALTH_FACILITIES) {
      const hosp = await HospitalRepository.create({
        id: fac.id,
        name: `${fac.name}`,
        type: `Government (${fac.tier})`,
        city: fac.city,
        address: fac.address,
        latitude: fac.latitude,
        longitude: fac.longitude,
        phone: fac.phone,
        total_beds: fac.totalBeds,
        available_beds: fac.availableBeds,
        emergency_24x7: fac.emergency24x7,
        teleconsult_available: fac.teleconsultAvailable,
        accessibility_facilities: `NQAS Quality Score: ${fac.nqasScore}/100 | Diagnostics: ${fac.diagnosticFacilities.join(', ')}`,
      });
      seededFacilities.push(hosp);

      for (const dept of fac.departments) {
        await HospitalRepository.addService({
          hospital_id: hosp.id,
          name: dept.name,
          department: dept.department,
          total_daily_tokens: dept.totalTokens,
          available_tokens: dept.availableTokens,
          fee: dept.fee,
          is_active: true,
        });
      }
    }

    const patient = await UserRepository.findByEmail('patient@pfis.org');
    const patientId = patient?.id || 'demo-patient-sunita';

    // 2. Essential Medicines (e-Aushadhi)
    const { getDB } = await import('../database/db.js');
    const db = getDB();

    for (let i = 0; i < SEED_ESSENTIAL_MEDICINES.length; i++) {
      const med = SEED_ESSENTIAL_MEDICINES[i];
      const fac = seededFacilities[i % seededFacilities.length];
      await db.query(
        `INSERT INTO essential_medicines (id, facility_id, facility_name, facility_tier, medicine_name, generic_name, category, dosage_form, stock_count, min_threshold, status, batch_number, expiry_date, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          `med-${i + 1}`,
          fac.id,
          fac.name,
          med.facility_tier,
          med.medicine_name,
          med.generic_name,
          med.category,
          med.dosage_form,
          med.stock_count,
          med.min_threshold,
          med.status,
          med.batch_number,
          med.expiry_date,
          new Date().toISOString(),
        ]
      );
    }

    // 3. Diagnostics
    for (let i = 0; i < SEED_DIAGNOSTICS.length; i++) {
      const diag = SEED_DIAGNOSTICS[i];
      const fac = seededFacilities[(i + 1) % seededFacilities.length];
      await db.query(
        `INSERT INTO diagnostics (id, facility_id, facility_name, facility_tier, service_name, category, description, equipment_status, availability_status, booking_status, technician_available, fee, fee_verified, opening_time, closing_time, tat_hours, verification_status, source, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [
          `dx-${i + 1}`,
          fac.id,
          fac.name,
          diag.facility_tier,
          diag.service_name,
          diag.category,
          diag.description || null,
          diag.equipment_status,
          diag.availability_status,
          diag.booking_status,
          diag.technician_available,
          diag.fee,
          diag.fee_verified ?? true,
          diag.opening_time || null,
          diag.closing_time || null,
          diag.tat_hours,
          diag.verification_status,
          diag.source,
          new Date().toISOString(),
        ]
      );
    }

    // 4. High-Risk Registry
    const existingHighRisk = await PublicHealthRepository.getHighRiskRegistry({ patient_id: patientId });
    if (!existingHighRisk || existingHighRisk.length === 0) {
      for (const hr of SEED_HIGH_RISK_PATIENTS) {
        await PublicHealthRepository.createHighRiskEntry({
          patient_id: patientId,
          patient_name: hr.patient_name,
          cohort_type: hr.cohort_type,
          risk_level: hr.risk_level,
          primary_condition: hr.primary_condition,
          current_milestone: hr.current_milestone,
          next_due_date: hr.next_due_date,
          status: hr.status,
          assigned_asha_name: hr.assigned_asha_name,
          follow_up_notes: hr.follow_up_notes,
        });
      }
    }

    // 5. Frontline Tasks
    for (const ft of SEED_FRONTLINE_TASKS) {
      await PublicHealthRepository.createFrontlineTask(ft);
    }

    // 6. Longitudinal Health Records (Sunita Devi)
    await PublicHealthRepository.createHealthRecord({
      patient_id: patientId,
      abha_id: '91-4582-7391-2041@abdm',
      facility_name: 'Primary Health Centre (PHC) Mahabaleshwar',
      doctor_name: 'Dr. Anand Shinde, MBBS (Medical Officer)',
      record_type: 'OPD Consultation',
      record_date: '2026-08-14',
      diagnosis: 'Essential Hypertension Stage-2 with borderline Type 2 Diabetes Mellitus',
      record_source: 'hospital_verified',
      vitals_json: JSON.stringify({ bp: '168/102 mmHg', pulse: '84 bpm', spo2: '97%', weightKg: '68' }),
      prescription_json: JSON.stringify([
        { name: 'Amlodipine 5mg', dosage: '1 Tab Daily OD Morning', duration: '30 Days' },
        { name: 'Metformin 500mg ER', dosage: '1 Tab BD After Meals', duration: '30 Days' },
      ]),
      notes: 'Advised salt restriction, regular walking, and quarterly serum creatinine check.',
      fhir_bundle_json: JSON.stringify({ resourceType: 'Bundle', type: 'document', entry: [{ resourceType: 'Composition', title: 'PFIS Interoperable Clinical Summary' }] }),
    });

    await PublicHealthRepository.createHealthRecord({
      patient_id: patientId,
      abha_id: '91-4582-7391-2041@abdm',
      facility_name: 'Rural Hospital Wai (30-Bedded Community Health Centre)',
      doctor_name: 'Dr. Sneha Kulkarni, MD (Medicine)',
      record_type: 'Diagnostic Report',
      record_date: '2026-07-02',
      diagnosis: 'Routine Non-Communicable Disease Pathology Evaluation',
      record_source: 'hospital_verified',
      vitals_json: JSON.stringify({ fastingSugar: '142 mg/dL', ppSugar: '210 mg/dL', hba1c: '7.8%' }),
      notes: 'HbA1c elevated. Recommend continued adherence to Metformin and dietary counseling by ASHA.',
    });

    // 7. Tiered Referrals
    await PublicHealthRepository.createReferral({
      patient_id: patientId,
      patient_name: 'Sunita Devi',
      from_facility_id: seededFacilities[1].id,
      from_facility_name: seededFacilities[1].name,
      from_tier: 'Primary Health Centre (PHC)',
      to_facility_id: seededFacilities[2].id,
      to_facility_name: seededFacilities[2].name,
      to_tier: 'Rural Hospital (RH)',
      specialty_required: 'General Medicine & Diagnostic Sonography',
      reason_for_referral: 'Persistent systolic BP > 165 mmHg with severe headache and calf numbness. Requires 12-lead ECG, USG, and specialist physician review.',
      priority: 'Urgent',
      transport_mode: '102 Janani / Shishu Ambulatory Van',
      status: 'In Transit',
      counter_referral_notes: 'PHC Medical Officer initiated transit; Rural Hospital Casualty informed.',
    });

    await PublicHealthRepository.createReferral({
      patient_id: patientId,
      patient_name: 'Anandi Deepak Shinde',
      from_facility_id: seededFacilities[0].id,
      from_facility_name: seededFacilities[0].name,
      from_tier: 'Sub-Centre / AAM',
      to_facility_id: seededFacilities[2].id,
      to_facility_name: seededFacilities[2].name,
      to_tier: 'Rural Hospital (RH)',
      specialty_required: 'Obstetrics & High-Risk Pregnancy Care',
      reason_for_referral: 'Severe 3rd Trimester Anemia (Hb 7.2 g/dL) at 34 Weeks Gestation. Requires IV Iron Sucrose therapy and obstetric Doppler ultrasound.',
      priority: 'Urgent',
      transport_mode: '102 Janani Shishu Express',
      status: 'Initiated',
      counter_referral_notes: 'ASHA Tai Sunanda accompanied patient; scheduled for Wednesday morning arrival.',
    });

    // 8. Emergency 108 SOS Dispatch
    await PublicHealthRepository.createEmergencyDispatch({
      patient_name: 'Tukaram Jadhav (Satara Medha Valley)',
      phone: '98221-88902',
      location_name: 'Medha Valley Ghat Road, KM Marker 14',
      emergency_type: 'Cardiac / Acute Chest Pain',
      assigned_ambulance_vehicle: 'MH-11-AX-1081 (Advanced Life Support 108)',
      eta_minutes: 8,
      destination_hospital_id: seededFacilities[4].id,
      destination_hospital_name: seededFacilities[4].name,
      status: 'En Route',
    });

    console.log('[Seed] SIH 26133 Public Health dataset seeded successfully!');
  } catch (error: any) {
    console.error('[Seed Error] Failed to seed public health data:', error.message);
  }
}

