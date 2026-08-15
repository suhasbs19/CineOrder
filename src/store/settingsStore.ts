import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  spoilerFreeMode: boolean;
  toggleSpoilerFreeMode: () => void;
  setSpoilerFreeMode: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      spoilerFreeMode: false,

      toggleSpoilerFreeMode: () =>
        set((state) => ({ spoilerFreeMode: !state.spoilerFreeMode })),

      setSpoilerFreeMode: (value) => set({ spoilerFreeMode: value }),
    }),
    { name: 'cineorder-settings' }
  )
);
