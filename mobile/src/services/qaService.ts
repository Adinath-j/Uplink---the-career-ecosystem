import { apiClient, ApiResponse } from './api/apiClient';
import { Question, Answer, QAFeedTab, QATopic } from '../types/models';
import { MOCK_QUESTIONS, MOCK_ANSWERS } from './mockData/questions';
import { ENV } from '../config/env';
import { delay } from '../utils/delay';

class QAService {
  private inMemoryQuestions: Question[] = [...MOCK_QUESTIONS];
  private inMemoryAnswers: Record<string, Answer[]> = { ...MOCK_ANSWERS };

  /**
   * Fetch questions for the specified feed tab, topic filter, and optional search text.
   */
  async getQuestions(params?: {
    tab?: QAFeedTab;
    topic?: QATopic | 'All';
    search?: string;
  }): Promise<ApiResponse<Question[]>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(250);
      let list = [...this.inMemoryQuestions];

      // Tab filter
      const tab = params?.tab || 'For You';
      if (tab === 'Unanswered') {
        list = list.filter((q) => q.answerCount === 0 || q.isUnanswered);
      } else if (tab === 'Trending') {
        // Transparent sort by activity signals (same-doubt count + answer count)
        list = list.sort(
          (a, b) => b.sameDoubtCount + b.answerCount - (a.sameDoubtCount + a.answerCount)
        );
      } else if (tab === 'My Questions') {
        list = list.filter((q) => q.authorId === 'u-current');
      }

      // Topic filter
      if (params?.topic && params.topic !== 'All') {
        list = list.filter((q) => q.topicTags.includes(params.topic as string));
      }

      // Search filter
      if (params?.search && params.search.trim()) {
        const query = params.search.toLowerCase().trim();
        list = list.filter(
          (q) =>
            q.title.toLowerCase().includes(query) ||
            q.description.toLowerCase().includes(query) ||
            q.topicTags.some((t) => t.toLowerCase().includes(query))
        );
      }

      return { success: true, data: list, statusCode: 200 };
    }

    const queryParams = new URLSearchParams();
    if (params?.tab) queryParams.append('tab', params.tab);
    if (params?.topic && params.topic !== 'All') queryParams.append('topic', params.topic);
    if (params?.search) queryParams.append('search', params.search);

    return apiClient.get<Question[]>(`/questions?${queryParams.toString()}`);
  }

  /**
   * Fetch single question by ID.
   */
  async getQuestionById(id: string): Promise<ApiResponse<Question>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(150);
      const q = this.inMemoryQuestions.find((item) => item.id === id);
      if (!q) {
        return { success: false, error: 'Question not found', statusCode: 404 };
      }
      return { success: true, data: q, statusCode: 200 };
    }

    return apiClient.get<Question>(`/questions/${id}`);
  }

  /**
   * Fetch answers for a given question.
   */
  async getAnswers(questionId: string): Promise<ApiResponse<Answer[]>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(200);
      const answers = this.inMemoryAnswers[questionId] || [];
      return { success: true, data: answers, statusCode: 200 };
    }

    return apiClient.get<Answer[]>(`/questions/${questionId}/answers`);
  }

  /**
   * Toggle the "I have the same doubt" signal (one per student per question).
   */
  async toggleSameDoubt(questionId: string): Promise<ApiResponse<{ hasMarked: boolean; count: number }>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(150);
      const index = this.inMemoryQuestions.findIndex((q) => q.id === questionId);
      if (index === -1) {
        return { success: false, error: 'Question not found', statusCode: 404 };
      }

      const q = this.inMemoryQuestions[index];
      const nextState = !q.hasUserMarkedSameDoubt;
      const nextCount = nextState ? q.sameDoubtCount + 1 : Math.max(0, q.sameDoubtCount - 1);

      this.inMemoryQuestions[index] = {
        ...q,
        hasUserMarkedSameDoubt: nextState,
        sameDoubtCount: nextCount,
      };

      return {
        success: true,
        data: { hasMarked: nextState, count: nextCount },
        statusCode: 200,
      };
    }

    return apiClient.post<{ hasMarked: boolean; count: number }>(`/questions/${questionId}/same-doubt`);
  }

  /**
   * Submit a new question.
   */
  async askQuestion(payload: {
    title: string;
    description: string;
    topicTags: string[];
    authorName?: string;
    authorAcademicContext?: string;
  }): Promise<ApiResponse<Question>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(500);
      const newQuestion: Question = {
        id: `q-${Date.now()}`,
        title: payload.title,
        description: payload.description,
        topicTags: payload.topicTags,
        authorId: 'u-current',
        authorName: payload.authorName || 'Aditya Verma',
        authorAcademicContext: payload.authorAcademicContext || 'B.Tech CSE • Year 3',
        createdAt: new Date().toISOString(),
        answerCount: 0,
        sameDoubtCount: 0,
        hasUserMarkedSameDoubt: false,
        isUnanswered: true,
      };

      this.inMemoryQuestions.unshift(newQuestion);
      this.inMemoryAnswers[newQuestion.id] = [];

      return { success: true, data: newQuestion, statusCode: 201 };
    }

    return apiClient.post<Question>('/questions', payload);
  }

  /**
   * Post an answer to a question.
   */
  async postAnswer(questionId: string, content: string): Promise<ApiResponse<Answer>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(400);
      const newAnswer: Answer = {
        id: `ans-${Date.now()}`,
        questionId,
        authorId: 'u-current',
        authorName: 'Aditya Verma',
        authorRole: 'B.Tech CSE • Year 3',
        content,
        createdAt: new Date().toISOString(),
        helpfulCount: 0,
        isAccepted: false,
        hasUserMarkedHelpful: false,
      };

      if (!this.inMemoryAnswers[questionId]) {
        this.inMemoryAnswers[questionId] = [];
      }
      this.inMemoryAnswers[questionId].push(newAnswer);

      // Update question answer count
      const qIndex = this.inMemoryQuestions.findIndex((q) => q.id === questionId);
      if (qIndex !== -1) {
        this.inMemoryQuestions[qIndex] = {
          ...this.inMemoryQuestions[qIndex],
          answerCount: this.inMemoryQuestions[qIndex].answerCount + 1,
          isUnanswered: false,
        };
      }

      return { success: true, data: newAnswer, statusCode: 201 };
    }

    return apiClient.post<Answer>(`/questions/${questionId}/answers`, { content });
  }

  /**
   * Toggle helpful signal on an answer.
   */
  async toggleHelpful(questionId: string, answerId: string): Promise<ApiResponse<Answer>> {
    if (ENV.USE_MOCK_DATA) {
      await delay(150);
      const answers = this.inMemoryAnswers[questionId] || [];
      const index = answers.findIndex((a) => a.id === answerId);
      if (index === -1) {
        return { success: false, error: 'Answer not found', statusCode: 404 };
      }

      const ans = answers[index];
      const nextHelpful = !ans.hasUserMarkedHelpful;
      const updated: Answer = {
        ...ans,
        hasUserMarkedHelpful: nextHelpful,
        helpfulCount: nextHelpful ? ans.helpfulCount + 1 : Math.max(0, ans.helpfulCount - 1),
      };

      answers[index] = updated;
      return { success: true, data: updated, statusCode: 200 };
    }

    return apiClient.post<Answer>(`/answers/${answerId}/helpful`);
  }
}

export const qaService = new QAService();
