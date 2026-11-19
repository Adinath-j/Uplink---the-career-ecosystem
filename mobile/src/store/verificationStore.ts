import { create } from 'zustand';
import {
  verificationService,
  UserVerification,
  VerificationSubmitRequest,
} from '../services/verificationService';

interface VerificationState {
  verifications: UserVerification[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchMyVerifications: () => Promise<void>;
  submitVerification: (request: VerificationSubmitRequest) => Promise<boolean>;
}

export const useVerificationStore = create<VerificationState>((set, _get) => ({
  verifications: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchMyVerifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await verificationService.getMyVerifications();
      if (res.success && res.data) {
        set({ verifications: res.data, isLoading: false });
      } else {
        set({
          verifications: [],
          isLoading: false,
          error: res.error || 'Failed to fetch verification status',
        });
      }
    } catch (err: any) {
      set({
        verifications: [],
        isLoading: false,
        error: err.message || 'Unable to connect to verification service',
      });
    }
  },

  submitVerification: async (request: VerificationSubmitRequest) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await verificationService.submitVerification(request);
      if (res.success && res.data) {
        set((state) => ({
          verifications: [res.data!, ...state.verifications],
          isSubmitting: false,
        }));
        return true;
      } else {
        set({
          isSubmitting: false,
          error: res.error || 'Failed to submit document for verification',
        });
        return false;
      }
    } catch (err: any) {
      set({
        isSubmitting: false,
        error: err.message || 'Network error during verification upload',
      });
      return false;
    }
  },
}));
