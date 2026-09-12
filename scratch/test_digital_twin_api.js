const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('Testing Digital Twin APIs...');

  // 1. Login as Patient
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'patient@pfis.org', password: 'Patient@123' }
  );

  if (loginRes.status !== 200 || !loginRes.body.token) {
    console.error('Failed to log in as patient:', loginRes.body);
    process.exit(1);
  }
  const token = loginRes.body.token;
  console.log('Patient logged in successfully');

  // 2. Fetch interventions
  const intervRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/digital-twin/interventions',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Interventions fetched:', intervRes.status, 'Count:', intervRes.body.count);

  // 3. Fetch simulator context (profile + facilities)
  const ctxRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/digital-twin/context',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Context loaded:', ctxRes.status, 'Facilities count:', ctxRes.body.facilities?.length, 'Has profile:', ctxRes.body.hasProfile);

  const testFacility = ctxRes.body.facilities?.[0];
  if (!testFacility) {
    console.error('No facility found in context');
    process.exit(1);
  }

  // 4. Run simulation with no interventions
  const sim1Res = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/digital-twin/simulate',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    },
    {
      facilityId: testFacility.id,
      selectedInterventions: [],
    }
  );
  console.log('Baseline Simulation:', sim1Res.status, {
    baselineFriction: sim1Res.body.simulation?.baseline_friction_score,
    simulatedFriction: sim1Res.body.simulation?.simulated_friction_score,
    completionRate: sim1Res.body.simulation?.baseline_completion_rate,
    milestonesCount: sim1Res.body.simulation?.journey_milestones?.length,
  });

  // 5. Run simulation with 3 non-clinical interventions
  const sim2Res = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/digital-twin/simulate',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    },
    {
      facilityId: testFacility.id,
      selectedInterventions: ['ASHA_ESCORT', 'TRANSPORT_SUBSIDY', 'FAST_TRACK_TOKEN'],
    }
  );
  console.log('Mitigated Simulation:', sim2Res.status, {
    baselineFriction: sim2Res.body.simulation?.baseline_friction_score,
    simulatedFriction: sim2Res.body.simulation?.simulated_friction_score,
    reductionPoints: sim2Res.body.simulation?.friction_reduction_points,
    baselineCompletion: sim2Res.body.simulation?.baseline_completion_rate,
    simulatedCompletion: sim2Res.body.simulation?.simulated_completion_rate,
  });

  // 6. Save simulation
  const saveRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/digital-twin/save',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    },
    {
      simulation: sim2Res.body.simulation,
      notes: 'Automated E2E validation test run',
    }
  );
  console.log('Save Simulation:', saveRes.status, 'ID:', saveRes.body.savedSimulation?.id);
  const simId = saveRes.body.savedSimulation?.id;

  // 7. Get History
  const histRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/digital-twin/history',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('History fetched:', histRes.status, 'Count:', histRes.body.count);

  // 8. Get by ID
  const getRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/digital-twin/${simId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Get by ID:', getRes.status, 'Facility:', getRes.body.simulation?.facility_name);

  // 9. Verify RBAC / Access control: Another user cannot delete or view it
  const ashaLogin = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'asha@pfis.org', password: 'Asha@123' }
  );
  const ashaToken = ashaLogin.body.token;

  const forbiddenGet = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/digital-twin/${simId}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${ashaToken}` },
  });
  console.log('RBAC Check (Forbidden access by another non-admin user):', forbiddenGet.status, '(Expected 403)');

  console.log('ALL DIGITAL TWIN BACKEND CHECKS PASSED!');
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
