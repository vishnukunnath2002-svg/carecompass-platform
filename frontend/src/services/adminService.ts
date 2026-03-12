/**
 * src/services/adminService.ts
 * Wraps super admin API calls (used in the Admin portal).
 */
import api from './api';

const adminService = {
  // Users Management
  async listUsers(params?: Record<string, any>) {
    const { data } = await api.get('/api/admin/users/', { params });
    return data;
  },
  async assignRole(userId: string, role: string, tenantId?: string) {
    const { data } = await api.post(`/api/admin/users/${userId}/assign-role/`, { role, tenant_id: tenantId });
    return data;
  },
  async revokeRole(userId: string, role: string, tenantId?: string) {
    await api.post(`/api/admin/users/${userId}/revoke-role/`, { role, tenant_id: tenantId });
  },
  async deactivateUser(userId: string) {
    await api.post(`/api/admin/users/${userId}/deactivate/`);
  },
  async activateUser(userId: string) {
    await api.post(`/api/admin/users/${userId}/activate/`);
  },

  // Platform Modules/Features
  async listFeatures() {
    const { data } = await api.get('/api/admin/features/'); // mapped to core feature flags/modules
    return data;
  },
};

export default adminService;
