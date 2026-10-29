import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Keys for non-sensitive local preferences.
 * Auth credentials MUST NOT be stored in plain AsyncStorage.
 */
const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@uplink_pref_onboarding_completed',
  BOOKMARKED_OPPORTUNITIES: '@uplink_pref_bookmarked_opportunities',
};

interface PreferencesState {
  hasCompletedOnboarding: boolean;
  bookmarkedOpportunityIds: string[];
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  setOnboardingCompleted: (completed: boolean) => Promise<void>;
  toggleBookmark: (id: string) => Promise<void>;
  isBookmarked: (id: string) => boolean;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  hasCompletedOnboarding: false,
  bookmarkedOpportunityIds: [],
  isHydrated: false,

  hydrate: async () => {
    try {
      const [onboardingVal, bookmarksVal] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED),
        AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKED_OPPORTUNITIES),
      ]);

      set({
        hasCompletedOnboarding: onboardingVal === 'true',
        bookmarkedOpportunityIds: bookmarksVal ? JSON.parse(bookmarksVal) : [],
        isHydrated: true,
      });
    } catch {
      set({ isHydrated: true });
    }
  },

  setOnboardingCompleted: async (completed: boolean) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        completed ? 'true' : 'false'
      );
      set({ hasCompletedOnboarding: completed });
    } catch (e) {
      console.warn('Failed to save onboarding preference', e);
      set({ hasCompletedOnboarding: completed });
    }
  },

  toggleBookmark: async (id: string) => {
    const current = get().bookmarkedOpportunityIds;
    const exists = current.includes(id);
    const updated = exists ? current.filter((item) => item !== id) : [...current, id];

    set({ bookmarkedOpportunityIds: updated });
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.BOOKMARKED_OPPORTUNITIES,
        JSON.stringify(updated)
      );
    } catch (e) {
      console.warn('Failed to save bookmarks preference', e);
    }
  },

  isBookmarked: (id: string) => {
    return get().bookmarkedOpportunityIds.includes(id);
  },
}));
