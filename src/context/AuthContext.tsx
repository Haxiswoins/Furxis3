
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

// --- Admin Test Mode ---
// This is a mock admin user for testing purposes.
const mockAdminUser: CustomUser = {
    uid: 'admin_test_uid',
    email: 'admin_test@example.com',
    name: '测试管理员',
    picture: 'https://placehold.co/100x100.png',
    isAdmin: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // In test mode, immediately set the mock admin user.
    setUser(mockAdminUser);
    setLoading(false);
  }, []);

  const login = (returnTo?: string) => {
    // In test mode, login does nothing as user is already mocked.
    console.log("Login function called in test mode. No action taken.");
    const targetUrl = returnTo || pathname;
    router.push(targetUrl);
  };

  const logout = async () => {
    // In test mode, logout simulates clearing the user.
    console.log("Logout function called in test mode.");
    setUser(null);
    setLoading(false);
    router.push('/home'); 
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
