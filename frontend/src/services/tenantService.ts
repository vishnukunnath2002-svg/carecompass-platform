/**
 * src/services/tenantService.ts
 * 
 * Replaces useTenantSubscription.ts supabase queries.
 * Provides tenant info and subscription details for the current user.
 */

import api from './api';

export interface TenantSubscription {
  id: string;
  plan_id: string;
  plan_name: string;
  status: string;
  is_trial: boolean;
  started_at: string;
  expires_at: string | null;
  modules_included: string[];
  max_users: number | null;
  max_listings: number | null;
}

export interface TenantInfo {
  id: string;
  name: string;
  brand_name: string | null;
  type: string;
  status: string;
  domain_slug: string | null;
  logo_url: string | null;
  modules_enabled: Record<string, boolean>;
  contact_email: string | null;
  active_subscription: TenantSubscription | null;
}

const tenantService = {
  /**
   * GET /api/tenant/info/
   * Replaces useTenantSubscription's supabase queries for tenant + subscription.
   */
  async getCurrentTenantInfo(): Promise<TenantInfo | null> {
    try {
      const { data } = await api.get<TenantInfo>('/api/tenant/info/');
      return data;
    } catch {
      return null;
    }
  },

  /**
   * Admin: list all tenants.
   * GET /api/admin/tenants/
   */
  async listTenants(params?: Record<string, string>): Promise<{ results: TenantInfo[]; count: number }> {
    const { data } = await api.get('/api/admin/tenants/', { params });
    return data;
  },

  /**
   * Admin: create a new tenant.
   * POST /api/admin/tenants/
   */
  async createTenant(payload: Partial<TenantInfo>): Promise<TenantInfo> {
    const { data } = await api.post('/api/admin/tenants/', payload);
    return data;
  },

  /**
   * Admin: update a tenant.
   * PATCH /api/admin/tenants/{id}/
   */
  async updateTenant(id: string, payload: Partial<TenantInfo>): Promise<TenantInfo> {
    const { data } = await api.patch(`/api/admin/tenants/${id}/`, payload);
    return data;
  },

  /**
   * Admin: suspend/activate/deactivate tenant.
   */
  async changeTenantStatus(id: string, action: 'suspend' | 'activate' | 'deactivate'): Promise<void> {
    await api.post(`/api/admin/tenants/${id}/${action}/`);
  },

  /**
   * Admin: toggle a module for a tenant.
   */
  async setTenantModule(id: string, module: string, enabled: boolean): Promise<void> {
    await api.post(`/api/admin/tenants/${id}/${enabled ? 'enable' : 'disable'}-module/`, { module });
  },

  /**
   * Admin: assign a subscription plan to a tenant.
   */
  async assignPlan(tenantId: string, planId: string, options?: { is_trial?: boolean; expires_at?: string }): Promise<void> {
    await api.post(`/api/admin/tenants/${tenantId}/assign-plan/`, { plan_id: planId, ...options });
  },

  /**
   * Admin: list subscription plans.
   */
  async listPlans(): Promise<any[]> {
    const { data } = await api.get('/api/admin/plans/');
    return data.results || data;
  },

  /**
   * Check if a specific module is enabled for the current tenant.
   */
  isModuleEnabled(tenant: TenantInfo | null, module: string): boolean {
    if (!tenant) return false;
    const sub = tenant.active_subscription;
    if (sub?.modules_included?.includes(module)) return true;
    return tenant.modules_enabled?.[module] === true;
  },
};

export default tenantService;
