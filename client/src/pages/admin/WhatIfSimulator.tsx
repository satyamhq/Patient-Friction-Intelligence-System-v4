import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  BarChart3,
  Building2,
  Bus,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Cpu,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Flame,
  Globe,
  HeartHandshake,
  HelpCircle,
  Info,
  Laptop,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  Percent,
  Pill,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  Users2,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  multiLevelFrictionService,
  FrictionTier,
  IFrictionFactors,
  SimulationScenarioType,
  IScenarioTemplate,
  ISimulationDriver,
  ISimulationResult,
  IDistrictHierarchy,
} from '../../services/multiLevelFrictionService';

export const WhatIfSimulator: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Hierarchy and Data
  const [hierarchy, setHierarchy] = useState<IDistrictHierarchy[]>([]);
  const [allJourneys, setAllJourneys] = useState<any[]>([]);
  const [scenariosCatalog, setScenariosCatalog] = useState<IScenarioTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Level Selection
  const [selectedLevel, setSelectedLevel] = useState<'individual' | 'village' | 'district'>('district');

  // Target Selections
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Patna');
  const [selectedVillage, setSelectedVillage] = useState<string>('Phulwari Sharif');
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>('');
  const [journeySearch, setJourneySearch] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');

  // Baseline 8-Factor Data for Current Target
  const [baselineScore, setBaselineScore] = useState<number>(65);
  const [baselineTier, setBaselineTier] = useState<FrictionTier>('HIGH');
  const [baselineFactors, setBaselineFactors] = useState<IFrictionFactors>({
    accessibility: 60,
    waitingTime: 70,
    cost: 55,
    processComplexity: 65,
    referralDelays: 72,
    facilityCapacity: 75,
    informationBarriers: 50,
    continuityOfCare: 68,
  });

  // Active Scenario & Parameter Sliders
  const [activeScenario, setActiveScenario] = useState<SimulationScenarioType>('increase_facility_capacity');
  const [parameters, setParameters] = useState<Record<string, any>>({
    capacityIncreasePct: 40,
    additionalBeds: 6,
  });

  // Simulation Execution State
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<ISimulationResult | null>(null);

  // Multi-Scenario Comparison Matrix
  const [comparisonResults, setComparisonResults] = useState<ISimulationResult[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [showComparisonMatrix, setShowComparisonMatrix] = useState(false);

  // Human Approval Modal State
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [officerName, setOfficerName] = useState(user?.name || 'Dr. R. K. Verma, CDMO');
  const [officerRole, setOfficerRole] = useState('Chief District Medical Officer (CDMO)');
  const [approvalRemarks, setApprovalRemarks] = useState(
    'Simulated intervention reviewed and validated against National Health Mission priority norms. Approved for field pilot deployment.'
  );
  const [approvalComplianceAck, setApprovalComplianceAck] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [approvedRecord, setApprovedRecord] = useState<any>(null);

  // Outcome Tracking Modal State
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [actualCompletionAchieved, setActualCompletionAchieved] = useState(true);
  const [delayHours, setDelayHours] = useState(2);
  const [patientSatisfactionRating, setPatientSatisfactionRating] = useState(5);
  const [outcomeFieldNotes, setOutcomeFieldNotes] = useState(
    'Field intervention deployed within allocated SLA window. Zero out-of-pocket leakage observed; adherence restored.'
  );
  const [isSavingOutcome, setIsSavingOutcome] = useState(false);
  const [outcomeLogged, setOutcomeLogged] = useState(false);

  // Load initial hierarchy, journeys, and scenario catalog
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [hierRes, journeysRes, scnRes] = await Promise.all([
        multiLevelFrictionService.getHierarchy(),
        multiLevelFrictionService.getAllJourneys(),
        multiLevelFrictionService.getScenarios(),
      ]);

      setHierarchy(hierRes);
      setAllJourneys(journeysRes);
      setScenariosCatalog(scnRes);

      if (hierRes.length > 0) {
        setSelectedDistrict(hierRes[0].district);
        if (hierRes[0].villages.length > 0) {
          setSelectedVillage(hierRes[0].villages[0].village);
        }
      }

      if (journeysRes.length > 0) {
        setSelectedJourneyId(journeysRes[0].journeyId);
      }
    } catch (err) {
      console.error('Failed to load simulator data:', err);
      showToast('Error loading baseline data. Using cached synthetic models.', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch baseline whenever level or target selection changes
  useEffect(() => {
    if (!isLoading) {
      fetchTargetBaseline();
    }
  }, [selectedLevel, selectedDistrict, selectedVillage, selectedJourneyId]);

  const fetchTargetBaseline = async () => {
    try {
      if (selectedLevel === 'individual' && selectedJourneyId) {
        const ind = await multiLevelFrictionService.getIndividualFriction(selectedJourneyId);
        if (ind) {
          setBaselineScore(ind.overallFrictionScore);
          setBaselineTier(ind.frictionTier);
          if (ind.factors) {
            setBaselineFactors(ind.factors);
          }
        }
      } else if (selectedLevel === 'village' && selectedDistrict && selectedVillage) {
        const vil = await multiLevelFrictionService.getVillageFriction(selectedDistrict, selectedVillage);
        if (vil) {
          setBaselineScore(vil.overallFrictionScore);
          setBaselineTier(vil.frictionTier);
          if (vil.factors) {
            setBaselineFactors(vil.factors);
          }
        }
      } else if (selectedLevel === 'district' && selectedDistrict) {
        const dist = await multiLevelFrictionService.getDistrictFriction(selectedDistrict);
        if (dist) {
          setBaselineScore(dist.overallDistrictScore);
          setBaselineTier(dist.frictionTier);
          if (dist.factors) {
            setBaselineFactors(dist.factors);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch baseline for target:', err);
    }
  };

  // Switch scenario and initialize default parameters
  const handleSelectScenario = (scenarioType: SimulationScenarioType) => {
    setActiveScenario(scenarioType);
    const template = scenariosCatalog.find((s) => s.id === scenarioType);
    if (template && template.defaultParameters) {
      setParameters({ ...template.defaultParameters });
    } else {
      // Default parameter fallbacks
      const defaults: Record<string, any> = {
        increase_facility_capacity: { capacityIncreasePct: 40, additionalBeds: 5 },
        reduce_waiting_time: { waitReductionPct: 40, automatedTriage: true },
        add_healthcare_staff: { additionalStaffCount: 3, shiftCoverageExtended: true },
        improve_referral_coordination: { referralCoordinationGainPct: 50, digitalPassIssued: true },
        add_mobile_health_services: { mmuFrequencyDaysPerWeek: 3, diagnosticSupport: true },
        improve_transportation_access: { transitSubsidyPct: 60, feederVouchers: true },
        extend_service_hours: { extendedHours: 3, eveningOpdActive: true },
        reduce_process_steps: { stepsEliminatedCount: 2, singleDeskRegistration: true },
        improve_information_availability: { informationReachPct: 70, ashaDigitalGuides: true },
      };
      setParameters(defaults[scenarioType] || {});
    }
    // Clear previous outcome record when scenario changes
    setApprovedRecord(null);
    setOutcomeLogged(false);
  };

  // Execute Simulation
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      const targetId =
        selectedLevel === 'individual'
          ? selectedJourneyId
          : selectedLevel === 'village'
          ? `${selectedDistrict}::${selectedVillage}`
          : selectedDistrict;

      const result = await multiLevelFrictionService.runMultiLevelSimulation({
        level: selectedLevel,
        targetId,
        scenarioType: activeScenario,
        parameterModifications: parameters,
      });

      setSimulationResult(result);
      showToast(`Simulation complete: Friction reduced by ${result.scoreDifference.toFixed(1)} pts`, 'success');
    } catch (err) {
      console.error('Simulation execution failed:', err);
      showToast('Simulation failed. Please verify selected parameters.', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  // Run side-by-side comparison across 3 prominent scenarios
  const handleRunComparison = async () => {
    setIsComparing(true);
    setShowComparisonMatrix(true);
    try {
      const targetId =
        selectedLevel === 'individual'
          ? selectedJourneyId
          : selectedLevel === 'village'
          ? `${selectedDistrict}::${selectedVillage}`
          : selectedDistrict;

      const testScenarios: SimulationScenarioType[] = [
        'increase_facility_capacity',
        'reduce_waiting_time',
        'add_mobile_health_services',
      ];

      const results = await Promise.all(
        testScenarios.map((sc) =>
          multiLevelFrictionService.runMultiLevelSimulation({
            level: selectedLevel,
            targetId,
            scenarioType: sc,
          })
        )
      );

      setComparisonResults(results);
      showToast('Multi-scenario comparison matrix generated', 'success');
    } catch (err) {
      console.error('Scenario comparison failed:', err);
      showToast('Failed to generate scenario comparison.', 'error');
    } finally {
      setIsComparing(false);
    }
  };

  // Submit Official Human Approval
  const handleSubmitApproval = async () => {
    if (!simulationResult) return;
    if (!approvalComplianceAck) {
      showToast('Please confirm procedural compliance acknowledgment before signing.', 'warning');
      return;
    }

    setIsApproving(true);
    try {
      const targetEntity = `${selectedLevel.toUpperCase()} - ${simulationResult.targetName}`;
      const res = await multiLevelFrictionService.approveIntervention({
        recommendationId: simulationResult.simulationId,
        officerName,
        officerRole,
        remarks: approvalRemarks,
        chosenCandidate: simulationResult.scenarioTitle,
        targetEntity,
      });

      setApprovedRecord(res);
      setIsApprovalModalOpen(false);
      showToast('Intervention formally approved and recorded in Government Policy Ledger', 'success');
    } catch (err) {
      console.error('Approval failed:', err);
      showToast('Failed to record administrative approval.', 'error');
    } finally {
      setIsApproving(false);
    }
  };

  // Submit Field Outcome Tracking
  const handleSubmitOutcome = async () => {
    if (!approvedRecord) return;
    setIsSavingOutcome(true);
    try {
      await multiLevelFrictionService.recordOutcome({
        approvalId: approvedRecord.approvalId || simulationResult?.simulationId || 'SIM-APP-001',
        actualCompletionAchieved,
        delayHours,
        patientSatisfactionRating,
        fieldNotes: outcomeFieldNotes,
      });

      setOutcomeLogged(true);
      setIsOutcomeModalOpen(false);
      showToast('Real-world field outcome successfully synchronized to the registry', 'success');
    } catch (err) {
      console.error('Outcome recording failed:', err);
      showToast('Failed to record outcome.', 'error');
    } finally {
      setIsSavingOutcome(false);
    }
  };

  // Filter journeys for individual selection
  const filteredJourneys = useMemo(() => {
    return allJourneys.filter((j) => {
      const matchesSearch =
        !journeySearch ||
        j.patientNameMasked?.toLowerCase().includes(journeySearch.toLowerCase()) ||
        j.maskedAbhaId?.toLowerCase().includes(journeySearch.toLowerCase()) ||
        j.clinicalCategory?.toLowerCase().includes(journeySearch.toLowerCase()) ||
        j.village?.toLowerCase().includes(journeySearch.toLowerCase()) ||
        j.district?.toLowerCase().includes(journeySearch.toLowerCase());

      const matchesTier =
        tierFilter === 'ALL' ||
        (tierFilter === 'CRITICAL' && (j.preInterventionFrictionScore || 0) >= 70) ||
        (tierFilter === 'HIGH' &&
          (j.preInterventionFrictionScore || 0) >= 50 &&
          (j.preInterventionFrictionScore || 0) < 70) ||
        (tierFilter === 'MODERATE' &&
          (j.preInterventionFrictionScore || 0) >= 30 &&
          (j.preInterventionFrictionScore || 0) < 50) ||
        (tierFilter === 'LOW' && (j.preInterventionFrictionScore || 0) < 30);

      return matchesSearch && matchesTier;
    });
  }, [allJourneys, journeySearch, tierFilter]);

  // Active target journey object if individual level is selected
  const activeJourney = useMemo(() => {
    return allJourneys.find((j) => j.journeyId === selectedJourneyId) || allJourneys[0] || null;
  }, [allJourneys, selectedJourneyId]);

  // Selected villages for chosen district
  const availableVillages = useMemo(() => {
    const dist = hierarchy.find((h) => h.district === selectedDistrict);
    return dist ? dist.villages : [];
  }, [hierarchy, selectedDistrict]);

  const getTierBadge = (tier: FrictionTier) => {
    switch (tier) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'MODERATE':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  const getScenarioIcon = (scenario: SimulationScenarioType) => {
    switch (scenario) {
      case 'increase_facility_capacity':
        return Building2;
      case 'reduce_waiting_time':
        return Clock;
      case 'add_healthcare_staff':
        return Users2;
      case 'improve_referral_coordination':
        return Stethoscope;
      case 'add_mobile_health_services':
        return Activity;
      case 'improve_transportation_access':
        return Bus;
      case 'extend_service_hours':
        return Clock;
      case 'reduce_process_steps':
        return FileCheck2;
      case 'improve_information_availability':
        return Laptop;
      default:
        return Sliders;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <LoadingSkeleton rows={8} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header Banner */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-teal-600" />
                  Counterfactual Policy Simulation Engine
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  500 Realistic Synthetic Patient Journeys
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Non-Destructive Sandbox
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Healthcare System What-If Simulator
              </h1>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Evaluates: <strong className="text-slate-800">“If we change a specific healthcare-system variable, how could the friction score change?”</strong>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunComparison}
                disabled={isComparing}
                icon={<Layers className="w-4 h-4 text-brand-600" />}
                className="text-xs"
              >
                {isComparing ? 'Comparing...' : 'Compare Scenarios Matrix'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                icon={<Play className="w-4 h-4" />}
                className="text-xs font-bold bg-teal-600 hover:bg-teal-700 border-teal-700 text-white shadow-sm"
              >
                {isSimulating ? 'Running Simulation...' : 'Run Simulation'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Step 1: Multi-Level Selector (Individual Patient -> Village -> District) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <div>
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">Step 1: Choose Simulation Scope</span>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                Select Hierarchy Level (Individual Patient → Village → District)
              </h2>
            </div>

            {/* Level Tabs */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedLevel('individual')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  selectedLevel === 'individual'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Individual Patient (1 of 500)
              </button>
              <button
                type="button"
                onClick={() => setSelectedLevel('village')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  selectedLevel === 'village'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Village (1 of 16)
              </button>
              <button
                type="button"
                onClick={() => setSelectedLevel('district')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                  selectedLevel === 'district'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                District (1 of 4)
              </button>
            </div>
          </div>

          {/* Level Target Selector Content */}
          {selectedLevel === 'individual' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={journeySearch}
                    onChange={(e) => setJourneySearch(e.target.value)}
                    placeholder="Search 500 synthetic records by name, ABHA, condition..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs self-start sm:self-auto overflow-x-auto pb-1">
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Tier:
                  </span>
                  {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTierFilter(t)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        tierFilter === t
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Journey Selector Dropdown & Active Patient Card */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1 space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    Choose Patient Record ({filteredJourneys.length} matches):
                  </label>
                  <select
                    value={selectedJourneyId}
                    onChange={(e) => setSelectedJourneyId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
                  >
                    {filteredJourneys.slice(0, 100).map((j) => (
                      <option key={j.journeyId} value={j.journeyId}>
                        {j.patientNameMasked} | {j.clinicalCategory} ({j.district} - {j.village}) [Score: {j.preInterventionFrictionScore?.toFixed(0)}]
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Showing top 100 of {filteredJourneys.length} filtered synthetic records.
                  </p>
                </div>

                {activeJourney && (
                  <div className="lg:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">{activeJourney.patientNameMasked}</h4>
                          <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                            ABHA: {activeJourney.maskedAbhaId}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-black border ${getTierBadge(activeJourney.frictionTier || baselineTier)}`}>
                            Baseline PFI: {activeJourney.preInterventionFrictionScore?.toFixed(1) || baselineScore.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          <strong>Clinical Need:</strong> {activeJourney.clinicalCategory} | <strong>Location:</strong> {activeJourney.village}, {activeJourney.district} | <strong>Facility:</strong> {activeJourney.facilityName}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-3 border-t border-slate-200 text-xs">
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Transit Time</span>
                        <span className="font-black text-slate-900">{activeJourney.travelTimeMinutes || 45} mins</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Queue Delay</span>
                        <span className="font-black text-slate-900">{activeJourney.waitingTimeMinutes || 120} mins</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Out-of-Pocket</span>
                        <span className="font-black text-slate-900">₹{activeJourney.outOfPocketCostInr || 450}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Process Steps</span>
                        <span className="font-black text-slate-900">{activeJourney.processStepsCount || 4} steps</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedLevel === 'village' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select District:</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    const dist = hierarchy.find((h) => h.district === e.target.value);
                    if (dist && dist.villages.length > 0) {
                      setSelectedVillage(dist.villages[0].village);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {hierarchy.map((h) => (
                    <option key={h.district} value={h.district}>
                      {h.district} District ({h.totalJourneys} records)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Select Village / Block:</label>
                <select
                  value={selectedVillage}
                  onChange={(e) => setSelectedVillage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {availableVillages.map((v) => (
                    <option key={v.village} value={v.village}>
                      {v.village} ({v.journeyCount} patients, Avg PFI: {v.avgFriction?.toFixed(1)})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {selectedLevel === 'district' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {hierarchy.map((h) => {
                const isSelected = selectedDistrict === h.district;
                return (
                  <div
                    key={h.district}
                    onClick={() => setSelectedDistrict(h.district)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{h.district}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${getTierBadge(h.avgFriction >= 70 ? 'CRITICAL' : h.avgFriction >= 50 ? 'HIGH' : h.avgFriction >= 30 ? 'MODERATE' : 'LOW')}`}>
                        {h.avgFriction.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {h.totalJourneys} journeys across {h.villages.length} blocks
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 2: Baseline 8-Factor Friction Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
            <div>
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">Step 2: Baseline Telemetry</span>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-600" />
                Current Friction Profile (8 Core Health System Dimensions)
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">Overall Baseline Friction Score:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-black border ${getTierBadge(baselineTier)}`}>
                {baselineScore.toFixed(1)} / 100 ({baselineTier})
              </span>
            </div>
          </div>

          {/* 8 Factor Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { key: 'accessibility', label: 'Accessibility & Distance', val: baselineFactors.accessibility, icon: Bus },
              { key: 'waitingTime', label: 'Waiting Time & Queues', val: baselineFactors.waitingTime, icon: Clock },
              { key: 'cost', label: 'Out-of-Pocket Cost', val: baselineFactors.cost, icon: Coins },
              { key: 'processComplexity', label: 'Process Complexity', val: baselineFactors.processComplexity, icon: FileCheck2 },
              { key: 'referralDelays', label: 'Referral Delays', val: baselineFactors.referralDelays, icon: Stethoscope },
              { key: 'facilityCapacity', label: 'Facility Capacity', val: baselineFactors.facilityCapacity, icon: Building2 },
              { key: 'informationBarriers', label: 'Information Barriers', val: baselineFactors.informationBarriers, icon: Laptop },
              { key: 'continuityOfCare', label: 'Continuity of Care', val: baselineFactors.continuityOfCare, icon: HeartHandshake },
            ].map((f) => {
              const Icon = f.icon;
              const val = Math.round(f.val || 0);
              const color =
                val >= 70 ? 'bg-rose-500' : val >= 50 ? 'bg-amber-500' : val >= 30 ? 'bg-blue-500' : 'bg-emerald-500';

              return (
                <div key={f.key} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 text-slate-500" />
                      {f.label}
                    </span>
                    <span className="font-black text-slate-900">{val}/100</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, val)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Choose 1 of 9 Healthcare-System Scenarios & Adjust Parameters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">Step 3: Select Intervention Scenario</span>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-600" />
              Choose Healthcare-System Variable Scenario (9 Scenarios)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an intervention model and tune operational parameters to observe counterfactual friction reduction.
            </p>
          </div>

          {/* Scenario Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {scenariosCatalog.map((sc) => {
              const isSelected = activeScenario === sc.id;
              const Icon = getScenarioIcon(sc.id);

              return (
                <div
                  key={sc.id}
                  onClick={() => handleSelectScenario(sc.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                          isSelected ? 'bg-teal-600 text-white border-teal-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {sc.targetFactor}
                      </span>
                    </div>

                    <h4 className="text-xs font-black text-slate-900 leading-snug">{sc.title}</h4>
                    <p className="text-[11px] text-slate-600 line-clamp-2">{sc.description}</p>
                  </div>

                  <div className="pt-2 mt-3 border-t border-slate-100 text-[10px] flex items-center justify-between text-slate-500">
                    <span>Est. Budget: ₹{sc.defaultCostInr?.toLocaleString('en-IN')}</span>
                    <span className="font-bold text-teal-700">{sc.recommendedAuthority}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Scenario Sliders & Variable Controls */}
          <div className="p-4 rounded-xl bg-teal-50/40 border border-teal-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-100 pb-2">
              <span className="text-xs font-black text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-teal-700" />
                Configurable Parameters for: {scenariosCatalog.find((s) => s.id === activeScenario)?.title}
              </span>
              <span className="text-[11px] text-teal-700">
                Adjust sliders to model specific operational expansions
              </span>
            </div>

            {/* Custom Sliders based on activeScenario */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {activeScenario === 'increase_facility_capacity' && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">Facility Capacity Expansion:</span>
                      <span className="font-black text-teal-700">+{parameters.capacityIncreasePct || 40}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={parameters.capacityIncreasePct || 40}
                      onChange={(e) => setParameters({ ...parameters, capacityIncreasePct: Number(e.target.value) })}
                      className="w-full accent-teal-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>+10%</span>
                      <span>+50%</span>
                      <span>+100%</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">Additional Beds / Consultation Rooms:</span>
                      <span className="font-black text-teal-700">+{parameters.additionalBeds || 5} units</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      value={parameters.additionalBeds || 5}
                      onChange={(e) => setParameters({ ...parameters, additionalBeds: Number(e.target.value) })}
                      className="w-full accent-teal-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>1</span>
                      <span>10</span>
                      <span>20</span>
                    </div>
                  </div>
                </>
              )}

              {activeScenario === 'reduce_waiting_time' && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">Target Queue Wait Reduction:</span>
                      <span className="font-black text-teal-700">-{parameters.waitReductionPct || 40}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={80}
                      step={5}
                      value={parameters.waitReductionPct || 40}
                      onChange={(e) => setParameters({ ...parameters, waitReductionPct: Number(e.target.value) })}
                      className="w-full accent-teal-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>-10%</span>
                      <span>-45%</span>
                      <span>-80%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="automatedTriage"
                      checked={parameters.automatedTriage ?? true}
                      onChange={(e) => setParameters({ ...parameters, automatedTriage: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                    />
                    <label htmlFor="automatedTriage" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Deploy Automated Express Digital Triage Counter
                    </label>
                  </div>
                </>
              )}

              {activeScenario === 'add_healthcare_staff' && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">Additional Medical Officers / Staff:</span>
                      <span className="font-black text-teal-700">+{parameters.additionalStaffCount || 3} Personnel</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={15}
                      value={parameters.additionalStaffCount || 3}
                      onChange={(e) => setParameters({ ...parameters, additionalStaffCount: Number(e.target.value) })}
                      className="w-full accent-teal-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>1</span>
                      <span>8</span>
                      <span>15</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="shiftCoverageExtended"
                      checked={parameters.shiftCoverageExtended ?? true}
                      onChange={(e) => setParameters({ ...parameters, shiftCoverageExtended: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                    />
                    <label htmlFor="shiftCoverageExtended" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Task-shifting with certified ANM/CHO triage
                    </label>
                  </div>
                </>
              )}

              {activeScenario === 'improve_referral_coordination' && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">Referral Handshake Efficiency:</span>
                      <span className="font-black text-teal-700">+{parameters.referralCoordinationGainPct || 50}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={90}
                      step={5}
                      value={parameters.referralCoordinationGainPct || 50}
                      onChange={(e) => setParameters({ ...parameters, referralCoordinationGainPct: Number(e.target.value) })}
                      className="w-full accent-teal-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="digitalPassIssued"
                      checked={parameters.digitalPassIssued ?? true}
                      onChange={(e) => setParameters({ ...parameters, digitalPassIssued: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                    />
                    <label htmlFor="digitalPassIssued" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Automated Pre-Booked Hospital Referral Slot
                    </label>
                  </div>
                </>
              )}

              {activeScenario === 'add_mobile_health_services' && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">Mobile Medical Unit (MMU) Frequency:</span>
                      <span className="font-black text-teal-700">{parameters.mmuFrequencyDaysPerWeek || 3} Days/Week</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={7}
                      value={parameters.mmuFrequencyDaysPerWeek || 3}
                      onChange={(e) => setParameters({ ...parameters, mmuFrequencyDaysPerWeek: Number(e.target.value) })}
                      className="w-full accent-teal-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="diagnosticSupport"
                      checked={parameters.diagnosticSupport ?? true}
                      onChange={(e) => setParameters({ ...parameters, diagnosticSupport: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                    />
                    <label htmlFor="diagnosticSupport" className="text-xs font-bold text-slate-700 cursor-pointer">
                      On-board Point-of-Care Blood & NCD Diagnostics
                    </label>
                  </div>
                </>
              )}

              {activeScenario === 'improve_transportation_access' && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">Transit Subsidy / Fare Coverage:</span>
                      <span className="font-black text-teal-700">{parameters.transitSubsidyPct || 60}% Subsidized</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      step={5}
                      value={parameters.transitSubsidyPct || 60}
                      onChange={(e) => setParameters({ ...parameters, transitSubsidyPct: Number(e.target.value) })}
                      className="w-full accent-teal-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="feederVouchers"
                      checked={parameters.feederVouchers ?? true}
                      onChange={(e) => setParameters({ ...parameters, feederVouchers: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                    />
                    <label htmlFor="feederVouchers" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Direct Ambulance / E-Rickshaw Feeder Vouchers
                    </label>
                  </div>
                </>
              )}

              {activeScenario === 'extend_service_hours' && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">Extended Evening OPD Shift:</span>
                      <span className="font-black text-teal-700">+{parameters.extendedHours || 3} Hours</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={6}
                      value={parameters.extendedHours || 3}
                      onChange={(e) => setParameters({ ...parameters, extendedHours: Number(e.target.value) })}
                      className="w-full accent-teal-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="eveningOpdActive"
                      checked={parameters.eveningOpdActive ?? true}
                      onChange={(e) => setParameters({ ...parameters, eveningOpdActive: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                    />
                    <label htmlFor="eveningOpdActive" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Include Weekend Morning Diagnostics Slot
                    </label>
                  </div>
                </>
              )}

              {activeScenario === 'reduce_process_steps' && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">Process Steps Eliminated:</span>
                      <span className="font-black text-teal-700">-{parameters.stepsEliminatedCount || 2} Steps</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={4}
                      value={parameters.stepsEliminatedCount || 2}
                      onChange={(e) => setParameters({ ...parameters, stepsEliminatedCount: Number(e.target.value) })}
                      className="w-full accent-teal-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="singleDeskRegistration"
                      checked={parameters.singleDeskRegistration ?? true}
                      onChange={(e) => setParameters({ ...parameters, singleDeskRegistration: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                    />
                    <label htmlFor="singleDeskRegistration" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Single-Window ABHA QR Fast-Track Registration
                    </label>
                  </div>
                </>
              )}

              {activeScenario === 'improve_information_availability' && (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">Multilingual Information Coverage:</span>
                      <span className="font-black text-teal-700">{parameters.informationReachPct || 70}% Outreach</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      step={5}
                      value={parameters.informationReachPct || 70}
                      onChange={(e) => setParameters({ ...parameters, informationReachPct: Number(e.target.value) })}
                      className="w-full accent-teal-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="ashaDigitalGuides"
                      checked={parameters.ashaDigitalGuides ?? true}
                      onChange={(e) => setParameters({ ...parameters, ashaDigitalGuides: e.target.checked })}
                      className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                    />
                    <label htmlFor="ashaDigitalGuides" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Deploy Audio/IVR Guides in Bhojpuri, Maithili & Hindi
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                icon={<Play className="w-4 h-4" />}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
              >
                {isSimulating ? 'Computing Counterfactual Projection...' : 'Calculate Simulated Score'}
              </Button>
            </div>
          </div>
        </div>

        {/* Step 4: Full Simulation Telemetry Results Display */}
        {/* Sequence: Current Score → Scenario → Simulated Score → Score Difference → Affected Population → Main Drivers → Expected Impact → Confidence/Data Quality */}
        {simulationResult && (
          <div className="bg-white rounded-2xl border border-teal-300 p-6 shadow-md space-y-6 animate-fadeIn">
            {/* Telemetry Sequence Banner */}
            <div className="border-b border-slate-200 pb-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-900 border border-teal-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  Simulation Verified
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Simulation ID: {simulationResult.simulationId}
                </span>
              </div>

              <h2 className="text-lg font-black text-slate-900 tracking-tight mb-4">
                Required Telemetry Sequence: Current Score → Scenario → Simulated Score → Score Difference → Affected Population
              </h2>

              {/* 5-Stage Step Ribbon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* 1. Current Score */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">1. Current Score</span>
                  <div className="my-1">
                    <span className="text-2xl font-black text-slate-900">{simulationResult.currentScore.toFixed(1)}</span>
                    <span className="text-xs text-slate-500"> / 100</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border self-start ${getTierBadge(simulationResult.currentTier)}`}>
                    {simulationResult.currentTier}
                  </span>
                </div>

                {/* 2. Scenario */}
                <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">2. Scenario</span>
                  <h4 className="text-xs font-black text-teal-950 line-clamp-2 my-1">
                    {simulationResult.scenarioTitle}
                  </h4>
                  <span className="text-[10px] text-teal-700 font-semibold">
                    Scope: {simulationResult.level.toUpperCase()} ({simulationResult.targetName})
                  </span>
                </div>

                {/* 3. Simulated Score */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">3. Simulated Score</span>
                  <div className="my-1">
                    <span className="text-2xl font-black text-emerald-900">{simulationResult.simulatedScore.toFixed(1)}</span>
                    <span className="text-xs text-emerald-700"> / 100</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border self-start ${getTierBadge(simulationResult.simulatedTier)}`}>
                    {simulationResult.simulatedTier}
                  </span>
                </div>

                {/* 4. Score Difference */}
                <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-300 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">4. Score Difference</span>
                  <div className="my-1 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-teal-900">
                      -{simulationResult.scoreDifference.toFixed(1)}
                    </span>
                    <span className="text-xs font-bold text-teal-700">
                      (-{((simulationResult.scoreDifference / (simulationResult.currentScore || 1)) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-800">
                    Friction Barrier Relief
                  </span>
                </div>

                {/* 5. Affected Population */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">5. Affected Population</span>
                  <div className="my-1">
                    <span className="text-2xl font-black text-slate-900">
                      {simulationResult.affectedPopulation.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-500"> citizens</span>
                  </div>
                  <span className="text-[10px] text-slate-600">
                    {simulationResult.level === 'individual' ? 'Direct patient journey' : 'Regional catchment'}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Drivers Breakdown Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-teal-600" />
                  Main Drivers of Friction Change
                </h3>
                <span className="text-xs text-slate-500">Comparing baseline vs simulated scores per factor</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Health System Factor</th>
                      <th className="px-3 py-2.5 text-center">Baseline Score</th>
                      <th className="px-3 py-2.5 text-center">Simulated Score</th>
                      <th className="px-3 py-2.5 text-center">Score Delta (Points)</th>
                      <th className="px-4 py-2.5">Operational Driver Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {simulationResult.mainDrivers.map((driver) => {
                      const isSignificant = driver.delta > 5;
                      return (
                        <tr key={driver.factorKey} className={isSignificant ? 'bg-teal-50/40' : 'bg-white'}>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {driver.factor}
                          </td>
                          <td className="px-3 py-3 text-center text-slate-600 font-mono">
                            {driver.baselineScore.toFixed(0)}
                          </td>
                          <td className="px-3 py-3 text-center text-slate-900 font-bold font-mono">
                            {driver.simulatedScore.toFixed(0)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full font-black text-[11px] ${
                              driver.delta > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {driver.delta > 0 ? `-${driver.delta.toFixed(1)} pts` : '0.0'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {driver.description}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expected Impact & Confidence / Data Quality Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Expected Impact */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Expected Impact Matrix
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Friction Reduction</span>
                    <span className="text-lg font-black text-teal-700">
                      -{simulationResult.expectedImpact.frictionReductionPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Completion Gain</span>
                    <span className="text-lg font-black text-emerald-700">
                      +{simulationResult.expectedImpact.completionGainPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">QALYs Regained (Est)</span>
                    <span className="text-lg font-black text-slate-900">
                      ~{simulationResult.expectedImpact.qalySavedEst.toFixed(1)}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Adherence Recovery</span>
                    <span className="text-lg font-black text-slate-900">
                      ~{simulationResult.expectedImpact.adherenceRecoveryCount} patients
                    </span>
                  </div>
                </div>
              </div>

              {/* Confidence & Data Quality */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Confidence & Data Quality Rating
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Algorithm Confidence</span>
                    <span className="text-lg font-black text-teal-700">
                      {simulationResult.confidenceDataQuality.confidenceScore}%
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Sample Cohort Size</span>
                    <span className="text-lg font-black text-slate-900">
                      n = {simulationResult.confidenceDataQuality.sampleSize} journeys
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Data Quality Tier</span>
                    <span className="text-sm font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                      {simulationResult.confidenceDataQuality.dataQuality}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Margin of Error</span>
                    <span className="text-lg font-black text-slate-700">
                      ±{simulationResult.confidenceDataQuality.marginOfErrorPct}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5: Evidence-Based Recommended Intervention for Responsible Authority */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-950 text-teal-300 border border-teal-800">
                    Official Evidence-Based Recommendation
                  </span>
                  <h3 className="text-base font-bold text-white mt-1 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-teal-400" />
                    Recommended Intervention for Responsible Government / Health Authority
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Policy Mandate Code:</span>
                  <span className="text-xs font-mono font-bold text-teal-300">
                    {simulationResult.recommendedIntervention.policyMandateCode}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                <div className="lg:col-span-2 space-y-2">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Responsible Authority:</span>
                    <strong className="text-white text-sm">
                      {simulationResult.recommendedIntervention.responsibleAuthority} ({simulationResult.recommendedIntervention.authorityTitle})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Recommended Action:</span>
                    <p className="text-slate-200 font-medium">
                      {simulationResult.recommendedIntervention.recommendedAction}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Directive Summary:</span>
                    <p className="text-slate-300 leading-relaxed">
                      {simulationResult.recommendedIntervention.directiveSummary}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Estimated Budget</span>
                    <span className="text-xl font-black text-teal-400">
                      ₹{simulationResult.recommendedIntervention.estimatedCostInr.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Target Timeline</span>
                    <span className="text-slate-200 font-semibold">
                      {simulationResult.recommendedIntervention.implementationTimeline}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Key Success KPI</span>
                    <span className="text-teal-300 font-semibold">
                      {simulationResult.recommendedIntervention.successKpi}
                    </span>
                  </div>
                </div>
              </div>

              {/* Human Approval Required Alert & Button */}
              <div className="pt-3 border-t border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 p-2.5 rounded-lg border border-amber-800">
                  <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>
                    <strong>Human Approval Required:</strong> In accordance with public health governance standards, AI simulations cannot trigger expenditures or staffing reallocations without formal officer review.
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {approvedRecord ? (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-900/80 text-emerald-300 border border-emerald-700 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Approved by {approvedRecord.officerName}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsOutcomeModalOpen(true)}
                        className="bg-white text-slate-900 text-xs font-bold"
                        icon={<Activity className="w-3.5 h-3.5 text-teal-600" />}
                      >
                        {outcomeLogged ? 'View Outcome Record' : 'Track Field Outcome'}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsApprovalModalOpen(true)}
                      icon={<FileCheck2 className="w-4 h-4" />}
                      className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold border-teal-400 text-xs"
                    >
                      Authorize & Approve Intervention
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Multi-Scenario Comparison Matrix */}
        {showComparisonMatrix && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block">Comparative Analysis</span>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-600" />
                  Side-by-Side Scenario Comparison Matrix
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComparisonMatrix(false)}
                icon={<X className="w-4 h-4" />}
              >
                Close Matrix
              </Button>
            </div>

            {isComparing ? (
              <LoadingSkeleton rows={4} />
            ) : comparisonResults.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Scenario Title</th>
                      <th className="px-3 py-3 text-center">Baseline Score</th>
                      <th className="px-3 py-3 text-center">Simulated Score</th>
                      <th className="px-3 py-3 text-center">Relief (Score Delta)</th>
                      <th className="px-3 py-3 text-center">Est. Budget (INR)</th>
                      <th className="px-3 py-3 text-center">Completion Gain</th>
                      <th className="px-4 py-3">Responsible Authority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {comparisonResults.map((cr) => (
                      <tr key={cr.simulationId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {cr.scenarioTitle}
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-slate-600">
                          {cr.currentScore.toFixed(1)}
                        </td>
                        <td className="px-3 py-3 text-center font-mono font-bold text-teal-800">
                          {cr.simulatedScore.toFixed(1)}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black">
                            -{cr.scoreDifference.toFixed(1)} pts
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center font-mono text-slate-700">
                          ₹{cr.recommendedIntervention.estimatedCostInr.toLocaleString('en-IN')}
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-teal-700">
                          +{cr.expectedImpact.completionGainPct.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {cr.recommendedIntervention.responsibleAuthority}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No comparison data generated yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Human Officer Approval Modal */}
      {isApprovalModalOpen && simulationResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Formal Human Administrative Approval</h3>
                  <p className="text-[11px] text-slate-500">Grounding Policy Action in Responsible Public Health Governance</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsApprovalModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Entity:</span>
                <strong className="text-slate-800">{simulationResult.level.toUpperCase()} - {simulationResult.targetName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Intervention:</span>
                <strong className="text-teal-700">{simulationResult.scenarioTitle}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Simulated Score Improvement:</span>
                <strong className="text-emerald-700">{simulationResult.currentScore.toFixed(1)} → {simulationResult.simulatedScore.toFixed(1)} (-{simulationResult.scoreDifference.toFixed(1)} pts)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Allocated Budget:</span>
                <strong className="text-slate-800">₹{simulationResult.recommendedIntervention.estimatedCostInr.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Authorizing Officer Name:</label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Officer Role / Designation:</label>
                <input
                  type="text"
                  value={officerRole}
                  onChange={(e) => setOfficerRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Administrative Remarks & Directives:</label>
                <textarea
                  rows={3}
                  value={approvalRemarks}
                  onChange={(e) => setApprovalRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="complianceAck"
                  checked={approvalComplianceAck}
                  onChange={(e) => setApprovalComplianceAck(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 accent-teal-600 mt-0.5"
                />
                <label htmlFor="complianceAck" className="text-[11px] text-slate-600 leading-snug cursor-pointer">
                  I certify that this simulated healthcare intervention has been reviewed against clinical guidelines and administrative norms under the National Health Mission.
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsApprovalModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitApproval}
                disabled={isApproving || !approvalComplianceAck}
                icon={<CheckCircle2 className="w-4 h-4" />}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
              >
                {isApproving ? 'Recording Signature...' : 'Confirm & Authorize Protocol'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Outcome Tracking Modal */}
      {isOutcomeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Track Real-World Field Outcome</h3>
                  <p className="text-[11px] text-slate-500">Measure actual clinical completion and SLA adherence</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOutcomeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Did the patient/population complete care successfully?</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActualCompletionAchieved(true)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                      actualCompletionAchieved
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    ✓ Yes - Completed
                  </button>
                  <button
                    type="button"
                    onClick={() => setActualCompletionAchieved(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                      !actualCompletionAchieved
                        ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    ✗ No - Abandoned/Failed
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Observed SLA Delay (Hours): {delayHours}h
                </label>
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={delayHours}
                  onChange={(e) => setDelayHours(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Citizen / Patient Satisfaction (1 - 5): {patientSatisfactionRating} ★
                </label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={patientSatisfactionRating}
                  onChange={(e) => setPatientSatisfactionRating(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Field Validation Notes:</label>
                <textarea
                  rows={3}
                  value={outcomeFieldNotes}
                  onChange={(e) => setOutcomeFieldNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOutcomeModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitOutcome}
                disabled={isSavingOutcome}
                icon={<CheckCircle2 className="w-4 h-4" />}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
              >
                {isSavingOutcome ? 'Saving...' : 'Record Field Outcome'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
