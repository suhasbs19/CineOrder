// ─── TMDb Response Cache ────────────────────────────────────
// In-memory + localStorage caching with TTL, LRU eviction, and schema versioning.
// Reduces TMDb API calls dramatically across page navigations.

const CACHE_VERSION = 'v3_strict_validation';
const CACHE_PREFIX = `cineorder-tmdb-${CACHE_VERSION}:`;
const MAX_CACHE_BYTES = 4 * 1024 * 1024; // 4 MB soft limit

interface CacheEntry<T = unknown> {
  data: T;
  expiry: number; // epoch ms
  accessedAt: number;
}

// In-memory map mirrors localStorage for instant reads
const memoryCache = new Map<string, CacheEntry>();

// ─── Helpers ────────────────────────────────────────────────

function lsKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

function now(): number {
  return Date.now();
}

// ─── Core API ───────────────────────────────────────────────

/**
 * Retrieve a cached value. Returns `undefined` if missing or expired.
 */
export function cacheGet<T>(key: string): T | undefined {
  // 1. Check memory cache first (fast path)
  const mem = memoryCache.get(key);
  if (mem) {
    if (mem.expiry > now()) {
      mem.accessedAt = now();
      return mem.data as T;
    }
    memoryCache.delete(key);
    try { localStorage.removeItem(lsKey(key)); } catch { /* noop */ }
    return undefined;
  }

  // 2. Fall back to localStorage
  try {
    const raw = localStorage.getItem(lsKey(key));
    if (!raw) return undefined;

    const entry: CacheEntry<T> = JSON.parse(raw);
    if (entry.expiry <= now()) {
      localStorage.removeItem(lsKey(key));
      return undefined;
    }

    entry.accessedAt = now();
    memoryCache.set(key, entry as CacheEntry);
    return entry.data;
  } catch {
    return undefined;
  }
}

/**
 * Store a value in the cache with a TTL (in milliseconds).
 */
export function cacheSet<T>(key: string, data: T, ttlMs = 60 * 60 * 1000): void {
  const entry: CacheEntry<T> = {
    data,
    expiry: now() + ttlMs,
    accessedAt: now(),
  };

  memoryCache.set(key, entry as CacheEntry);

  try {
    const serialized = JSON.stringify(entry);
    evictIfNeeded(serialized.length);
    localStorage.setItem(lsKey(key), serialized);
  } catch {
    // Storage full or unavailable — memory cache still works
  }
}

/**
 * Remove a single cache entry.
 */
export function cacheRemove(key: string): void {
  memoryCache.delete(key);
  try { localStorage.removeItem(lsKey(key)); } catch { /* noop */ }
}

/**
 * Clear legacy/outdated cache entries from localStorage on initialization.
 */
export function cacheClearExpired(): void {
  const timestamp = now();

  // Memory cache
  for (const [key, entry] of memoryCache) {
    if (entry.expiry <= timestamp) {
      memoryCache.delete(key);
    }
  }

  // localStorage: Clear any key that doesn't match current CACHE_VERSION
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const fullKey = localStorage.key(i);
      if (!fullKey) continue;

      if (fullKey.startsWith('cineorder-tmdb:') || (fullKey.startsWith('cineorder-tmdb-') && !fullKey.startsWith(CACHE_PREFIX))) {
        localStorage.removeItem(fullKey);
        continue;
      }

      if (!fullKey.startsWith(CACHE_PREFIX)) continue;

      const raw = localStorage.getItem(fullKey);
      if (!raw) continue;

      try {
        const entry: CacheEntry = JSON.parse(raw);
        if (entry.expiry <= timestamp) {
          localStorage.removeItem(fullKey);
        }
      } catch {
        localStorage.removeItem(fullKey);
      }
    }
  } catch { /* noop */ }
}

/**
 * Clear all TMDb cache entries.
 */
export function cacheClearAll(): void {
  memoryCache.clear();

  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith('cineorder-tmdb')) {
        localStorage.removeItem(key);
      }
    }
  } catch { /* noop */ }
}

// ─── LRU Eviction ───────────────────────────────────────────

function evictIfNeeded(incomingBytes: number): void {
  try {
    let totalBytes = 0;
    const entries: { key: string; size: number; accessedAt: number }[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(CACHE_PREFIX)) continue;

      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const size = raw.length * 2;
      totalBytes += size;

      try {
        const entry: CacheEntry = JSON.parse(raw);
        entries.push({ key, size, accessedAt: entry.accessedAt || 0 });
      } catch {
        localStorage.removeItem(key);
        totalBytes -= size;
      }
    }

    if (totalBytes + incomingBytes <= MAX_CACHE_BYTES) return;

    entries.sort((a, b) => a.accessedAt - b.accessedAt);

    for (const entry of entries) {
      if (totalBytes + incomingBytes <= MAX_CACHE_BYTES) break;
      localStorage.removeItem(entry.key);
      memoryCache.delete(entry.key.replace(CACHE_PREFIX, ''));
      totalBytes -= entry.size;
    }
  } catch { /* noop */ }
}

// Auto-purge stale / legacy unvalidated cache entries on load
cacheClearExpired();
