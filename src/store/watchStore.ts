import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { WatchHistoryItem, FranchiseProgress, Franchise } from '@/types';

interface WatchState {
  watchHistory: Record<string, boolean>; // content_id -> watched
  franchiseProgress: FranchiseProgress[];
  loading: boolean;

  loadWatchHistory: (userId: string) => Promise<void>;
  toggleWatched: (userId: string, contentId: string) => Promise<void>;
  markWatched: (userId: string, contentId: string) => Promise<void>;
  markUnwatched: (userId: string, contentId: string) => Promise<void>;
  isWatched: (contentId: string) => boolean;
  getProgress: (franchiseId: string, totalItems: number) => number;
  loadFranchiseProgress: (userId: string) => Promise<void>;
}

export const useWatchStore = create<WatchState>((set, get) => ({
  watchHistory: {},
  franchiseProgress: [],
  loading: false,

  loadWatchHistory: async (userId) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', userId)
        .eq('watched', true);

      if (error) throw error;

      const history: Record<string, boolean> = {};
      (data as WatchHistoryItem[]).forEach((item) => {
        history[item.content_id] = item.watched;
      });
      set({ watchHistory: history });
    } finally {
      set({ loading: false });
    }
  },

  toggleWatched: async (userId, contentId) => {
    const isCurrentlyWatched = get().watchHistory[contentId];
    if (isCurrentlyWatched) {
      await get().markUnwatched(userId, contentId);
    } else {
      await get().markWatched(userId, contentId);
    }
  },

  markWatched: async (userId, contentId) => {
    const { error } = await supabase.from('watch_history').upsert({
      user_id: userId,
      content_id: contentId,
      watched: true,
      watched_at: new Date().toISOString(),
    }, { onConflict: 'user_id,content_id' });

    if (error) throw error;
    set((state) => ({
      watchHistory: { ...state.watchHistory, [contentId]: true },
    }));
  },

  markUnwatched: async (userId, contentId) => {
    const { error } = await supabase.from('watch_history')
      .update({ watched: false, watched_at: null })
      .eq('user_id', userId)
      .eq('content_id', contentId);

    if (error) throw error;
    set((state) => {
      const history = { ...state.watchHistory };
      delete history[contentId];
      return { watchHistory: history };
    });
  },

  isWatched: (contentId) => {
    return !!get().watchHistory[contentId];
  },

  getProgress: (_franchiseId, totalItems) => {
    if (totalItems === 0) return 0;
    const watchedCount = Object.values(get().watchHistory).filter(Boolean).length;
    return Math.round((watchedCount / totalItems) * 100);
  },

  loadFranchiseProgress: async (userId) => {
    try {
      const { data: watchData, error: watchError } = await supabase
        .from('watch_history')
        .select('content_id, watched, content:contents(franchise_id)')
        .eq('user_id', userId)
        .eq('watched', true);

      if (watchError) throw watchError;

      const { data: franchises, error: franchiseError } = await supabase
        .from('franchises')
        .select('*');

      if (franchiseError) throw franchiseError;

      const franchiseCounts: Record<string, number> = {};
      ((watchData as unknown) as Array<{ content_id: string; watched: boolean; content: { franchise_id: string } | null }>).forEach((item) => {
        if (item.content?.franchise_id) {
          franchiseCounts[item.content.franchise_id] = (franchiseCounts[item.content.franchise_id] || 0) + 1;
        }
      });

      const progress: FranchiseProgress[] = (franchises as Franchise[]).map((f) => ({
        franchise: f,
        totalItems: f.total_movies + f.total_series,
        watchedItems: franchiseCounts[f.id] || 0,
        percentage: f.total_movies + f.total_series > 0
          ? Math.round(((franchiseCounts[f.id] || 0) / (f.total_movies + f.total_series)) * 100)
          : 0,
      })).filter((p) => p.watchedItems > 0);

      set({ franchiseProgress: progress });
    } catch (error) {
      console.error('Load franchise progress error:', error);
    }
  },
}));
