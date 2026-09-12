import { Request, Response } from 'express';
import { QueueToken } from '../models/QueueToken.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

export class QueueController {
  // Get active queue for patient or department
  public static async getLiveQueue(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { hospitalId, department } = req.query;
      const patientId = req.user?._id || req.user?.id;

      let patientToken: any = null;
      if (patientId) {
        const tokens = await QueueToken.find({
          patientId: patientId.toString(),
          status: { $in: ['WAITING', 'SERVING'] },
        });
        if (tokens.length > 0) patientToken = tokens[0];
      }

      // Department queue list
      const query: any = { status: { $in: ['WAITING', 'SERVING'] } };
      if (hospitalId) query.hospitalId = hospitalId;
      if (department) query.department = department;

      const activeTokens = await QueueToken.find(query);
      const currentlyServing = activeTokens.find((t: any) => t.status === 'SERVING') || null;
      const waitingList = activeTokens.filter((t: any) => t.status === 'WAITING');

      res.status(200).json({
        success: true,
        patientToken,
        currentlyServing,
        waitingCount: waitingList.length,
        estimatedWaitMinutes: waitingList.length * 12,
        tokens: activeTokens.slice(0, 20),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch live queue.' });
    }
  }

  // Issue new queue token for a patient
  public static async issueToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patientId = req.user?._id || req.user?.id;
      const patientName = req.user?.name || 'Citizen Patient';
      const { hospitalId, hospitalName, department, priority } = req.body;

      if (!hospitalName || !department) {
        res.status(400).json({ success: false, message: 'Hospital and department are required.' });
        return;
      }

      // Calculate next token number
      const existing = await QueueToken.find({ hospitalId: hospitalId || 'hosp-default' });
      const nextNumber = existing.length + 101;
      const patientsAhead = existing.filter((t: any) => t.status === 'WAITING').length;

      const token = await QueueToken.create({
        tokenNumber: nextNumber,
        patientId: (patientId || req.user?._id || req.user?.id || 'PAT-DEMO').toString(),
        patientName,
        hospitalId: hospitalId || 'hosp-default',
        hospitalName,
        department,
        priority: priority || 'STANDARD',
        status: 'WAITING',
        patientsAhead,
        estimatedWaitMinutes: (patientsAhead + 1) * 12,
        issueTime: new Date(),
      });

      res.status(201).json({
        success: true,
        message: `Token #${nextNumber} issued successfully!`,
        token,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to issue token.' });
    }
  }

  // Call next patient in queue (Doctor or Hospital Desk)
  public static async callNext(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { tokenId } = req.body;
      let token: any;

      if (tokenId) {
        token = await QueueToken.findById(tokenId);
      } else {
        const waiting = await QueueToken.find({ status: 'WAITING' });
        if (waiting.length > 0) token = waiting[0];
      }

      if (!token) {
        res.status(404).json({ success: false, message: 'No waiting patients found in queue.' });
        return;
      }

      token.status = 'SERVING';
      token.servedTime = new Date();
      token.doctorName = req.user?.name || 'Duty Specialist';
      await token.save();

      res.status(200).json({
        success: true,
        message: `Now serving Token #${token.tokenNumber}: ${token.patientName}`,
        token,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to advance queue.' });
    }
  }

  // Mark token completed
  public static async completeToken(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const token = await QueueToken.findById(id);
      if (!token) {
        res.status(404).json({ success: false, message: 'Token not found.' });
        return;
      }
      token.status = 'COMPLETED';
      token.completedTime = new Date();
      await token.save();

      res.status(200).json({
        success: true,
        message: `Token #${token.tokenNumber} marked as completed.`,
        token,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to complete token.' });
    }
  }
}
