import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Notification } from '../models/Notification.js';

export class NotificationController {
  public static async getMyNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const notifications = await Notification.find({ userId: req.user?._id })
        .sort({ createdAt: -1 })
        .limit(30);

      const unreadCount = await Notification.countDocuments({
        userId: req.user?._id,
        isRead: false,
      });

      res.status(200).json({
        success: true,
        unreadCount,
        notifications,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch notifications.' });
    }
  }

  public static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const notif = await Notification.findOneAndUpdate(
        { _id: id, userId: req.user?._id },
        { isRead: true },
        { new: true }
      );

      res.status(200).json({
        success: true,
        notification: notif,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update notification.' });
    }
  }

  public static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      await Notification.updateMany({ userId: req.user?._id, isRead: false }, { isRead: true });

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update notifications.' });
    }
  }
}
