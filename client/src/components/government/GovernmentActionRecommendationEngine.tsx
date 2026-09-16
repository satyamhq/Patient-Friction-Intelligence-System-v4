import React, { useState, useEffect } from 'react';
import {
  governmentService,
  IActionRecommendation,
  IRecommendationFilter,
} from '../../services/governmentService';
import { useToast } from '../../context/ToastContext';
import {
  ShieldAlert,
  Building2,
  Landmark,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Coins,
  Users,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sliders,
  Send,
  Sparkles,
  Info,
  MapPin,
  Compass,
  Zap,
  Target,
  ArrowRight,
  TrendingDown,
  Activity,
  Check,
  Cpu,
} from 'lucide-react';

interface Props {
  onTicketCreated?: (ticket: any) => void;
}

export const GovernmentActionRecommendationEngine: React.FC<Props> = ({ onTicketCreated }) => {
  const { showToast } = useToast();
  const [recommendations, setRecommendations] = useState<IActionRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAuthority, setSelectedAuthority] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEvidenceId, setExpandedEvidenceId] = useState<string | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [convertedIds, setConvertedIds] = useState<Record<string, boolean>>({});

  // Interactive Evaluator Modal / Drawer state
  const [showEvaluator, setShowEvaluator] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evalFrictionScore, setEvalFrictionScore] = useState<number>(68);
  const [evalTopBarrier, setEvalTopBarrier] = useState<string>('Transport Availability');
  const [evalDistanceKm, setEvalDistanceKm] = useState<number>(24);
  const [evalResidenceType, setEvalResidenceType] = useState<string>('rural_remote');
  const [evalDistrict, setEvalDistrict] = useState<string>('Kapurthala');
  const [evalBlock, setEvalBlock] = useState<string>('Phagwara Rural');
  const [evaluatedPlan, setEvaluatedPlan] = useState<IActionRecommendation | null>(null);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const filters: IRecommendationFilter = {};
      if (selectedAuthority !== 'ALL') filters.authority = selectedAuthority;
      if (selectedCategory !== 'ALL') filters.category = selectedCategory;
      if (selectedTier !== 'ALL') filters.tier = selectedTier;

      const res = await governmentService.getActionRecommendations(filters);
      if (res.success) {
        setRecommendations(res.recommendations || []);
      }
    } catch {
      showToast('Failed to load prioritized action recommendations.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [selectedAuthority, selectedCategory, selectedTier]);

  const handleConvert = async (rec: IActionRecommendation) => {
    setConvertingId(rec.id);
    try {
      const res = await governmentService.convertRecommendationToTicket(rec);
      if (res.success) {
        showToast('Recommendation successfully converted to live incident ticket!', 'success');
        setConvertedIds((prev) => ({ ...prev, [rec.id]: true }));
        if (onTicketCreated) onTicketCreated(res.action);
      }
    } catch {
      showToast('Failed to convert recommendation to ticket.', 'error');
    } finally {
      setConvertingId(null);
    }
  };

  const handleRunEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await governmentService.evaluateFrictionAction({
        frictionScore: evalFrictionScore,
        topBarrier: evalTopBarrier,
        distanceKm: evalDistanceKm,
        residenceType: evalResidenceType,
        district: evalDistrict,
        block: evalBlock,
        facilityName: 'Civil Hospital Phagwara',
      });
      if (res.success) {
        setEvaluatedPlan(res.recommendation);
        showToast('Evidence-based action plan generated successfully.', 'success');
      }
    } catch {
      showToast('Failed to generate action plan.', 'error');
    } finally {
      setEvaluating(false);
    }
  };

  const filtered = recommendations.filter((r) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.problemIdentified.toLowerCase().includes(q) ||
      r.recommendedGovernmentAction.toLowerCase().includes(q) ||
      r.responsibleAuthority.departmentOrAgency.toLowerCase().includes(q) ||
      r.rootCauseCategory.toLowerCase().includes(q) ||
      r.location.block?.toLowerCase().includes(q)
    );
  });

  const criticalCount = recommendations.filter((r) => r.frictionLevel === 'CRITICAL').length;
  const totalPopulationImpacted = recommendations.reduce((acc, r) => acc + (r.affectedPopulationEstimate || 0), 0);
  const totalBudgetINR = recommendations.reduce((acc, r) => acc + (r.requiredResources?.estimatedBudgetINR || 0), 0);

  const getAuthorityBadgeColor = (level: string) => {
    switch (level) {
      case 'CENTRAL_GOVERNMENT':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'STATE_GOVERNMENT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DISTRICT_ADMINISTRATION':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'MUNICIPAL_LOCAL_BODY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'HEALTHCARE_INSTITUTION':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'CRITICAL':
        return 'bg-rose-500 text-white';
      case 'HIGH':
        return 'bg-orange-500 text-white';
      case 'MODERATE':
        return 'bg-amber-500 text-white';
      default:
        return 'bg-emerald-500 text-white';
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    if (confidence === 'CONFIRMED_DATA') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Confirmed Telemetry Evidence
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <Info className="w-3 h-3" /> Statistical Inference Model
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/40">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI POLICY & OPERATIONAL ENGINE</span>
              <span className="text-indigo-400/60">• Evidence-Based Delineation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Friction Score → Government Action Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Automated systemic root-cause attribution translating clinical & non-clinical accessibility friction scores into prioritized, jurisdiction-specific government directives.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowEvaluator(!showEvaluator)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md active:scale-95"
            >
              <Sliders className="w-4 h-4" />
              <span>{showEvaluator ? 'Close Evaluator' : 'Test Friction Score'}</span>
            </button>
            <button
              onClick={loadRecommendations}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all shadow-sm active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Plans</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Prioritized Directives</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{recommendations.length}</p>
          <span className="text-[11px] text-slate-500 font-medium">Deterministic Ranking Active</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Critical Interventions</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-600">{criticalCount}</p>
          <span className="text-[11px] text-rose-600/80 font-medium">Require Emergency Escalation</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Population Protected</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalPopulationImpacted.toLocaleString('en-IN')}</p>
          <span className="text-[11px] text-emerald-600 font-medium">District Coverage Span</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Estimated Resource Allocation</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">₹{(totalBudgetINR / 100000).toFixed(1)}L</p>
          <span className="text-[11px] text-slate-500 font-medium">District Imprest & NHM Funds</span>
        </div>
      </div>

      {/* Interactive Evaluator Panel */}
      {showEvaluator && (
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-indigo-900/50 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                Scenario Friction Score Evaluator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Input any live or simulated friction profile to generate an instant, evidence-based government action recommendation.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
              Deterministic Simulation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 flex justify-between">
                <span>Friction Score</span>
                <span className="text-indigo-400 font-black">{evalFrictionScore}/100</span>
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={evalFrictionScore}
                onChange={(e) => setEvalFrictionScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Low (0-29)</span>
                <span>Moderate (30-49)</span>
                <span>High (50-69)</span>
                <span className="text-rose-400 font-bold">Critical (70+)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Top Identified Barrier</label>
              <select
                value={evalTopBarrier}
                onChange={(e) => setEvalTopBarrier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Transport Availability">Transport Availability & Roads</option>
                <option value="Financial Accessibility">Financial & Out-of-Pocket Cost</option>
                <option value="Appointment Timing Flexibility">Appointment Timing & Wage Loss</option>
                <option value="Documentation Readiness">Documentation / Missing ABHA</option>
                <option value="Digital Access & Literacy">Digital Access / Smartphone Lack</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Distance to Facility (Km)</label>
              <input
                type="number"
                value={evalDistanceKm}
                onChange={(e) => setEvalDistanceKm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Block / Administrative Zone</label>
              <select
                value={evalBlock}
                onChange={(e) => setEvalBlock(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Phagwara Rural">Phagwara Rural</option>
                <option value="Bholath Sub-Centre">Bholath Sub-Centre</option>
                <option value="Sultanpur Lodhi Mand">Sultanpur Lodhi Mand</option>
                <option value="Kapurthala Urban">Kapurthala Urban</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRunEvaluation}
              disabled={evaluating}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{evaluating ? 'Translating Score...' : 'Generate Action Plan'}</span>
            </button>
          </div>

          {/* Evaluated Plan Preview */}
          {evaluatedPlan && (
            <div className="p-5 rounded-2xl bg-slate-800/90 border border-indigo-700/60 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${getTierColor(evaluatedPlan.frictionLevel)}`}>
                    Score: {evaluatedPlan.frictionScore}/100 • {evaluatedPlan.frictionLevel}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700">
                    Priority Score: {evaluatedPlan.priorityScore}/100 ({evaluatedPlan.priorityLevel})
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">• {evaluatedPlan.rootCauseCategory} Root Cause</span>
                </div>

                <button
                  onClick={() => handleConvert(evaluatedPlan)}
                  disabled={convertingId === evaluatedPlan.id || convertedIds[evaluatedPlan.id]}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {convertedIds[evaluatedPlan.id] ? (
                    <>
                      <Check className="w-4 h-4" /> Dispatched as Live Ticket
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Deploy as Government Ticket
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1">
                <strong className="text-sm font-bold text-white block">{evaluatedPlan.problemIdentified}</strong>
                <p className="text-xs text-slate-300">{evaluatedPlan.rootCauseDetails}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-950/70 border border-indigo-800/80 space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-300 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> Assigned Authority: {evaluatedPlan.responsibleAuthority.authorityLabel}
                </span>
                <p className="text-xs font-bold text-white">
                  Directive: {evaluatedPlan.recommendedGovernmentAction}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                <div>
                  <span className="text-slate-400 block text-[10px]">Expected Impact</span>
                  <strong className="text-emerald-400">{evaluatedPlan.expectedImpact}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Timeline</span>
                  <strong className="text-white">{evaluatedPlan.implementationTimeline}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Estimated Budget</span>
                  <strong className="text-amber-300">₹{evaluatedPlan.requiredResources.estimatedBudgetINR.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by problem, responsible department, action, or block..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />

            {/* Authority Filter */}
            <select
              value={selectedAuthority}
              onChange={(e) => setSelectedAuthority(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Authorities</option>
              <option value="CENTRAL_GOVERNMENT">Central Government</option>
              <option value="STATE_GOVERNMENT">State Government</option>
              <option value="DISTRICT_ADMINISTRATION">District Administration</option>
              <option value="MUNICIPAL_LOCAL_BODY">Municipal / Local Body</option>
              <option value="HEALTHCARE_INSTITUTION">Healthcare Institution</option>
            </select>

            {/* Root Cause Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Root Causes</option>
              <option value="ACCESSIBILITY">Accessibility</option>
              <option value="POLICY">Policy</option>
              <option value="PROCESS">Process</option>
              <option value="INFRASTRUCTURE">Infrastructure</option>
              <option value="STAFFING">Staffing</option>
              <option value="TECHNOLOGY">Technology</option>
              <option value="ADMINISTRATIVE">Administrative</option>
            </select>

            {/* Severity Tier */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Friction Tiers</option>
              <option value="CRITICAL">Critical Friction (70+)</option>
              <option value="HIGH">High Friction (50-69)</option>
              <option value="MODERATE">Moderate Friction (30-49)</option>
              <option value="LOW">Low Friction (0-29)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Feed */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            Analyzing population friction vectors, authority jurisdictions, and calculating multivariate priorities...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
            No action recommendations found matching the selected filters.
          </div>
        ) : (
          filtered.map((rec, index) => {
            const isEvidenceOpen = expandedEvidenceId === rec.id;
            const isConverted = convertedIds[rec.id];

            return (
              <div
                key={rec.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header Row: Rank, Score, Authority, Priority */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-900 text-white">
                      #{index + 1}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${getTierColor(rec.frictionLevel)}`}>
                      Friction: {rec.frictionScore}/100 • {rec.frictionLevel}
                    </span>

                    <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${getAuthorityBadgeColor(rec.responsibleAuthority.level)}`}>
                      {rec.responsibleAuthority.authorityLabel}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      Root Cause: {rec.rootCauseCategory}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">
                      Priority Score: <strong className="text-slate-900">{rec.priorityScore}/100</strong> ({rec.priorityLevel})
                    </span>
                    {getConfidenceBadge(rec.inferenceAndUncertainty?.confidenceLevel)}
                  </div>
                </div>

                {/* Problem & Root Cause Details */}
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">
                        {rec.problemIdentified}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        <strong>Root Cause Diagnostic:</strong> {rec.rootCauseDetails}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommended Government Action Callout */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-indigo-700" />
                      Prescribed Government Action Directive
                    </span>
                    <span className="text-[10px] font-semibold text-indigo-700">
                      Nodal: {rec.responsibleAuthority.nodalOfficerDesignation}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-indigo-950 leading-relaxed">
                    {rec.recommendedGovernmentAction}
                  </p>
                  <p className="text-[11px] text-indigo-700/80">
                    Jurisdiction: {rec.responsibleAuthority.departmentOrAgency}
                  </p>
                </div>

                {/* 3-Column Telemetry: Impact, Timeline, Resources */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 text-emerald-600" /> Expected Impact
                    </span>
                    <p className="font-semibold text-slate-800">{rec.expectedImpact}</p>
                    <span className="text-[10px] text-slate-500 block">
                      Protected Cohort: ~{rec.affectedPopulationEstimate?.toLocaleString('en-IN')} citizens
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-600" /> Timeline & Staging
                    </span>
                    <p className="font-semibold text-slate-800">{rec.implementationTimeline}</p>
                    <span className="text-[10px] text-slate-500 block">
                      Target Location: {rec.location.block || rec.location.district}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-600" /> Required Resources
                    </span>
                    <p className="font-semibold text-slate-800">
                      Est. Budget: ₹{rec.requiredResources?.estimatedBudgetINR?.toLocaleString('en-IN') || '0'}
                    </p>
                    <span className="text-[10px] text-slate-500 truncate block" title={rec.requiredResources?.personnel}>
                      Personnel: {rec.requiredResources?.personnel}
                    </span>
                  </div>
                </div>

                {/* KPIs */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Success Metrics / KPIs:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {rec.successMetricsKPI?.map((kpi, kIdx) => (
                      <span
                        key={kIdx}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60"
                      >
                        ✓ {kpi}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Controls: Supporting Evidence Drawer Toggle & Convert to Ticket */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setExpandedEvidenceId(isEvidenceOpen ? null : rec.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <span>{isEvidenceOpen ? 'Hide Supporting Evidence' : 'View Supporting Evidence & Data Provenance'}</span>
                    {isEvidenceOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <div className="flex items-center gap-2">
                    {isConverted ? (
                      <span className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Dispatched as Active Ticket
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConvert(rec)}
                        disabled={convertingId === rec.id}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{convertingId === rec.id ? 'Deploying Ticket...' : 'Convert to Incident Ticket'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Supporting Evidence & Uncertainty Drawer */}
                {isEvidenceOpen && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-800 font-bold flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-indigo-600" />
                        Evidence Provenance: {rec.evidenceSupportingRecommendation?.provenance}
                      </strong>
                      <span className="text-[10px] text-slate-500 font-medium">
                        Confidence: {rec.inferenceAndUncertainty?.confidenceScorePercent || 90}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Verified Data Points:</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-700">
                        {rec.evidenceSupportingRecommendation?.dataPoints?.map((dp, dIdx) => (
                          <li key={dIdx}>{dp}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="font-bold text-slate-600 block">Baseline Assumptions:</span>
                        <ul className="list-disc pl-4 text-slate-500 space-y-0.5">
                          {rec.inferenceAndUncertainty?.assumptions?.map((as, aIdx) => (
                            <li key={aIdx}>{as}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="font-bold text-slate-600 block">Uncertainty & Risk Factors:</span>
                        <ul className="list-disc pl-4 text-slate-500 space-y-0.5">
                          {rec.inferenceAndUncertainty?.uncertaintyFactors?.map((uf, uIdx) => (
                            <li key={uIdx}>{uf}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
