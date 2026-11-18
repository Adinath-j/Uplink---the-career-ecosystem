import { apiClient, ApiResponse } from './api/apiClient';

export interface UserActivityDto {
  userId: string;
  totalApplicationsSent: number;
  shortlistedApplications: number;
  interviewsScheduled: number;
  offersReceived: number;
  assessmentsCompleted: number;
  statusBreakdown?: Record<string, number>;
}

export interface PlacementAnalyticsDto {
  placementRatePercentage: number;
  totalPlacements: number;
  totalOpportunities: number;
  hiresByRoleType?: Record<string, number>;
  topHiringCompanies?: string[];
  topInDemandSkills?: string[];
  monthlyTrend?: Record<string, number>;
}

class AnalyticsService {
  /**
   * Get user funnel activity (applications, interviews, offers, assessments).
   * Calls GET /analytics/user-activity
   */
  async getUserActivity(): Promise<ApiResponse<UserActivityDto>> {
    return apiClient.get<UserActivityDto>('/analytics/user-activity');
  }

  /**
   * Get platform placement analytics, conversion rates, and hiring trends.
   * Calls GET /analytics/placements
   */
  async getPlacementAnalytics(): Promise<ApiResponse<PlacementAnalyticsDto>> {
    return apiClient.get<PlacementAnalyticsDto>('/analytics/placements');
  }
}

export const analyticsService = new AnalyticsService();

