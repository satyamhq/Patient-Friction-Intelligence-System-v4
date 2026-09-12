import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { patientService } from '../../services/patientService';
import {
  Activity,
  Bus,
  MapPin,
  Coins,
  FileCheck2,
  Clock,
  Laptop,
  Accessibility,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Building2,
  Compass,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TTSButton } from '../../components/common/TTSButton';

export interface AssessmentFormState {
  // 1. Transport
  transportMode: 'own_vehicle' | 'public_transport' | 'walking' | 'taxi_rideshare' | 'no_reliable';
  // 2. Distance
  distanceKm: number;
  travelTimeMinutes: number;
  transfersCount: number;
  // 3. Cost
  travelCostInr: number;
  appointmentCostInr: number;
  affordabilityConcern: 'none' | 'moderate' | 'severe';
  // 4. Documentation
  documentsAvailable: 'all_ready' | 'partially_missing' | 'none_available';
  recordsReadiness: 'ready' | 'hard_to_obtain' | 'missing';
  // 5. Time / Work
  workDuringClinicHours: 'no' | 'flexible_leave' | 'rigid_shift';
  expectedWageLoss: 'none' | 'partial_day' | 'full_day';
  // 6. Digital Access
  deviceType: 'smartphone' | 'feature_phone' | 'none';
  internetConnectivity: 'reliable' | 'spotty' | 'offline';
  digitalBookingComfort: 'comfortable' | 'needs_help' | 'unable_to_use';
  // 7. Accessibility
  mobilityRequirement: 'none' | 'walking_cane' | 'wheelchair' | 'stretcher';
  communicationNeed: 'standard' | 'dialect_only' | 'sign_assisted' | 'low_literacy';
}

const DEFAULT_STATE: AssessmentFormState = {
  transportMode: 'public_transport',
  distanceKm: 12,
  travelTimeMinutes: 35,
  transfersCount: 1,
  travelCostInr: 80,
  appointmentCostInr: 100,
  affordabilityConcern: 'moderate',
  documentsAvailable: 'all_ready',
  recordsReadiness: 'ready',
  workDuringClinicHours: 'flexible_leave',
  expectedWageLoss: 'none',
  deviceType: 'smartphone',
  internetConnectivity: 'reliable',
  digitalBookingComfort: 'comfortable',
  mobilityRequirement: 'none',
  communicationNeed: 'standard',
};

// Realistic Demo Scenario (Section 27 of specification)
const DEMO_SCENARIO_STATE: AssessmentFormState = {
  transportMode: 'public_transport',
  distanceKm: 35,
  travelTimeMinutes: 90,
  transfersCount: 2,
  travelCostInr: 240,
  appointmentCostInr: 350,
  affordabilityConcern: 'severe',
  documentsAvailable: 'partially_missing',
  recordsReadiness: 'hard_to_obtain',
  workDuringClinicHours: 'rigid_shift',
  expectedWageLoss: 'full_day',
  deviceType: 'feature_phone',
  internetConnectivity: 'spotty',
  digitalBookingComfort: 'unable_to_use',
  mobilityRequirement: 'walking_cane',
  communicationNeed: 'dialect_only',
};

export const PatientAccessAssessment: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<AssessmentFormState>(DEFAULT_STATE);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Friction Model Calculation (Section 6)
  const calculateFriction = (data: AssessmentFormState) => {
    // Category 1: Transport Friction (0 - 100)
    let transportScore = 20;
    if (data.transportMode === 'own_vehicle') transportScore = 15;
    else if (data.transportMode === 'walking') transportScore = data.distanceKm > 3 ? 90 : 35;
    else if (data.transportMode === 'taxi_rideshare') transportScore = 40;
    else if (data.transportMode === 'public_transport') transportScore = 55 + data.transfersCount * 15;
    else if (data.transportMode === 'no_reliable') transportScore = 95;
    transportScore = Math.min(100, transportScore);

    // Category 2: Distance & Travel Time Friction (0 - 100)
    let distanceScore = 15;
    if (data.distanceKm > 40 || data.travelTimeMinutes > 90) distanceScore = 90;
    else if (data.distanceKm > 20 || data.travelTimeMinutes > 60) distanceScore = 70;
    else if (data.distanceKm > 10 || data.travelTimeMinutes > 30) distanceScore = 45;
    else distanceScore = 20;

    // Category 3: Cost Burden Friction (0 - 100)
    let costScore = 15;
    if (data.affordabilityConcern === 'severe' || data.travelCostInr > 200) costScore = 85;
    else if (data.affordabilityConcern === 'moderate' || data.travelCostInr > 80) costScore = 55;
    else costScore = 20;

    // Category 4: Documentation Friction (0 - 100)
    let docScore = 15;
    if (data.documentsAvailable === 'none_available') docScore = 90;
    else if (data.documentsAvailable === 'partially_missing' || data.recordsReadiness === 'hard_to_obtain') docScore = 65;
    else docScore = 20;

    // Category 5: Time / Work Friction (0 - 100)
    let workScore = 15;
    if (data.expectedWageLoss === 'full_day' || data.workDuringClinicHours === 'rigid_shift') workScore = 85;
    else if (data.expectedWageLoss === 'partial_day') workScore = 55;
    else workScore = 20;

    // Category 6: Digital Access Friction (0 - 100)
    let digitalScore = 15;
    if (data.deviceType === 'none' || data.digitalBookingComfort === 'unable_to_use') digitalScore = 85;
    else if (data.deviceType === 'feature_phone' || data.internetConnectivity === 'spotty' || data.digitalBookingComfort === 'needs_help') digitalScore = 60;
    else digitalScore = 20;

    // Weighted Total Access Friction (Section 6)
    // Weights: Transport 30%, Cost 20%, Documentation 15%, Time/work 15%, Distance 10%, Digital 10%
    const totalFriction = Math.round(
      transportScore * 0.30 +
      costScore * 0.20 +
      docScore * 0.15 +
      workScore * 0.15 +
      distanceScore * 0.10 +
      digitalScore * 0.10
    );

    // Friction Level Classification (Section 6)
    let level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
    let levelLabel = 'LOW ACCESS FRICTION';
    if (totalFriction >= 75) {
      level = 'CRITICAL';
      levelLabel = 'CRITICAL ACCESS BARRIER';
    } else if (totalFriction >= 50) {
      level = 'HIGH';
      levelLabel = 'HIGH ACCESS FRICTION';
    } else if (totalFriction >= 25) {
      level = 'MODERATE';
      levelLabel = 'MODERATE ACCESS FRICTION';
    }

    // Barrier Prioritization (Section 8)
    const categoryList = [
      {
        name: 'Transportation Barrier',
        category: 'Transportation',
        score: transportScore,
        weight: '30%',
        reason:
          data.transportMode === 'no_reliable'
            ? 'No reliable public or private transit option connects patient residence to clinic.'
            : data.transfersCount >= 2
            ? `${data.transfersCount} route transfers required, significantly amplifying journey drop-off risk.`
            : 'Public commute schedule requires prolonged road transit and unpredictable frequency.',
        intervention:
          'Deploy scheduled rural health feeder shuttle and coordinate pickup routes with community transit.',
      },
      {
        name: 'Cost & Financial Burden',
        category: 'Cost',
        score: costScore,
        weight: '20%',
        reason:
          data.affordabilityConcern === 'severe'
            ? `Severe out-of-pocket travel (₹${data.travelCostInr}) and auxiliary expenses compete with daily food budget.`
            : 'Moderate out-of-pocket commute costs impose avoidable friction on timely visits.',
        intervention:
          'Connect patient with Ayushman Bharat travel reimbursement desks and subsidize local transport vouchers.',
      },
      {
        name: 'Documentation Gap',
        category: 'Documentation',
        score: docScore,
        weight: '15%',
        reason:
          data.documentsAvailable === 'partially_missing'
            ? 'Key identification cards or PM-JAY scheme credentials require physical verification.'
            : data.documentsAvailable === 'none_available'
            ? 'Missing essential scheme documents poses immediate desk registration rejection risk.'
            : 'Standard documentation is largely in place.',
        intervention:
          'Issue pre-visit digital document checklist and deploy frontline ASHA help for ABHA verification.',
      },
      {
        name: 'Work & Timing Conflict',
        category: 'Time / Work',
        score: workScore,
        weight: '15%',
        reason:
          data.expectedWageLoss === 'full_day'
            ? 'Patient faces complete loss of daily wage due to rigid morning clinic hours and queue delays.'
            : data.workDuringClinicHours === 'rigid_shift'
            ? 'Shift timing conflicts with morning outpatient clinic intake window.'
            : 'Work hours allow flexible leave without severe economic penalty.',
        intervention:
          'Offer flexible afternoon/evening consultation windows and rapid-track digital token appointments.',
      },
      {
        name: 'Distance & Geographic Transit',
        category: 'Distance',
        score: distanceScore,
        weight: '10%',
        reason:
          data.distanceKm >= 30
            ? `Distance of ${data.distanceKm} km (~${data.travelTimeMinutes} mins) creates severe geographic exhaustion.`
            : `Travel distance of ${data.distanceKm} km is manageable with organized transit.`,
        intervention:
          'Route initial visit via nearest Primary Health Center (PHC) with teleconsultation uplink.',
      },
      {
        name: 'Digital Exclusion Barrier',
        category: 'Digital Access',
        score: digitalScore,
        weight: '10%',
        reason:
          data.deviceType === 'feature_phone' || data.digitalBookingComfort === 'unable_to_use'
            ? 'Non-smartphone status or digital unfamiliarity prevents self-booking of clinic tokens.'
            : 'Patient possesses adequate digital literacy and network connection.',
        intervention:
          'Enable toll-free IVR voice booking and local ASHA assisted digital registration kiosk.',
      },
    ];

    // Sort descending by score to rank top barriers
    const sortedBarriers = [...categoryList].sort((a, b) => b.score - a.score);

    return {
      totalFriction,
      level,
      levelLabel,
      categories: categoryList,
      topBarriers: sortedBarriers.slice(0, 3),
    };
  };

  const results = calculateFriction(form);

  const handleSaveToProfile = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/assessment');
      return;
    }
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await patientService.updateProfile({
        transportAvailability:
          form.transportMode === 'no_reliable'
            ? 'none'
            : form.transportMode === 'walking'
            ? 'low'
            : form.transportMode === 'public_transport'
            ? 'moderate'
            : 'high',
        documentationStatus:
          form.documentsAvailable === 'none_available'
            ? 'incomplete'
            : form.documentsAvailable === 'partially_missing'
            ? 'partial'
            : 'complete',
        financialAccessibility:
          form.affordabilityConcern === 'severe'
            ? 'severely_constrained'
            : form.affordabilityConcern === 'moderate'
            ? 'moderate_budget'
            : 'adequate',
        appointmentFlexibility:
          form.workDuringClinicHours === 'rigid_shift'
            ? 'inflexible_daily_wage'
            : form.workDuringClinicHours === 'flexible_leave'
            ? 'moderate'
            : 'flexible',
        digitalAccessLevel:
          form.deviceType === 'none'
            ? 'none'
            : form.deviceType === 'feature_phone'
            ? 'basic'
            : 'moderate',
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      console.error('Failed to save assessment', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 1. Header & Non-Clinical Mandate Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800">
              <Compass className="w-3.5 h-3.5 text-teal-600" />
              <span>Section 5 & 6 • Patient Access & Logistics Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Patient Access Friction Assessment
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Systematic evaluation of non-clinical barriers (transportation, distance, cost, documentation, wage loss, digital access, and mobility) that prevent care completion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Section 27 Demo Scenario Button */}
            <button
              type="button"
              onClick={() => setForm(DEMO_SCENARIO_STATE)}
              className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-300 dark:border-amber-700 hover:bg-amber-100 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Load realistic scenario where hospital exists but high barriers prevent completion"
            >
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              <span>Load Demo Scenario (Section 27)</span>
            </button>

            <button
              type="button"
              onClick={() => setForm(DEFAULT_STATE)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Reset assessment inputs"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>Reset</span>
            </button>

            <TTSButton
              text={`Patient Access Friction Assessment. Total access friction is evaluated at ${results.totalFriction} out of 100. Friction level: ${results.levelLabel}. Primary barrier is ${results.topBarriers[0]?.name}.`}
              label="Listen Assessment"
            />
          </div>
        </div>

        {/* Non-Clinical Disclaimer (Section 1 & 25) */}
        <div className="p-3.5 bg-slate-900 text-white rounded-2xl text-xs flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-teal-300">
              Non-Clinical Scope & Originality Mandate:
            </p>
            <p className="text-slate-300 leading-relaxed">
              PFIS evaluates logistical and operational accessibility barriers only. It does <strong>NOT</strong> diagnose medical conditions, recommend drug treatments, replace physician consultations, or predict clinical illness trajectories.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs on Left (60%), Explainable Friction Results on Right (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: The 7 Assessment Input Categories */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category 1: TRANSPORTATION */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <Bus className="w-4 h-4 text-teal-600" />
              <span>1. Transportation Mode & Commute Option</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {[
                { id: 'own_vehicle', label: 'Own Vehicle (2-wheeler / Car)' },
                { id: 'public_transport', label: 'Public Transport (Bus / Train)' },
                { id: 'taxi_rideshare', label: 'Shared Auto / Hired Taxi' },
                { id: 'walking', label: 'Walking on Foot' },
                { id: 'no_reliable', label: 'No Reliable Transport Available' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setForm({ ...form, transportMode: opt.id as any })}
                  className={`p-3 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                    form.transportMode === opt.id
                      ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-500 text-teal-900 dark:text-teal-200 font-bold shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  } ${opt.id === 'no_reliable' ? 'sm:col-span-2' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category 2: DISTANCE & TRAVEL TIME */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>2. Distance, Travel Time & Route Transfers</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Approx. Distance (km):
                </label>
                <input
                  type="number"
                  min={1}
                  max={250}
                  value={form.distanceKm}
                  onChange={(e) => setForm({ ...form, distanceKm: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  One-Way Transit Time (mins):
                </label>
                <input
                  type="number"
                  min={5}
                  max={480}
                  value={form.travelTimeMinutes}
                  onChange={(e) => setForm({ ...form, travelTimeMinutes: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Vehicle Transfers:
                </label>
                <select
                  value={form.transfersCount}
                  onChange={(e) => setForm({ ...form, transfersCount: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value={0}>0 (Direct Route)</option>
                  <option value={1}>1 Transfer</option>
                  <option value={2}>2 Transfers</option>
                  <option value={3}>3+ Transfers (High Friction)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category 3: COST BURDEN */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <Coins className="w-4 h-4 text-teal-600" />
              <span>3. Financial & Out-of-Pocket Cost Burden</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Round-Trip Travel Fare (₹):
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.travelCostInr}
                  onChange={(e) => setForm({ ...form, travelCostInr: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Non-Clinical Expenses (₹):
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.appointmentCostInr}
                  onChange={(e) => setForm({ ...form, appointmentCostInr: Number(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Affordability Concern:
                </label>
                <select
                  value={form.affordabilityConcern}
                  onChange={(e) => setForm({ ...form, affordabilityConcern: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="none">None (Comfortable)</option>
                  <option value="moderate">Moderate Expense</option>
                  <option value="severe">Severe (Competes with food/bills)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category 4: DOCUMENTATION */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <FileCheck2 className="w-4 h-4 text-teal-600" />
              <span>4. Scheme & Paperwork Documentation Readiness</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Required ID & Scheme Cards (Ayushman/PM-JAY):
                </label>
                <select
                  value={form.documentsAvailable}
                  onChange={(e) => setForm({ ...form, documentsAvailable: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="all_ready">All Documents Ready & Linked</option>
                  <option value="partially_missing">Missing Aadhaar / Card Linkage</option>
                  <option value="none_available">No Valid Scheme Documents</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Past Referrals & Prescriptions:
                </label>
                <select
                  value={form.recordsReadiness}
                  onChange={(e) => setForm({ ...form, recordsReadiness: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="ready">Ready with Patient</option>
                  <option value="hard_to_obtain">Difficult to Obtain / Scattered</option>
                  <option value="missing">Missing / Lost</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category 5: TIME & WORK CONSTRAINTS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <Clock className="w-4 h-4 text-teal-600" />
              <span>5. Working-Hour & Wage-Loss Constraints</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Shift Timing vs Clinic Hours:
                </label>
                <select
                  value={form.workDuringClinicHours}
                  onChange={(e) => setForm({ ...form, workDuringClinicHours: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="no">Not Working / Free During Clinic Hours</option>
                  <option value="flexible_leave">Can Take Flexible Leave</option>
                  <option value="rigid_shift">Rigid Working Shift (Cannot leave)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Expected Wage Loss from Clinic Queue:
                </label>
                <select
                  value={form.expectedWageLoss}
                  onChange={(e) => setForm({ ...form, expectedWageLoss: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="none">No Wage Loss</option>
                  <option value="partial_day">Half-Day Daily Wage Lost</option>
                  <option value="full_day">Full Day Daily Wage Lost</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category 6: DIGITAL ACCESS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <Laptop className="w-4 h-4 text-teal-600" />
              <span>6. Digital Connectivity & Device Availability</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Device Type:
                </label>
                <select
                  value={form.deviceType}
                  onChange={(e) => setForm({ ...form, deviceType: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="smartphone">Smartphone</option>
                  <option value="feature_phone">Basic Feature Phone</option>
                  <option value="none">No Personal Phone</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Internet Connection:
                </label>
                <select
                  value={form.internetConnectivity}
                  onChange={(e) => setForm({ ...form, internetConnectivity: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="reliable">Reliable 4G/5G</option>
                  <option value="spotty">Spotty / Weak Network</option>
                  <option value="offline">Mostly Offline</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Self-Booking Comfort:
                </label>
                <select
                  value={form.digitalBookingComfort}
                  onChange={(e) => setForm({ ...form, digitalBookingComfort: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="comfortable">Comfortable</option>
                  <option value="needs_help">Needs Assistance</option>
                  <option value="unable_to_use">Unable to Use App</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category 7: MOBILITY & COMMUNICATION */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-card space-y-4">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <Accessibility className="w-4 h-4 text-teal-600" />
              <span>7. Physical Mobility & Communication Accessibility</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Mobility Assistance Requirement:
                </label>
                <select
                  value={form.mobilityRequirement}
                  onChange={(e) => setForm({ ...form, mobilityRequirement: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="none">None (Walks Independently)</option>
                  <option value="walking_cane">Walking Support / Cane</option>
                  <option value="wheelchair">Wheelchair Ramp Required</option>
                  <option value="stretcher">Stretcher / Ambulance Access</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  Communication Needs:
                </label>
                <select
                  value={form.communicationNeed}
                  onChange={(e) => setForm({ ...form, communicationNeed: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="standard">Standard Hindi / English</option>
                  <option value="dialect_only">Regional Dialect Only (e.g. Santali/Bhojpuri)</option>
                  <option value="low_literacy">Low-Literacy / Audio Guidance Required</option>
                  <option value="sign_assisted">Sign Language / Visual Aid</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Explainable Friction Results (Section 6, 7, 8, 9, 30) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          {/* Main Score Card */}
          <div className="bg-gradient-to-tr from-slate-900 to-navy-950 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-400 block">
                  Deterministic Access Scoring
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  Access Friction Analysis
                </h3>
              </div>
              <StatusBadge status={results.level} size="md" />
            </div>

            {/* Score Number Display */}
            <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/10">
              <div>
                <span className="text-xs text-slate-400 block">TOTAL ACCESS FRICTION:</span>
                <p className="text-3xl sm:text-4xl font-black text-white mt-0.5">
                  {results.totalFriction} <span className="text-lg text-slate-400 font-medium">/ 100</span>
                </p>
                <span className="text-xs font-bold text-teal-300 block mt-1">
                  {results.levelLabel}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Estimated Care Completion:</span>
                <p className="text-2xl font-black text-teal-400 mt-0.5">
                  {Math.max(10, 100 - results.totalFriction)}%
                </p>
                <span className="text-[10px] text-slate-400 block">
                  {results.totalFriction > 50 ? 'High Dropout Hazard' : 'Feasible Access Envelope'}
                </span>
              </div>
            </div>

            {/* Dimension Breakdown Bars (Section 6) */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-300 block uppercase tracking-wider">
                Category Weight & Friction Contributions:
              </span>
              {results.categories.map((c) => (
                <div key={c.category} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">
                      {c.category} ({c.weight})
                    </span>
                    <span className={`font-bold ${c.score >= 70 ? 'text-rose-400' : c.score >= 45 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {c.score} / 100
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        c.score >= 70 ? 'bg-rose-500' : c.score >= 45 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Three Questions of Section 30 */}
            <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 text-xs space-y-1.5 text-slate-300">
              <p className="font-bold text-teal-300">Section 30 • Three Core Insights:</p>
              <p><strong>1. WHAT is preventing access?</strong> {results.topBarriers[0]?.name} is the most acute inhibitor.</p>
              <p><strong>2. HOW severe is friction?</strong> {results.totalFriction}/100 ({results.levelLabel}).</p>
              <p><strong>3. WHERE can systems intervene?</strong> {results.topBarriers[0]?.intervention}</p>
            </div>
          </div>

          {/* Barrier Breakdown & Prioritization Card (Section 8 & 9) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Prioritized Barrier Breakdown</span>
              </h4>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Ranked by Severity
              </span>
            </div>

            <div className="space-y-3.5">
              {results.topBarriers.map((b, idx) => (
                <div
                  key={b.name}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                        #{idx + 1}
                      </span>
                      {b.name}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.score >= 70
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {b.score >= 70 ? 'High Severity' : 'Moderate Severity'} ({b.score}/100)
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                    <strong>Reason:</strong> {b.reason}
                  </p>

                  <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200">
                    <strong>Possible Non-Clinical Intervention:</strong> {b.intervention}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons to Hospital Discovery & Profile Save */}
            <div className="pt-2 space-y-2.5">
              <Link to="/patient/hospitals" className="w-full block">
                <Button
                  variant="primary"
                  size="md"
                  icon={<Building2 className="w-4 h-4" />}
                  className="w-full justify-center shadow-md font-bold text-xs sm:text-sm"
                >
                  Proceed to Hospital & Facility Discovery →
                </Button>
              </Link>

              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleSaveToProfile}
                  disabled={isSaving}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${saveSuccess ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span>
                    {isSaving ? 'Updating Profile...' : saveSuccess ? 'Profile Assessment Saved!' : 'Save Assessment to My Health Profile'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
