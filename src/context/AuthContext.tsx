
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
  // --- MOCK USER ---
  // To revert to real authentication, uncomment the original state and useEffect hooks below,
  // and remove or comment out this mock user section.
  const [user, setUser] = useState<CustomUser | null>({
    uid: 'mock-admin-uid',
    email: 'admin-mock@suitopia.club',
    name: '临时管理员',
    picture: null,
    isAdmin: true,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  /*
  // --- ORIGINAL AUTH LOGIC ---
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
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
  */

  const login = (returnTo?: string) => {
    // Mock login does nothing, user is already an admin.
    console.log("Login function called, but using mock admin. Redirecting to dashboard.");
    router.push('/admin/dashboard');
  };

  const logout = async () => {
    // Mock logout also does nothing, to maintain the admin state.
    console.log("Logout function called, but using mock admin. To truly log out, restore original AuthContext logic.");
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
