/**
 * CineOrder Username Validation & Normalization System
 * Enforces case-insensitive uniqueness, formatting rules, and route security.
 */

export const RESERVED_USERNAMES = new Set<string>([
  'admin',
  'administrator',
  'auth',
  'login',
  'signup',
  'register',
  'api',
  'system',
  'security',
  'settings',
  'profile',
  'profiles',
  'help',
  'support',
  'about',
  'terms',
  'privacy',
  'upcoming',
  'assistant',
  'planner',
  'dashboard',
  'search',
  'movie',
  'franchise',
  'u',
  'user',
  'cineorder',
  'official',
  'root',
  'null',
  'undefined',
]);

export interface UsernameValidationResult {
  valid: boolean;
  error?: string;
  normalized?: string;
}

/**
 * Normalizes username for case-insensitive comparison and storage.
 */
export function normalizeUsername(username: string): string {
  return (username || '').trim().toLowerCase();
}

/**
 * Validates username string against CineOrder rules:
 * - Length: 3 to 24 characters
 * - Characters: Alphanumeric, underscores, hyphens
 * - Cannot start/end with hyphen or underscore
 * - Cannot be a reserved system or routing word
 */
export function validateUsername(username: string): UsernameValidationResult {
  const trimmed = (username || '').trim();

  if (!trimmed) {
    return { valid: false, error: 'Username is required.' };
  }

  if (trimmed.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters long.' };
  }

  if (trimmed.length > 24) {
    return { valid: false, error: 'Username cannot exceed 24 characters.' };
  }

  const validCharRegex = /^[a-zA-Z0-9_-]+$/;
  if (!validCharRegex.test(trimmed)) {
    return {
      valid: false,
      error: 'Username can only contain letters, numbers, underscores, and hyphens.',
    };
  }

  if (/^[-_]|[-_]$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Username cannot start or end with a hyphen or underscore.',
    };
  }

  const normalized = normalizeUsername(trimmed);
  if (RESERVED_USERNAMES.has(normalized)) {
    return {
      valid: false,
      error: `'${trimmed}' is a reserved system keyword. Please choose a different username.`,
    };
  }

  return { valid: true, normalized };
}
