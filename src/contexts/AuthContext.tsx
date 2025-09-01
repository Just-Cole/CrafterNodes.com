
"use client";

import * as React from 'react';
import { useSession } from 'next-auth/react';

// Define the shape of your user object
interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  permissions?: string[]; 
}

// Define the context shape
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

// Create the context
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Define the provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  // In a real app, you might fetch more detailed user permissions here
  // For now, we'll assign permissions based on the session
  const user: User | null = session?.user ? {
    ...session.user,
    // Placeholder permissions - customize as needed
    permissions: ['view_dashboard', 'create_servers', 'edit_configs']
  } : null;

  const value = { user, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Define the custom hook to use the context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
