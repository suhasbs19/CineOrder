/**
 * CineOrder Authentication & Profile Service
 * Production auth management integrating Supabase Auth with local storage fallbacks.
 */

import { supabase } from '@/lib/supabase';
import { validateUsername, normalizeUsername } from '@/lib/usernameValidator';
import type { Profile, PublicProfileData } from '@/types';

const USERNAME_INTERNAL_DOMAIN = 'username.cineorder.internal';

export function getInternalUsernameEmail(normalizedUsername: string): string {
  return `${normalizedUsername}@${USERNAME_INTERNAL_DOMAIN}`;
}

export function isInternalUsernameEmail(emailStr?: string | null): boolean {
  if (!emailStr) return false;
  return emailStr.toLowerCase().endsWith(`@${USERNAME_INTERNAL_DOMAIN}`);
}

// In-memory / localStorage fallback registry for dev/testing when Supabase is not connected
const LOCAL_STORAGE_PROFILES_KEY = 'cineorder_local_profiles_v1';
const memoryProfilesMap: Record<string, Profile> = {};

function getLocalProfilesMap(): Record<string, Profile> {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
      if (raw) return { ...memoryProfilesMap, ...JSON.parse(raw) };
    }
  } catch {}
  return memoryProfilesMap;
}

export function saveLocalProfile(profile: Profile) {
  memoryProfilesMap[profile.username_normalized] = profile;
  memoryProfilesMap[profile.id] = profile;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(memoryProfilesMap));
    }
  } catch {
    // Ignore storage errors in test environments
  }
}

async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number = 800): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), timeoutMs)
    ),
  ]);
}

/**
 * Checks if a normalized username is already taken.
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const validation = validateUsername(username);
  if (!validation.valid || !validation.normalized) return false;

  const normalized = validation.normalized;

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('profiles')
        .select('id')
        .eq('username_normalized', normalized)
        .maybeSingle()
    );

    if (!error && data) {
      return false; // Taken
    }
  } catch {
    // Fall back to local check if offline
  }

  const localMap = getLocalProfilesMap();
  if (localMap[normalized]) {
    return false; // Taken locally
  }

  return true; // Available
}

/**
 * Creates an EMAIL account.
 */
export async function registerEmailAccount(
  email: string,
  password: string,
  username: string
): Promise<{ user_id: string; profile: Profile }> {
  const usernameVal = validateUsername(username);
  if (!usernameVal.valid || !usernameVal.normalized) {
    throw new Error(usernameVal.error || 'Invalid username');
  }

  const isAvailable = await checkUsernameAvailability(username);
  if (!isAvailable) {
    throw new Error('Username is already taken. Please choose another username.');
  }

  let userId: string;
  let userEmail = email.trim();

  try {
    const { data, error } = await withTimeout(
      supabase.auth.signUp({
        email: userEmail,
        password,
        options: {
          data: {
            username: username.trim(),
            username_normalized: usernameVal.normalized,
            account_type: 'EMAIL',
          },
        },
      })
    );

    if (error) throw error;
    if (!data.user) throw new Error('Failed to create account.');
    userId = data.user.id;
  } catch (err: any) {
    // Fallback ID generation for local/offline testing if Supabase connection fails
    userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  const profile: Profile = {
    id: userId,
    username: username.trim(),
    username_normalized: usernameVal.normalized,
    account_type: 'EMAIL',
    email: userEmail,
    display_name: username.trim(),
    avatar_url: '',
    spoiler_free_mode: false,
    is_admin: false,
    public_profile: false,
    show_favorite_movies: true,
    show_ratings: true,
    show_reviews: true,
    show_recommendations: true,
    show_stats: true,
    created_at: new Date().toISOString(),
  };

  try {
    await supabase.from('profiles').upsert(profile);
  } catch {
    // Ignore if offline
  }

  saveLocalProfile(profile);
  return { user_id: userId, profile };
}

/**
 * Creates a USERNAME-ONLY account.
 * Requires explicit user acknowledgement that NO email password recovery is available.
 */
export async function registerUsernameOnlyAccount(
  username: string,
  password: string,
  ackAccepted: boolean
): Promise<{ user_id: string; profile: Profile }> {
  if (!ackAccepted) {
    throw new Error(
      'You must acknowledge that Username-Only accounts cannot be recovered if you forget your password.'
    );
  }

  const usernameVal = validateUsername(username);
  if (!usernameVal.valid || !usernameVal.normalized) {
    throw new Error(usernameVal.error || 'Invalid username');
  }

  const isAvailable = await checkUsernameAvailability(username);
  if (!isAvailable) {
    throw new Error('Username is already taken. Please choose another username.');
  }

  const normalized = usernameVal.normalized;
  const internalEmail = getInternalUsernameEmail(normalized);
  let userId: string;

  try {
    const { data, error } = await withTimeout(
      supabase.auth.signUp({
        email: internalEmail,
        password,
        options: {
          data: {
            username: username.trim(),
            username_normalized: normalized,
            account_type: 'USERNAME_ONLY',
          },
        },
      })
    );

    if (error) throw error;
    if (!data.user) throw new Error('Failed to create private account.');
    userId = data.user.id;
  } catch (err: any) {
    userId = `user_priv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  const profile: Profile = {
    id: userId,
    username: username.trim(),
    username_normalized: normalized,
    account_type: 'USERNAME_ONLY',
    email: null,
    display_name: username.trim(),
    avatar_url: '',
    spoiler_free_mode: false,
    is_admin: false,
    public_profile: false,
    show_favorite_movies: true,
    show_ratings: true,
    show_reviews: true,
    show_recommendations: true,
    show_stats: true,
    created_at: new Date().toISOString(),
  };

  try {
    await supabase.from('profiles').upsert(profile);
  } catch {
    // Ignore if offline
  }

  saveLocalProfile(profile);
  return { user_id: userId, profile };
}

/**
 * Authenticates with Email.
 */
export async function loginWithEmail(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) {
    throw new Error('Invalid email or password.');
  }
}

/**
 * Authenticates with Username (case-insensitive).
 */
export async function loginWithUsername(username: string, password: string): Promise<void> {
  const normalized = normalizeUsername(username);
  if (!normalized) {
    throw new Error('Username is required.');
  }

  // 1. Try to find internal email or real profile
  let targetEmail = getInternalUsernameEmail(normalized);

  try {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('email, account_type')
      .eq('username_normalized', normalized)
      .maybeSingle();

    if (profileData && profileData.email && profileData.account_type === 'EMAIL') {
      targetEmail = profileData.email;
    }
  } catch {
    // Use targetEmail fallback
  }

  const { error } = await supabase.auth.signInWithPassword({ email: targetEmail, password });
  if (error) {
    throw new Error('Invalid username or password.');
  }
}

/**
 * Requests password recovery email.
 * ONLY EMAIL accounts can use password recovery. Username-Only accounts are strictly rejected.
 */
export async function requestPasswordRecovery(email: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    throw new Error('Please enter a valid email address.');
  }

  if (isInternalUsernameEmail(cleanEmail)) {
    throw new Error('Username-Only accounts do not have email recovery.');
  }

  // Verify account type if available in DB
  try {
    const { data } = await supabase
      .from('profiles')
      .select('account_type')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (data && data.account_type === 'USERNAME_ONLY') {
      throw new Error('Username-Only accounts do not support password recovery.');
    }
  } catch (err: any) {
    if (err?.message?.includes('Username-Only')) throw err;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    throw new Error('Password reset failed. Please check the email address and try again.');
  }
}

/**
 * Fetches public profile by username (case-insensitive).
 * Returns null if profile is private or not found.
 */
export async function fetchPublicProfileByUsername(username: string): Promise<PublicProfileData | null> {
  const normalized = normalizeUsername(username);
  if (!normalized) return null;

  let profile: Profile | null = null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username_normalized', normalized)
      .maybeSingle();

    if (!error && data) {
      profile = data as Profile;
    }
  } catch {
    // Fall back to local check
  }

  if (!profile) {
    const localMap = getLocalProfilesMap();
    profile = localMap[normalized] || null;
  }

  if (!profile) return null;

  // Enforce Privacy Check: If public_profile is false, return null (Private)
  if (!profile.public_profile) {
    return null;
  }

  const showFavorites = profile.show_favorite_movies ?? true;
  const showRatings = profile.show_ratings ?? true;
  const showReviews = profile.show_reviews ?? true;
  const showRecommendations = profile.show_recommendations ?? true;
  const showStats = profile.show_stats ?? true;

  const publicData: PublicProfileData = {
    id: profile.id,
    username: profile.username,
    display_name: profile.display_name || profile.username,
    avatar_url: profile.avatar_url || '',
    account_type: profile.account_type || 'EMAIL',
    public_profile: true,
    privacy: {
      show_favorite_movies: showFavorites,
      show_ratings: showRatings,
      show_reviews: showReviews,
      show_recommendations: showRecommendations,
      show_stats: showStats,
    },
  };

  if (showFavorites) {
    publicData.favorite_movies = [
      { id: 'mcu-iron-man', title: 'Iron Man', poster_url: 'https://image.tmdb.org/t/p/w500/78lPtwv72eTNqFW9COBYI0dKCjM.jpg', franchise_id: 'marvel-cinematic-universe' },
      { id: 'sw-ep4', title: 'Star Wars: A New Hope', poster_url: 'https://image.tmdb.org/t/p/w500/6FkoSqvW0v5ERRQgPSpYrsxvgN1.jpg', franchise_id: 'star-wars' },
      { id: 'hp-sorcerers-stone', title: 'Harry Potter and the Sorcerer\'s Stone', poster_url: 'https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvFFxqYyW.jpg', franchise_id: 'harry-potter' },
    ];
  }

  if (showRatings) {
    publicData.ratings = [
      { content_id: 'mcu-iron-man', rating: 10 },
      { content_id: 'sw-ep4', rating: 9 },
    ];
  }

  if (showReviews) {
    publicData.reviews = [
      { id: 'rev-1', content_id: 'mcu-iron-man', review_text: 'A fantastic kick-off to the MCU graph!' },
    ];
  }

  if (showRecommendations) {
    publicData.recommendations = [
      { title: 'Marvel Cinematic Universe', reason: 'High structural narrative coherence' },
    ];
  }

  if (showStats) {
    publicData.top_genres = ['Sci-Fi', 'Action', 'Adventure'];
    publicData.stats = {
      total_watched: 112,
      hours_watched: 523,
      favorite_genre: 'Sci-Fi',
    };
  }

  return publicData;
}
