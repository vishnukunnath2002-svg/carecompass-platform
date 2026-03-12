/**
 * src/services/authService.ts
 * 
 * Replaces all supabase.auth.* operations with JWT REST API calls.
 */

import api, { setTokens, clearTokens } from './api';

export interface UserRole {
  role: string;
  tenant_id: string | null;
  tenant_name?: string;
  tenant_slug?: string;
  tenant_type?: string;
  tenant_status?: string;
}

export interface UserProfile {
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: string | null;
}

export interface CurrentUser {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  roles: UserRole[];
  profile: UserProfile | null;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: CurrentUser;
}

const authService = {
  /**
   * POST /api/auth/login/
   * Replaces: supabase.auth.signInWithPassword()
   */
  async login(email: string, password: string): Promise<{ data: AuthTokens | null; error: Error | null }> {
    try {
      const { data } = await api.post<AuthTokens>('/api/auth/login/', { email, password });
      setTokens(data.access, data.refresh);
      // Cache tenant_id for X-Tenant-ID header
      const tenantRole = data.user.roles.find((r) => r.tenant_id);
      if (tenantRole?.tenant_id) {
        localStorage.setItem('tenant_id', tenantRole.tenant_id);
      }
      localStorage.setItem('user', JSON.stringify(data.user));
      return { data, error: null };
    } catch (err: any) {
      const message = err.response?.data?.non_field_errors?.[0] || err.message || 'Login failed';
      return { data: null, error: new Error(message) };
    }
  },

  /**
   * POST /api/auth/register/
   * Replaces: supabase.auth.signUp()
   */
  async register(
    email: string,
    password: string,
    metadata?: { full_name?: string; phone?: string; role?: string }
  ): Promise<{ data: AuthTokens | null; error: Error | null }> {
    try {
      const { data } = await api.post<AuthTokens>('/api/auth/register/', {
        email,
        password,
        full_name: metadata?.full_name || '',
        phone: metadata?.phone || '',
        role: metadata?.role || 'patient',
      });
      setTokens(data.access, data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { data, error: null };
    } catch (err: any) {
      const errors = err.response?.data;
      const message = errors?.email?.[0] || errors?.password?.[0] || err.message || 'Registration failed';
      return { data: null, error: new Error(message) };
    }
  },

  /**
   * POST /api/auth/logout/
   * Replaces: supabase.auth.signOut()
   */
  async logout(): Promise<void> {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await api.post('/api/auth/logout/', { refresh });
      }
    } catch {
      // fail silently
    } finally {
      clearTokens();
    }
  },

  /**
   * GET /api/auth/me/
   * Replaces: supabase.auth.getSession() + supabase.from('user_roles').select()
   */
  async getMe(): Promise<CurrentUser | null> {
    try {
      const { data } = await api.get<CurrentUser>('/api/auth/me/');
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch {
      return null;
    }
  },

  /**
   * Get cached user from localStorage (sync, no network).
   * Replaces: supabase.auth.getUser() for synchronous reads.
   */
  getCachedUser(): CurrentUser | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CurrentUser;
    } catch {
      return null;
    }
  },

  /**
   * PATCH /api/auth/me/
   * Update profile fields.
   */
  async updateProfile(updates: Partial<Pick<CurrentUser, 'full_name' | 'phone'> & UserProfile>): Promise<CurrentUser | null> {
    try {
      const { data } = await api.patch<CurrentUser>('/api/auth/me/', updates);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch {
      return null;
    }
  },

  /**
   * Get redirect path for user based on their roles.
   * Replaces: getRedirectPath() in Auth.tsx
   */
  getRedirectPath(user: CurrentUser): string {
    const roleToPath: Record<string, string> = {
      super_admin: '/admin', admin_manager: '/admin',
      verification_officer: '/admin', finance_admin: '/admin',
      support_agent: '/admin', content_manager: '/admin',
      patient: '/patient',
      agency_admin: '/agency', agency_ops: '/agency', agency_booking: '/agency',
      agency_support: '/agency', agency_recruiter: '/agency', agency_finance: '/agency',
      provider: '/provider',
      vendor_admin: '/vendor', vendor_catalogue: '/vendor',
      vendor_inventory: '/vendor', vendor_orders: '/vendor', vendor_finance: '/vendor',
      store_admin: '/store', store_counter: '/store',
      store_inventory: '/store', store_dispatch: '/store',
      hospital_admin: '/hospital', hospital_procurement: '/hospital',
      hospital_discharge: '/hospital', hospital_nursing: '/hospital',
    };

    const tenantRole = user.roles.find((r) => r.tenant_id && r.tenant_slug);
    if (tenantRole?.tenant_slug) {
      const basePath = roleToPath[tenantRole.role] || '/patient';
      return `/t/${tenantRole.tenant_slug}${basePath}`;
    }

    const firstRole = user.roles[0];
    return roleToPath[firstRole?.role] || '/patient';
  },
};

export default authService;
