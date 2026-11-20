import { create } from 'zustand';
import { StudentProfile } from '../types/models';
import { getScopedCache, saveScopedCache } from '../lib/queryClient';
import {
  profileService,
  BackendUserSkill,
  AddSkillRequest,
  BackendProject,
  BackendExperience,
  BackendCertification,
} from '../services/profileService';

interface ProfileState {
  profile: StudentProfile | null;
  userSkills: BackendUserSkill[];
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<boolean>;
  addSkill: (request: AddSkillRequest) => Promise<boolean>;
  deleteSkill: (idOrName: string) => Promise<boolean>;
  addProject: (project: BackendProject) => Promise<boolean>;
  updateProject: (id: string, project: BackendProject) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  addExperience: (experience: BackendExperience) => Promise<boolean>;
  updateExperience: (id: string, experience: BackendExperience) => Promise<boolean>;
  deleteExperience: (id: string) => Promise<boolean>;
  addCertification: (certification: BackendCertification) => Promise<boolean>;
  updateCertification: (id: string, certification: BackendCertification) => Promise<boolean>;
  deleteCertification: (id: string) => Promise<boolean>;
  uploadAvatar: (uri: string, mimeType?: string, fileName?: string) => Promise<boolean>;
  setProfile: (profile: StudentProfile | null) => void;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: getScopedCache<StudentProfile>('profile'),
  userSkills: getScopedCache<BackendUserSkill[]>('skills') || [],
  isLoading: false,
  isActionLoading: false,
  error: null,

  fetchProfile: async () => {
    const hasExisting = !!get().profile;
    if (!hasExisting) {
      set({ isLoading: true, error: null });
    }
    const [profileRes, skillsRes] = await Promise.all([
      profileService.getMyProfile(),
      profileService.getSkills(),
    ]);

    if (profileRes.success && profileRes.data) {
      const skillsData = skillsRes.success && Array.isArray(skillsRes.data) ? skillsRes.data : [];
      set({
        profile: profileRes.data,
        userSkills: skillsData,
        isLoading: false,
        error: null,
      });
      saveScopedCache('profile', profileRes.data);
      saveScopedCache('skills', skillsData);
    } else {
      if (!hasExisting) {
        set({
          profile: null,
          userSkills: [],
          isLoading: false,
          error: profileRes.error || 'Failed to load profile.',
        });
      } else {
        set({ isLoading: false });
      }
    }
  },

  updateProfile: async (updates) => {
    set({ isActionLoading: true, error: null });
    const res = await profileService.updateProfile(updates);
    if (res.success && res.data) {
      set({ profile: res.data, isActionLoading: false, error: null });
      saveScopedCache('profile', res.data);
      return true;
    }
    set({
      isActionLoading: false,
      error: res.error || 'Unable to update profile.',
    });
    return false;
  },

  addSkill: async (request) => {
    set({ isActionLoading: true, error: null });
    const res = await profileService.addSkill(request);
    if (res.success) {
      await get().fetchProfile();
      set({ isActionLoading: false });
      return true;
    }
    set({
      isActionLoading: false,
      error: res.error || 'Failed to add skill.',
    });
    return false;
  },

  deleteSkill: async (idOrName) => {
    set({ isActionLoading: true, error: null });
    const { userSkills } = get();
    // Resolve skill ID if passed name instead of UUID
    let targetId = idOrName;
    const match = userSkills.find(
      (s) =>
        s.id === idOrName ||
        (s.skill?.name && s.skill.name.toLowerCase() === idOrName.toLowerCase())
    );
    if (match?.id) {
      targetId = match.id;
    }

    const res = await profileService.deleteSkill(targetId);
    if (res.success) {
      await get().fetchProfile();
      set({ isActionLoading: false });
      return true;
    }
    set({
      isActionLoading: false,
      error: res.error || 'Failed to delete skill.',
    });
    return false;
  },

  addProject: async (project) => {
    set({ isActionLoading: true, error: null });
    const res = await profileService.addProject(project);
    if (res.success) {
      await get().fetchProfile();
      set({ isActionLoading: false });
      return true;
    }
    set({
      isActionLoading: false,
      error: res.error || 'Failed to add project.',
    });
    return false;
  },

  updateProject: async (id, project) => {
    set({ isActionLoading: true, error: null });
    const res = await profileService.updateProject(id, project);
    if (res.success) {
      await get().fetchProfile();
      set({ isActionLoading: false });
      return true;
    }
    set({
      isActionLoading: false,
      error: res.error || 'Failed to update project.',
    });
    return false;
  },

  deleteProject: async (id) => {
    set({ isActionLoading: true, error: null });
    const res = await profileService.deleteProject(id);
    if (res.success) {
      await get().fetchProfile();
      set({ isActionLoading: false });
      return true;
    }
    set({
      isActionLoading: false,
      error: res.error || 'Failed to delete project.',
    });
    return false;
  },

  addExperience: async (experience) => {
    set({ isActionLoading: true, error: null });
    const res = await profileService.addExperience(experience);
    if (res.success) {
      await get().fetchProfile();
      set({ isActionLoading: false });
      return true;
    }
    set({
      isActionLoading: false,
      error: res.error || 'Failed to add experience.',
    });
    return false;
  },

  updateExperience: async (id, experience) => {
    set({ isActionLoading: true, error: null });
    const res = await profileService.updateExperience(id, experience);
    if (res.success) {
      await get().fetchProfile();
      set({ isActionLoading: false });
      return true;
    }
    set({
      isActionLoading: false,
      error: res.error || 'Failed to update experience.',
    });
    return false;
  },

  deleteExperience: async (id) => {
    set({ isActionLoading: true, error: null });
    const res = await profileService.deleteExperience(id);
    if (res.success) {
      await get().fetchProfile();
      set({ isActionLoading: false });
      return true;
    }
    set({
      isActionLoading: false,
      error: res.error || 'Failed to delete experience.',
    });
    return false;
  },

  addCertification: async (certification) => {
    set({ isActionLoading: true, error: null });
    const res = await profileService.addCertification(certification);
    if (res.success) {
      await get().fetchProfile();
      set({ isActionLoading: false });
      return true;
    }
    set({
      isActionLoading: false,
      error: res.error || 'Failed to add certification.',
    });
    return false;
  },

  updateCertification: async (id, certification) => {
    set({ isActionLoading: true, error: null });
    const res = await profileService.updateCertification(id, certification);
    if (res.success) {
      await get().fetchProfile();
      set({ isActionLoading: false });
      return true;
    }
    set({
      isActionLoading: false,
      error: res.error || 'Failed to update certification.',
    });
    return false;
  },

  deleteCertification: async (id) => {
    set({ isActionLoading: true, error: null });
    const res = await profileService.deleteCertification(id);
    if (res.success) {
      await get().fetchProfile();
      set({ isActionLoading: false });
      return true;
    }
    set({
      isActionLoading: false,
      error: res.error || 'Failed to delete certification.',
    });
    return false;
  },

  uploadAvatar: async (uri, mimeType = 'image/jpeg', fileName = 'avatar.jpg') => {
    set({ isActionLoading: true, error: null });
    try {
      const avatarUrl = await profileService.uploadAvatar(uri, mimeType, fileName);
      const current = get().profile;
      if (current) {
        const updated = { ...current, avatarUrl };
        set({ profile: updated, isActionLoading: false, error: null });
        saveScopedCache('profile', updated);
      } else {
        await get().fetchProfile();
        set({ isActionLoading: false, error: null });
      }
      return true;
    } catch (err: any) {
      set({
        isActionLoading: false,
        error: err?.message || 'Failed to upload avatar image.',
      });
      return false;
    }
  },

  setProfile: (profile) => set({ profile }),

  clearError: () => set({ error: null }),
}));
