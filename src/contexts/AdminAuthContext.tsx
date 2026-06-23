import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LocalDB } from '@/services/LocalDatabase';
import { supabase } from '@/lib/supabase';

interface User {
  email: string;
}

interface AdminAuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
});

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session: supaSession } } = await supabase.auth.getSession();
      const localSession = LocalDB.getSession();
      
      // Si hay sesión local pero no hay sesión en Supabase (o viceversa), o si los IDs no coinciden
      if (!supaSession && localSession) {
        await LocalDB.logout();
        setUser(null);
        setIsAdmin(false);
      } else if (localSession) {
        setUser(localSession.user);
        setIsAdmin(localSession.isAdmin);
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        LocalDB.logout();
        setUser(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await LocalDB.login(email, password);
    if (error) return { error };
    
    setUser(data.user);
    setIsAdmin(data.isAdmin);
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await LocalDB.signUp(email, password);
    if (error) return { error };
    // After signup, try to log them in automatically
    return signIn(email, password);
  };

  const signOut = async () => {
    LocalDB.logout();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ user, isAdmin, loading, signIn, signUp, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
