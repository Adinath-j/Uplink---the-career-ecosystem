import { apiClient, ApiResponse } from './api/apiClient';
import { Mentor, BookingRequest } from '../types/models';
import { MOCK_MENTORS, MOCK_BOOKING_REQUESTS } from './mockData/mentors';
import { ENV } from '../config/env';
import { delay } from '../utils/delay';

class MentorService {
  private inMemoryMentors: Mentor[] = [...MOCK_MENTORS];
  private inMemoryBookings: BookingRequest[] = [...MOCK_BOOKING_REQUESTS];

  /**
   * Fetch mentors with optional domain filter and search query.
   */
  async getMentors(params?: {
    domain?: string;
    search?: string;
  }): Promise<ApiResponse<Mentor[]>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(200);
      let results = [...this.inMemoryMentors];

      if (params?.domain && params.domain !== 'All') {
        results = results.filter((m) => m.domains.includes(params.domain!));
      }

      if (params?.search && params.search.trim()) {
        const query = params.search.toLowerCase().trim();
        results = results.filter(
          (m) =>
            m.name.toLowerCase().includes(query) ||
            m.organization.toLowerCase().includes(query) ||
            m.designation.toLowerCase().includes(query) ||
            m.skills.some((s) => s.toLowerCase().includes(query))
        );
      }

      return { success: true, data: results, statusCode: 200 };
    }

    const queryParams = new URLSearchParams();
    if (params?.domain && params.domain !== 'All') queryParams.append('domain', params.domain);
    if (params?.search) queryParams.append('search', params.search);

    return apiClient.get<Mentor[]>(`/mentors?${queryParams.toString()}`);
  }

  /**
   * Fetch a single mentor by ID.
   */
  async getMentorById(id: string): Promise<ApiResponse<Mentor>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(150);
      const m = this.inMemoryMentors.find((item) => item.id === id);
      if (!m) {
        return { success: false, error: 'Mentor not found', statusCode: 404 };
      }
      return { success: true, data: m, statusCode: 200 };
    }

    return apiClient.get<Mentor>(`/mentors/${id}`);
  }

  /**
   * Submit a mentorship session booking request.
   */
  async requestBooking(payload: {
    mentorId: string;
    mentorName: string;
    mentorRole: string;
    preferredTime: string;
    topic: string;
    message: string;
  }): Promise<ApiResponse<BookingRequest>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(450);

      const newBooking: BookingRequest = {
        id: `br-${Date.now()}`,
        mentorId: payload.mentorId,
        mentorName: payload.mentorName,
        mentorRole: payload.mentorRole,
        preferredTime: payload.preferredTime,
        topic: payload.topic,
        message: payload.message,
        status: 'REQUESTED',
        createdAt: new Date().toISOString(),
      };

      this.inMemoryBookings.unshift(newBooking);
      return { success: true, data: newBooking, statusCode: 201 };
    }

    return apiClient.post<BookingRequest>(`/mentors/${payload.mentorId}/bookings`, payload);
  }

  /**
   * Get all booking requests for the active student.
   */
  async getMyBookingRequests(): Promise<ApiResponse<BookingRequest[]>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(200);
      return { success: true, data: this.inMemoryBookings, statusCode: 200 };
    }

    return apiClient.get<BookingRequest[]>('/students/me/bookings');
  }
}

export const mentorService = new MentorService();
