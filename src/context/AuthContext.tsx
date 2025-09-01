
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

// --- MOCK IMPLEMENTATION FOR ADMIN TESTING ---

const mockAdminUser: CustomUser = {
  uid: 'mock-admin-uid-for-testing',
  email: 'admin-test-mode@example.com',
  name: '测试管理员 (临时)',
  picture: 'https://placehold.co/100x100/orange/white?text=A',
  isAdmin: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // In this test mode, we just set the mock admin user and stop loading.
    setUser(mockAdminUser);
    setLoading(false);
  }, []);

  const login = (returnTo?: string) => {
    // Mock login does nothing.
    console.log("Login function called in test mode. No action taken.");
  };

  const logout = async () => {
    // Mock logout just clears the user state.
    console.log("Logout function called in test mode.");
    setUser(null);
    router.push('/');
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
