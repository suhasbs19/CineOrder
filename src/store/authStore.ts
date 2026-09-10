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
  createOrUpdateGoogleProfile,
  checkProfileExists,
  saveLocalProfile,
} from '@/lib/authService';

const SESSION_STORAGE_KEY = 'cineorder_active_user_session';

function withTimeout<T>(promise: PromiseLike<T>, ms = 600): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

function saveActiveSessionLocally(user: User | null, session: Session | null) {
  try {
    if (typeof localStorage !== 'undefined') {
      if (user) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ user, session }));
      } else {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
  } catch {}
}

function loadActiveSessionLocally(): { user: User; session: Session } | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {}
  return null;
}

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
  signInWithGoogle: (intent?: 'login' | 'signup') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  fetchProfile: (userId: string) => Promise<Profile | null>;
  setSessionAndProfile: (user: User, session: Session | null, profile: Profile) => void;
  completeOnboarding: (username: string, customUser?: User | null) => Promise<Profile>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await withTimeout(supabase.auth.getSession(), 600);
      if (session?.user) {
        const profile = await checkProfileExists(session.user.id);
        if (profile && profile.username) {
          set({ user: session.user, session, profile });
          saveActiveSessionLocally(session.user, session);
        } else {
          // User authenticated with provider but has not completed CineOrder registration
          set({ user: null, session: null, profile: null });
          saveActiveSessionLocally(null, null);
        }
      } else {
        const local = loadActiveSessionLocally();
        if (local?.user) {
          const profile = await checkProfileExists(local.user.id);
          if (profile && profile.username) {
            set({ user: local.user, session: local.session, profile });
          } else {
            set({ user: null, session: null, profile: null });
            saveActiveSessionLocally(null, null);
          }
        }
      }
    } catch (error) {
      console.warn('Auth initialization fallback:', error);
      const local = loadActiveSessionLocally();
      if (local?.user) {
        const profile = await checkProfileExists(local.user.id);
        if (profile && profile.username) {
          set({ user: local.user, session: local.session, profile });
        } else {
          set({ user: null, session: null, profile: null });
          saveActiveSessionLocally(null, null);
        }
      }
    } finally {
      set({ initialized: true });
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        saveActiveSessionLocally(null, null);
        set({ user: null, session: null, profile: null });
        return;
      }

      if (session?.user) {
        const profile = await checkProfileExists(session.user.id);
        if (profile && profile.username) {
          set({ user: session.user, session, profile });
          saveActiveSessionLocally(session.user, session);
        }
      }
    });
  },

  setSessionAndProfile: (user, session, profile) => {
    saveActiveSessionLocally(user, session);
    set({ user, session, profile });
  },

  completeOnboarding: async (username: string, customUser?: User | null) => {
    const user = customUser || get().user;
    if (!user) {
      throw new Error('You must be signed in to choose a username.');
    }

    set({ loading: true });
    try {
      const profile = await createOrUpdateGoogleProfile(user, username);
      set({ user, profile });
      saveActiveSessionLocally(user, get().session);
      return profile;
    } finally {
      set({ loading: false });
    }
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

  signInWithGoogle: async (intent: 'login' | 'signup' = 'login') => {
    set({ loading: true });
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('cineorder_auth_intent', intent);
      }

      const origin = typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://cineorder.vercel.app';
      const redirectUrl = `${origin}/auth/callback?intent=${intent}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem('cineorder_auth_intent');
      }
      await supabase.auth.signOut();
    } catch {
      // Ignore offline error
    }
    saveActiveSessionLocally(null, null);
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

    const updatedProfile = profile ? { ...profile, ...updates } : null;
    if (updatedProfile) {
      saveLocalProfile(updatedProfile);
      set({ profile: updatedProfile });
    }

    try {
      await withTimeout(
        supabase
          .from('profiles')
          .update(updates)
          .eq('id', targetId),
        600
      );
    } catch (err) {
      console.warn('[authStore] Update profile remote sync error:', err);
    }
  },

  fetchProfile: async (userId) => {
    const profile = await checkProfileExists(userId);
    if (profile) {
      set({ profile });
      return profile;
    }
    return null;
  },
}));

if (typeof window !== 'undefined') {
  (window as any).__AUTH_STORE__ = useAuthStore;
}
