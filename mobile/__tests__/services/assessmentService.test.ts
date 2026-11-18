import {
  assessmentService,
  BackendAssessment,
  AssessmentResultDto,
} from '../../src/services/assessmentService';
import { apiClient } from '../../src/services/api/apiClient';

describe('assessmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAssessment: BackendAssessment = {
    id: 'assess-101',
    title: 'Core Java & Data Structures',
    description: 'Evaluate fundamental algorithms and JVM principles',
    durationMinutes: 45,
    category: 'Backend',
    isActive: true,
    questions: [
      {
        id: 'q-1',
        questionText: 'What is the time complexity of lookup in HashMap?',
        points: 5,
      },
    ],
  };

  const mockResult: AssessmentResultDto = {
    attemptId: 'att-1',
    assessmentId: 'assess-101',
    assessmentTitle: 'Core Java & Data Structures',
    score: 85,
    totalMarks: 100,
    percentage: 85,
    passed: true,
  };

  test('getAssessments calls GET /assessments and returns page content', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: {
        content: [mockAssessment],
        totalElements: 1,
      },
      statusCode: 200,
    });

    const res = await assessmentService.getAssessments(0, 20);
    expect(getSpy).toHaveBeenCalledWith('/assessments?page=0&size=20');
    expect(res.success).toBe(true);
    expect(res.data?.length).toBe(1);
    expect(res.data?.[0].title).toBe('Core Java & Data Structures');
  });

  test('getAssessmentById calls GET /assessments/{id}', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: mockAssessment,
      statusCode: 200,
    });

    const res = await assessmentService.getAssessmentById('assess-101');
    expect(getSpy).toHaveBeenCalledWith('/assessments/assess-101');
    expect(res.success).toBe(true);
    expect(res.data?.id).toBe('assess-101');
  });

  test('submitAssessment calls POST /assessments/submit', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: mockResult,
      statusCode: 200,
    });

    const res = await assessmentService.submitAssessment({
      assessmentId: 'assess-101',
      answers: { 'q-1': 'O(1)' },
    });

    expect(postSpy).toHaveBeenCalledWith('/assessments/submit', {
      assessmentId: 'assess-101',
      answers: { 'q-1': 'O(1)' },
    });
    expect(res.success).toBe(true);
    expect(res.data?.passed).toBe(true);
  });

  test('getSkillGapAnalysis calls GET /assessments/skill-gap-analysis with targetRole', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: {
        targetRole: 'Backend Engineer',
        matchPercentage: 78.5,
        userSkills: ['Java', 'Spring Boot'],
        requiredRoleSkills: ['Java', 'Spring Boot', 'Kubernetes'],
        missingSkills: ['Kubernetes'],
        recommendedCoursesOrAssessments: ['Kubernetes Fundamentals'],
      },
      statusCode: 200,
    });

    const res = await assessmentService.getSkillGapAnalysis('Backend Engineer');
    expect(getSpy).toHaveBeenCalledWith(
      '/assessments/skill-gap-analysis?targetRole=Backend%20Engineer'
    );
    expect(res.success).toBe(true);
    expect(res.data?.missingSkills).toEqual(['Kubernetes']);
  });
});

