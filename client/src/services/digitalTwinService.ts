import { api } from './api';

export interface NonClinicalIntervention {
  code: string;
  name: string;
  category: 'TRANSPORT' | 'CARE' | 'FINANCIAL' | 'DIGITAL' | 'LOGISTICS';
  description: string;
  friction_reduction_description: string;
  affects: string[];
}

export interface FacilityContextItem {
  id: string;
  name: string;
  type?: string;
  city?: string;
  address?: string;
  distanceKm?: number;
  total_beds?: number;
  available_beds?: number;
  emergency_24x7?: boolean;
  teleconsult_available?: boolean;
  accessibility_facilities?: string;
}

export interface JourneyMilestone {
  milestone_id: string;
  name: string;
  step_number: number;
  stage_friction_level: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  simulated_status: 'PASSED' | 'BARRIER_ENCOUNTERED' | 'MITIGATED_PASS';
  dropout_risk_score: number;
  friction_factors: string[];
  active_mitigations: string[];
}

export interface SimulationResult {
  baseline_friction_score: number;
  simulated_friction_score: number;
  friction_reduction_points: number;
  baseline_completion_rate: number;
  simulated_completion_rate: number;
  sub_scores: {
    travel_burden_score: number;
    transport_burden_score: number;
    waiting_burden_score: number;
    digital_access_burden_score: number;
    administrative_burden_score: number;
    diagnostic_burden_score: number;
    medicine_burden_score: number;
    caregiver_burden_score: number;
    accessibility_burden_score: number;
  };
  mitigated_sub_scores: {
    travel_burden_score: number;
    transport_burden_score: number;
    waiting_burden_score: number;
    digital_access_burden_score: number;
    administrative_burden_score: number;
    diagnostic_burden_score: number;
    medicine_burden_score: number;
    caregiver_burden_score: number;
    accessibility_burden_score: number;
  };
  selected_interventions: string[];
  journey_milestones: JourneyMilestone[];
  profile_snapshot: any;
  facility_snapshot: FacilityContextItem;
  model_version: string;
  timestamp: string;
}

export interface SavedSimulationEntity {
  id: string;
  user_id: string;
  facility_id?: string;
  facility_name: string;
  baseline_friction_score: number;
  simulated_friction_score: number;
  friction_reduction_points: number;
  baseline_completion_rate: number;
  simulated_completion_rate: number;
  travel_burden_score: number;
  transport_burden_score: number;
  waiting_burden_score: number;
  digital_access_burden_score: number;
  administrative_burden_score: number;
  diagnostic_burden_score: number;
  medicine_burden_score: number;
  selected_interventions: string[];
  journey_milestones: JourneyMilestone[];
  profile_snapshot: any;
  facility_snapshot: any;
  notes?: string;
  model_version?: string;
  created_at: string;
}

export interface SimulatorContextResponse {
  hasProfile: boolean;
  profile: any | null;
  facilities: FacilityContextItem[];
  modelVersion: string;
}

export const digitalTwinService = {
  getInterventions: async (): Promise<NonClinicalIntervention[]> => {
    const res = await api.get('/digital-twin/interventions');
    return res.data.interventions || [];
  },

  getContext: async (): Promise<SimulatorContextResponse> => {
    const res = await api.get('/digital-twin/context');
    return res.data;
  },

  runSimulation: async (payload: {
    facilityId: string;
    selectedInterventions: string[];
    profileOverrides?: Record<string, any>;
  }): Promise<SimulationResult> => {
    const res = await api.post('/digital-twin/simulate', payload);
    return res.data.simulation;
  },

  saveSimulation: async (
    simulation: SimulationResult,
    notes?: string
  ): Promise<SavedSimulationEntity> => {
    const res = await api.post('/digital-twin/save', { simulation, notes });
    return res.data.savedSimulation;
  },

  getHistory: async (all = false): Promise<SavedSimulationEntity[]> => {
    const res = await api.get(`/digital-twin/history${all ? '?all=true' : ''}`);
    return res.data.history || [];
  },

  getById: async (id: string): Promise<SavedSimulationEntity> => {
    const res = await api.get(`/digital-twin/${id}`);
    return res.data.simulation;
  },

  deleteById: async (id: string): Promise<void> => {
    await api.delete(`/digital-twin/${id}`);
  },
};
