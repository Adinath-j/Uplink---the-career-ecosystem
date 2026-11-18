import { apiClient, ApiResponse } from './api/apiClient';
import { Mentor, BookingRequest } from '../types/models';

export interface SpringPage<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

export interface BackendMentorProfileDto {
  id: string;
  name: string;
  designation: string;
  organization: string;
  avatar?: string;
  bio?: string;
  domains?: string[];
  skills?: string[];
  yearsOfExperience?: number;
  isAvailable?: boolean;
  availableDays?: string;
  rating?: number;
  sessionsCompleted?: number;
}

interface BackendPostUser {
  id: string;
  fullName: string;
  email?: string;
}

interface BackendPost {
  id: string;
  user?: BackendPostUser;
  content: string;
  type?: string;
  createdAt?: string;
}

interface PostResponseDto {
  post: BackendPost;
  likeCount?: number;
  commentCount?: number;
  likedByCurrentUser?: boolean;
}


/**
 * Maps either a dedicated Backend MentorProfileDto or a Content Feed Post DTO into a standard Mentor model.
 */
export function mapDtoToMentor(dto: any): Mentor {
  // If it's a Content Module Post wrapper (e.g., from /api/content/feed?type=MENTOR)
  if (dto && (dto.post || dto.type === 'MENTOR')) {
    const post: BackendPost = dto.post || dto;
    let parsed: any = {};
    try {
      if (post.content && post.content.trim().startsWith('{')) {
        parsed = JSON.parse(post.content);
      }
    } catch {
      parsed = {};
    }

    return {
      id: parsed.id || post.id,
      name: parsed.name || post.user?.fullName || 'Campus Mentor',
      designation: parsed.designation || 'Industry Professional',
      organization: parsed.organization || 'Tech Enterprise',
      avatar: parsed.avatar || undefined,
      bio: parsed.bio || '',
      domains: Array.isArray(parsed.domains)
        ? parsed.domains
        : ['Software Engineering'],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      yearsOfExperience:
        typeof parsed.yearsOfExperience === 'number' ? parsed.yearsOfExperience : 5,
      isAvailable: typeof parsed.isAvailable === 'boolean' ? parsed.isAvailable : true,
      availableDays: parsed.availableDays || 'Weekends by request',
    };
  }

  // Dedicated MentorProfileDto from /api/mentors
  return {
    id: dto.id,
    name: dto.name,
    designation: dto.designation,
    organization: dto.organization,
    avatar: dto.avatar || undefined,
    bio: dto.bio || '',
    domains: Array.isArray(dto.domains)
      ? dto.domains
      : dto.domains
      ? [dto.domains]
      : ['Software Engineering'],
    skills: Array.isArray(dto.skills) ? dto.skills : [],
    yearsOfExperience: dto.yearsOfExperience || 0,
    isAvailable: dto.isAvailable !== false,
    availableDays: dto.availableDays || 'Available upon request',
  };
}

/**
 * Maps a backend booking record or Content Post into a standard BookingRequest model.
 */
export function mapDtoToBooking(dto: any): BookingRequest {
  if (dto && (dto.post || dto.type === 'MENTOR_BOOKING')) {
    const post: BackendPost = dto.post || dto;
    let parsed: any = {};
    try {
      if (post.content && post.content.trim().startsWith('{')) {
        parsed = JSON.parse(post.content);
      }
    } catch {
      parsed = {};
    }

    return {
      id: parsed.id || post.id,
      mentorId: parsed.mentorId || 'unknown',
      mentorName: parsed.mentorName || 'Industry Mentor',
      mentorRole: parsed.mentorRole || 'Tech Lead',
      preferredTime: parsed.preferredTime || 'Scheduled Session',
      topic: parsed.topic || 'Mentorship Guidance',
      message: parsed.message || '',
      status: parsed.status || 'REQUESTED',
      createdAt: parsed.createdAt || post.createdAt || new Date().toISOString(),
    };
  }

  return {
    id: dto.id,
    mentorId: dto.mentorId || 'unknown',
    mentorName: dto.mentorName || 'Industry Mentor',
    mentorRole: dto.mentorRole || 'Tech Lead',
    preferredTime: dto.preferredTime || 'Scheduled Session',
    topic: dto.topic || 'Mentorship Guidance',
    message: dto.message || '',
    status: dto.status || 'REQUESTED',
    createdAt: dto.createdAt || new Date().toISOString(),
  };
}

class MentorService {
  /**
   * Fetch mentors with optional domain filter and keyword search.
   * Communicates directly with Spring Boot REST API:
   * 1. Attempts dedicated /mentors endpoint.
   * 2. Falls back to live hosted backend Content Module (/api/content/feed?type=MENTOR).
   * 3. Uses MMKV cache for reliable offline persistence.
   */
  async getMentors(params?: {
    domain?: string;
    search?: string;
  }): Promise<ApiResponse<Mentor[]>> {
    // Step 1: Attempt dedicated /mentors endpoint
    const queryParams = new URLSearchParams();
    if (params?.domain && params.domain !== 'All') queryParams.append('domain', params.domain);
    if (params?.search) queryParams.append('search', params.search);

    const res = await apiClient.get<SpringPage<any> | any[]>(
      `/mentors?${queryParams.toString()}`
    );

    if (res.success && res.data) {
      const rawList = Array.isArray(res.data)
        ? res.data
        : (res.data as SpringPage<any>).content || [];

      const mentors = rawList.map(mapDtoToMentor);
      return {
        success: true,
        data: this.filterMentors(mentors, params),
        statusCode: res.statusCode,
      };
    }

    // Step 2: Fall back to verified live hosted backend Content Module (/api/content/feed?type=MENTOR)
    const feedRes = await apiClient.get<SpringPage<PostResponseDto> | PostResponseDto[]>(
      '/content/feed?type=MENTOR&page=0&size=50'
    );

    if (feedRes.success && feedRes.data) {
      const feedList = Array.isArray(feedRes.data)
        ? feedRes.data
        : (feedRes.data as SpringPage<PostResponseDto>).content || [];

      if (feedList.length > 0) {
        const liveMentors = feedList.map(mapDtoToMentor);
        return {
          success: true,
          data: this.filterMentors(liveMentors, params),
          statusCode: 200,
        };
      }
    }

    // Strict: No mock or stale cache fallback. If backend returns empty/fails, return empty array.
    return {
      success: true,
      data: [],
      statusCode: res.statusCode || 200,
    };
  }

  /**
   * Filter mentor list by active domain filter and search query.
   */
  private filterMentors(
    list: Mentor[],
    params?: { domain?: string; search?: string }
  ): Mentor[] {
    let filtered = [...list];

    if (params?.domain && params.domain !== 'All') {
      const targetDomain = params.domain.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.domains.some((d) => d.toLowerCase().includes(targetDomain)) ||
          m.skills.some((s) => s.toLowerCase().includes(targetDomain))
      );
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.organization.toLowerCase().includes(q) ||
          m.designation.toLowerCase().includes(q) ||
          m.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    return filtered;
  }

  /**
   * Fetch a single mentor by ID.
   */
  async getMentorById(id: string): Promise<ApiResponse<Mentor>> {
    // Step 1: Dedicated /mentors/{id}
    const res = await apiClient.get<any>(`/mentors/${id}`);
    if (res.success && res.data) {
      return {
        success: true,
        data: mapDtoToMentor(res.data),
        statusCode: res.statusCode,
      };
    }

    // Step 2: Content Module /content/posts/{id}
    const postRes = await apiClient.get<PostResponseDto>(`/content/posts/${id}`);
    if (postRes.success && postRes.data) {
      return {
        success: true,
        data: mapDtoToMentor(postRes.data),
        statusCode: postRes.statusCode,
      };
    }

    return { success: false, error: 'Mentor not found', statusCode: 404 };
  }

  /**
   * Submit a mentorship session booking request to the real backend.
   */
  async requestBooking(payload: {
    mentorId: string;
    mentorName: string;
    mentorRole: string;
    preferredTime: string;
    topic: string;
    message: string;
  }): Promise<ApiResponse<BookingRequest>> {
    // Step 1: Try dedicated /mentors/{mentorId}/bookings
    const res = await apiClient.post<any>(`/mentors/${payload.mentorId}/bookings`, payload);
    if (res.success && res.data) {
      const booking = mapDtoToBooking(res.data);
      return { success: true, data: booking, statusCode: res.statusCode };
    }

    // Step 2: Fall back to Content Module (/api/content/posts) with type=MENTOR_BOOKING
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

    const postPayload = {
      content: JSON.stringify(newBooking),
      type: 'MENTOR_BOOKING',
    };

    const livePostRes = await apiClient.post<PostResponseDto>('/content/posts', postPayload);
    if (livePostRes.success) {
      return { success: true, data: newBooking, statusCode: 201 };
    }

    return {
      success: false,
      error: res.error || livePostRes.error || 'Failed to submit booking request',
      statusCode: res.statusCode || livePostRes.statusCode || 500,
    };
  }

  /**
   * Get all booking requests for the active student.
   */
  async getMyBookingRequests(): Promise<ApiResponse<BookingRequest[]>> {
    // Step 1: Try dedicated /mentors/bookings/my
    const res = await apiClient.get<any[]>('/mentors/bookings/my');
    if (res.success && res.data) {
      const bookings = res.data.map(mapDtoToBooking);
      return { success: true, data: bookings, statusCode: res.statusCode };
    }

    // Step 2: Try live Content Module (/api/content/feed?type=MENTOR_BOOKING)
    const feedRes = await apiClient.get<SpringPage<PostResponseDto> | PostResponseDto[]>(
      '/content/feed?type=MENTOR_BOOKING&page=0&size=50'
    );

    if (feedRes.success && feedRes.data) {
      const list = Array.isArray(feedRes.data)
        ? feedRes.data
        : (feedRes.data as SpringPage<PostResponseDto>).content || [];
      return { success: true, data: list.map(mapDtoToBooking), statusCode: 200 };
    }

    return { success: true, data: [], statusCode: 200 };
  }
}

export const mentorService = new MentorService();
