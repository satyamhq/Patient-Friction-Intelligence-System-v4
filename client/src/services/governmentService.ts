import { api } from './api';

export interface IGovMetric {
  value: number;
  source: string;
  lastUpdated: string;
  coverage: string;
  status: string;
}

export interface IGovAnalytics {
  metrics: {
    registeredFacilities: IGovMetric;
    activeFacilities: IGovMetric;
    pendingVerifications: IGovMetric;
    opdVolume: IGovMetric;
    waitingPatients: IGovMetric;
    avgWaitTimeMinutes: IGovMetric;
    totalBeds: IGovMetric & { occupied: number; available: number; utilizationRate: number };
    icuBeds: IGovMetric & { occupied: number; available: number };
    emergencyBays: IGovMetric & { occupied: number; available: number };
    referralCompletionRate: IGovMetric & { totalReferrals: number; completedReferrals: number; delayedReferrals: number };
    ashaCoverage: {
      activeWorkers: number;
      totalHouseholds: number;
      visitsCompleted: number;
      pendingVisits: number;
      source: string;
      lastUpdated: string;
      coverage: string;
      status: string;
    };
    openOperationalAlerts: IGovMetric;
  };
  barrierDistribution: Record<string, number>;
  recentActions: any[];
}

export const governmentService = {
  // Profile
  async getMyProfile(): Promise<{ success: boolean; profile: any }> {
    const res = await api.get('/government/profile/me');
    return res.data;
  },

  // Dashboard analytics
  async getDashboardAnalytics(): Promise<{ success: boolean; analytics: IGovAnalytics }> {
    const res = await api.get('/government/dashboard');
    return res.data;
  },

  // Action Center
  async getActions(): Promise<{ success: boolean; count: number; actions: any[] }> {
    const res = await api.get('/government/actions');
    return res.data;
  },

  async updateActionTicket(id: string, data: { status: string; resolutionNotes?: string }): Promise<{ success: boolean; message: string; action: any }> {
    const res = await api.put(`/government/actions/${id}`, data);
    return res.data;
  },

  // Facility Registry & Verification
  async getAllHospitals(): Promise<{ success: boolean; count: number; hospitals: any[] }> {
    const res = await api.get('/government/hospitals');
    return res.data;
  },

  async verifyHospital(id: string, data: { action: string; notes?: string; documentsReviewed?: string[] }): Promise<{ success: boolean; message: string; hospital: any }> {
    const res = await api.put(`/government/hospitals/${id}/verify`, data);
    return res.data;
  },

  // Beds & Capacity Oversight
  async getHospitalBeds(): Promise<{ success: boolean; count: number; facilities: any[] }> {
    const res = await api.get('/government/beds');
    return res.data;
  },

  // Referrals
  async getReferralNetwork(): Promise<{ success: boolean; network: any }> {
    const res = await api.get('/government/referrals');
    return res.data;
  },

  // Friction Trends
  async getFrictionTrends(range?: string): Promise<{ success: boolean; trends: any }> {
    const res = await api.get('/government/friction-trends', { params: { range } });
    return res.data;
  },

  // ASHA Coverage
  async getAshaCoverage(): Promise<{ success: boolean; coverage: any }> {
    const res = await api.get('/government/asha-coverage');
    return res.data;
  },

  // Facility Quality & NQAS
  async getFacilityQuality(): Promise<{ success: boolean; qualityMetrics: any[] }> {
    const res = await api.get('/government/facility-quality');
    return res.data;
  },

  // Service Availability
  async getServiceAvailability(): Promise<{ success: boolean; services: any[] }> {
    const res = await api.get('/government/services');
    return res.data;
  },

  // OPD Analytics
  async getOPDAnalytics(): Promise<{ success: boolean; analytics: any }> {
    const res = await api.get('/government/opd-analytics');
    return res.data;
  },

  // Labs
  async getLabNetwork(): Promise<{ success: boolean; labNetwork: any }> {
    const res = await api.get('/government/labs');
    return res.data;
  },

  // Pharmacy
  async getPharmacyAvailability(): Promise<{ success: boolean; medicines: any[] }> {
    const res = await api.get('/government/pharmacy');
    return res.data;
  },

  // District Comparison
  async getDistrictComparison(): Promise<{ success: boolean; districts: any[] }> {
    const res = await api.get('/government/district-comparison');
    return res.data;
  },

  // Reports
  async getReports(): Promise<{ success: boolean; reports: any[] }> {
    const res = await api.get('/government/reports');
    return res.data;
  },

  // Audit Logs
  async getAuditLogs(): Promise<{ success: boolean; count: number; logs: any[] }> {
    const res = await api.get('/government/audit-logs');
    return res.data;
  },
};
