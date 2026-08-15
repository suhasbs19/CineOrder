import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ContentType, FilterState } from '@/types';

interface FilterStoreState {
  filters: FilterState;
  setTypeFilter: (types: ContentType[]) => void;
  toggleType: (type: ContentType) => void;
  setCanonFilter: (canon: FilterState['canon']) => void;
  setRequiredFilter: (required: FilterState['required']) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}

const defaultFilters: FilterState = {
  types: [],
  canon: 'all',
  required: 'all',
};

export const useFilterStore = create<FilterStoreState>()(
  persist(
    (set, get) => ({
      filters: { ...defaultFilters },

      setTypeFilter: (types) => set((state) => ({
        filters: { ...state.filters, types },
      })),

      toggleType: (type) => set((state) => {
        const types = state.filters.types.includes(type)
          ? state.filters.types.filter((t) => t !== type)
          : [...state.filters.types, type];
        return { filters: { ...state.filters, types } };
      }),

      setCanonFilter: (canon) => set((state) => ({
        filters: { ...state.filters, canon },
      })),

      setRequiredFilter: (required) => set((state) => ({
        filters: { ...state.filters, required },
      })),

      resetFilters: () => set({ filters: { ...defaultFilters } }),

      hasActiveFilters: () => {
        const { filters } = get();
        return filters.types.length > 0 || filters.canon !== 'all' || filters.required !== 'all';
      },
    }),
    { name: 'cineorder-filters' }
  )
);
