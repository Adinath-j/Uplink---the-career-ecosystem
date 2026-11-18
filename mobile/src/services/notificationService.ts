import { apiClient, ApiResponse } from './api/apiClient';
import { InAppNotification } from '../types/models';

export interface BackendNotification {
  id: string;
  title: string;
  message: string;
  type?: string; // INFO, ALERT, APPLICATION, JOB, SYSTEM
  isRead: boolean;
  createdAt?: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

export function mapBackendNotificationToMobile(n: BackendNotification): InAppNotification {
  let type: InAppNotification['type'] = 'ANNOUNCEMENT';
  const rawType = (n.type || '').toUpperCase();

  if (rawType.includes('APP') || rawType === 'JOB') {
    type = 'APPLICATION';
  } else if (rawType.includes('QA') || rawType.includes('DOUBT')) {
    type = 'QA';
  } else if (rawType.includes('MENTOR')) {
    type = 'MENTORSHIP';
  }

  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type,
    isRead: Boolean(n.isRead),
    createdAt: n.createdAt || new Date().toISOString(),
  };
}

class NotificationService {
  private inMemoryNotifications: InAppNotification[] = [];

  /**
   * Fetch user notifications (paginated).
   * Calls GET /notifications
   */
  async getNotifications(page: number = 0, size: number = 50): Promise<ApiResponse<InAppNotification[]>> {
    const res = await apiClient.get<SpringPage<BackendNotification> | BackendNotification[]>(
      `/notifications?page=${page}&size=${size}`
    );

    if (res.success && res.data) {
      const rawList: BackendNotification[] = Array.isArray(res.data)
        ? res.data
        : (res.data as SpringPage<BackendNotification>).content || [];

      const mapped = rawList.map(mapBackendNotificationToMobile);
      this.inMemoryNotifications = mapped;
      return { success: true, data: mapped, statusCode: res.statusCode };
    }

    return {
      success: false,
      data: [],
      error: res.error || 'Failed to load notifications',
      statusCode: res.statusCode,
    };
  }

  /**
   * Get unread notification count.
   * Calls GET /notifications/unread-count
   */
  async getUnreadCount(): Promise<ApiResponse<number>> {
    const res = await apiClient.get<{ unreadCount: number }>('/notifications/unread-count');
    if (res.success && res.data) {
      return {
        success: true,
        data: Number(res.data.unreadCount || 0),
        statusCode: res.statusCode,
      };
    }

    return {
      success: false,
      data: 0,
      error: res.error || 'Failed to fetch unread count',
      statusCode: res.statusCode,
    };
  }

  /**
   * Mark single notification as read.
   * Calls PATCH /notifications/{id}/read
   */
  async markAsRead(id: string): Promise<ApiResponse<void>> {
    const res = await apiClient.patch<void>(`/notifications/${id}/read`);
    if (res.success) {
      const notif = this.inMemoryNotifications.find((n) => n.id === id);
      if (notif) notif.isRead = true;
    }
    return res;
  }

  /**
   * Mark all notifications as read.
   * Calls POST /notifications/mark-all-read
   */
  async markAllAsRead(): Promise<ApiResponse<void>> {
    const res = await apiClient.post<void>('/notifications/mark-all-read');
    if (res.success) {
      this.inMemoryNotifications.forEach((n) => (n.isRead = true));
    }
    return res;
  }
}

export const notificationService = new NotificationService();
