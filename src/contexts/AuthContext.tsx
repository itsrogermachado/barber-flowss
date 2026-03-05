import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Membership {
  id: string;
  shop_id: string;
  role: string;
  barber_id: string | null;
  shops: { id: string; name: string; slug: string; onboarding_completed: boolean; is_published: boolean } | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  membership: Membership | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshMembership: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  membership: null,
  loading: true,
  signOut: async () => {},
  refreshMembership: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMembership = async (userId: string) => {
    const { data } = await supabase
      .from('memberships')
      .select('id, shop_id, role, barber_id, shops(id, name, slug, onboarding_completed, is_published)')
      .eq('user_id', userId)
      .limit(1)
      .single();
    setMembership(data as unknown as Membership);
  };

  const refreshMembership = async () => {
    if (user) await fetchMembership(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchMembership(session.user.id), 0);
      } else {
        setMembership(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMembership(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setMembership(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, membership, loading, signOut, refreshMembership }}>
      {children}
    </AuthContext.Provider>
  );
};
