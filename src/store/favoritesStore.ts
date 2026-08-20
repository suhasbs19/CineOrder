import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface FavoriteItem {
  id: string;
  type: 'franchise' | 'movie' | 'series';
  title: string;
  posterUrl: string;
  slugOrId: string;
  franchiseId?: string;
  rating?: number;
  year?: string;
  addedAt: string;
}

const FAVORITES_STORAGE_KEY = 'cineorder_user_favorites';

function loadFavoritesFromStorage(): FavoriteItem[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[FavoritesStore] Local storage read error:', err);
  }
  return [];
}

function saveFavoritesToStorage(favorites: FavoriteItem[]) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }
  } catch (err) {
    console.warn('[FavoritesStore] Local storage write error:', err);
  }
}

interface FavoritesState {
  favorites: FavoriteItem[];
  loading: boolean;
  initialized: boolean;

  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: Omit<FavoriteItem, 'addedAt'>, userId?: string) => Promise<void>;
  addFavorite: (item: Omit<FavoriteItem, 'addedAt'>, userId?: string) => Promise<void>;
  removeFavorite: (id: string, userId?: string) => Promise<void>;
  loadFavorites: (userId?: string) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: loadFavoritesFromStorage(),
  loading: false,
  initialized: false,

  isFavorite: (id: string) => {
    return get().favorites.some((f) => f.id === id || f.slugOrId === id);
  },

  addFavorite: async (item, userId) => {
    const current = get().favorites;
    if (current.some((f) => f.id === item.id)) return;

    const newItem: FavoriteItem = {
      ...item,
      addedAt: new Date().toISOString(),
    };
    const updated = [newItem, ...current];
    saveFavoritesToStorage(updated);
    set({ favorites: updated });

    if (userId && !userId.startsWith('guest')) {
      try {
        await supabase.from('favorites').upsert({
          user_id: userId,
          franchise_id: item.franchiseId || item.id,
          created_at: newItem.addedAt,
        });
      } catch (err) {
        console.warn('[FavoritesStore] Remote sync failed:', err);
      }
    }
  },

  removeFavorite: async (id, userId) => {
    const current = get().favorites;
    const updated = current.filter((f) => f.id !== id && f.slugOrId !== id);
    saveFavoritesToStorage(updated);
    set({ favorites: updated });

    if (userId && !userId.startsWith('guest')) {
      try {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('franchise_id', id);
      } catch (err) {
        console.warn('[FavoritesStore] Remote delete sync failed:', err);
      }
    }
  },

  toggleFavorite: async (item, userId) => {
    const isFav = get().isFavorite(item.id);
    if (isFav) {
      await get().removeFavorite(item.id, userId);
    } else {
      await get().addFavorite(item, userId);
    }
  },

  loadFavorites: async (userId) => {
    set({ loading: true });
    try {
      if (userId && !userId.startsWith('guest')) {
        const { data, error } = await supabase
          .from('favorites')
          .select('franchise_id, created_at')
          .eq('user_id', userId);

        if (!error && data && data.length > 0) {
          const currentMap = new Map(get().favorites.map((f) => [f.id, f]));
          const remoteItems: FavoriteItem[] = data.map((d) => {
            const existing = currentMap.get(d.franchise_id);
            return existing || {
              id: d.franchise_id,
              type: 'franchise',
              title: d.franchise_id.replace(/-/g, ' ').toUpperCase(),
              posterUrl: '',
              slugOrId: d.franchise_id,
              addedAt: d.created_at || new Date().toISOString(),
            };
          });

          // Merge unique
          const combined = [...remoteItems];
          saveFavoritesToStorage(combined);
          set({ favorites: combined });
        }
      }
    } catch (err) {
      console.warn('[FavoritesStore] Fetch favorites error:', err);
    } finally {
      set({ loading: false, initialized: true });
    }
  },
}));
