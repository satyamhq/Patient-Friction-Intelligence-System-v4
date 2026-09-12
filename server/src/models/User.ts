import { createSQLModel } from '../database/sqlModel.js';

export type UserRole = 'patient' | 'hospital' | 'admin' | 'doctor' | 'asha_worker' | 'government';

export interface IUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  isActive?: boolean;
  avatarUrl?: string;
  preferredLanguage?: string;
  preferredDialect?: string;
  simpleLanguageMode?: boolean;
  voiceEnabled?: boolean;
  textToSpeechEnabled?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  save?: () => Promise<any>;
  toObject?: () => any;
  toJSON?: () => any;
}

export const User: any = createSQLModel<IUser>('users');
