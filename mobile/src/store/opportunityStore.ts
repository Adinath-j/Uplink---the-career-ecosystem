import { create } from 'zustand';
import { Opportunity, OpportunityCategory, WorkMode, ApplicationRecord, CampusEvent } from '../types/models';
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
  applyInternal: (opportunityId: string) => Promise<{ success: boolean; error?: string }>;
}

export const useOpportunityStore = create<OpportunityState>((set, get) => ({
  opportunities: [],
  events: [],
  myApplications: [],
  selectedCategory: 'All',
  workModeFilter: 'All',
  searchQuery: '',
  isLoading: false,
  isApplying: false,
  error: null,

  fetchOpportunities: async () => {
    set({ isLoading: true, error: null });
    const { selectedCategory, workModeFilter, searchQuery } = get();

    const res = await opportunityService.getOpportunities({
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      workMode: workModeFilter === 'All' ? undefined : workModeFilter,
      search: searchQuery,
    });

    if (res.success && res.data) {
      set({ opportunities: res.data, isLoading: false, error: null });
    } else {
      set({
        isLoading: false,
        error: res.error || 'Failed to load opportunities.',
      });
    }
  },

  fetchEvents: async () => {
    const res = await opportunityService.getCampusEvents();
    if (res.success && res.data) {
      set({ events: res.data });
    }
  },

  fetchMyApplications: async () => {
    const res = await opportunityService.getMyApplications();
    if (res.success && res.data) {
      set({ myApplications: res.data });
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

  applyInternal: async (opportunityId: string) => {
    set({ isApplying: true });
    const res = await opportunityService.applyInternal(opportunityId);
    set({ isApplying: false });

    if (res.success && res.data) {
      set((state) => ({
        myApplications: [res.data!, ...state.myApplications],
      }));
      return { success: true };
    }
    return { success: false, error: res.error };
  },
}));
