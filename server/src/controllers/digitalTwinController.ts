import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { DigitalTwinEngine, PatientAccessProfileInput, FacilityAccessStatusInput } from '../intelligence/digitalTwinEngine.js';
import { DigitalTwinRepository } from '../database/repositories/DigitalTwinRepository.js';
import { PatientRepository } from '../database/repositories/PatientRepository.js';
import { HospitalRepository } from '../database/repositories/HospitalRepository.js';
import { AuditService } from '../services/auditService.js';
import { getDB } from '../database/db.js';

function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function parseLocationCoordinates(locationStr?: string): { lat?: number; lon?: number } {
  if (!locationStr) return {};
  try {
    const loc = typeof locationStr === 'string' && locationStr.startsWith('{') ? JSON.parse(locationStr) : null;
    if (loc?.latitude && loc?.longitude) {
      return { lat: Number(loc.latitude), lon: Number(loc.longitude) };
    }
    if (loc?.geoJSON?.coordinates && Array.isArray(loc.geoJSON.coordinates)) {
      return { lon: Number(loc.geoJSON.coordinates[0]), lat: Number(loc.geoJSON.coordinates[1]) };
    }
  } catch {
    // Ignore JSON parse error
  }
  return {};
}

export class DigitalTwinController {
  /**
   * GET /api/digital-twin/interventions
   * Returns supported non-clinical access interventions
   */
  public static async getInterventions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const interventions = DigitalTwinEngine.getInterventions();
      res.status(200).json({
        success: true,
        count: interventions.length,
        interventions,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch interventions' });
    }
  }

  /**
   * GET /api/digital-twin/context
   * Returns current authenticated user's access profile and verified facilities
   */
  public static async getContext(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const patientProfile = await PatientRepository.findByUserId(userId);
      const hospitals = await HospitalRepository.findAll();

      // Parse patient coords if available
      const patientCoords = patientProfile ? parseLocationCoordinates(patientProfile.location) : {};

      // Enrich facilities with distance if patient location is available
      const enrichedHospitals = hospitals.map((h) => {
        let dist = h.distanceKm;
        if (dist === undefined && patientCoords.lat && patientCoords.lon && h.latitude && h.longitude) {
          dist = calculateHaversineKm(patientCoords.lat, patientCoords.lon, h.latitude, h.longitude);
        }
        return {
          id: h.id,
          name: h.name,
          type: h.type,
          city: h.city,
          address: h.address,
          distanceKm: dist,
          total_beds: h.total_beds,
          available_beds: h.available_beds,
          emergency_24x7: h.emergency_24x7,
          teleconsult_available: h.teleconsult_available,
          accessibility_facilities: h.accessibility_facilities,
        };
      });

      res.status(200).json({
        success: true,
        hasProfile: !!patientProfile,
        profile: patientProfile || null,
        facilities: enrichedHospitals,
        modelVersion: DigitalTwinEngine.MODEL_VERSION,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to load simulator context' });
    }
  }

  /**
   * POST /api/digital-twin/simulate
   * Runs the mathematical non-clinical access simulation
   */
  public static async runSimulation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const {
        facilityId,
        selectedInterventions = [],
        profileOverrides = {},
      } = req.body;

      if (!facilityId) {
        res.status(400).json({ success: false, message: 'facilityId is required for digital twin simulation' });
        return;
      }

      // Fetch facility from repository
      const hospital = await HospitalRepository.findById(facilityId);
      if (!hospital) {
        res.status(404).json({ success: false, message: 'Selected facility not found in registry' });
        return;
      }

      // Fetch patient profile if exists
      const dbProfile = await PatientRepository.findByUserId(userId);

      // Compute distance
      const patientCoords = parseLocationCoordinates(profileOverrides.location || dbProfile?.location);
      let calculatedDistance = profileOverrides.distance_to_hospital_km;
      if (!calculatedDistance && patientCoords.lat && patientCoords.lon && hospital.latitude && hospital.longitude) {
        calculatedDistance = calculateHaversineKm(patientCoords.lat, patientCoords.lon, hospital.latitude, hospital.longitude);
      }
      if (!calculatedDistance) {
        calculatedDistance = dbProfile?.distance_to_hospital_km || 18.5;
      }

      // Compute facility diagnostic and medicine availability ratios from live relational database
      const db = getDB();
      let diagnosticRatio = 0.75;
      let medicineStockRatio = 0.80;

      try {
        const diagRes = await db.query<any>('SELECT status FROM diagnostics WHERE hospital_id = $1', [hospital.id]);
        if (diagRes.rows.length > 0) {
          const availableCount = diagRes.rows.filter((r) => r.status === 'AVAILABLE' || r.status === 'ACTIVE').length;
          diagnosticRatio = availableCount / diagRes.rows.length;
        }

        const medRes = await db.query<any>('SELECT stock_status FROM essential_medicines WHERE hospital_id = $1', [hospital.id]);
        if (medRes.rows.length > 0) {
          const inStockCount = medRes.rows.filter((r) => r.stock_status === 'IN_STOCK' || r.stock_status === 'ADEQUATE').length;
          medicineStockRatio = inStockCount / medRes.rows.length;
        }
      } catch {
        // Fall back to default ratios if tables are empty
      }

      // Calculate queue wait minutes estimation
      let queueMinutes = 60;
      if (hospital.total_beds && hospital.available_beds !== undefined) {
        const occupancyRate = (hospital.total_beds - hospital.available_beds) / hospital.total_beds;
        queueMinutes = Math.round(30 + occupancyRate * 120);
      }

      const facilitySnapshot: FacilityAccessStatusInput = {
        id: hospital.id,
        name: hospital.name,
        type: hospital.type,
        city: hospital.city,
        distanceKm: calculatedDistance,
        available_beds: hospital.available_beds,
        total_beds: hospital.total_beds,
        emergency_24x7: hospital.emergency_24x7,
        teleconsult_available: hospital.teleconsult_available,
        accessibility_facilities: hospital.accessibility_facilities,
        current_queue_wait_minutes: queueMinutes,
        diagnostic_availability_ratio: diagnosticRatio,
        medicine_stock_ratio: medicineStockRatio,
      };

      // Assemble unified patient profile
      const profileSnapshot: PatientAccessProfileInput = {
        distance_to_hospital_km: calculatedDistance,
        transport_mode: profileOverrides.transport_mode || dbProfile?.transport_mode || 'bus',
        digital_literacy: profileOverrides.digital_literacy || dbProfile?.digital_literacy || 'basic',
        family_support: profileOverrides.family_support || dbProfile?.family_support || 'moderate',
        wage_loss_risk: profileOverrides.wage_loss_risk || dbProfile?.wage_loss_risk || 'moderate',
        smartphone_access: profileOverrides.smartphone_access !== undefined ? profileOverrides.smartphone_access : (dbProfile?.smartphone_access ?? true),
        internet_type: profileOverrides.internet_type || dbProfile?.internet_type || '4g_5g',
        disability_needs: profileOverrides.disability_needs || dbProfile?.disability_needs || 'none',
        is_rural: profileOverrides.is_rural !== undefined ? profileOverrides.is_rural : (dbProfile?.is_rural ?? true),
        appointment_flexibility: profileOverrides.appointment_flexibility || dbProfile?.appointment_flexibility || 'flexible',
        document_readiness: profileOverrides.document_readiness || dbProfile?.document_readiness || 'complete',
      };

      const simulation = DigitalTwinEngine.simulate(
        profileSnapshot,
        facilitySnapshot,
        selectedInterventions
      );

      res.status(200).json({
        success: true,
        simulation,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Digital twin simulation failed' });
    }
  }

  /**
   * POST /api/digital-twin/save
   * Persists a simulation run into the database
   */
  public static async saveSimulation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const { simulation, notes } = req.body;
      if (!simulation || !simulation.facility_snapshot?.id) {
        res.status(400).json({ success: false, message: 'Valid simulation result is required' });
        return;
      }

      const saved = await DigitalTwinRepository.create({
        user_id: userId,
        facility_id: simulation.facility_snapshot.id,
        facility_name: simulation.facility_snapshot.name || 'Healthcare Facility',
        baseline_friction_score: simulation.baseline_friction_score,
        simulated_friction_score: simulation.simulated_friction_score,
        friction_reduction_points: simulation.friction_reduction_points,
        baseline_completion_rate: simulation.baseline_completion_rate,
        simulated_completion_rate: simulation.simulated_completion_rate,
        travel_burden_score: simulation.sub_scores.travel_burden_score,
        transport_burden_score: simulation.sub_scores.transport_burden_score,
        waiting_burden_score: simulation.sub_scores.waiting_burden_score,
        digital_access_burden_score: simulation.sub_scores.digital_access_burden_score,
        administrative_burden_score: simulation.sub_scores.administrative_burden_score,
        diagnostic_burden_score: simulation.sub_scores.diagnostic_burden_score,
        medicine_burden_score: simulation.sub_scores.medicine_burden_score,
        selected_interventions: JSON.stringify(simulation.selected_interventions || []),
        journey_milestones_json: JSON.stringify(simulation.journey_milestones || []),
        profile_snapshot_json: JSON.stringify(simulation.profile_snapshot || {}),
        facility_snapshot_json: JSON.stringify(simulation.facility_snapshot || {}),
        notes: notes || null,
        model_version: simulation.model_version || DigitalTwinEngine.MODEL_VERSION,
      });

      await AuditService.log('DIGITAL_TWIN_SIMULATION_SAVED', 'DigitalTwinSimulation', req, {
        userId,
        resourceId: saved.id,
        details: {
          facilityName: saved.facility_name,
          baselineFriction: saved.baseline_friction_score,
          simulatedFriction: saved.simulated_friction_score,
          reduction: saved.friction_reduction_points,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Digital Twin simulation saved successfully',
        savedSimulation: saved,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to save simulation' });
    }
  }

  /**
   * GET /api/digital-twin/history
   * Retrieves simulation history for authenticated user (or all if admin)
   */
  public static async getHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const role = (req.user?.role || '').toLowerCase();
      const isAdmin = role === 'admin' || role === 'government';
      const fetchAll = isAdmin && req.query.all === 'true';

      const history = fetchAll
        ? await DigitalTwinRepository.findAll(100)
        : await DigitalTwinRepository.findByUserId(userId, 50);

      // Parse JSON fields for client convenience
      const parsedHistory = history.map((item) => ({
        ...item,
        selected_interventions: JSON.parse(item.selected_interventions || '[]'),
        journey_milestones: JSON.parse(item.journey_milestones_json || '[]'),
        profile_snapshot: JSON.parse(item.profile_snapshot_json || '{}'),
        facility_snapshot: JSON.parse(item.facility_snapshot_json || '{}'),
      }));

      res.status(200).json({
        success: true,
        count: parsedHistory.length,
        history: parsedHistory,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch simulation history' });
    }
  }

  /**
   * GET /api/digital-twin/:id
   * Retrieves a single simulation with RBAC/ownership validation
   */
  public static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const simulation = await DigitalTwinRepository.findById(id);

      if (!simulation) {
        res.status(404).json({ success: false, message: 'Simulation record not found' });
        return;
      }

      const role = (req.user?.role || '').toLowerCase();
      const isAdmin = role === 'admin' || role === 'government';

      if (!isAdmin && simulation.user_id !== userId) {
        res.status(403).json({ success: false, message: 'Access denied: You cannot view another patient\'s simulation' });
        return;
      }

      res.status(200).json({
        success: true,
        simulation: {
          ...simulation,
          selected_interventions: JSON.parse(simulation.selected_interventions || '[]'),
          journey_milestones: JSON.parse(simulation.journey_milestones_json || '[]'),
          profile_snapshot: JSON.parse(simulation.profile_snapshot_json || '{}'),
          facility_snapshot: JSON.parse(simulation.facility_snapshot_json || '{}'),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch simulation' });
    }
  }

  /**
   * DELETE /api/digital-twin/:id
   * Deletes a simulation with ownership check
   */
  public static async deleteById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?._id?.toString();
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const role = (req.user?.role || '').toLowerCase();
      const isAdmin = role === 'admin' || role === 'government';

      await DigitalTwinRepository.deleteById(id, userId, isAdmin);

      res.status(200).json({
        success: true,
        message: 'Simulation record deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'UNAUTHORIZED_DELETION') {
        res.status(403).json({ success: false, message: 'Access denied: You cannot delete another user\'s simulation' });
        return;
      }
      res.status(500).json({ success: false, message: error.message || 'Failed to delete simulation' });
    }
  }
}
