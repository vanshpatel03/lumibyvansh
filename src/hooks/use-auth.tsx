
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from './use-toast';
import type { AuthFormValues } from '@/components/email-auth';


type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithEmail: (data: AuthFormValues) => Promise<void>;
  signUpWithEmail: (data: AuthFormValues) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithEmail = async ({ email, password }: AuthFormValues) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Welcome back!", description: "You've successfully signed in." });
    } catch (error: any) {
      console.error("Error signing in with email: ", error);
      toast({ variant: "destructive", title: "Sign In Failed", description: error.message || "Could not sign in. Please check your credentials." });
      throw error; // Re-throw to be caught by form handler
    }
  };

  const signUpWithEmail = async ({ email, password }: AuthFormValues) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({ title: "Welcome!", description: "Your account has been created successfully." });
    } catch (error: any) {
      console.error("Error signing up with email: ", error);
      toast({ variant: "destructive", title: "Sign Up Failed", description: error.message || "Could not create an account. Please try again." });
      throw error; // Re-throw to be caught by form handler
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed Out", description: "You've been successfully signed out." });
    } catch (error: any) {
      console.error("Error signing out: ", error);
      toast({ variant: "destructive", title: "Sign Out Failed", description: error.message || "Could not sign out. Please try again." });
    }
  };

  const value = { user, loading, signInWithEmail, signUpWithEmail, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
