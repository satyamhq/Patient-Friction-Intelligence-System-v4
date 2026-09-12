# Patient Friction Intelligence System (PFIS)

A non-clinical healthcare accessibility analysis and operational routing platform designed to evaluate and address logistical, geographic, and administrative barriers to healthcare access.

> **NON-CLINICAL MANDATE**
>
> PFIS focuses solely on operational, geographic, and accessibility barriers to healthcare.
> - Does **not** diagnose medical conditions or diseases.
> - Does **not** predict medical outcomes or provide clinical prognoses.
> - Does **not** prescribe or recommend pharmaceutical treatments.
> - Does **not** replace licensed healthcare providers.

---

## 1. Project Overview

PFIS identifies non-clinical friction factors that cause patients—particularly in rural, elderly, and socio-economically vulnerable populations—to drop out of healthcare journeys before completing consultations or treatments. The system evaluates logistical obstacles, estimates journey completion likelihood, and models the potential impact of community-level interventions (such as transport shuttles or point-of-care diagnostics) under budget constraints.

---

## 2. Problem Statement

In public health systems, physical presence of a facility does not guarantee practical access. Significant non-clinical friction includes:
- **Travel Distance and Road Conditions**: Rural transit over unpaved routes without direct connectivity.
- **Transport Availability and Scheduling**: Infrequent public buses and costly private transit options.
- **Wage Loss Constraints**: Morning outpatient schedules conflicting with daily-wage earning hours.
- **Digital and Language Hurdles**: Incompatibility with app-only portals and lack of vernacular support.
- **Documentation Requirements**: Fragmented scheme verification cards and identification records.

PFIS models these dimensions to help operational staff and administrators identify bottlenecks and evaluate support mechanisms.

---

## 3. Core Functionality

1. **Deterministic Friction Engine (8 Dimensions)**:
   Evaluates patient friction on a 0–100 scale across eight weighted dimensions:
   - Travel Distance & Terrain (weight: 0.15)
   - Transport Availability (weight: 0.18)
   - Digital Access & Literacy (weight: 0.12)
   - Language Comprehension (weight: 0.08)
   - Caregiver / Family Support (weight: 0.12)
   - Documentation Readiness (weight: 0.10)
   - Indirect Costs (weight: 0.15)
   - Appointment Timing Inflexibility (weight: 0.10)

2. **Care Risk & Bottleneck Evaluation**:
   Calculates an operational completion probability from composite friction scores and isolates the primary journey bottleneck stage.

3. **9-Stage Care Journey Progression**:
   Tracks longitudinal operational stages:
   `Medical Need` → `Hospital Search` → `Travel` → `Transport` → `Appointment` → `Hospital Visit` → `Service` → `Treatment` → `Follow-up`.

4. **Digital Twin Journey Simulator (7 Milestones)**:
   Interactive simulation modeling patient transit, queue verification, and diagnostic fulfillment under selected support policies.

5. **What-If Intervention Simulator**:
   Deterministic scenario simulator modeling estimated care completion gains from configurable intervention parameters (shuttles, satellite diagnostic camps, community escorts).

6. **Intervention Budget Optimizer**:
   Exact 0/1 knapsack optimization algorithm selecting an optimal portfolio of community interventions to maximize estimated completion gains within a defined budget ceiling.

7. **Hospital Discovery & Routing**:
   Discovers healthcare facilities within a geographic radius using external geographic providers (OpenStreetMap / Google Places API) and provides turn-by-turn routing links.

8. **WCAG 2.1 Accessibility Toolbar**:
   Client-side controls for text scaling (100%, 112%, 125%), high-contrast themes, simplified language toggling, text-to-speech reading, and reduced motion.

---

## 4. Architecture

```
                      +-----------------------------+
                      |   React 18 Frontend (Vite)  |
                      |  Multilingual / WCAG / Maps |
                      +--------------+--------------+
                                     | HTTP / REST
                                     v
                      +-----------------------------+
                      |   Express.js API Layer      |
                      |  Auth, RBAC, Rate Limiting  |
                      +--------------+--------------+
                                     |
           +-------------------------+-------------------------+
           |                         |                         |
           v                         v                         v
+--------------------+    +--------------------+    +--------------------+
|  Friction Engine   |    | What-If Simulator  |    | External Services  |
|  8-Dimension Math  |    | Knapsack Optimizer |    | Nominatim / Maps   |
+--------------------+    +--------------------+    +--------------------+
           |                         |
           +-------------------------+
                                     |
                                     v
                      +-----------------------------+
                      | Database Abstraction Layer  |
                      | PostgreSQL / MySQL / SQL-FS |
                      +-----------------------------+
```

---

## 5. Technology Stack

- **Frontend**:
  - React 18, TypeScript, Vite
  - Tailwind CSS, Lucide Icons
  - Leaflet / React-Leaflet (Mapping)
  - i18next (11 vernacular language localizations)

- **Backend**:
  - Node.js, Express.js, TypeScript (`tsx`)
  - Database Abstraction Layer (`IDatabaseClient`)
  - Helmet (security headers), Rate Limiter, Morgan (HTTP logging)
  - Bcrypt.js, JSON Web Tokens (JWT)

---

## 6. Setup & Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation
```bash
# 1. Install root dependencies
npm install

# 2. Install server dependencies
cd server && npm install

# 3. Install client dependencies
cd ../client && npm install
```

### Running the System
From the repository root:
```bash
# Concurrently start backend (port 5000) and frontend (port 5173)
npm run dev
```

Or start components individually:
```bash
# Terminal 1: Backend API
cd server && npm run dev

# Terminal 2: Frontend Client
cd client && npm run dev
```

The client will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.

---

## 7. Environment Variables

Create or update `.env` in the root directory or `server/`:

```env
PORT=5000
DATABASE_TYPE=auto

# Optional external databases (if omitted, Embedded SQL is used automatically):
# DATABASE_URL=postgresql://postgres:password@localhost:5432/pfis
# DATABASE_URL=mysql://root:password@localhost:3306/pfis

JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Optional external integrations:
GOOGLE_MAPS_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## 8. Database Architecture

PFIS utilizes a database abstraction layer (`IDatabaseClient`) capable of connecting to PostgreSQL, MySQL, or an Embedded Relational SQL storage engine (`server/data/pfis_relational.json`) requiring zero external installation.

The relational schema comprises 26 operational tables:
1. `users` — Authentication credentials and system roles
2. `patient_profiles` — Socio-geographic and non-clinical access determinants
3. `hospitals` — Healthcare facilities and infrastructure parameters
4. `hospital_services` — Departments, fees, and token capacities
5. `doctor_profiles` — Staff rosters and departmental assignments
6. `asha_profiles` — Community health worker records and coverage zones
7. `government_profiles` — Public health administrative accounts
8. `feature_flags` — Dynamic system configuration toggles
9. `appointments` — Care journey stage records and OPD bookings
10. `teleconsultations` — Remote navigation sessions
11. `friction_profiles` — Calculated 8-dimension friction records
12. `friction_factors` — Decomposed dimensional barrier factors
13. `accessibility_risks` — Risk assessments and bottleneck stages
14. `requests` — Transit, escort, and token inquiries
15. `documents` — Metadata for patient identity and referral records
16. `notifications` — Operational status messages
17. `audit_logs` — Activity tracking and security logging
18. `public_health_triage` — Non-clinical facility tier recommendations
19. `referrals` — Inter-facility referral records
20. `health_records` — Non-clinical health status summaries
21. `diagnostics` — Diagnostic facility profiles
22. `diagnostic_bookings` — Appointment records for investigative tests
23. `essential_medicines` — Essential Drug List (EDL) inventory records
24. `high_risk_registry` — Frontline records for follow-up tracking
25. `frontline_tasks` — Assigned tasks for community health workers
26. `emergency_dispatches` — Transport dispatch logs

---

## 9. API Endpoints

### Authentication
- `POST /api/auth/register` — Register a new patient account
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Current authenticated session profile

### Patients
- `GET /api/patients/me` — Authenticated patient profile
- `PUT /api/patients/me` — Update patient accessibility attributes
- `GET /api/patients/me/friction` — Calculate 8-dimension friction score
- `GET /api/patients/me/risk` — Compute care completion probability and bottlenecks
- `GET /api/patients/me/journey` — Retrieve 9-stage care progression

### Hospitals
- `GET /api/hospitals/nearby` — Query facilities within coordinate radius
- `GET /api/hospitals/:id` — Detailed facility profile and department schedules

### Intelligence & Simulation
- `POST /api/simulation/run` — Run deterministic What-If intervention model
- `POST /api/simulation/optimize` — Run 0/1 knapsack portfolio optimizer
- `GET /api/admin/care-failure` — Retrieve operational barrier attribution distribution
- `GET /api/admin/care-leakage` — Retrieve 6-milestone retention funnel data

### System
- `GET /api/health` — Service health check and database engine status

---

## 10. Demo Accounts

For local evaluation, the seeded dataset includes:

| Role | Email | Password | Primary Interface |
|---|---|---|---|
| **System Admin** | `admin@pfis.org` | `Admin@123` | Administrative dashboards, What-If simulator, audit logs |
| **Demo Patient** | `patient@pfis.org` | `Patient@123` | Friction profile, hospital discovery, journey timeline |
| **Hospital Staff** | `staff@hospital.org` | `Hospital@123` | Token queue, facility capacity management |

---

## 11. Data Classification and System Limitations

1. **Non-Clinical Scope**:
   PFIS analyzes operational and logistical constraints (transit distance, travel availability, language, documentation, costs). It is not a diagnostic tool and does not evaluate clinical pathology.

2. **Deterministic and Heuristic Modeling**:
   Calculations in the Friction Engine, Risk Engine, and What-If Simulator are deterministic models derived from weighted formulas and configurable assumptions. They do not represent causal DAGs, machine learning inferences, or clinical studies.

3. **External and Demonstration Data**:
   - **Geographic Data**: Facility names, addresses, and coordinates are queried from OpenStreetMap (Nominatim / Overpass) or Google Places API when configured.
   - **Simulated Operational Fields**: Real-time hospital operational parameters (such as live bed occupancy, instantaneous OPD token counts, doctor rosters, and ambulance availability) reflect prototype demonstration data and are not verified against real-world hospital management systems.
   - **Evaluation Cohort Data**: Cohort metrics (such as the 1,000-case care failure distribution and leakage milestones) are synthetic demonstration benchmarks intended to showcase system functionality.

---

## 12. Deployment on Render

PFIS includes a production-tested Infrastructure-as-Code Blueprint (`render.yaml`) for zero-configuration, automated deployment on [Render](https://render.com).

### Deployment Architecture

The application is deployed as two decoupled cloud services:

1. **Backend Web Service (`pfis-backend`)**:
   - **Runtime**: Node.js (Express TypeScript)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` (executes compiled `dist/server.js`)
   - **Health Check Endpoint**: `/health` (integrated with Render's zero-downtime rolling deployment orchestrator)
   - **Database**: Zero-configuration Embedded Relational SQL storage engine (or PostgreSQL/MySQL when `DATABASE_URL` is set)
   - **CORS**: Automatically configured for all `*.onrender.com` origins and custom client domains

2. **Frontend Static Site (`pfis-frontend`)**:
   - **Runtime**: Static Site (Vite React SPA)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **SPA Routing**: Automatic fallback rewrite (`/* -> /index.html`) via Blueprint rules and `client/public/_redirects`

### 1-Click Blueprint Setup

1. Push this repository to your GitHub or GitLab account.
2. In the **Render Dashboard**, click **New +** and select **Blueprint**.
3. Connect this repository. Render will automatically parse `render.yaml`.
4. Click **Apply**. Render will orchestrate the deployment of both services in parallel.

### Production Environment Variables

| Variable | Service | Required | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | `pfis-backend` | Yes | Set to `production` |
| `CLIENT_URL` | `pfis-backend` | Yes | Origin of the deployed frontend static site |
| `SERVER_URL` | `pfis-backend` | Yes | Origin of the deployed backend service |
| `JWT_SECRET` | `pfis-backend` | Yes | Auto-generated 256-bit secret for signing JWTs |
| `DATABASE_TYPE` | `pfis-backend` | No | Default `auto` uses embedded relational engine; or set to `postgres` / `mysql` |
| `DATABASE_URL` | `pfis-backend` | No | Connection string for external PostgreSQL / MySQL instance |
| `VITE_API_URL` | `pfis-frontend` | Yes | Public URL pointing to your backend `/api` endpoint |
| `GOOGLE_CLIENT_ID` | Both | Optional | Client ID for Google OAuth authentication |
| `GOOGLE_CLIENT_SECRET` | `pfis-backend` | Optional | Secret key for Google OAuth verification |

