import React, { useState, useEffect } from 'react';
import { intelligenceService, SimulationResponse } from '../../services/intelligenceService';
import { InterventionItem } from '../../types';
import { CompletionGauge } from '../../components/charts/CompletionGauge';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Cpu,
  Sliders,
  Activity,
  Bus,
  Stethoscope,
  Users2,
  Laptop,
  Pill,
  Clock,
  Languages,
  FileCheck2,
  TrendingUp,
  Coins,
  CheckCircle2,
  RotateCcw,
  HeartHandshake,
} from 'lucide-react';

export const WhatIfSimulator: React.FC = () => {
  const [catalog, setCatalog] = useState<InterventionItem[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([
    'COMMUNITY_TRANSPORT',
    'LOCAL_DIAGNOSTICS',
  ]);
  const [baselineProb, setBaselineProb] = useState<number>(37);
  const [cohortSize, setCohortSize] = useState<number>(1000);
  const [simulationData, setSimulationData] = useState<SimulationResponse['simulation'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const loadCatalogAndRun = async () => {
      try {
        const cRes = await intelligenceService.getCatalog();
        if (cRes.success) {
          setCatalog(cRes.interventions || []);
        }

        const sRes = await intelligenceService.runSimulation({
          selectedCodes: ['COMMUNITY_TRANSPORT', 'LOCAL_DIAGNOSTICS'],
          baselineProbability: 37,
          cohortSize: 1000,
        });

        if (sRes.success) {
          setSimulationData(sRes.simulation);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadCatalogAndRun();
  }, []);

  const triggerSimulation = async (newSelectedCodes: string[]) => {
    setIsSimulating(true);
    try {
      const sRes = await intelligenceService.runSimulation({
        selectedCodes: newSelectedCodes,
        baselineProbability: baselineProb,
        cohortSize,
      });

      if (sRes.success) {
        setSimulationData(sRes.simulation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const toggleIntervention = (code: string) => {
    const updated = selectedCodes.includes(code)
      ? selectedCodes.filter((c) => c !== code)
      : [...selectedCodes, code];
    setSelectedCodes(updated);
    triggerSimulation(updated);
  };

  const getInterventionIcon = (category: string) => {
    switch (category) {
      case 'Transport':
        return Bus;
      case 'Diagnostics':
        return Stethoscope;
      case 'Community Staff':
        return Users2;
      case 'Digital':
        return Laptop;
      case 'Logistics':
        return Pill;
      case 'Administrative':
        return FileCheck2;
      default:
        return Activity;
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  const simulatedProb = simulationData?.simulatedCompletionProbability ?? 37;
  const improvementDelta = simulationData?.improvementDeltaPercent ?? 0;
  const totalBudget = simulationData?.totalBudgetINR ?? 0;
  const patientsHelped = simulationData?.estimatedPatientsHelped ?? 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-tr from-slate-900 via-navy-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 text-teal-300 text-xs font-bold border border-teal-800 mb-2">
              <Cpu className="w-3.5 h-3.5 text-teal-400" />
              <span>Scenario Modeling Simulator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              What-If Intervention Simulator
            </h1>
            <p className="text-xs text-slate-300">
              Scenario modeling to evaluate estimated care completion gains from configurable community interventions
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-slate-900 bg-white hover:bg-slate-100 self-start sm:self-auto"
            onClick={() => {
              setSelectedCodes([]);
              triggerSimulation([]);
            }}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset All Toggles
          </Button>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="p-3 bg-slate-800/90 rounded-xl text-xs text-slate-300 flex items-center gap-2.5">
          <HeartHandshake className="w-4 h-4 text-teal-400 flex-shrink-0" />
          <span>
            <strong className="text-teal-300">Simulation / Operational Estimate:</strong> Modeled using
            sublinear barrier-reduction algorithms. Values represent operational forecasts, not medically validated clinical outcomes.
          </span>
        </div>
      </div>

      {/* Simulation Results Gauge & Metrics Ribbon */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Completion Gauge */}
          <div className="md:col-span-1 flex justify-center">
            <CompletionGauge
              score={simulatedProb}
              size={180}
              label="Simulated Completion Rate"
              sublabel={`Baseline: ${baselineProb}%`}
            />
          </div>

          {/* 3 Computed Simulation Results Cards */}
          <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-1">
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                Estimated Improvement Gain
              </span>
              <div className="text-2xl sm:text-3xl font-black text-teal-900">
                +{improvementDelta}%
              </div>
              <p className="text-[11px] text-teal-700">
                {baselineProb}% baseline → {simulatedProb}% with active portfolio
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Estimated Patients Saved
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                ~{patientsHelped}
              </div>
              <p className="text-[11px] text-slate-500">out of {cohortSize} regional patients</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Portfolio Budget
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{totalBudget.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500">
                ₹{Math.round(totalBudget / (patientsHelped || 1)).toLocaleString('en-IN')} per patient helped
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Interactive Intervention Selection Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-500" />
            Select Interventions to Simulate ({selectedCodes.length} Active)
          </h3>
          <span className="text-xs text-slate-500">Click any card to toggle on/off</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {catalog.map((item) => {
            const isSelected = selectedCodes.includes(item.code);
            const Icon = getInterventionIcon(item.category);

            return (
              <div
                key={item.code}
                onClick={() => toggleIntervention(item.code)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 select-none ${
                  isSelected
                    ? 'bg-teal-50/70 border-teal-400 ring-2 ring-teal-500/20 shadow-md transform scale-[1.02]'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-700'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      +{item.baseGainPercent}%
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{item.name}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] flex items-center justify-between text-slate-500">
                  <span>₹{item.unitCostINR.toLocaleString('en-IN')}</span>
                  <span className="font-bold text-teal-700">~{item.reachPatientsPerUnit} Patients</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
