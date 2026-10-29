import { apiClient, ApiResponse } from './api/apiClient';
import { Opportunity, OpportunityCategory, CampusEvent, ApplicationRecord, WorkMode } from '../types/models';
import { MOCK_OPPORTUNITIES, MOCK_CAMPUS_EVENTS, MOCK_APPLICATIONS } from './mockData/opportunities';
import { ENV } from '../config/env';
import { delay } from '../utils/delay';

class OpportunityService {
  /**
   * Fetch opportunities with optional filtering.
   */
  async getOpportunities(params?: {
    category?: OpportunityCategory;
    search?: string;
    workMode?: WorkMode;
  }): Promise<ApiResponse<Opportunity[]>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(300);
      let results = [...MOCK_OPPORTUNITIES];

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

      return { success: true, data: results, statusCode: 200 };
    }

    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.workMode) queryParams.append('workMode', params.workMode);

    return apiClient.get<Opportunity[]>(`/opportunities?${queryParams.toString()}`);
  }

  /**
   * Fetch a single opportunity by ID.
   */
  async getOpportunityById(id: string): Promise<ApiResponse<Opportunity>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(200);
      const opp = MOCK_OPPORTUNITIES.find((o) => o.id === id);
      if (!opp) {
        return { success: false, error: 'Opportunity not found', statusCode: 404 };
      }
      return { success: true, data: opp, statusCode: 200 };
    }

    return apiClient.get<Opportunity>(`/opportunities/${id}`);
  }

  /**
   * Fetch upcoming campus events.
   */
  async getCampusEvents(): Promise<ApiResponse<CampusEvent[]>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(200);
      return { success: true, data: MOCK_CAMPUS_EVENTS, statusCode: 200 };
    }

    return apiClient.get<CampusEvent[]>('/events');
  }

  /**
   * Submit an internal application for an opportunity.
   */
  async applyInternal(opportunityId: string): Promise<ApiResponse<ApplicationRecord>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(500);
      const opp = MOCK_OPPORTUNITIES.find((o) => o.id === opportunityId);
      if (!opp) {
        return { success: false, error: 'Opportunity not found', statusCode: 404 };
      }

      const newApp: ApplicationRecord = {
        id: `app-${Date.now()}`,
        opportunityId: opp.id,
        opportunityTitle: opp.title,
        organization: opp.organization,
        type: opp.type,
        status: 'APPLIED',
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return { success: true, data: newApp, statusCode: 201 };
    }

    return apiClient.post<ApplicationRecord>(`/opportunities/${opportunityId}/apply`);
  }

  /**
   * Get all applications submitted by the current student.
   */
  async getMyApplications(): Promise<ApiResponse<ApplicationRecord[]>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(250);
      return { success: true, data: MOCK_APPLICATIONS, statusCode: 200 };
    }

    return apiClient.get<ApplicationRecord[]>('/students/me/applications');
  }
}

export const opportunityService = new OpportunityService();
