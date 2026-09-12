import { createSQLModel } from '../database/sqlModel.js';

export type NotificationType =
  | 'REQUEST_UPDATE'
  | 'NEW_REQUEST'
  | 'CONSENT_UPDATE'
  | 'DOCUMENT_ALERT'
  | 'SYSTEM_ALERT';

export interface INotification {
  _id?: any;
  id?: any;
  userId: any;
  role?: 'patient' | 'hospital' | 'admin';
  title: string;
  message: string;
  type: NotificationType | string;
  relatedId?: any;
  relatedType?: string;
  isRead?: boolean;
  actionUrl?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const Notification: any = createSQLModel<INotification>('notifications');
