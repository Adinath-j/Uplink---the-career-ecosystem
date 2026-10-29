import { apiClient, ApiResponse } from './api/apiClient';
import { UserRole, StudentProfile } from '../types/models';
import { MOCK_STUDENT_PROFILE } from './mockData/profile';
import { ENV } from '../config/env';
import { delay } from '../utils/delay';

export interface AuthSession {
  token: string;
  user: StudentProfile;
  role: UserRole;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  fullName: string;
  department: string;
  institution: string;
  graduationYear: number;
}

class AuthService {
  /**
   * Authenticate student credentials against backend.
   */
  async signIn(payload: SignInPayload): Promise<ApiResponse<AuthSession>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(600);

      if (!payload.email || !payload.password) {
        return {
          success: false,
          error: 'Please enter both email and password.',
          statusCode: 400,
        };
      }

      const mockSession: AuthSession = {
        token: 'uplink_mock_jwt_token_sample',
        user: {
          ...MOCK_STUDENT_PROFILE,
          email: payload.email,
        },
        role: 'STUDENT',
      };

      apiClient.setAuthToken(mockSession.token);
      return { success: true, data: mockSession, statusCode: 200 };
    }

    const res = await apiClient.post<AuthSession>('/auth/signin', payload);
    if (res.success && res.data) {
      apiClient.setAuthToken(res.data.token);
    }
    return res;
  }

  /**
   * Register a new student account.
   */
  async signUp(payload: SignUpPayload): Promise<ApiResponse<AuthSession>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(700);

      const newStudent: StudentProfile = {
        ...MOCK_STUDENT_PROFILE,
        id: `u-${Date.now()}`,
        email: payload.email,
        fullName: payload.fullName,
        department: payload.department,
        institution: payload.institution,
        graduationYear: payload.graduationYear,
        skills: ['Computer Science Fundamentals'],
        projects: [],
        experience: [],
        certifications: [],
        achievements: [],
      };

      const session: AuthSession = {
        token: `uplink_jwt_${Date.now()}`,
        user: newStudent,
        role: 'STUDENT',
      };

      apiClient.setAuthToken(session.token);
      return { success: true, data: session, statusCode: 201 };
    }

    const res = await apiClient.post<AuthSession>('/auth/signup', payload);
    if (res.success && res.data) {
      apiClient.setAuthToken(res.data.token);
    }
    return res;
  }

  /**
   * Sign out and clear active session token.
   */
  async signOut(): Promise<void> {
    apiClient.setAuthToken(null);
  }
}

export const authService = new AuthService();
