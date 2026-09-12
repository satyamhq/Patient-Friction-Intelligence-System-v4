import { api } from './api';
import { NotificationItem } from '../types';

export const notificationService = {
  async getMyNotifications(): Promise<{
    success: boolean;
    unreadCount: number;
    notifications: NotificationItem[];
  }> {
    const res = await api.get('/notifications/my');
    return res.data;
  },

  async markAsRead(id: string): Promise<{ success: boolean; notification: NotificationItem }> {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
};
