import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { NotificationProvider } from './context/NotificationContext';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ToastProvider } from './context/ToastContext';
import { FirstVisitLanguageModal } from './components/common/FirstVisitLanguageModal';
import { AccessibilityToolbar } from './components/common/AccessibilityToolbar';
import { ElevenLabsWidget } from './components/common/ElevenLabsWidget';
import { MobileBottomBar } from './components/layout/MobileBottomBar';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { PatientLayout } from './layouts/PatientLayout';
import { HospitalLayout } from './layouts/HospitalLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { DoctorLayout } from './layouts/DoctorLayout';
import { AshaLayout } from './layouts/AshaLayout';
import { GovernmentLayout } from './layouts/GovernmentLayout';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { GoogleCallback } from './pages/auth/GoogleCallback';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { NotFound } from './pages/public/NotFound';
import { SystemArchitecture } from './pages/public/SystemArchitecture';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientProfile } from './pages/patient/PatientProfile';
import { NearbyHospitals } from './pages/patient/NearbyHospitals';
import { HospitalDetails } from './pages/patient/HospitalDetails';
import { PatientRequests } from './pages/patient/PatientRequests';
import { RequestDetails } from './pages/patient/RequestDetails';
import { PatientDocuments } from './pages/patient/PatientDocuments';
import { FrictionFingerprint } from './pages/patient/FrictionFingerprint';
import { AccessibilityRisk } from './pages/patient/AccessibilityRisk';
import { DigitalTwinSimulator } from './pages/patient/DigitalTwinSimulator';
import { TeleconsultationRoom } from './pages/patient/TeleconsultationRoom';
import { PatientNotifications } from './pages/patient/PatientNotifications';
import { PatientSettings } from './pages/patient/PatientSettings';
import { DigitalTriagePage } from './pages/patient/DigitalTriagePage';
import { ReferralTrackingPage } from './pages/patient/ReferralTrackingPage';
import { LongitudinalRecordsPage } from './pages/patient/LongitudinalRecordsPage';
import { DiagnosticsPage } from './pages/patient/DiagnosticsPage';
import { MedicineAvailabilityPage } from './pages/patient/MedicineAvailabilityPage';
import { HighRiskFollowUpPage } from './pages/patient/HighRiskFollowUpPage';
import { FrontlineWorkerPortal } from './pages/patient/FrontlineWorkerPortal';
import { PatientFrictionReportPage } from './pages/patient/PatientFrictionReportPage';
import { PatientAccessAssessment } from './pages/patient/PatientAccessAssessment';

// Hospital Pages
import { HospitalDashboard } from './pages/hospital/HospitalDashboard';
import { HospitalRequests } from './pages/hospital/HospitalRequests';
import { HospitalRequestDetails } from './pages/hospital/HospitalRequestDetails';
import { HospitalDepartments } from './pages/hospital/HospitalDepartments';
import { HospitalProfile } from './pages/hospital/HospitalProfile';
import { FacilityQualityDashboard } from './pages/hospital/FacilityQualityDashboard';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PopulationFrictionMap } from './pages/admin/PopulationFrictionMap';
import { WhatIfSimulator } from './pages/admin/WhatIfSimulator';
import { InterventionOptimizer } from './pages/admin/InterventionOptimizer';
import { CareLeakage } from './pages/admin/CareLeakage';
import { CareFailure } from './pages/admin/CareFailure';
import { AdminPatients } from './pages/admin/AdminPatients';
import { AdminHospitals } from './pages/admin/AdminHospitals';
import { AuditLogs } from './pages/admin/AuditLogs';
import { AdminFeatureFlags } from './pages/admin/AdminFeatureFlags';
import { AdminUsers } from './pages/admin/AdminUsers';
import { JudgeImpactDashboard } from './pages/admin/JudgeImpactDashboard';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorProfile } from './pages/doctor/DoctorProfile';
import { DoctorPatients } from './pages/doctor/DoctorPatients';
import { DoctorConsultationWorkspace } from './pages/doctor/DoctorConsultationWorkspace';
import { DoctorOPDQueue } from './pages/doctor/DoctorOPDQueue';
import { DoctorPrescriptions } from './pages/doctor/DoctorPrescriptions';
import { DoctorLabOrders } from './pages/doctor/DoctorLabOrders';
import { DoctorReferrals } from './pages/doctor/DoctorReferrals';
import { DoctorFollowUps } from './pages/doctor/DoctorFollowUps';
import { DoctorSchedule } from './pages/doctor/DoctorSchedule';

// ASHA Worker Pages
import { AshaDashboard } from './pages/asha/AshaDashboard';
import { AshaPatients } from './pages/asha/AshaPatients';
import { AshaHouseholds } from './pages/asha/AshaHouseholds';
import { AshaFieldVisits } from './pages/asha/AshaFieldVisits';
import { AshaEscalations } from './pages/asha/AshaEscalations';
import { AshaFrontlineDesk } from './pages/asha/AshaFrontlineDesk';
import { AshaAppointments } from './pages/asha/AshaAppointments';
import { AshaOPDTokens } from './pages/asha/AshaOPDTokens';
import { AshaReferrals } from './pages/asha/AshaReferrals';
import { AshaFollowUps } from './pages/asha/AshaFollowUps';
import { AshaTeleconsult } from './pages/asha/AshaTeleconsult';
import { AshaAccessBarriers } from './pages/asha/AshaAccessBarriers';
import { AshaDocuments } from './pages/asha/AshaDocuments';
import { AshaOfflineSync } from './pages/asha/AshaOfflineSync';
import { AshaNotifications } from './pages/asha/AshaNotifications';
import { AshaAuditTrail } from './pages/asha/AshaAuditTrail';
import { AshaSettings } from './pages/asha/AshaSettings';

// Government Pages
import { GovernmentDashboard } from './pages/government/GovernmentDashboard';
import { GovernmentHospitals } from './pages/government/GovernmentHospitals';
import { GovernmentBeds } from './pages/government/GovernmentBeds';
import { GovernmentReferrals } from './pages/government/GovernmentReferrals';
import { GovernmentServices } from './pages/government/GovernmentServices';
import { GovernmentOPDAnalytics } from './pages/government/GovernmentOPDAnalytics';
import { GovernmentLabs } from './pages/government/GovernmentLabs';
import { GovernmentPharmacy } from './pages/government/GovernmentPharmacy';
import { GovernmentAshaCoverage } from './pages/government/GovernmentAshaCoverage';
import { GovernmentDistrictComparison } from './pages/government/GovernmentDistrictComparison';
import { GovernmentActionCenter } from './pages/government/GovernmentActionCenter';
import { GovernmentReports } from './pages/government/GovernmentReports';
import { GovernmentAuditLogs } from './pages/government/GovernmentAuditLogs';

// Admin Strategic Intelligence Pages
import { AdminStateCommand } from './pages/admin/AdminStateCommand';
import { AdminIntegrationCenter } from './pages/admin/AdminIntegrationCenter';
import { AdminDataQuality } from './pages/admin/AdminDataQuality';
import { AdminPermissions } from './pages/admin/AdminPermissions';
import { AdminSystemHealth } from './pages/admin/AdminSystemHealth';
import { AdminReports } from './pages/admin/AdminReports';

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
                  <ElevenLabsWidget />
                  <MobileBottomBar />
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
                      <Route path="diagnostics" element={<DiagnosticsPage />} />
                      <Route path="medicines" element={<MedicineAvailabilityPage />} />
                      <Route path="high-risk" element={<HighRiskFollowUpPage />} />
                      <Route path="frontline" element={<FrontlineWorkerPortal />} />
                      <Route path="facility-metrics" element={<FacilityQualityDashboard />} />
                      <Route path="profile" element={<PatientProfile />} />
                      <Route path="hospitals" element={<NearbyHospitals />} />
                      <Route path="hospitals/:id" element={<HospitalDetails />} />
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
                      <Route path="referrals" element={<ReferralTrackingPage />} />
                      <Route path="health-records" element={<LongitudinalRecordsPage />} />
                      <Route path="facility-metrics" element={<FacilityQualityDashboard />} />
                      <Route path="medicines" element={<MedicineAvailabilityPage />} />
                      <Route path="diagnostics" element={<DiagnosticsPage />} />
                      <Route path="high-risk" element={<HighRiskFollowUpPage />} />
                      <Route path="frontline" element={<FrontlineWorkerPortal />} />
                      <Route path="requests" element={<HospitalRequests />} />
                      <Route path="requests/:id" element={<HospitalRequestDetails />} />
                      <Route path="departments" element={<HospitalDepartments />} />
                      <Route path="teleconsult" element={<TeleconsultationRoom />} />
                      <Route path="hospitals" element={<NearbyHospitals />} />
                      <Route path="digital-twin" element={<DigitalTwinSimulator />} />
                      <Route path="profile" element={<HospitalProfile />} />
                      <Route path="notifications" element={<PatientNotifications />} />
                      <Route path="settings" element={<PatientSettings />} />
                    </Route>

                    {/* Doctor Portal */}
                    <Route path="/doctor" element={<DoctorLayout />}>
                      <Route index element={<Navigate to="/doctor/dashboard" replace />} />
                      <Route path="dashboard" element={<DoctorDashboard />} />
                      <Route path="consultation" element={<DoctorConsultationWorkspace />} />
                      <Route path="profile" element={<DoctorProfile />} />
                      <Route path="patients" element={<DoctorPatients />} />
                      <Route path="opd-queue" element={<DoctorOPDQueue />} />
                      <Route path="prescriptions" element={<DoctorPrescriptions />} />
                      <Route path="lab-orders" element={<DoctorLabOrders />} />
                      <Route path="referrals" element={<DoctorReferrals />} />
                      <Route path="follow-ups" element={<DoctorFollowUps />} />
                      <Route path="schedule" element={<DoctorSchedule />} />
                      <Route path="teleconsult" element={<TeleconsultationRoom />} />
                      <Route path="health-records" element={<LongitudinalRecordsPage />} />
                      <Route path="triage" element={<DigitalTriagePage />} />
                      <Route path="diagnostics" element={<DiagnosticsPage />} />
                      <Route path="notifications" element={<PatientNotifications />} />
                      <Route path="settings" element={<PatientSettings />} />
                    </Route>

                    {/* ASHA Worker Portal */}
                    <Route path="/asha" element={<AshaLayout />}>
                      <Route index element={<Navigate to="/asha/dashboard" replace />} />
                      <Route path="dashboard" element={<AshaDashboard />} />
                      <Route path="patients" element={<AshaPatients />} />
                      <Route path="households" element={<AshaHouseholds />} />
                      <Route path="visits" element={<AshaFieldVisits />} />
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
                      <Route path="reports" element={<GovernmentReports />} />
                      <Route path="audit-logs" element={<GovernmentAuditLogs />} />
                      <Route path="notifications" element={<PatientNotifications />} />
                      <Route path="settings" element={<PatientSettings />} />
                    </Route>

                    {/* Admin Intelligence Suite */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Navigate to="/admin/dashboard" replace />} />
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="state-command" element={<AdminStateCommand />} />
                      {/* Platform Impact Evaluation Route */}
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
                      <Route path="simulator" element={<WhatIfSimulator />} />
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
                      <Route path="settings" element={<PatientSettings />} />
                    </Route>

                    {/* Top-Level Judge Mode Direct Access & Case Normalization */}
                    <Route path="/judge-mode" element={<Navigate to="/admin/judge-mode" replace />} />
                    <Route path="/Admin/judge-mode" element={<Navigate to="/admin/judge-mode" replace />} />
                    <Route path="/Admin/judge-mode/" element={<Navigate to="/admin/judge-mode" replace />} />
                    <Route path="/Admin/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="/Admin" element={<Navigate to="/admin/dashboard" replace />} />

                    {/* 404 Catch All */}
                    <Route path="*" element={<NotFound />} />

                  </Routes>
                </NotificationProvider>
              </LocationProvider>
            </AuthProvider>
          </ToastProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

