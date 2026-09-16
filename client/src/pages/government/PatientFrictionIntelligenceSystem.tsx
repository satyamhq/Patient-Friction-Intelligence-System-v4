import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Database,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Flame,
  Globe,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  Percent,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  multiLevelFrictionService,
  FrictionTier,
  IIndividualFrictionResult,
  IVillageFrictionResult,
  IDistrictFrictionResult,
  IDistrictHierarchy,
  IRecommendation,
} from '../../services/multiLevelFrictionService';

type AnalysisLevel = 'INDIVIDUAL' | 'VILLAGE' | 'DISTRICT' | 'LEDGER';

export const PatientFrictionIntelligenceSystem: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Navigation & Level State
  const [activeLevel, setActiveLevel] = useState<AnalysisLevel>('INDIVIDUAL');
  const [highContrast, setHighContrast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Hierarchy Data
  const [hierarchy, setHierarchy] = useState<IDistrictHierarchy[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Patna');
  const [selectedVillage, setSelectedVillage] = useState<string>('Phulwari Sharif');

  // Individual Level State
  const [journeysList, setJourneysList] = useState<any[]>([]);
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>('');
  const [individualResult, setIndividualResult] = useState<IIndividualFrictionResult | null>(null);

  // Village Level State
  const [villageResult, setVillageResult] = useState<IVillageFrictionResult | null>(null);

  // District Level State
  const [districtResult, setDistrictResult] = useState<IDistrictFrictionResult | null>(null);

  // Interventions Ledger State
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);

  // Modals & Action States
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);
  const [simulationCandidate, setSimulationCandidate] = useState<any>(null);
  const [simulationBudget, setSimulationBudget] = useState<number>(50000);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [activeRecommendation, setActiveRecommendation] = useState<IRecommendation | null>(null);
  const [officerName, setOfficerName] = useState<string>(user?.name || 'Dr. R. K. Verma, CMO');
  const [officerRole, setOfficerRole] = useState<string>('Chief District Medical Officer (CDMO)');
  const [approvalRemarks, setApprovalRemarks] = useState<string>(
    'Approved for immediate administrative deployment under National Health Mission Bihar protocol.'
  );
  const [approving, setApproving] = useState(false);
  const [approvalSuccessRecord, setApprovalSuccessRecord] = useState<any>(null);

  const [outcomeModalOpen, setOutcomeModalOpen] = useState(false);
  const [selectedApprovalForOutcome, setSelectedApprovalForOutcome] = useState<any>(null);
  const [outcomeCompleted, setOutcomeCompleted] = useState(true);
  const [outcomeDelayHours, setOutcomeDelayHours] = useState(2);
  const [outcomeRating, setOutcomeRating] = useState(5);
  const [outcomeNotes, setOutcomeNotes] = useState(
    'Intervention deployed within SLA. Patient successfully completed secondary care with zero out-of-pocket leakage.'
  );
  const [recordingOutcome, setRecordingOutcome] = useState(false);

  // Initial Data Fetch
  useEffect(() => {
    loadHierarchyAndJourneys();
  }, []);

  const loadHierarchyAndJourneys = async () => {
    setIsLoading(true);
    try {
      const [hier, journeys] = await Promise.all([
        multiLevelFrictionService.getHierarchy(),
        multiLevelFrictionService.getAllJourneys(),
      ]);
      setHierarchy(hier);
      setJourneysList(journeys);

      if (hier.length > 0) {
        setSelectedDistrict(hier[0].district);
        if (hier[0].villages.length > 0) {
          setSelectedVillage(hier[0].villages[0].village);
        }
      }

      if (journeys.length > 0) {
        setSelectedJourneyId(journeys[0].journeyId);
        loadIndividual(journeys[0].journeyId);
      }
    } catch (err) {
      showToast('Failed to initialize Multi-Level Friction Data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Switch Level Listeners
  useEffect(() => {
    if (activeLevel === 'INDIVIDUAL' && selectedJourneyId) {
      loadIndividual(selectedJourneyId);
    } else if (activeLevel === 'VILLAGE' && selectedDistrict && selectedVillage) {
      loadVillage(selectedDistrict, selectedVillage);
    } else if (activeLevel === 'DISTRICT' && selectedDistrict) {
      loadDistrict(selectedDistrict);
    } else if (activeLevel === 'LEDGER') {
      loadLedger();
    }
  }, [activeLevel, selectedDistrict, selectedVillage]);

  const loadIndividual = async (jId: string) => {
    setIsLoading(true);
    try {
      const data = await multiLevelFrictionService.getIndividualFriction(jId);
      setIndividualResult(data);
    } catch (err) {
      showToast(`Could not load individual journey ${jId}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVillage = async (district: string, village: string) => {
    setIsLoading(true);
    try {
      const data = await multiLevelFrictionService.getVillageFriction(district, village);
      setVillageResult(data);
    } catch (err) {
      showToast(`Failed to load village friction metrics for ${village}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDistrict = async (district: string) => {
    setIsLoading(true);
    try {
      const data = await multiLevelFrictionService.getDistrictFriction(district);
      setDistrictResult(data);
    } catch (err) {
      showToast(`Failed to load district friction metrics for ${district}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLedger = async () => {
    setIsLoading(true);
    try {
      const data = await multiLevelFrictionService.getInterventionsLedger();
      setLedgerEntries(data);
    } catch (err) {
      showToast('Failed to load interventions ledger', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper Badge Color
  const getTierColor = (tier: FrictionTier) => {
    switch (tier) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'MODERATE':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
    }
  };

  // Handle Simulation
  const handleOpenSimulation = (rec: IRecommendation, candidate?: any) => {
    setActiveRecommendation(rec);
    setSimulationCandidate(candidate || rec.whatIfCandidates?.[0] || null);
    setSimulationResult(null);
    setSimulationModalOpen(true);
  };

  const runSimulation = async () => {
    if (!activeRecommendation) return;
    setSimulating(true);
    try {
      const sim = await multiLevelFrictionService.simulateIntervention({
        baselineScore: activeRecommendation.frictionScore,
        candidateName: simulationCandidate?.name || 'Comprehensive Protocol Intervention',
        costBudgetInr: simulationBudget,
        implementationType: activeRecommendation.level,
      });
      setSimulationResult(sim);
      showToast('Simulation complete: Projected ROI calculated', 'success');
    } catch {
      showToast('Simulation calculation failed', 'error');
    } finally {
      setSimulating(false);
    }
  };

  // Handle Approval
  const handleOpenApproval = (rec: IRecommendation) => {
    setActiveRecommendation(rec);
    setApprovalSuccessRecord(null);
    setApprovalModalOpen(true);
  };

  const submitApproval = async () => {
    if (!activeRecommendation) return;
    setApproving(true);
    try {
      const record = await multiLevelFrictionService.approveIntervention({
        recommendationId: activeRecommendation.id,
        officerName,
        officerRole,
        remarks: approvalRemarks,
        chosenCandidate: simulationCandidate?.name || activeRecommendation.recommendedIntervention,
        targetEntity: activeRecommendation.targetEntity,
      });
      setApprovalSuccessRecord(record);
      showToast('Intervention digitally signed & placed in official execution queue', 'success');
    } catch {
      showToast('Approval signing failed', 'error');
    } finally {
      setApproving(false);
    }
  };

  // Handle Outcome Recording
  const submitOutcome = async () => {
    if (!selectedApprovalForOutcome) return;
    setRecordingOutcome(true);
    try {
      await multiLevelFrictionService.recordOutcome({
        approvalId: selectedApprovalForOutcome.approvalId,
        actualCompletionAchieved: outcomeCompleted,
        delayHours: outcomeDelayHours,
        patientSatisfactionRating: outcomeRating,
        fieldNotes: outcomeNotes,
      });
      showToast('Outcome closed & feedback loop incorporated into learning model', 'success');
      setOutcomeModalOpen(false);
      loadLedger();
    } catch {
      showToast('Failed to record outcome', 'error');
    } finally {
      setRecordingOutcome(false);
    }
  };

  const availableVillages =
    hierarchy.find((h) => h.district === selectedDistrict)?.villages || [];

  return (
    <div
      className={`min-h-screen pb-16 transition-colors duration-200 ${
        highContrast ? 'bg-black text-white' : 'bg-slate-950 text-slate-100'
      }`}
      role="main"
      aria-label="Patient Friction Intelligence and Calculation System"
    >
      {/* Top Telemetry Banner & Loop Indicator */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  Patient Friction Intelligence & Calculation System
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 font-mono">
                  v4.2 Production
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-Level Deterministic Scoring: Individual · Village Cohort · District Systems
              </p>
            </div>
          </div>

          {/* Core Closed-Loop Pipeline Indicator */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
            <span className="px-2 py-1 rounded-md bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/20 flex items-center gap-1">
              <Compass className="w-3 h-3" /> 1. DETECT
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20 flex items-center gap-1">
              <BarChart3 className="w-3 h-3" /> 2. ANALYZE
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> 3. APPROVE
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 flex items-center gap-1">
              <Zap className="w-3 h-3" /> 4. INTERVENE
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 font-semibold border border-purple-500/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 5. LEARN
            </span>
          </div>

          {/* Action Bar / ADA Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-medium transition ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-300 shadow-md'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              aria-label="Toggle High Contrast ADA Mode"
            >
              <Eye className="w-3.5 h-3.5" />
              {highContrast ? 'Standard Mode' : 'High Contrast (ADA)'}
            </button>

            <button
              onClick={() => {
                if (activeLevel === 'INDIVIDUAL' && selectedJourneyId) loadIndividual(selectedJourneyId);
                if (activeLevel === 'VILLAGE') loadVillage(selectedDistrict, selectedVillage);
                if (activeLevel === 'DISTRICT') loadDistrict(selectedDistrict);
                if (activeLevel === 'LEDGER') loadLedger();
              }}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 transition"
              title="Refresh Pipeline Telemetry"
              aria-label="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveLevel('INDIVIDUAL')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
              activeLevel === 'INDIVIDUAL'
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4" />
            Individual Journey (0–100)
          </button>
          <button
            onClick={() => setActiveLevel('VILLAGE')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
              activeLevel === 'VILLAGE'
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            Village / Cohort Aggregation
          </button>
          <button
            onClick={() => setActiveLevel('DISTRICT')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
              activeLevel === 'DISTRICT'
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            District Systemic Heatmap
          </button>
          <button
            onClick={() => setActiveLevel('LEDGER')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
              activeLevel === 'LEDGER'
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Interventions Ledger & Outcomes
          </button>
        </div>

        {/* Global Cascader Filters (District / Village / Journey) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 backdrop-blur">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Target District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  const d = e.target.value;
                  setSelectedDistrict(d);
                  const vList = hierarchy.find((h) => h.district === d)?.villages || [];
                  if (vList.length > 0) setSelectedVillage(vList[0].village);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              >
                {hierarchy.map((h) => (
                  <option key={h.district} value={h.district}>
                    {h.district} ({h.totalJourneys} records, Avg {h.avgFriction})
                  </option>
                ))}
              </select>
            </div>

            {activeLevel !== 'DISTRICT' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Village / Urban Block
                </label>
                <select
                  value={selectedVillage}
                  onChange={(e) => setSelectedVillage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {availableVillages.map((v) => (
                    <option key={v.village} value={v.village}>
                      {v.village} (N={v.journeyCount}, {v.tier})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeLevel === 'INDIVIDUAL' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Select Patient Journey
                </label>
                <select
                  value={selectedJourneyId}
                  onChange={(e) => {
                    setSelectedJourneyId(e.target.value);
                    loadIndividual(e.target.value);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {journeysList.map((j) => (
                    <option key={j.journeyId} value={j.journeyId}>
                      {j.journeyId} - {j.district} ({j.serviceCategory})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* TAB 1: INDIVIDUAL PATIENT LEVEL */}
        {activeLevel === 'INDIVIDUAL' && individualResult && (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Deterministic Friction Score</span>
                  <Activity className="w-4 h-4 text-teal-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">
                    {individualResult.overallFrictionScore}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getTierColor(
                      individualResult.frictionTier
                    )}`}
                  >
                    {individualResult.frictionTier} SEVERITY
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Care Failure Risk Model</span>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-400">
                    {individualResult.careFailureRisk}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Dropout or clinical deterioration hazard without intervention
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Completion Probability</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400">
                    {individualResult.completionProbability}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Projected baseline full episode adherence
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Signal Confidence</span>
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-sky-400">
                    {individualResult.confidenceScore}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Derived from 5 telemetry stage validators
                </p>
              </div>
            </div>

            {/* 5 Journey Stages Breakdown */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-400" />
                Journey Stages Telemetry & Bottlenecks
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {individualResult.stages.map((stg, idx) => (
                  <div
                    key={stg.stage}
                    className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 relative overflow-hidden"
                  >
                    <div className="text-xs font-mono text-slate-400 mb-1">Stage {idx + 1}</div>
                    <div className="text-sm font-semibold text-white truncate">{stg.stageName}</div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-xl font-bold text-teal-300">{stg.score}</span>
                      <span className="text-xs text-slate-400 font-mono">
                        {stg.latencyMinutes} mins
                      </span>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border ${getTierColor(
                          stg.severity
                        )}`}
                      >
                        {stg.severity}
                      </span>
                    </div>
                    {stg.barriers.length > 0 && (
                      <div className="mt-2 text-xs text-slate-400">
                        <span className="text-slate-500">Barrier:</span> {stg.barriers[0]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contributing Factor Weights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Weighted Factor Decomposition
                </h3>
                <div className="space-y-4">
                  {individualResult.topContributingFactors.map((f) => (
                    <div key={f.factor}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-200">{f.factor}</span>
                        <span className="font-mono text-teal-400">{f.score}/100</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-indigo-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, f.score)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Government Action Card */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/40 border border-teal-500/30 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Prescribed Intervention
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ID: {individualResult.recommendation.id}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">
                    {individualResult.recommendation.recommendedIntervention}
                  </h4>
                  <p className="text-xs text-slate-300 mb-4">
                    {individualResult.recommendation.rootCause}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 mb-4">
                    <div>
                      <div className="text-slate-400">Target Authority:</div>
                      <div className="font-semibold text-teal-300">
                        {individualResult.recommendation.responsibleAuthority}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Projected Friction Cut:</div>
                      <div className="font-semibold text-emerald-400">
                        -{individualResult.recommendation.expectedImpact.frictionReductionPct}%
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Estimated Cost:</div>
                      <div className="font-semibold text-white font-mono">
                        ₹{individualResult.recommendation.costEstimateInr.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Completion Gain:</div>
                      <div className="font-semibold text-emerald-400">
                        +{individualResult.recommendation.expectedImpact.completionGainPct}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => handleOpenSimulation(individualResult.recommendation)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    What-If Simulation
                  </button>
                  <button
                    onClick={() => handleOpenApproval(individualResult.recommendation)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Officer Sign-off
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VILLAGE / COHORT AGGREGATION */}
        {activeLevel === 'VILLAGE' && villageResult && (
          <div className="space-y-6">
            {/* Privacy Gate Notification if Sample Size < 3 */}
            {!villageResult.hasSufficientData ? (
              <div
                className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-6 text-amber-200"
                role="alert"
                aria-live="assertive"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/40 text-amber-400">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-amber-300 mb-1">
                      Data Privacy & Statistical Reliability Gate Triggered
                    </h3>
                    <p className="text-sm text-amber-200/90 mb-3">
                      {villageResult.insufficientDataReason ||
                        `Village sample size (N=${villageResult.sampleSize}) is below privacy-preserving k-anonymity threshold (k >= 3). Aggregated metrics suppressed to prevent individual patient re-identification.`}
                    </p>
                    <div className="bg-slate-900/80 p-4 rounded-xl border border-amber-500/30 text-xs space-y-2">
                      <div className="font-semibold text-white">
                        Missing Signal Ingestion Checklist to Unlock Cohort Scoring:
                      </div>
                      <ul className="list-disc pl-5 space-y-1 text-slate-300">
                        {villageResult.missingDataRequirements?.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Village Telemetry Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Village Friction Index</span>
                      <Users className="w-4 h-4 text-teal-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-white">
                        {villageResult.overallFrictionScore}
                      </span>
                      <span className="text-xs text-slate-400">/ 100</span>
                    </div>
                    <div className="mt-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getTierColor(
                          villageResult.frictionTier
                        )}`}
                      >
                        {villageResult.frictionTier} COHORT FRICTION
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Assessed Sample Size</span>
                      <Database className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-indigo-400">
                        {villageResult.sampleSize}
                      </span>
                      <span className="text-xs text-slate-400">patient journeys</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Est. Affected Pop: {villageResult.affectedPopulationEstimate.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Avg Failure Risk</span>
                      <Flame className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-red-400">
                        {villageResult.averageCareFailureRisk}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Community-level risk of non-completion
                    </p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span>Trend vs Last Month</span>
                      {villageResult.trendVsLastMonth.direction === 'improving' ? (
                        <TrendingDown className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className={`text-3xl font-black ${
                          villageResult.trendVsLastMonth.direction === 'improving'
                            ? 'text-emerald-400'
                            : 'text-red-400'
                        }`}
                      >
                        {villageResult.trendVsLastMonth.scoreDelta > 0 ? '+' : ''}
                        {villageResult.trendVsLastMonth.scoreDelta} pts
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider font-semibold">
                      {villageResult.trendVsLastMonth.direction}
                    </p>
                  </div>
                </div>

                {/* Cohorts & Barriers Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-amber-400" />
                      Vulnerable Demographic Cohorts
                    </h3>
                    <div className="space-y-3">
                      {villageResult.affectedCohorts.map((c) => (
                        <div
                          key={c.cohort}
                          className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                        >
                          <div>
                            <div className="text-sm font-semibold text-white">{c.cohort}</div>
                            <div className="text-xs text-slate-400">{c.description}</div>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-mono ${getTierColor(
                              c.riskLevel
                            )}`}
                          >
                            {c.riskLevel}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      High Frequency Barriers
                    </h3>
                    <div className="space-y-3">
                      {villageResult.topBarriers.map((b) => (
                        <div key={b.barrier}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-200">{b.barrier}</span>
                            <span className="font-mono text-teal-400">{b.frequencyPct}%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-red-500 h-full rounded-full"
                              style={{ width: `${b.frequencyPct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Village Recommendation Card */}
                {villageResult.recommendation && (
                  <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-semibold">
                          VILLAGE INTERVENTION PACKAGE
                        </span>
                        <h3 className="text-lg font-bold text-white mt-2">
                          {villageResult.recommendation.recommendedIntervention}
                        </h3>
                        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                          {villageResult.recommendation.rootCause}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleOpenSimulation(villageResult.recommendation)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                        >
                          Simulate Impact
                        </button>
                        <button
                          onClick={() => handleOpenApproval(villageResult.recommendation)}
                          className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold"
                        >
                          Authorize Package
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 3: DISTRICT SYSTEMIC VIEW */}
        {activeLevel === 'DISTRICT' && districtResult && (
          <div className="space-y-6">
            {/* District Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>District Composite Score</span>
                  <Building2 className="w-4 h-4 text-teal-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">
                    {districtResult.overallDistrictScore}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>
                <div className="mt-2">
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getTierColor(
                      districtResult.frictionTier
                    )}`}
                  >
                    {districtResult.frictionTier} DISTRICT TIER
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Inter-Village Disparity</span>
                  <Sliders className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-indigo-400">
                    {districtResult.interVillageDisparityIndex}
                  </span>
                  <span className="text-xs text-slate-400">pt spread</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Variance between best and worst served villages
                </p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Total Assessed Journeys</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400">
                    {districtResult.totalJourneysAssessed}
                  </span>
                  <span className="text-xs text-slate-400">across {districtResult.totalVillagesAssessed} blocks</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Continuous telemetry aggregation</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Systemic Hotspots</span>
                  <Flame className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-red-400">
                    {districtResult.systemicHotspots.length}
                  </span>
                  <span className="text-xs text-slate-400">critical blocks</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Requiring immediate resource triage</p>
              </div>
            </div>

            {/* Systemic Hotspots & Facility Benchmarks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-red-400" />
                  Geographic Friction Hotspots
                </h3>
                <div className="space-y-3">
                  {districtResult.systemicHotspots.map((spot) => (
                    <div
                      key={spot.village}
                      className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-bold text-white">{spot.village}</div>
                        <div className="text-xs text-slate-400">{spot.primaryRootCause}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-red-400">{spot.score}</span>
                        <div className="text-[10px] text-slate-400">
                          {spot.population.toLocaleString()} pop
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-teal-400" />
                  Facility Operational Telemetry
                </h3>
                <div className="space-y-3">
                  {districtResult.facilityPerformance.map((fac) => (
                    <div
                      key={fac.facilityName}
                      className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs"
                    >
                      <div className="flex justify-between font-semibold text-white mb-1.5">
                        <span>{fac.facilityName}</span>
                        <span className="text-teal-400">
                          Friction: +{fac.frictionContribution} pts
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-slate-300">
                        <div>OPD Wait: {fac.avgOpdWaitMinutes}m</div>
                        <div>Bed Occ: {fac.bedOccupancyPct}%</div>
                        <div>Stockout: {fac.stockoutRatePct}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* District Systemic Recommendations */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-400" />
                District Policy & Structural Interventions
              </h3>
              <div className="space-y-4">
                {districtResult.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 font-semibold border border-teal-500/30">
                          {rec.priority} PRIORITY
                        </span>
                        <span className="text-xs text-slate-400">{rec.responsibleAuthority}</span>
                      </div>
                      <div className="text-sm font-bold text-white">
                        {rec.recommendedIntervention}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{rec.rootCause}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleOpenSimulation(rec)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
                      >
                        Simulate
                      </button>
                      <button
                        onClick={() => handleOpenApproval(rec)}
                        className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-xs font-bold text-slate-950"
                      >
                        Sign Approval
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INTERVENTIONS LEDGER & OUTCOMES */}
        {activeLevel === 'LEDGER' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-teal-400" />
                    Digitally Signed Intervention Ledger (Cryptographic Audit Trail)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Consequential government actions sealed with SHA-256 officer signatures and measured outcomes.
                  </p>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {ledgerEntries.length} Recorded Signatures
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="p-3">Approval ID</th>
                      <th className="p-3">Entity & Intervention</th>
                      <th className="p-3">Officer & Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Digital Signature (SHA-256)</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {ledgerEntries.map((entry) => (
                      <tr key={entry.approvalId} className="hover:bg-slate-800/40">
                        <td className="p-3 font-mono text-teal-300">{entry.approvalId}</td>
                        <td className="p-3">
                          <div className="font-semibold text-white">{entry.targetEntity}</div>
                          <div className="text-slate-400 truncate max-w-xs">{entry.interventionName}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-white">{entry.officerName}</div>
                          <div className="text-slate-500 text-[11px]">{entry.officerRole}</div>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              entry.status === 'OUTCOME_RECORDED'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                          {entry.signatureHash}
                        </td>
                        <td className="p-3 text-right">
                          {entry.status !== 'OUTCOME_RECORDED' ? (
                            <button
                              onClick={() => {
                                setSelectedApprovalForOutcome(entry);
                                setOutcomeModalOpen(true);
                              }}
                              className="px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg font-bold text-xs"
                            >
                              Record Outcome
                            </button>
                          ) : (
                            <span className="text-emerald-400 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Closed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {ledgerEntries.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500">
                          No intervention approvals recorded yet. Sign an intervention from the Individual, Village, or District tabs.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* WHAT-IF SIMULATION MODAL */}
      {simulationModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">What-If Intervention Simulation</h3>
              </div>
              <button
                onClick={() => setSimulationModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Intervention Strategy
              </label>
              <input
                type="text"
                value={simulationCandidate?.name || activeRecommendation?.recommendedIntervention || ''}
                readOnly
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Budget Allocation (₹ INR)
              </label>
              <input
                type="number"
                value={simulationBudget}
                onChange={(e) => setSimulationBudget(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
              />
            </div>

            <button
              onClick={runSimulation}
              disabled={simulating}
              className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4" />
              {simulating ? 'Computing Trajectory...' : 'Run Simulation'}
            </button>

            {simulationResult && (
              <div className="bg-slate-950 p-4 rounded-xl border border-teal-500/30 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Projected Friction Reduction:</span>
                  <span className="font-bold text-emerald-400">
                    -{simulationResult.frictionReduction} pts (to {simulationResult.projectedScore}/100)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Completion Adherence Gain:</span>
                  <span className="font-bold text-teal-300">
                    +{simulationResult.completionGainPct}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cost-Effectiveness Ratio:</span>
                  <span className="font-bold text-sky-300 font-mono">
                    ₹{simulationResult.costPerFrictionPointSaved?.toFixed(0)} per pt saved
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HUMAN OFFICER APPROVAL MODAL */}
      {approvalModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">
                  Authorized Officer Cryptographic Approval
                </h3>
              </div>
              <button
                onClick={() => setApprovalModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {approvalSuccessRecord ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Intervention Digitally Signed & Sealed
                  </div>
                  <div>Approval Reference: {approvalSuccessRecord.approvalId}</div>
                  <div className="break-all font-mono text-[10px] text-slate-400">
                    SHA-256 Hash: {approvalSuccessRecord.signatureHash}
                  </div>
                  <div>Timestamp: {approvalSuccessRecord.timestamp}</div>
                </div>
                <button
                  onClick={() => {
                    setApprovalModalOpen(false);
                    setActiveLevel('LEDGER');
                    loadLedger();
                  }}
                  className="w-full py-2 bg-teal-500 text-slate-950 font-bold rounded-xl text-xs"
                >
                  View in Interventions Ledger
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs text-slate-300">
                  <div className="text-slate-400 font-semibold mb-1">Target Action:</div>
                  <div className="text-white font-bold">
                    {activeRecommendation?.recommendedIntervention}
                  </div>
                  <div className="text-teal-300 mt-1">
                    Entity: {activeRecommendation?.targetEntity} · Authority:{' '}
                    {activeRecommendation?.responsibleAuthority}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Officer Name
                  </label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Designation / Role
                  </label>
                  <input
                    type="text"
                    value={officerRole}
                    onChange={(e) => setOfficerRole(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Executive Remarks & Authorization Mandate
                  </label>
                  <textarea
                    rows={3}
                    value={approvalRemarks}
                    onChange={(e) => setApprovalRemarks(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <button
                  onClick={submitApproval}
                  disabled={approving}
                  className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <UserCheck className="w-4 h-4" />
                  {approving ? 'Generating Signature...' : 'Sign & Dispatch Mandate'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OUTCOME & FEEDBACK MODAL */}
      {outcomeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Record Final Intervention Outcome</h3>
              </div>
              <button
                onClick={() => setOutcomeModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
                <span className="text-slate-400">Ref: </span>
                <span className="text-white font-mono">
                  {selectedApprovalForOutcome?.approvalId}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">
                  Did the patient complete secondary care?
                </label>
                <select
                  value={outcomeCompleted ? 'YES' : 'NO'}
                  onChange={(e) => setOutcomeCompleted(e.target.value === 'YES')}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="YES">Yes - Completed care without dropout</option>
                  <option value="NO">No - Incomplete care / Abandoned</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">
                  Delay Incurred (Hours)
                </label>
                <input
                  type="number"
                  value={outcomeDelayHours}
                  onChange={(e) => setOutcomeDelayHours(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">
                  Patient Satisfaction Rating (1 to 5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={outcomeRating}
                  onChange={(e) => setOutcomeRating(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-400 mb-1">
                  Field Operational Notes & Learning Insights
                </label>
                <textarea
                  rows={3}
                  value={outcomeNotes}
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <button
                onClick={submitOutcome}
                disabled={recordingOutcome}
                className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                {recordingOutcome ? 'Saving & Updating Model...' : 'Submit & Close Loop'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
