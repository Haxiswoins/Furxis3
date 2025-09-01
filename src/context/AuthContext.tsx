
'use client';

import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { CustomUser } from '@/types';

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  login: (returnTo?: string) => void;
  logout:
 
() => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- MOCK DATA ---
const mockAdminUser: CustomUser = {
    uid: 'mock-admin-uid',
    email: 'admin-test@suitopia.club',
    name: '测试管理员',
    picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
    isAdmin: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(mockAdminUser);
  const [loading, setLoading] = useState(false); // Set loading to false as we are not fetching
  const router = useRouter();
  const pathname = usePathname();

  // The real fetchUser is commented out for mock mode.
  // const fetchUser = useCallback(async () => {
  //   try {
  //     const res = await fetch('/api/auth/me');
  //     if (res.ok) {
  //       const data = await res.json();
  //       setUser(data.user);
  //     } else {
  //       setUser(null);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch user session", error);
  //     setUser(null);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   fetchUser();
  // }, [fetchUser]);

  const login = (returnTo?: string) => {
    console.log("Mock login requested. Already logged in as admin.");
    // In mock mode, we just ensure the user is set and loading is false.
    setUser(mockAdminUser);
    setLoading(false);
    router.push(returnTo || '/admin/dashboard');
  };

  const logout = async () => {
     console.log("Mock logout requested.");
     setUser(null); // Clear the user
     router.push('/'); // Redirect to home page
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
