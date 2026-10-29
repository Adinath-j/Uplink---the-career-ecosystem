import { create } from 'zustand';
import { StudentProfile, UserRole } from '../types/models';
import { authService, SignInPayload, SignUpPayload } from '../services/authService';

interface AuthState {
  isAuthenticated: boolean;
  user: StudentProfile | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  signIn: (payload: SignInPayload) => Promise<boolean>;
  signUp: (payload: SignUpPayload) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
  // Demo helper to easily review the student MVP without manual form typing
  enterDemoStudentMode: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  role: 'STUDENT',
  token: null,
  isLoading: false,
  error: null,

  signIn: async (payload: SignInPayload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.signIn(payload);
      if (res.success && res.data) {
        set({
          isAuthenticated: true,
          user: res.data.user,
          role: res.data.role,
          token: res.data.token,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: res.error || 'Authentication failed. Please check your credentials.',
        });
        return false;
      }
    } catch (e: any) {
      set({
        isLoading: false,
        error: e.message || 'An unexpected error occurred during sign in.',
      });
      return false;
    }
  },

  signUp: async (payload: SignUpPayload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authService.signUp(payload);
      if (res.success && res.data) {
        set({
          isAuthenticated: true,
          user: res.data.user,
          role: res.data.role,
          token: res.data.token,
          isLoading: false,
          error: null,
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: res.error || 'Registration failed. Please verify your details.',
        });
        return false;
      }
    } catch (e: any) {
      set({
        isLoading: false,
        error: e.message || 'An unexpected error occurred during sign up.',
      });
      return false;
    }
  },

  signOut: async () => {
    await authService.signOut();
    set({
      isAuthenticated: false,
      user: null,
      role: 'STUDENT',
      token: null,
      error: null,
    });
  },

  clearError: () => set({ error: null }),

  enterDemoStudentMode: async () => {
    set({ isLoading: true });
    await authService.signIn({
      email: 'aditya.verma@campus.edu',
      password: 'DemoPassword123!',
    });
    set({ isLoading: false });
  },
}));
