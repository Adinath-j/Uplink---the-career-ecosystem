import { useProfileStore } from '../../src/store/profileStore';
import { profileService } from '../../src/services/profileService';
import { StudentProfile } from '../../src/types/models';

describe('ProfileStore', () => {
  const sampleProfile: StudentProfile = {
    id: 'user-1',
    email: 'aditya.verma@campus.edu',
    fullName: 'Aditya Verma',
    role: 'STUDENT',
    institution: 'National Institute of Technology',
    department: 'Computer Science and Engineering',
    program: 'Bachelor of Technology (B.Tech)',
    graduationYear: 2027,
    cgpa: '8.84 / 10.0',
    bio: 'Software Engineering student',
    skills: ['Java', 'Spring Boot', 'TypeScript'],
    projects: [],
    experience: [],
    certifications: [],
    achievements: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useProfileStore.setState({
      profile: null,
      isLoading: false,
      error: null,
    });
  });

  test('fetches profile and updates state on success', async () => {
    jest.spyOn(profileService, 'getMyProfile').mockResolvedValueOnce({
      success: true,
      data: sampleProfile,
      statusCode: 200,
    });

    await useProfileStore.getState().fetchProfile();
    const state = useProfileStore.getState();

    expect(state.isLoading).toBe(false);
    expect(state.profile?.fullName).toBe('Aditya Verma');
    expect(state.error).toBeNull();
  });

  test('handles fetch profile failure', async () => {
    jest.spyOn(profileService, 'getMyProfile').mockResolvedValueOnce({
      success: false,
      error: 'Profile not found',
      statusCode: 404,
    });

    await useProfileStore.getState().fetchProfile();
    const state = useProfileStore.getState();

    expect(state.isLoading).toBe(false);
    expect(state.profile).toBeNull();
    expect(state.error).toBe('Profile not found');
  });

  test('updates profile and updates state', async () => {
    const updatedProfile = {
      ...sampleProfile,
      bio: 'Updated bio text',
    };

    jest.spyOn(profileService, 'updateProfile').mockResolvedValueOnce({
      success: true,
      data: updatedProfile,
      statusCode: 200,
    });

    const success = await useProfileStore.getState().updateProfile({
      bio: 'Updated bio text',
    });

    expect(success).toBe(true);
    const state = useProfileStore.getState();
    expect(state.profile?.bio).toBe('Updated bio text');
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  test('handles update profile failure', async () => {
    jest.spyOn(profileService, 'updateProfile').mockResolvedValueOnce({
      success: false,
      error: 'Validation failed',
      statusCode: 400,
    });

    const success = await useProfileStore.getState().updateProfile({
      fullName: '',
    });

    expect(success).toBe(false);
    const state = useProfileStore.getState();
    expect(state.error).toBe('Validation failed');
    expect(state.isLoading).toBe(false);
  });
});

