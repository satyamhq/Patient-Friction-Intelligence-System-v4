import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ToastProvider } from './context/ToastContext';
import { FirstVisitLanguageModal } from './components/common/FirstVisitLanguageModal';
import { AccessibilityToolbar } from './components/common/AccessibilityToolbar';
import { GeminiHealthChatbot } from './components/common/GeminiHealthChatbot';
import { MobileBottomBar } from './components/layout/MobileBottomBar';
import { LoadingSkeleton } from './components/common/LoadingSkeleton';

// Layouts (Static for fast initial frame render)
import { MainLayout } from './layouts/MainLayout';
import { PatientLayout } from './layouts/PatientLayout';
import { HospitalLayout } from './layouts/HospitalLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { DoctorLayout } from './layouts/DoctorLayout';
import { AshaLayout } from './layouts/AshaLayout';
import { GovernmentLayout } from './layouts/GovernmentLayout';

// Dynamic Named Import Helper for Route Code-Splitting
const lazyNamed = <T extends Record<string, any>>(
  factory: () => Promise<T>,
  name: keyof T
) =>
  React.lazy(() =>
    factory().then((module) => ({
      default: module[name] as React.ComponentType<any>,
    }))
  );

// Public Pages (Lazy Loaded)
const LandingPage = lazyNamed(() => import('./pages/LandingPage'), 'LandingPage');
const Login = lazyNamed(() => import('./pages/auth/Login'), 'Login');
const Register = lazyNamed(() => import('./pages/auth/Register'), 'Register');
const ForgotPassword = lazyNamed(() => import('./pages/auth/ForgotPassword'), 'ForgotPassword');
const ResetPassword = lazyNamed(() => import('./pages/auth/ResetPassword'), 'ResetPassword');
const GoogleCallback = lazyNamed(() => import('./pages/auth/GoogleCallback'), 'GoogleCallback');
const About = lazyNamed(() => import('./pages/public/About'), 'About');
const Contact = lazyNamed(() => import('./pages/public/Contact'), 'Contact');
const NotFound = lazyNamed(() => import('./pages/public/NotFound'), 'NotFound');
const SystemArchitecture = lazyNamed(() => import('./pages/public/SystemArchitecture'), 'SystemArchitecture');

// Patient Pages (Lazy Loaded)
const PatientDashboard = lazyNamed(() => import('./pages/patient/PatientDashboard'), 'PatientDashboard');
const PatientProfile = lazyNamed(() => import('./pages/patient/PatientProfile'), 'PatientProfile');
const NearbyHospitals = lazyNamed(() => import('./pages/patient/NearbyHospitals'), 'NearbyHospitals');
const HospitalDetails = lazyNamed(() => import('./pages/patient/HospitalDetails'), 'HospitalDetails');
const PatientRequests = lazyNamed(() => import('./pages/patient/PatientRequests'), 'PatientRequests');
const RequestDetails = lazyNamed(() => import('./pages/patient/RequestDetails'), 'RequestDetails');
const PatientDocuments = lazyNamed(() => import('./pages/patient/PatientDocuments'), 'PatientDocuments');
const FrictionFingerprint = lazyNamed(() => import('./pages/patient/FrictionFingerprint'), 'FrictionFingerprint');
const AccessibilityRisk = lazyNamed(() => import('./pages/patient/AccessibilityRisk'), 'AccessibilityRisk');
const DigitalTwinSimulator = lazyNamed(() => import('./pages/patient/DigitalTwinSimulator'), 'DigitalTwinSimulator');
const TeleconsultationRoom = lazyNamed(() => import('./pages/patient/TeleconsultationRoom'), 'TeleconsultationRoom');
const PatientNotifications = lazyNamed(() => import('./pages/patient/PatientNotifications'), 'PatientNotifications');
const PatientSettings = lazyNamed(() => import('./pages/patient/PatientSettings'), 'PatientSettings');
const DigitalTriagePage = lazyNamed(() => import('./pages/patient/DigitalTriagePage'), 'DigitalTriagePage');
const ReferralTrackingPage = lazyNamed(() => import('./pages/patient/ReferralTrackingPage'), 'ReferralTrackingPage');
const LongitudinalRecordsPage = lazyNamed(() => import('./pages/patient/LongitudinalRecordsPage'), 'LongitudinalRecordsPage');
const DiagnosticsPage = lazyNamed(() => import('./pages/patient/DiagnosticsPage'), 'DiagnosticsPage');
const MedicineAvailabilityPage = lazyNamed(() => import('./pages/patient/MedicineAvailabilityPage'), 'MedicineAvailabilityPage');
const HighRiskFollowUpPage = lazyNamed(() => import('./pages/patient/HighRiskFollowUpPage'), 'HighRiskFollowUpPage');
const FrontlineWorkerPortal = lazyNamed(() => import('./pages/patient/FrontlineWorkerPortal'), 'FrontlineWorkerPortal');
const PatientFrictionReportPage = lazyNamed(() => import('./pages/patient/PatientFrictionReportPage'), 'PatientFrictionReportPage');
const PatientAccessAssessment = lazyNamed(() => import('./pages/patient/PatientAccessAssessment'), 'PatientAccessAssessment');
const PatientServicesDirectory = lazyNamed(() => import('./pages/patient/PatientServicesDirectory'), 'PatientServicesDirectory');

// Hospital Pages (Lazy Loaded)
const HospitalDashboard = lazyNamed(() => import('./pages/hospital/HospitalDashboard'), 'HospitalDashboard');
const HospitalRequests = lazyNamed(() => import('./pages/hospital/HospitalRequests'), 'HospitalRequests');
const HospitalRequestDetails = lazyNamed(() => import('./pages/hospital/HospitalRequestDetails'), 'HospitalRequestDetails');
const HospitalDepartments = lazyNamed(() => import('./pages/hospital/HospitalDepartments'), 'HospitalDepartments');
const HospitalProfile = lazyNamed(() => import('./pages/hospital/HospitalProfile'), 'HospitalProfile');
const FacilityQualityDashboard = lazyNamed(() => import('./pages/hospital/FacilityQualityDashboard'), 'FacilityQualityDashboard');
const HospitalPatientIntake = lazyNamed(() => import('./pages/hospital/HospitalPatientIntake'), 'HospitalPatientIntake');
const HospitalStaffManagement = lazyNamed(() => import('./pages/hospital/HospitalStaffManagement'), 'HospitalStaffManagement');
const HospitalResourcesHub = lazyNamed(() => import('./pages/hospital/HospitalResourcesHub'), 'HospitalResourcesHub');
const HospitalAlertsCenter = lazyNamed(() => import('./pages/hospital/HospitalAlertsCenter'), 'HospitalAlertsCenter');
const HospitalSettings = lazyNamed(() => import('./pages/hospital/HospitalSettings'), 'HospitalSettings');

// Doctor Pages (Lazy Loaded)
const DoctorDashboard = lazyNamed(() => import('./pages/doctor/DoctorDashboard'), 'DoctorDashboard');
const DoctorProfile = lazyNamed(() => import('./pages/doctor/DoctorProfile'), 'DoctorProfile');
const DoctorPatients = lazyNamed(() => import('./pages/doctor/DoctorPatients'), 'DoctorPatients');
const DoctorConsultationWorkspace = lazyNamed(() => import('./pages/doctor/DoctorConsultationWorkspace'), 'DoctorConsultationWorkspace');
const DoctorOPDQueue = lazyNamed(() => import('./pages/doctor/DoctorOPDQueue'), 'DoctorOPDQueue');
const DoctorPrescriptions = lazyNamed(() => import('./pages/doctor/DoctorPrescriptions'), 'DoctorPrescriptions');
const DoctorLabOrders = lazyNamed(() => import('./pages/doctor/DoctorLabOrders'), 'DoctorLabOrders');
const DoctorReferrals = lazyNamed(() => import('./pages/doctor/DoctorReferrals'), 'DoctorReferrals');
const DoctorFollowUps = lazyNamed(() => import('./pages/doctor/DoctorFollowUps'), 'DoctorFollowUps');
const DoctorSchedule = lazyNamed(() => import('./pages/doctor/DoctorSchedule'), 'DoctorSchedule');
const DoctorNotifications = lazyNamed(() => import('./pages/doctor/DoctorNotifications'), 'DoctorNotifications');
const DoctorSettings = lazyNamed(() => import('./pages/doctor/DoctorSettings'), 'DoctorSettings');

// ASHA Worker Pages (Lazy Loaded)
const AshaDashboard = lazyNamed(() => import('./pages/asha/AshaDashboard'), 'AshaDashboard');
const AshaPatients = lazyNamed(() => import('./pages/asha/AshaPatients'), 'AshaPatients');
const AshaHouseholds = lazyNamed(() => import('./pages/asha/AshaHouseholds'), 'AshaHouseholds');
const AshaHouseholdCohorts = lazyNamed(() => import('./pages/asha/AshaHouseholdCohorts'), 'AshaHouseholdCohorts');
const AshaMaternalRegister = lazyNamed(() => import('./pages/asha/AshaMaternalRegister'), 'AshaMaternalRegister');
const AshaFieldVisits = lazyNamed(() => import('./pages/asha/AshaFieldVisits'), 'AshaFieldVisits');
const AshaScreeningDesk = lazyNamed(() => import('./pages/asha/AshaScreeningDesk'), 'AshaScreeningDesk');
const AshaEscalations = lazyNamed(() => import('./pages/asha/AshaEscalations'), 'AshaEscalations');
const AshaFrontlineDesk = lazyNamed(() => import('./pages/asha/AshaFrontlineDesk'), 'AshaFrontlineDesk');
const AshaAppointments = lazyNamed(() => import('./pages/asha/AshaAppointments'), 'AshaAppointments');
const AshaOPDTokens = lazyNamed(() => import('./pages/asha/AshaOPDTokens'), 'AshaOPDTokens');
const AshaReferrals = lazyNamed(() => import('./pages/asha/AshaReferrals'), 'AshaReferrals');
const AshaFollowUps = lazyNamed(() => import('./pages/asha/AshaFollowUps'), 'AshaFollowUps');
const AshaTeleconsult = lazyNamed(() => import('./pages/asha/AshaTeleconsult'), 'AshaTeleconsult');
const AshaAccessBarriers = lazyNamed(() => import('./pages/asha/AshaAccessBarriers'), 'AshaAccessBarriers');
const AshaDocuments = lazyNamed(() => import('./pages/asha/AshaDocuments'), 'AshaDocuments');
const AshaOfflineSync = lazyNamed(() => import('./pages/asha/AshaOfflineSync'), 'AshaOfflineSync');
const AshaNotifications = lazyNamed(() => import('./pages/asha/AshaNotifications'), 'AshaNotifications');
const AshaAuditTrail = lazyNamed(() => import('./pages/asha/AshaAuditTrail'), 'AshaAuditTrail');
const AshaSettings = lazyNamed(() => import('./pages/asha/AshaSettings'), 'AshaSettings');

// Government Pages (Lazy Loaded)
const GovernmentDashboard = lazyNamed(() => import('./pages/government/GovernmentDashboard'), 'GovernmentDashboard');
const GovernmentHospitals = lazyNamed(() => import('./pages/government/GovernmentHospitals'), 'GovernmentHospitals');
const GovernmentBeds = lazyNamed(() => import('./pages/government/GovernmentBeds'), 'GovernmentBeds');
const GovernmentAccreditation = lazyNamed(() => import('./pages/government/GovernmentAccreditation'), 'GovernmentAccreditation');
const GovernmentReferrals = lazyNamed(() => import('./pages/government/GovernmentReferrals'), 'GovernmentReferrals');
const GovernmentServices = lazyNamed(() => import('./pages/government/GovernmentServices'), 'GovernmentServices');
const GovernmentOPDAnalytics = lazyNamed(() => import('./pages/government/GovernmentOPDAnalytics'), 'GovernmentOPDAnalytics');
const GovernmentLabs = lazyNamed(() => import('./pages/government/GovernmentLabs'), 'GovernmentLabs');
const GovernmentPharmacy = lazyNamed(() => import('./pages/government/GovernmentPharmacy'), 'GovernmentPharmacy');
const GovernmentAshaCoverage = lazyNamed(() => import('./pages/government/GovernmentAshaCoverage'), 'GovernmentAshaCoverage');
const GovernmentDistrictComparison = lazyNamed(() => import('./pages/government/GovernmentDistrictComparison'), 'GovernmentDistrictComparison');
const GovernmentActionCenter = lazyNamed(() => import('./pages/government/GovernmentActionCenter'), 'GovernmentActionCenter');
const GovernmentReports = lazyNamed(() => import('./pages/government/GovernmentReports'), 'GovernmentReports');
const GovernmentAuditLogs = lazyNamed(() => import('./pages/government/GovernmentAuditLogs'), 'GovernmentAuditLogs');
const GovernmentSettings = lazyNamed(() => import('./pages/government/GovernmentSettings'), 'GovernmentSettings');
const AuthorizedOfficerWorkflow = lazyNamed(() => import('./pages/government/AuthorizedOfficerWorkflow'), 'AuthorizedOfficerWorkflow');
const PatientFrictionIntelligenceSystem = lazyNamed(() => import('./pages/government/PatientFrictionIntelligenceSystem'), 'PatientFrictionIntelligenceSystem');

// Admin Pages (Lazy Loaded)
const AdminDashboard = lazyNamed(() => import('./pages/admin/AdminDashboard'), 'AdminDashboard');
const PopulationFrictionMap = lazyNamed(() => import('./pages/admin/PopulationFrictionMap'), 'PopulationFrictionMap');
const WhatIfSimulator = lazyNamed(() => import('./pages/admin/WhatIfSimulator'), 'WhatIfSimulator');
const InterventionOptimizer = lazyNamed(() => import('./pages/admin/InterventionOptimizer'), 'InterventionOptimizer');
const AdminResourceAllocation = lazyNamed(() => import('./pages/admin/AdminResourceAllocation'), 'AdminResourceAllocation');
const CareLeakage = lazyNamed(() => import('./pages/admin/CareLeakage'), 'CareLeakage');
const CareFailure = lazyNamed(() => import('./pages/admin/CareFailure'), 'CareFailure');
const AdminPatients = lazyNamed(() => import('./pages/admin/AdminPatients'), 'AdminPatients');
const AdminHospitals = lazyNamed(() => import('./pages/admin/AdminHospitals'), 'AdminHospitals');
const AuditLogs = lazyNamed(() => import('./pages/admin/AuditLogs'), 'AuditLogs');
const AdminFeatureFlags = lazyNamed(() => import('./pages/admin/AdminFeatureFlags'), 'AdminFeatureFlags');
const AdminUsers = lazyNamed(() => import('./pages/admin/AdminUsers'), 'AdminUsers');
const JudgeImpactDashboard = lazyNamed(() => import('./pages/admin/JudgeImpactDashboard'), 'JudgeImpactDashboard');
const AdminStateCommand = lazyNamed(() => import('./pages/admin/AdminStateCommand'), 'AdminStateCommand');
const AdminIntegrationCenter = lazyNamed(() => import('./pages/admin/AdminIntegrationCenter'), 'AdminIntegrationCenter');
const AdminDataQuality = lazyNamed(() => import('./pages/admin/AdminDataQuality'), 'AdminDataQuality');
const AdminPermissions = lazyNamed(() => import('./pages/admin/AdminPermissions'), 'AdminPermissions');
const AdminSystemHealth = lazyNamed(() => import('./pages/admin/AdminSystemHealth'), 'AdminSystemHealth');
const AdminReports = lazyNamed(() => import('./pages/admin/AdminReports'), 'AdminReports');
const AdminSystemSettings = lazyNamed(() => import('./pages/admin/AdminSystemSettings'), 'AdminSystemSettings');

// Route Loading Fallback Skeleton
const PageFallback: React.FC = () => (
  <div className="p-6 max-w-7xl mx-auto space-y-6 animate-pulse" aria-label="Loading content">
    <div className="h-28 bg-slate-200/80 rounded-3xl" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="h-24 bg-slate-200/70 rounded-2xl" />
      <div className="h-24 bg-slate-200/70 rounded-2xl" />
      <div className="h-24 bg-slate-200/70 rounded-2xl" />
      <div className="h-24 bg-slate-200/70 rounded-2xl" />
    </div>
    <div className="h-64 bg-slate-200/60 rounded-3xl" />
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <LanguageProvider>
        <AccessibilityProvider>
          <ToastProvider>
            <AuthProvider>
              <LocationProvider>
                <NotificationProvider>
                  <FirstVisitLanguageModal />
                  <AccessibilityToolbar />
                  <GeminiHealthChatbot />
                  <MobileBottomBar />

                  <main id="main-content" tabIndex={-1} className="outline-none">
                    <Suspense fallback={<PageFallback />}>
                      <Routes>
                        {/* Public Main Layout */}
                        <Route element={<MainLayout />}>
                          <Route path="/" element={<LandingPage />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/architecture" element={<SystemArchitecture />} />
                          <Route path="/system-architecture" element={<Navigate to="/architecture" replace />} />
                          <Route path="/assessment" element={<PatientAccessAssessment />} />
                          <Route path="/hospitals" element={<Navigate to="/patient/hospitals" replace />} />
                        </Route>

                        {/* Auth Layout */}
                        <Route element={<AuthLayout />}>
                          <Route path="/login" element={<Login />} />
                          <Route path="/auth/login" element={<Navigate to="/login" replace />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/auth/register" element={<Navigate to="/register" replace />} />
                          <Route path="/forgot-password" element={<ForgotPassword />} />
                          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                          <Route path="/reset-password" element={<ResetPassword />} />
                          <Route path="/auth/reset-password" element={<ResetPassword />} />
                        </Route>
                        <Route path="/auth/google/callback" element={<GoogleCallback />} />

                        {/* Patient Portal */}
                        <Route path="/patient" element={<PatientLayout />}>
                          <Route index element={<Navigate to="/patient/dashboard" replace />} />
                          <Route path="dashboard" element={<PatientDashboard />} />
                          <Route path="triage" element={<DigitalTriagePage />} />
                          <Route path="referrals" element={<ReferralTrackingPage />} />
                          <Route path="health-records" element={<LongitudinalRecordsPage />} />
                          <Route path="records" element={<Navigate to="/patient/health-records" replace />} />
                          <Route path="appointments" element={<Navigate to="/patient/requests" replace />} />
                          <Route path="diagnostics" element={<DiagnosticsPage />} />
                          <Route path="medicines" element={<MedicineAvailabilityPage />} />
                          <Route path="high-risk" element={<HighRiskFollowUpPage />} />
                          <Route path="frontline" element={<FrontlineWorkerPortal />} />
                          <Route path="facility-metrics" element={<FacilityQualityDashboard />} />
                          <Route path="profile" element={<PatientProfile />} />
                          <Route path="hospitals" element={<NearbyHospitals />} />
                          <Route path="hospitals/:id" element={<HospitalDetails />} />
                          <Route path="services" element={<PatientServicesDirectory />} />
                          <Route path="requests" element={<PatientRequests />} />
                          <Route path="requests/:id" element={<RequestDetails />} />
                          <Route path="documents" element={<PatientDocuments />} />
                          <Route path="friction" element={<FrictionFingerprint />} />
                          <Route path="risk" element={<AccessibilityRisk />} />
                          <Route path="digital-twin" element={<DigitalTwinSimulator />} />
                          <Route path="teleconsult" element={<TeleconsultationRoom />} />
                          <Route path="consent" element={<Navigate to="/patient/dashboard" replace />} />
                          <Route path="report-friction" element={<PatientFrictionReportPage />} />
                          <Route path="assessment" element={<PatientAccessAssessment />} />
                          <Route path="notifications" element={<PatientNotifications />} />
                          <Route path="settings" element={<PatientSettings />} />
                        </Route>

                        {/* Hospital Portal */}
                        <Route path="/hospital" element={<HospitalLayout />}>
                          <Route index element={<Navigate to="/hospital/dashboard" replace />} />
                          <Route path="dashboard" element={<HospitalDashboard />} />
                          <Route path="triage" element={<DigitalTriagePage />} />
                          <Route path="intake" element={<HospitalPatientIntake />} />
                          <Route path="opd-capacity" element={<HospitalRequests />} />
                          <Route path="referrals" element={<ReferralTrackingPage />} />
                          <Route path="health-records" element={<LongitudinalRecordsPage />} />
                          <Route path="facility-metrics" element={<FacilityQualityDashboard />} />
                          <Route path="quality" element={<Navigate to="/hospital/facility-metrics" replace />} />
                          <Route path="opd" element={<Navigate to="/hospital/requests" replace />} />
                          <Route path="medicines" element={<MedicineAvailabilityPage />} />
                          <Route path="diagnostics" element={<DiagnosticsPage />} />
                          <Route path="high-risk" element={<HighRiskFollowUpPage />} />
                          <Route path="frontline" element={<FrontlineWorkerPortal />} />
                          <Route path="requests" element={<HospitalRequests />} />
                          <Route path="requests/:id" element={<HospitalRequestDetails />} />
                          <Route path="departments" element={<HospitalDepartments />} />
                          <Route path="staff" element={<HospitalStaffManagement />} />
                          <Route path="resources" element={<HospitalResourcesHub />} />
                          <Route path="teleconsult" element={<TeleconsultationRoom />} />
                          <Route path="hospitals" element={<NearbyHospitals />} />
                          <Route path="digital-twin" element={<DigitalTwinSimulator />} />
                          <Route path="profile" element={<HospitalProfile />} />
                          <Route path="alerts" element={<HospitalAlertsCenter />} />
                          <Route path="notifications" element={<PatientNotifications />} />
                          <Route path="settings" element={<HospitalSettings />} />
                        </Route>

                        {/* Doctor Portal */}
                        <Route path="/doctor" element={<DoctorLayout />}>
                          <Route index element={<Navigate to="/doctor/dashboard" replace />} />
                          <Route path="dashboard" element={<DoctorDashboard />} />
                          <Route path="consultation" element={<DoctorConsultationWorkspace />} />
                          <Route path="profile" element={<DoctorProfile />} />
                          <Route path="patients" element={<DoctorPatients />} />
                          <Route path="opd-queue" element={<DoctorOPDQueue />} />
                          <Route path="queue" element={<Navigate to="/doctor/opd-queue" replace />} />
                          <Route path="prescriptions" element={<DoctorPrescriptions />} />
                          <Route path="lab-orders" element={<DoctorLabOrders />} />
                          <Route path="referrals" element={<DoctorReferrals />} />
                          <Route path="follow-ups" element={<DoctorFollowUps />} />
                          <Route path="schedule" element={<DoctorSchedule />} />
                          <Route path="teleconsult" element={<TeleconsultationRoom />} />
                          <Route path="health-records" element={<LongitudinalRecordsPage />} />
                          <Route path="triage" element={<DigitalTriagePage />} />
                          <Route path="diagnostics" element={<DiagnosticsPage />} />
                          <Route path="notifications" element={<DoctorNotifications />} />
                          <Route path="settings" element={<DoctorSettings />} />
                        </Route>

                        {/* ASHA Worker Portal */}
                        <Route path="/asha" element={<AshaLayout />}>
                          <Route index element={<Navigate to="/asha/dashboard" replace />} />
                          <Route path="dashboard" element={<AshaDashboard />} />
                          <Route path="today" element={<Navigate to="/asha/dashboard" replace />} />
                          <Route path="patients" element={<AshaPatients />} />
                          <Route path="households" element={<AshaHouseholds />} />
                          <Route path="cohorts" element={<AshaHouseholdCohorts />} />
                          <Route path="maternal-register" element={<AshaMaternalRegister />} />
                          <Route path="visits" element={<AshaFieldVisits />} />
                          <Route path="field-visits" element={<Navigate to="/asha/visits" replace />} />
                          <Route path="screening" element={<AshaScreeningDesk />} />
                          <Route path="escalations" element={<AshaEscalations />} />
                          <Route path="high-risk" element={<AshaEscalations />} />
                          <Route path="desk" element={<AshaFrontlineDesk />} />
                          <Route path="frontline" element={<AshaFrontlineDesk />} />
                          <Route path="appointments" element={<AshaAppointments />} />
                          <Route path="opd-tokens" element={<AshaOPDTokens />} />
                          <Route path="referrals" element={<AshaReferrals />} />
                          <Route path="follow-ups" element={<AshaFollowUps />} />
                          <Route path="teleconsult" element={<AshaTeleconsult />} />
                          <Route path="access-barriers" element={<AshaAccessBarriers />} />
                          <Route path="documents" element={<AshaDocuments />} />
                          <Route path="sync" element={<AshaOfflineSync />} />
                          <Route path="notifications" element={<AshaNotifications />} />
                          <Route path="audit" element={<AshaAuditTrail />} />
                          <Route path="settings" element={<AshaSettings />} />
                        </Route>

                        {/* Government Portal */}
                        <Route path="/government" element={<GovernmentLayout />}>
                          <Route index element={<Navigate to="/government/dashboard" replace />} />
                          <Route path="dashboard" element={<GovernmentDashboard />} />
                          <Route path="hospitals" element={<GovernmentHospitals />} />
                          <Route path="beds" element={<GovernmentBeds />} />
                          <Route path="friction-map" element={<PopulationFrictionMap />} />
                          <Route path="accreditation" element={<GovernmentAccreditation />} />
                          <Route path="interventions" element={<InterventionOptimizer />} />
                          <Route path="referrals" element={<GovernmentReferrals />} />
                          <Route path="facility-metrics" element={<FacilityQualityDashboard />} />
                          <Route path="services" element={<GovernmentServices />} />
                          <Route path="opd-analytics" element={<GovernmentOPDAnalytics />} />
                          <Route path="labs" element={<GovernmentLabs />} />
                          <Route path="pharmacy" element={<GovernmentPharmacy />} />
                          <Route path="asha-coverage" element={<GovernmentAshaCoverage />} />
                          <Route path="district-comparison" element={<GovernmentDistrictComparison />} />
                          <Route path="alerts" element={<GovernmentActionCenter />} />
                          <Route path="officer-workflow" element={<AuthorizedOfficerWorkflow />} />
                          <Route path="friction-intelligence" element={<PatientFrictionIntelligenceSystem />} />
                          <Route path="reports" element={<GovernmentReports />} />
                          <Route path="audit-logs" element={<GovernmentAuditLogs />} />
                          <Route path="notifications" element={<PatientNotifications />} />
                          <Route path="settings" element={<GovernmentSettings />} />
                        </Route>

                        {/* Admin Intelligence Suite */}
                        <Route path="/admin" element={<AdminLayout />}>
                          <Route index element={<Navigate to="/admin/dashboard" replace />} />
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="officer-workflow" element={<AuthorizedOfficerWorkflow />} />
                          <Route path="friction-intelligence" element={<PatientFrictionIntelligenceSystem />} />
                          <Route path="state-command" element={<AdminStateCommand />} />
                          <Route path="judge-mode" element={<JudgeImpactDashboard />} />
                          <Route path="judge-mode/" element={<Navigate to="/admin/judge-mode" replace />} />
                          <Route path="judgeMode" element={<Navigate to="/admin/judge-mode" replace />} />
                          <Route path="judge" element={<Navigate to="/admin/judge-mode" replace />} />
                          <Route path="triage" element={<DigitalTriagePage />} />
                          <Route path="referrals" element={<ReferralTrackingPage />} />
                          <Route path="health-records" element={<LongitudinalRecordsPage />} />
                          <Route path="medicines" element={<MedicineAvailabilityPage />} />
                          <Route path="diagnostics" element={<DiagnosticsPage />} />
                          <Route path="high-risk" element={<HighRiskFollowUpPage />} />
                          <Route path="frontline" element={<FrontlineWorkerPortal />} />
                          <Route path="facility-metrics" element={<FacilityQualityDashboard />} />
                          <Route path="friction-map" element={<PopulationFrictionMap />} />
                          <Route path="district-comparison" element={<GovernmentDistrictComparison />} />
                          <Route path="simulator" element={<WhatIfSimulator />} />
                          <Route path="resource-allocation" element={<AdminResourceAllocation />} />
                          <Route path="digital-twin" element={<DigitalTwinSimulator />} />
                          <Route path="teleconsult" element={<TeleconsultationRoom />} />
                          <Route path="interventions" element={<InterventionOptimizer />} />
                          <Route path="care-leakage" element={<CareLeakage />} />
                          <Route path="care-failure" element={<CareFailure />} />
                          <Route path="patients" element={<AdminPatients />} />
                          <Route path="hospitals" element={<AdminHospitals />} />
                          <Route path="users" element={<AdminUsers />} />
                          <Route path="permissions" element={<AdminPermissions />} />
                          <Route path="integrations" element={<AdminIntegrationCenter />} />
                          <Route path="data-quality" element={<AdminDataQuality />} />
                          <Route path="audit-logs" element={<AuditLogs />} />
                          <Route path="system-health" element={<AdminSystemHealth />} />
                          <Route path="reports" element={<AdminReports />} />
                          <Route path="feature-flags" element={<AdminFeatureFlags />} />
                          <Route path="settings" element={<AdminSystemSettings />} />
                        </Route>

                        {/* Fallbacks and legacy redirects */}
                        <Route path="/judge-mode" element={<Navigate to="/admin/judge-mode" replace />} />
                        <Route path="/Admin/judge-mode" element={<Navigate to="/admin/judge-mode" replace />} />
                        <Route path="/Admin/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="/Admin" element={<Navigate to="/admin/dashboard" replace />} />

                        {/* 404 Catch All */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </main>
                </NotificationProvider>
              </LocationProvider>
            </AuthProvider>
          </ToastProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};
