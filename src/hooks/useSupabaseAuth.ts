
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useSupabaseAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  
  useEffect(() => {
    // First, check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setState({
          user: session?.user ?? null,
          isAuthenticated: !!session?.user,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error getting initial session:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };
    
    getInitialSession();
    
    // Then, set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setState({
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      });
    });
    
    // Clean up the subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return state;
};
