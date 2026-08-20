import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { allContent, franchises } from '@/data/franchises';
import { isTheatricallyUpcoming } from '@/lib/upcomingUtils';
import type { WatchHistoryItem, FranchiseProgress } from '@/types';

const WATCHED_STORAGE_KEY = 'cineorder_watched_movies';

function loadWatchedFromStorage(): Record<string, boolean> {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(WATCHED_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const map: Record<string, boolean> = {};
      for (const id of parsed) {
        if (typeof id === 'string' && id.trim()) {
          map[id.trim()] = true;
        }
      }
      return map;
    } else if (typeof parsed === 'object' && parsed !== null) {
      const map: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (v) map[k.trim()] = true;
      }
      return map;
    }
  } catch (e) {
    console.warn('[WatchStore] Error reading watched movies from localStorage:', e);
  }
  return {};
}

function saveWatchedToStorage(history: Record<string, boolean>) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    const idList = Object.keys(history).filter((k) => history[k]);
    window.localStorage.setItem(WATCHED_STORAGE_KEY, JSON.stringify(idList));
  } catch (e) {
    console.warn('[WatchStore] Error persisting watched movies to localStorage:', e);
  }
}

interface WatchState {
  watchHistory: Record<string, boolean>; // content_id -> watched
  franchiseProgress: FranchiseProgress[];
  loading: boolean;

  loadWatchHistory: (userId?: string) => Promise<void>;
  toggleWatched: (arg1: string, arg2?: string) => Promise<void>;
  markWatched: (arg1: string, arg2?: string) => Promise<void>;
  markUnwatched: (arg1: string, arg2?: string) => Promise<void>;
  isWatched: (contentId: string) => boolean;
  getProgress: (franchiseId: string, totalItems: number) => number;
  loadFranchiseProgress: (userId?: string) => Promise<void>;
}

export const useWatchStore = create<WatchState>((set, get) => ({
  watchHistory: loadWatchedFromStorage(),
  franchiseProgress: [],
  loading: false,

  loadWatchHistory: async (userId?: string) => {
    const localHistory = loadWatchedFromStorage();
    set({ watchHistory: localHistory });

    if (!userId || userId === 'guest' || userId === 'guest-user') {
      return;
    }

    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', userId)
        .eq('watched', true);

      if (!error && data) {
        const remoteHistory: Record<string, boolean> = { ...localHistory };
        (data as WatchHistoryItem[]).forEach((item) => {
          if (item.content_id) {
            remoteHistory[item.content_id] = true;
          }
        });
        saveWatchedToStorage(remoteHistory);
        set({ watchHistory: remoteHistory });
      }
    } catch (err) {
      console.warn('[WatchStore] loadWatchHistory remote fetch fallback:', err);
    } finally {
      set({ loading: false });
    }
  },

  toggleWatched: async (arg1: string, arg2?: string) => {
    const contentId = arg2 ? arg2 : arg1;
    const userId = arg2 ? arg1 : undefined;

    const isCurrentlyWatched = !!get().watchHistory[contentId];
    if (isCurrentlyWatched) {
      await get().markUnwatched(contentId, userId);
    } else {
      await get().markWatched(contentId, userId);
    }
  },

  markWatched: async (arg1: string, arg2?: string) => {
    const contentId = arg2 ? arg2 : arg1;
    const userId = arg2 ? arg1 : undefined;

    const target = allContent.find((c) => c.id === contentId);
    if (target && isTheatricallyUpcoming(target)) {
      console.warn(`[WatchStore] Blocked marking unreleased title '${contentId}' as watched.`);
      return;
    }

    // 1. Immediately update React state & localStorage
    const newHistory = { ...get().watchHistory, [contentId]: true };
    saveWatchedToStorage(newHistory);
    set({ watchHistory: newHistory });

    // 2. Background sync to Supabase if authenticated user provided
    if (userId && userId !== 'guest' && userId !== 'guest-user') {
      try {
        await supabase.from('watch_history').upsert({
          user_id: userId,
          content_id: contentId,
          watched: true,
          watched_at: new Date().toISOString(),
        }, { onConflict: 'user_id,content_id' });
      } catch (err) {
        console.warn('[WatchStore] Background Supabase sync failed:', err);
      }
    }
  },

  markUnwatched: async (arg1: string, arg2?: string) => {
    const contentId = arg2 ? arg2 : arg1;
    const userId = arg2 ? arg1 : undefined;

    // 1. Immediately update React state & localStorage
    const newHistory = { ...get().watchHistory };
    delete newHistory[contentId];
    saveWatchedToStorage(newHistory);
    set({ watchHistory: newHistory });

    // 2. Background sync to Supabase if authenticated user provided
    if (userId && userId !== 'guest' && userId !== 'guest-user') {
      try {
        await supabase.from('watch_history')
          .update({ watched: false, watched_at: null })
          .eq('user_id', userId)
          .eq('content_id', contentId);
      } catch (err) {
        console.warn('[WatchStore] Background Supabase sync failed:', err);
      }
    }
  },

  isWatched: (contentId: string) => {
    if (!contentId) return false;
    return !!get().watchHistory[contentId];
  },

  getProgress: (_franchiseId, totalItems) => {
    if (totalItems === 0) return 0;
    const watchedCount = Object.values(get().watchHistory).filter(Boolean).length;
    return Math.round((watchedCount / totalItems) * 100);
  },

  loadFranchiseProgress: async (userId?: string) => {
    const history = get().watchHistory;
    const franchiseCounts: Record<string, number> = {};
    for (const [contentId, watched] of Object.entries(history)) {
      if (watched) {
        const item = allContent.find((c) => c.id === contentId);
        if (item?.franchise_id) {
          franchiseCounts[item.franchise_id] = (franchiseCounts[item.franchise_id] || 0) + 1;
        }
      }
    }

    const localProgress: FranchiseProgress[] = franchises.map((f) => ({
      franchise: f,
      totalItems: f.total_movies + f.total_series,
      watchedItems: franchiseCounts[f.id] || 0,
      percentage: f.total_movies + f.total_series > 0
        ? Math.round(((franchiseCounts[f.id] || 0) / (f.total_movies + f.total_series)) * 100)
        : 0,
    })).filter((p) => p.watchedItems > 0);

    set({ franchiseProgress: localProgress });

    if (userId && userId !== 'guest' && userId !== 'guest-user') {
      try {
        const { data: watchData, error: watchError } = await supabase
          .from('watch_history')
          .select('content_id, watched, content:contents(franchise_id)')
          .eq('user_id', userId)
          .eq('watched', true);

        if (!watchError && watchData) {
          const remoteCounts: Record<string, number> = {};
          ((watchData as unknown) as Array<{ content_id: string; watched: boolean; content: { franchise_id: string } | null }>).forEach((item) => {
            if (item.content?.franchise_id) {
              remoteCounts[item.content.franchise_id] = (remoteCounts[item.content.franchise_id] || 0) + 1;
            }
          });

          const mergedProgress: FranchiseProgress[] = franchises.map((f) => {
            const count = Math.max(franchiseCounts[f.id] || 0, remoteCounts[f.id] || 0);
            return {
              franchise: f,
              totalItems: f.total_movies + f.total_series,
              watchedItems: count,
              percentage: f.total_movies + f.total_series > 0
                ? Math.round((count / (f.total_movies + f.total_series)) * 100)
                : 0,
            };
          }).filter((p) => p.watchedItems > 0);

          set({ franchiseProgress: mergedProgress });
        }
      } catch (error) {
        console.warn('[WatchStore] Remote franchise progress fallback:', error);
      }
    }
  },
}));
