/**
 * CineOrder Profile Store
 * Manages the global recommendation profile preference across pages.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SYSTEM_PROFILES, type RecommendationProfile } from '@/types/recommendationService';

interface ProfileState {
  activeProfileId: 'minimalist' | 'balanced' | 'complete' | 'completionist';
  setProfileId: (id: 'minimalist' | 'balanced' | 'complete' | 'completionist') => void;
  getActiveProfile: () => RecommendationProfile;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      activeProfileId: 'balanced',
      setProfileId: (id) => set({ activeProfileId: id }),
      getActiveProfile: () => (SYSTEM_PROFILES[get().activeProfileId] || SYSTEM_PROFILES.balanced) as RecommendationProfile,
    }),
    {
      name: 'cineorder-recommendation-profile-storage',
    }
  )
);
