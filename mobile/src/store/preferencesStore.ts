import { create } from 'zustand';
import { storage } from '../services/api/tokenStorage';
import { opportunityService } from '../services/opportunityService';

/**
 * Storage Keys for non-sensitive local preferences powered by MMKV.
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
      const onboardingVal = storage.getString(STORAGE_KEYS.ONBOARDING_COMPLETED);
      const bookmarksVal = storage.getString(STORAGE_KEYS.BOOKMARKED_OPPORTUNITIES);

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
      storage.set(
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
      storage.set(
        STORAGE_KEYS.BOOKMARKED_OPPORTUNITIES,
        JSON.stringify(updated)
      );
    } catch (e) {
      console.warn('Failed to save bookmarks preference', e);
    }

    // Sync to backend asynchronously
    if (exists) {
      opportunityService.unsaveOpportunity(id).catch(() => {});
    } else {
      opportunityService.saveOpportunity(id).catch(() => {});
    }
  },

  isBookmarked: (id: string) => {
    return get().bookmarkedOpportunityIds.includes(id);
  },
}));
