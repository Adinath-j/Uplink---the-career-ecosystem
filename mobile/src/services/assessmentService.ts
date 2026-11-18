import { apiClient, ApiResponse } from './api/apiClient';

export interface AssessmentQuestion {
  id: string;
  questionText: string;
  questionType?: string; // MULTIPLE_CHOICE, CODING
  optionsJson?: string;
  points?: number;
  orderIndex?: number;
}

export interface BackendAssessment {
  id: string;
  title: string;
  description?: string;
  category?: string;
  durationMinutes?: number;
  isActive?: boolean;
  createdAt?: string;
  questions?: AssessmentQuestion[];
}

export interface SubmitAssessmentRequest {
  assessmentId: string;
  answers: Record<string, string>;
}

export interface AssessmentResultDto {
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  submittedAt?: string;
}

export interface AssessmentAttempt {
  id: string;
  assessment?: BackendAssessment;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  attemptedAt?: string;
}

export interface SkillGapReportDto {
  targetRole: string;
  matchPercentage: number;
  userSkills: string[];
  requiredRoleSkills: string[];
  missingSkills: string[];
  recommendedCoursesOrAssessments: string[];
}

export interface SpringPage<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

class AssessmentService {
  /**
   * List all active skill assessments (paginated).
   * Calls GET /assessments
   */
  async getAssessments(page: number = 0, size: number = 20): Promise<ApiResponse<BackendAssessment[]>> {
    const res = await apiClient.get<SpringPage<BackendAssessment> | BackendAssessment[]>(
      `/assessments?page=${page}&size=${size}`
    );

    if (res.success && res.data) {
      const list: BackendAssessment[] = Array.isArray(res.data)
        ? res.data
        : (res.data as SpringPage<BackendAssessment>).content || [];

      return { success: true, data: list, statusCode: res.statusCode };
    }

    return {
      success: false,
      error: res.error || 'Failed to retrieve assessments',
      statusCode: res.statusCode,
    };
  }

  /**
   * Get single assessment with questions by ID.
   * Calls GET /assessments/{id}
   */
  async getAssessmentById(id: string): Promise<ApiResponse<BackendAssessment>> {
    return apiClient.get<BackendAssessment>(`/assessments/${id}`);
  }

  /**
   * Submit assessment answers for evaluation.
   * Calls POST /assessments/submit
   */
  async submitAssessment(request: SubmitAssessmentRequest): Promise<ApiResponse<AssessmentResultDto>> {
    return apiClient.post<AssessmentResultDto>('/assessments/submit', request);
  }

  /**
   * Get historical assessment attempts for current student.
   * Calls GET /assessments/my-attempts
   */
  async getMyAttempts(): Promise<ApiResponse<AssessmentAttempt[]>> {
    return apiClient.get<AssessmentAttempt[]>('/assessments/my-attempts');
  }

  /**
   * Analyze skill gap against target role.
   * Calls GET /assessments/skill-gap-analysis?targetRole=...
   */
  async getSkillGapAnalysis(targetRole: string): Promise<ApiResponse<SkillGapReportDto>> {
    return apiClient.get<SkillGapReportDto>(
      `/assessments/skill-gap-analysis?targetRole=${encodeURIComponent(targetRole)}`
    );
  }
}

export const assessmentService = new AssessmentService();

