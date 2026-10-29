import { apiClient, ApiResponse } from './api/apiClient';
import { InAppNotification } from '../types/models';
import { MOCK_NOTIFICATIONS } from './mockData/notifications';
import { ENV } from '../config/env';
import { delay } from '../utils/delay';

class NotificationService {
  private inMemoryNotifications: InAppNotification[] = [...MOCK_NOTIFICATIONS];

  async getNotifications(): Promise<ApiResponse<InAppNotification[]>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(150);
      return { success: true, data: this.inMemoryNotifications, statusCode: 200 };
    }

    return apiClient.get<InAppNotification[]>('/notifications');
  }

  async markAsRead(id: string): Promise<ApiResponse<void>> {
    if (ENV.USE_MOCK_DATA) {
      const notif = this.inMemoryNotifications.find((n) => n.id === id);
      if (notif) notif.isRead = true;
      return { success: true, statusCode: 200 };
    }

    return apiClient.post<void>(`/notifications/${id}/read`);
  }
}

export const notificationService = new NotificationService();
