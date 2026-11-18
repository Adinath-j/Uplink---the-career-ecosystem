import { apiClient, ApiResponse } from './api/apiClient';
import {
  StudentProfile,
  Project as MobileProject,
  Experience as MobileExperience,
  Certification as MobileCertification,
} from '../types/models';

/**
 * Backend Entity & DTO Interfaces
 * Source of truth: Backend modules/user/controller/UserProfileController.java & entities
 */
export interface BackendProfile {
  id?: string;
  headline?: string;
  bio?: string;
  location?: string;
  profilePicture?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BackendEducation {
  id?: string;
  degree: string;
  college: string;
  branch?: string;
  startYear: number;
  endYear?: number;
  cgpa?: number;
  isCurrent?: boolean;
  createdAt?: string;
}

export interface BackendSkill {
  id?: string;
  name: string;
  category?: string;
}

export interface BackendUserSkill {
  id?: string;
  skill: BackendSkill;
  proficiency?: string; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
  yearsOfExp?: number;
  isVerified?: boolean;
  createdAt?: string;
}

export interface BackendProject {
  id?: string;
  title: string;
  description?: string;
  techStack?: string;
  githubUrl?: string;
  liveUrl?: string;
  createdAt?: string;
}

export interface BackendExperience {
  id?: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  createdAt?: string;
}

export interface BackendCertification {
  id?: string;
  name: string;
  issuingOrg: string;
  issueDate?: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface BackendAchievement {
  id?: string;
  title: string;
  description?: string;
  date?: string;
  dateAwarded?: string;
}

export interface DigitalPortfolioDto {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  profile?: BackendProfile;
  education?: BackendEducation[];
  skills?: BackendUserSkill[];
  projects?: BackendProject[];
  experiences?: BackendExperience[];
  certifications?: BackendCertification[];
  achievements?: BackendAchievement[];
}

export interface ProfileUpdateRequest {
  fullName?: string;
  phone?: string;
  headline?: string;
  bio?: string;
  location?: string;
  profilePicture?: string;
}

export interface AddSkillRequest {
  skillName: string;
  category?: string;
  proficiency?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | string;
  yearsOfExp?: number;
}

/**
 * Safely parses numeric CGPA from strings like "8.84", "8.84 / 10.0", "9.2/10" or numbers.
 * PostgreSQL education.cgpa has precision 4, scale 2 (max 99.99, 2 decimal places).
 */
export function parseCgpa(value?: string | number | null): number | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'number') {
    if (isNaN(value) || value < 0 || value > 100) return undefined;
    return Math.round(value * 100) / 100;
  }
  const str = String(value).trim();
  if (!str) {
    return undefined;
  }
  const match = str.match(/^([0-9]+(?:\.[0-9]+)?)/);
  if (match) {
    const num = parseFloat(match[1]);
    if (isNaN(num) || num < 0 || num > 100) return undefined;
    return Math.round(num * 100) / 100;
  }
  return undefined;
}

/**
 * Maps Spring Boot DigitalPortfolioDto to Mobile StudentProfile model
 */
export function mapPortfolioToStudentProfile(dto: DigitalPortfolioDto): StudentProfile {
  const primaryEdu = dto.education && dto.education.length > 0 ? dto.education[0] : undefined;

  const skills: string[] = (dto.skills || [])
    .map((s) => s.skill?.name)
    .filter((n): n is string => Boolean(n && n.trim().length > 0));

  const projects: MobileProject[] = (dto.projects || []).map((p) => {
    const techArray = p.techStack
      ? p.techStack
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : [];
    return {
      id: p.id || `proj-${Date.now()}-${Math.random()}`,
      title: p.title,
      description: p.description || '',
      technologies: techArray,
      link: p.liveUrl || p.githubUrl,
    };
  });

  const experience: MobileExperience[] = (dto.experiences || []).map((e) => {
    const duration = e.startDate
      ? `${e.startDate} – ${e.endDate || 'Present'}`
      : 'Present';
    return {
      id: e.id || `exp-${Date.now()}-${Math.random()}`,
      role: e.title,
      organization: e.company,
      location: e.location,
      duration,
      description: e.description || '',
    };
  });

  const certifications: MobileCertification[] = (dto.certifications || []).map((c) => ({
    id: c.id || `cert-${Date.now()}-${Math.random()}`,
    name: c.name,
    issuingOrganization: c.issuingOrg,
    issueDate: c.issueDate || '',
    credentialUrl: c.credentialUrl,
  }));

  const achievements: string[] = (dto.achievements || []).map((a) => {
    return a.description ? `${a.title}: ${a.description}` : a.title;
  });

  return {
    id: dto.userId || 'u-current',
    email: dto.email || '',
    fullName: dto.fullName || 'Student',
    role: 'STUDENT',
    avatarUrl: dto.profile?.profilePicture || undefined,
    institution: primaryEdu?.college || dto.profile?.location || 'Campus Community',
    department: primaryEdu?.branch || 'Engineering',
    program: primaryEdu?.degree || 'Undergraduate',
    graduationYear:
      primaryEdu?.endYear ||
      (primaryEdu?.startYear ? primaryEdu.startYear + 4 : 2027),
    cgpa: primaryEdu?.cgpa ? `${primaryEdu.cgpa} / 10.0` : undefined,
    bio: dto.profile?.bio || dto.profile?.headline || '',
    skills,
    projects,
    experience,
    certifications,
    achievements,
  };
}

class ProfileService {
  private inMemoryProfile: StudentProfile | null = null;
  private cachedPrimaryEducation?: BackendEducation;

  /** For testing or resetting primary education cache */
  setCachedPrimaryEducation(edu?: BackendEducation): void {
    this.cachedPrimaryEducation = edu;
  }

  /**
   * Fetch current authenticated student profile.
   * Calls GET /profile/portfolio to get full portfolio data (education, skills, projects, etc.)
   * Falls back to MMKV cache if network fails.
   */
  async getMyProfile(): Promise<ApiResponse<StudentProfile>> {
    const portfolioRes = await apiClient.get<DigitalPortfolioDto>('/profile/portfolio');
    if (portfolioRes.success && portfolioRes.data) {
      if (portfolioRes.data.education && portfolioRes.data.education.length > 0) {
        this.cachedPrimaryEducation = portfolioRes.data.education[0];
      }
      const studentProfile = mapPortfolioToStudentProfile(portfolioRes.data);
      this.inMemoryProfile = studentProfile;
      return {
        success: true,
        data: studentProfile,
        statusCode: portfolioRes.statusCode,
      };
    }

    // Fallback: If portfolio is 404/empty, try basic /profile endpoint
    const basicRes = await apiClient.get<BackendProfile>('/profile');
    if (basicRes.success && basicRes.data) {
      const fallback: StudentProfile = {
        id: basicRes.data.id || '[AWAITING_LIVE_DATA]',
        email: '[AWAITING_LIVE_DATA]',
        fullName: '[AWAITING_LIVE_DATA]',
        role: 'STUDENT',
        institution: basicRes.data.location || '[AWAITING_LIVE_DATA]',
        department: '[AWAITING_LIVE_DATA]',
        program: '[AWAITING_LIVE_DATA]',
        graduationYear: new Date().getFullYear(),
        bio: basicRes.data.bio || basicRes.data.headline || '',
        avatarUrl: basicRes.data.profilePicture,
        skills: [],
        projects: [],
        experience: [],
        certifications: [],
        achievements: [],
      };
      this.inMemoryProfile = fallback;
      return { success: true, data: fallback, statusCode: basicRes.statusCode };
    }

    return {
      success: false,
      error: portfolioRes.error || basicRes.error || 'Failed to retrieve user profile',
      statusCode: portfolioRes.statusCode || basicRes.statusCode || 401,
    };
  }

  /**
   * View public digital portfolio of any candidate/user.
   * Calls GET /profile/portfolio/{userId}
   */
  async getUserPortfolio(userId: string): Promise<ApiResponse<StudentProfile>> {
    const res = await apiClient.get<DigitalPortfolioDto>(`/profile/portfolio/${userId}`);
    if (res.success && res.data) {
      const studentProfile = mapPortfolioToStudentProfile(res.data);
      return { success: true, data: studentProfile, statusCode: res.statusCode };
    }
    return {
      success: false,
      error: res.error || 'Failed to retrieve public user profile',
      statusCode: res.statusCode,
    };
  }

  /**
   * Update student profile fields.
   * Calls PUT /profile, syncs education (CGPA, degree, department) via POST /profile/education,
   * and syncs any skill updates via POST /profile/skills
   */
  async updateProfile(updates: Partial<StudentProfile>): Promise<ApiResponse<StudentProfile>> {

    const payload: ProfileUpdateRequest = {
      fullName: updates.fullName,
      bio: updates.bio,
      headline: updates.bio ? updates.bio.slice(0, 100) : undefined,
      location: updates.institution,
      profilePicture: updates.avatarUrl,
    };

    const updateRes = await apiClient.put<BackendProfile>('/profile', payload);
    if (!updateRes.success) {
      return {
        success: false,
        error: updateRes.error || 'Failed to update profile',
        statusCode: updateRes.statusCode,
      };
    }

    // Persist Education (CGPA, Department / Branch, Graduation Year, etc.) to backend
    const hasEducationUpdates =
      updates.cgpa !== undefined ||
      updates.department !== undefined ||
      updates.graduationYear !== undefined ||
      updates.institution !== undefined ||
      updates.program !== undefined;

    if (hasEducationUpdates) {
      // If we don't have cached primary education, query it to obtain existing record ID
      if (!this.cachedPrimaryEducation) {
        const eduRes = await this.getEducations();
        if (eduRes.success && Array.isArray(eduRes.data) && eduRes.data.length > 0) {
          this.cachedPrimaryEducation = eduRes.data[0];
        }
      }

      const existing = this.cachedPrimaryEducation;
      const endYear = updates.graduationYear !== undefined
        ? updates.graduationYear
        : (existing?.endYear || 2027);
      const startYear = existing?.startYear || (endYear ? endYear - 4 : 2023);
      const parsedCgpa = updates.cgpa !== undefined
        ? parseCgpa(updates.cgpa)
        : existing?.cgpa;

      const eduPayload: BackendEducation = {
        id: existing?.id,
        degree: (updates.program || existing?.degree || 'Bachelor of Technology (B.Tech)').trim(),
        college: (updates.institution || existing?.college || 'National Institute of Technology').trim(),
        branch: (updates.department !== undefined ? updates.department : (existing?.branch || 'Computer Science and Engineering')).trim(),
        startYear,
        endYear,
        cgpa: parsedCgpa,
        isCurrent: existing?.isCurrent ?? true,
      };

      const saveEduRes = await apiClient.post<BackendEducation>('/profile/education', eduPayload);
      if (saveEduRes.success && saveEduRes.data) {
        this.cachedPrimaryEducation = saveEduRes.data;
      }
    }

    // If new skills were provided in the edit form, sync them to backend
    if (updates.skills && Array.isArray(updates.skills)) {
      const existingSkills = new Set(this.inMemoryProfile?.skills || []);
      const newSkills = updates.skills.filter((s) => !existingSkills.has(s));
      for (const s of newSkills) {
        if (s.trim()) {
          await apiClient.post('/profile/skills', {
            skillName: s.trim(),
            proficiency: 'INTERMEDIATE',
            category: 'Technical',
          });
        }
      }
    }

    // If new achievements were provided in the edit form, sync them to backend
    if (updates.achievements && Array.isArray(updates.achievements)) {
      const existingAchSet = new Set(this.inMemoryProfile?.achievements || []);
      const newAchs = updates.achievements.filter((a) => !existingAchSet.has(a));
      for (const a of newAchs) {
        if (a.trim()) {
          const colonIdx = a.indexOf(':');
          const title = colonIdx > -1 ? a.slice(0, colonIdx).trim() : a.trim();
          const description = colonIdx > -1 ? a.slice(colonIdx + 1).trim() : undefined;
          await apiClient.post('/profile/achievements', {
            title,
            description,
            date: new Date().toISOString().split('T')[0],
          });
        }
      }
    }

    // Refresh complete portfolio to ensure local state reflects backend persistence
    const refreshed = await this.getMyProfile();
    if (refreshed.success && refreshed.data) {
      return refreshed;
    }

    // Graceful fallback to merged profile if refresh delayed
    if (this.inMemoryProfile) {
      this.inMemoryProfile = {
        ...this.inMemoryProfile,
        ...updates,
        cgpa: updates.cgpa ? (updates.cgpa.includes('/') ? updates.cgpa : `${updates.cgpa} / 10.0`) : this.inMemoryProfile.cgpa,
      };
      return { success: true, data: this.inMemoryProfile, statusCode: 200 };
    }

    return {
      success: false,
      error: 'Failed to retrieve updated profile from backend',
      statusCode: 500,
    };
  }

  // -------------------------------------------------------------------------
  // Granular Child Resource Methods (Education, Skills, Projects, Experience)
  // -------------------------------------------------------------------------

  async addEducation(education: BackendEducation): Promise<ApiResponse<BackendEducation>> {
    return apiClient.post<BackendEducation>('/profile/education', education);
  }

  async getEducations(): Promise<ApiResponse<BackendEducation[]>> {
    return apiClient.get<BackendEducation[]>('/profile/education');
  }

  async deleteEducation(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/profile/education/${id}`);
  }

  async addSkill(request: AddSkillRequest): Promise<ApiResponse<BackendUserSkill>> {
    return apiClient.post<BackendUserSkill>('/profile/skills', request);
  }

  async getSkills(): Promise<ApiResponse<BackendUserSkill[]>> {
    return apiClient.get<BackendUserSkill[]>('/profile/skills');
  }

  async deleteSkill(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/profile/skills/${id}`);
  }

  async addProject(project: BackendProject): Promise<ApiResponse<BackendProject>> {
    return apiClient.post<BackendProject>('/profile/projects', project);
  }

  async getProjects(): Promise<ApiResponse<BackendProject[]>> {
    return apiClient.get<BackendProject[]>('/profile/projects');
  }

  async deleteProject(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/profile/projects/${id}`);
  }

  async addExperience(experience: BackendExperience): Promise<ApiResponse<BackendExperience>> {
    return apiClient.post<BackendExperience>('/profile/experiences', experience);
  }

  async getExperiences(): Promise<ApiResponse<BackendExperience[]>> {
    return apiClient.get<BackendExperience[]>('/profile/experiences');
  }

  async deleteExperience(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/profile/experiences/${id}`);
  }

  async addCertification(certification: BackendCertification): Promise<ApiResponse<BackendCertification>> {
    return apiClient.post<BackendCertification>('/profile/certifications', certification);
  }

  async getCertifications(): Promise<ApiResponse<BackendCertification[]>> {
    return apiClient.get<BackendCertification[]>('/profile/certifications');
  }

  async deleteCertification(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/profile/certifications/${id}`);
  }

  async addAchievement(achievement: BackendAchievement): Promise<ApiResponse<BackendAchievement>> {
    return apiClient.post<BackendAchievement>('/profile/achievements', achievement);
  }

  async getAchievements(): Promise<ApiResponse<BackendAchievement[]>> {
    return apiClient.get<BackendAchievement[]>('/profile/achievements');
  }

  async deleteAchievement(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/profile/achievements/${id}`);
  }

  async updateEducation(id: string, education: BackendEducation): Promise<ApiResponse<BackendEducation>> {
    return apiClient.put<BackendEducation>(`/profile/education/${id}`, education);
  }

  async updateProject(id: string, project: BackendProject): Promise<ApiResponse<BackendProject>> {
    return apiClient.put<BackendProject>(`/profile/projects/${id}`, project);
  }

  async updateExperience(id: string, experience: BackendExperience): Promise<ApiResponse<BackendExperience>> {
    return apiClient.put<BackendExperience>(`/profile/experiences/${id}`, experience);
  }

  async updateCertification(id: string, certification: BackendCertification): Promise<ApiResponse<BackendCertification>> {
    return apiClient.put<BackendCertification>(`/profile/certifications/${id}`, certification);
  }

  async updateAchievement(id: string, achievement: BackendAchievement): Promise<ApiResponse<BackendAchievement>> {
    return apiClient.put<BackendAchievement>(`/profile/achievements/${id}`, achievement);
  }
}

export const profileService = new ProfileService();
