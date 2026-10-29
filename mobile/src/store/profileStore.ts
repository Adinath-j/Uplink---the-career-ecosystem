import { create } from 'zustand';
import { StudentProfile } from '../types/models';
import { profileService } from '../services/profileService';

interface ProfileState {
  profile: StudentProfile | null;
  isLoading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<boolean>;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    const res = await profileService.getMyProfile();
    if (res.success && res.data) {
      set({ profile: res.data, isLoading: false });
    } else {
      set({
        isLoading: false,
        error: res.error || 'Failed to load profile.',
      });
    }
  },

  updateProfile: async (updates) => {
    set({ isLoading: true });
    const res = await profileService.updateProfile(updates);
    if (res.success && res.data) {
      set({ profile: res.data, isLoading: false });
      return true;
    }
    set({ isLoading: false });
    return false;
  },
}));
