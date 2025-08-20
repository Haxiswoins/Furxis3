
'use client';

import { createContext, useContext, ReactNode } from 'react';
// import { useUser, useAuthentication } from '@authing/nextjs';

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
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // const { user: authingUser, isLoading: loading } = useUser();
  // const { loginWithRedirect, logout: authingLogout } = useAuthentication();
  const loading = false;
  const authingUser = null;


  const user: CustomUser | null = authingUser ? {
      // uid: authingUser.sub,
      // email: authingUser.email || null,
      // name: authingUser.name || authingUser.preferred_username || null,
      // picture: authingUser.picture || null,
      // isAdmin: authingUser.email === ADMIN_EMAIL,
  } as CustomUser : null;

  const login = async () => {
    // Redirects to Authing's hosted login page
    // await loginWithRedirect();
    alert('登录功能暂时禁用，请在修复依赖问题后重试。');
  };

  const logout = async () => {
    // Redirects to Authing and then back to the application
    // await authingLogout({
    //   returnTo: window.location.origin
    // });
    alert('登出功能暂时禁用。');
  };

  const value = {
    user: null, // Temporarily disable user
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
