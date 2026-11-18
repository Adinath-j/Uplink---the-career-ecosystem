import {
  analyticsService,
  UserActivityDto,
  PlacementAnalyticsDto,
} from '../../src/services/analyticsService';
import { apiClient } from '../../src/services/api/apiClient';

describe('analyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUserActivity: UserActivityDto = {
    userId: 'usr-1',
    totalApplicationsSent: 8,
    shortlistedApplications: 3,
    interviewsScheduled: 2,
    offersReceived: 1,
    assessmentsCompleted: 4,
  };

  const mockPlacementAnalytics: PlacementAnalyticsDto = {
    placementRatePercentage: 92.4,
    totalPlacements: 450,
    totalOpportunities: 120,
    topHiringCompanies: ['Acme Cloud', 'Nexora'],
    topInDemandSkills: ['Java', 'Spring Boot', 'React Native'],
  };

  test('getUserActivity calls GET /analytics/user-activity', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockUserActivity,
      statusCode: 200,
    });

    const res = await analyticsService.getUserActivity();
    expect(getSpy).toHaveBeenCalledWith('/analytics/user-activity');
    expect(res.success).toBe(true);
    expect(res.data?.totalApplicationsSent).toBe(8);
  });

  test('getPlacementAnalytics calls GET /analytics/placements', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockPlacementAnalytics,
      statusCode: 200,
    });

    const res = await analyticsService.getPlacementAnalytics();
    expect(getSpy).toHaveBeenCalledWith('/analytics/placements');
    expect(res.success).toBe(true);
    expect(res.data?.placementRatePercentage).toBe(92.4);
  });
});

