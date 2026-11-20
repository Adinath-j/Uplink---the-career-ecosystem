import { useProfileStore } from '../../src/store/profileStore';
import { profileService } from '../../src/services/profileService';
import { StudentProfile } from '../../src/types/models';

describe('ProfileStore', () => {
  jest.setTimeout(15000);
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
    expect(state.isActionLoading).toBe(false);
  });

  test('addSkill calls profileService and refreshes profile', async () => {
    jest.spyOn(profileService, 'addSkill').mockResolvedValueOnce({
      success: true,
      data: {
        id: 'us-1',
        skill: { name: 'Kotlin', category: 'Mobile' },
        proficiency: 'ADVANCED',
      },
      statusCode: 201,
    });
    jest.spyOn(profileService, 'getMyProfile').mockResolvedValueOnce({
      success: true,
      data: { ...sampleProfile, skills: [...sampleProfile.skills, 'Kotlin'] },
      statusCode: 200,
    });
    jest.spyOn(profileService, 'getSkills').mockResolvedValueOnce({
      success: true,
      data: [],
      statusCode: 200,
    });

    const success = await useProfileStore.getState().addSkill({
      skillName: 'Kotlin',
      proficiency: 'ADVANCED',
    });

    expect(success).toBe(true);
    expect(profileService.addSkill).toHaveBeenCalledWith({
      skillName: 'Kotlin',
      proficiency: 'ADVANCED',
    });
    expect(useProfileStore.getState().profile?.skills).toContain('Kotlin');
  });

  test('deleteSkill resolves ID and refreshes profile', async () => {
    useProfileStore.setState({
      userSkills: [
        {
          id: 'us-1',
          skill: { name: 'Java' },
          proficiency: 'ADVANCED',
        },
      ],
    });

    jest.spyOn(profileService, 'deleteSkill').mockResolvedValueOnce({
      success: true,
      statusCode: 200,
    });
    jest.spyOn(profileService, 'getMyProfile').mockResolvedValueOnce({
      success: true,
      data: { ...sampleProfile, skills: ['Spring Boot', 'TypeScript'] },
      statusCode: 200,
    });
    jest.spyOn(profileService, 'getSkills').mockResolvedValueOnce({
      success: true,
      data: [],
      statusCode: 200,
    });

    const success = await useProfileStore.getState().deleteSkill('Java');
    expect(success).toBe(true);
    expect(profileService.deleteSkill).toHaveBeenCalledWith('us-1');
  });

  test('addProject and deleteProject call profileService correctly', async () => {
    jest.spyOn(profileService, 'addProject').mockResolvedValueOnce({
      success: true,
      data: { id: 'p-1', title: 'Task App', description: 'Sample' },
      statusCode: 201,
    });
    jest.spyOn(profileService, 'getMyProfile').mockResolvedValueOnce({
      success: true,
      data: sampleProfile,
      statusCode: 200,
    });
    jest.spyOn(profileService, 'getSkills').mockResolvedValueOnce({
      success: true,
      data: [],
      statusCode: 200,
    });

    const addSuccess = await useProfileStore.getState().addProject({
      title: 'Task App',
      description: 'Sample',
    });
    expect(addSuccess).toBe(true);
    expect(profileService.addProject).toHaveBeenCalledWith({
      title: 'Task App',
      description: 'Sample',
    });

    jest.spyOn(profileService, 'deleteProject').mockResolvedValueOnce({
      success: true,
      statusCode: 200,
    });
    jest.spyOn(profileService, 'getMyProfile').mockResolvedValueOnce({
      success: true,
      data: sampleProfile,
      statusCode: 200,
    });
    jest.spyOn(profileService, 'getSkills').mockResolvedValueOnce({
      success: true,
      data: [],
      statusCode: 200,
    });

    const delSuccess = await useProfileStore.getState().deleteProject('p-1');
    expect(delSuccess).toBe(true);
    expect(profileService.deleteProject).toHaveBeenCalledWith('p-1');
  });

  test('addExperience and deleteExperience call profileService correctly', async () => {
    jest.spyOn(profileService, 'addExperience').mockResolvedValueOnce({
      success: true,
      data: { id: 'exp-1', title: 'Intern', company: 'Google', startDate: '2025-06-01' },
      statusCode: 201,
    });
    jest.spyOn(profileService, 'getMyProfile').mockResolvedValueOnce({
      success: true,
      data: sampleProfile,
      statusCode: 200,
    });
    jest.spyOn(profileService, 'getSkills').mockResolvedValueOnce({
      success: true,
      data: [],
      statusCode: 200,
    });

    const addSuccess = await useProfileStore.getState().addExperience({
      title: 'Intern',
      company: 'Google',
      startDate: '2025-06-01',
    });
    expect(addSuccess).toBe(true);

    jest.spyOn(profileService, 'deleteExperience').mockResolvedValueOnce({
      success: true,
      statusCode: 200,
    });
    jest.spyOn(profileService, 'getMyProfile').mockResolvedValueOnce({
      success: true,
      data: sampleProfile,
      statusCode: 200,
    });
    jest.spyOn(profileService, 'getSkills').mockResolvedValueOnce({
      success: true,
      data: [],
      statusCode: 200,
    });

    const delSuccess = await useProfileStore.getState().deleteExperience('exp-1');
    expect(delSuccess).toBe(true);
    expect(profileService.deleteExperience).toHaveBeenCalledWith('exp-1');
  });

  test('addCertification and deleteCertification call profileService correctly', async () => {
    jest.spyOn(profileService, 'addCertification').mockResolvedValueOnce({
      success: true,
      data: { id: 'cert-1', name: 'AWS Cloud', issuingOrg: 'Amazon' },
      statusCode: 201,
    });
    jest.spyOn(profileService, 'getMyProfile').mockResolvedValueOnce({
      success: true,
      data: sampleProfile,
      statusCode: 200,
    });
    jest.spyOn(profileService, 'getSkills').mockResolvedValueOnce({
      success: true,
      data: [],
      statusCode: 200,
    });

    const addSuccess = await useProfileStore.getState().addCertification({
      name: 'AWS Cloud',
      issuingOrg: 'Amazon',
    });
    expect(addSuccess).toBe(true);

    jest.spyOn(profileService, 'deleteCertification').mockResolvedValueOnce({
      success: true,
      statusCode: 200,
    });
    jest.spyOn(profileService, 'getMyProfile').mockResolvedValueOnce({
      success: true,
      data: sampleProfile,
      statusCode: 200,
    });
    jest.spyOn(profileService, 'getSkills').mockResolvedValueOnce({
      success: true,
      data: [],
      statusCode: 200,
    });

    const delSuccess = await useProfileStore.getState().deleteCertification('cert-1');
    expect(delSuccess).toBe(true);
    expect(profileService.deleteCertification).toHaveBeenCalledWith('cert-1');
  });
});

