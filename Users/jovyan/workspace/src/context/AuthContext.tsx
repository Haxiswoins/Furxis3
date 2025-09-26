
'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { CustomUser } from '@/types';

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  login: (returnTo?: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      setUser(data.user || null);
    } catch (error) {
      console.error('Failed to fetch user', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback((returnTo?: string) => {
    const target = returnTo || pathname;
    const loginUrl = `/api/auth/login?returnTo=${encodeURIComponent(target)}`;
    router.push(loginUrl);
  }, [router, pathname]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout');
      setUser(null);
      
      const logoutEndpoint = process.env.NEXT_PUBLIC_AUTHING_LOGOUT_ENDPOINT;
      if (!logoutEndpoint) {
        console.error("NEXT_PUBLIC_AUTHING_LOGOUT_ENDPOINT is not set, cannot perform a full OIDC logout. Redirecting home.");
        router.push('/');
        router.refresh();
        return;
      }
      
      const logoutUrl = new URL(logoutEndpoint);
      const postLogoutRedirectUri = new URL(process.env.NEXT_PUBLIC_BASE_URL || window.location.origin).toString();
      logoutUrl.searchParams.set('post_logout_redirect_uri', postLogoutRedirectUri);
      
      window.location.href = logoutUrl.toString();

    } catch (error) {
      console.error('Logout failed', error);
      router.push('/');
      router.refresh();
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
