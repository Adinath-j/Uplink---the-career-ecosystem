import { mentorService } from '../../src/services/mentorService';
import { apiClient } from '../../src/services/api/apiClient';
import { storage } from '../../src/services/api/tokenStorage';
import { Mentor, BookingRequest } from '../../src/types/models';

describe('mentorService', () => {
  beforeEach(() => {
    storage.clearAll();
    jest.clearAllMocks();
  });

  const mockMentor: Mentor = {
    id: 'm-101',
    name: 'Priya Sharma',
    avatar: 'https://example.com/avatar.png',
    designation: 'Senior SDE',
    organization: 'Microsoft',
    domains: ['Engineering', 'Cloud'],
    yearsOfExperience: 6,
    skills: ['Java', 'Distributed Systems', 'Kubernetes'],
    isAvailable: true,
    availableDays: 'Mon, Wed, Fri',
    bio: 'Helping engineers scale systems and prepare for interviews.',
  };

  const mockBooking: BookingRequest = {
    id: 'br-501',
    mentorId: 'm-101',
    mentorName: 'Priya Sharma',
    mentorRole: 'Senior SDE • Microsoft',
    preferredTime: 'Wed 7:00 PM',
    topic: 'System Design Mock',
    message: 'Looking for feedback on designing a URL shortener.',
    status: 'REQUESTED',
    createdAt: '2026-10-04T10:00:00Z',
  };

  describe('Live API mode', () => {
    test('getMentors calls /mentors with query parameters and handles SpringPage', async () => {
      const mockPage = {
        content: [mockMentor],
        totalElements: 1,
        totalPages: 1,
        size: 20,
        number: 0,
      };

      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        success: true,
        data: mockPage,
        statusCode: 200,
      });

      const res = await mentorService.getMentors({
        domain: 'Engineering',
        search: 'Priya',
      });

      expect(getSpy).toHaveBeenCalledWith(
        expect.stringContaining('/mentors?domain=Engineering&search=Priya')
      );
      expect(res.success).toBe(true);
      expect(res.data?.length).toBe(1);
      expect(res.data?.[0].name).toBe('Priya Sharma');
    });

    test('getMentorById calls /mentors/{id}', async () => {
      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        success: true,
        data: mockMentor,
        statusCode: 200,
      });

      const res = await mentorService.getMentorById('m-101');
      expect(getSpy).toHaveBeenCalledWith('/mentors/m-101');
      expect(res.success).toBe(true);
      expect(res.data?.id).toBe('m-101');
    });

    test('requestBooking calls POST /mentors/{mentorId}/bookings', async () => {
      const payload = {
        mentorId: 'm-101',
        mentorName: 'Priya Sharma',
        mentorRole: 'Senior SDE • Microsoft',
        preferredTime: 'Wed 7:00 PM',
        topic: 'System Design Mock',
        message: 'Looking for feedback on designing a URL shortener.',
      };

      const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
        success: true,
        data: mockBooking,
        statusCode: 201,
      });

      const res = await mentorService.requestBooking(payload);
      expect(postSpy).toHaveBeenCalledWith('/mentors/m-101/bookings', payload);
      expect(res.success).toBe(true);
      expect(res.data?.id).toBe('br-501');
      expect(res.data?.status).toBe('REQUESTED');
    });

    test('getMyBookingRequests calls GET /mentors/bookings/my', async () => {
      const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
        success: true,
        data: [mockBooking],
        statusCode: 200,
      });

      const res = await mentorService.getMyBookingRequests();
      expect(getSpy).toHaveBeenCalledWith('/mentors/bookings/my');
      expect(res.success).toBe(true);
      expect(res.data?.length).toBe(1);
      expect(res.data?.[0].topic).toBe('System Design Mock');
    });

    test('getMentors falls back to /content/feed?type=MENTOR when /mentors returns 500/404', async () => {
      jest.spyOn(apiClient, 'get')
        .mockResolvedValueOnce({
          success: false,
          error: 'No static resource api/mentors',
          statusCode: 500,
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            content: [
              {
                post: {
                  id: 'post-mentor-1',
                  content: JSON.stringify({
                    id: 'm-live-1',
                    name: 'Kavita Sundaram',
                    designation: 'Staff SRE',
                    organization: 'Google',
                    domains: ['Engineering', 'System Design'],
                    skills: ['Go', 'K8s'],
                    yearsOfExperience: 7,
                    isAvailable: true,
                  }),
                  type: 'MENTOR',
                },
              },
            ],
          },
          statusCode: 200,
        });

      const res = await mentorService.getMentors();
      expect(res.success).toBe(true);
      expect(res.data?.length).toBe(1);
      expect(res.data?.[0].name).toBe('Kavita Sundaram');
      expect(res.data?.[0].organization).toBe('Google');
    });

    test('requestBooking falls back to /content/posts with type=MENTOR_BOOKING when /mentors bookings fails', async () => {
      jest.spyOn(apiClient, 'post')
        .mockResolvedValueOnce({
          success: false,
          error: 'No static resource',
          statusCode: 500,
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            post: {
              id: 'booking-post-1',
              content: '{"status":"REQUESTED"}',
              type: 'MENTOR_BOOKING',
            },
          },
          statusCode: 200,
        });

      const res = await mentorService.requestBooking({
        mentorId: 'm-live-1',
        mentorName: 'Kavita Sundaram',
        mentorRole: 'Staff SRE',
        preferredTime: 'Saturday 11 AM',
        topic: 'Architecture Review',
        message: 'Looking for advice on telemetry',
      });

      expect(res.success).toBe(true);
      expect(res.data?.mentorName).toBe('Kavita Sundaram');
      expect(res.data?.status).toBe('REQUESTED');
    });
  });
});
