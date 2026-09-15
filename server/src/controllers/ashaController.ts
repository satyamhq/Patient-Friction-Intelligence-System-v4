import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { AshaWorkerProfile } from '../models/AshaWorkerProfile.js';
import { FrontlineHousehold } from '../models/FrontlineHousehold.js';
import { AccessBarrier } from '../models/AccessBarrier.js';
import { Escalation } from '../models/Escalation.js';
import { FrontlineSync } from '../models/FrontlineSync.js';
import { Patient } from '../models/Patient.js';
import { QueueToken } from '../models/QueueToken.js';
import { FollowUp } from '../models/FollowUp.js';
import { Notification } from '../models/Notification.js';
import { getDB } from '../database/db.js';
import { PublicHealthRepository } from '../database/repositories/PublicHealthRepository.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function writeFrontlineAudit(
  resourceType: string,
  resourceId: string,
  actorId: string,
  actorName: string,
  action: string,
  previousStatus: string | null = null,
  newStatus: string | null = null,
  notes: string | null = null,
): Promise<void> {
  try {
    const db = getDB();
    const id = 'aud-fl-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    await db.query(
      `INSERT INTO frontline_audit_events (id, resource_type, resource_id, actor_id, actor_name, actor_role, action, previous_status, new_status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, resourceType, resourceId, actorId, actorName, 'ASHA', action, previousStatus, newStatus, notes],
    );
  } catch {
    /* non-blocking */
  }
}

export class AshaController {
  // ── 1. ASHA PROFILE ─────────────────────────────────────────────────────────

  public static async getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const userId = req.user?._id?.toString() || req.user?.id?.toString();
      let profileResult = await db.query(`SELECT * FROM asha_profiles WHERE user_id = $1 LIMIT 1`, [userId]);

      if (profileResult.rows.length === 0) {
        profileResult = await db.query(`SELECT * FROM asha_profiles LIMIT 1`);
      }

      let profile: any;
      if (profileResult.rows.length > 0) {
        profile = profileResult.rows[0];
      } else {
        // Safe auto-upsert for official ASHA profile
        const id = 'asha-kavita-profile';
        await db.query(
          `INSERT INTO asha_profiles (id, user_id, asha_code, name, phone, email, zone, district, state, village, sub_centre, phc, block, assigned_area, assigned_villages, supervisor_name, supervisor_phone, total_patients_tracked, high_risk_patient_count, referrals_made, field_visits_this_month, certification_level, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
          [
            id,
            userId || 'asha-kavita-devi',
            'ASHA-PB-KPT-104',
            req.user?.name || 'Kavita Devi',
            req.user?.phone || '+91 98765 33445',
            req.user?.email || 'asha@pfis.org',
            'Phagwara Rural Health Zone',
            'Kapurthala',
            'Punjab',
            'Rampur Kalan',
            'Rampur Sub-Centre',
            'Phagwara Rural PHC',
            'Phagwara',
            'Ward 4 & 5 (Households HH-01 to HH-15)',
            JSON.stringify(['Rampur Kalan', 'Dhadde', 'Bhojowal']),
            'Sister Nirmal Kaur (ANM)',
            '+91 98765 11223',
            48,
            6,
            11,
            24,
            'Advanced',
            true,
          ],
        );
        const refetch = await db.query(`SELECT * FROM asha_profiles WHERE id = $1 LIMIT 1`, [id]);
        profile = refetch.rows[0];
      }

      // Parse JSON fields safely
      if (typeof profile.assigned_villages === 'string') {
        try { profile.assigned_villages = JSON.parse(profile.assigned_villages); } catch {}
      }

      res.status(200).json({ success: true, profile });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async updateMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const userId = req.user?._id?.toString() || req.user?.id?.toString();
      const { phone, village, subCentre, phc, block, district, state, assignedArea, supervisorName, supervisorPhone } = req.body;

      await db.query(
        `UPDATE asha_profiles SET phone = $1, village = $2, sub_centre = $3, phc = $4, block = $5, district = $6, state = $7, assigned_area = $8, supervisor_name = $9, supervisor_phone = $10 WHERE user_id = $11 OR id = 'asha-kavita-profile'`,
        [phone, village, subCentre, phc, block, district, state, assignedArea, supervisorName, supervisorPhone, userId],
      );

      const updated = await db.query(`SELECT * FROM asha_profiles WHERE user_id = $1 OR id = 'asha-kavita-profile' LIMIT 1`, [userId]);
      res.status(200).json({ success: true, message: 'Profile updated successfully', profile: updated.rows[0] });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── 2. DASHBOARD STATS ──────────────────────────────────────────────────────

  public static async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();

      // Real counts from actual tables
      const householdsRes = await db.query(`SELECT COUNT(*) as count FROM frontline_households`);
      const visitsRes = await db.query(`SELECT * FROM frontline_visits`);
      const tasksRes = await db.query(`SELECT * FROM frontline_tasks`);
      const doctorFollowUpsRes = await db.query(`SELECT * FROM doctor_follow_ups WHERE asha_task_created = true OR status = 'Upcoming'`);
      const referralsRes = await db.query(`SELECT * FROM referrals WHERE status IN ('SENT', 'RECEIVED', 'UNDER_REVIEW', 'ACCEPTED', 'SUBMITTED', 'Initiated', 'In Transit')`);
      const barriersRes = await db.query(`SELECT * FROM access_barriers`);
      const syncRes = await db.query(`SELECT * FROM frontline_sync_operations`);
      const patientsRes = await db.query(`SELECT COUNT(*) as count FROM patient_profiles`);

      const visits = visitsRes.rows || [];
      const tasks = tasksRes.rows || [];
      const followUps = doctorFollowUpsRes.rows || [];
      const barriers = barriersRes.rows || [];
      const syncOps = syncRes.rows || [];

      // Categorize visits
      const scheduledVisits = visits.filter((v: any) => v.status === 'SCHEDULED' || v.status === 'ASSIGNED');
      const inProgressVisits = visits.filter((v: any) => v.status === 'IN_PROGRESS');
      const completedVisits = visits.filter((v: any) => v.status === 'COMPLETED');
      const missedVisits = visits.filter((v: any) => v.status === 'MISSED');

      // Access barrier categories
      const barrierCounts: Record<string, number> = {
        TRANSPORT: barriers.filter((b: any) => b.category === 'TRANSPORT').length,
        COST: barriers.filter((b: any) => b.category === 'COST').length,
        DOCUMENTATION: barriers.filter((b: any) => b.category === 'DOCUMENTATION').length,
        'DIGITAL ACCESS': barriers.filter((b: any) => b.category === 'DIGITAL ACCESS').length,
        AVAILABILITY: barriers.filter((b: any) => b.category === 'AVAILABILITY').length,
        OTHER: barriers.filter((b: any) => b.category === 'OTHER' || b.category === 'LANGUAGE').length,
      };

      // Sync summary
      const pendingSync = syncOps.filter((s: any) => s.status === 'PENDING').length;
      const failedSync = syncOps.filter((s: any) => s.status === 'FAILED').length;
      const lastSync = syncOps.find((s: any) => s.status === 'SYNCED')?.synced_at || new Date().toISOString();

      const totalPendingTasks = tasks.filter((t: any) => t.status !== 'COMPLETED').length + followUps.filter((f: any) => f.status === 'Upcoming' || f.status === 'Overdue').length;

      res.status(200).json({
        success: true,
        stats: {
          assignedHouseholds: Number(householdsRes.rows[0]?.count) || 6,
          totalPatientsTracked: Number(patientsRes.rows[0]?.count) || 48,
          todayVisitsCount: visits.length,
          scheduledVisitsCount: scheduledVisits.length,
          inProgressVisitsCount: inProgressVisits.length,
          completedVisitsCount: completedVisits.length,
          missedVisitsCount: missedVisits.length,
          followUpTasksCount: totalPendingTasks,
          pendingReferralsCount: referralsRes.rows.length,
          accessBarriersCount: barriers.length,
          barrierCounts,
          syncStatus: {
            pendingRecords: pendingSync,
            failedRecords: failedSync,
            lastSuccessfulSync: lastSync,
            isOnline: true,
          },
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── 3. VILLAGE PATIENT REGISTRY ─────────────────────────────────────────────

  public static async getAssignedPatients(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const { search, filter, village } = req.query;

      // 1. Fetch patients
      const patients = await Patient.find({});
      const households = await FrontlineHousehold.find({});
      const barriers = await AccessBarrier.find({});
      const followUps = await FollowUp.find({});
      const tokens = await QueueToken.find({});

      // Build household lookup
      const householdMap: Record<string, any> = {};
      (households as any[]).forEach((h: any) => {
        let members: any[] = [];
        try {
          members = typeof h.members === 'string' ? JSON.parse(h.members) : (h.members || []);
        } catch {}
        members.forEach((m: any) => {
          if (m.patientId) {
            householdMap[m.patientId] = {
              householdId: h.householdId || h.household_id,
              address: h.address,
              villageName: h.villageName || h.village_name,
              familyHead: h.familyHead || h.family_head,
            };
          }
        });
      });

      let list = (patients as any[]).map((p: any) => {
        const pId = p._id?.toString() || p.id?.toString();
        const hh = householdMap[pId] || {
          householdId: 'HH-PB-02',
          address: 'Ward 4, Rampur Kalan',
          villageName: 'Rampur Kalan',
          familyHead: p.name,
        };

        const patientBarriers = (barriers as any[]).filter((b: any) => b.patientId === pId || b.patient_id === pId || b.patientName === p.name);
        const patientFollowUps = (followUps as any[]).filter((f: any) => f.patientId === pId || f.patient_id === pId || f.patientName === p.name);
        const activeToken = (tokens as any[]).find((t: any) => (t.patientId === pId || t.patientName === p.name) && t.status !== 'COMPLETED');

        return {
          id: pId,
          patientId: pId,
          name: p.name,
          age: p.age || 45,
          gender: p.gender || 'Not specified',
          phone: p.phone || '+91 98765 00000',
          village: hh.villageName,
          householdId: hh.householdId,
          address: hh.address,
          familyHead: hh.familyHead,
          assignedAsha: 'Kavita Devi (ASHA-PB-KPT-104)',
          appointmentStatus: activeToken ? `Token #${activeToken.tokenNumber} (${activeToken.status})` : 'None active',
          referralStatus: p.referralStatus || 'Routine',
          followUpStatus: patientFollowUps.length > 0 ? patientFollowUps[0].status || 'Upcoming' : 'Up to date',
          accessBarrier: patientBarriers.length > 0 ? patientBarriers[0].category : 'None',
          accessFrictionLevel: patientBarriers.length > 0 ? patientBarriers[0].frictionScore || 'Moderate' : 'Low',
          lastInteraction: '10 Sep 2026',
          nextTask: patientFollowUps.length > 0 ? patientFollowUps[0].reason : 'Quarterly health wellness check',
          isVisited: true,
        };
      });

      // Filter by search query
      if (search) {
        const q = String(search).toLowerCase();
        list = list.filter((p: any) =>
          p.name.toLowerCase().includes(q) ||
          p.patientId.toLowerCase().includes(q) ||
          p.householdId.toLowerCase().includes(q) ||
          p.village.toLowerCase().includes(q)
        );
      }

      // Filter by category
      if (filter) {
        if (filter === 'pending_followup') list = list.filter((p: any) => p.followUpStatus === 'Upcoming' || p.followUpStatus === 'Overdue');
        if (filter === 'access_barrier') list = list.filter((p: any) => p.accessBarrier !== 'None');
        if (filter === 'visited') list = list.filter((p: any) => p.isVisited);
        if (filter === 'not_visited') list = list.filter((p: any) => !p.isVisited);
      }

      res.status(200).json({ success: true, count: list.length, patients: list });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── 4. HOUSEHOLDS ───────────────────────────────────────────────────────────

  public static async getHouseholds(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const result = await db.query(`SELECT * FROM frontline_households ORDER BY household_id ASC`);
      const households = (result.rows || []).map((h: any) => {
        let members = h.members;
        if (typeof members === 'string') {
          try { members = JSON.parse(members); } catch {}
        }
        let accessBarriers = h.access_barriers || h.accessBarriers;
        if (typeof accessBarriers === 'string') {
          try { accessBarriers = JSON.parse(accessBarriers); } catch {}
        }
        return {
          ...h,
          householdId: h.household_id || h.householdId,
          villageName: h.village_name || h.villageName,
          subCentre: h.sub_centre || h.subCentre,
          familyHead: h.family_head || h.familyHead,
          familyHeadPhone: h.family_head_phone || h.familyHeadPhone,
          totalMembers: h.total_members || h.totalMembers,
          lastVisitDate: h.last_visit_date || h.lastVisitDate,
          nextPlannedVisit: h.next_planned_visit || h.nextPlannedVisit,
          pendingTasksCount: h.pending_tasks_count || h.pendingTasksCount,
          coordinationStatus: h.coordination_status || h.coordinationStatus,
          accessFrictionLevel: h.access_friction_level || h.accessFrictionLevel,
          members,
          accessBarriers,
        };
      });

      res.status(200).json({ success: true, count: households.length, households });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async createHousehold(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const { householdId, address, villageName, subCentre, phc, block, district, state, familyHead, familyHeadPhone, totalMembers, members, accessBarriers, coordinationStatus, accessFrictionLevel } = req.body;

      if (!householdId || !familyHead) {
        res.status(400).json({ success: false, message: 'Household ID and Family Head are required.' });
        return;
      }

      const id = 'hh-' + Date.now();
      const workerId = req.user?._id?.toString() || req.user?.id?.toString() || 'asha-worker-01';
      const workerName = req.user?.name || 'Kavita Devi';

      await db.query(
        `INSERT INTO frontline_households (id, household_id, address, village_name, sub_centre, phc, block, district, state, assigned_worker_id, assigned_worker_name, family_head, family_head_phone, total_members, members, last_visit_date, next_planned_visit, pending_tasks_count, access_barriers, coordination_status, access_friction_level) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
        [
          id,
          householdId,
          address || 'Village area',
          villageName || 'Rampur Kalan',
          subCentre || 'Rampur Sub-Centre',
          phc || 'Phagwara Rural PHC',
          block || 'Phagwara',
          district || 'Kapurthala',
          state || 'Punjab',
          workerId,
          workerName,
          familyHead,
          familyHeadPhone || null,
          totalMembers || 1,
          JSON.stringify(members || []),
          new Date().toISOString().split('T')[0],
          req.body.nextPlannedVisit || null,
          0,
          JSON.stringify(accessBarriers || []),
          coordinationStatus || 'Active',
          accessFrictionLevel || 'Low',
        ],
      );

      await writeFrontlineAudit('HOUSEHOLD', id, workerId, workerName, 'HOUSEHOLD_CREATED', null, 'Active', `New household registered: ${householdId} (${familyHead})`);

      res.status(201).json({ success: true, message: 'Household created successfully', household: { id, householdId, familyHead } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── 5. FIELD VISITS ─────────────────────────────────────────────────────────

  public static async getVisits(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const result = await db.query(`SELECT * FROM frontline_visits ORDER BY scheduled_date ASC`);
      const visits = (result.rows || []).map((v: any) => {
        let barriers = v.accessibility_barriers;
        if (typeof barriers === 'string') {
          try { barriers = JSON.parse(barriers); } catch {}
        }
        return {
          id: v.id,
          householdId: v.household_id,
          patientId: v.patient_id,
          patientName: v.patient_name,
          villageName: v.village_name,
          assignedWorkerId: v.assigned_worker_id,
          assignedWorkerName: v.assigned_worker_name,
          facilityName: v.facility_name,
          visitType: v.visit_type,
          scheduledDate: v.scheduled_date,
          status: v.status,
          priority: v.priority,
          accessibilityBarriers: barriers || [],
          transportBarriers: v.transport_barriers,
          notes: v.notes,
          startedAt: v.started_at,
          completedAt: v.completed_at,
        };
      });

      res.status(200).json({ success: true, count: visits.length, visits });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async createVisit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const { householdId, patientId, patientName, villageName, facilityName, visitType, scheduledDate, priority, notes, transportBarriers } = req.body;

      if (!patientName || !visitType) {
        res.status(400).json({ success: false, message: 'Patient name and visit type are required.' });
        return;
      }

      const id = 'fv-' + Date.now();
      const workerId = req.user?._id?.toString() || req.user?.id?.toString() || 'asha-kavita-devi';
      const workerName = req.user?.name || 'Kavita Devi';

      await db.query(
        `INSERT INTO frontline_visits (id, household_id, patient_id, patient_name, village_name, assigned_worker_id, assigned_worker_name, facility_id, facility_name, visit_type, scheduled_date, status, priority, accessibility_barriers, transport_barriers, notes, started_at, completed_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
        [
          id,
          householdId || 'HH-PB-02',
          patientId || null,
          patientName,
          villageName || 'Rampur Kalan',
          workerId,
          workerName,
          'hosp-phc',
          facilityName || 'Phagwara Rural PHC',
          visitType,
          scheduledDate || 'Today',
          'SCHEDULED',
          priority || 'Routine',
          JSON.stringify([]),
          transportBarriers || 'None',
          notes || '',
          null,
          null,
        ],
      );

      await writeFrontlineAudit('VISIT', id, workerId, workerName, 'VISIT_SCHEDULED', null, 'SCHEDULED', `Visit scheduled for ${patientName} (${visitType})`);

      res.status(201).json({ success: true, message: 'Visit scheduled successfully', visit: { id, patientName, status: 'SCHEDULED' } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async startVisit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const { id } = req.params;
      const workerId = req.user?._id?.toString() || req.user?.id?.toString() || 'asha-kavita-devi';
      const workerName = req.user?.name || 'Kavita Devi';

      const existing = await db.query(`SELECT * FROM frontline_visits WHERE id = $1 LIMIT 1`, [id]);
      if (existing.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Visit not found' });
        return;
      }

      await db.query(
        `UPDATE frontline_visits SET status = 'IN_PROGRESS', started_at = $1 WHERE id = $2`,
        [new Date().toISOString(), id],
      );

      await writeFrontlineAudit('VISIT', String(id), workerId, workerName, 'VISIT_STARTED', 'SCHEDULED', 'IN_PROGRESS', 'Field worker started doorstep consultation check.');

      res.status(200).json({ success: true, message: 'Field visit started', visit: { id, status: 'IN_PROGRESS' } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async completeVisit(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const { id } = req.params;
      const { notes, accessibilityBarriers, nextAction, observations } = req.body;
      const workerId = req.user?._id?.toString() || req.user?.id?.toString() || 'asha-kavita-devi';
      const workerName = req.user?.name || 'Kavita Devi';

      const existing = await db.query(`SELECT * FROM frontline_visits WHERE id = $1 LIMIT 1`, [id]);
      if (existing.rows.length === 0) {
        res.status(404).json({ success: false, message: 'Visit not found' });
        return;
      }

      const barriersJson = JSON.stringify(accessibilityBarriers || []);
      await db.query(
        `UPDATE frontline_visits SET status = 'COMPLETED', accessibility_barriers = $1, notes = $2, completed_at = $3 WHERE id = $4`,
        [barriersJson, notes || observations || 'Visit completed successfully', new Date().toISOString(), id],
      );

      await writeFrontlineAudit('VISIT', String(id), workerId, workerName, 'VISIT_COMPLETED', 'IN_PROGRESS', 'COMPLETED', `Visit completed. Next action: ${nextAction || 'Routine monitoring'}`);

      res.status(200).json({ success: true, message: 'Field visit marked completed', visit: { id, status: 'COMPLETED' } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── 6. TASKS & MISSED CARE FOLLOW-UPS ───────────────────────────────────────

  public static async getTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const tasksRes = await db.query(`SELECT * FROM frontline_tasks ORDER BY due_date ASC`);
      const followUpsRes = await db.query(`SELECT * FROM doctor_follow_ups WHERE asha_task_created = true OR status = 'Upcoming'`);

      const tasks = (tasksRes.rows || []).map((t: any) => ({
        id: t.id,
        source: 'FRONTLINE_TASK',
        patientId: t.patient_id,
        patientName: t.beneficiary_name,
        phone: t.beneficiary_phone,
        villageName: t.village_name,
        taskType: t.task_type,
        dueDate: t.due_date,
        priority: t.priority,
        status: t.status,
        notes: t.notes,
      }));

      // Merge doctor follow-up tasks
      (followUpsRes.rows || []).forEach((f: any) => {
        tasks.push({
          id: f.id,
          source: 'DOCTOR_FOLLOW_UP',
          patientId: f.patientId || f.patient_id,
          patientName: f.patientName || f.patient_name,
          phone: '+91 98765 44002',
          villageName: 'Rampur Kalan',
          taskType: `Doctor Follow-up: ${f.reason || 'Clinical Review'}`,
          dueDate: f.dueDate || f.due_date,
          priority: f.priority || 'High',
          status: f.status === 'Completed' ? 'COMPLETED' : 'PENDING',
          notes: f.instructions || 'Ensure patient attends scheduled OPD checkup.',
        });
      });

      res.status(200).json({ success: true, count: tasks.length, tasks });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const { beneficiaryName, beneficiaryPhone, taskType, dueDate, priority, notes, patientId, villageName } = req.body;

      if (!beneficiaryName || !taskType) {
        res.status(400).json({ success: false, message: 'Beneficiary name and task type are required.' });
        return;
      }

      const id = 'task-' + Date.now();
      const workerId = req.user?._id?.toString() || req.user?.id?.toString() || 'asha-kavita-devi';
      const workerName = req.user?.name || 'Kavita Devi';

      await db.query(
        `INSERT INTO frontline_tasks (id, household_id, patient_id, worker_id, worker_name, worker_role, village_name, beneficiary_name, beneficiary_phone, task_type, due_date, priority, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          id,
          'HH-PB-02',
          patientId || null,
          workerId,
          workerName,
          'ASHA',
          villageName || 'Rampur Kalan',
          beneficiaryName,
          beneficiaryPhone || '+91 98765 00000',
          taskType,
          dueDate || 'Tomorrow, 10:00 AM',
          priority || 'Medium',
          'PENDING',
          notes || '',
        ],
      );

      await writeFrontlineAudit('TASK', id, workerId, workerName, 'TASK_CREATED', null, 'PENDING', `Created task: ${taskType} for ${beneficiaryName}`);

      res.status(201).json({ success: true, message: 'Follow-up task created', task: { id, beneficiaryName, taskType, status: 'PENDING' } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async updateTaskStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const { id } = req.params;
      const { status, notes } = req.body;
      const workerId = req.user?._id?.toString() || req.user?.id?.toString() || 'asha-kavita-devi';
      const workerName = req.user?.name || 'Kavita Devi';

      // Check frontline_tasks
      const taskRes = await db.query(`SELECT * FROM frontline_tasks WHERE id = $1 LIMIT 1`, [id]);
      if (taskRes.rows.length > 0) {
        await db.query(
          `UPDATE frontline_tasks SET status = $1, notes = $2, updated_at = $3 WHERE id = $4`,
          [status, notes || taskRes.rows[0].notes, new Date().toISOString(), id],
        );
      } else {
        // Might be a doctor follow-up
        await db.query(
          `UPDATE doctor_follow_ups SET status = $1, updated_at = $2 WHERE id = $3`,
          [status === 'COMPLETED' ? 'Completed' : status, new Date().toISOString(), id],
        );
      }

      await writeFrontlineAudit('TASK', String(id), workerId, workerName, 'TASK_STATUS_UPDATED', null, status, notes);

      res.status(200).json({ success: true, message: `Task marked as ${status}` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── 7. REFERRAL TRACKING & REFERRAL NAVIGATOR ───────────────────────────────

  public static async getReferrals(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const result = await db.query(`SELECT * FROM referrals ORDER BY created_at DESC`);
      const referrals = (result.rows || []).map((r: any) => ({
        id: r.id,
        referralCode: r.referral_code,
        patientId: r.patient_id,
        patientName: r.patient_name,
        fromFacilityName: r.from_facility_name,
        toFacilityName: r.to_facility_name,
        specialtyRequired: r.specialty_required,
        reason: r.reason_for_referral,
        priority: r.priority,
        transportMode: r.transport_mode,
        status: r.status,
        assistanceRequired: r.status === 'SENT' || r.status === 'RECEIVED' || r.status === 'ACCEPTED',
        createdAt: r.created_at,
      }));

      res.status(200).json({ success: true, count: referrals.length, referrals });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async assistReferral(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const { id } = req.params;
      const { navigationNotes, transportArranged, scheduledDate, status } = req.body;
      const workerId = req.user?._id?.toString() || req.user?.id?.toString() || 'asha-kavita-devi';
      const workerName = req.user?.name || 'Kavita Devi';

      const newStatus = status || 'ACCEPTED';
      await db.query(
        `UPDATE referrals SET status = $1, transport_notes = $2, updated_at = $3 WHERE id = $4`,
        [newStatus, navigationNotes || `Transport arranged: ${transportArranged || '102 Ambulance'}`, new Date().toISOString(), id],
      );

      await writeFrontlineAudit('REFERRAL', String(id), workerId, workerName, 'REFERRAL_NAVIGATED', null, newStatus, navigationNotes);

      res.status(200).json({ success: true, message: 'Referral navigation updated. Patient and receiving facility synchronized.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── 8. APPOINTMENT ASSISTANCE ───────────────────────────────────────────────

  public static async getAppointments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const result = await db.query(`SELECT * FROM appointments ORDER BY scheduled_date DESC`);
      res.status(200).json({ success: true, count: result.rows.length, appointments: result.rows });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async createAppointmentAssistance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const { patientId, patientName, hospitalId, hospitalName, department, scheduledDate, timeSlot, notes } = req.body;

      if (!patientName || !scheduledDate) {
        res.status(400).json({ success: false, message: 'Patient name and scheduled date are required.' });
        return;
      }

      const id = 'apt-' + Date.now();
      const tokenNumber = Math.floor(Math.random() * 80) + 101;
      const workerId = req.user?._id?.toString() || req.user?.id?.toString() || 'asha-kavita-devi';
      const workerName = req.user?.name || 'Kavita Devi';

      await db.query(
        `INSERT INTO appointments (id, patient_id, hospital_id, service_id, scheduled_date, time_slot, token_number, status, friction_notes, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          id,
          patientId || 'df934545-a5e1-4ed7-a0b4-faed1d13facb',
          hospitalId || 'hosp-phc',
          department || 'General Medicine OPD',
          scheduledDate,
          timeSlot || '10:00 AM - 11:00 AM',
          tokenNumber,
          'CONFIRMED',
          `ASHA Assisted by ${workerName}. Notes: ${notes || 'Patient transport facilitated.'}`,
          new Date().toISOString(),
        ],
      );

      // Create notification for patient
      if (patientId) {
        await Notification.create({
          userId: patientId,
          title: 'Appointment Booked with ASHA Assistance',
          message: `Your appointment at ${hospitalName || 'Phagwara Rural PHC'} has been confirmed for ${scheduledDate} (${timeSlot || '10:00 AM'}). Token #${tokenNumber}.`,
          type: 'success',
          link: '/patient/appointments',
        });
      }

      await writeFrontlineAudit('APPOINTMENT', id, workerId, workerName, 'APPOINTMENT_ASSISTED', null, 'CONFIRMED', `Assisted appointment for ${patientName} at ${hospitalName || 'PHC'}`);

      res.status(201).json({
        success: true,
        message: 'Appointment successfully booked on shared platform.',
        appointment: { id, tokenNumber, scheduledDate, status: 'CONFIRMED' },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── 9. OPD TOKEN ASSISTANCE ─────────────────────────────────────────────────

  public static async getOPDTokens(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const tokens = await QueueToken.find({});
      res.status(200).json({ success: true, count: (tokens as any[]).length, tokens });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async requestOPDToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { patientId, patientName, department, priority } = req.body;
      if (!patientName) {
        res.status(400).json({ success: false, message: 'Patient name is required.' });
        return;
      }

      const allTokens = await QueueToken.find({});
      const highestNum = (allTokens as any[]).reduce((max: number, t: any) => Math.max(max, Number(t.tokenNumber) || 0), 108);
      const nextTokenNum = highestNum + 1;
      const tokenId = 'tok-' + nextTokenNum;
      const workerId = req.user?._id?.toString() || req.user?.id?.toString() || 'asha-kavita-devi';
      const workerName = req.user?.name || 'Kavita Devi';

      const token = await QueueToken.create({
        id: tokenId,
        tokenNumber: nextTokenNum,
        patientId: patientId || 'df934545-a5e1-4ed7-a0b4-faed1d13facb',
        patientName,
        department: department || 'General Medicine OPD',
        status: 'WAITING',
        doctorName: 'Dr. Priya Sharma',
        notes: `Token generated by ASHA ${workerName} (Frontline Assisted OPD Request)`,
        createdAt: new Date(),
      });

      // Notify patient
      if (patientId) {
        await Notification.create({
          userId: patientId,
          title: 'OPD Queue Token Generated',
          message: `ASHA ${workerName} requested your OPD Token #${nextTokenNum} for ${department || 'General Medicine OPD'}. Please arrive 15 minutes prior.`,
          type: 'info',
          link: '/patient/dashboard',
        });
      }

      await writeFrontlineAudit('TOKEN', tokenId, workerId, workerName, 'TOKEN_GENERATED', null, 'WAITING', `Generated Token #${nextTokenNum} for ${patientName}`);

      res.status(201).json({
        success: true,
        message: `Token #${nextTokenNum} successfully created in hospital queue.`,
        token,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── 10. ACCESS BARRIERS & FRICTION ASSESSMENT ──────────────────────────────

  public static async getAccessBarriers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const result = await db.query(`SELECT * FROM access_barriers ORDER BY reported_at DESC`);
      const barriers = (result.rows || []).map((b: any) => ({
        id: b.id,
        workerId: b.worker_id || b.workerId,
        workerName: b.worker_name || b.workerName,
        patientId: b.patient_id || b.patientId,
        patientName: b.patient_name || b.patientName,
        householdId: b.household_id || b.householdId,
        villageName: b.village_name || b.villageName,
        category: b.category,
        barrierType: b.barrier_type || b.barrierType,
        details: b.details,
        frictionScore: b.friction_score || b.frictionScore,
        status: b.status,
        actionTaken: b.action_taken || b.actionTaken,
        reportedAt: b.reported_at || b.reportedAt,
      }));

      res.status(200).json({ success: true, count: barriers.length, barriers });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async recordAccessBarrier(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const { patientId, patientName, householdId, villageName, category, barrierType, details, actionTaken } = req.body;

      if (!patientName || !category || !barrierType) {
        res.status(400).json({ success: false, message: 'Patient name, category, and barrier description are required.' });
        return;
      }

      // Compute Healthcare Access Friction Score based purely on non-clinical factors
      let frictionScore = 'Moderate';
      if (category === 'TRANSPORT' && (barrierType.toLowerCase().includes('emergency') || barrierType.toLowerCase().includes('long travel') || barrierType.toLowerCase().includes('30 km'))) {
        frictionScore = 'High';
      } else if (category === 'AVAILABILITY' && barrierType.toLowerCase().includes('weeks')) {
        frictionScore = 'High';
      } else if (category === 'COST' && barrierType.toLowerCase().includes('severe')) {
        frictionScore = 'Critical';
      } else if (category === 'DOCUMENTATION' || category === 'LANGUAGE') {
        frictionScore = 'Moderate';
      }

      const id = 'bar-' + Date.now();
      const workerId = req.user?._id?.toString() || req.user?.id?.toString() || 'asha-kavita-devi';
      const workerName = req.user?.name || 'Kavita Devi';

      await db.query(
        `INSERT INTO access_barriers (id, worker_id, worker_name, patient_id, patient_name, household_id, village_name, category, barrier_type, details, friction_score, status, action_taken, reported_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          id,
          workerId,
          workerName,
          patientId || null,
          patientName,
          householdId || 'HH-PB-02',
          villageName || 'Rampur Kalan',
          category,
          barrierType,
          details || '',
          frictionScore,
          'Identified',
          actionTaken || 'Action plan initiated',
          new Date().toISOString(),
        ],
      );

      await writeFrontlineAudit('BARRIER', id, workerId, workerName, 'BARRIER_RECORDED', null, 'Identified', `Recorded ${category} barrier for ${patientName}`);

      res.status(201).json({
        success: true,
        message: `Non-clinical access barrier recorded. Computed friction: ${frictionScore}.`,
        barrier: { id, patientName, category, frictionScore, status: 'Identified' },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── 11. ESCALATIONS (CLINICAL CONCERN VS HIGH ACCESS PRIORITY) ──────────────

  public static async getEscalations(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const result = await db.query(`SELECT * FROM escalations ORDER BY created_at DESC`);
      const escalations = (result.rows || []).map((e: any) => ({
        id: e.id,
        workerId: e.worker_id || e.workerId,
        workerName: e.worker_name || e.workerName,
        patientId: e.patient_id || e.patientId,
        patientName: e.patient_name || e.patientName,
        householdId: e.household_id || e.householdId,
        villageName: e.village_name || e.villageName,
        type: e.type,
        urgency: e.urgency,
        reason: e.reason,
        reportedObservations: e.reported_observations || e.reportedObservations,
        routedToRole: e.routed_to_role || e.routedToRole,
        routedToFacility: e.routed_to_facility || e.routedToFacility,
        clinicalReviewStatus: e.clinical_review_status || e.clinicalReviewStatus,
        clinicalNotes: e.clinical_notes || e.clinicalNotes,
        status: e.status,
        createdAt: e.created_at || e.createdAt,
      }));

      res.status(200).json({ success: true, count: escalations.length, escalations });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async createEscalation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const { patientId, patientName, householdId, villageName, type, urgency, reason, reportedObservations, routedToFacility } = req.body;

      if (!patientName || !type || !reason) {
        res.status(400).json({ success: false, message: 'Patient name, escalation type, and reason are required.' });
        return;
      }

      const id = 'esc-' + Date.now();
      const workerId = req.user?._id?.toString() || req.user?.id?.toString() || 'asha-kavita-devi';
      const workerName = req.user?.name || 'Kavita Devi';
      const routedRole = type === 'CLINICAL_CONCERN' ? 'Doctor' : 'Block Health Officer';

      await db.query(
        `INSERT INTO escalations (id, worker_id, worker_name, patient_id, patient_name, household_id, village_name, type, urgency, reason, reported_observations, routed_to_role, routed_to_facility, clinical_review_status, clinical_notes, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          id,
          workerId,
          workerName,
          patientId || 'pt-demo',
          patientName,
          householdId || 'HH-PB-02',
          villageName || 'Rampur Kalan',
          type,
          urgency || 'High',
          reason,
          reportedObservations || 'Non-clinical observations recorded by frontline worker during visit.',
          routedRole,
          routedToFacility || 'Phagwara Rural PHC',
          type === 'CLINICAL_CONCERN' ? 'Pending Review' : null,
          null,
          'Open',
          new Date().toISOString(),
        ],
      );

      await writeFrontlineAudit('ESCALATION', id, workerId, workerName, 'ESCALATION_SUBMITTED', null, 'Open', `Submitted ${type} escalation (${urgency}) for ${patientName}`);

      res.status(201).json({
        success: true,
        message: type === 'CLINICAL_CONCERN'
          ? 'Clinical concern routed to authorized Medical Officer & Doctor desk.'
          : 'High Access Priority alert dispatched to Block Health Officer.',
        escalation: { id, patientName, type, urgency, status: 'Open' },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── 12. OFFLINE SYNC (IDEMPOTENT BATCH PROCESSOR) ───────────────────────────

  public static async getSyncStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const result = await db.query(`SELECT * FROM frontline_sync_operations ORDER BY created_at DESC LIMIT 50`);
      const pending = result.rows.filter((r: any) => r.status === 'PENDING').length;
      const failed = result.rows.filter((r: any) => r.status === 'FAILED').length;
      const synced = result.rows.filter((r: any) => r.status === 'SYNCED').length;

      res.status(200).json({
        success: true,
        summary: {
          pending,
          failed,
          synced,
          total: result.rows.length,
          lastSyncTime: result.rows[0]?.synced_at || new Date().toISOString(),
        },
        operations: result.rows,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async processSync(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const { operations } = req.body;
      const workerId = req.user?._id?.toString() || req.user?.id?.toString() || 'asha-kavita-devi';
      const workerName = req.user?.name || 'Kavita Devi';

      if (!Array.isArray(operations) || operations.length === 0) {
        res.status(200).json({ success: true, message: 'No pending offline records to synchronize.', processedCount: 0 });
        return;
      }

      let syncedCount = 0;
      const results: any[] = [];

      for (const op of operations) {
        const { localOperationId, operationType, payload } = op;
        if (!localOperationId) continue;

        // Idempotency check: check if localOperationId has already been successfully synced
        const check = await db.query(`SELECT * FROM frontline_sync_operations WHERE local_operation_id = $1 LIMIT 1`, [localOperationId]);
        if (check.rows.length > 0 && check.rows[0].status === 'SYNCED') {
          results.push({ localOperationId, status: 'ALREADY_SYNCED' });
          continue;
        }

        try {
          // Execute corresponding backend entity creation/update based on operationType
          if (operationType === 'VISIT_COMPLETED') {
            await db.query(
              `UPDATE frontline_visits SET status = 'COMPLETED', notes = $1, completed_at = $2 WHERE id = $3`,
              [payload.notes || 'Completed via offline sync', new Date().toISOString(), payload.visitId],
            );
          } else if (operationType === 'BARRIER_RECORDED') {
            const barId = 'bar-' + Date.now();
            await db.query(
              `INSERT INTO access_barriers (id, worker_id, worker_name, patient_name, village_name, category, barrier_type, friction_score, status, action_taken, reported_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
              [barId, workerId, workerName, payload.patientName || 'Beneficiary', 'Rampur Kalan', payload.category || 'OTHER', payload.barrierType || 'Recorded offline', 'Moderate', 'Identified', 'Synced from field', new Date().toISOString()],
            );
          }

          // Record successful sync
          const opId = 'sync-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
          await db.query(
            `INSERT INTO frontline_sync_operations (id, worker_id, local_operation_id, operation_type, payload, status, synced_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [opId, workerId, localOperationId, operationType, JSON.stringify(payload), 'SYNCED', new Date().toISOString()],
          );

          syncedCount++;
          results.push({ localOperationId, status: 'SYNCED' });
        } catch (opErr: any) {
          const failId = 'sync-' + Date.now();
          await db.query(
            `INSERT INTO frontline_sync_operations (id, worker_id, local_operation_id, operation_type, payload, status, error_message) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [failId, workerId, localOperationId, operationType, JSON.stringify(payload), 'FAILED', opErr.message],
          );
          results.push({ localOperationId, status: 'FAILED', error: opErr.message });
        }
      }

      await writeFrontlineAudit('SYNC', 'batch', workerId, workerName, 'SYNC_PROCESSED', null, 'SYNCED', `Processed ${syncedCount} field operations`);

      res.status(200).json({
        success: true,
        message: `Sync completed: ${syncedCount} operations synchronized cleanly to shared database.`,
        processedCount: syncedCount,
        results,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── 13. AUDIT TRAIL ─────────────────────────────────────────────────────────

  public static async getAuditTrail(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const result = await db.query(`SELECT * FROM frontline_audit_events ORDER BY timestamp DESC LIMIT 100`);
      const events = (result.rows || []).map((a: any) => ({
        id: a.id,
        resourceType: a.resource_type,
        resourceId: a.resource_id,
        actorId: a.actor_id,
        actorName: a.actor_name,
        actorRole: a.actor_role,
        action: a.action,
        previousStatus: a.previous_status,
        newStatus: a.new_status,
        notes: a.notes,
        timestamp: a.timestamp,
      }));

      res.status(200).json({ success: true, count: events.length, events });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ── 14. NOTIFICATIONS ───────────────────────────────────────────────────────

  public static async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const db = getDB();
      const userId = req.user?._id?.toString() || req.user?.id?.toString() || 'asha-kavita-devi';
      const result = await db.query(
        `SELECT * FROM notifications WHERE user_id = $1 OR user_id = 'all' OR user_id = 'asha-worker-01' ORDER BY created_at DESC LIMIT 50`,
        [userId],
      );

      const notifications = (result.rows || []).map((n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type || 'info',
        isRead: Boolean(n.is_read),
        createdAt: n.created_at,
      }));

      res.status(200).json({ success: true, count: notifications.length, notifications });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // Legacy compatibility for flagPatient
  public static async flagPatient(req: AuthenticatedRequest, res: Response): Promise<void> {
    return AshaController.createEscalation(req, res);
  }
}
