import { useEffect, useState } from 'react';
import { supabase, retryAuth } from './supabase';
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  role: 'patient' | 'nurse';
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Get initial session with retry logic
        const { data: { session } } = await retryAuth(() => 
          supabase.auth.getSession()
        );

        if (!mounted) return;

        setUser(session?.user ?? null);
        
        if (session?.user) {
          await getProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('Auth initialization error:', err);
        setError(err as Error);
        setLoading(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setUser(session?.user ?? null);
        
        if (session?.user) {
          await getProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    initialize();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setError(null);
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  return { user, profile, loading, error };
}