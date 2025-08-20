
'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

const ADMIN_EMAIL = 'haxiswoins@qq.com';

interface CustomUser {
    uid: string;
    email: string | null;
    name: string | null;
    picture: string | null;
    isAdmin?: boolean;
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  login: (returnTo?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This is a mock function. In a real app, you'd fetch this from your backend.
async function fetchUserSession(): Promise<CustomUser | null> {
    // This is where you would make an API call to your backend to verify the session
    // For now, we'll return null as we don't have a real session management
    return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkSession = async () => {
        setLoading(true);
        // We'll replace this with a mock.
        // In a real scenario with Authing, you'd have a server-side endpoint
        // that validates the session cookie and returns user data.
        const sessionUser = await fetchUserSession(); 
        setUser(sessionUser);
        setLoading(false);
    };
    checkSession();
  }, []);

  const login = (returnTo?: string) => {
    let path = '/api/auth/authing/login';
    const finalReturnTo = returnTo || window.location.pathname + window.location.search;
    const params = new URLSearchParams();
    params.set('returnTo', finalReturnTo);
    router.push(`${path}?${params.toString()}`);
  };

  const logout = () => {
    // In a real app, this would call a backend endpoint to clear the session cookie.
    const logoutUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL || window.location.origin);
    
    // For now, we just clear the user state and redirect.
    setUser(null);
    router.push(logoutUrl.toString());
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
