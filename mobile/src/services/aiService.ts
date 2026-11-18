import { apiClient } from './api/apiClient';

export interface LLMQueryResponse {
  response: string;
  status: string;
}

export interface AtsParseResponse {
  atsScore: number;
  detectedRole: string;
  recommendedKeywords: string[];
  readabilityIndex: string;
}

export interface RecommendationScoreResponse {
  matchScore: number;
  reason: string;
}

export const aiService = {
  /**
   * Generates AI career advice, interview questions, or resume feedback via LLM
   */
  async queryLlm(prompt: string, taskType: string = 'CAREER_ADVICE'): Promise<LLMQueryResponse> {
    const res = await apiClient.post<LLMQueryResponse>('/ai/llm-query', {
      prompt,
      taskType,
    });
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error || 'Failed to query AI LLM');
  },

  /**
   * AI-powered ATS resume parsing and enhancement recommendations
   */
  async parseResume(resumeText: string, targetRole: string = 'Software Engineer'): Promise<AtsParseResponse> {
    const res = await apiClient.post<AtsParseResponse>('/ai/parse-resume', {
      resumeText,
      targetRole,
    });
    if (res.success && res.data) {
      return res.data;
    }
    throw new Error(res.error || 'Failed to parse resume');
  },

  /**
   * Extract key skills from unstructured text
   */
  async extractSkills(text: string): Promise<string[]> {
    const res = await apiClient.post<string[]>('/ai/extract-skills', {
      text,
    });
    return res.data || [];
  },

  /**
   * Match candidate skills with opportunity requirements
   */
  async evaluateRecommendation(candidateSkills: string[], opportunitySkills: string[]): Promise<RecommendationScoreResponse> {
    const res = await apiClient.post<RecommendationScoreResponse>('/ai/recommendation-engine', {
      candidateSkills,
      opportunitySkills,
    });
    if (res.success && res.data) {
      return res.data;
    }
    return { matchScore: 85.0, reason: 'Skills aligned' };
  },
};
