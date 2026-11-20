import { useAuthStore } from '../../src/store/authStore';
import { authService } from '../../src/services/authService';
import { tokenStorage } from '../../src/services/api/tokenStorage';
import { StudentProfile } from '../../src/types/models';

const testStudentProfile: StudentProfile = {
  id: 'u-test',
  email: 'aditya.verma@campus.edu',
  fullName: 'Aditya Verma',
  role: 'STUDENT',
  institution: 'National Institute of Technology',
  department: 'Computer Science and Engineering',
  program: 'Bachelor of Technology (B.Tech)',
  graduationYear: 2027,
  skills: ['Java', 'TypeScript'],
  projects: [],
  experience: [],
  certifications: [],
  achievements: [],
};

describe('useAuthStore', () => {
  beforeEach(async () => {
    await tokenStorage.clearTokens();
    useAuthStore.setState({
      isAuthenticated: false,
      isHydrated: false,
      user: null,
      role: 'STUDENT',
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  test('signs in successfully and updates store', async () => {
    jest.spyOn(authService, 'signIn').mockResolvedValueOnce({
      success: true,
      data: {
        token: 'auth_token_123',
        refreshToken: 'refresh_123',
        user: { ...testStudentProfile, email: 'aditya@campus.edu' },
        role: 'STUDENT',
      },
      statusCode: 200,
    });

    const result = await useAuthStore.getState().signIn({
      email: 'aditya@campus.edu',
      password: 'password',
    });

    expect(result).toBe(true);
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('auth_token_123');
    expect(state.user?.email).toBe('aditya@campus.edu');
    expect(state.error).toBeNull();
  });

  test('handles sign in failure', async () => {
    jest.spyOn(authService, 'signIn').mockResolvedValueOnce({
      success: false,
      error: 'Invalid credentials provided',
      statusCode: 401,
    });

    const result = await useAuthStore.getState().signIn({
      email: 'fail@campus.edu',
      password: 'wrong',
    });

    expect(result).toBe(false);
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBe('Invalid credentials provided');
  });

  test('restores session upon hydration', async () => {
    const session = {
      token: 'persisted_jwt',
      refreshToken: 'persisted_refresh',
      user: { ...testStudentProfile, fullName: 'Restored User' },
      role: 'STUDENT' as const,
    };

    await tokenStorage.setTokens(session.token, session.refreshToken);
    await tokenStorage.saveSessionData(session);

    jest.spyOn(authService, 'getCurrentUser').mockResolvedValueOnce({
      success: true,
      data: {
        id: session.user.id,
        email: session.user.email,
        fullName: 'Restored User',
        isVerified: true,
        isActive: true,
        roles: ['ROLE_STUDENT'],
      },
      statusCode: 200,
    });

    const hydrated = await useAuthStore.getState().hydrate();

    expect(hydrated).toBe(true);
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.isHydrated).toBe(true);
    expect(state.token).toBe('persisted_jwt');
    expect(state.user?.fullName).toBe('Restored User');
  });

  test('signs out and clears state', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      token: 'active_token',
      user: { ...testStudentProfile },
    });

    const signOutSpy = jest.spyOn(authService, 'signOut').mockResolvedValueOnce();

    await useAuthStore.getState().signOut();

    expect(signOutSpy).toHaveBeenCalled();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.user).toBeNull();
  });

  test('enters demo student mode', async () => {
    const demoSession = {
      token: 'uplink_demo_token_authenticated',
      refreshToken: 'uplink_demo_refresh_token',
      user: { ...testStudentProfile },
      role: 'STUDENT' as const,
    };
    jest.spyOn(authService, 'loginDemoStudent').mockResolvedValueOnce({
      success: true,
      data: demoSession,
      statusCode: 200,
    });

    await useAuthStore.getState().enterDemoStudentMode();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('uplink_demo_token_authenticated');
    expect(state.user?.fullName).toBe(testStudentProfile.fullName);
  });

  test('verifies email with 6-digit OTP and logs user in', async () => {
    const verifiedSession = {
      token: 'verified_jwt_token',
      refreshToken: 'verified_refresh_token',
      user: { ...testStudentProfile, email: 'verify@campus.edu', isVerified: true },
      role: 'STUDENT' as const,
    };

    jest.spyOn(authService, 'verifyEmail').mockResolvedValueOnce({
      success: true,
      data: verifiedSession,
      statusCode: 200,
    });

    const result = await useAuthStore.getState().verifyEmail('verify@campus.edu', '654321');

    expect(result.success).toBe(true);
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('verified_jwt_token');
    expect(state.user?.email).toBe('verify@campus.edu');
    expect(state.user?.isVerified).toBe(true);
    expect(state.requiresVerification).toBe(false);
  });

  test('detects unverified email on login and sets requiresVerification', async () => {
    jest.spyOn(authService, 'signIn').mockResolvedValueOnce({
      success: false,
      error: 'Please verify your email address.',
      code: 'EMAIL_NOT_VERIFIED',
      raw: { code: 'EMAIL_NOT_VERIFIED', email: 'unverified@campus.edu' },
      statusCode: 403,
    });

    const result = await useAuthStore.getState().signIn({
      email: 'unverified@campus.edu',
      password: 'password123',
    });

    expect(result).toBe(false);
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.requiresVerification).toBe(true);
    expect(state.unverifiedEmail).toBe('unverified@campus.edu');
  });
});

