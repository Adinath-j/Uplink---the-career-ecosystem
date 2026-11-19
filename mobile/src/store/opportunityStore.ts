import { create } from 'zustand';
import { getScopedCache, saveScopedCache } from '../lib/queryClient';
import {
  Opportunity,
  OpportunityCategory,
  WorkMode,
  ApplicationRecord,
  CampusEvent,
} from '../types/models';
import { opportunityService } from '../services/opportunityService';

interface OpportunityState {
  opportunities: Opportunity[];
  events: CampusEvent[];
  myApplications: ApplicationRecord[];
  selectedCategory: OpportunityCategory | 'All';
  workModeFilter: WorkMode | 'All';
  searchQuery: string;
  isLoading: boolean;
  isApplying: boolean;
  error: string | null;

  fetchOpportunities: () => Promise<void>;
  fetchEvents: () => Promise<void>;
  fetchMyApplications: () => Promise<void>;
  setSelectedCategory: (cat: OpportunityCategory | 'All') => void;
  setWorkModeFilter: (mode: WorkMode | 'All') => void;
  setSearchQuery: (query: string) => void;
  applyInternal: (
    opportunityId: string,
    options?: {
      coverLetter?: string;
      resumeUrl?: string;
      expectedCtc?: number;
      remarks?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export const useOpportunityStore = create<OpportunityState>((set, get) => ({
  opportunities: getScopedCache<Opportunity[]>('opportunities') || [],
  events: [],
  myApplications: [],
  selectedCategory: 'All',
  workModeFilter: 'All',
  searchQuery: '',
  isLoading: false,
  isApplying: false,
  error: null,

  fetchOpportunities: async () => {
    const hasExisting = get().opportunities.length > 0;
    if (!hasExisting) {
      set({ isLoading: true, error: null });
    }
    const { selectedCategory, workModeFilter, searchQuery } = get();

    const res = await opportunityService.getOpportunities({
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      workMode: workModeFilter === 'All' ? undefined : workModeFilter,
      search: searchQuery,
    });

    if (res.success && res.data) {
      set({ opportunities: res.data, isLoading: false, error: null });
      if (selectedCategory === 'All' && workModeFilter === 'All' && !searchQuery) {
        saveScopedCache('opportunities', res.data);
      }
    } else {
      if (!hasExisting) {
        set({
          opportunities: [],
          isLoading: false,
          error: res.error || 'Failed to load opportunities.',
        });
      } else {
        set({ isLoading: false });
      }
    }
  },

  fetchEvents: async () => {
    const res = await opportunityService.getCampusEvents();
    if (res.success && res.data) {
      set({ events: res.data });
    } else {
      set({ events: [] });
    }
  },

  fetchMyApplications: async () => {
    const res = await opportunityService.getMyApplications();
    if (res.success && res.data) {
      set({ myApplications: res.data });
    } else {
      set({ myApplications: [] });
    }
  },

  setSelectedCategory: (cat) => {
    set({ selectedCategory: cat });
    get().fetchOpportunities();
  },

  setWorkModeFilter: (mode) => {
    set({ workModeFilter: mode });
    get().fetchOpportunities();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchOpportunities();
  },

  applyInternal: async (opportunityId, options) => {
    set({ isApplying: true });
    const res = await opportunityService.applyInternal(opportunityId, options);
    set({ isApplying: false });

    if (res.success && res.data) {
      set((state) => ({
        myApplications: [res.data!, ...state.myApplications.filter((a) => a.opportunityId !== opportunityId)],
      }));
      return { success: true };
    }
    return { success: false, error: res.error };
  },

  clearError: () => set({ error: null }),
}));
