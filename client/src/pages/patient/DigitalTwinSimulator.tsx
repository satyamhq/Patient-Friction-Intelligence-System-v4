import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  digitalTwinService,
  NonClinicalIntervention,
  FacilityContextItem,
  SimulationResult,
  SavedSimulationEntity,
} from '../../services/digitalTwinService';
import { Button } from '../../components/common/Button';
import { CompletionGauge } from '../../components/charts/CompletionGauge';
import { TTSButton } from '../../components/common/TTSButton';
import {
  Activity,
  Sliders,
  MapPin,
  Bus,
  Building2,
  Stethoscope,
  Pill,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Play,
  ShieldAlert,
  Users2,
  Laptop,
  Coins,
  ArrowRight,
  BookmarkPlus,
  History,
  Trash2,
  FileCheck2,
  Sparkles,
  Info,
  Clock,
  Navigation,
  Accessibility,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';

export const DigitalTwinSimulator: React.FC = () => {
  const { user } = useAuth();

  // Context & Data State
  const [loadingContext, setLoadingContext] = useState(true);
  const [facilities, setFacilities] = useState<FacilityContextItem[]>([]);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [interventionsCatalog, setInterventionsCatalog] = useState<NonClinicalIntervention[]>([]);
  const [modelVersion, setModelVersion] = useState('PFIS-DT-v2.4');

  // Simulation Form Controls
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([]);
  
  // Non-Clinical Profile Overrides
  const [distanceKm, setDistanceKm] = useState<number>(15);
  const [transportMode, setTransportMode] = useState<string>('bus');
  const [digitalLiteracy, setDigitalLiteracy] = useState<string>('basic');
  const [familySupport, setFamilySupport] = useState<string>('moderate');
  const [wageLossRisk, setWageLossRisk] = useState<string>('moderate');
  const [smartphoneAccess, setSmartphoneAccess] = useState<boolean>(true);
  const [internetType, setInternetType] = useState<string>('4g_5g');
  const [disabilityNeeds, setDisabilityNeeds] = useState<string>('none');
  const [isRural, setIsRural] = useState<boolean>(true);
  const [docReadiness, setDocReadiness] = useState<string>('partial');

  // Active Simulation Results
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Save Scenario & History State
  const [savingScenario, setSavingScenario] = useState(false);
  const [scenarioNotes, setScenarioNotes] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulationEntity[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 1. Initial Data Fetching: Context + Interventions
  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        setLoadingContext(true);
        setErrorMsg(null);
        const [contextRes, catalog] = await Promise.all([
          digitalTwinService.getContext(),
          digitalTwinService.getInterventions(),
        ]);

        if (!isMounted) return;

        setInterventionsCatalog(catalog);
        setFacilities(contextRes.facilities || []);
        setModelVersion(contextRes.modelVersion || 'PFIS-DT-v2.4');

        if (contextRes.facilities && contextRes.facilities.length > 0) {
          setSelectedFacilityId(contextRes.facilities[0].id);
        }

        if (contextRes.profile) {
          setUserProfile(contextRes.profile);
          // Pre-populate non-clinical parameters from real database profile
          if (contextRes.profile.distance_to_hospital_km) {
            setDistanceKm(Number(contextRes.profile.distance_to_hospital_km));
          }
          if (contextRes.profile.transport_mode) {
            setTransportMode(contextRes.profile.transport_mode.toLowerCase());
          }
          if (contextRes.profile.digital_literacy) {
            setDigitalLiteracy(contextRes.profile.digital_literacy.toLowerCase());
          }
          if (contextRes.profile.family_support) {
            setFamilySupport(contextRes.profile.family_support.toLowerCase());
          }
          if (contextRes.profile.wage_loss_risk) {
            setWageLossRisk(contextRes.profile.wage_loss_risk.toLowerCase());
          }
          if (contextRes.profile.smartphone_access !== undefined) {
            setSmartphoneAccess(Boolean(contextRes.profile.smartphone_access));
          }
          if (contextRes.profile.internet_type) {
            setInternetType(contextRes.profile.internet_type.toLowerCase());
          }
          if (contextRes.profile.disability_needs) {
            setDisabilityNeeds(contextRes.profile.disability_needs);
          }
          if (contextRes.profile.is_rural !== undefined) {
            setIsRural(Boolean(contextRes.profile.is_rural));
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'Failed to load simulator data');
        }
      } finally {
        if (isMounted) setLoadingContext(false);
      }
    };

    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update distance when facility changes if facility has precomputed distanceKm
  useEffect(() => {
    if (selectedFacilityId && facilities.length > 0) {
      const selected = facilities.find((f) => f.id === selectedFacilityId);
      if (selected?.distanceKm) {
        setDistanceKm(Math.round(selected.distanceKm * 10) / 10);
      }
    }
  }, [selectedFacilityId, facilities]);

  // 2. Run Simulation Execution
  const runSimulation = useCallback(async () => {
    if (!selectedFacilityId) return;
    try {
      setIsSimulating(true);
      setErrorMsg(null);
      const result = await digitalTwinService.runSimulation({
        facilityId: selectedFacilityId,
        selectedInterventions,
        profileOverrides: {
          distance_to_hospital_km: distanceKm,
          transport_mode: transportMode,
          digital_literacy: digitalLiteracy,
          family_support: familySupport,
          wage_loss_risk: wageLossRisk,
          smartphone_access: smartphoneAccess,
          internet_type: internetType,
          disability_needs: disabilityNeeds,
          is_rural: isRural,
          document_readiness: docReadiness,
        },
      });
      setSimulation(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Simulation execution failed');
    } finally {
      setIsSimulating(false);
    }
  }, [
    selectedFacilityId,
    selectedInterventions,
    distanceKm,
    transportMode,
    digitalLiteracy,
    familySupport,
    wageLossRisk,
    smartphoneAccess,
    internetType,
    disabilityNeeds,
    isRural,
    docReadiness,
  ]);

  // Trigger simulation once initial context is loaded
  useEffect(() => {
    if (!loadingContext && selectedFacilityId) {
      runSimulation();
    }
  }, [loadingContext, selectedFacilityId, runSimulation]);

  // 3. Toggle Intervention
  const toggleIntervention = (code: string) => {
    setSelectedInterventions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // 4. Save Simulation
  const handleSaveScenario = async () => {
    if (!simulation) return;
    try {
      setSavingScenario(true);
      await digitalTwinService.saveSimulation(simulation, scenarioNotes);
      setShowSaveModal(false);
      setScenarioNotes('');
      setSaveSuccessMsg('Simulation scenario successfully saved to database.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save scenario');
    } finally {
      setSavingScenario(false);
    }
  };

  // 5. Load History
  const openHistoryModal = async () => {
    setShowHistoryModal(true);
    try {
      setLoadingHistory(true);
      const role = (user?.role || '').toLowerCase();
      const isAdmin = role === 'admin' || role === 'government';
      const history = await digitalTwinService.getHistory(isAdmin);
      setSavedSimulations(history);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load simulation history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDeleteSaved = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this saved simulation record?')) return;
    try {
      await digitalTwinService.deleteById(id);
      setSavedSimulations((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete record');
    }
  };

  const handleLoadSaved = (saved: SavedSimulationEntity) => {
    if (saved.facility_id) {
      setSelectedFacilityId(saved.facility_id);
    }
    setSelectedInterventions(saved.selected_interventions || []);
    if (saved.profile_snapshot) {
      const snap = saved.profile_snapshot;
      if (snap.distance_to_hospital_km) setDistanceKm(snap.distance_to_hospital_km);
      if (snap.transport_mode) setTransportMode(snap.transport_mode);
      if (snap.digital_literacy) setDigitalLiteracy(snap.digital_literacy);
      if (snap.family_support) setFamilySupport(snap.family_support);
      if (snap.wage_loss_risk) setWageLossRisk(snap.wage_loss_risk);
      if (snap.smartphone_access !== undefined) setSmartphoneAccess(snap.smartphone_access);
      if (snap.is_rural !== undefined) setIsRural(snap.is_rural);
    }
    setShowHistoryModal(false);
  };

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/70 to-indigo-50/40 p-4 sm:p-6 lg:p-8">
      {/* Top Header & Disclaimers */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {modelVersion}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Pure Non-Clinical Twin
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 flex items-center gap-3">
              <Activity className="w-8 h-8 text-indigo-600" />
              Patient Friction Digital Twin Simulator
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Simulates how transport availability, physical distance, queue congestion, digital access, and daily wage vulnerability impact healthcare journey completion.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <TTSButton
              text="PFIS Patient Friction Digital Twin Simulator. Models non-clinical access friction across 9 operational dimensions and 7 virtual journey milestones."
              label="Listen"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={openHistoryModal}
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4 text-slate-600" />
              History
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSaveModal(true)}
              disabled={!simulation}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <BookmarkPlus className="w-4 h-4" />
              Save Scenario
            </Button>
          </div>
        </div>

        {/* Mandatory Non-Clinical Regulatory Notice */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-4 flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <span className="font-semibold">Non-Clinical Operational Simulation Only: </span>
            This simulator models socio-geographic, transport, queue waiting, and economic barriers to care navigation. It strictly does NOT diagnose medical conditions, predict clinical disease progression, suggest treatments, or replace professional healthcare judgment.
          </div>
        </div>

        {/* Notifications / Alerts */}
        {saveSuccessMsg && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            {saveSuccessMsg}
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-800 text-sm">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            {errorMsg}
          </div>
        )}

        {/* Primary Simulation Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Profile & Parameters (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Facility Selector Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Target Facility Destination
                </h3>
                <span className="text-xs text-slate-500 font-medium">
                  {facilities.length} in registry
                </span>
              </div>

              {loadingContext ? (
                <div className="py-6 text-center text-xs text-slate-500">Loading facility registry...</div>
              ) : (
                <div className="space-y-3">
                  <select
                    value={selectedFacilityId}
                    onChange={(e) => setSelectedFacilityId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {facilities.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} {fac.distanceKm !== undefined ? `(~${fac.distanceKm} km)` : ''} - {fac.city || 'Punjab'}
                      </option>
                    ))}
                  </select>

                  {selectedFacility && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Type:</span>
                        <span className="font-semibold text-slate-700">{selectedFacility.type || 'Secondary Hospital'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Bed Availability:</span>
                        <span className="font-semibold text-emerald-700">
                          {selectedFacility.available_beds ?? '--'} / {selectedFacility.total_beds ?? '--'} Available
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">24/7 Emergency:</span>
                        <span className="font-semibold text-slate-700">
                          {selectedFacility.emergency_24x7 ? 'Yes (Active Triage)' : 'Standard Hours'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Teleconsult Desk:</span>
                        <span className="font-semibold text-indigo-700">
                          {selectedFacility.teleconsult_available ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      {selectedFacility.accessibility_facilities && (
                        <div className="pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500 block mb-0.5">Accessibility Features:</span>
                          <span className="text-slate-700">{selectedFacility.accessibility_facilities}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Patient Access Profile (Non-Clinical Parameters) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  Access Constraints
                </h3>
                {userProfile ? (
                  <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                    Profile Synced
                  </span>
                ) : (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                    Manual Sandbox
                  </span>
                )}
              </div>

              {/* Distance Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-slate-500" /> One-Way Travel Distance:
                  </span>
                  <span className="font-bold text-indigo-600">{distanceKm} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 km (Local)</span>
                  <span>50 km (Regional)</span>
                  <span>120 km (Remote)</span>
                </div>
              </div>

              {/* Transport Mode */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-slate-500" /> Transport Mode
                </label>
                <select
                  value={transportMode}
                  onChange={(e) => setTransportMode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="walking">Walking / Unassisted</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="bus">Public Rural Bus</option>
                  <option value="auto_rickshaw">Shared Auto-Rickshaw</option>
                  <option value="train">Passenger Train</option>
                  <option value="ambulance">Government / 108 Ambulance</option>
                  <option value="private_vehicle">Private Motorcycle / Car</option>
                </select>
              </div>

              {/* Wage Loss Risk */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-slate-500" /> Economic / Wage Loss Risk
                </label>
                <select
                  value={wageLossRisk}
                  onChange={(e) => setWageLossRisk(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="critical_daily_wage">Critical Daily Wage Earner (Forfeits income)</option>
                  <option value="high">High Economic Sensitivity</option>
                  <option value="moderate">Moderate Financial Cushion</option>
                  <option value="low">Low Economic Sensitivity / Salaried</option>
                </select>
              </div>

              {/* Digital Literacy */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-slate-500" /> Digital Literacy
                </label>
                <select
                  value={digitalLiteracy}
                  onChange={(e) => setDigitalLiteracy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="none">None / Feature Phone Only</option>
                  <option value="basic">Basic (Assisted App Usage)</option>
                  <option value="intermediate">Intermediate (Self Navigation)</option>
                  <option value="advanced">Advanced Tech Competency</option>
                </select>
              </div>

              {/* Family / Escort Support */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <Users2 className="w-3.5 h-3.5 text-slate-500" /> Caregiver / Escort Availability
                </label>
                <select
                  value={familySupport}
                  onChange={(e) => setFamilySupport(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="none">None (Traveling Completely Alone)</option>
                  <option value="dependent_elderly">Dependent Elderly / Constrained</option>
                  <option value="single_parent">Single Parent with Dependent</option>
                  <option value="moderate">Moderate Family Support</option>
                  <option value="high">Dedicated Adult Escort Available</option>
                </select>
              </div>

              {/* Physical Accessibility Needs */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <Accessibility className="w-3.5 h-3.5 text-slate-500" /> Disability / Mobility Needs
                </label>
                <select
                  value={disabilityNeeds}
                  onChange={(e) => setDisabilityNeeds(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-800 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="none">No Physical Mobility Constraints</option>
                  <option value="wheelchair">Wheelchair / Ramp Dependent</option>
                  <option value="mobility_restricted">Limited Mobility / Walking Stick</option>
                  <option value="vision_impaired">Visually Impaired / Guided</option>
                  <option value="hearing_impaired">Hearing / Communication Impairment</option>
                </select>
              </div>

              {/* Toggles: Smartphone & Rural */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={smartphoneAccess}
                    onChange={(e) => setSmartphoneAccess(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>Smartphone Owner</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={isRural}
                    onChange={(e) => setIsRural(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                  />
                  <span>Rural Habitation</span>
                </label>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={runSimulation}
                disabled={isSimulating}
                className="w-full flex items-center justify-center gap-2 mt-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                Recalculate Access Friction
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Interventions & Simulation Results (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Non-Clinical Interventions Catalog */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Non-Clinical Intervention Modeling
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select operational support measures to simulate barrier reduction and journey completion rate.
                  </p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-semibold border border-indigo-100">
                  {selectedInterventions.length} Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {interventionsCatalog.map((interv) => {
                  const isSelected = selectedInterventions.includes(interv.code);
                  return (
                    <div
                      key={interv.code}
                      onClick={() => toggleIntervention(interv.code)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              interv.category === 'CARE'
                                ? 'bg-pink-100 text-pink-700'
                                : interv.category === 'TRANSPORT'
                                ? 'bg-blue-100 text-blue-700'
                                : interv.category === 'DIGITAL'
                                ? 'bg-purple-100 text-purple-700'
                                : interv.category === 'FINANCIAL'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {interv.category}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                              isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900">{interv.name}</h4>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {interv.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] font-medium text-indigo-700">
                        {interv.friction_reduction_description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Metrics Comparison Scoreboard */}
            {simulation && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-600" />
                      Simulation Assessment Scorecard
                    </h3>
                    <p className="text-xs text-slate-500">
                      Calculated from live facility operational load and patient socio-geographic constraints.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">Reduction:</span>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      -{simulation.friction_reduction_points} Points Friction
                    </span>
                  </div>
                </div>

                {/* Scorecards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Baseline Friction */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Baseline Friction
                    </span>
                    <div className="my-2">
                      <span className="text-3xl font-black text-slate-900">
                        {simulation.baseline_friction_score}
                      </span>
                      <span className="text-xs text-slate-400 font-medium ml-1">/ 100</span>
                    </div>
                    <span className="text-[11px] font-medium text-amber-700">
                      Unmitigated Barrier Load
                    </span>
                  </div>

                  {/* Simulated Friction */}
                  <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/80 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                      Simulated Friction
                    </span>
                    <div className="my-2">
                      <span className="text-3xl font-black text-indigo-900">
                        {simulation.simulated_friction_score}
                      </span>
                      <span className="text-xs text-indigo-500 font-medium ml-1">/ 100</span>
                    </div>
                    <span className="text-[11px] font-medium text-indigo-700">
                      With Active Interventions
                    </span>
                  </div>

                  {/* Baseline Completion Rate */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Baseline Completion
                    </span>
                    <div className="my-2">
                      <span className="text-3xl font-black text-slate-800">
                        {simulation.baseline_completion_rate}%
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">
                      Estimated Unassisted Journey
                    </span>
                  </div>

                  {/* Simulated Completion Rate */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 flex flex-col justify-between">
                    <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                      Simulated Completion
                    </span>
                    <div className="my-2">
                      <span className="text-3xl font-black text-emerald-800">
                        {simulation.simulated_completion_rate}%
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-700">
                      +{simulation.simulated_completion_rate - simulation.baseline_completion_rate}% Lift
                    </span>
                  </div>
                </div>

                {/* 9-Dimension Friction Breakdown Progress Bars */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Non-Clinical Access Dimension Comparison (Baseline vs Mitigated)
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    {[
                      { key: 'travel_burden_score', label: 'Travel Distance Burden', base: simulation.sub_scores.travel_burden_score, mit: simulation.mitigated_sub_scores.travel_burden_score },
                      { key: 'transport_burden_score', label: 'Transport Frequency / Absence', base: simulation.sub_scores.transport_burden_score, mit: simulation.mitigated_sub_scores.transport_burden_score },
                      { key: 'waiting_burden_score', label: 'Queue / Wait Time Congestion', base: simulation.sub_scores.waiting_burden_score, mit: simulation.mitigated_sub_scores.waiting_burden_score },
                      { key: 'digital_access_burden_score', label: 'Digital Literacy & Mobile Access', base: simulation.sub_scores.digital_access_burden_score, mit: simulation.mitigated_sub_scores.digital_access_burden_score },
                      { key: 'caregiver_burden_score', label: 'Caregiver / Escort Requirement', base: simulation.sub_scores.caregiver_burden_score, mit: simulation.mitigated_sub_scores.caregiver_burden_score },
                      { key: 'diagnostic_burden_score', label: 'Diagnostic Test Availability', base: simulation.sub_scores.diagnostic_burden_score, mit: simulation.mitigated_sub_scores.diagnostic_burden_score },
                      { key: 'medicine_burden_score', label: 'Essential Medicine Formulary Stock', base: simulation.sub_scores.medicine_burden_score, mit: simulation.mitigated_sub_scores.medicine_burden_score },
                      { key: 'accessibility_burden_score', label: 'Facility Physical Navigation', base: simulation.sub_scores.accessibility_burden_score, mit: simulation.mitigated_sub_scores.accessibility_burden_score },
                    ].map((row) => (
                      <div key={row.key} className="space-y-1">
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-700">{row.label}</span>
                          <span className="text-slate-500">
                            <span className="line-through text-slate-400 mr-2">{row.base}</span>
                            <span className="font-bold text-indigo-700">{row.mit} / 100</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${row.mit}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 7 Virtual Journey Milestones */}
            {simulation && (
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-indigo-600" />
                      7 Virtual Patient Journey Milestones
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Simulated stage progression evaluating non-clinical dropout risks along the healthcare access corridor.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {simulation.journey_milestones.map((milestone) => {
                    const isMitigated = milestone.simulated_status === 'MITIGATED_PASS';
                    const isBarrier = milestone.simulated_status === 'BARRIER_ENCOUNTERED';

                    return (
                      <div
                        key={milestone.milestone_id}
                        className={`p-4 rounded-xl border transition-all ${
                          isMitigated
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : isBarrier
                            ? 'bg-amber-50/40 border-amber-200'
                            : 'bg-slate-50/60 border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                              {milestone.step_number}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">
                              {milestone.name}
                            </h4>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                milestone.stage_friction_level === 'CRITICAL'
                                  ? 'bg-red-100 text-red-800'
                                  : milestone.stage_friction_level === 'HIGH'
                                  ? 'bg-amber-100 text-amber-800'
                                  : milestone.stage_friction_level === 'MODERATE'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {milestone.stage_friction_level} Friction
                            </span>

                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                isMitigated
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isBarrier
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              {isMitigated ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Mitigated Pass
                                </>
                              ) : isBarrier ? (
                                <>
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  Barrier Encountered
                                </>
                              ) : (
                                <>
                                  <Check className="w-3 h-3 text-slate-600" />
                                  Normal Clearance
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Friction factors list */}
                        <div className="text-xs text-slate-600 space-y-1 mt-2">
                          <span className="font-semibold text-slate-700 block text-[11px]">
                            Operational Factors:
                          </span>
                          <ul className="list-disc list-inside space-y-0.5 pl-1">
                            {milestone.friction_factors.map((factor, idx) => (
                              <li key={idx} className="text-slate-600 text-xs">
                                {factor}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Mitigations applied */}
                        {milestone.active_mitigations && milestone.active_mitigations.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-semibold text-emerald-800">
                              Active Mitigations:
                            </span>
                            {milestone.active_mitigations.map((code) => {
                              const interv = interventionsCatalog.find((c) => c.code === code);
                              return (
                                <span
                                  key={code}
                                  className="text-[10px] bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-md"
                                >
                                  {interv?.name || code}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Scenario Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-indigo-600" />
                Save Digital Twin Scenario
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Persist this simulation run to the database under your authenticated account for auditing, longitudinal comparison, or frontline coordination.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Optional Notes / Context
              </label>
              <textarea
                value={scenarioNotes}
                onChange={(e) => setScenarioNotes(e.target.value)}
                placeholder="e.g., Pre-operative secondary visit assessment with ASHA companion."
                rows={3}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveModal(false)}
                disabled={savingScenario}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveScenario}
                disabled={savingScenario}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
              >
                {savingScenario ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Confirm & Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Simulation History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                Saved Simulation History
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {loadingHistory ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                  Loading simulation history...
                </div>
              ) : savedSimulations.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  No saved simulation records found. Run a simulation and click "Save Scenario" to store records.
                </div>
              ) : (
                savedSimulations.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleLoadSaved(item)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">
                          {item.facility_name}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          {new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                        <span>
                          Friction: <strong className="text-slate-900">{item.baseline_friction_score}</strong> → <strong className="text-indigo-700">{item.simulated_friction_score}</strong> (-{item.friction_reduction_points} pts)
                        </span>
                        <span>•</span>
                        <span>
                          Completion: <strong className="text-emerald-700">{item.simulated_completion_rate}%</strong>
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-xs text-slate-500 mt-1 italic">"{item.notes}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadSaved(item);
                        }}
                        className="text-xs"
                      >
                        Load Parameters
                      </Button>
                      <button
                        onClick={(e) => handleDeleteSaved(item.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete simulation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHistoryModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
