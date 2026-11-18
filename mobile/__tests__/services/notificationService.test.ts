import {
  notificationService,
  mapBackendNotificationToMobile,
  BackendNotification,
} from '../../src/services/notificationService';
import { apiClient } from '../../src/services/api/apiClient';

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockBackendNotification: BackendNotification = {
    id: 'notif-101',
    title: 'Application Shortlisted',
    message: 'Your application for Acme Cloud Systems was shortlisted.',
    type: 'APPLICATION',
    isRead: false,
    createdAt: '2026-10-25T10:00:00Z',
  };

  describe('mapBackendNotificationToMobile', () => {
    test('maps backend notification to mobile InAppNotification', () => {
      const mapped = mapBackendNotificationToMobile(mockBackendNotification);

      expect(mapped.id).toBe('notif-101');
      expect(mapped.title).toBe('Application Shortlisted');
      expect(mapped.type).toBe('APPLICATION');
      expect(mapped.isRead).toBe(false);
      expect(mapped.createdAt).toBe('2026-10-25T10:00:00Z');
    });

    test('normalizes INFO and SYSTEM types to ANNOUNCEMENT', () => {
      const infoNotif: BackendNotification = {
        ...mockBackendNotification,
        type: 'INFO',
      };
      const mapped = mapBackendNotificationToMobile(infoNotif);
      expect(mapped.type).toBe('ANNOUNCEMENT');
    });
  });

  describe('getNotifications', () => {
    test('calls GET /notifications and returns mapped notifications', async () => {
      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        success: true,
        data: {
          content: [mockBackendNotification],
          totalElements: 1,
        },
        statusCode: 200,
      });

      const res = await notificationService.getNotifications(0, 50);

      expect(getSpy).toHaveBeenCalledWith('/notifications?page=0&size=50');
      expect(res.success).toBe(true);
      expect(res.data?.length).toBe(1);
      expect(res.data?.[0].title).toBe('Application Shortlisted');
    });
  });

  describe('getUnreadCount', () => {
    test('calls GET /notifications/unread-count and returns count number', async () => {
      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        success: true,
        data: { unreadCount: 3 },
        statusCode: 200,
      });

      const res = await notificationService.getUnreadCount();

      expect(getSpy).toHaveBeenCalledWith('/notifications/unread-count');
      expect(res.success).toBe(true);
      expect(res.data).toBe(3);
    });
  });

  describe('markAsRead', () => {
    test('calls PATCH /notifications/{id}/read', async () => {
      const patchSpy = jest.spyOn(apiClient, 'patch').mockResolvedValueOnce({
        success: true,
        statusCode: 200,
      });

      const res = await notificationService.markAsRead('notif-101');

      expect(patchSpy).toHaveBeenCalledWith('/notifications/notif-101/read');
      expect(res.success).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    test('calls POST /notifications/mark-all-read', async () => {
      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
        success: true,
        statusCode: 200,
      });

      const res = await notificationService.markAllAsRead();

      expect(postSpy).toHaveBeenCalledWith('/notifications/mark-all-read');
      expect(res.success).toBe(true);
    });
  });
});

