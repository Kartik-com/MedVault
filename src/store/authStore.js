import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      if (data.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        set({ user: profile });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({ user: null });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        set({ user: profile, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ user: null, loading: false });
    }
  },
}));