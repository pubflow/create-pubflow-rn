import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAuth as usePubflowAuth } from '@pubflow/react-native';
import type { TwoFactorMethod, TwoFactorStartResult, TwoFactorVerifyResult } from '@pubflow/core';
import { usePathname, useRouter } from 'expo-router';

// Define the auth context type
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
  validateSession: () => Promise<{ isValid: boolean; expiresAt?: string }>;
  twoFactorPending: boolean;
  twoFactorMethods: TwoFactorMethod[];
  startTwoFactor: (methodId: string, method: string) => Promise<TwoFactorStartResult>;
  verifyTwoFactor: (methodId: string, code: string) => Promise<TwoFactorVerifyResult>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const pubflowAuth = usePubflowAuth() as any;
  const {
    isAuthenticated,
    isLoading,
    user,
    login: pubflowLogin,
    logout: pubflowLogout,
    validateSession,
    twoFactorPending,
    twoFactorMethods,
    startTwoFactor,
    verifyTwoFactor,
  } = pubflowAuth;
  
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { isValid } = await validateSession();
        setInitialCheckDone(true);
        
        // If not authenticated, redirect to login
        if (!isValid && pathname !== '/login') {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setInitialCheckDone(true);
      }
    };

    checkAuth();
  }, [pathname, router, validateSession]);

  // Login function wrapper
  const login = async (credentials: { email: string; password: string }) => {
    try {
      const result = await pubflowLogin({
        email: credentials.email,
        password: credentials.password,
      });

      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function wrapper
  const logout = async () => {
    try {
      await pubflowLogout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Context value
  const value = {
    isAuthenticated,
    isLoading: isLoading || !initialCheckDone,
    user,
    login,
    logout,
    validateSession,
    twoFactorPending,
    twoFactorMethods,
    startTwoFactor,
    verifyTwoFactor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
