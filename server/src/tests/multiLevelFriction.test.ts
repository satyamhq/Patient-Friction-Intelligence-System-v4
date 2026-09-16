import assert from 'assert';
import { multiLevelFrictionEngine } from '../intelligence/friction/multiLevelFrictionEngine.js';

async function runTests() {
  console.log('🧪 Starting Multi-Level Friction Engine Automated Test Suite...\n');

  // Test 1: Individual Friction Calculation
  console.log('Test 1: Individual Deterministic Calculation & Weights');
  const mockJourneyHigh = {
    journeyId: 'TEST-J1',
    patientId: 'P100',
    patientNameMasked: 'A*** K***',
    district: 'Patna',
    village: 'Phulwari Sharif',
    serviceCategory: 'Maternal & Child Health',
    frictionScore: 68,
    careFailureRisk: 52,
    travelDistanceKm: 32,
    travelTimeMinutes: 75,
    transportMode: 'Bus',
    transportCostInr: 320,
    dailyWageLossInr: 500,
    diagnosticChargesInr: 450,
    registrationWaitMinutes: 50,
    doctorWaitMinutes: 90,
    pharmacyWaitMinutes: 45,
    spokenLanguage: 'Bhojpuri',
    providerPrimaryLanguage: 'English',
    interpreterAvailable: false,
    digitalHealthRecordAccessible: false,
    ayushmanBharatVerified: true,
    priorAuthorizationDelayHours: 6,
    referredFromFacility: 'HWC',
    referredToFacility: 'AIIMS Patna',
    currentStage: 'CONSULTATION',
    stage1Score: 68,
    stage2Score: 72,
    stage3Score: 78,
    stage4Score: 65,
    stage5Score: 60,
  };

  const individualResult = multiLevelFrictionEngine.calculateIndividualFriction(mockJourneyHigh);
  assert(
    individualResult.overallFrictionScore >= 0 && individualResult.overallFrictionScore <= 100,
    'Friction score must be bounded between 0 and 100'
  );
  assert(
    individualResult.careFailureRisk >= 0 && individualResult.careFailureRisk <= 100,
    'Care failure risk must be bounded between 0 and 100'
  );
  assert(
    individualResult.completionProbability >= 0 && individualResult.completionProbability <= 100,
    'Completion probability must be bounded between 0 and 100'
  );
  assert(individualResult.stages.length === 5, 'Must contain exactly 5 journey stages');
  assert(
    individualResult.stages[0].stage === 'pre_visit_transit' &&
      individualResult.stages[4].stage === 'admin_insurance',
    'Journey stages must follow standard progression'
  );
  assert(
    individualResult.recommendation && individualResult.recommendation.responsibleAuthority,
    'Must include specific responsible authority recommendation'
  );
  console.log(
    `  ✅ Passed: Individual score=${individualResult.overallFrictionScore}, Tier=${individualResult.frictionTier}, FailureRisk=${individualResult.careFailureRisk}%`
  );

  // Test 2: Privacy Gate (Insufficient Data < 3 sample size)
  console.log('\nTest 2: Privacy Gate & Insufficient Data Handling (N < 3)');
  const sparseJourneys = [mockJourneyHigh]; // only 1 journey
  const sparseVillageResult = multiLevelFrictionEngine.aggregateVillageFriction(
    'Purnia',
    'Sparse Cohort',
    sparseJourneys as any
  );
  assert.strictEqual(
    sparseVillageResult.hasSufficientData,
    false,
    'Must trigger insufficient data gate when sample size < 3'
  );
  assert(
    sparseVillageResult.missingDataRequirements &&
      sparseVillageResult.missingDataRequirements.length > 0,
    'Must provide an explicit checklist of missing data requirements'
  );
  console.log(
    `  ✅ Passed: Privacy gate enforced for N=${sparseVillageResult.sampleSize}. Checklist items: ${sparseVillageResult.missingDataRequirements?.length}`
  );

  // Test 3: Village Aggregation with Sufficient Data (N >= 3)
  console.log('\nTest 3: Village Aggregation with Sufficient Data (N >= 3)');
  const mockJourneys = [
    mockJourneyHigh,
    { ...mockJourneyHigh, journeyId: 'TEST-J2', frictionScore: 65, travelDistanceKm: 25, transportCostInr: 200 },
    { ...mockJourneyHigh, journeyId: 'TEST-J3', frictionScore: 72, travelDistanceKm: 40, transportCostInr: 400 },
    { ...mockJourneyHigh, journeyId: 'TEST-J4', frictionScore: 58, travelDistanceKm: 15, transportCostInr: 100 },
  ];
  const villageResult = multiLevelFrictionEngine.aggregateVillageFriction(
    'Patna',
    'Phulwari Sharif',
    mockJourneys as any
  );
  assert.strictEqual(villageResult.hasSufficientData, true);
  assert(villageResult.sampleSize === 4);
  assert(villageResult.overallFrictionScore > 0, 'Aggregated friction score should be greater than 0');
  assert(villageResult.topBarriers.length > 0, 'Must identify top barriers');
  assert(villageResult.affectedCohorts.length > 0, 'Must segment vulnerable demographic cohorts');
  assert(
    villageResult.recommendation.level === 'village',
    'Must issue village-level recommendation'
  );
  console.log(
    `  ✅ Passed: Village score=${villageResult.overallFrictionScore}, Top Barrier=${villageResult.topBarriers[0]?.barrier}`
  );

  // Test 4: District Disparity & Systemic Aggregation
  console.log('\nTest 4: District Disparity Index & Systemic Bottlenecks');
  const districtJourneys = [
    ...mockJourneys,
    { ...mockJourneyHigh, village: 'Danapur', frictionScore: 30, travelDistanceKm: 5, transportCostInr: 50, stage1Score: 20 },
    { ...mockJourneyHigh, village: 'Danapur', frictionScore: 28, travelDistanceKm: 4, transportCostInr: 40, stage1Score: 18 },
    { ...mockJourneyHigh, village: 'Danapur', frictionScore: 32, travelDistanceKm: 6, transportCostInr: 60, stage1Score: 22 },
  ];
  const districtResult = multiLevelFrictionEngine.aggregateDistrictFriction(
    'Patna',
    districtJourneys as any
  );
  assert(districtResult.totalVillagesAssessed >= 2, 'Must assess multiple villages');
  assert(
    districtResult.interVillageDisparityIndex >= 0,
    'Disparity index must be a non-negative number'
  );
  assert(districtResult.systemicHotspots.length > 0, 'Must highlight systemic hotspots');
  assert(districtResult.facilityPerformance.length > 0, 'Must benchmark facility performance');
  console.log(
    `  ✅ Passed: District composite=${districtResult.overallDistrictScore}, Disparity Index=${districtResult.interVillageDisparityIndex} pts`
  );

  // Test 5: Cryptographic Digital Signature for Officer Approval
  console.log('\nTest 5: Human Officer Cryptographic SHA-256 Approval');
  const approval = multiLevelFrictionEngine.approveIntervention(
    'REC-TEST-1',
    'Dr. R. K. Verma',
    'Chief Medical Officer',
    'Approved under Emergency NHM Protocol',
    'Deploy Mobile Medical Unit'
  );
  assert(approval.approvalId.startsWith('APV-'), 'Approval ID must follow standard APV- prefix');
  assert(
    approval.signatureHash && approval.signatureHash.length === 64,
    'Must produce a valid 64-character SHA-256 hash'
  );
  assert.strictEqual(approval.status, 'DISPATCHED');
  console.log(`  ✅ Passed: Generated SHA-256 signature=${approval.signatureHash.substring(0, 16)}...`);

  console.log('\n🎉 ALL MULTI-LEVEL FRICTION TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
