import { usePreferencesStore } from '../../src/store/preferencesStore';

describe('PreferencesStore', () => {
  beforeEach(() => {
    usePreferencesStore.setState({
      hasCompletedOnboarding: false,
      bookmarkedOpportunityIds: [],
      isHydrated: false,
    });
  });

  test('sets onboarding completed state', async () => {
    await usePreferencesStore.getState().setOnboardingCompleted(true);
    expect(usePreferencesStore.getState().hasCompletedOnboarding).toBe(true);
  });

  test('toggles bookmark IDs correctly', async () => {
    const oppId = 'opp-1';
    expect(usePreferencesStore.getState().isBookmarked(oppId)).toBe(false);

    await usePreferencesStore.getState().toggleBookmark(oppId);
    expect(usePreferencesStore.getState().isBookmarked(oppId)).toBe(true);

    await usePreferencesStore.getState().toggleBookmark(oppId);
    expect(usePreferencesStore.getState().isBookmarked(oppId)).toBe(false);
  });
});
