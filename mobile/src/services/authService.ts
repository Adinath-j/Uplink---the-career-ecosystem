import { apiClient, ApiResponse } from './api/apiClient';
import { tokenStorage } from './api/tokenStorage';
import { UserRole, StudentProfile } from '../types/models';
import { mapPortfolioToStudentProfile, DigitalPortfolioDto } from './profileService';

/**
 * Spring Boot Backend DTOs
 */
export interface BackendAuthResponse {
  token: string;
  refreshToken: string;
  type: string;
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  requiresVerification?: boolean;
  isVerified?: boolean;
}

export interface BackendRole {
  id: number;
  name: string;
}

export interface BackendUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
  roles: Array<BackendRole | string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthSession {
  token: string;
  refreshToken?: string;
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
  phone?: string;
  department?: string;
  institution?: string;
  graduationYear?: number;
}

export interface PasswordResetPayload {
  email: string;
  token?: string;
  newPassword: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
  token?: string;
}

/**
 * Normalizes backend role representation (e.g. ['ROLE_STUDENT', 'ROLE_ADMIN'])
 * to frontend UserRole union ('STUDENT' | 'RECRUITER' | 'ADMIN').
 */
export function normalizeUserRole(roles?: Array<BackendRole | string>): UserRole {
  if (!roles || roles.length === 0) return 'STUDENT';

  const roleNames = roles.map((r) => (typeof r === 'string' ? r : r.name).toUpperCase());

  if (roleNames.some((r) => r.includes('ADMIN'))) return 'ADMIN';
  if (roleNames.some((r) => r.includes('RECRUITER'))) return 'RECRUITER';
  return 'STUDENT';
}

class AuthService {
  /**
   * Authenticate student credentials against Spring Boot /api/auth/login
   */
  async signIn(payload: SignInPayload): Promise<ApiResponse<AuthSession>> {
    if (!payload.email || !payload.password) {
      return {
        success: false,
        error: 'Please enter both email and password.',
        statusCode: 400,
      };
    }

    const res = await apiClient.post<BackendAuthResponse>('/auth/login', {
      email: payload.email.trim(),
      password: payload.password,
    });

    if (res.success && res.data) {
      const authData = res.data;

      // Strict enforcement: Unverified users can NEVER receive or persist active sessions
      if (authData.isVerified === false || authData.requiresVerification || !authData.token) {
        return {
          success: false,
          error: 'Email verification required. A 6-digit code has been sent to your email.',
          code: 'EMAIL_NOT_VERIFIED',
          raw: { code: 'EMAIL_NOT_VERIFIED', email: authData.email || payload.email.trim() },
          statusCode: 403,
        };
      }

      const role = normalizeUserRole(authData.roles);

      // Persist auth tokens immediately so subsequent authenticated calls succeed
      await apiClient.setAuthToken(authData.token, authData.refreshToken);

      let studentUser: StudentProfile = {
        id: authData.id,
        email: authData.email,
        fullName: authData.fullName,
        role,
        institution: 'Campus Community',
        department: 'General',
        program: 'Undergraduate',
        graduationYear: 2027,
        skills: [],
        projects: [],
        experience: [],
        certifications: [],
        achievements: [],
        isVerified: authData.isVerified ?? true,
      };

      // Fetch live digital portfolio from Spring Boot backend if available
      try {
        const portfolioRes = await apiClient.get<DigitalPortfolioDto>('/profile/portfolio');
        if (portfolioRes.success && portfolioRes.data) {
          studentUser = mapPortfolioToStudentProfile(portfolioRes.data);
          studentUser.role = role;
          studentUser.isVerified = authData.isVerified ?? true;
        }
      } catch {
        // Fallback to basic user identity
      }

      const session: AuthSession = {
        token: authData.token,
        refreshToken: authData.refreshToken,
        user: studentUser,
        role,
      };

      await tokenStorage.saveSessionData(session);

      return { success: true, data: session, statusCode: res.statusCode };
    }

    const isUnverified =
      res.code === 'EMAIL_NOT_VERIFIED' ||
      (res.raw as any)?.code === 'EMAIL_NOT_VERIFIED' ||
      (res.statusCode === 403 && (res.error?.toLowerCase().includes('verify') || (res.raw as any)?.message?.toLowerCase().includes('verify')));

    return {
      success: false,
      error: res.error || (isUnverified ? 'Email verification required. A 6-digit code has been sent to your email.' : 'Authentication failed. Please verify your credentials.'),
      code: isUnverified ? 'EMAIL_NOT_VERIFIED' : res.code,
      raw: isUnverified
        ? { code: 'EMAIL_NOT_VERIFIED', email: (res.raw as any)?.email || payload.email.trim() }
        : res.raw,
      validationErrors: res.validationErrors,
      statusCode: res.statusCode,
    };
  }

  /**
   * Register a new account against Spring Boot /api/auth/register
   */
  async signUp(payload: SignUpPayload): Promise<ApiResponse<AuthSession>> {
    const registerBody = {
      email: payload.email.trim(),
      password: payload.password,
      fullName: payload.fullName.trim(),
      phone: payload.phone || undefined,
      role: 'STUDENT',
    };

    const res = await apiClient.post<BackendAuthResponse>('/auth/register', registerBody);

    if (res.success && res.data) {
      const authData = res.data;

      // When registration requires 6-digit OTP verification (standard flow)
      if (authData.requiresVerification || !authData.token) {
        return {
          success: true,
          data: {
            token: '',
            refreshToken: '',
            role: 'STUDENT',
            user: {
              id: authData.id || '',
              email: authData.email || payload.email.trim(),
              fullName: authData.fullName || payload.fullName.trim(),
              role: 'STUDENT',
              institution: payload.institution || 'Campus Community',
              department: payload.department || 'Computer Science and Engineering',
              program: 'Bachelor of Technology',
              graduationYear: payload.graduationYear || 2027,
              skills: [],
              projects: [],
              experience: [],
              certifications: [],
              achievements: [],
              isVerified: false,
            },
          },
          message: res.message || 'Verification required',
          statusCode: res.statusCode,
        };
      }

      const role = normalizeUserRole(authData.roles);

      // Persist auth tokens immediately
      await apiClient.setAuthToken(authData.token, authData.refreshToken);

      let studentUser: StudentProfile = {
        id: authData.id,
        email: authData.email,
        fullName: authData.fullName,
        department: payload.department || 'Computer Science and Engineering',
        institution: payload.institution || 'Campus Community',
        program: 'Bachelor of Technology',
        graduationYear: payload.graduationYear || 2027,
        role,
        skills: [],
        projects: [],
        experience: [],
        certifications: [],
        achievements: [],
        isVerified: false,
      };

      // If user supplied educational details during signup, initialize backend education record
      if (payload.institution || payload.department || payload.graduationYear) {
        try {
          await apiClient.post('/profile/education', {
            college: payload.institution || 'Campus Community',
            branch: payload.department || 'Computer Science and Engineering',
            degree: 'Bachelor of Technology',
            startYear: (payload.graduationYear || 2027) - 4,
            endYear: payload.graduationYear || 2027,
          });
        } catch {
          // Non-critical education initialization fallback
        }
      }

      const session: AuthSession = {
        token: authData.token,
        refreshToken: authData.refreshToken,
        user: studentUser,
        role,
      };

      await tokenStorage.saveSessionData(session);

      return { success: true, data: session, statusCode: res.statusCode };
    }

    return {
      success: false,
      error: res.error || 'Registration failed. Please review your details and try again.',
      validationErrors: res.validationErrors,
      statusCode: res.statusCode,
    };
  }

  /**
   * Get current authenticated user details from Spring Boot /api/auth/me
   */
  async getCurrentUser(): Promise<ApiResponse<BackendUser>> {
    return apiClient.get<BackendUser>('/auth/me');
  }

  /**
   * Refresh active access token from Spring Boot /api/auth/refresh-token
   */
  async refreshToken(): Promise<ApiResponse<BackendAuthResponse>> {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token available.',
        statusCode: 401,
      };
    }

    const res = await apiClient.post<BackendAuthResponse>('/auth/refresh-token', {
      refreshToken,
    });

    if (res.success && res.data) {
      await apiClient.setAuthToken(res.data.token, res.data.refreshToken);
    }

    return res;
  }

  /**
   * Request password reset instructions via Spring Boot /api/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<ApiResponse<string>> {
    return apiClient.post<string>(`/auth/forgot-password?email=${encodeURIComponent(email.trim())}`);
  }

  /**
   * Submit new password via Spring Boot /api/auth/reset-password
   */
  async resetPassword(payload: PasswordResetPayload): Promise<ApiResponse<string>> {
    return apiClient.post<string>('/auth/reset-password', payload);
  }

  /**
   * Verify email address with 6-digit OTP via Spring Boot /api/auth/verify-email
   * Logs the user in immediately upon successful verification.
   */
  async verifyEmail(payload: VerifyEmailPayload): Promise<ApiResponse<AuthSession>> {
    const res = await apiClient.post<BackendAuthResponse>('/auth/verify-email', {
      email: payload.email.trim(),
      otp: payload.otp || payload.token,
    });

    if (res.success && res.data && res.data.token) {
      const authData = res.data;
      const role = normalizeUserRole(authData.roles);

      await apiClient.setAuthToken(authData.token, authData.refreshToken);

      let studentUser: StudentProfile = {
        id: authData.id,
        email: authData.email,
        fullName: authData.fullName,
        role,
        institution: 'Campus Community',
        department: 'General',
        program: 'Undergraduate',
        graduationYear: 2027,
        skills: [],
        projects: [],
        experience: [],
        certifications: [],
        achievements: [],
        isVerified: true,
      };

      try {
        const portfolioRes = await apiClient.get<DigitalPortfolioDto>('/profile/portfolio');
        if (portfolioRes.success && portfolioRes.data) {
          studentUser = mapPortfolioToStudentProfile(portfolioRes.data);
          studentUser.role = role;
          studentUser.isVerified = true;
        }
      } catch {
        // Fallback to basic profile
      }

      const session: AuthSession = {
        token: authData.token,
        refreshToken: authData.refreshToken,
        user: studentUser,
        role,
      };

      await tokenStorage.saveSessionData(session);

      return { success: true, data: session, statusCode: res.statusCode };
    }

    return {
      success: false,
      error: res.error || 'Verification failed. Please check your 6-digit code.',
      statusCode: res.statusCode,
    };
  }

  /**
   * Resend 6-digit verification code with 60-second cooldown via Spring Boot /api/auth/resend-verification
   */
  async resendVerification(email: string): Promise<ApiResponse<string>> {
    return apiClient.post<string>('/auth/resend-verification', {
      email: email.trim(),
    });
  }

  /**
   * Verified demo student account registered on the live Spring Boot backend
   */
  public static readonly DEMO_STUDENT_CREDENTIALS = {
    email: 'demo.student@campus.edu',
    password: 'DemoPassword@123',
    fullName: 'Aditya Sharma',
    phone: '9876540001',
    institution: 'Indian Institute of Technology, Bombay',
    department: 'Computer Science & Engineering',
    graduationYear: 2026,
  };

  /**
   * Authenticate demo student against live Spring Boot backend.
   * Obtains a genuine cryptographic JWT token so all protected endpoints succeed.
   * If the account does not exist on the database yet, registers it automatically.
   */
  async loginDemoStudent(): Promise<ApiResponse<AuthSession>> {
    const creds = AuthService.DEMO_STUDENT_CREDENTIALS;

    try {
      // Step 1: Attempt live login
      const signInRes = await this.signIn({
        email: creds.email,
        password: creds.password,
      });

      if (signInRes.success && signInRes.data) {
        return signInRes;
      }

      // Step 2: If login failed with 401 (e.g. fresh DB), register account
      if (signInRes.statusCode === 401 || signInRes.statusCode === 404) {
        const signUpRes = await this.signUp({
          email: creds.email,
          password: creds.password,
          fullName: creds.fullName,
          phone: creds.phone,
          department: creds.department,
          institution: creds.institution,
          graduationYear: creds.graduationYear,
        });

        if (signUpRes.success && signUpRes.data) {
          return signUpRes;
        }
      }
    } catch (e) {
      console.warn('[authService] Network error during demo student authentication:', e);
    }

    // Return failure if backend is unreachable
    return {
      success: false,
      error: 'Unable to connect to authentication server. Please verify your connection.',
      statusCode: 503,
    };
  }

  /**
   * Sign out and clear active session tokens and storage
   */
  async signOut(): Promise<void> {
    await apiClient.setAuthToken(null);
  }
}

export const authService = new AuthService();
