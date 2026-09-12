import React, { useState, useEffect } from 'react';
import { intelligenceService, OptimizationResponse } from '../../services/intelligenceService';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Sliders,
  Coins,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckSquare,
} from 'lucide-react';

export const InterventionOptimizer: React.FC = () => {
  const [budgetINR, setBudgetINR] = useState<number>(1000000);
  const [recommendation, setRecommendation] = useState<OptimizationResponse['recommendation'] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const runOptimization = async (budget: number) => {
    setIsOptimizing(true);
    try {
      const res = await intelligenceService.optimizeBudget({
        budgetINR: budget,
        baselineProbability: 37,
        cohortSize: 1000,
      });

      if (res.success) {
        setRecommendation(res.recommendation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsOptimizing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runOptimization(budgetINR);
  }, []);

  const handleBudgetChange = (val: number) => {
    setBudgetINR(val);
    runOptimization(val);
  };

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  const budgetPresets = [
    { label: '₹4 Lakhs', value: 400000 },
    { label: '₹8 Lakhs', value: 800000 },
    { label: '₹10 Lakhs (Standard)', value: 1000000 },
    { label: '₹15 Lakhs', value: 1500000 },
    { label: '₹20 Lakhs', value: 2000000 },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-tr from-slate-900 via-navy-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 text-teal-300 text-xs font-bold border border-teal-800 mb-2">
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            <span>Knapsack Multi-Criteria Budget Optimizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Intervention Budget Allocation Optimizer
          </h1>
          <p className="text-xs text-slate-300">
            Applies 0/1 knapsack optimization across cataloged interventions to select combinations with the highest estimated completion gain within a specified budget
          </p>
        </div>

        {/* Budget Selector Ribbon */}
        <div className="pt-2 space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Select or Enter Total Community Health Budget (INR):
          </label>
          <div className="flex flex-wrap gap-2">
            {budgetPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handleBudgetChange(preset.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  budgetINR === preset.value
                    ? 'bg-teal-500 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Portfolio Solution */}
      {recommendation && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                Calculated Optimal Decision
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Recommended Intervention Portfolio ({recommendation.selectedInterventions.length} Interventions)
              </h2>
            </div>

            <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold">
              Budget Cap: ₹{recommendation.availableBudgetINR.toLocaleString('en-IN')}
            </span>
          </div>

          {/* 4 Optimization Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 space-y-1">
              <span className="text-[10px] text-teal-700 font-bold uppercase block">Est. Completion Gain</span>
              <span className="text-2xl sm:text-3xl font-black text-teal-950">
                +{recommendation.projectedGainPercent}%
              </span>
              <p className="text-[10px] text-teal-700">
                {recommendation.projectedBaselineProbability}% → {recommendation.projectedOptimizedProbability}%
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Patients Helped</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                ~{recommendation.estimatedPatientsHelped}
              </span>
              <p className="text-[10px] text-slate-400">across target population</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Allocated Budget</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{recommendation.totalAllocatedCostINR.toLocaleString('en-IN')}
              </span>
              <p className="text-[10px] text-slate-400">
                ₹{recommendation.remainingBudgetINR.toLocaleString('en-IN')} unspent buffer
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Cost Per Patient</span>
              <span className="text-2xl sm:text-3xl font-black text-teal-800">
                ₹{recommendation.costPerPatientHelpedINR.toLocaleString('en-IN')}
              </span>
              <p className="text-[10px] text-teal-600 font-medium">Exceptional Efficiency</p>
            </div>
          </div>

          {/* Explainable Optimization Rationale */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-1.5 text-xs">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
              Explainable Decision Rationale
            </span>
            <p className="text-slate-200 leading-relaxed">{recommendation.rationale}</p>
          </div>

          {/* Selected Interventions Detailed Cards */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Chosen Interventions in this Portfolio:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recommendation.selectedInterventions.map((item) => (
                <div
                  key={item.code}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <h5 className="font-bold text-sm text-slate-900">{item.name}</h5>
                    <span className="text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      +{item.baseGainPercent}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>Unit Cost: ₹{item.unitCostINR.toLocaleString('en-IN')}</span>
                    <span className="font-bold text-slate-700">~{item.reachPatientsPerUnit} Patients Reached</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sensitivity Analysis Scenario Comparisons */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Budget Sensitivity Scenarios
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Constrained Budget Scenario (-30%)
                </span>
                <p className="font-bold text-slate-800">
                  Budget ₹{recommendation.sensitivityAnalysis.reducedBudgetScenario.budgetINR.toLocaleString('en-IN')}: +
                  {recommendation.sensitivityAnalysis.reducedBudgetScenario.projectedGainPercent}% Gain
                </p>
                <p className="text-slate-500 text-[11px]">
                  Items: {recommendation.sensitivityAnalysis.reducedBudgetScenario.items.join(', ') || 'Minimal triage'}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">
                  Expanded Budget Scenario (+30%)
                </span>
                <p className="font-bold text-slate-800">
                  Budget ₹{recommendation.sensitivityAnalysis.expandedBudgetScenario.budgetINR.toLocaleString('en-IN')}: +
                  {recommendation.sensitivityAnalysis.expandedBudgetScenario.projectedGainPercent}% Gain
                </p>
                <p className="text-slate-500 text-[11px]">
                  Items: {recommendation.sensitivityAnalysis.expandedBudgetScenario.items.join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
