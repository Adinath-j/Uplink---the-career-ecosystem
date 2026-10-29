import { create } from 'zustand';
import { Mentor, BookingRequest } from '../types/models';
import { mentorService } from '../services/mentorService';

interface MentorState {
  mentors: Mentor[];
  bookingRequests: BookingRequest[];
  selectedDomain: string;
  searchQuery: string;
  isLoading: boolean;
  isSubmittingBooking: boolean;
  error: string | null;

  fetchMentors: () => Promise<void>;
  fetchBookingRequests: () => Promise<void>;
  setSelectedDomain: (domain: string) => void;
  setSearchQuery: (query: string) => void;
  requestBooking: (payload: {
    mentorId: string;
    mentorName: string;
    mentorRole: string;
    preferredTime: string;
    topic: string;
    message: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export const useMentorStore = create<MentorState>((set, get) => ({
  mentors: [],
  bookingRequests: [],
  selectedDomain: 'All',
  searchQuery: '',
  isLoading: false,
  isSubmittingBooking: false,
  error: null,

  fetchMentors: async () => {
    set({ isLoading: true, error: null });
    const { selectedDomain, searchQuery } = get();

    const res = await mentorService.getMentors({
      domain: selectedDomain,
      search: searchQuery,
    });

    if (res.success && res.data) {
      set({ mentors: res.data, isLoading: false, error: null });
    } else {
      set({
        isLoading: false,
        error: res.error || 'Failed to load mentors.',
      });
    }
  },

  fetchBookingRequests: async () => {
    const res = await mentorService.getMyBookingRequests();
    if (res.success && res.data) {
      set({ bookingRequests: res.data });
    }
  },

  setSelectedDomain: (domain) => {
    set({ selectedDomain: domain });
    get().fetchMentors();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchMentors();
  },

  requestBooking: async (payload) => {
    set({ isSubmittingBooking: true });
    const res = await mentorService.requestBooking(payload);
    set({ isSubmittingBooking: false });

    if (res.success && res.data) {
      set((state) => ({
        bookingRequests: [res.data!, ...state.bookingRequests],
      }));
      return { success: true };
    }
    return { success: false, error: res.error };
  },
}));
