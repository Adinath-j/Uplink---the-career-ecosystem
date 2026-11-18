import { create } from 'zustand';
import {
  assessmentService,
  BackendAssessment,
  AssessmentAttempt,
  AssessmentResultDto,
  SkillGapReportDto,
} from '../services/assessmentService';

interface AssessmentState {
  assessments: BackendAssessment[];
  currentAssessment: BackendAssessment | null;
  myAttempts: AssessmentAttempt[];
  skillGap: SkillGapReportDto | null;
  isLoadingAssessments: boolean;
  isLoadingDetail: boolean;
  isSubmitting: boolean;
  latestResult: AssessmentResultDto | null;
  error: string | null;

  fetchAssessments: () => Promise<void>;
  fetchAssessmentDetail: (id: string) => Promise<void>;
  fetchMyAttempts: () => Promise<void>;
  submitAnswers: (
    assessmentId: string,
    answers: Record<string, string>
  ) => Promise<AssessmentResultDto | null>;
  fetchSkillGap: (targetRole: string) => Promise<void>;
  clearResult: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  assessments: [],
  currentAssessment: null,
  myAttempts: [],
  skillGap: null,
  isLoadingAssessments: false,
  isLoadingDetail: false,
  isSubmitting: false,
  latestResult: null,
  error: null,

  fetchAssessments: async () => {
    set({ isLoadingAssessments: true, error: null });
    const res = await assessmentService.getAssessments();
    if (res.success && res.data) {
      set({
        assessments: res.data,
        isLoadingAssessments: false,
        error: null,
      });
    } else {
      set({
        isLoadingAssessments: false,
        error: res.error || 'Failed to load assessments.',
      });
    }
  },

  fetchAssessmentDetail: async (id: string) => {
    set({ isLoadingDetail: true, error: null, currentAssessment: null });
    const res = await assessmentService.getAssessmentById(id);
    if (res.success && res.data) {
      set({
        currentAssessment: res.data,
        isLoadingDetail: false,
        error: null,
      });
    } else {
      set({
        currentAssessment: null,
        isLoadingDetail: false,
        error: res.error || 'Failed to load assessment details',
      });
    }
  },

  fetchMyAttempts: async () => {
    const res = await assessmentService.getMyAttempts();
    if (res.success && res.data) {
      set({ myAttempts: res.data });
    }
  },

  submitAnswers: async (assessmentId: string, answers: Record<string, string>) => {
    set({ isSubmitting: true });
    const res = await assessmentService.submitAssessment({
      assessmentId,
      answers,
    });

    if (res.success && res.data) {
      set({ latestResult: res.data, isSubmitting: false });
      return res.data;
    }

    set({
      latestResult: null,
      isSubmitting: false,
      error: res.error || 'Failed to submit assessment answers',
    });
    return null;
  },

  fetchSkillGap: async (targetRole: string) => {
    const res = await assessmentService.getSkillGapAnalysis(targetRole);
    if (res.success && res.data) {
      set({ skillGap: res.data });
    }
  },

  clearResult: () => set({ latestResult: null }),
}));
