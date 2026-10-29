import { apiClient, ApiResponse } from './api/apiClient';
import { StudentProfile } from '../types/models';
import { MOCK_STUDENT_PROFILE } from './mockData/profile';
import { ENV } from '../config/env';
import { delay } from '../utils/delay';

class ProfileService {
  private inMemoryProfile: StudentProfile = { ...MOCK_STUDENT_PROFILE };

  /**
   * Fetch current authenticated student profile.
   */
  async getMyProfile(): Promise<ApiResponse<StudentProfile>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(200);
      return { success: true, data: this.inMemoryProfile, statusCode: 200 };
    }

    return apiClient.get<StudentProfile>('/students/me');
  }

  /**
   * Update student profile fields.
   */
  async updateProfile(updates: Partial<StudentProfile>): Promise<ApiResponse<StudentProfile>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(400);
      this.inMemoryProfile = {
        ...this.inMemoryProfile,
        ...updates,
      };
      return { success: true, data: this.inMemoryProfile, statusCode: 200 };
    }

    return apiClient.put<StudentProfile>('/students/me', updates);
  }
}

export const profileService = new ProfileService();
