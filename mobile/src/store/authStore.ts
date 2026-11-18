import { create } from 'zustand';
import { StudentProfile, UserRole } from '../types/models';
import {
  authService,
  SignInPayload,
  SignUpPayload,
  AuthSession,
  normalizeUserRole,
} from '../services/authService';
import { tokenStorage } from '../services/api/tokenStorage';
import { apiClient } from '../services/api/apiClient';

interface AuthState {
  isAuthenticated: boolean;
  isHydrated: boolean;
  user: StudentProfile | null;
  role: UserRole;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  hydrate: () => Promise<boolean>;
  signIn: (payload: SignInPayload) => Promise<boolean>;
  signUp: (payload: SignUpPayload) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
  // Demo helper to easily review student workflows without manual form typing
  enterDemoStudentMode: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Register unauthorized callback with apiClient to automatically log out when refresh token expires
  apiClient.setUnauthorizedCallback(() => {
    get().signOut();
  });

  return {
    isAuthenticated: false,
    isHydrated: false,
    user: null,
    role: 'STUDENT',
    token: null,
    refreshToken: null,
    isLoading: false,
    error: null,

    /**
     * Restore session from persistent storage on application startup
     */
    hydrate: async () => {
      try {
        const { accessToken, refreshToken } = await tokenStorage.loadTokens();
        const session = await tokenStorage.getSessionData<AuthSession>();

        // Auto-upgrade legacy mock/dummy tokens to live backend JWT
        if (
          accessToken &&
          (accessToken.startsWith('uplink_demo_') || accessToken.startsWith('uplink_mock_'))
        ) {
          const liveDemoRes = await authService.loginDemoStudent();
          if (liveDemoRes.success && liveDemoRes.data) {
            set({
              isAuthenticated: true,
              isHydrated: true,
              user: liveDemoRes.data.user,
              role: liveDemoRes.data.role,
              token: liveDemoRes.data.token,
              refreshToken: liveDemoRes.data.refreshToken || null,
              error: null,
            });
            return true;
          } else {
            await tokenStorage.clearTokens();
            set({ isAuthenticated: false, isHydrated: true, user: null, token: null });
            return false;
          }
        }

        if (accessToken && session?.user) {
          apiClient.setAuthToken(accessToken, refreshToken || undefined);

          set({
            isAuthenticated: true,
            isHydrated: true,
            user: session.user,
            role: session.role || 'STUDENT',
            token: accessToken,
            refreshToken: refreshToken || null,
            error: null,
          });

          // Silently verify user details from Spring Boot /api/auth/me if online
          authService
            .getCurrentUser()
            .then((res) => {
              if (res.success && res.data) {
                const remoteUser = res.data;
                const updatedRole = normalizeUserRole(remoteUser.roles);
                set((state) => ({
                  user: state.user
                    ? {
                        ...state.user,
                        email: remoteUser.email,
                        fullName: remoteUser.fullName,
                        role: updatedRole,
                      }
                    : null,
                  role: updatedRole,
                }));
              } else if (res.statusCode === 401 || res.statusCode === 403) {
                // If stored token was invalidated or expired, sign out cleanly
                get().signOut();
              }
            })
            .catch(() => {
              // Keep existing cached session if offline
            });

          return true;
        }

        set({ isHydrated: true, isAuthenticated: false });
        return false;
      } catch (e) {
        console.warn('[useAuthStore] Failed to hydrate authentication session:', e);
        set({ isHydrated: true, isAuthenticated: false });
        return false;
      }
    },

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
            refreshToken: res.data.refreshToken || null,
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
            refreshToken: res.data.refreshToken || null,
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
        refreshToken: null,
        error: null,
      });
    },

    clearError: () => set({ error: null }),

    enterDemoStudentMode: async () => {
      set({ isLoading: true, error: null });
      try {
        const res = await authService.loginDemoStudent();
        if (res.success && res.data) {
          set({
            isAuthenticated: true,
            user: res.data.user,
            role: res.data.role,
            token: res.data.token,
            refreshToken: res.data.refreshToken || null,
            isLoading: false,
            error: null,
          });
        } else {
          set({
            isLoading: false,
            error: res.error || 'Failed to authenticate demo student account.',
          });
        }
      } catch (e: any) {
        set({
          isLoading: false,
          error: e.message || 'An unexpected error occurred during demo sign in.',
        });
      }
    },
  };
});
