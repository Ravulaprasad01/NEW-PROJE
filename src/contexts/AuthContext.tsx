import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client'; // Use the existing Supabase client
import LoginModal from '../components/LoginModal';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (isOpen: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      authListener.unsubscribe();
    };
  }, []);

  const login = () => {
    setIsLoginModalOpen(true);
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    }
    setLoading(false);
  };

  const value = {
    user,
    session,
    loading,
    login,
    logout,
    isLoginModalOpen,
    setIsLoginModalOpen,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <LoginModal isOpen={isLoginModalOpen} onOpenChange={setIsLoginModalOpen} />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
