
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
  const [loading, setLoading] = useState(true); // Start with loading true
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user session", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (returnTo?: string) => {
    const finalReturnTo = returnTo || pathname;
    router.push(`/api/auth/authing/login?returnTo=${encodeURIComponent(finalReturnTo)}`);
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null); // Clear user state immediately
      router.push('/'); // Redirect to home page
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
