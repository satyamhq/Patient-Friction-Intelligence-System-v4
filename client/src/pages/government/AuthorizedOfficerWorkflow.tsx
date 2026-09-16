import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  TrendingDown,
  Activity,
  Layers,
  ArrowRight,
  Send,
  Lock,
  Eye,
  EyeOff,
  Clock,
  Building2,
  HeartPulse,
  Award,
  FileCheck,
  Sparkles,
  HelpCircle,
  FileText,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import {
  officerWorkflowService,
  RawJourneyData,
  IngestionValidationResult,
  NormalizedJourney,
  FrictionFingerprint,
  InteractionAnalysis,
  CareFailureRiskAssessment,
  InterventionCandidate,
  ApprovalRecord,
  OutcomeFeedback,
} from '../../services/officerWorkflowService';

export const AuthorizedOfficerWorkflow: React.FC = () => {
  // Navigation & Step tracking: 1 to 11
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [activeStage, setActiveStage] = useState<'DETECT' | 'ANALYZE' | 'INTERVENE' | 'MEASURE_LEARN'>('DETECT');

  // Step 1: Officer Auth
  const [officerName, setOfficerName] = useState('Dr. Arvind Sharma');
  const [officerRole, setOfficerRole] = useState('Chief Medical Officer (CMO)');
  const [officerDistrict, setOfficerDistrict] = useState('Patna District');
  const [officerBadge, setOfficerBadge] = useState('GOV-HQ-8921');
  const [isAuthVerified, setIsAuthVerified] = useState(false);
  const [sessionToken, setSessionToken] = useState('');

  // Step 2: Cohort & Journey Load
  const [cohortList, setCohortList] = useState<RawJourneyData[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<RawJourneyData | null>(null);
  const [unmaskPii, setUnmaskPii] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Step 3 & 4: Ingestion Validation & Normalization
  const [validationResult, setValidationResult] = useState<IngestionValidationResult | null>(null);
  const [normalizedJourney, setNormalizedJourney] = useState<NormalizedJourney | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [deliberateErrorMode, setDeliberateErrorMode] = useState(false);

  // Step 5, 6, 7: Friction & Risk Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [frictionFingerprint, setFrictionFingerprint] = useState<FrictionFingerprint | null>(null);
  const [interactionAnalysis, setInteractionAnalysis] = useState<InteractionAnalysis | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<CareFailureRiskAssessment | null>(null);

  // Step 8: What-If Simulation
  const [isSimulating, setIsSimulating] = useState(false);
  const [candidates, setCandidates] = useState<InterventionCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<InterventionCandidate | null>(null);

  // Step 9 & 10: Human Approval & Implementation
  const [isApproving, setIsApproving] = useState(false);
  const [approvalRecord, setApprovalRecord] = useState<ApprovalRecord | null>(null);
  const [officerRemarks, setOfficerRemarks] = useState('Verified high travel exhaustion and catastrophic OOP spending risk. Recommended for priority intervention.');

  // Step 11: Measure & Learn
  const [outcomeRecorded, setOutcomeRecorded] = useState<OutcomeFeedback | null>(null);
  const [actualCompleted, setActualCompleted] = useState(true);
  const [actualDelay, setActualDelay] = useState('3.2');
  const [satisfactionScore, setSatisfactionScore] = useState(5);
  const [outcomeNotes, setOutcomeNotes] = useState('Intervention arrived within SLA. Patient completed consultation and received free medications.');
  const [historicalOutcomes, setHistoricalOutcomes] = useState<OutcomeFeedback[]>([]);

  // Initial load
  useEffect(() => {
    loadCohorts();
    loadHistoricalOutcomes();
  }, []);

  // Sync active high-level stage with numerical step
  useEffect(() => {
    if (currentStep <= 4) setActiveStage('DETECT');
    else if (currentStep <= 7) setActiveStage('ANALYZE');
    else if (currentStep <= 10) setActiveStage('INTERVENE');
    else setActiveStage('MEASURE_LEARN');
  }, [currentStep]);

  const loadCohorts = async () => {
    try {
      const res = await officerWorkflowService.getCohortJourneys();
      if (res.data) {
        setCohortList(res.data);
        if (res.data.length > 0 && !selectedJourney) {
          setSelectedJourney(res.data[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load cohorts:', e);
    }
  };

  const loadHistoricalOutcomes = async () => {
    try {
      const res = await officerWorkflowService.getOutcomes();
      if (res.data) setHistoricalOutcomes(res.data);
    } catch (e) {
      console.error('Failed to load outcomes:', e);
    }
  };

  // Step 1: Verify Officer Login
  const handleVerifyAuth = async () => {
    try {
      const res = await officerWorkflowService.verifyAuth({
        officerName,
        role: officerRole,
        district: officerDistrict,
        officerBadge,
      });
      if (res.verified) {
        setIsAuthVerified(true);
        setSessionToken(res.sessionToken);
        setCurrentStep(2);
      }
    } catch (e) {
      alert('Authentication Failed: Check credentials or network connectivity.');
    }
  };

  // Step 3 & 4: Ingestion & Normalization
  const handleRunIngestionAndClean = async () => {
    if (!selectedJourney) return;
    setIsValidating(true);
    try {
      const payload = deliberateErrorMode
        ? { ...selectedJourney, primaryCondition: '', transitDistanceKm: -15 }
        : selectedJourney;

      const res = await officerWorkflowService.validateAndClean(payload);
      setValidationResult(res.validation);
      if (res.validation.isValid && res.normalized) {
        setNormalizedJourney(res.normalized);
        setCurrentStep(4);
      }
    } catch (err: any) {
      if (err.response?.data?.validation) {
        setValidationResult(err.response.data.validation);
      }
    } finally {
      setIsValidating(false);
    }
  };

  // Step 5, 6, 7: Friction & Risk Analysis
  const handleRunFrictionAndRiskAnalysis = async () => {
    if (!selectedJourney || !normalizedJourney) return;
    setIsAnalyzing(true);
    try {
      const res = await officerWorkflowService.analyzeFriction(selectedJourney, normalizedJourney);
      setFrictionFingerprint(res.friction);
      setInteractionAnalysis(res.interactions);
      setRiskAssessment(res.risk);
      setCurrentStep(6);
    } catch (e) {
      alert('Analysis execution failed.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 8: What-If Simulation
  const handleRunSimulation = async () => {
    if (!selectedJourney || !frictionFingerprint || !riskAssessment) return;
    setIsSimulating(true);
    try {
      const res = await officerWorkflowService.simulateInterventions(
        selectedJourney,
        frictionFingerprint,
        riskAssessment
      );
      setCandidates(res.candidates);
      const recommended = res.candidates.find((c) => c.recommended) || res.candidates[0];
      setSelectedCandidate(recommended);
      setCurrentStep(8);
    } catch (e) {
      alert('Simulation failed.');
    } finally {
      setIsSimulating(false);
    }
  };

  // Step 9: Human Officer Approval
  const handleApproveIntervention = async () => {
    if (!selectedJourney || !selectedCandidate) return;
    setIsApproving(true);
    try {
      const res = await officerWorkflowService.approveIntervention({
        journeyId: selectedJourney.journeyId,
        selectedIntervention: selectedCandidate,
        officerName,
        officerRole,
        officerBadge,
        remarks: officerRemarks,
      });
      setApprovalRecord(res.approvalRecord);
      setCurrentStep(10);
    } catch (e) {
      alert('Approval sign-off failed.');
    } finally {
      setIsApproving(false);
    }
  };

  // Step 11: Measure & Learn
  const handleRecordOutcome = async () => {
    if (!selectedJourney || !selectedCandidate || !riskAssessment) return;
    try {
      const res = await officerWorkflowService.recordOutcome({
        journeyId: selectedJourney.journeyId,
        interventionId: selectedCandidate.id,
        actualCompletionAchieved: actualCompleted,
        actualDelayHours: parseFloat(actualDelay) || 2.0,
        predictedCompletionProb: selectedCandidate.expectedCompletionProbAfterPct,
        patientSatisfactionScore: satisfactionScore,
        feedbackNotes: outcomeNotes,
      });
      setOutcomeRecorded(res.outcome);
      setHistoricalOutcomes((prev) => [res.outcome, ...prev]);
      setCurrentStep(11);
    } catch (e) {
      alert('Failed to record outcome.');
    }
  };

  const stepsList = [
    { num: 1, name: 'Officer Login', stage: 'DETECT' },
    { num: 2, name: 'Data Load & RBAC', stage: 'DETECT' },
    { num: 3, name: 'Data Validation', stage: 'DETECT' },
    { num: 4, name: 'Normalization', stage: 'DETECT' },
    { num: 5, name: 'Friction Engine', stage: 'ANALYZE' },
    { num: 6, name: 'Risk Model', stage: 'ANALYZE' },
    { num: 7, name: 'Decision Flow', stage: 'ANALYZE' },
    { num: 8, name: 'What-If Sim', stage: 'INTERVENE' },
    { num: 9, name: 'Human Approval', stage: 'INTERVENE' },
    { num: 10, name: 'Implementation', stage: 'INTERVENE' },
    { num: 11, name: 'Measure & Learn', stage: 'MEASURE_LEARN' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-16 select-none">
      {/* 1. Header with Core Product Loop */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Authorized Officer Healthcare Intelligence Workflow</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Care Failure Prevention & Intervention Console
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              End-to-end operational pipeline executing the closed-loop governance protocol:
              <strong className="text-white ml-1">DETECT → ANALYZE → INTERVENE → MEASURE → LEARN</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-blue-200">Stage:</span>
            <span className="px-3 py-1 rounded-lg bg-blue-600/40 text-white font-extrabold text-xs tracking-wider border border-blue-400/40 uppercase">
              {activeStage.replace('_', ' & ')}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Step-Based Journey Tracker Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[900px] gap-2">
          {stepsList.map((step, idx) => {
            const isDone = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <React.Fragment key={step.num}>
                <button
                  type="button"
                  onClick={() => {
                    if (isAuthVerified || step.num === 1) {
                      setCurrentStep(step.num);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-md'
                      : isDone
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'bg-slate-50 text-slate-400 opacity-60'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-white text-blue-600'
                        : isDone
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDone ? '✓' : step.num}
                  </span>
                  <span className="whitespace-nowrap">{step.name}</span>
                </button>
                {idx < stepsList.length - 1 && (
                  <div className={`h-0.5 w-3 shrink-0 ${currentStep > step.num ? 'bg-blue-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. Main Workflow Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stage Controls & Context Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Officer Login & Role Verification */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Step 1: Authorized Officer Verification</h2>
                  <p className="text-xs text-slate-500">
                    Verify statutory credentials before accessing patient journey and friction records
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Officer Name</label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Official Role</label>
                  <select
                    value={officerRole}
                    onChange={(e) => setOfficerRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Chief Medical Officer (CMO)">Chief Medical Officer (CMO)</option>
                    <option value="District Magistrate (DM)">District Magistrate (DM)</option>
                    <option value="District Public Health Officer">District Public Health Officer</option>
                    <option value="State Health Secretary (Admin)">State Health Secretary (Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Jurisdiction District</label>
                  <select
                    value={officerDistrict}
                    onChange={(e) => setOfficerDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Patna District">Patna District</option>
                    <option value="Gaya District">Gaya District</option>
                    <option value="Purnia District">Purnia District</option>
                    <option value="Muzaffarpur District">Muzaffarpur District</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Officer Security Badge</label>
                  <input
                    type="text"
                    value={officerBadge}
                    onChange={(e) => setOfficerBadge(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50/75 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Statutory Role-Based Access Control (RBAC)</span>
                  Section 33 of NDHM Guidelines mandates role verification before patient PII and travel barriers are decrypted.
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleVerifyAuth}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-6"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authenticate & Load Journeys</span>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: Cohort Selection & Data Load */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Step 2: Patient Journey Selection & Load</h2>
                  <p className="text-xs text-slate-500">
                    Inspecting population records authorized under {officerDistrict}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setUnmaskPii(!unmaskPii)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {unmaskPii ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{unmaskPii ? 'Mask PII (ABDM Mode)' : 'Unmask PII (Authorized)'}</span>
                </button>
              </div>

              {/* Patient Selector Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Journey ID</th>
                      <th className="py-2.5 px-3">Patient Name</th>
                      <th className="py-2.5 px-3">Condition</th>
                      <th className="py-2.5 px-3">Transit (km)</th>
                      <th className="py-2.5 px-3">OOP Cost</th>
                      <th className="py-2.5 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cohortList.map((j) => {
                      const isSelected = selectedJourney?.journeyId === j.journeyId;
                      return (
                        <tr
                          key={j.journeyId}
                          className={`hover:bg-slate-50 transition-colors ${
                            isSelected ? 'bg-blue-50/70 font-semibold' : ''
                          }`}
                        >
                          <td className="py-3 px-3 font-mono text-[11px] text-blue-700">{j.journeyId}</td>
                          <td className="py-3 px-3">
                            {unmaskPii ? j.patientName : `Patient ***${j.patientId.slice(-3)}`}
                            <div className="text-[10px] text-slate-400 font-normal">
                              {j.age}y, {j.gender} • {j.district}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-800 max-w-[200px] truncate">{j.primaryCondition}</td>
                          <td className="py-3 px-3">{j.transitDistanceKm} km ({j.estimatedTransitHours}h)</td>
                          <td className="py-3 px-3 font-medium text-slate-900">₹{j.expectedOopCostInr}</td>
                          <td className="py-3 px-3">
                            <button
                              type="button"
                              onClick={() => setSelectedJourney(j)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              {isSelected ? 'Loaded' : 'Select'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!selectedJourney}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <span>Proceed to Ingestion & Quality Validation</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 & 4: Ingestion Validation & Normalization */}
          {(currentStep === 3 || currentStep === 4) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {currentStep === 3 ? 'Step 3: Data Ingestion & Quality Validation' : 'Step 4: Cleaning & Normalization'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Evaluating schema integrity, temporal consistency, and FHIR standard readiness
                  </p>
                </div>

                {/* Test toggle to simulate data errors & recovery */}
                <button
                  type="button"
                  onClick={() => {
                    setDeliberateErrorMode(!deliberateErrorMode);
                    setValidationResult(null);
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold ${
                    deliberateErrorMode
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-slate-50 border-slate-300 text-slate-600'
                  }`}
                >
                  {deliberateErrorMode ? 'Mode: Simulated Corrupt Record' : 'Mode: Clean Record'}
                </button>
              </div>

              {!validationResult ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                  <Database className="w-8 h-8 text-blue-600 mx-auto animate-bounce" />
                  <h3 className="text-sm font-bold text-slate-800">Ready to Ingest Journey {selectedJourney?.journeyId}</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    System will run 8 automated validation checks (missing values, timestamp order, distance coordinates, vitals plausibility).
                  </p>
                  <Button
                    onClick={handleRunIngestionAndClean}
                    disabled={isValidating}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isValidating ? 'Validating...' : 'Run Automated Ingestion Check'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Validation Quality Scorecard */}
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      validationResult.isValid
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {validationResult.isValid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-sm">
                          {validationResult.isValid ? 'Data Ingestion Quality Passed' : 'Ingestion Quality Errors Found'}
                        </div>
                        <div className="text-xs opacity-90">
                          Completeness Score: {validationResult.completenessScore}% • Grade: {validationResult.qualityGrade}
                        </div>
                      </div>
                    </div>

                    {!validationResult.isValid && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setDeliberateErrorMode(false);
                          setTimeout(() => handleRunIngestionAndClean(), 100);
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
                      >
                        Auto-Recover Data
                      </Button>
                    )}
                  </div>

                  {/* Errors & Recovery Suggestions */}
                  {validationResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Identified Issues & Recovery Actions:</div>
                      {validationResult.errors.map((err, i) => (
                        <div key={i} className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                          <span className="font-bold">{err.field}:</span> {err.issue}
                          <span className="ml-auto text-rose-700 font-semibold italic">Action: {err.recoveryAction}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Normalized Data Preview */}
                  {normalizedJourney && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 uppercase">Normalized Journey Pipeline (FHIR Compliant):</span>
                        <span className="text-[11px] text-slate-500">ID: {normalizedJourney.patientMaskedId}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                          <div className="text-slate-400 text-[10px]">Transit Index</div>
                          <div className="font-bold text-slate-900">{normalizedJourney.transitIndex * 100}/100</div>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                          <div className="text-slate-400 text-[10px]">Wage Loss Ratio</div>
                          <div className="font-bold text-slate-900">{normalizedJourney.financialBurdenRatio * 100}%</div>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                          <div className="text-slate-400 text-[10px]">Linguistic Dissonance</div>
                          <div className={`font-bold ${normalizedJourney.linguisticDissonance ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {normalizedJourney.linguisticDissonance ? 'Detected' : 'None'}
                          </div>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                          <div className="text-slate-400 text-[10px]">Caregiver Escort</div>
                          <div className={`font-bold ${normalizedJourney.escortDeficit ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {normalizedJourney.escortDeficit ? 'Deficit' : 'Present'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back to Journey Load
                </Button>
                <Button
                  onClick={() => {
                    setCurrentStep(5);
                    handleRunFrictionAndRiskAnalysis();
                  }}
                  disabled={!validationResult?.isValid || !normalizedJourney}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <span>Execute Friction & Risk Intelligence</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5, 6, 7: Friction Engine, Fingerprint & Care Failure Risk Model */}
          {(currentStep === 5 || currentStep === 6 || currentStep === 7) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {currentStep === 5
                      ? 'Step 5: Friction Engine & Barrier Fingerprint'
                      : currentStep === 6
                      ? 'Step 6: Care Failure Risk Model'
                      : 'Step 7: Risk-Based Decision Flow'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Multi-axial non-clinical barrier quantification and completion probability calculation
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRunFrictionAndRiskAnalysis}
                  disabled={isAnalyzing}
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  Re-evaluate
                </Button>
              </div>

              {frictionFingerprint && riskAssessment && (
                <div className="space-y-6">
                  {/* PFI Score & Risk Tier Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1">
                      <span className="text-[10px] text-blue-300 uppercase font-bold tracking-wider">Patient Friction Index</span>
                      <div className="text-3xl font-extrabold text-blue-400">{frictionFingerprint.compositePfiScore}/100</div>
                      <p className="text-[11px] text-slate-300">Bottleneck: {frictionFingerprint.primaryBottleneck}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1">
                      <span className="text-[10px] text-blue-300 uppercase font-bold tracking-wider">Completion Probability</span>
                      <div className="text-3xl font-extrabold text-emerald-400">{riskAssessment.completionProbabilityPct}%</div>
                      <p className="text-[11px] text-slate-300">Failure Risk: {riskAssessment.failureRiskScore}%</p>
                    </div>

                    <div className={`p-4 rounded-xl text-white space-y-1 ${
                      riskAssessment.riskTier === 'CRITICAL' ? 'bg-red-700' :
                      riskAssessment.riskTier === 'HIGH' ? 'bg-amber-600' : 'bg-emerald-700'
                    }`}>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">Care Failure Risk Tier</span>
                      <div className="text-3xl font-extrabold">{riskAssessment.riskTier}</div>
                      <p className="text-[11px] opacity-90">Decision: {riskAssessment.decisionFlow.replace('_', ' ')}</p>
                    </div>
                  </div>

                  {/* Multi-Axial Friction Fingerprint */}
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Friction Fingerprint (Barrier Vectors):</div>
                    <div className="space-y-2.5">
                      {frictionFingerprint.barrierVector.map((b, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-800">{b.axis}</span>
                            <span className="font-bold text-blue-700">{b.magnitude}/100</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                b.magnitude >= 75 ? 'bg-red-600' : b.magnitude >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${b.magnitude}%` }}
                            />
                          </div>
                          <div className="text-[11px] text-slate-500">{b.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Contributing Risk Drivers */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <span className="text-xs font-bold text-slate-800 uppercase">Top Impending Care Failure Drivers:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {riskAssessment.topRiskDrivers.map((driver, i) => (
                        <div key={i} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{driver.driver}</span>
                            <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                              {driver.weightPct}% Impact
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] leading-relaxed">{driver.impact}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
                <Button
                  onClick={() => {
                    setCurrentStep(8);
                    handleRunSimulation();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <span>Activate What-If Intervention Simulator</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 8: What-If Intervention Simulator */}
          {currentStep === 8 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Step 8: What-If Intervention Simulator</h2>
                  <p className="text-xs text-slate-500">
                    Simulate alternative operational policies, cost, timeline, and projected risk reduction
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={handleRunSimulation} disabled={isSimulating}>
                  <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isSimulating ? 'animate-spin' : ''}`} />
                  Re-simulate
                </Button>
              </div>

              <div className="space-y-3">
                {candidates.map((cand) => {
                  const isSelected = selectedCandidate?.id === cand.id;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => setSelectedCandidate(cand)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700">{cand.id}</span>
                          <h3 className="font-bold text-slate-900 text-sm">{cand.title}</h3>
                          {cand.recommended && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                              Recommended
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-900">₹{cand.costInr} • SLA {cand.implementationHours}h</span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1">{cand.description}</p>
                      <div className="text-[11px] text-slate-500 mt-1">Responsible Authority: {cand.responsibleAuthority}</div>

                      <div className="mt-3 pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Risk Reduction</span>
                          <span className="font-bold text-emerald-600">-{cand.expectedRiskReductionPct}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">New Completion Prob</span>
                          <span className="font-bold text-blue-600">{cand.expectedCompletionProbAfterPct}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Projected QALY Saved</span>
                          <span className="font-bold text-purple-600">+{cand.projectedQalySaved} yrs</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" onClick={() => setCurrentStep(6)}>
                  Back to Risk Model
                </Button>
                <Button
                  onClick={() => setCurrentStep(9)}
                  disabled={!selectedCandidate}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <span>Submit for Human Officer Approval</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 9: Human Officer Approval */}
          {currentStep === 9 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Step 9: Human Officer Decision & Authorization</h2>
                  <p className="text-xs text-slate-500">
                    Statutory Requirement: Consequential public health interventions require authorized officer sign-off
                  </p>
                </div>
              </div>

              {selectedCandidate && selectedJourney && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div className="font-bold text-slate-900 text-sm">Reviewing Intervention Dossier:</div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div><strong>Patient:</strong> {selectedJourney.patientName} ({selectedJourney.journeyId})</div>
                    <div><strong>Selected Action:</strong> {selectedCandidate.title}</div>
                    <div><strong>Target Authority:</strong> {selectedCandidate.responsibleAuthority}</div>
                    <div><strong>Implementation SLA:</strong> {selectedCandidate.implementationHours} Hours</div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Officer Clinical/Administrative Remarks</label>
                    <textarea
                      rows={3}
                      value={officerRemarks}
                      onChange={(e) => setOfficerRemarks(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                    <strong>Digital Signature Attestation:</strong> By clicking approve, an immutable SHA-256 cryptographic signature is recorded in the state health ledger under {officerName} ({officerBadge}).
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" onClick={() => setCurrentStep(8)}>
                  Back to Simulator
                </Button>
                <Button
                  onClick={handleApproveIntervention}
                  disabled={isApproving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{isApproving ? 'Signing & Dispatching...' : 'Digitally Authorize & Dispatch Intervention'}</span>
                </Button>
              </div>
            </div>
          )}

          {/* STEP 10: Implementation & Live Tracking */}
          {currentStep === 10 && approvalRecord && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Step 10: Intervention Implementation & Tracking</h2>
                    <p className="text-xs text-slate-500">Live deployment dispatched under official governance directive</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                  Status: {approvalRecord.dispatchStatus}
                </span>
              </div>

              {/* Digital Signature Credentials */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-blue-300 font-bold">Approval ID: {approvalRecord.approvalId}</span>
                  <span className="text-slate-400">{new Date(approvalRecord.approvedAt).toLocaleTimeString()}</span>
                </div>
                <div className="font-mono text-[10px] text-slate-300 break-all">
                  SHA-256 Signature Hash: {approvalRecord.digitalSignatureHash}
                </div>
                <div className="text-[11px] text-slate-300">
                  Authorized By: {approvalRecord.officerName} ({approvalRecord.officerRole}) • Badge: {approvalRecord.officerBadge}
                </div>
              </div>

              {/* SLA & Progress Tracker */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">Intervention SLA Countdown</span>
                  <span className="font-bold text-blue-600">{approvalRecord.implementationSlaHours}h 00m Remaining</span>
                </div>

                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 w-1/3 rounded-full animate-pulse" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1">
                  <div>1. Dispatched (Done)</div>
                  <div className="font-semibold text-blue-700">2. En Route to Village</div>
                  <div className="text-slate-400">3. Resolution Completed</div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="outline" onClick={() => setCurrentStep(9)}>
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(11)}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <span>Proceed to Measure & Learn Loop</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 11: Measure → Learn Feedback Loop */}
          {currentStep === 11 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Step 11: Measure → Learn Feedback Loop</h2>
                  <p className="text-xs text-slate-500">
                    Compare actual outcomes vs algorithmic predictions to continuously retrain population friction models
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Care Journey Completed?</label>
                  <select
                    value={actualCompleted ? 'yes' : 'no'}
                    onChange={(e) => setActualCompleted(e.target.value === 'yes')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none font-bold"
                  >
                    <option value="yes">Yes - Care Successfully Completed</option>
                    <option value="no">No - Premature Abandonment Occurred</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Actual Observed Delay (Hours)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={actualDelay}
                    onChange={(e) => setActualDelay(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Patient Satisfaction Score (1-5)</label>
                  <select
                    value={satisfactionScore}
                    onChange={(e) => setSatisfactionScore(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5/5) Exceptional Resolution</option>
                    <option value={4}>⭐⭐⭐⭐ (4/5) High Satisfaction</option>
                    <option value={3}>⭐⭐⭐ (3/5) Moderate Resolution</option>
                    <option value={2}>⭐⭐ (2/5) Residual Friction</option>
                    <option value={1}>⭐ (1/5) Care Barrier Unresolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Field Feedback Notes</label>
                  <input
                    type="text"
                    value={outcomeNotes}
                    onChange={(e) => setOutcomeNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleRecordOutcome}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Feed Outcome into Population Intelligence</span>
                </Button>
              </div>

              {outcomeRecorded && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1.5 animate-in fade-in text-xs">
                  <div className="font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Outcome Feedback Retrained Model Successfully!</span>
                  </div>
                  <div>Model Version Updated: <code className="font-mono">{outcomeRecorded.retrainedModelVersion}</code></div>
                  <div>Prediction Accuracy Delta: <strong>{outcomeRecorded.accuracyDeltaPct}%</strong></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Statutory Summary & Live Audit Log */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Officer Identity Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Authorized Officer</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isAuthVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isAuthVerified ? 'Session Active' : 'Unauthenticated'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                {officerName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{officerName}</div>
                <div className="text-xs text-slate-500">{officerRole}</div>
                <div className="text-[10px] text-blue-600 font-semibold">{officerDistrict} • {officerBadge}</div>
              </div>
            </div>
          </div>

          {/* Current Loaded Patient Summary */}
          {selectedJourney && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-400 uppercase">Loaded Journey Dossier</span>
                <span className="text-xs font-mono text-blue-600 font-bold">{selectedJourney.journeyId}</span>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Patient</span>
                  <span className="font-bold text-slate-900">
                    {unmaskPii ? selectedJourney.patientName : `Patient ***${selectedJourney.patientId.slice(-3)}`} ({selectedJourney.age}y, {selectedJourney.gender})
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Chief Clinical Condition</span>
                  <span className="font-semibold text-slate-800">{selectedJourney.primaryCondition}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Destination Hospital</span>
                  <span className="font-medium text-slate-800">{selectedJourney.facilityName}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Transit Catchment</span>
                    <span className="font-bold text-slate-900">{selectedJourney.transitDistanceKm} km</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Expected OOP Spend</span>
                    <span className="font-bold text-slate-900">₹{selectedJourney.expectedOopCostInr}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Historical Outcomes & Retrained Intelligence Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase">Historical Learning Loop</span>
              <span className="text-[10px] text-purple-600 font-bold">Retrained Weights</span>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {historicalOutcomes.map((out) => (
                <div key={out.outcomeId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{out.journeyId}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                      Accuracy Delta: {out.accuracyDeltaPct}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{out.feedbackNotes}</p>
                  <div className="text-[10px] text-slate-400 font-mono pt-1">{out.retrainedModelVersion}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
