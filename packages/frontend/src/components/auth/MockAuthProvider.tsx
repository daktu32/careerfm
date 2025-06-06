'use client';

import React, { createContext, useContext, useState } from 'react';

interface User {
  userId: string;
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(email: string) {
    setLoading(true);
    // Mock authentication
    setTimeout(() => {
      setUser({
        userId: 'mock-user-id',
        username: email.split('@')[0],
        email: email,
      });
      setLoading(false);
    }, 1000);
  }

  async function signOut() {
    setUser(null);
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useMockAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
}