import {
  adminService,
  AdminDashboardStatsDto,
  AdminUser,
} from '../../src/services/adminService';
import { apiClient } from '../../src/services/api/apiClient';

describe('adminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockDashboard: AdminDashboardStatsDto = {
    totalUsers: 1250,
    activeUsers: 980,
    totalCompanies: 45,
    activeOpportunities: 65,
    totalApplications: 3400,
    pendingVerifications: 12,
    selectedPlacements: 180,
  };

  const mockAdminUser: AdminUser = {
    id: 'usr-1',
    email: 'student@campus.edu',
    fullName: 'Aditya Verma',
    isActive: true,
    isVerified: true,
  };

  test('getDashboardStats calls GET /admin/dashboard', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockDashboard,
      statusCode: 200,
    });

    const res = await adminService.getDashboardStats();
    expect(getSpy).toHaveBeenCalledWith('/admin/dashboard');
    expect(res.success).toBe(true);
    expect(res.data?.totalUsers).toBe(1250);
  });

  test('getAllUsers calls GET /admin/users', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: {
        content: [mockAdminUser],
        totalElements: 1,
      },
      statusCode: 200,
    });

    const res = await adminService.getAllUsers(0, 20);
    expect(getSpy).toHaveBeenCalledWith('/admin/users?page=0&size=20');
    expect(res.success).toBe(true);
    expect(res.data?.length).toBe(1);
    expect(res.data?.[0].fullName).toBe('Aditya Verma');
  });

  test('moderatePost calls DELETE /admin/moderate/post/{postId}', async () => {
    const deleteSpy = jest.spyOn(apiClient, 'delete').mockResolvedValueOnce({
      success: true,
      statusCode: 200,
    });

    const res = await adminService.moderatePost('post-99');
    expect(deleteSpy).toHaveBeenCalledWith('/admin/moderate/post/post-99');
    expect(res.success).toBe(true);
  });
});

