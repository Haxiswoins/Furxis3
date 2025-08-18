
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  signInWithCustomToken,
  User as FirebaseUser,
} from 'firebase/auth';
import { app } from '@/lib/firebase'; 

const ADMIN_EMAIL = 'haxiswoins@qq.com';

interface CustomUser {
    uid: string;
    email: string | null;
    isAdmin?: boolean;
}

interface AuthContextType {
  user: CustomUser | null;
  loading: boolean;
  register: (email: string, pass: string) => Promise<any>;
  login: (email: string, pass: string) => Promise<CustomUser>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const auth = getAuth(app);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const customUser: CustomUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          isAdmin: firebaseUser.email === ADMIN_EMAIL,
        };
        setUser(customUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const register = async (email: string, pass: string): Promise<any> => {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
    });

    const data = await response.json();

    if (!response.ok) {
        const error: any = new Error(data.error || 'Registration failed.');
        error.code = data.code || 'auth/unknown-error';
        throw error;
    }

    // After a successful server-side registration, we attempt a server-side login
    // to get a custom token, making the initial sign-in reliable in China.
    await login(email, pass);
    
    return data;
  };

  const login = async (email: string, pass: string): Promise<CustomUser> => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
    });

    const data = await response.json();

    if (!response.ok) {
        const error: any = new Error(data.error || 'Login failed.');
        error.code = data.code || 'auth/unknown-error';
        throw error;
    }
    
    // Sign in on the client using the custom token from the server
    const userCredential = await signInWithCustomToken(auth, data.token);
    
    const loggedInUser: CustomUser = {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      isAdmin: data.user.isAdmin
    };

    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    return signOut(auth);
  };
  
  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    resetPassword,
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
