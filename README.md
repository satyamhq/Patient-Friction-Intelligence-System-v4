# Patient Friction Intelligence System (PFIS)

> **Empowering Healthcare Equity by Quantifying and Mitigating Non-Clinical Operational Barriers**

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0.7-646cff.svg)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21.2-lightgrey.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38bdf8.svg)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-3.6%20Flash%20RAG-orange.svg)](https://deepmind.google/technologies/gemini/)
[![WCAG 2.1 AAA](https://img.shields.io/badge/WCAG%202.1-AAA%20Compliant-emerald.svg)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

> [!IMPORTANT]
> **NON-CLINICAL OPERATIONAL MANDATE**
> PFIS focuses exclusively on logistical, geographical, linguistic, financial, and administrative barriers to healthcare access.
> - Does **NOT** diagnose medical conditions, diseases, or pathology.
> - Does **NOT** formulate clinical prognoses or predict physiological outcomes.
> - Does **NOT** prescribe or recommend medications or pharmaceutical regimens.
> - Does **NOT** replace licensed physicians, nurses, or emergency medical responders.

---

## Quick Start (Under 2 Minutes)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (`v20+` recommended)
- **npm**: v9.0.0 or higher

### 2. Clone & Install
```bash
git clone https://github.com/Learntagus-Tech-SIH/PFIS-Patient-Friction-Intelligence-System.git
cd PFIS-Patient-Friction-Intelligence-System

# Install all dependencies (root, server, and client)
npm install
npm run install:all
```

### 3. Configure Environment
```bash
# Copy example configuration into server/.env
cp server/.env.example server/.env
```
*(The default configuration uses the pre-calibrated in-memory database and Google Gemini AI key out of the box).*

### 4. Seed Data & Run Concurrently
```bash
# Seed 12 hospitals, 1,000+ patient records, and pre-index RAG knowledge base
npm run seed
npm run rag:index

# Start backend (port 5000) and frontend (port 5173) concurrently
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 1. Project Overview & Value Proposition

In public and private healthcare systems across emerging economies, **the physical presence of a hospital does not guarantee practical access**. Over 42% of referred rural and low-income patients abandon their care journeys prior to diagnosis or treatment completion—not due to clinical refusal, but due to **non-clinical friction**:
- **Geographic Isolation & Terrain**: Remote rural villages situated 30–60 km from secondary care, lacking paved transit or reliable buses.
- **Lost Subsistence Wages**: Rigid morning Outpatient Department (OPD) queues that conflict directly with daily-wage labor.
- **Linguistic Distance**: Dialect mismatches between regional patients and urban hospital clinical staff.
- **Financial Shocks**: Out-of-pocket transit fares, diagnostic test deposits, and pharmacy stockouts.
- **Fragmented Documentation**: Missing scheme verification cards (Ayushman Bharat / PM-JAY), referral slips, and identity papers.

**PFIS is a non-clinical healthcare logistics and accessibility intelligence platform.** It quantifies non-clinical friction into an actionable index (0.0 to 1.0), predicts patient care journey completion through digital twins, coordinates community ASHA health escorts, and provides district health authorities with budget-constrained intervention optimizers to save lives before patients drop out.

---

## 2. Key Features & Capabilities

### 🧠 Non-Clinical Friction Intelligence Core
- **Patient Friction Index (PFI)**: Deterministic 6-dimension weighted risk model evaluating distance, wait times, out-of-pocket costs, language distance, documentation status, and mobility constraints.
- **Care Risk & Bottleneck Attribution**: Decomposes high friction into granular root causes and isolates the primary journey drop-off stage.
- **Care Leakage Funnel**: Tracks attrition across 6 longitudinal milestones (`Referred` → `Consulted` → `Diagnosed` → `Treatment Started` → `Treatment Completed` → `Follow-up Completed`).
- **Care Failure Prediction**: Identifies patients with high probability of abandoning secondary referrals within 72-hour clinical windows.

### 🔮 Predictive Digital Twin & Simulation
- **Stochastic Digital Twin Simulator**: Discrete Event Simulation (DES) coupled with a Markov state chain modeling patient transit, queue verification, and diagnostic fulfillment under varied weather, transport, and facility conditions.
- **What-If Intervention Simulator**: Real-time scenario model predicting completion rate shifts from policy actions (transit shuttles, vernacular desks, mobile diagnostic vans).
- **Intervention Optimizer (0/1 Knapsack)**: Algorithms calculating Incremental Cost-Effectiveness Ratios (ICER) and Quality-Adjusted Life Years (QALY) saved under strict municipal budget caps.

### 🤖 Gemini-Powered RAG AI Copilot
- **1,270+ Codebase-Specific Q&A Knowledge Base**: Pre-compiled static analysis index covering the entire architecture, API routes, database models, frontend views, and formulas.
- **Hybrid Retrieval-Augmented Generation (RAG)**: In-memory BM25 + TF-IDF index with role-relevance boosting and keyword prioritization.
- **Google Gemini 3.6 Flash Integration**: Fast, context-rich responses citing exact source file references with graceful offline synthesis fallback.
- **Continuous Knowledge Base Updater**: Automatic hash-tracking (`ragIndexer.ts`) and hot re-indexing API (`POST /api/ai/reindex`) that updates knowledge when code changes.
- **Interactive UI Copilot**: Floating assistant featuring role tabs, one-click suggested questions, Markdown rendering, speech synthesis (TTS), voice search, and persistent conversation history.

### 👥 6 Dedicated Role Portals
- **Patient Portal**: Personalized friction fingerprint, accessible hospital locator, intake assistance requests, document locker, digital triage, and appointment booking.
- **Doctor Portal**: Real-time OPD queue management, unified consultation workspace, longitudinal health records, e-prescriptions, lab orders, and secondary referral dispatch.
- **ASHA Worker Portal**: Frontline rural desk, household health registry, field visit logger, maternal high-risk escalation pipeline, and atomic offline sync.
- **Hospital Portal**: Department capacity tracking, live bed occupancy (ICU/Oxygen/General), incoming patient assistance triage, and facility quality metrics.
- **Government Portal**: State command center, choropleth Population Friction Map, district-level cross-comparisons, and policy intervention optimizer.
- **Admin & Judge Mode**: System health monitoring, audit logs, feature flags, user management, and the **Judge Mode Platform Impact Evaluation** dashboard.

### 🌐 Universal Accessibility & Offline Readiness
- **WCAG 2.1 AAA Accessibility**: Text size scaling (100% to 130%), high-contrast borders, reduced motion toggles, and screen reader labels.
- **Clean Light-Mode Aesthetics**: Consistent, high-readability healthcare UI without disruptive dark mode themes.
- **Multilingual Vernacular Support**: 8+ Indian regional languages (Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati, Kannada, Odia, English) powered by `i18next`.
- **Offline Sync & Frontline Queue**: IndexedDB local queue enabling ASHA workers to record field visits without cellular connectivity and sync atomically when online.

---

## 3. Technology Stack & Architecture

```
                                  +-------------------------------------------------------------+
                                  |                 Client Application (React 18 + Vite)         |
                                  |   Light-Mode WCAG 2.1 AAA  *  Tailwind CSS  *  i18next      |
                                  +------------------------------+------------------------------+
                                                                 |
                                              HTTPS / JSON (Axios + JWT Auth)
                                                                 |
                                                                 v
                                  +-------------------------------------------------------------+
                                  |                  PFIS Server (Node.js + Express 4)          |
                                  |   Helmet  *  CORS  *  Rate Limiting  *  RBAC Middleware      |
                                  +------------------------------+------------------------------+
                                                                 |
                +------------------------------------------------+------------------------------------------------+
                |                                                |                                                |
                v                                                v                                                v
+-------------------------------+              +-----------------------------------+              +-------------------------------+
|  Friction Intelligence Core   |              |       Gemini RAG Copilot          |              |      Database Abstraction     |
| - FrictionEngine (PFI Math)   |              | - Google Gemini 3.6 Flash         |              | - PostgreSQL / pg             |
| - DigitalTwinEngine (Markov)  |              | - Hybrid BM25 / TF-IDF Retrieval  |              | - MySQL / mysql2              |
| - InterventionOptimizer       |              | - 1,270+ Q&A Knowledge Base       |              | - MongoDB / Mongoose          |
| - CareRisk & Bottleneck Engine|              | - Hot Re-indexing Pipeline        |              | - In-Memory Relational JSON   |
+-------------------------------+              +-----------------------------------+              +-------------------------------+
```

### Detailed Component Stack

| Layer | Technologies | Description |
|---|---|---|
| **Frontend Core** | React 18.3.1, TypeScript 5.7.3, Vite 6.0.7 | SPA architecture with future React Router v7 compatibility flags |
| **Styling & Icons** | Tailwind CSS 3.4.17, Lucide React 0.473.0 | Custom healthcare color palette, light-mode standard, responsive reflow |
| **Geospatial Mapping** | Leaflet 1.9.4, React-Leaflet 4.2.1 | OpenStreetMap tiles, distance routing, offline fallback coordinates |
| **Charts & Analytics** | Recharts 2.15.0 | Friction radar charts, choropleth maps, capacity bar graphs |
| **Internationalization** | i18next 26.4.1, react-i18next 17.0.13 | 8+ regional languages with automatic browser language detection |
| **Backend API** | Node.js (ESM), Express 4.21.2, `tsx` 4.19.2 | RESTful API, rate-limiting, error handling, Multer file upload |
| **Authentication** | JWT (jsonwebtoken 9.0.2), Bcrypt.js 2.4.3 | Dual-mode: email/password + Google Identity Services OAuth 2.0 |
| **Generative AI & RAG**| Google Gemini (`gemini-3.6-flash`), Custom BM25 | 1,270+ Q&A knowledge base with real-time source file citations |
| **Database Engines** | PostgreSQL (`pg`), MySQL (`mysql2`), Mongo (`mongoose`)| Multi-engine adapter + zero-config transactional relational JSON |

---

## 4. Complete Project Structure

```
PFIS-Patient-Friction-Intelligence-System/
├── package.json                         # Root workspace scripts (dev, build, seed, rag:index)
├── package-lock.json                    # Locked root dependency tree
├── README.md                            # Comprehensive system documentation
├── .gitignore                           # Git ignore rules for node_modules, dist, env
│
├── client/                              # React 18 Frontend Application
│   ├── index.html                       # HTML5 entry point with Google Identity Services & Inter font
│   ├── package.json                     # Frontend dependencies and Vite scripts
│   ├── tailwind.config.js               # Tailwind CSS theme, brand colors, and class strategy
│   ├── tsconfig.json                    # TypeScript compiler configuration
│   ├── vite.config.ts                   # Vite configuration with proxy rules
│   │
│   └── src/
│       ├── main.tsx                     # React DOM root bootstrapping
│       ├── App.tsx                      # Main router definitions, layout nesting, global providers
│       ├── index.css                    # Tailwind directives, WCAG contrast styles, fluid typography
│       │
│       ├── components/                  # Reusable UI component modules
│       │   ├── common/                  # Global widgets
│       │   │   ├── AccessibilityToolbar.tsx    # WCAG 2.1 AAA toolbar (text scaling, contrast, motion)
│       │   │   ├── GeminiChatbot.tsx           # Floating AI Copilot with Gemini 3.6 Flash RAG
│       │   │   ├── EmergencySOSModal.tsx       # Rapid SOS dispatch modal
│       │   │   ├── ErrorBoundary.tsx           # React runtime error boundary
│       │   │   ├── FirstVisitLanguageModal.tsx # Vernacular onboarding modal
│       │   │   ├── LanguageSelector.tsx        # Multi-language dropdown picker
│       │   │   ├── OfflineSyncIndicator.tsx    # Connectivity status badge & sync trigger
│       │   │   ├── SimpleModeToggle.tsx        # Low-literacy UI simplification switch
│       │   │   ├── StatCard.tsx                # Metric KPI display card
│       │   │   ├── TTSButton.tsx               # Text-to-speech audio reader
│       │   │   └── VoiceSearchButton.tsx       # Speech recognition search input
│       │   ├── layout/                  # Navigation & layout elements
│       │   │   ├── Navbar.tsx                  # Top navigation bar with notifications & user profile
│       │   │   └── Sidebar.tsx                 # Role-specific collapsible sidebar
│       │   ├── maps/                    # Geospatial components
│       │   │   └── HospitalMap.tsx             # Interactive Leaflet facility locator
│       │   └── queue/                   # OPD queue components
│       │       └── LiveQueueTracker.tsx        # Live token counter and estimated wait calculator
│       │
│       ├── context/                     # React Context Providers
│       │   ├── AccessibilityContext.tsx # Text size, contrast, reduced motion state
│       │   ├── AuthContext.tsx          # JWT session, user role, login/logout state
│       │   ├── LanguageContext.tsx      # i18n language, TTS voice settings
│       │   ├── LocationContext.tsx      # GPS coordinates and geolocation tracking
│       │   ├── NotificationContext.tsx  # In-app alerts and notifications
│       │   └── ToastContext.tsx         # Toast notification dispatchers
│       │
│       ├── i18n/                        # Vernacular translation dictionaries
│       │   └── config.ts                # i18next configuration (hi, bn, te, ta, mr, gu, kn, od, en)
│       │
│       ├── layouts/                     # Route layout wrappers with persistent navigation
│       │   ├── MainLayout.tsx           # Public site layout
│       │   ├── AuthLayout.tsx           # Authentication view wrapper
│       │   ├── PatientLayout.tsx        # Patient portal wrapper
│       │   ├── DoctorLayout.tsx         # Doctor portal wrapper
│       │   ├── AshaLayout.tsx           # ASHA worker frontline portal wrapper
│       │   ├── HospitalLayout.tsx       # Hospital administration wrapper
│       │   ├── GovernmentLayout.tsx     # Government policy portal wrapper
│       │   └── AdminLayout.tsx          # System administration & Judge Mode wrapper
│       │
│       ├── pages/                       # Portal Page Views (35+ Pages)
│       │   ├── LandingPage.tsx          # Public homepage with platform value proposition
│       │   ├── public/                  # Public informational views (About, Contact, Architecture)
│       │   ├── auth/                    # Auth views (Login, Register, ForgotPassword, GoogleCallback)
│       │   ├── patient/                 # Patient Portal views (18 pages)
│       │   │   ├── PatientDashboard.tsx        # Patient summary, upcoming appointments, friction KPI
│       │   │   ├── DigitalTriagePage.tsx       # Non-clinical symptoms triage & department guide
│       │   │   ├── FrictionFingerprint.tsx     # Dimensional breakdown of personal access barriers
│       │   │   ├── NearbyHospitals.tsx         # Hospital search with travel distance & wait times
│       │   │   ├── HospitalDetails.tsx         # Department capacities, fees, token booking
│       │   │   ├── PatientRequests.tsx         # Non-clinical assistance inquiries (transit, translator)
│       │   │   ├── RequestDetails.tsx          # Intake request status and hospital responses
│       │   │   ├── PatientDocuments.tsx        # Document locker (ID cards, referral slips, prescriptions)
│       │   │   ├── AccessibilityRisk.tsx       # Bottleneck stage attribution
│       │   │   ├── DigitalTwinSimulator.tsx    # Monte Carlo patient care journey simulator
│       │   │   ├── TeleconsultationRoom.tsx    # WebRTC remote navigation consultation
│       │   │   ├── ReferralTrackingPage.tsx    # Inter-hospital referral progress
│       │   │   ├── LongitudinalRecordsPage.tsx # Historical clinical encounters and prescriptions
│       │   │   ├── DiagnosticsPage.tsx         # Investigative lab test booking
│       │   │   ├── MedicineAvailabilityPage.tsx# Essential drug availability tracker
│       │   │   ├── HighRiskFollowUpPage.tsx    # Follow-up reminders for vulnerable conditions
│       │   │   ├── PatientAccessAssessment.tsx # Self-administered accessibility barrier survey
│       │   │   ├── PatientFrictionReportPage.tsx# Community friction incident reporting
│       │   │   ├── PatientNotifications.tsx    # Intake notifications feed
│       │   │   ├── PatientProfile.tsx          # Demographics, languages, caregiver support
│       │   │   └── PatientSettings.tsx         # Account preferences
│       │   ├── doctor/                  # Doctor Portal views (10 pages)
│       │   │   ├── DoctorDashboard.tsx         # Doctor overview, appointment counter, queue summary
│       │   │   ├── DoctorConsultationWorkspace.tsx# Clinical records, e-prescriptions, lab ordering
│       │   │   ├── DoctorOPDQueue.tsx          # Live patient queue prioritization
│       │   │   ├── DoctorPatients.tsx          # Assigned patient registry
│       │   │   ├── DoctorPrescriptions.tsx     # Digital prescription ledger
│       │   │   ├── DoctorLabOrders.tsx         # Laboratory investigation dispatches
│       │   │   ├── DoctorReferrals.tsx         # Secondary facility referral creation
│       │   │   ├── DoctorFollowUps.tsx         # Scheduled follow-up tracker
│       │   │   ├── DoctorSchedule.tsx          # Weekly OPD availability planner
│       │   │   └── DoctorProfile.tsx           # Doctor credentials and department assignment
│       │   ├── asha/                    # ASHA Worker Portal views (17 pages)
│       │   │   ├── AshaDashboard.tsx           # Frontline overview, pending tasks, village metrics
│       │   │   ├── AshaFrontlineDesk.tsx       # Rural intake desk and patient assistance
│       │   │   ├── AshaHouseholds.tsx          # Village household registry and health indexing
│       │   │   ├── AshaFieldVisits.tsx         # Scheduled home visit logger
│       │   │   ├── AshaEscalations.tsx         # Maternal high-risk emergency escalation
│       │   │   ├── AshaOfflineSync.tsx         # Offline record sync and conflict resolution
│       │   │   ├── AshaAppointments.tsx        # Assisted OPD appointment booking
│       │   │   ├── AshaOPDTokens.tsx           # Community token management
│       │   │   ├── AshaReferrals.tsx           # Escorted referral tracking
│       │   │   ├── AshaAccessBarriers.tsx      # Village-level obstacle ledger
│       │   │   ├── AshaTeleconsult.tsx         # Assisted teleconsultation triage
│       │   │   ├── AshaDocuments.tsx           # Mobile document scanner and upload
│       │   │   ├── AshaNotifications.tsx       # Field alerts feed
│       │   │   ├── AshaAuditTrail.tsx          # Frontline activity logs
│       │   │   └── AshaSettings.tsx            # ASHA worker preferences
│       │   ├── hospital/                # Hospital Administration views (5 pages)
│       │   │   ├── HospitalDashboard.tsx       # Hospital KPI overview, live bed counts, patient flow
│       │   │   ├── HospitalDepartments.tsx     # Department scheduling, fee settings, token limits
│       │   │   ├── HospitalRequests.tsx        # Incoming patient intake and transport requests
│       │   │   ├── HospitalRequestDetails.tsx  # Request approval, token generation, escort assignment
│       │   │   ├── FacilityQualityDashboard.tsx# Quality scorecards, wait time benchmarks, feedback
│       │   │   └── HospitalProfile.tsx         # Facility address, emergency contacts, bed counts
│       │   ├── government/              # Government & Policy views (13 pages)
│       │   │   ├── GovernmentDashboard.tsx     # State health command center, total referrals, PFI KPI
│       │   │   ├── GovernmentDistrictComparison.tsx# Inter-district friction comparison tables
│       │   │   ├── GovernmentHospitals.tsx     # Public health facility infrastructure audit
│       │   │   ├── GovernmentBeds.tsx          # Regional ICU/Oxygen/General bed capacity heatmap
│       │   │   ├── GovernmentReferrals.tsx     # State-wide patient referral network analytics
│       │   │   ├── GovernmentServices.tsx      # Clinical specialty coverage index
│       │   │   ├── GovernmentOPDAnalytics.tsx  # Outpatient congestion and abandonment trends
│       │   │   ├── GovernmentLabs.tsx          # Public diagnostic network utilization
│       │   │   ├── GovernmentPharmacy.tsx      # Essential Drug List (EDL) stockout tracking
│       │   │   ├── GovernmentAshaCoverage.tsx  # Frontline worker density and household reach
│       │   │   ├── GovernmentActionCenter.tsx  # Rapid-response alerts and resource dispatches
│       │   │   ├── GovernmentReports.tsx       # Policy briefing reports generator
│       │   │   └── GovernmentAuditLogs.tsx     # Administrative transparency log
│       │   └── admin/                   # System Admin & Judge Mode views (18 pages)
│       │       ├── AdminDashboard.tsx          # System-wide metrics, active users, operational load
│       │       ├── JudgeImpactDashboard.tsx    # Judge Mode Platform Impact Evaluation
│       │       ├── PopulationFrictionMap.tsx   # Geospatial choropleth friction heatmap
│       │       ├── WhatIfSimulator.tsx         # Policy intervention scenario simulation
│       │       ├── InterventionOptimizer.tsx   # 0/1 knapsack budget allocation optimizer
│       │       ├── CareLeakage.tsx             # 6-milestone patient retention funnel
│       │       ├── CareFailure.tsx             # Operational barrier attribution distribution
│       │       ├── AdminStateCommand.tsx       # High-level regional health director console
│       │       ├── AdminIntegrationCenter.tsx  # ABDM / FHIR / HL7 integration status
│       │       ├── AdminDataQuality.tsx        # Data completeness and validation diagnostics
│       │       ├── AdminPermissions.tsx        # Role permission matrices
│       │       ├── AdminUsers.tsx              # User directory and account management
│       │       ├── AdminHospitals.tsx          # Hospital facility management
│       │       ├── AdminPatients.tsx           # Patient record oversight
│       │       ├── AuditLogs.tsx               # Security and access audit trail
│       │       ├── AdminFeatureFlags.tsx       # Dynamic runtime feature flag switches
│       │       └── AdminSystemHealth.tsx       # Server memory, database latency, API status
│       │
│       └── services/                    # Typed Frontend API Clients (18 services)
│           ├── api.ts                   # Base Axios instance with JWT interceptors
│           ├── chatService.ts           # Gemini AI Copilot & RAG client
│           ├── authService.ts           # Login, register, Google OAuth verification
│           ├── patientService.ts        # Patient profile and friction calculations
│           ├── hospitalService.ts       # Hospital queries and department limits
│           ├── doctorService.ts         # Doctor queues, prescriptions, consultations
│           ├── ashaService.ts           # Household visits, offline sync, escalations
│           ├── governmentService.ts     # Population analytics and district comparisons
│           ├── adminService.ts          # Feature flags, audit logs, user management
│           ├── requestService.ts        # Non-clinical intake assistance inquiries
│           ├── queueService.ts          # OPD live queue status and token tracker
│           ├── digitalTwinService.ts    # Monte Carlo simulation engine execution
│           ├── frictionReportService.ts # Incident reporting service
│           ├── publicHealthService.ts   # Triage, diagnostics, and essential medicines
│           ├── documentService.ts       # File upload and secure document previews
│           ├── notificationService.ts   # User notification polling
│           └── consentService.ts        # Patient data sharing consent manager
│
└── server/                              # Node.js + Express 4 Backend API
    ├── package.json                     # Server dependencies, scripts (dev, build, seed, rag:index)
    ├── tsconfig.json                    # Backend TypeScript compiler settings
    ├── .env.example                     # Environment template with all available variables
    ├── .env                             # Local environment variables file
    │
    ├── data/                            # Persistent Data Storage
    │   ├── pfis_relational.json         # Transactional relational database file (26 tables)
    │   ├── rag_knowledge_base.json      # Compiled 1,270+ Q&A knowledge base for Gemini
    │   └── knowledge_manifest.json      # SHA-256 hash manifest for codebase change tracking
    │
    ├── uploads/                         # Secure static upload directory for patient documents
    │
    └── src/
        ├── server.ts                    # HTTP server listener and graceful shutdown
        ├── app.ts                       # Express setup, middleware, CORS, routing, SPA fallback
        │
        ├── config/                      # Configuration modules
        │   ├── env.ts                   # Sanitized environment configuration parser
        │   └── database.ts              # Multi-engine database connection manager
        │
        ├── database/                    # Relational & SQL abstraction layer
        │   ├── client.ts                # Unified IDatabaseClient interface
        │   ├── postgresClient.ts        # PostgreSQL pool adapter
        │   ├── mysqlClient.ts           # MySQL connection adapter
        │   ├── memoryClient.ts          # Transactional in-memory JSON engine
        │   ├── schema.ts                # 26 relational table schemas
        │   └── seedData.ts              # Default database records
        │
        ├── models/                      # Mongoose schemas & data entity models
        │   ├── User.ts                  # User accounts, hashed passwords, roles
        │   ├── Patient.ts               # Socio-geographic determinants & patient codes
        │   ├── Hospital.ts              # Facility attributes, beds, coordinates
        │   ├── HospitalDepartment.ts    # Departments, doctor leads, token limits
        │   ├── HospitalRequest.ts       # Non-clinical intake inquiries
        │   ├── Consent.ts               # Dynamic data-sharing authorization records
        │   ├── PatientDocument.ts       # Secure document metadata and file pointers
        │   ├── FrictionProfile.ts       # 6-dimension friction scores and weights
        │   ├── FrictionInteraction.ts   # Multi-barrier interaction synergies
        │   ├── CareRisk.ts              # Completion probabilities and bottlenecks
        │   ├── CareJourney.ts           # 9-stage care progression timelines
        │   ├── CareLeakage.ts           # 6-milestone funnel drop-off statistics
        │   ├── Intervention.ts          # Catalog of policy interventions & costs
        │   ├── Simulation.ts            # Saved simulation scenario results
        │   ├── Notification.ts          # User notification messages
        │   └── AuditLog.ts              # Immutable security & compliance audit logs
        │
        ├── intelligence/                # Non-Clinical Mathematical Models
        │   ├── friction/
        │   │   └── frictionEngine.ts    # PFI mathematical formula implementation
        │   ├── causal/
        │   │   └── frictionInteractionEngine.ts # Barrier synergy detection
        │   ├── risk/
        │   │   └── riskEngine.ts        # Care completion probability & bottleneck analysis
        │   ├── optimization/
        │   │   └── whatIfSimulator.ts   # 0/1 knapsack optimizer & scenario engine
        │   ├── digitalTwinEngine.ts     # Discrete Event Simulation & Markov chain
        │   └── ragIndexer.ts            # Static codebase analyzer & 1,270+ Q&A builder
        │
        ├── middleware/                  # Express Middlewares
        │   ├── authMiddleware.ts        # JWT token verification
        │   ├── roleMiddleware.ts        # Role-Based Access Control (RBAC)
        │   ├── errorMiddleware.ts       # Standardized error response formatter
        │   └── auditMiddleware.ts       # Automatic audit trail logger
        │
        ├── routes/                      # API Route Definitions (19 Modules)
        │   ├── index.ts                 # Central router mounting all subsystems
        │   ├── authRoutes.ts            # /api/auth (Login, register, Google OAuth)
        │   ├── aiRoutes.ts              # /api/ai (Gemini RAG chat, suggestions, reindex)
        │   ├── patientRoutes.ts         # /api/patients (Profile, friction, risk, journey)
        │   ├── hospitalRoutes.ts        # /api/hospitals (Nearby locator, departments)
        │   ├── doctorRoutes.ts          # /api/doctors (OPD queue, prescriptions, lab orders)
        │   ├── ashaRoutes.ts            # /api/asha (Households, sync, escalations)
        │   ├── governmentRoutes.ts      # /api/government (Friction maps, beds, districts)
        │   ├── adminRoutes.ts           # /api/admin (System health, users, audit logs)
        │   ├── requestRoutes.ts         # /api/requests (Intake inquiries & approvals)
        │   ├── queueRoutes.ts           # /api/queue (Live token queue status)
        │   ├── consentRoutes.ts         # /api/consents (Patient data authorization)
        │   ├── documentRoutes.ts        # /api/documents (File upload and download)
        │   ├── digitalTwinRoutes.ts     # /api/digital-twin (Simulation execution)
        │   ├── simulationRoutes.ts      # /api/simulation (What-If scenario runs)
        │   ├── interventionRoutes.ts    # /api/interventions (Budget knapsack optimization)
        │   ├── frictionReportRoutes.ts  # /api/friction-reports (Community reports)
        │   ├── publicHealthRoutes.ts    # /api/public-health (Triage, labs, medicines)
        │   ├── languageRoutes.ts        # /api/languages (Supported vernacular locales)
        │   └── notificationRoutes.ts    # /api/notifications (User notification feeds)
        │
        ├── controllers/                 # Business Logic Handlers (20+ Controllers)
        │   ├── aiController.ts          # Gemini chat execution, suggestions, re-indexing
        │   ├── authController.ts        # Registration, login, Google callback
        │   ├── patientController.ts     # Patient operations & friction evaluation
        │   ├── hospitalController.ts    # Department scheduling & hospital locator
        │   ├── doctorController.ts      # Consultation workspace & clinical actions
        │   ├── ashaController.ts        # Field visit logs & offline sync batching
        │   ├── governmentController.ts  # State analytics & choropleth aggregations
        │   ├── adminController.ts       # User management, audit logs, feature flags
        │   └── ...                      # Subsystem controllers
        │
        ├── services/                    # External Service Integrations
        │   ├── geminiService.ts         # Google Gemini REST API & BM25 search engine
        │   └── ...                      # Geocoding & notifications helpers
        │
        └── seed/                        # Database Seeder
            ├── seed.ts                  # Comprehensive data seeder execution
            └── seedData.ts              # Baseline hospitals, doctors, and departments
```

---

## 5. Non-Clinical Friction Intelligence & Mathematical Models

### 1. Patient Friction Index (PFI) Formula
Implemented in `server/src/intelligence/friction/frictionEngine.ts`, the composite score is evaluated on a normalized scale of `[0.0, 1.0]` (or `0–100%`):

$$\text{PFI} = \sum_{i=1}^{n} w_i \cdot S_i$$

Where weights and dimensions are:
- $w_{\text{dist}} = 0.22$: **Geographic Distance & Road Terrain** (kilometers to facility, elevation barrier)
- $w_{\text{wait}} = 0.20$: **OPD Queue Congestion** (estimated minutes to consultation)
- $w_{\text{fin}} = 0.18$: **Financial Vulnerability** (travel fare + out-of-pocket costs vs daily wage)
- $w_{\text{lang}} = 0.15$: **Linguistic Distance** (dialect difference between patient and clinical staff)
- $w_{\text{doc}} = 0.13$: **Documentation Readiness** (possession of referral slips, scheme cards, ID)
- $w_{\text{mob}} = 0.12$: **Physical Mobility & Escort** (elderly status, wheelchair need, caregiver support)

$$\text{Risk Level} = \begin{cases} \text{Low} & \text{if PFI} < 0.35 \\ \text{Moderate} & \text{if } 0.35 \le \text{PFI} < 0.60 \\ \text{High} & \text{if } 0.60 \le \text{PFI} < 0.75 \\ \text{Critical (Imminent Abandonment)} & \text{if PFI} \ge 0.75 \end{cases}$$

### 2. Digital Twin Markov Journey Simulator
Implemented in `server/src/intelligence/digitalTwinEngine.ts`:
- **State Trajectory**: $\text{Home} \rightarrow \text{Transit} \rightarrow \text{Arrival} \rightarrow \text{Triage} \rightarrow \text{OPD Queue} \rightarrow \text{Consultation} \rightarrow \text{Investigation} \rightarrow \text{Care Completed} \lor \text{Care Abandoned}$.
- **Stochastic Simulation**: Uses Monte Carlo sampling across user-configured scenarios (monsoon rain, public transit disruption, surge OPD volume, physician absence) to predict patient completion probabilities before traveling.

### 3. Intervention Budget Optimizer (0/1 Knapsack)
Implemented in `server/src/intelligence/optimization/whatIfSimulator.ts`:
Given a municipal health budget $B$ and $N$ prospective interventions with unit cost $c_j$ and estimated patient completion gain $g_j$:

$$\max \sum_{j=1}^{N} g_j x_j \quad \text{subject to} \quad \sum_{j=1}^{N} c_j x_j \le B, \quad x_j \in \{0, 1\}$$

Calculates the **Incremental Cost-Effectiveness Ratio (ICER)** and **Quality-Adjusted Life Years (QALY)** gained per rupee spent.

---

## 6. Gemini-Powered RAG AI Chatbot

PFIS features an interactive **AI Copilot** built using Google Gemini and local Retrieval-Augmented Generation (RAG).

```
                                      +---------------------------------------------+
                                      |            User Query (UI Copilot)          |
                                      +----------------------+----------------------+
                                                             |
                                                             v
+-----------------------------+       +---------------------------------------------+
| Codebase Static Analyzer    |       |         Hybrid RAG Retriever (BM25)         |
| (server/src/intelligence/   | ----> | - 1,270+ Q&A Knowledge Base                 |
|  ragIndexer.ts)             |       | - Term Frequency & IDF Weighting            |
+-----------------------------+       | - Role & Route Context Relevance Boosting   |
                                      +----------------------+----------------------+
                                                             |
                                                 Top-6 Ranked Context Items
                                                             |
                                                             v
                                      +---------------------------------------------+
                                      |         Google Gemini 3.6 Flash             |
                                      | - System Prompt (PFIS Non-Clinical Mandate) |
                                      | - Multi-turn Conversation History           |
                                      | - Automatic Fallback Chain                  |
                                      +----------------------+----------------------+
                                                             |
                                                             v
                                      +---------------------------------------------+
                                      |              Copilot Response               |
                                      | - Accurate Markdown Explanation             |
                                      | - Clickable Codebase Source Badges          |
                                      | - Contextual Follow-Up Suggestions          |
                                      +---------------------------------------------+
```

### Key Technical Attributes
1. **1,270+ Codebase Q&As**: Pre-compiled static analysis index covering the entire codebase saved in `server/data/rag_knowledge_base.json`.
2. **Hybrid BM25 / TF-IDF Retrieval**: Fast sub-10ms search scoring across questions, answers, tags, and source paths, with +35% relevance boosting for the user's active portal role.
3. **Model Redundancy**: Primary generation via `gemini-3.6-flash`, with automatic fallback to `gemini-flash-latest`, `gemini-3.5-flash`, and local knowledge synthesis if offline.
4. **Source File Badges**: Cites exact codebase paths (e.g. `server/src/intelligence/friction/frictionEngine.ts`) with relevance scores.
5. **Continuous Watcher & Re-indexer**: `ragIndexer.ts` detects file modifications using SHA-256 hashes (`server/data/knowledge_manifest.json`) and supports instant hot re-indexing via `POST /api/ai/reindex`.
6. **Accessibility Integrated**: Supports text-to-speech audio reading, speech recognition voice search, and Markdown formatting.

---

## 7. Authentication, Authorization & Security

### Dual-Mode Authentication
1. **Email & Password**: Passwords hashed with `bcryptjs` (10 rounds). Generates a signed JWT with 7-day expiration containing `userId`, `role`, and `name`.
2. **Google Identity Services (OAuth 2.0)**: Supports Google One-Tap and standard OAuth 2.0 authorization code redirect flow. Automatically retrieves verified Google profile emails and returns a valid session token.

### Role-Based Access Control (RBAC) Matrix

| Portal Route | Allowed Roles | Middleware Guard |
|---|---|---|
| `/patient/*`, `/api/patients/*` | `patient`, `admin` | `authMiddleware`, `requireRole(['patient', 'admin'])` |
| `/doctor/*`, `/api/doctors/*` | `doctor`, `admin` | `authMiddleware`, `requireRole(['doctor', 'admin'])` |
| `/asha/*`, `/api/asha/*` | `asha_worker`, `admin` | `authMiddleware`, `requireRole(['asha_worker', 'admin'])` |
| `/hospital/*`, `/api/hospitals/*` | `hospital`, `admin` | `authMiddleware`, `requireRole(['hospital', 'admin'])` |
| `/government/*`, `/api/government/*` | `government`, `admin` | `authMiddleware`, `requireRole(['government', 'admin'])` |
| `/admin/*`, `/api/admin/*` | `admin` | `authMiddleware`, `requireRole(['admin'])` |
| `/api/ai/*` | All authenticated or public demo users | `rateLimit` |

### Security Best Practices
- **HTTP Security Headers**: `helmet` configured with cross-origin resource policy enforcement.
- **Strict Origin CORS**: Restricts origins to configured client URLs with wildcard handling for cloud preview deployments.
- **Request Rate Limiting**: `express-rate-limit` caps API consumption at 1,000 requests per 15-minute window per IP.
- **Immutable Audit Trail**: Every administrative action, record update, and request transition is logged to `AuditLog.ts` with actor timestamps and IP addresses.
- **Zero Dark-Mode Inconsistencies**: Strict light-mode color tokens guaranteeing high readability under direct outdoor sunlight for field workers.

---

## 8. Complete API Catalog

PFIS exposes 19 RESTful route modules under the `/api` prefix:

### 1. Artificial Intelligence & RAG (`/api/ai`)
- `POST /api/ai/chat` — Submit query with conversation history, active role, and current path; returns Gemini answer with source citations.
- `GET /api/ai/suggestions` — Retrieve role-tailored suggested questions.
- `GET /api/ai/status` — Check RAG index health, active model, and total indexed Q&A count.
- `POST /api/ai/reindex` — Trigger hot re-indexing of the codebase without server reboot.

### 2. Authentication (`/api/auth`)
- `POST /api/auth/register` — Create a new patient or user account.
- `POST /api/auth/login` — Authenticate credentials and receive signed JWT.
- `GET /api/auth/me` — Retrieve current authenticated session profile.
- `GET /api/auth/google/callback` — Google OAuth 2.0 authorization code exchange.

### 3. Patient Operations (`/api/patients`)
- `GET /api/patients/me` — Retrieve active patient profile and socio-geographic attributes.
- `PUT /api/patients/me` — Update patient accessibility attributes and language.
- `GET /api/patients/me/friction` — Compute real-time 6-dimension Patient Friction Index.
- `GET /api/patients/me/risk` — Compute care completion probability and primary bottleneck.
- `GET /api/patients/me/journey` — Retrieve 9-stage care journey progression.

### 4. Hospital & Department Operations (`/api/hospitals`)
- `GET /api/hospitals/nearby` — Query facilities within coordinate radius with travel distances.
- `GET /api/hospitals/:id` — Retrieve hospital infrastructure, bed counts, and department rosters.
- `GET /api/hospitals/:id/departments` — List available departments, OPD days, and token limits.

### 5. Doctor Clinical Desk (`/api/doctors`)
- `GET /api/doctors/dashboard` — Doctor OPD metrics, appointment counts, and pending consults.
- `GET /api/doctors/queue` — Retrieve live OPD queue with high-friction patient prioritization.
- `POST /api/doctors/consultation` — Save consultation notes, longitudinal diagnoses, and allergies.
- `POST /api/doctors/prescriptions` — Generate and dispatch digital prescription records.
- `POST /api/doctors/lab-orders` — Dispatch diagnostic investigation orders.
- `POST /api/doctors/referrals` — Create inter-hospital secondary referral records.

### 6. ASHA Community Health Worker (`/api/asha`)
- `GET /api/asha/dashboard` — Village overview, pending visits, and maternal risk counts.
- `GET /api/asha/households` — Household registry and non-clinical health index records.
- `POST /api/asha/visits` — Log completed home visits and danger signs.
- `POST /api/asha/escalations` — Dispatch urgent maternal/infant high-risk escalations.
- `POST /api/asha/sync` — Atomic batch sync for records created in offline field mode.

### 7. Government & State Command (`/api/government`)
- `GET /api/government/dashboard` — State-level referral completion and friction metrics.
- `GET /api/government/friction-map` — Geospatial choropleth data aggregated by district.
- `GET /api/government/district-comparison` — Cross-district healthcare disparity tables.
- `GET /api/government/beds` — Regional bed availability heatmap (ICU, Oxygen, General).
- `GET /api/government/pharmacy` — Essential Drug List (EDL) stockout tracking.

### 8. System Administration & Judge Mode (`/api/admin`)
- `GET /api/admin/system-health` — Server memory, database response times, and API metrics.
- `GET /api/admin/audit-logs` — Administrative audit trail with actor details and timestamps.
- `GET /api/admin/feature-flags` — Dynamic runtime feature flag controls.
- `GET /api/admin/care-leakage` — 6-milestone patient retention funnel data.
- `GET /api/admin/care-failure` — Attribution breakdown of operational dropout causes.

### 9. Intake Requests & Assistance (`/api/requests`)
- `POST /api/requests` — Submit non-clinical assistance inquiry (wheelchair, translator, transit).
- `GET /api/requests/me` — Retrieve patient's submitted assistance requests.
- `PATCH /api/requests/:id/status` — Hospital update on assistance request (Approved, Dispatched).

### 10. Live Queue & Token Scheduling (`/api/queue`)
- `GET /api/queue/:hospitalId/:deptId` — Real-time token queue status and estimated wait times.

### 11. Digital Twin & Scenario Simulation (`/api/digital-twin` & `/api/simulation`)
- `POST /api/digital-twin/simulate` — Execute discrete event simulation over patient journey.
- `POST /api/simulation/run` — Run What-If policy intervention scenarios.

### 12. Policy Intervention Optimizer (`/api/interventions`)
- `GET /api/interventions/catalog` — List available community health interventions and costs.
- `POST /api/interventions/optimize` — Run 0/1 knapsack portfolio optimizer for a given budget.

### 13. Consents & Privacy (`/api/consents`)
- `POST /api/consents` — Grant hospital permission to access non-clinical friction data.
- `DELETE /api/consents/:id` — Revoke active consent record.

### 14. Document Locker (`/api/documents`)
- `POST /api/documents/upload` — Upload identity card, referral slip, or previous prescription.
- `GET /api/documents` — Retrieve uploaded document metadata.

### 15. Community Friction Reports (`/api/friction-reports`)
- `POST /api/friction-reports` — Submit crowdsourced access obstacle (e.g. broken road, strike).

### 16. Public Health Infrastructure (`/api/public-health`)
- `GET /api/public-health/triage` — Recommended healthcare facility tier by symptom category.
- `GET /api/public-health/medicines` — Essential medicine availability by district.

### 17. Internationalization (`/api/languages`)
- `GET /api/languages` — List supported vernacular languages and active translation status.

### 18. Notifications (`/api/notifications`)
- `GET /api/notifications` — Retrieve user's in-app notification feed.
- `PATCH /api/notifications/:id/read` — Mark notification as acknowledged.

### 19. System Diagnostics (`/health` & `/api/health`)
- `GET /health` — Lightweight health probe for cloud load balancers.
- `GET /api/health` — Detailed status report including database engine and map mode.

---

## 9. Seeded Demonstration Accounts

For local testing, evaluation, or judging, run `npm run seed` to populate the system with verified demonstration credentials:

| Role | Name | Email | Password | Primary Portal URL | Key Capabilities |
|---|---|---|---|---|---|
| **System Admin** | PFIS Executive Admin | `admin@pfis.org` | `Admin@123` | `/admin/dashboard` | Judge Mode, What-If Simulator, Audit Logs, Users |
| **Doctor** | Dr. Priya Sharma | `doctor@pfis.org` | `Doctor@123` | `/doctor/dashboard` | OPD Queue, Consult Workspace, Prescriptions, Referrals |
| **ASHA Worker** | Kavita Devi (ASHA Sangini) | `asha@pfis.org` | `Asha@123` | `/asha/dashboard` | Household Registry, Offline Sync, Maternal Escalations |
| **Government** | Rajesh Verma (District Officer) | `government@pfis.org` | `Govt@123` | `/government/dashboard` | State Command, Friction Map, District Comparisons |
| **Hospital Staff**| Dr. Gurpreet Singh (Nodal Officer)| `staff@hospital.org` | `Hospital@123` | `/hospital/dashboard` | Department Congestion, Bed Management, Intake Triage |
| **Patient** | Sunita Devi | `patient@pfis.org` | `Patient@123` | `/patient/dashboard` | Friction Fingerprint, Hospital Locator, Document Locker |

---

## 10. Environment Variables & Configuration

### Server Configuration (`server/.env`)

```env
# Server Networking
PORT=5000
NODE_ENV=development

# Web Client URL (Used for CORS and OAuth redirects)
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# Authentication
JWT_SECRET=pfis_super_secure_jwt_secret_key_2026

# Google Gemini Generative AI (Optional API key for live AI generation)
GEMINI_API_KEY=your_gemini_api_key_here

# Database Engine Selection ('auto' | 'postgres' | 'mysql')
# When set to 'auto', uses server/data/pfis_relational.json with zero installation required
DATABASE_TYPE=auto

# Optional External Database (Uncomment to connect external PostgreSQL or MySQL)
# DATABASE_URL=postgresql://postgres:password@localhost:5432/pfis
# PG_HOST=localhost
# PG_PORT=5432
# PG_USER=postgres
# PG_PASSWORD=postgres
# PG_DATABASE=pfis

# Google OAuth 2.0 Credentials (Optional: enables Google One-Tap and Redirect Login)
# GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=your_client_secret
# GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Google Maps Platform (Optional: defaults to built-in OpenStreetMap Leaflet engine)
# GOOGLE_MAPS_API_KEY=
```

### Client Configuration (`client/.env`)

```env
# Target Backend API URL (Defaults to current origin /api if omitted)
VITE_API_URL=http://localhost:5000/api
```

---

## 11. Development, Build & Maintenance Commands

### Root Workspace Commands

```bash
# Start backend and frontend concurrently
npm run dev

# Build both client and server for production
npm run build

# Seed database with demonstration hospitals, patients, and friction profiles
npm run seed

# Run static codebase analyzer to compile 1,270+ Q&A knowledge base
npm run rag:index

# Install all workspace dependencies
npm run install:all
```

### Client-Specific Commands (`client/`)

```bash
# Start Vite development server with HMR
npm run dev

# Run TypeScript type check and compile production bundle
npm run build

# Locally preview production bundle
npm run preview
```

### Server-Specific Commands (`server/`)

```bash
# Start backend in watch mode with tsx
npm run dev

# Type check and compile TypeScript to dist/
npm run build

# Start compiled production server
npm run start

# Seed database
npm run seed

# Run RAG codebase indexer
npm run rag:index
```

---

## 12. Troubleshooting & Common Issues

### 1. `EADDRINUSE: port 5000 already in use`
- **Cause**: Another service or prior instance of PFIS is occupying port 5000.
- **Solution**: Terminate the process or change `PORT=5001` in `server/.env`.
```powershell
# Windows PowerShell:
Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
```

### 2. Gemini API `High Demand` or Network Timeout
- **Cause**: Google Generative AI servers experiencing temporary traffic spikes.
- **Solution**: The backend `GeminiRagService` handles this automatically by cascading through candidate models (`gemini-3.6-flash` $\rightarrow$ `gemini-flash-latest` $\rightarrow$ `gemini-3.5-flash` $\rightarrow$ Local Knowledge Base Synthesis). You will never receive a blank response.

### 3. Frontend Returns `502 Backend returned HTML instead of JSON`
- **Cause**: Frontend Vite client is running, but backend server on port 5000 is stopped.
- **Solution**: Start the backend server by running `npm run server` or running `npm run dev` from the repository root.

### 4. Map Tiles Do Not Load in Offline Mode
- **Cause**: No active internet connection to download OpenStreetMap tiles.
- **Solution**: PFIS includes SVG coordinate fallbacks and pre-cached hospital markers ensuring hospital lists, distance calculations, and routing directions remain functional offline.

---

## 13. Roadmap

- [x] **Universal Light Mode Architecture**: Removed legacy media-based dark mode rules, standardizing on high-contrast WCAG 2.1 AAA accessibility.
- [x] **Gemini 3.6 Flash RAG Copilot**: Integrated 1,270+ Q&A static analyzer with hybrid BM25 search, source file citations, and interactive UI widget.
- [x] **6 Unified Role Portals**: Complete workflows for Patients, Doctors, ASHA Workers, Hospitals, Government, and Admin/Judge Mode.
- [x] **Continuous RAG Indexer**: Automated file hashing and hot re-indexing API (`POST /api/ai/reindex`).
- [ ] **ABDM (Ayushman Bharat Digital Mission) Sandbox Integration**: Direct M1/M2/M3 FHIR milestone health record exchange (`TODO: Planned for Q4 2026`).
- [ ] **Native Mobile Shell**: Capacitor/React Native wrapper for ASHA field worker Android tablets (`TODO: Planned for Q1 2027`).

---

## 14. Contribution Guidelines

We welcome contributions from public health technologists, developers, and researchers.

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/accessible-queue-routing
   ```
3. **Ensure Code Quality & Type Safety**:
   ```bash
   # In client/
   npm run build

   # In server/
   npx tsc --noEmit
   ```
4. **Update Knowledge Base Index**:
   ```bash
   npm run rag:index
   ```
5. **Commit Changes**: Use conventional commit messages (`feat: add rural transit dispatch tracker`).
6. **Open a Pull Request** describing your changes and testing procedures.

---

## 15. License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for full details.

```
Copyright (c) 2026 Learntagus Tech / PFIS Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

*For technical inquiries, public health partnerships, or evaluation questions, please contact the PFIS core engineering team.*
