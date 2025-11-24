'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  AuthError
} from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // Cast to AuthError to get proper error codes
      const authError = error as AuthError;
      
      // Re-throw with a clean error message
      switch (authError.code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
        case 'auth/invalid-login-credentials':
          throw new Error('INVALID_PASSWORD');
        case 'auth/user-not-found':
          throw new Error('USER_NOT_FOUND');
        case 'auth/too-many-requests':
          throw new Error('TOO_MANY_ATTEMPTS');
        default:
          throw new Error('AUTH_FAILED');
      }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}