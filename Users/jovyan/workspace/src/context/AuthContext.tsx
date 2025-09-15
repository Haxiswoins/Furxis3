

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
    // Point to our backend route which then redirects to Authing
    const loginUrl = `/api/auth/login?returnTo=${encodeURIComponent(target)}`;
    router.push(loginUrl);
  }, [router, pathname]);

  const logout = async () => {
    try {
      // Step 1: Clear the local server session
      await fetch('/api/auth/logout');
      setUser(null); // Immediately update UI to reflect logout
      
      // Step 2: Redirect to Authing's end session endpoint to clear the SSO session.
      // This is the standard OIDC way to log out properly.
      const issuer = process.env.AUTHING_ISSUER || '';
      if (!issuer) {
        console.error("AUTHING_ISSUER is not set, cannot perform a full logout.");
        router.push('/'); // Fallback to just redirecting home
        router.refresh();
        return;
      }

      const postLogoutRedirectUri = new URL('/', window.location.origin).toString();
      const logoutUrl = new URL('/oidc/session/end', issuer);
      logoutUrl.searchParams.set('post_logout_redirect_uri', postLogoutRedirectUri);
      
      // Redirect the user to the Authing logout page. Authing will then redirect back to our home page.
      window.location.href = logoutUrl.toString();

    } catch (error) {
      console.error('Logout failed', error);
      // Even if logout fails, try to redirect home
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
