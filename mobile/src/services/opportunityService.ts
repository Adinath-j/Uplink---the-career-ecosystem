import { apiClient, ApiResponse } from './api/apiClient';
import {
  Opportunity,
  OpportunityCategory,
  WorkMode,
  ApplicationRecord,
  ApplicationStatus,
  CampusEvent,
} from '../types/models';
import { contentService } from './contentService';

/**
 * Backend Opportunity & Application DTO / Entity Types
 * Source of truth: Backend modules/opportunity/ and modules/application/
 */
export interface BackendCompany {
  id: string;
  name: string;
  type?: string;
  website?: string;
  logoUrl?: string;
  description?: string;
  isVerified?: boolean;
}

export interface BackendOpportunitySkill {
  id?: string;
  skill: {
    id?: string;
    name: string;
    category?: string;
  };
  isMandatory?: boolean;
  proficiencyRequired?: string;
}

export interface BackendOpportunity {
  id: string;
  company?: BackendCompany;
  type: string;
  title: string;
  description?: string;
  location?: string;
  workMode?: string;
  experienceLevel?: string;
  stipendMin?: number;
  stipendMax?: number;
  applicationUrl?: string;
  startDate?: string;
  deadline?: string;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  requiredSkills?: BackendOpportunitySkill[];
}

export interface SpringPage<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
}

export interface ApplyOpportunityRequest {
  opportunityId: string;
  coverLetter?: string;
  resumeUrl?: string;
  expectedCtc?: number;
  remarks?: string;
}

export interface BackendApplication {
  id: string;
  opportunity: BackendOpportunity;
  user: {
    id: string;
    fullName?: string;
    email?: string;
  };
  status: string;
  appliedAt: string;
  coverLetter?: string;
  resumeUrl?: string;
  expectedCtc?: number;
  remarks?: string;
  updatedAt?: string;
}

export interface BackendStatusHistory {
  id: string;
  status: string;
  remarks?: string;
  changedAt: string;
}

/**
 * Category, WorkMode, and Status Normalizers
 */
const CATEGORY_MAP_TO_MOBILE: Record<string, OpportunityCategory> = {
  JOB: 'Job',
  INTERNSHIP: 'Internship',
  HACKATHON: 'Hackathon',
  COMPETITION: 'Competition',
  SCHOLARSHIP: 'Scholarship',
  WORKSHOP: 'Workshop',
  CERTIFICATION: 'Certification',
  TRAINING: 'Training',
  RESEARCH: 'Research',
  APPRENTICESHIP: 'Apprenticeship',
};

const WORK_MODE_MAP_TO_MOBILE: Record<string, WorkMode> = {
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
  ONSITE: 'On-site',
};

const STATUS_MAP_TO_MOBILE: Record<string, ApplicationStatus> = {
  APPLIED: 'APPLIED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW: 'SHORTLISTED',
  SELECTED: 'ACCEPTED',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'REJECTED',
};

/**
 * Maps Spring Boot Opportunity entity to Mobile Opportunity model
 */
export function mapBackendOpportunityToMobile(opp: BackendOpportunity): Opportunity {
  const typeKey = (opp.type || '').toUpperCase();
  const category: OpportunityCategory = CATEGORY_MAP_TO_MOBILE[typeKey] || 'Job';

  const workModeKey = (opp.workMode || '').toUpperCase();
  const workMode: WorkMode = WORK_MODE_MAP_TO_MOBILE[workModeKey] || 'On-site';

  let stipendOrSalary: string | undefined;
  if (opp.stipendMin && opp.stipendMax) {
    stipendOrSalary = `₹${opp.stipendMin.toLocaleString('en-IN')} – ₹${opp.stipendMax.toLocaleString('en-IN')}`;
  } else if (opp.stipendMin) {
    stipendOrSalary = `₹${opp.stipendMin.toLocaleString('en-IN')}`;
  } else if (opp.stipendMax) {
    stipendOrSalary = `Up to ₹${opp.stipendMax.toLocaleString('en-IN')}`;
  }

  const skills = (opp.requiredSkills || [])
    .map((s) => s.skill?.name)
    .filter((n): n is string => Boolean(n && n.trim().length > 0));

  const isExternal = Boolean(
    opp.applicationUrl &&
      (opp.applicationUrl.startsWith('http://') ||
        opp.applicationUrl.startsWith('https://'))
  );

  return {
    id: opp.id,
    type: category,
    title: opp.title,
    organization: opp.company?.name || 'Company',
    organizationLogo: opp.company?.logoUrl,
    location: opp.location || (workMode === 'Remote' ? 'Remote' : 'Campus / On-site'),
    workMode,
    stipendOrSalary,
    deadline: opp.deadline || '',
    description: opp.description || '',
    eligibility: opp.experienceLevel
      ? `Experience: ${opp.experienceLevel}`
      : 'Open to all eligible students',
    requiredSkills: skills,
    applicationMethod: isExternal ? 'EXTERNAL' : 'INTERNAL',
    externalUrl: isExternal ? opp.applicationUrl : undefined,
    isVerified: Boolean(opp.isVerified),
    createdAt: opp.createdAt || new Date().toISOString(),
  };
}

/**
 * Maps Spring Boot Application entity to Mobile ApplicationRecord model
 */
export function mapBackendApplicationToRecord(app: BackendApplication): ApplicationRecord {
  const opp = app.opportunity;
  const typeKey = (opp?.type || '').toUpperCase();
  const category: OpportunityCategory = CATEGORY_MAP_TO_MOBILE[typeKey] || 'Job';

  const statusKey = (app.status || '').toUpperCase();
  const status: ApplicationStatus = STATUS_MAP_TO_MOBILE[statusKey] || 'APPLIED';

  return {
    id: app.id,
    opportunityId: opp?.id || '',
    opportunityTitle: opp?.title || 'Opportunity Application',
    organization: opp?.company?.name || 'Organization',
    type: category,
    status,
    appliedAt: app.appliedAt || new Date().toISOString(),
    updatedAt: app.updatedAt || app.appliedAt || new Date().toISOString(),
    notes: app.remarks || app.coverLetter || undefined,
  };
}


class OpportunityService {
  /**
   * Filter opportunities in-memory by category, work mode, and keyword search.
   */
  private filterOpportunitiesLocally(
    list: Opportunity[],
    params?: {
      category?: OpportunityCategory;
      search?: string;
      workMode?: WorkMode;
    }
  ): Opportunity[] {
    let results = [...list];

    if (params?.category) {
      results = results.filter((o) => o.type === params.category);
    }
    if (params?.workMode) {
      results = results.filter((o) => o.workMode === params.workMode);
    }
    if (params?.search && params.search.trim()) {
      const query = params.search.toLowerCase().trim();
      results = results.filter(
        (o) =>
          o.title.toLowerCase().includes(query) ||
          o.organization.toLowerCase().includes(query) ||
          o.requiredSkills.some((s) => s.toLowerCase().includes(query))
      );
    }

    return results;
  }

  /**
   * Fetch opportunities with optional filtering.
   * 1. Calls live Spring Boot GET /opportunities with query parameters.
   * 2. Falls back to AsyncStorage cache if network or authentication is cold.
   * 3. Falls back to curated seed baseline opportunities so the screen is never broken.
   */
  async getOpportunities(params?: {
    category?: OpportunityCategory;
    search?: string;
    workMode?: WorkMode;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<Opportunity[]>> {
    const queryParts: string[] = [];

    if (params?.category) {
      queryParts.push(`type=${encodeURIComponent(params.category.toUpperCase())}`);
    }

    if (params?.workMode) {
      const modeKey =
        params.workMode === 'On-site' ? 'ONSITE' : params.workMode.toUpperCase();
      queryParts.push(`workMode=${encodeURIComponent(modeKey)}`);
    }

    if (params?.search && params.search.trim()) {
      queryParts.push(`keyword=${encodeURIComponent(params.search.trim())}`);
    }

    queryParts.push(`page=${params?.page ?? 0}`);
    queryParts.push(`size=${params?.size ?? 50}`);

    const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

    const res = await apiClient.get<SpringPage<BackendOpportunity> | BackendOpportunity[]>(
      `/opportunities${queryString}`
    );

    if (res.success && res.data) {
      const rawList: BackendOpportunity[] = Array.isArray(res.data)
        ? res.data
        : (res.data as SpringPage<BackendOpportunity>).content || [];

      const mapped = rawList.map(mapBackendOpportunityToMobile);

      return {
        success: true,
        data: mapped,
        statusCode: res.statusCode,
      };
    }

    return {
      success: false,
      data: [],
      error: res.error || 'Failed to fetch opportunities',
      statusCode: res.statusCode,
    };
  }

  /**
   * Fetch a single opportunity by ID.
   * Calls GET /opportunities/{id}
   */
  async getOpportunityById(id: string): Promise<ApiResponse<Opportunity>> {
    const res = await apiClient.get<BackendOpportunity>(`/opportunities/${id}`);
    if (res.success && res.data) {
      return {
        success: true,
        data: mapBackendOpportunityToMobile(res.data),
        statusCode: res.statusCode,
      };
    }

    return {
      success: false,
      error: res.error || 'Opportunity not found',
      statusCode: res.statusCode || 404,
    };
  }

  /**
   * Fetch upcoming campus events and official notices.
   * Calls GET /content/feed?type=NOTICE.
   */
  async getCampusEvents(): Promise<ApiResponse<CampusEvent[]>> {
    try {
      const feedRes = await contentService.getFeed('NOTICE', 0, 5);
      if (feedRes.success && feedRes.data && feedRes.data.length > 0) {
        const liveNotices: CampusEvent[] = feedRes.data.map((item, index) => {
          const dateStr = item.post.createdAt
            ? new Date(item.post.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Recent';

          return {
            id: item.post.id || `notice-${index}`,
            title: item.post.content.length > 65
              ? `${item.post.content.slice(0, 65)}...`
              : item.post.content,
            organization: item.post.user?.fullName || 'Campus Administration',
            date: dateStr,
            time: 'Campus Notice',
            location: 'Official Portal',
            category: item.post.type || 'Notice',
          };
        });

        return { success: true, data: liveNotices, statusCode: feedRes.statusCode };
      }
    } catch {
      // ignore
    }

    return { success: true, data: [], statusCode: 200 };
  }

  /**
   * Submit an internal application for an opportunity.
   * Calls POST /applications/apply
   */
  async applyInternal(
    opportunityId: string,
    options?: {
      coverLetter?: string;
      resumeUrl?: string;
      expectedCtc?: number;
      remarks?: string;
    }
  ): Promise<ApiResponse<ApplicationRecord>> {
    const payload: ApplyOpportunityRequest = {
      opportunityId,
      coverLetter: options?.coverLetter || 'Applied via UPLINK mobile application',
      resumeUrl: options?.resumeUrl || '',
      expectedCtc: options?.expectedCtc,
      remarks: options?.remarks,
    };

    const res = await apiClient.post<BackendApplication>('/applications/apply', payload);
    if (res.success && res.data) {
      return {
        success: true,
        data: mapBackendApplicationToRecord(res.data),
        statusCode: res.statusCode,
      };
    }

    return {
      success: false,
      error: res.error || 'Failed to submit application',
      statusCode: res.statusCode,
    };
  }

  /**
   * Get all applications submitted by the current authenticated student.
   * Calls GET /applications/my
   */
  async getMyApplications(page: number = 0, size: number = 50): Promise<ApiResponse<ApplicationRecord[]>> {
    const res = await apiClient.get<SpringPage<BackendApplication> | BackendApplication[]>(
      `/applications/my?page=${page}&size=${size}`
    );

    if (res.success && res.data) {
      const rawList: BackendApplication[] = Array.isArray(res.data)
        ? res.data
        : (res.data as SpringPage<BackendApplication>).content || [];

      const records = rawList.map(mapBackendApplicationToRecord);
      return {
        success: true,
        data: records,
        statusCode: res.statusCode,
      };
    }

    return {
      success: false,
      data: [],
      error: res.error || 'Failed to fetch applications',
      statusCode: res.statusCode || 500,
    };
  }

  /**
   * Get application lifecycle status audit history.
   * Calls GET /applications/{id}/history
   */
  async getApplicationHistory(id: string): Promise<ApiResponse<BackendStatusHistory[]>> {
    return apiClient.get<BackendStatusHistory[]>(`/applications/${id}/history`);
  }

  /**
   * Save / bookmark an opportunity on the backend.
   * Calls POST /opportunities/{id}/save
   */
  async saveOpportunity(opportunityId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/opportunities/${opportunityId}/save`);
  }

  /**
   * Remove an opportunity from saved / bookmarks on the backend.
   * Calls DELETE /opportunities/{id}/save
   */
  async unsaveOpportunity(opportunityId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/opportunities/${opportunityId}/save`);
  }

  /**
   * Fetch all saved opportunities for the active user.
   * Calls GET /opportunities/saved
   */
  async getSavedOpportunities(): Promise<ApiResponse<Opportunity[]>> {
    const res = await apiClient.get<BackendOpportunity[]>('/opportunities/saved');
    if (res.success && res.data) {
      return {
        success: true,
        data: res.data.map(mapBackendOpportunityToMobile),
        statusCode: res.statusCode,
      };
    }
    return {
      success: false,
      error: res.error || 'Failed to fetch saved opportunities',
      statusCode: res.statusCode,
    };
  }
}

export const opportunityService = new OpportunityService();
