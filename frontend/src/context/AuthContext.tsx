import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthResponse } from '../types';
import {
  getCurrentUser,
  loginUser,
  registerUser,
  logoutUser as apiLogout,
} from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    full_name: string;
    age: number;
    gender: string;
    height_cm?: number;
    weight_kg?: number;
    occupation?: string;
  }) => Promise<void>;
  logout: () => void;
  loginDemo: (customEmail?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const initAuth = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('lifesync_token');
    if (token) {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.warn('Stored token invalid or expired. Resetting auth state.', err);
        localStorage.removeItem('lifesync_token');
        setUser(null);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res: AuthResponse = await loginUser(credentials);
      setUser(res.user);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid email or password.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    full_name: string;
    age: number;
    gender: string;
    height_cm?: number;
    weight_kg?: number;
    occupation?: string;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res: AuthResponse = await registerUser(payload);
      setUser(res.user);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Email may already be in use.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async (customEmail?: string) => {
    setIsLoading(true);
    setError(null);
    const targetEmail = customEmail || 'badriprasaddash849@gmail.com';
    try {
      // Try targeted demo user first (or Badriprasad Dash)
      const res = await loginUser({
        email: targetEmail,
        password: 'DemoPassword123!',
      });
      setUser(res.user);
    } catch {
      try {
        // Fallback to student_mca
        const fallback = await loginUser({
          email: 'student_mca@college.edu',
          password: 'StudentPassword123!',
        });
        setUser(fallback.user);
      } catch (err: any) {
        const msg = err.response?.data?.detail || 'Could not initialize demo profile.';
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.warn('Failed to refresh user profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        loginDemo,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
