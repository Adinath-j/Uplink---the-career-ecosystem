import {
  profileService,
  mapPortfolioToStudentProfile,
  parseCgpa,
  DigitalPortfolioDto,
} from '../../src/services/profileService';
import { apiClient } from '../../src/services/api/apiClient';
import { storage } from '../../src/services/api/tokenStorage';

describe('profileService', () => {
  beforeEach(() => {
    storage.clearAll();
    jest.clearAllMocks();
  });

  const mockPortfolioDto: DigitalPortfolioDto = {
    userId: 'user-uuid-1',
    fullName: 'Aditya Verma',
    email: 'aditya.verma@campus.edu',
    phone: '+919876543210',
    profile: {
      id: 'profile-uuid-1',
      headline: 'Software Engineering Undergrad',
      bio: 'Enthusiastic developer building systems',
      location: 'Bengaluru, India',
      profilePicture: 'https://example.com/avatar.png',
    },
    education: [
      {
        id: 'edu-uuid-1',
        degree: 'Bachelor of Technology (B.Tech)',
        college: 'National Institute of Technology',
        branch: 'Computer Science and Engineering',
        startYear: 2023,
        endYear: 2027,
        cgpa: 8.84,
        isCurrent: true,
      },
    ],
    skills: [
      {
        id: 'skill-uuid-1',
        skill: { id: 's1', name: 'Java', category: 'Backend' },
        proficiency: 'ADVANCED',
        yearsOfExp: 2,
        isVerified: true,
      },
      {
        id: 'skill-uuid-2',
        skill: { id: 's2', name: 'Spring Boot', category: 'Backend' },
        proficiency: 'INTERMEDIATE',
        yearsOfExp: 1.5,
        isVerified: false,
      },
    ],
    projects: [
      {
        id: 'proj-uuid-1',
        title: 'Distributed Task Queue',
        description: 'Scalable job queue',
        techStack: 'Java, Spring Boot, Redis',
        githubUrl: 'https://github.com/aditya/task-queue',
        liveUrl: 'https://task-queue.live',
      },
    ],
    experiences: [
      {
        id: 'exp-uuid-1',
        title: 'Backend Intern',
        company: 'Vanguard Systems',
        location: 'Bengaluru',
        startDate: '2026-05',
        endDate: '2026-07',
        description: 'Worked on payment microservices',
      },
    ],
    certifications: [
      {
        id: 'cert-uuid-1',
        name: 'AWS Solutions Architect Associate',
        issuingOrg: 'Amazon Web Services',
        issueDate: '2026-03',
        credentialUrl: 'https://aws.com/cert/123',
      },
    ],
    achievements: [
      {
        id: 'ach-uuid-1',
        title: 'Smart India Hackathon Winner',
        description: '1st place in smart campus category',
        dateAwarded: '2026-01',
      },
    ],
  };

  describe('mapPortfolioToStudentProfile', () => {
    test('correctly maps full DigitalPortfolioDto to mobile StudentProfile', () => {
      const profile = mapPortfolioToStudentProfile(mockPortfolioDto);

      expect(profile.id).toBe('user-uuid-1');
      expect(profile.fullName).toBe('Aditya Verma');
      expect(profile.email).toBe('aditya.verma@campus.edu');
      expect(profile.role).toBe('STUDENT');
      expect(profile.institution).toBe('National Institute of Technology');
      expect(profile.department).toBe('Computer Science and Engineering');
      expect(profile.program).toBe('Bachelor of Technology (B.Tech)');
      expect(profile.graduationYear).toBe(2027);
      expect(profile.cgpa).toBe('8.84 / 10.0');
      expect(profile.skills).toEqual(['Java', 'Spring Boot']);
      expect(profile.projects.length).toBe(1);
      expect(profile.projects[0].technologies).toEqual(['Java', 'Spring Boot', 'Redis']);
      expect(profile.experience.length).toBe(1);
      expect(profile.experience[0].role).toBe('Backend Intern');
      expect(profile.experience[0].organization).toBe('Vanguard Systems');
      expect(profile.certifications.length).toBe(1);
      expect(profile.achievements.length).toBe(1);
    });

    test('handles empty / sparse portfolio gracefully', () => {
      const sparse: DigitalPortfolioDto = {
        userId: 'sparse-id',
        fullName: 'Jane Doe',
        email: 'jane@example.com',
      };

      const profile = mapPortfolioToStudentProfile(sparse);
      expect(profile.id).toBe('sparse-id');
      expect(profile.fullName).toBe('Jane Doe');
      expect(profile.skills).toEqual([]);
      expect(profile.projects).toEqual([]);
      expect(profile.experience).toEqual([]);
      expect(profile.certifications).toEqual([]);
      expect(profile.achievements).toEqual([]);
    });
  });

  describe('getMyProfile', () => {
    test('fetches portfolio from /profile/portfolio and maps result', async () => {
      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        success: true,
        data: mockPortfolioDto,
        statusCode: 200,
      });

      const res = await profileService.getMyProfile();

      expect(getSpy).toHaveBeenCalledWith('/profile/portfolio');
      expect(res.success).toBe(true);
      expect(res.data?.fullName).toBe('Aditya Verma');
      expect(res.data?.skills).toContain('Java');
    });

    test('falls back to /profile if /profile/portfolio fails', async () => {
      jest.spyOn(apiClient, 'get')
        .mockResolvedValueOnce({
          success: false,
          error: 'Portfolio not initialized',
          statusCode: 404,
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            id: 'p-1',
            headline: 'Engineering Student',
            bio: 'Bio text',
            location: 'Campus A',
          },
          statusCode: 200,
        });

      const res = await profileService.getMyProfile();
      expect(res.success).toBe(true);
      expect(res.data?.bio).toBe('Bio text');
    });

    test('returns failure if both portfolio and fallback fail', async () => {
      jest.spyOn(apiClient, 'get')
        .mockResolvedValueOnce({
          success: false,
          error: 'Unauthorized',
          statusCode: 401,
        })
        .mockResolvedValueOnce({
          success: false,
          error: 'Unauthorized',
          statusCode: 401,
        });

      const res = await profileService.getMyProfile();
      expect(res.success).toBe(false);
      expect(res.statusCode).toBe(401);
    });
  });

  describe('updateProfile', () => {
    test('sends ProfileUpdateRequest to PUT /profile and refreshes portfolio', async () => {
      const putSpy = jest.spyOn(apiClient, 'put').mockResolvedValueOnce({
        success: true,
        data: {
          headline: 'Updated headline',
          bio: 'Updated bio',
        },
        statusCode: 200,
      });

      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValue({
        success: true,
        statusCode: 201,
      });

      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        success: true,
        data: {
          ...mockPortfolioDto,
          profile: {
            ...mockPortfolioDto.profile!,
            bio: 'Updated bio',
          },
        },
        statusCode: 200,
      });

      const res = await profileService.updateProfile({
        fullName: 'Aditya Verma',
        bio: 'Updated bio',
        skills: ['Java', 'Spring Boot', 'TypeScript'],
      });

      expect(putSpy).toHaveBeenCalledWith('/profile', expect.objectContaining({
        fullName: 'Aditya Verma',
        bio: 'Updated bio',
      }));

      // Expect new skill 'TypeScript' to be sent to /profile/skills
      expect(postSpy).toHaveBeenCalledWith('/profile/skills', expect.objectContaining({
        skillName: 'TypeScript',
      }));

      expect(getSpy).toHaveBeenCalledWith('/profile/portfolio');
      expect(res.success).toBe(true);
      expect(res.data?.bio).toBe('Updated bio');
    });

    test('persists CGPA and education details to POST /profile/education when provided', async () => {
      const putSpy = jest.spyOn(apiClient, 'put').mockResolvedValueOnce({
        success: true,
        data: {
          headline: 'Updated headline',
        },
        statusCode: 200,
      });

      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
        success: true,
        data: {
          id: 'edu-uuid-1',
          degree: 'Bachelor of Technology (B.Tech)',
          college: 'National Institute of Technology',
          branch: 'Computer Science and Engineering',
          startYear: 2023,
          endYear: 2027,
          cgpa: 9.15,
          isCurrent: true,
        },
        statusCode: 201,
      });

      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        success: true,
        data: {
          ...mockPortfolioDto,
          education: [
            {
              ...mockPortfolioDto.education![0],
              cgpa: 9.15,
            },
          ],
        },
        statusCode: 200,
      });

      const res = await profileService.updateProfile({
        fullName: 'Aditya Verma',
        department: 'Computer Science and Engineering',
        graduationYear: 2027,
        cgpa: '9.15',
      });

      expect(putSpy).toHaveBeenCalledWith('/profile', expect.objectContaining({
        fullName: 'Aditya Verma',
      }));

      expect(postSpy).toHaveBeenCalledWith('/profile/education', expect.objectContaining({
        degree: 'Bachelor of Technology (B.Tech)',
        college: 'National Institute of Technology',
        branch: 'Computer Science and Engineering',
        endYear: 2027,
        cgpa: 9.15,
        isCurrent: true,
      }));

      expect(getSpy).toHaveBeenCalledWith('/profile/portfolio');
      expect(res.success).toBe(true);
      expect(res.data?.cgpa).toBe('9.15 / 10.0');
    });
  });

  describe('parseCgpa', () => {
    test('correctly parses decimal and integer strings', () => {
      expect(parseCgpa('8.84')).toBe(8.84);
      expect(parseCgpa('9.5')).toBe(9.5);
      expect(parseCgpa('9')).toBe(9);
    });

    test('extracts leading numeric value from formatted strings', () => {
      expect(parseCgpa('8.84 / 10.0')).toBe(8.84);
      expect(parseCgpa('9.2/10')).toBe(9.2);
      expect(parseCgpa(' 8.5 / 10 ')).toBe(8.5);
    });

    test('handles numeric inputs directly', () => {
      expect(parseCgpa(8.84)).toBe(8.84);
      expect(parseCgpa(9)).toBe(9);
    });

    test('returns undefined for empty, null, or invalid inputs', () => {
      expect(parseCgpa('')).toBeUndefined();
      expect(parseCgpa('   ')).toBeUndefined();
      expect(parseCgpa(null)).toBeUndefined();
      expect(parseCgpa(undefined)).toBeUndefined();
      expect(parseCgpa('N/A')).toBeUndefined();
      expect(parseCgpa(-2)).toBeUndefined();
      expect(parseCgpa(150)).toBeUndefined();
    });
  });

  describe('child CRUD methods', () => {
    test('addEducation calls POST /profile/education', async () => {
      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
        success: true,
        data: { degree: 'M.Tech', college: 'IITB', startYear: 2027 },
        statusCode: 201,
      });

      const res = await profileService.addEducation({
        degree: 'M.Tech',
        college: 'IITB',
        startYear: 2027,
      });

      expect(postSpy).toHaveBeenCalledWith('/profile/education', {
        degree: 'M.Tech',
        college: 'IITB',
        startYear: 2027,
      });
      expect(res.success).toBe(true);
    });

    test('deleteSkill calls DELETE /profile/skills/{id}', async () => {
      const deleteSpy = jest.spyOn(apiClient, 'delete').mockResolvedValueOnce({
        success: true,
        statusCode: 200,
      });

      const res = await profileService.deleteSkill('skill-uuid-1');
      expect(deleteSpy).toHaveBeenCalledWith('/profile/skills/skill-uuid-1');
      expect(res.success).toBe(true);
    });
  });
});
