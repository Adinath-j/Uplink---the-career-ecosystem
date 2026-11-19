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
  userId: string;
  version: number;
  template: string;
  latexSource: string;
  pdfDownloadUrl?: string;
  generatedAt?: string;
}

export const resumeService = {
  /**
   * Generates a tailored resume with LaTeX compilation and PDF download link
   */
  async generateResume(request: ResumeGenerateRequest): Promise<ResumeDto> {
    const res = await apiClient.post<ResumeDto>('/resume/generate', request);
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error || 'Failed to generate resume');
  },

  /**
   * Get resume download URL
   */
  getResumeDownloadUrl(userId: string, version: number = 1): string {
    return `${ENV.API_BASE_URL}/resume/download/${userId}?version=${version}`;
  },
};
