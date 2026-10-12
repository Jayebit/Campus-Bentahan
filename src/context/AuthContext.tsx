import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  switchDemoUser: (userId: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'campus_bentahan_token';

export const DEMO_USERS = [
  { id: 'usr-student-1', name: 'Juan Dela Cruz', role: 'STUDENT', badge: 'Student (BS IT)', email: 'juan.delacruz@university.edu' },
  { id: 'usr-student-2', name: 'Maria Santos', role: 'STUDENT', badge: 'Student (BS CE)', email: 'maria.santos@university.edu' },
  { id: 'usr-faculty-1', name: 'Dr. Elena Gomez', role: 'FACULTY', badge: 'Faculty (Comp Sci)', email: 'elena.gomez@university.edu' },
  { id: 'usr-admin-1', name: 'Prof. David Vance', role: 'ADMIN', badge: 'Admin (Safety & Affairs)', email: 'david.vance@university.edu' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem(TOKEN_KEY) || localStorage.getItem('campus_market_token')
  );
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (err) {
      console.warn('Session expired or invalid token');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('campus_market_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY) || localStorage.getItem('campus_market_token');
    if (storedToken) {
      refreshUser();
    } else {
      // First-time users see the dedicated Account Creation & Login page first
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, pass);
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('campus_market_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const res = await api.switchDemoUser(userId);
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: any) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        switchDemoUser,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
