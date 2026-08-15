import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
import type { User, Session } from '@supabase/supabase-js';
import {
  registerEmailAccount,
  registerUsernameOnlyAccount,
  loginWithEmail,
  loginWithUsername,
  requestPasswordRecovery,
} from '@/lib/authService';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signUpEmail: (email: string, password: string, username: string) => Promise<void>;
  signUpUsernameOnly: (username: string, password: string, ackAccepted: boolean) => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signInUsername: (username: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ user: session.user, session });
        await get().fetchProfile(session.user.id);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      set({ initialized: true });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ user: session?.user ?? null, session });
      if (session?.user) {
        await get().fetchProfile(session.user.id);
      } else {
        set({ profile: null });
      }
    });
  },

  signUpEmail: async (email, password, username) => {
    set({ loading: true });
    try {
      const { profile } = await registerEmailAccount(email, password, username);
      set({ profile });
    } finally {
      set({ loading: false });
    }
  },

  signUpUsernameOnly: async (username, password, ackAccepted) => {
    set({ loading: true });
    try {
      const { profile } = await registerUsernameOnlyAccount(username, password, ackAccepted);
      set({ profile });
    } finally {
      set({ loading: false });
    }
  },

  signInEmail: async (email, password) => {
    set({ loading: true });
    try {
      await loginWithEmail(email, password);
    } finally {
      set({ loading: false });
    }
  },

  signInUsername: async (username, password) => {
    set({ loading: true });
    try {
      await loginWithUsername(username, password);
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email, password, username) => {
    return get().signUpEmail(email, password, username);
  },

  signIn: async (email, password) => {
    return get().signInEmail(email, password);
  },

  signInWithGoogle: async () => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Ignore offline error
    }
    set({ user: null, session: null, profile: null });
  },

  resetPassword: async (email) => {
    await requestPasswordRecovery(email);
  },

  updateProfile: async (updates) => {
    const profile = get().profile;
    const user = get().user;

    const targetId = profile?.id || user?.id;
    if (!targetId) return;

    try {
      await supabase
        .from('profiles')
        .update(updates)
        .eq('id', targetId);
    } catch {
      // Ignore if offline
    }

    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    }));
  },

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        set({ profile: data as Profile });
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
    }
  },
}));
