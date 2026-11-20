import { authService, normalizeUserRole } from '../../src/services/authService';
import { apiClient } from '../../src/services/api/apiClient';
import { tokenStorage } from '../../src/services/api/tokenStorage';

describe('AuthService', () => {
  beforeEach(async () => {
    await tokenStorage.clearTokens();
    jest.clearAllMocks();
    jest.spyOn(apiClient, 'get').mockResolvedValue({ success: false, statusCode: 404 });
  });

  describe('normalizeUserRole', () => {
    test('normalizes ROLE_ADMIN to ADMIN', () => {
      expect(normalizeUserRole(['ROLE_ADMIN'])).toBe('ADMIN');
      expect(normalizeUserRole([{ id: 1, name: 'ROLE_ADMIN' }])).toBe('ADMIN');
    });

    test('normalizes ROLE_RECRUITER to RECRUITER', () => {
      expect(normalizeUserRole(['ROLE_RECRUITER'])).toBe('RECRUITER');
      expect(normalizeUserRole([{ id: 2, name: 'ROLE_RECRUITER' }])).toBe('RECRUITER');
    });

    test('normalizes ROLE_STUDENT or empty to STUDENT', () => {
      expect(normalizeUserRole(['ROLE_STUDENT'])).toBe('STUDENT');
      expect(normalizeUserRole([])).toBe('STUDENT');
      expect(normalizeUserRole(undefined)).toBe('STUDENT');
    });
  });

  describe('signIn', () => {
    test('sends credentials to /auth/login and stores session', async () => {
      const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
        success: true,
        data: {
          token: 'token_abc',
          refreshToken: 'refresh_def',
          type: 'Bearer',
          id: 'user_123',
          email: 'student@campus.edu',
          fullName: 'Aarav Sharma',
          roles: ['ROLE_STUDENT'],
        },
        statusCode: 200,
      });

      const res = await authService.signIn({
        email: 'student@campus.edu',
        password: 'Password123!',
      });

      expect(mockPost).toHaveBeenCalledWith('/auth/login', {
        email: 'student@campus.edu',
        password: 'Password123!',
      });

      expect(res.success).toBe(true);
      expect(res.data?.token).toBe('token_abc');
      expect(res.data?.role).toBe('STUDENT');

      const savedToken = await tokenStorage.getAccessToken();
      expect(savedToken).toBe('token_abc');
    });

    test('returns structured error on login failure', async () => {
      jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
        success: false,
        error: 'Bad credentials',
        statusCode: 401,
      });

      const res = await authService.signIn({
        email: 'wrong@campus.edu',
        password: 'wrong',
      });

      expect(res.success).toBe(false);
      expect(res.error).toBe('Bad credentials');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('signUp', () => {
    test('sends payload to /auth/register', async () => {
      const mockPost = jest.spyOn(apiClient, 'post').mockImplementation(async (url: string) => {
        if (url === '/auth/register') {
          return {
            success: true,
            data: {
              token: 'new_token',
              refreshToken: 'new_refresh',
              type: 'Bearer',
              id: 'new_user_id',
              email: 'new@campus.edu',
              fullName: 'New Student',
              roles: ['ROLE_STUDENT'],
            },
            statusCode: 201,
          };
        }
        return { success: true, statusCode: 200 };
      });

      const res = await authService.signUp({
        fullName: 'New Student',
        email: 'new@campus.edu',
        password: 'Secret123Password',
        institution: 'IIT Delhi',
        department: 'CSE',
        graduationYear: 2027,
      });

      expect(mockPost).toHaveBeenCalledWith('/auth/register', {
        email: 'new@campus.edu',
        password: 'Secret123Password',
        fullName: 'New Student',
        phone: undefined,
        role: 'STUDENT',
      });

      expect(res.success).toBe(true);
      expect(res.data?.user.fullName).toBe('New Student');
    });
  });

  describe('verifyEmail', () => {
    test('sends email and otp to /auth/verify-email and stores session', async () => {
      const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
        success: true,
        data: {
          token: 'otp_verified_token',
          refreshToken: 'otp_verified_refresh',
          type: 'Bearer',
          id: 'user_otp_123',
          email: 'otp@campus.edu',
          fullName: 'Verified Student',
          roles: ['ROLE_STUDENT'],
          isVerified: true,
        },
        statusCode: 200,
      });

      const res = await authService.verifyEmail({
        email: 'otp@campus.edu',
        otp: '123456',
      });

      expect(mockPost).toHaveBeenCalledWith('/auth/verify-email', {
        email: 'otp@campus.edu',
        otp: '123456',
      });
      expect(res.success).toBe(true);
      expect(res.data?.token).toBe('otp_verified_token');
      expect(res.data?.user.isVerified).toBe(true);
    });

    test('handles invalid otp verification error', async () => {
      jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
        success: false,
        error: 'Invalid verification code. 4 attempt(s) remaining.',
        statusCode: 400,
      });

      const res = await authService.verifyEmail({
        email: 'otp@campus.edu',
        otp: '000000',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('Invalid verification code');
    });
  });

  describe('resendVerification', () => {
    test('posts email to /auth/resend-verification', async () => {
      const mockPost = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
        success: true,
        data: 'Verification code sent to resend@campus.edu',
        statusCode: 200,
      });

      const res = await authService.resendVerification('resend@campus.edu');

      expect(mockPost).toHaveBeenCalledWith('/auth/resend-verification', {
        email: 'resend@campus.edu',
      });
      expect(res.success).toBe(true);
    });
  });
});

