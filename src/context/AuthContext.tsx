
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
    // --- ADMIN TEST MODE ---
    // This simulates a logged-in admin user for testing purposes.
    // Ensure this is reverted to the original fetch('/api/auth/me') logic before deployment.
    setUser({
        uid: 'admin_test_user_001',
        email: 'admin@test.com',
        name: '测试管理员',
        picture: null,
        isAdmin: true,
    });
    setLoading(false);
    // --- END ADMIN TEST MODE ---
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback((returnTo?: string) => {
    const target = returnTo || pathname;
    const loginUrl = new URL('/api/auth/authing/login', window.location.origin);
    loginUrl.searchParams.set('returnTo', target);
    router.push(loginUrl.toString());
  }, [router, pathname]);

  const logout = async () => {
    try {
      await fetch('/api/auth/logout');
      setUser(null);
      // Redirect to home page after logout
      router.push('/home');
    } catch (error) {
      console.error('Logout failed', error);
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
