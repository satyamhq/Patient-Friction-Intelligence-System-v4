import { api, API_BASE_URL } from './api';
import { User } from '../types';

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
  profile?: any;
}

export const authService = {
  async register(data: any): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/register', data);
    return res.data;
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/login', { email, password });
    return res.data;
  },

  async loginWithGoogle(credential: string, role?: string, profileData?: any): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/google', { credential, role, profileData });
    return res.data;
  },

  async getGoogleConfig(): Promise<{ success: boolean; configured: boolean; clientId: string; clientSecretConfigured: boolean }> {
    const res = await api.get('/auth/google/config');
    return res.data;
  },

  async saveGoogleClientId(clientId: string): Promise<{ success: boolean; message: string; clientId: string }> {
    const res = await api.post('/auth/google/config', { clientId });
    return res.data;
  },

  getGoogleOAuthRedirectUrl(role: string = 'patient'): string {
    const base = API_BASE_URL.replace(/\/+$/, '');
    return `${base}/auth/google?role=${encodeURIComponent(role)}`;
  },

  async getGoogleAuthUrl(role: string, clientId?: string): Promise<{ success: boolean; url: string }> {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (clientId) params.append('clientId', clientId);
    const res = await api.get(`/auth/google/url?${params.toString()}`);
    return res.data;
  },

  async googleCallback(code: string, role?: string, clientId?: string, redirectUri?: string): Promise<LoginResponse> {
    const res = await api.post<LoginResponse>('/auth/google/callback', { code, role, clientId, redirectUri });
    return res.data;
  },

  async getMe(): Promise<{ success: boolean; user: User; profile: any }> {
    const res = await api.get('/auth/me');
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('pfis_auth_token');
      localStorage.removeItem('pfis_auth_user');
    }
  },
};
