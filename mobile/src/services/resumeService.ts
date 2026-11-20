import { apiClient } from './api/apiClient';
import { ENV } from '../config/env';

export interface ResumeGenerateRequest {
  template: 'MODERN' | 'CLASSIC' | 'ACADEMIC' | 'EXECUTIVE' | string;
  targetRole?: string;
  includeProjects?: boolean;
  includeCertifications?: boolean;
  includeAchievements?: boolean;
}

export interface ResumeDto {
  id: string;
  documentId?: string;
  userId: string;
  version: number;
  template: string;
  targetJobTitle?: string;
  fileName?: string;
  latexSource: string;
  pdfUrl?: string;
  pdfDownloadUrl?: string;
  createdAt?: string;
  generatedAt?: string;
}

export const resumeService = {
  /**
   * Generates a tailored resume with PDF compilation and Cloudinary upload
   */
  async generateResume(request: ResumeGenerateRequest): Promise<ResumeDto> {
    const res = await apiClient.post<ResumeDto>('/resume/generate', request);
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error || 'Failed to generate resume');
  },

  /**
   * Fetches all generated resumes for the logged in user
   */
  async getMyResumes(): Promise<ResumeDto[]> {
    const res = await apiClient.get<ResumeDto[]>('/resume');
    if (res.success && res.data) {
      return res.data;
    }
    return [];
  },

  /**
   * Deletes a generated resume by document ID
   */
  async deleteResume(documentId: string): Promise<void> {
    const res = await apiClient.delete<void>(`/resume/${documentId}`);
    if (!res.success) {
      throw new Error(res.error || 'Failed to delete resume');
    }
  },

  /**
   * Get resume download URL
   */
  getResumeDownloadUrl(userId: string, version: number = 1): string {
    return `${ENV.API_BASE_URL}/resume/download/${userId}?version=${version}`;
  },
};
