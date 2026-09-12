import { Types } from 'mongoose';
import { Notification, NotificationType } from '../models/Notification.js';

export class NotificationService {
  public static async createNotification(data: {
    userId: string | Types.ObjectId;
    role: 'patient' | 'hospital' | 'admin';
    title: string;
    message: string;
    type: NotificationType;
    relatedId?: string | Types.ObjectId;
    relatedType?: string;
    actionUrl?: string;
  }) {
    try {
      const notif = await Notification.create(data);
      return notif;
    } catch (error) {
      console.error('[NotificationService Error]', error);
      return null;
    }
  }

  public static async getUnreadCount(userId: string | Types.ObjectId): Promise<number> {
    return Notification.countDocuments({ userId, isRead: false });
  }

  public static async getUserNotifications(
    userId: string | Types.ObjectId,
    limit: number = 20
  ) {
    return Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  }

  public static async markAllAsRead(userId: string | Types.ObjectId) {
    return Notification.updateMany({ userId, isRead: false }, { isRead: true });
  }
}
