
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useToast } from './use-toast';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
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

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      toast({ title: "Welcome!", description: "You've successfully signed in." });
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      toast({ variant: "destructive", title: "Sign In Failed", description: "Could not sign in with Google. Please try again." });
    } finally {
        setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed Out", description: "You've been successfully signed out." });
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({ variant: "destructive", title: "Sign Out Failed", description: "Could not sign out. Please try again." });
    }
  };

  const value = { user, loading, signInWithGoogle, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
