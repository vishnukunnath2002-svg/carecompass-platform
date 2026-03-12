import React, { createContext, useContext, useEffect, useState } from 'react';
import authService, { CurrentUser, UserRole as AuthUserRole } from '@/services/authService';
import { getAccessToken } from '@/services/api';

type UserRole = AuthUserRole['role'];

interface AuthContextType {
  user: CurrentUser | null;
  session: { access_token: string } | null;
  roles: UserRole[];
  tenantSlug: string | null;
  tenantId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [tenantSlug, setTenantSlug] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    setLoading(true);
    try {
      if (getAccessToken()) {
        const currentUser = await authService.getMe();
        if (currentUser) {
          setUser(currentUser);
          setSession({ access_token: getAccessToken() || '' });
          
          if (currentUser.roles?.length > 0) {
            setRoles(currentUser.roles.map(r => r.role as UserRole));
            
            // Get tenant context from the first role that has it
            const tenantRole = currentUser.roles.find(r => r.tenant_id);
            if (tenantRole) {
              setTenantId(tenantRole.tenant_id);
              if (tenantRole.tenant_slug) {
                setTenantSlug(tenantRole.tenant_slug);
              }
            }
          } else {
            setRoles([]);
            setTenantId(null);
            setTenantSlug(null);
          }
        } else {
          clearAuthState();
        }
      } else {
        clearAuthState();
      }
    } catch {
      clearAuthState();
    } finally {
      setLoading(false);
    }
  };

  const clearAuthState = () => {
    setUser(null);
    setSession(null);
    setRoles([]);
    setTenantId(null);
    setTenantSlug(null);
  };

  useEffect(() => {
    // Initial fetch on mount
    loadUser();

    // In a real app we might want to listen to a central event emitter for auth state changes,
    // but React context state usually handles downstream updates.
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await authService.login(email, password);
    if (!error && data?.user) {
      await loadUser(); // Reload to update states properly
    }
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await authService.register(email, password, metadata);
    if (!error && data?.user) {
      await loadUser(); // Reload to update states properly
    }
    return { error };
  };

  const signOut = async () => {
    await authService.logout();
    clearAuthState();
  };

  return (
    <AuthContext.Provider value={{ user, session, roles, tenantSlug, tenantId, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
