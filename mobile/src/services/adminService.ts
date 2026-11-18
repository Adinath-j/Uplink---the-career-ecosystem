import { apiClient, ApiResponse } from './api/apiClient';

export interface AdminDashboardStatsDto {
  totalUsers: number;
  activeUsers: number;
  totalCompanies: number;
  activeOpportunities: number;
  totalApplications: number;
  pendingVerifications: number;
  selectedPlacements: number;
  applicationsByStatus?: Record<string, number>;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  isVerified: boolean;
  roles?: string[];
  createdAt?: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

class AdminService {
  /**
   * Get high-level platform analytics & KPI statistics.
   * Calls GET /admin/dashboard
   */
  async getDashboardStats(): Promise<ApiResponse<AdminDashboardStatsDto>> {
    return apiClient.get<AdminDashboardStatsDto>('/admin/dashboard');
  }

  /**
   * Get all registered users across the platform (paginated).
   * Calls GET /admin/users
   */
  async getAllUsers(page: number = 0, size: number = 20): Promise<ApiResponse<AdminUser[]>> {
    const res = await apiClient.get<SpringPage<AdminUser> | AdminUser[]>(
      `/admin/users?page=${page}&size=${size}`
    );

    if (res.success && res.data) {
      const users: AdminUser[] = Array.isArray(res.data)
        ? res.data
        : (res.data as SpringPage<AdminUser>).content || [];

      return { success: true, data: users, statusCode: res.statusCode };
    }

    return {
      success: false,
      error: res.error || 'Failed to load users',
      statusCode: res.statusCode,
    };
  }

  /**
   * Moderate inappropriate post.
   * Calls DELETE /admin/moderate/post/{postId}
   */
  async moderatePost(postId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/admin/moderate/post/${postId}`);
  }
}

export const adminService = new AdminService();

