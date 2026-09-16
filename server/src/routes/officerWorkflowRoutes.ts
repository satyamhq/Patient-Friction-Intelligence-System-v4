import { Router, Request, Response } from 'express';
import { officerWorkflowEngine, RawJourneyData } from '../intelligence/officerWorkflowEngine.js';

const router = Router();

// Sample population cohort for officer inspection and drill-down
const sampleJourneys: RawJourneyData[] = [
  {
    journeyId: 'JRN-2026-PAT-01',
    patientId: 'PAT-94021',
    patientName: 'Sunita Devi',
    age: 58,
    gender: 'Female',
    district: 'Patna District',
    village: 'Danapur Rural',
    primaryCondition: 'Severe Diabetic Retinopathy & Hypertension',
    facilityName: 'Patna Medical College Hospital (PMCH)',
    transitDistanceKm: 42,
    estimatedTransitHours: 3.5,
    expectedOopCostInr: 1850,
    dailyWageLossInr: 450,
    primaryLanguage: 'Bhojpuri',
    hospitalStaffLanguage: 'Hindi',
    hasCaregiverEscort: false,
    appointmentBooked: false,
    isAbhaLinked: false,
    isPmjayEligible: true,
    stagesCompleted: ['Symptom Onset'],
    observedDelaysMinutes: 110,
    previousDropoutsCount: 2,
  },
  {
    journeyId: 'JRN-2026-GAY-02',
    patientId: 'PAT-88124',
    patientName: 'Ramprasad Manjhi',
    age: 46,
    gender: 'Male',
    district: 'Gaya District',
    village: 'Bodhgaya Outskirts',
    primaryCondition: 'Chronic Obstructive Pulmonary Disease (COPD)',
    facilityName: 'Anugrah Narayan Magadh Medical College',
    transitDistanceKm: 34,
    estimatedTransitHours: 2.8,
    expectedOopCostInr: 1200,
    dailyWageLossInr: 500,
    primaryLanguage: 'Magahi',
    hospitalStaffLanguage: 'Hindi',
    hasCaregiverEscort: true,
    appointmentBooked: true,
    isAbhaLinked: true,
    isPmjayEligible: true,
    stagesCompleted: ['Symptom Onset', 'Transit'],
    observedDelaysMinutes: 65,
    previousDropoutsCount: 1,
  },
  {
    journeyId: 'JRN-2026-PUR-03',
    patientId: 'PAT-76503',
    patientName: 'Kavita Kumari',
    age: 23,
    gender: 'Female',
    district: 'Purnia District',
    village: 'Kasba Block',
    primaryCondition: 'High-Risk Antenatal Care (3rd Trimester Severe Anemia)',
    facilityName: 'Purnia Sadar Hospital',
    transitDistanceKm: 52,
    estimatedTransitHours: 4.2,
    expectedOopCostInr: 950,
    dailyWageLossInr: 300,
    primaryLanguage: 'Maithili',
    hospitalStaffLanguage: 'Hindi',
    hasCaregiverEscort: false,
    appointmentBooked: false,
    isAbhaLinked: true,
    isPmjayEligible: true,
    stagesCompleted: ['Symptom Onset'],
    observedDelaysMinutes: 135,
    previousDropoutsCount: 3,
  },
  {
    journeyId: 'JRN-2026-MUZ-04',
    patientId: 'PAT-61920',
    patientName: 'Mohammad Akhlaq',
    age: 62,
    gender: 'Male',
    district: 'Muzaffarpur District',
    village: 'Kanti Industrial Belt',
    primaryCondition: 'Ischemic Heart Disease (Follow-Up Angioplasty)',
    facilityName: 'Sri Krishna Medical College (SKMCH)',
    transitDistanceKm: 18,
    estimatedTransitHours: 1.2,
    expectedOopCostInr: 600,
    dailyWageLossInr: 400,
    primaryLanguage: 'Urdu',
    hospitalStaffLanguage: 'Hindi',
    hasCaregiverEscort: true,
    appointmentBooked: true,
    isAbhaLinked: true,
    isPmjayEligible: true,
    stagesCompleted: ['Symptom Onset', 'Transit', 'Registration'],
    observedDelaysMinutes: 30,
    previousDropoutsCount: 0,
  },
];

// 1. GET /cohort-journeys
router.get('/cohort-journeys', (req: Request, res: Response) => {
  const district = (req.query.district as string) || '';
  let list = sampleJourneys;
  if (district && district !== 'All') {
    list = list.filter((j) => j.district.toLowerCase().includes(district.toLowerCase()));
  }
  res.json({
    success: true,
    data: list,
    totalCount: list.length,
    timestamp: new Date().toISOString(),
  });
});

// 2. POST /verify-auth
router.post('/verify-auth', (req: Request, res: Response) => {
  const { officerName, role, district, officerBadge } = req.body;

  // Verify role has governance privileges
  const allowedRoles = ['government', 'admin', 'cmo', 'district_magistrate', 'health_officer'];
  const userRole = (role || '').toLowerCase();

  const isAuthorized = allowedRoles.includes(userRole) || userRole === 'all';
  if (!isAuthorized) {
    res.status(403).json({
      success: false,
      message: 'Access Denied: Insufficient security clearance for Public Health Officer Workflow.',
    });
    return;
  }

  const sessionToken = `AUTH-OFFICER-SESSION-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;

  res.json({
    success: true,
    verified: true,
    sessionToken,
    officer: {
      name: officerName || 'Dr. Arvind Sharma',
      role: role || 'Chief Medical Officer (CMO)',
      district: district || 'Patna District',
      officerBadge: officerBadge || 'GOV-HQ-8921',
      clearanceLevel: 'LEVEL-3-GOVERNMENT-RESTRICTED',
      sessionExpiresInHours: 8,
    },
  });
});

// 3. POST /validate-and-clean
router.post('/validate-and-clean', (req: Request, res: Response) => {
  const { rawJourney } = req.body;
  if (!rawJourney) {
    res.status(400).json({ success: false, message: 'rawJourney payload is required' });
    return;
  }

  const validation = officerWorkflowEngine.validateIngestion(rawJourney);
  if (!validation.isValid) {
    res.status(422).json({
      success: false,
      message: 'Data ingestion validation failed. Review schema errors and retry.',
      validation,
    });
    return;
  }

  const normalized = officerWorkflowEngine.cleanAndNormalize(rawJourney as RawJourneyData);
  res.json({
    success: true,
    validation,
    normalized,
  });
});

// 4. POST /analyze-friction
router.post('/analyze-friction', (req: Request, res: Response) => {
  const { rawJourney, normalized } = req.body;
  if (!rawJourney || !normalized) {
    res.status(400).json({ success: false, message: 'rawJourney and normalized payloads are required' });
    return;
  }

  const friction = officerWorkflowEngine.generateFrictionFingerprint(rawJourney, normalized);
  const interactions = officerWorkflowEngine.analyzeInteractions(rawJourney, friction);
  const risk = officerWorkflowEngine.evaluateCareFailureRisk(friction, interactions, rawJourney);

  res.json({
    success: true,
    friction,
    interactions,
    risk,
  });
});

// 5. POST /simulate-interventions
router.post('/simulate-interventions', (req: Request, res: Response) => {
  const { rawJourney, friction, risk } = req.body;
  if (!rawJourney || !friction || !risk) {
    res.status(400).json({ success: false, message: 'rawJourney, friction, and risk objects are required' });
    return;
  }

  const candidates = officerWorkflowEngine.simulateInterventions(rawJourney, friction, risk);
  res.json({
    success: true,
    candidates,
  });
});

// 6. POST /approve-intervention
router.post('/approve-intervention', (req: Request, res: Response) => {
  const { journeyId, selectedIntervention, officerName, officerRole, officerBadge, remarks } = req.body;

  if (!journeyId || !selectedIntervention || !officerName) {
    res.status(400).json({
      success: false,
      message: 'journeyId, selectedIntervention, and officerName are required for human approval sign-off.',
    });
    return;
  }

  const approvalRecord = officerWorkflowEngine.recordHumanApproval(
    journeyId,
    selectedIntervention,
    officerName,
    officerRole || 'Authorized Health Officer',
    officerBadge || 'GOV-SIG-001',
    remarks
  );

  res.json({
    success: true,
    approvalRecord,
    message: `Intervention ${selectedIntervention.id} successfully approved and dispatched under SLA tracking.`,
  });
});

// 7. POST /record-outcome
router.post('/record-outcome', (req: Request, res: Response) => {
  const {
    journeyId,
    interventionId,
    actualCompletionAchieved,
    actualDelayHours,
    predictedCompletionProb,
    patientSatisfactionScore,
    feedbackNotes,
  } = req.body;

  if (!journeyId || !interventionId || actualCompletionAchieved === undefined) {
    res.status(400).json({
      success: false,
      message: 'journeyId, interventionId, and actualCompletionAchieved are required.',
    });
    return;
  }

  const outcome = officerWorkflowEngine.recordOutcomeAndLearn(
    journeyId,
    interventionId,
    Boolean(actualCompletionAchieved),
    Number(actualDelayHours || 2),
    Number(predictedCompletionProb || 85),
    Number(patientSatisfactionScore || 5),
    feedbackNotes || 'Care successfully completed without abandonment.'
  );

  res.json({
    success: true,
    outcome,
    message: 'Outcome telemetry successfully logged. Population friction model retrained with updated weights.',
  });
});

// 8. GET /outcomes
router.get('/outcomes', (_req: Request, res: Response) => {
  const history = officerWorkflowEngine.getOutcomeHistory();
  res.json({
    success: true,
    data: history,
  });
});

export default router;
