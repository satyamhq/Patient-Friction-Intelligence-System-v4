import bcrypt from 'bcryptjs';
import { getDB } from '../database/db.js';
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
      await seedDoctorClinicalData();
      await seedAshaData();
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

export async function seedDoctorClinicalData(): Promise<void> {
  try {
    const db = getDB();
    const docUser = await UserRepository.findByEmail('doctor@pfis.org');
    const doctorId = docUser?.id || '9106dae7-84f6-41e4-beb4-c8da8336cdc3';
    const doctorName = docUser?.name || 'Dr. Priya Sharma (Clinical Lead)';

    // 1. Doctor Profile
    const existingProfiles = await db.query(`SELECT * FROM doctor_profiles`);
    if (existingProfiles.rows.length === 0) {
      await db.query(
        `INSERT INTO doctor_profiles (id, user_id, doctor_code, name, specialization, qualification, license_number, registration_number, hospital_id, hospital_name, hospital_affiliation, experience, experience_years, languages, phone, email, consultation_fee, opd_timings, available_days, total_patients_seen, bio, is_verified, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
        [
          'doc-priya-sharma',
          doctorId,
          'DOC-2026-081',
          'Dr. Priya Sharma',
          'General Medicine',
          'MBBS, MD (Internal Medicine)',
          'MCI-2018-77492',
          'MCI-2018-77492',
          'hosp-default',
          'District Civil Hospital & Community Health Network',
          'District Civil Hospital & Community Health Network',
          8,
          8,
          JSON.stringify(['Hindi', 'Punjabi', 'English']),
          '+91 98765 22334',
          'doctor@pfis.org',
          300,
          '09:00 AM – 05:00 PM',
          JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
          1420,
          'Senior Medical Officer & Clinical Specialist with 8+ years experience in managing chronic non-communicable diseases, public health OPDs, and rural patient triage.',
          true,
          true,
        ]
      );
      console.log('[Seed] Doctor profile seeded for Dr. Priya Sharma');
    }

    // 2. Doctor Schedule
    const existingSchedules = await db.query(`SELECT * FROM doctor_schedules`);
    if (existingSchedules.rows.length === 0) {
      await db.query(
        `INSERT INTO doctor_schedules (id, doctor_id, doctor_name, working_days, opd_start, opd_end, break_start, break_end, slot_duration_minutes, teleconsult_available, teleconsult_days, teleconsult_start, teleconsult_end, unavailable_dates, max_patients_per_day, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          'sch-priya-01',
          doctorId,
          doctorName,
          JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
          '09:00',
          '17:00',
          '13:00',
          '14:00',
          15,
          true,
          JSON.stringify(['Tuesday', 'Thursday']),
          '17:00',
          '18:00',
          JSON.stringify([]),
          30,
          true,
        ]
      );
      console.log('[Seed] Doctor schedule seeded');
    }

    // 3. Queue Tokens
    const existingTokens = await db.query(`SELECT * FROM queue_tokens`);
    if (existingTokens.rows.length < 3) {
      const tokensToSeed = [
        { id: 'tok-104', tokenNumber: 104, patientId: 'df934545-a5e1-4ed7-a0b4-faed1d13facb', patientName: 'Sunita Devi', visitReason: 'Hypertension Follow-up & BP Monitoring', priority: 'STANDARD', status: 'SERVING', doctorName, wait: 0 },
        { id: 'tok-105', tokenNumber: 105, patientId: 'pt-harpreet', patientName: 'Harpreet Singh', visitReason: 'Cardiology Referral Check', priority: 'STANDARD', status: 'WAITING', doctorName: null, wait: 12 },
        { id: 'tok-106', tokenNumber: 106, patientId: 'pt-amrik', patientName: 'Amrik Chand', visitReason: 'Diabetes Review & High Glycemia', priority: 'URGENT', status: 'WAITING', doctorName: null, wait: 24 },
        { id: 'tok-107', tokenNumber: 107, patientId: 'pt-kavita', patientName: 'Kavita Singh', visitReason: 'ANC Checkup & Nutrition Counsel', priority: 'STANDARD', status: 'WAITING', doctorName: null, wait: 36 },
        { id: 'tok-108', tokenNumber: 108, patientId: 'pt-ranjit', patientName: 'Ranjit Kumar', visitReason: 'Fever & Respiratory Symptoms', priority: 'STANDARD', status: 'WAITING', doctorName: null, wait: 48 },
      ];
      for (const t of tokensToSeed) {
        await db.query(
          `INSERT INTO queue_tokens (id, tokennumber, patientid, patientname, hospitalid, hospitalname, department, priority, status, doctorname, visit_reason, estimatedwaitminutes, issuetime) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [t.id, t.tokenNumber, t.patientId, t.patientName, 'hosp-default', 'District Civil Hospital', 'General Medicine OPD', t.priority, t.status, t.doctorName, t.visitReason, t.wait, new Date().toISOString()]
        );
      }
      console.log('[Seed] Queue tokens seeded');
    }

    // 4. Prescriptions
    const existingRx = await db.query(`SELECT * FROM doctor_prescriptions`);
    if (existingRx.rows.length === 0) {
      const rxToSeed = [
        {
          id: 'rx-001',
          patientId: 'df934545-a5e1-4ed7-a0b4-faed1d13facb',
          patientName: 'Sunita Devi',
          tokenNumber: '104',
          items: JSON.stringify([
            { medicine: 'Tab. Telmisartan 40mg', dosage: '1 Tab', frequency: 'Once daily (Morning)', duration: '30 Days', instructions: 'Take with water after breakfast' },
            { medicine: 'Tab. Paracetamol 650mg', dosage: '1 Tab', frequency: 'As needed (SOS)', duration: '5 Days', instructions: 'For pain or fever only' }
          ]),
          notes: 'Essential Stage-2 Hypertension managed. Continue antihypertensive therapy, low sodium diet, and weekly BP tracking.',
          assessment: 'Hypertension under pharmacological control.',
          plan: '1. Telmisartan 40mg daily\n2. Low salt diet\n3. Follow-up after 2 weeks with BP log',
          status: 'Issued',
        },
        {
          id: 'rx-002',
          patientId: 'pt-amrik',
          patientName: 'Amrik Chand',
          tokenNumber: '106',
          items: JSON.stringify([
            { medicine: 'Tab. Metformin 500mg ER', dosage: '1 Tab', frequency: 'Twice daily (with meals)', duration: '30 Days', instructions: 'Take immediately with meal' }
          ]),
          notes: 'Type 2 Diabetes Mellitus — glycemic control adjustment. Fasting sugar review scheduled.',
          assessment: 'Suboptimal glycemic control. HbA1c elevated.',
          plan: 'Increase Metformin to twice daily. Dietary counseling arranged with ASHA.',
          status: 'Confirmed',
        },
        {
          id: 'rx-003',
          patientId: 'pt-harpreet',
          patientName: 'Harpreet Singh',
          tokenNumber: '105',
          items: JSON.stringify([
            { medicine: 'Tab. Aspirin 75mg', dosage: '1 Tab', frequency: 'Once daily (after lunch)', duration: '90 Days', instructions: 'Take with meal' }
          ]),
          notes: 'Post-cardiac evaluation — antiplatelet therapy initiated awaiting formal cardiology consult.',
          assessment: 'Mild atypical angina on exertion.',
          plan: 'Cardiology referral generated; baseline antiplatelet therapy started.',
          status: 'Draft',
        }
      ];
      for (const r of rxToSeed) {
        await db.query(
          `INSERT INTO doctor_prescriptions (id, doctor_id, doctor_name, patient_id, patient_name, token_number, items, clinical_notes, assessment, plan, status, issued_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [r.id, doctorId, doctorName, r.patientId, r.patientName, r.tokenNumber, r.items, r.notes, r.assessment, r.plan, r.status, r.status === 'Issued' ? new Date().toISOString() : null]
        );
      }
      console.log('[Seed] Doctor prescriptions seeded');
    }

    // 5. Lab Orders
    const existingLabs = await db.query(`SELECT * FROM doctor_lab_orders`);
    if (existingLabs.rows.length === 0) {
      const labsToSeed = [
        { id: 'lab-001', patientId: 'pt-amrik', patientName: 'Amrik Chand', testName: 'HbA1c (Glycated Haemoglobin)', category: 'Pathology', instructions: 'Fasting sample required', priority: 'Urgent', status: 'Ready', isCritical: true, report: 'HbA1c: 10.4% (Critical — above 9.0%)' },
        { id: 'lab-002', patientId: 'df934545-a5e1-4ed7-a0b4-faed1d13facb', patientName: 'Sunita Devi', testName: 'Serum Creatinine & BUN', category: 'Pathology', instructions: 'Renal profile assessment', priority: 'Routine', status: 'Processing', isCritical: false, report: null },
        { id: 'lab-003', patientId: 'pt-harpreet', patientName: 'Harpreet Singh', testName: 'ECG (12 Lead) + 2D Echo', category: 'Cardiology', instructions: 'Pre-referral baseline cardiac assessment', priority: 'Urgent', status: 'Ordered', isCritical: false, report: null },
        { id: 'lab-004', patientId: 'df934545-a5e1-4ed7-a0b4-faed1d13facb', patientName: 'Sunita Devi', testName: 'Complete Blood Count (CBC) with Platelets', category: 'Pathology', instructions: 'Routine check', priority: 'Routine', status: 'Ready', isCritical: false, report: 'Hb: 11.2 g/dL, TLC: 7,400 /mcL, Platelets: 2.1 Lakh/mcL (Normal)' },
      ];
      for (const l of labsToSeed) {
        await db.query(
          `INSERT INTO doctor_lab_orders (id, doctor_id, doctor_name, patient_id, patient_name, test_name, category, instructions, priority, status, is_critical, report_summary, ordered_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [l.id, doctorId, doctorName, l.patientId, l.patientName, l.testName, l.category, l.instructions, l.priority, l.status, l.isCritical, l.report, new Date().toISOString()]
        );
      }
      console.log('[Seed] Doctor lab orders seeded');
    }

    // 6. Follow-ups
    const existingFu = await db.query(`SELECT * FROM doctor_follow_ups`);
    if (existingFu.rows.length === 0) {
      const fuToSeed = [
        { id: 'fu-001', patientId: 'df934545-a5e1-4ed7-a0b4-faed1d13facb', patientName: 'Sunita Devi', dueDate: '2026-09-15', reason: 'Blood pressure recheck + medication adjustment review', priority: 'High', status: 'Upcoming', instructions: 'Bring previous 2-week BP log and fasting readings' },
        { id: 'fu-002', patientId: 'pt-amrik', patientName: 'Amrik Chand', dueDate: '2026-09-10', reason: 'HbA1c result review & insulin dosage adjustment', priority: 'Urgent', status: 'Overdue', instructions: 'Fasting blood sugar test before OPD visit' },
        { id: 'fu-003', patientId: 'pt-harpreet', patientName: 'Harpreet Singh', dueDate: '2026-09-22', reason: 'Post-referral cardiology follow-up review', priority: 'Medium', status: 'Upcoming', instructions: 'Bring all specialist consultation notes and echo reports' },
        { id: 'fu-004', patientId: 'pt-kavita', patientName: 'Kavita Singh', dueDate: '2026-09-28', reason: 'Antenatal care 3rd trimester checkup & iron supplementation', priority: 'High', status: 'Upcoming', instructions: 'Bring ultrasound scan and maternal health card' },
      ];
      for (const f of fuToSeed) {
        await db.query(
          `INSERT INTO doctor_follow_ups (id, doctor_id, doctor_name, patient_id, patient_name, due_date, reason, department, instructions, priority, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [f.id, doctorId, doctorName, f.patientId, f.patientName, f.dueDate, f.reason, 'General Medicine', f.instructions, f.priority, f.status]
        );
      }
      console.log('[Seed] Doctor follow-ups seeded');
    }
  } catch (err: any) {
    console.error('[Seed Error] Failed to seed doctor clinical data:', err.message);
  }
}

export async function seedAshaData(): Promise<void> {
  try {
    const db = getDB();
    const ashaUser = await UserRepository.findByEmail('asha@pfis.org');
    const ashaId = ashaUser?.id || 'asha-kavita-devi';
    const ashaName = ashaUser?.name || 'Kavita Devi (ASHA Sangini)';

    // 1. ASHA Worker Profile
    const existingProfile = await db.query(`SELECT * FROM asha_profiles`);
    if (existingProfile.rows.length === 0) {
      await db.query(
        `INSERT INTO asha_profiles (id, user_id, asha_code, name, phone, email, zone, district, state, village, sub_centre, phc, block, assigned_area, assigned_villages, supervisor_name, supervisor_phone, total_patients_tracked, high_risk_patient_count, referrals_made, field_visits_this_month, certification_level, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
        [
          'asha-kavita-profile',
          ashaId,
          'ASHA-PB-KPT-104',
          'Kavita Devi',
          '+91 98765 33445',
          'asha@pfis.org',
          'Phagwara Rural Health Zone',
          'Kapurthala',
          'Punjab',
          'Rampur Kalan',
          'Rampur Sub-Centre',
          'Phagwara Rural PHC',
          'Phagwara',
          'Ward 4 & 5 (Households HH-01 to HH-15)',
          JSON.stringify(['Rampur Kalan', 'Dhadde', 'Bhojowal']),
          'Sister Nirmal Kaur (ANM)',
          '+91 98765 11223',
          48,
          6,
          11,
          24,
          'Advanced',
          true,
        ]
      );
      console.log('[Seed] ASHA profile seeded for Kavita Devi');
    }

    // 2. Frontline Households
    const existingHouseholds = await db.query(`SELECT * FROM frontline_households`);
    if (existingHouseholds.rows.length === 0) {
      const householdsToSeed = [
        {
          id: 'hh-001',
          householdId: 'HH-PB-01',
          address: 'House 12, Ward 4, Rampur Kalan',
          villageName: 'Rampur Kalan',
          subCentre: 'Rampur Sub-Centre',
          phc: 'Phagwara Rural PHC',
          block: 'Phagwara',
          district: 'Kapurthala',
          state: 'Punjab',
          assignedWorkerId: ashaId,
          assignedWorkerName: 'Kavita Devi',
          familyHead: 'Mohan Lal Sharma',
          familyHeadPhone: '+91 98765 44001',
          totalMembers: 4,
          members: JSON.stringify([
            { patientId: 'pt-demo-01', name: 'Mohan Lal Sharma', age: 62, gender: 'Male', relation: 'Head', chronicConditions: ['Hypertension'] },
            { patientId: 'pt-demo-02', name: 'Kamla Sharma', age: 58, gender: 'Female', relation: 'Wife', chronicConditions: ['Osteoarthritis'] },
            { name: 'Rajesh Sharma', age: 34, gender: 'Male', relation: 'Son' },
            { name: 'Pooja Sharma', age: 30, gender: 'Female', relation: 'Daughter-in-law' },
          ]),
          lastVisitDate: '2026-09-08',
          nextPlannedVisit: '2026-09-18',
          pendingTasksCount: 1,
          accessBarriers: JSON.stringify(['Transport cost to Civil Hospital']),
          coordinationStatus: 'Active',
          accessFrictionLevel: 'Moderate',
        },
        {
          id: 'hh-002',
          householdId: 'HH-PB-02',
          address: 'House 24, Near Gurudwara, Ward 4, Rampur Kalan',
          villageName: 'Rampur Kalan',
          subCentre: 'Rampur Sub-Centre',
          phc: 'Phagwara Rural PHC',
          block: 'Phagwara',
          district: 'Kapurthala',
          state: 'Punjab',
          assignedWorkerId: ashaId,
          assignedWorkerName: 'Kavita Devi',
          familyHead: 'Sunita Devi',
          familyHeadPhone: '+91 98765 44002',
          totalMembers: 3,
          members: JSON.stringify([
            { patientId: 'df934545-a5e1-4ed7-a0b4-faed1d13facb', name: 'Sunita Devi', age: 60, gender: 'Female', relation: 'Head', chronicConditions: ['Hypertension', 'T2DM'] },
            { name: 'Gurpreet Singh', age: 38, gender: 'Male', relation: 'Son' },
            { name: 'Simran Kaur', age: 34, gender: 'Female', relation: 'Daughter-in-law' },
          ]),
          lastVisitDate: '2026-09-11',
          nextPlannedVisit: '2026-09-15',
          pendingTasksCount: 2,
          accessBarriers: JSON.stringify(['Long distance to Civil Hospital', 'Transport unavailability']),
          coordinationStatus: 'Needs Assistance',
          accessFrictionLevel: 'High',
        },
        {
          id: 'hh-003',
          householdId: 'HH-PB-03',
          address: 'House 7, Post Office Gali, Ward 5, Rampur Kalan',
          villageName: 'Rampur Kalan',
          subCentre: 'Rampur Sub-Centre',
          phc: 'Phagwara Rural PHC',
          block: 'Phagwara',
          district: 'Kapurthala',
          state: 'Punjab',
          assignedWorkerId: ashaId,
          assignedWorkerName: 'Kavita Devi',
          familyHead: 'Amrik Chand',
          familyHeadPhone: '+91 98765 44003',
          totalMembers: 5,
          members: JSON.stringify([
            { patientId: 'pt-amrik', name: 'Amrik Chand', age: 64, gender: 'Male', relation: 'Head', chronicConditions: ['Uncontrolled Type 2 Diabetes', 'Diabetic Neuropathy'] },
            { name: 'Bimla Rani', age: 60, gender: 'Female', relation: 'Wife' },
            { name: 'Suresh Kumar', age: 36, gender: 'Male', relation: 'Son' },
            { name: 'Neetu Rani', age: 32, gender: 'Female', relation: 'Daughter-in-law' },
            { name: 'Master Rohit', age: 6, gender: 'Male', relation: 'Grandson' },
          ]),
          lastVisitDate: '2026-09-09',
          nextPlannedVisit: '2026-09-12',
          pendingTasksCount: 2,
          accessBarriers: JSON.stringify(['Digital literacy barrier for OPD booking']),
          coordinationStatus: 'Follow-up Due',
          accessFrictionLevel: 'High',
        },
        {
          id: 'hh-004',
          householdId: 'HH-PB-04',
          address: 'House 41, Canal Road, Ward 5, Rampur Kalan',
          villageName: 'Rampur Kalan',
          subCentre: 'Rampur Sub-Centre',
          phc: 'Phagwara Rural PHC',
          block: 'Phagwara',
          district: 'Kapurthala',
          state: 'Punjab',
          assignedWorkerId: ashaId,
          assignedWorkerName: 'Kavita Devi',
          familyHead: 'Harpreet Singh',
          familyHeadPhone: '+91 98765 44004',
          totalMembers: 4,
          members: JSON.stringify([
            { patientId: 'pt-harpreet', name: 'Harpreet Singh', age: 52, gender: 'Male', relation: 'Head', chronicConditions: ['Post-Cardiac Evaluation', 'Angina'] },
            { name: 'Manjit Kaur', age: 48, gender: 'Female', relation: 'Wife' },
            { name: 'Jaspreet Singh', age: 24, gender: 'Male', relation: 'Son' },
            { name: 'Navneet Kaur', age: 20, gender: 'Female', relation: 'Daughter' },
          ]),
          lastVisitDate: '2026-09-05',
          nextPlannedVisit: '2026-09-13',
          pendingTasksCount: 1,
          accessBarriers: JSON.stringify(['Specialist cardiologist appointment delay']),
          coordinationStatus: 'Needs Assistance',
          accessFrictionLevel: 'High',
        },
        {
          id: 'hh-005',
          householdId: 'HH-PB-05',
          address: 'House 18, Ward 4, Rampur Kalan',
          villageName: 'Rampur Kalan',
          subCentre: 'Rampur Sub-Centre',
          phc: 'Phagwara Rural PHC',
          block: 'Phagwara',
          district: 'Kapurthala',
          state: 'Punjab',
          assignedWorkerId: ashaId,
          assignedWorkerName: 'Kavita Devi',
          familyHead: 'Balwinder Kaur',
          familyHeadPhone: '+91 98765 44005',
          totalMembers: 2,
          members: JSON.stringify([
            { patientId: 'pt-balwinder', name: 'Balwinder Kaur', age: 68, gender: 'Female', relation: 'Head', chronicConditions: ['Hypertension', 'Elderly Mobility Limitation'] },
            { name: 'Daljit Singh', age: 42, gender: 'Male', relation: 'Son' },
          ]),
          lastVisitDate: '2026-09-07',
          nextPlannedVisit: '2026-09-17',
          pendingTasksCount: 1,
          accessBarriers: JSON.stringify(['Elderly mobility constraint']),
          coordinationStatus: 'Active',
          accessFrictionLevel: 'Moderate',
        },
        {
          id: 'hh-006',
          householdId: 'HH-PB-06',
          address: 'House 55, Primary School Road, Rampur Kalan',
          villageName: 'Rampur Kalan',
          subCentre: 'Rampur Sub-Centre',
          phc: 'Phagwara Rural PHC',
          block: 'Phagwara',
          district: 'Kapurthala',
          state: 'Punjab',
          assignedWorkerId: ashaId,
          assignedWorkerName: 'Kavita Devi',
          familyHead: 'Deepak Shinde',
          familyHeadPhone: '+91 98765 44006',
          totalMembers: 3,
          members: JSON.stringify([
            { name: 'Deepak Shinde', age: 28, gender: 'Male', relation: 'Head' },
            { patientId: 'pt-anandi', name: 'Anandi Shinde', age: 24, gender: 'Female', relation: 'Wife', chronicConditions: ['3rd Trimester High-Risk Pregnancy', 'Severe Anemia'] },
            { name: 'Master Aarav Shinde', age: 2, gender: 'Male', relation: 'Son' },
          ]),
          lastVisitDate: '2026-09-10',
          nextPlannedVisit: '2026-09-14',
          pendingTasksCount: 2,
          accessBarriers: JSON.stringify(['Private diagnostic ultrasound cost']),
          coordinationStatus: 'Needs Assistance',
          accessFrictionLevel: 'Critical',
        },
      ];

      for (const h of householdsToSeed) {
        await db.query(
          `INSERT INTO frontline_households (id, household_id, address, village_name, sub_centre, phc, block, district, state, assigned_worker_id, assigned_worker_name, family_head, family_head_phone, total_members, members, last_visit_date, next_planned_visit, pending_tasks_count, access_barriers, coordination_status, access_friction_level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
          [h.id, h.householdId, h.address, h.villageName, h.subCentre, h.phc, h.block, h.district, h.state, h.assignedWorkerId, h.assignedWorkerName, h.familyHead, h.familyHeadPhone, h.totalMembers, h.members, h.lastVisitDate, h.nextPlannedVisit, h.pendingTasksCount, h.accessBarriers, h.coordinationStatus, h.accessFrictionLevel]
        );
      }
      console.log('[Seed] Frontline households seeded');
    }

    // 3. Frontline Visits
    const existingVisits = await db.query(`SELECT * FROM frontline_visits`);
    if (existingVisits.rows.length === 0) {
      const visitsToSeed = [
        {
          id: 'fv-101',
          household_id: 'HH-PB-02',
          patient_id: 'df934545-a5e1-4ed7-a0b4-faed1d13facb',
          patient_name: 'Sunita Devi',
          village_name: 'Rampur Kalan',
          assigned_worker_id: ashaId,
          assigned_worker_name: 'Kavita Devi',
          facility_id: 'hosp-phc',
          facility_name: 'Phagwara Rural PHC',
          visit_type: 'ANC & NCD Doorstep Check',
          scheduled_date: 'Today, 10:30 AM',
          status: 'IN_PROGRESS',
          priority: 'Urgent',
          accessibility_barriers: JSON.stringify(['Long distance to Civil Hospital', 'Public transport delay']),
          transport_barriers: 'No morning direct bus to Phagwara PHC',
          notes: 'Record digital BP, verify Amlodipine 5mg stock, assist with doctor follow-up.',
          started_at: new Date().toISOString(),
        },
        {
          id: 'fv-102',
          household_id: 'HH-PB-03',
          patient_id: 'pt-amrik',
          patient_name: 'Amrik Chand',
          village_name: 'Rampur Kalan',
          assigned_worker_id: ashaId,
          assigned_worker_name: 'Kavita Devi',
          facility_id: 'hosp-phc',
          facility_name: 'Phagwara Rural PHC',
          visit_type: 'T2DM Medicine Adherence & Diet Guidance',
          scheduled_date: 'Today, 02:00 PM',
          status: 'SCHEDULED',
          priority: 'High',
          accessibility_barriers: JSON.stringify(['Digital literacy barrier for OPD booking']),
          transport_barriers: 'None',
          notes: 'Check fasting glucose log, guide on foot care, generate live OPD token #106.',
        },
        {
          id: 'fv-103',
          household_id: 'HH-PB-06',
          patient_id: 'pt-aarav',
          patient_name: 'Master Aarav Shinde',
          village_name: 'Rampur Kalan',
          assigned_worker_id: ashaId,
          assigned_worker_name: 'Kavita Devi',
          facility_id: 'hosp-phc',
          facility_name: 'Phagwara Rural PHC',
          visit_type: 'National Immunization Follow-up',
          scheduled_date: 'Today, 04:30 PM',
          status: 'COMPLETED',
          priority: 'Routine',
          accessibility_barriers: JSON.stringify([]),
          transport_barriers: 'None',
          notes: 'Verified Pentavalent-3 and OPV-3 in MCP card at Anganwadi-2. Mother briefed on mild fever protocol.',
          completed_at: new Date().toISOString(),
        },
        {
          id: 'fv-104',
          household_id: 'HH-PB-04',
          patient_id: 'pt-harpreet',
          patient_name: 'Harpreet Singh',
          village_name: 'Rampur Kalan',
          assigned_worker_id: ashaId,
          assigned_worker_name: 'Kavita Devi',
          facility_id: 'hosp-default',
          facility_name: 'Civil Hospital Kapurthala',
          visit_type: 'Post-Cardiac Discharge Follow-up',
          scheduled_date: 'Yesterday, 11:00 AM',
          status: 'MISSED',
          priority: 'Urgent',
          accessibility_barriers: JSON.stringify(['Emergency transport difficulty', 'Specialist appointment delay']),
          transport_barriers: 'Canal road bus suspension',
          notes: 'Patient was out of station for family emergency. Rescheduled for tomorrow morning with assisted appointment.',
        },
        {
          id: 'fv-105',
          household_id: 'HH-PB-06',
          patient_id: 'pt-anandi',
          patient_name: 'Anandi Shinde',
          village_name: 'Rampur Kalan',
          assigned_worker_id: ashaId,
          assigned_worker_name: 'Kavita Devi',
          facility_id: 'hosp-default',
          facility_name: 'Civil Hospital Kapurthala',
          visit_type: 'Maternal ANC Guidance & Transport Readiness',
          scheduled_date: 'Tomorrow, 10:00 AM',
          status: 'SCHEDULED',
          priority: 'High',
          accessibility_barriers: JSON.stringify(['Private diagnostic ultrasound cost']),
          transport_barriers: 'Janani Shishu 102 route confirmation needed',
          notes: 'Verify IFA tablet consumption, check pedal edema, confirm 102 ambulance route for delivery preparedness.',
        },
      ];

      for (const v of visitsToSeed) {
        await db.query(
          `INSERT INTO frontline_visits (id, household_id, patient_id, patient_name, village_name, assigned_worker_id, assigned_worker_name, facility_id, facility_name, visit_type, scheduled_date, status, priority, accessibility_barriers, transport_barriers, notes, started_at, completed_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
          [v.id, v.household_id, v.patient_id, v.patient_name, v.village_name, v.assigned_worker_id, v.assigned_worker_name, v.facility_id, v.facility_name, v.visit_type, v.scheduled_date, v.status, v.priority, v.accessibility_barriers, v.transport_barriers, v.notes, v.started_at || null, v.completed_at || null]
        );
      }
      console.log('[Seed] Frontline visits seeded');
    }

    // 4. Access Barriers
    const existingBarriers = await db.query(`SELECT * FROM access_barriers`);
    if (existingBarriers.rows.length === 0) {
      const barriersToSeed = [
        {
          id: 'bar-01',
          workerId: ashaId,
          workerName: 'Kavita Devi',
          patientId: 'df934545-a5e1-4ed7-a0b4-faed1d13facb',
          patientName: 'Sunita Devi',
          householdId: 'HH-PB-02',
          villageName: 'Rampur Kalan',
          category: 'TRANSPORT',
          barrierType: 'Long travel distance (32 km to Civil Hospital with no direct morning bus)',
          details: 'Patient misses scheduled morning OPD sessions due to lack of morning bus frequency.',
          frictionScore: 'High',
          status: 'Action Plan Created',
          actionTaken: 'Enrolled for 102 Janani Shishu shared transport & assisted local PHC teleconsultation.',
        },
        {
          id: 'bar-02',
          workerId: ashaId,
          workerName: 'Kavita Devi',
          patientId: 'pt-anandi',
          patientName: 'Anandi Shinde',
          householdId: 'HH-PB-06',
          villageName: 'Rampur Kalan',
          category: 'COST',
          barrierType: 'Diagnostic test fee affordability issue for ultrasound & renal Doppler',
          details: 'Unable to afford private imaging centre charges after referral.',
          frictionScore: 'Moderate',
          status: 'Coordination In Progress',
          actionTaken: 'Routed to Civil Hospital free NCD diagnostic scheme under Ayushman Bharat.',
        },
        {
          id: 'bar-03',
          workerId: ashaId,
          workerName: 'Kavita Devi',
          patientId: 'pt-amrik',
          patientName: 'Amrik Chand',
          householdId: 'HH-PB-03',
          villageName: 'Rampur Kalan',
          category: 'DIGITAL ACCESS',
          barrierType: 'No smartphone or internet access for digital token booking',
          details: 'Family head does not possess a smartphone; reliant on frontline worker for queue tokens.',
          frictionScore: 'Moderate',
          status: 'Resolved',
          actionTaken: 'ASHA generated live OPD Token #106 directly through frontline desk.',
        },
        {
          id: 'bar-04',
          workerId: ashaId,
          workerName: 'Kavita Devi',
          patientId: 'pt-harpreet',
          patientName: 'Harpreet Singh',
          householdId: 'HH-PB-04',
          villageName: 'Rampur Kalan',
          category: 'AVAILABILITY',
          barrierType: 'Specialist cardiologist OPD slots fully booked for next 3 weeks',
          details: 'Patient discharged after acute cardiac event requires urgent specialist review within 7 days.',
          frictionScore: 'High',
          status: 'Action Plan Created',
          actionTaken: 'Submitted priority referral escalation to Nodal Medical Officer.',
        },
      ];

      for (const b of barriersToSeed) {
        await db.query(
          `INSERT INTO access_barriers (id, worker_id, worker_name, patient_id, patient_name, household_id, village_name, category, barrier_type, details, friction_score, status, action_taken, reported_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [b.id, b.workerId, b.workerName, b.patientId, b.patientName, b.householdId, b.villageName, b.category, b.barrierType, b.details, b.frictionScore, b.status, b.actionTaken, new Date().toISOString()]
        );
      }
      console.log('[Seed] Access barriers seeded');
    }

    // 5. Escalations
    const existingEscalations = await db.query(`SELECT * FROM escalations`);
    if (existingEscalations.rows.length === 0) {
      const escalationsToSeed = [
        {
          id: 'esc-01',
          worker_id: ashaId,
          worker_name: 'Kavita Devi',
          patient_id: 'df934545-a5e1-4ed7-a0b4-faed1d13facb',
          patient_name: 'Sunita Devi',
          household_id: 'HH-PB-02',
          village_name: 'Rampur Kalan',
          type: 'HIGH_ACCESS_PRIORITY',
          urgency: 'High',
          reason: 'Bridge repair on Phagwara rural canal road completely blocking public transit access to Sub-centre.',
          reported_observations: 'Patient unable to reach monthly hypertensive review due to 12km transit blockage.',
          routed_to_role: 'Block Health Officer',
          status: 'Dispatched',
        },
        {
          id: 'esc-02',
          worker_id: ashaId,
          worker_name: 'Kavita Devi',
          patient_id: 'pt-amrik',
          patient_name: 'Amrik Chand',
          household_id: 'HH-PB-03',
          village_name: 'Rampur Kalan',
          type: 'CLINICAL_CONCERN',
          urgency: 'Emergency',
          reason: 'Beneficiary reports sudden blurred vision and bilateral severe pedal swelling with blood pressure 178/104 mmHg.',
          reported_observations: 'Marked pedal edema extending to mid-calf, patient reports dizziness and fatigue.',
          routed_to_role: 'Doctor',
          routed_to_facility: 'Phagwara Rural PHC',
          clinical_review_status: 'Under Clinical Evaluation',
          clinical_notes: 'Referred to Dr. Priya Sharma for immediate emergency glycemic stabilization.',
          status: 'In Review',
        },
      ];

      for (const e of escalationsToSeed) {
        await db.query(
          `INSERT INTO escalations (id, worker_id, worker_name, patient_id, patient_name, household_id, village_name, type, urgency, reason, reported_observations, routed_to_role, routed_to_facility, clinical_review_status, clinical_notes, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
          [e.id, e.worker_id, e.worker_name, e.patient_id, e.patient_name, e.household_id, e.village_name, e.type, e.urgency, e.reason, e.reported_observations, e.routed_to_role, e.routed_to_facility || null, e.clinical_review_status || null, e.clinical_notes || null, e.status, new Date().toISOString()]
        );
      }
      console.log('[Seed] Escalations seeded');
    }

    // 6. Frontline Audit Events
    const existingAudits = await db.query(`SELECT * FROM frontline_audit_events`);
    if (existingAudits.rows.length === 0) {
      const auditsToSeed = [
        { id: 'aud-fl-01', resource_type: 'VISIT', resource_id: 'fv-101', actor_id: ashaId, actor_name: 'Kavita Devi', actor_role: 'ASHA', action: 'VISIT_STARTED', previous_status: 'SCHEDULED', new_status: 'IN_PROGRESS', notes: 'Field visit started at Sunita Devi household (Ward 4)' },
        { id: 'aud-fl-02', resource_type: 'BARRIER', resource_id: 'bar-01', actor_id: ashaId, actor_name: 'Kavita Devi', actor_role: 'ASHA', action: 'BARRIER_RECORDED', previous_status: null, new_status: 'Identified', notes: 'Transport barrier recorded: 32km distance to Civil Hospital' },
        { id: 'aud-fl-03', resource_type: 'TOKEN', resource_id: 'tok-106', actor_id: ashaId, actor_name: 'Kavita Devi', actor_role: 'ASHA', action: 'TOKEN_REQUESTED', previous_status: null, new_status: 'WAITING', notes: 'OPD Token #106 generated on behalf of Amrik Chand' },
      ];
      for (const a of auditsToSeed) {
        await db.query(
          `INSERT INTO frontline_audit_events (id, resource_type, resource_id, actor_id, actor_name, actor_role, action, previous_status, new_status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [a.id, a.resource_type, a.resource_id, a.actor_id, a.actor_name, a.actor_role, a.action, a.previous_status, a.new_status, a.notes]
        );
      }
      console.log('[Seed] Frontline audit events seeded');
    }
  } catch (err: any) {
    console.error('[Seed Error] Failed to seed ASHA frontline data:', err.message);
  }
}


