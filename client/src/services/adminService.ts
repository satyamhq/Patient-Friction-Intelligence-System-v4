import { api } from './api';

export const adminService = {
  async getDashboardStats(): Promise<{ success: boolean; stats: any }> {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  async getPopulationFrictionMap(): Promise<{
    success: boolean;
    clusterCount: number;
    clusters: any[];
  }> {
    const res = await api.get('/admin/friction-map');
    return res.data;
  },

  async getCareLeakage(): Promise<{ success: boolean; careLeakage: any }> {
    const res = await api.get('/admin/care-leakage');
    return res.data;
  },

  async getWhyCareFailed(cohortSize?: number): Promise<{ success: boolean; attribution: any }> {
    const res = await api.get('/admin/care-failure', { params: { cohortSize } });
    return res.data;
  },

  async getAllPatients(page?: number, limit?: number): Promise<{
    success: boolean;
    total: number;
    page: number;
    totalPages: number;
    patients: any[];
  }> {
    const res = await api.get('/admin/patients', { params: { page, limit } });
    return res.data;
  },

  async getAllHospitals(): Promise<{ success: boolean; count: number; hospitals: any[] }> {
    const res = await api.get('/admin/hospitals');
    return res.data;
  },

  async deleteHospital(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/admin/hospitals/${id}`);
    return res.data;
  },

  async createHospital(data: any): Promise<{ success: boolean; message: string; hospital: any }> {
    const res = await api.post('/admin/hospitals', data);
    return res.data;
  },

  async updateHospital(id: string, data: any): Promise<{ success: boolean; message: string; hospital: any }> {
    const res = await api.put(`/admin/hospitals/${id}`, data);
    return res.data;
  },

  async getAuditLogs(limit?: number): Promise<{ success: boolean; count: number; logs: any[] }> {
    const res = await api.get('/admin/audit-logs', { params: { limit } });
    return res.data;
  },

  // Feature Flags
  async getFeatureFlags(): Promise<{ success: boolean; count: number; flags: any[] }> {
    const res = await api.get('/admin/feature-flags');
    return res.data;
  },

  async updateFeatureFlag(key: string, enabled: boolean): Promise<{ success: boolean; message: string }> {
    const res = await api.put(`/admin/feature-flags/${key}`, { enabled });
    return res.data;
  },

  // User Management
  async getAllUsers(): Promise<{ success: boolean; total: number; users: any[]; roleGroups: any }> {
    const res = await api.get('/admin/users');
    return res.data;
  },

  async toggleUserStatus(id: string): Promise<{ success: boolean; message: string; user: any }> {
    const res = await api.put(`/admin/users/${id}/toggle`);
    return res.data;
  },

  // Strategic Statewide Methods
  async getStateCommand(): Promise<{ success: boolean; commandCenter: any }> {
    const res = await api.get('/admin/state-command');
    return res.data;
  },

  async getPolicySimulator(params?: { opdIncrease?: number; doctorIncrease?: number; teleconsult?: boolean }): Promise<{ success: boolean; simulation: any }> {
    const res = await api.get('/admin/simulator', { params });
    return res.data;
  },

  async getBudgetOptimizer(budget?: number): Promise<{ success: boolean; optimizer: any }> {
    const res = await api.get('/admin/budget-optimizer', { params: { budget } });
    return res.data;
  },

  async getSystemIntegrations(): Promise<{ success: boolean; count: number; integrations: any[] }> {
    const res = await api.get('/admin/integrations');
    return res.data;
  },

  async getDataQuality(): Promise<{ success: boolean; dataQuality: any }> {
    const res = await api.get('/admin/data-quality');
    return res.data;
  },

  async getPermissionsMatrix(): Promise<{ success: boolean; matrix: any[]; rolesSummary?: any[] }> {
    const res = await api.get('/admin/permissions');
    return res.data;
  },

  async getSystemHealth(): Promise<{ success: boolean; health: any }> {
    const res = await api.get('/admin/system-health');
    return res.data;
  },

  async getSystemMap(): Promise<{ success: boolean; flow: any[] }> {
    const res = await api.get('/admin/system-map');
    return res.data;
  },

  async getAdminReports(): Promise<{ success: boolean; reports: any[] }> {
    const res = await api.get('/admin/reports');
    return res.data;
  },
};
