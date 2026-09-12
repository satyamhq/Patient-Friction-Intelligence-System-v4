-- ==========================================================
-- PATIENT FRICTION INTELLIGENCE SYSTEM (PFIS) - DATABASE SCHEMA
-- Compatible with PostgreSQL & MySQL (ANSI SQL Standard)
-- 13 Relational Tables with Foreign Keys and Indexes
-- ==========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'patient', -- 'patient', 'hospital', 'admin'
    phone VARCHAR(64),
    google_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. PATIENT PROFILES (Non-Clinical Operational & Accessibility Parameters)
CREATE TABLE IF NOT EXISTS patient_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    age INT DEFAULT 45,
    gender VARCHAR(32) DEFAULT 'Other',
    location VARCHAR(255) DEFAULT 'Rural',
    is_rural BOOLEAN DEFAULT TRUE,
    distance_to_hospital_km DECIMAL(6,2) DEFAULT 25.0,
    transport_mode VARCHAR(64) DEFAULT 'Bus',
    digital_literacy VARCHAR(64) DEFAULT 'Low',
    family_support VARCHAR(64) DEFAULT 'Moderate',
    wage_loss_risk VARCHAR(64) DEFAULT 'High',
    preferred_language VARCHAR(32) DEFAULT 'en',
    smartphone_access BOOLEAN DEFAULT TRUE,
    internet_type VARCHAR(64) DEFAULT 'Mobile 4G',
    disability_needs TEXT,
    appointment_flexibility VARCHAR(64) DEFAULT 'Morning Only',
    document_readiness VARCHAR(64) DEFAULT 'Partial',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON patient_profiles(user_id);

-- 3. HOSPITALS (Healthcare Access Facilities)
CREATE TABLE IF NOT EXISTS hospitals (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(64) DEFAULT 'General',
    city VARCHAR(128) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10,6) NOT NULL,
    longitude DECIMAL(10,6) NOT NULL,
    phone VARCHAR(64),
    total_beds INT DEFAULT 100,
    available_beds INT DEFAULT 25,
    emergency_24x7 BOOLEAN DEFAULT TRUE,
    teleconsult_available BOOLEAN DEFAULT TRUE,
    accessibility_facilities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hospitals_city ON hospitals(city);

-- 4. HOSPITAL SERVICES (Departments, Token Capacities & Non-Clinical Services)
CREATE TABLE IF NOT EXISTS hospital_services (
    id VARCHAR(64) PRIMARY KEY,
    hospital_id VARCHAR(64) NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(128) NOT NULL,
    total_daily_tokens INT DEFAULT 50,
    available_tokens INT DEFAULT 20,
    fee DECIMAL(8,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_services_hospital ON hospital_services(hospital_id);

-- 5. APPOINTMENTS (Non-Clinical Scheduling & Token Allocations)
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_id VARCHAR(64) NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    service_id VARCHAR(64) REFERENCES hospital_services(id) ON DELETE SET NULL,
    scheduled_date VARCHAR(64) NOT NULL,
    time_slot VARCHAR(64) NOT NULL,
    token_number INT,
    status VARCHAR(32) DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Completed', 'Cancelled'
    friction_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_hospital ON appointments(hospital_id);

-- 6. TELECONSULTATIONS (Live Remote Navigation Sessions)
CREATE TABLE IF NOT EXISTS teleconsultations (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_name VARCHAR(255) NOT NULL,
    specialty VARCHAR(128) NOT NULL,
    scheduled_time VARCHAR(64) NOT NULL,
    status VARCHAR(32) DEFAULT 'Scheduled', -- 'Scheduled', 'In-Progress', 'Completed', 'Cancelled'
    room_id VARCHAR(128) NOT NULL,
    channel_type VARCHAR(32) DEFAULT 'Video', -- 'Video', 'Audio'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_teleconsult_patient ON teleconsultations(patient_id);

-- 7. FRICTION PROFILES (Explainable Non-Clinical Barrier Scores)
CREATE TABLE IF NOT EXISTS friction_profiles (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    overall_score DECIMAL(5,2) NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'Low Friction', 'Moderate Friction', 'High Friction', 'Critical Access Difficulty'
    journey_completion_prob DECIMAL(5,2) NOT NULL,
    primary_barrier VARCHAR(128) NOT NULL,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_friction_patient ON friction_profiles(patient_id);

-- 8. FRICTION FACTORS (Decomposed Operational Attributes)
CREATE TABLE IF NOT EXISTS friction_factors (
    id VARCHAR(64) PRIMARY KEY,
    friction_profile_id VARCHAR(64) NOT NULL REFERENCES friction_profiles(id) ON DELETE CASCADE,
    factor_name VARCHAR(128) NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    explanation TEXT NOT NULL,
    suggested_intervention TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_factors_profile ON friction_factors(friction_profile_id);

-- 9. ACCESSIBILITY RISKS (Mitigation Strategies)
CREATE TABLE IF NOT EXISTS accessibility_risks (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    risk_level VARCHAR(32) NOT NULL,
    barrier_title VARCHAR(255) NOT NULL,
    explanation TEXT NOT NULL,
    mitigation_action TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_risks_patient ON accessibility_risks(patient_id);

-- 10. REQUESTS (Support, Transit, Appointment & Escort Inquiries)
CREATE TABLE IF NOT EXISTS requests (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hospital_id VARCHAR(64) REFERENCES hospitals(id) ON DELETE SET NULL,
    request_type VARCHAR(64) NOT NULL, -- 'Appointment', 'Teleconsultation', 'Accessibility Support', 'Transport Support', 'Document Assistance'
    status VARCHAR(32) DEFAULT 'Pending', -- 'Pending', 'Processing', 'Approved', 'Completed', 'Cancelled'
    details TEXT,
    priority VARCHAR(32) DEFAULT 'Standard',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_requests_patient ON requests(patient_id);

-- 11. DOCUMENTS (Vault for Identification & Non-Clinical Records)
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL, -- 'ID Proof', 'Medical Document', 'Appointment Document', 'Insurance', 'Other'
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_kb DECIMAL(8,2) DEFAULT 120.0,
    mime_type VARCHAR(64) DEFAULT 'application/pdf',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_patient ON documents(patient_id);

-- 12. NOTIFICATIONS (Live Operational Status Alerts)
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(64) DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- 13. AUDIT LOGS (Compliance & Access Tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    ip_address VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);

-- 14. PUBLIC HEALTH TRIAGE (Operational & Clinical Tier Routing)
CREATE TABLE IF NOT EXISTS public_health_triage (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    chief_complaint TEXT NOT NULL,
    acuity_level VARCHAR(32) NOT NULL, -- 'Emergency', 'Urgent', 'Routine', 'Preventive'
    recommended_tier VARCHAR(64) NOT NULL, -- 'Sub-Centre / AAM', 'Primary Health Centre (PHC)', 'Rural Hospital (RH) / CHC', 'District Hospital / Medical College', '108 Emergency'
    recommended_hospital_id VARCHAR(64) REFERENCES hospitals(id) ON DELETE SET NULL,
    symptoms_json TEXT,
    vitals_json TEXT,
    operational_barriers_json TEXT,
    triage_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. REFERRALS (Multi-Tier Public Health Continuity)
CREATE TABLE IF NOT EXISTS referrals (
    id VARCHAR(64) PRIMARY KEY,
    referral_code VARCHAR(64) UNIQUE NOT NULL,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    from_facility_id VARCHAR(64) NOT NULL REFERENCES hospitals(id),
    from_facility_name VARCHAR(255) NOT NULL,
    from_tier VARCHAR(64) NOT NULL,
    to_facility_id VARCHAR(64) NOT NULL REFERENCES hospitals(id),
    to_facility_name VARCHAR(255) NOT NULL,
    to_tier VARCHAR(64) NOT NULL,
    specialty_required VARCHAR(128) NOT NULL,
    reason_for_referral TEXT NOT NULL,
    priority VARCHAR(32) NOT NULL DEFAULT 'Routine', -- 'Routine', 'Urgent', 'Emergency'
    transport_mode VARCHAR(64) DEFAULT 'Public Bus', -- '108 Emergency Ambulance', '102 Janani Shishu Express', 'Public Bus', 'Private Vehicle'
    status VARCHAR(32) NOT NULL DEFAULT 'Initiated', -- 'Initiated', 'In Transit', 'Arrived', 'Specialist Consulted', 'Completed', 'Counter-Referred'
    counter_referral_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. HEALTH RECORDS (Longitudinal Interoperable Care & ABHA)
CREATE TABLE IF NOT EXISTS health_records (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    abha_id VARCHAR(64),
    facility_id VARCHAR(64) REFERENCES hospitals(id),
    facility_name VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    record_type VARCHAR(64) NOT NULL, -- 'OPD Consultation', 'Diagnostic Report', 'Prescription', 'Immunization', 'Discharge Summary', 'Referral Note', 'Follow-up Visit'
    record_date VARCHAR(64) NOT NULL,
    diagnosis TEXT NOT NULL,
    record_source VARCHAR(64) DEFAULT 'patient_entered', -- 'patient_entered', 'hospital_verified', 'abdm_imported', 'patient_uploaded'
    vitals_json TEXT,
    prescription_json TEXT,
    notes TEXT,
    document_url TEXT,
    fhir_bundle_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16A. PATIENT ABHA INTEGRATION & IDENTITY (Official ABDM Connection State)
CREATE TABLE IF NOT EXISTS patient_abha (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(32) NOT NULL DEFAULT 'not_connected', -- 'not_connected', 'pending', 'connected', 'verified', 'unavailable', 'failed'
    abha_number VARCHAR(64),
    abha_address VARCHAR(128),
    name VARCHAR(255),
    dob VARCHAR(64),
    gender VARCHAR(32),
    state VARCHAR(64),
    verification_status VARCHAR(64) DEFAULT 'ABHA not connected',
    qr_data TEXT,
    last_sync_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16B. HEALTH RECORD CONSENTS (Patient-Controlled Data Sharing)
CREATE TABLE IF NOT EXISTS health_record_consents (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requester_name VARCHAR(255) NOT NULL,
    data_scope VARCHAR(128) NOT NULL, -- 'all_records', 'opd_only', 'diagnostic_reports', 'prescriptions_only'
    status VARCHAR(32) NOT NULL DEFAULT 'active', -- 'active', 'revoked', 'expired'
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16C. HEALTH RECORD AUDIT TRAIL (Immutable Access Logging)
CREATE TABLE IF NOT EXISTS health_record_audit_events (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL, -- 'RECORD_REQUESTED', 'CONSENT_CHECKED', 'RECORD_ACCESSED', 'RECORD_EXPORTED', 'VISIT_ENTRY_CREATED', 'ABHA_CONNECTION_CHANGED'
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(32) NOT NULL DEFAULT 'patient',
    record_id VARCHAR(64),
    result VARCHAR(32) NOT NULL DEFAULT 'SUCCESS', -- 'ALLOWED', 'DENIED', 'SUCCESS', 'FAILED'
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. DIAGNOSTICS & EQUIPMENT STATUS
-- equipment_status: FUNCTIONAL | UNDER_MAINTENANCE | OUT_OF_SERVICE | UNKNOWN
-- availability_status: AVAILABLE | UNAVAILABLE | UNKNOWN
-- booking_status: AVAILABLE | UNAVAILABLE | UNKNOWN
-- verification_status: VERIFIED | PENDING_VERIFICATION | UNVERIFIED | UNAVAILABLE
CREATE TABLE IF NOT EXISTS diagnostics (
    id VARCHAR(64) PRIMARY KEY,
    facility_id VARCHAR(64) NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    facility_name VARCHAR(255) NOT NULL,
    facility_tier VARCHAR(64) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL, -- 'Pathology', 'Radiology', 'Cardiology', 'Microbiology', 'Other'
    description TEXT,
    equipment_status VARCHAR(32) NOT NULL DEFAULT 'UNKNOWN', -- 'FUNCTIONAL', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE', 'UNKNOWN'
    availability_status VARCHAR(32) NOT NULL DEFAULT 'UNKNOWN', -- 'AVAILABLE', 'UNAVAILABLE', 'UNKNOWN'
    booking_status VARCHAR(32) NOT NULL DEFAULT 'UNKNOWN', -- 'AVAILABLE', 'UNAVAILABLE', 'UNKNOWN'
    technician_available BOOLEAN DEFAULT NULL, -- NULL = unknown
    fee DECIMAL(10,2) DEFAULT NULL, -- NULL = not available/not verified
    currency VARCHAR(8) DEFAULT 'INR',
    fee_verified BOOLEAN DEFAULT FALSE,
    opening_time VARCHAR(32) DEFAULT NULL, -- NULL = unavailable
    closing_time VARCHAR(32) DEFAULT NULL, -- NULL = unavailable
    tat_hours INT DEFAULT NULL, -- NULL = unknown turnaround time
    verification_status VARCHAR(32) NOT NULL DEFAULT 'UNVERIFIED', -- 'VERIFIED', 'PENDING_VERIFICATION', 'UNVERIFIED', 'UNAVAILABLE'
    source VARCHAR(128) DEFAULT 'facility_reported',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_diagnostics_facility ON diagnostics(facility_id);
CREATE INDEX IF NOT EXISTS idx_diagnostics_category ON diagnostics(category);
CREATE INDEX IF NOT EXISTS idx_diagnostics_status ON diagnostics(availability_status);

-- 18. DIAGNOSTIC BOOKINGS
CREATE TABLE IF NOT EXISTS diagnostic_bookings (
    id VARCHAR(64) PRIMARY KEY,
    booking_number VARCHAR(64) UNIQUE NOT NULL,
    diagnostic_id VARCHAR(64) NOT NULL REFERENCES diagnostics(id) ON DELETE CASCADE,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    facility_id VARCHAR(64) REFERENCES hospitals(id),
    facility_name VARCHAR(255) NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    requested_date VARCHAR(64) NOT NULL,
    requested_time VARCHAR(32) DEFAULT NULL,
    accessibility_notes TEXT DEFAULT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED', -- 'SUBMITTED', 'ACCEPTED', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'REJECTED'
    rejection_reason TEXT DEFAULT NULL,
    report_url TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_diag_bookings_patient ON diagnostic_bookings(patient_id);
CREATE INDEX IF NOT EXISTS idx_diag_bookings_diagnostic ON diagnostic_bookings(diagnostic_id);

-- 18b. DIAGNOSTIC AUDIT EVENTS
CREATE TABLE IF NOT EXISTS diagnostic_audit_events (
    id VARCHAR(64) PRIMARY KEY,
    diagnostic_id VARCHAR(64) REFERENCES diagnostics(id) ON DELETE SET NULL,
    facility_id VARCHAR(64) REFERENCES hospitals(id) ON DELETE SET NULL,
    booking_id VARCHAR(64) REFERENCES diagnostic_bookings(id) ON DELETE SET NULL,
    event_type VARCHAR(64) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(64) NOT NULL DEFAULT 'patient',
    previous_state TEXT DEFAULT NULL,
    new_state TEXT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_diag_audit_diagnostic ON diagnostic_audit_events(diagnostic_id);
CREATE INDEX IF NOT EXISTS idx_diag_audit_booking ON diagnostic_audit_events(booking_id);

-- 19. ESSENTIAL MEDICINES (Verified Facility Inventory)
CREATE TABLE IF NOT EXISTS essential_medicines (
    id VARCHAR(64) PRIMARY KEY,
    facility_id VARCHAR(64) NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
    facility_name VARCHAR(255) NOT NULL,
    facility_tier VARCHAR(64) NOT NULL,
    medicine_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255) NOT NULL,
    category VARCHAR(128) NOT NULL, -- 'Antibiotic', 'Analgesic', 'Anti-Hypertensive', 'Anti-Diabetic', 'Maternal Health', 'Emergency / Antidote', 'Vaccine'
    dosage_form VARCHAR(64) NOT NULL, -- 'Tablet', 'Syrup', 'Injection', 'Capsule', 'Sachet'
    stock_count INT DEFAULT NULL, -- NULL = stock quantity unavailable
    min_threshold INT NOT NULL DEFAULT 20,
    status VARCHAR(32) NOT NULL DEFAULT 'In Stock', -- 'In Stock', 'Low Stock', 'Out of Stock', 'Availability Unknown'
    dispensing_method VARCHAR(64) NOT NULL DEFAULT 'OPD dispensing', -- 'OPD dispensing', 'Walk-in available', 'Appointment required', 'Emergency only', 'Unknown'
    batch_number VARCHAR(64),
    expiry_date VARCHAR(64),
    source VARCHAR(128) DEFAULT 'facility_reported',
    verification_status VARCHAR(32) NOT NULL DEFAULT 'VERIFIED', -- 'VERIFIED', 'PENDING_VERIFICATION', 'UNVERIFIED'
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_essential_meds_facility ON essential_medicines(facility_id);
CREATE INDEX IF NOT EXISTS idx_essential_meds_category ON essential_medicines(category);
CREATE INDEX IF NOT EXISTS idx_essential_meds_status ON essential_medicines(status);

-- 19b. MEDICINE AUDIT EVENTS
CREATE TABLE IF NOT EXISTS medicine_audit_events (
    id VARCHAR(64) PRIMARY KEY,
    medicine_id VARCHAR(64) REFERENCES essential_medicines(id) ON DELETE SET NULL,
    facility_id VARCHAR(64) REFERENCES hospitals(id) ON DELETE SET NULL,
    previous_quantity INT,
    new_quantity INT,
    previous_status VARCHAR(32),
    new_status VARCHAR(32),
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(64) NOT NULL DEFAULT 'hospital',
    reason TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_med_audit_medicine ON medicine_audit_events(medicine_id);
CREATE INDEX IF NOT EXISTS idx_med_audit_facility ON medicine_audit_events(facility_id);

-- 20. HIGH-RISK REGISTRY (Maternal, Child & Chronic NCDs)
CREATE TABLE IF NOT EXISTS high_risk_registry (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    cohort_type VARCHAR(64) NOT NULL, -- 'Maternal (HRP)', 'Child (Immunization)', 'Chronic NCD (Hypertension)', 'Chronic NCD (Diabetes)', 'Tuberculosis (DOTS)'
    risk_level VARCHAR(32) NOT NULL DEFAULT 'Moderate', -- 'High Risk', 'Moderate Risk', 'Critical'
    primary_condition VARCHAR(255) NOT NULL,
    current_milestone VARCHAR(255) NOT NULL,
    next_due_date VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Active', -- 'Active', 'Overdue', 'Completed', 'Escalated'
    assigned_asha_name VARCHAR(255),
    assigned_facility_id VARCHAR(64) REFERENCES hospitals(id),
    follow_up_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20b. HIGH-RISK AUDIT EVENTS (immutable audit trail)
CREATE TABLE IF NOT EXISTS high_risk_audit_events (
    id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) NOT NULL,
    actor_id VARCHAR(64),
    actor_name VARCHAR(255),
    actor_role VARCHAR(64),
    action VARCHAR(64) NOT NULL, -- 'CASE_CREATED', 'STATUS_CHANGED', 'NOTES_UPDATED', 'ASSIGNMENT_CHANGED'
    previous_status VARCHAR(64),
    new_status VARCHAR(64),
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hr_audit_case ON high_risk_audit_events(case_id);

-- 21. FRONTLINE OPERATIONAL VISITS & HOUSEHOLDS (ASHA / ANM / CHO)
CREATE TABLE IF NOT EXISTS frontline_visits (
    id VARCHAR(64) PRIMARY KEY,
    household_id VARCHAR(64) NOT NULL,
    patient_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    patient_name VARCHAR(255) NOT NULL,
    village_name VARCHAR(255) NOT NULL,
    assigned_worker_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_worker_name VARCHAR(255) NOT NULL,
    facility_id VARCHAR(64) REFERENCES hospitals(id) ON DELETE SET NULL,
    facility_name VARCHAR(255),
    visit_type VARCHAR(64) NOT NULL, -- 'ANC Check', 'Immunization Follow-up', 'NCD Doorstep Check', 'Postnatal Care', 'TB Compliance', 'General Welfare'
    scheduled_date VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ASSIGNED', -- 'ASSIGNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'RESCHEDULED', 'CANCELLED'
    priority VARCHAR(32) NOT NULL DEFAULT 'Routine', -- 'Routine', 'Urgent', 'High'
    accessibility_barriers TEXT, -- JSON array of non-clinical barriers
    transport_barriers TEXT,
    notes TEXT,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fl_visits_worker ON frontline_visits(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_fl_visits_patient ON frontline_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_fl_visits_status ON frontline_visits(status);

-- 21b. FRONTLINE TASKS (FOLLOW-UP, REMINDERS, COORDINATION)
CREATE TABLE IF NOT EXISTS frontline_tasks (
    id VARCHAR(64) PRIMARY KEY,
    household_id VARCHAR(64),
    patient_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    worker_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    worker_name VARCHAR(255) NOT NULL,
    worker_role VARCHAR(64) NOT NULL DEFAULT 'ASHA', -- 'ASHA', 'ANM', 'CHO'
    village_name VARCHAR(255) NOT NULL,
    beneficiary_name VARCHAR(255) NOT NULL,
    beneficiary_phone VARCHAR(64),
    task_type VARCHAR(64) NOT NULL, -- 'Household Visit', 'Follow-up Call', 'Appointment Reminder', 'Referral Follow-up', 'Transport Coordination', 'Document Assistance', 'Teleconsultation Assistance'
    due_date VARCHAR(64) NOT NULL,
    priority VARCHAR(32) NOT NULL DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Urgent'
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fl_tasks_worker ON frontline_tasks(worker_id);
CREATE INDEX IF NOT EXISTS idx_fl_tasks_status ON frontline_tasks(status);

-- 21c. FRONTLINE AUDIT TRAIL (IMMUTABLE LOGS)
CREATE TABLE IF NOT EXISTS frontline_audit_events (
    id VARCHAR(64) PRIMARY KEY,
    resource_type VARCHAR(32) NOT NULL, -- 'VISIT', 'TASK', 'SYNC', 'REFERRAL', 'TELECONSULT'
    resource_id VARCHAR(64) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL, -- 'VISIT_STARTED', 'VISIT_COMPLETED', 'TASK_CREATED', 'TASK_STATUS_UPDATED', 'SYNC_PROCESSED', 'REFERRAL_INITIATED'
    previous_status VARCHAR(64),
    new_status VARCHAR(64),
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fl_audit_res ON frontline_audit_events(resource_id);

-- 21d. CITIZEN DOORSTEP VISIT REQUESTS (PATIENT-INITIATED ASSISTANCE)
CREATE TABLE IF NOT EXISTS doorstep_visit_requests (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    patient_name VARCHAR(255) NOT NULL,
    patient_phone VARCHAR(64),
    village_or_area VARCHAR(255) NOT NULL,
    assistance_type VARCHAR(64) NOT NULL, -- 'Elderly Mobility / Vitals Check', 'ABHA Card Assistance', 'Maternal ANC Guidance', 'Medicine Delivery / Follow-up', 'Transportation Barrier'
    preferred_date VARCHAR(64),
    barrier_description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'REQUESTED', -- 'REQUESTED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    assigned_worker_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    assigned_worker_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doorstep_patient ON doorstep_visit_requests(patient_id);

-- 23. DIGITAL TWIN SIMULATIONS (NON-CLINICAL HEALTHCARE ACCESS MODELING)
CREATE TABLE IF NOT EXISTS digital_twin_simulations (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    facility_id VARCHAR(64) REFERENCES hospitals(id) ON DELETE SET NULL,
    facility_name VARCHAR(255) NOT NULL,
    baseline_friction_score INT NOT NULL,
    simulated_friction_score INT NOT NULL,
    friction_reduction_points INT NOT NULL,
    baseline_completion_rate INT NOT NULL,
    simulated_completion_rate INT NOT NULL,
    travel_burden_score INT NOT NULL,
    transport_burden_score INT NOT NULL,
    waiting_burden_score INT NOT NULL,
    digital_access_burden_score INT NOT NULL,
    administrative_burden_score INT NOT NULL,
    diagnostic_burden_score INT NOT NULL,
    medicine_burden_score INT NOT NULL,
    selected_interventions TEXT, -- JSON array of intervention codes
    journey_milestones_json TEXT, -- JSON array of 7 virtual journey milestones with simulated results
    profile_snapshot_json TEXT, -- JSON snapshot of patient access profile
    facility_snapshot_json TEXT, -- JSON snapshot of facility status
    notes TEXT,
    model_version VARCHAR(32) DEFAULT 'PFIS-DT-v2.4',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dt_sims_user ON digital_twin_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_dt_sims_facility ON digital_twin_simulations(facility_id);

