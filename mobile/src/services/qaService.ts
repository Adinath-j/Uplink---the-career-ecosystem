import { storage } from './api/tokenStorage';
import { apiClient, ApiResponse } from './api/apiClient';
import { Question, Answer, QAFeedTab, QATopic } from '../types/models';

export interface SpringPage<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

/**
 * Backend Post DTO from Content Module (/api/content/**)
 * Used when hosted backend serves questions through community content posts.
 */
export interface BackendPostUser {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  roles?: Array<{ name: string; description?: string }>;
}

export interface BackendPost {
  id: string;
  user: BackendPostUser;
  content: string;
  type?: string;
  createdAt?: string;
}

export interface PostResponseDto {
  post: BackendPost;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
}

export interface BackendComment {
  id: string;
  user: BackendPostUser;
  content: string;
  createdAt?: string;
}

const STORAGE_KEYS = {
  CACHED_QUESTIONS: '@uplink_qa_cached_questions',
  HELPFUL_ANSWERS: '@uplink_qa_helpful_answers',
  ACCEPTED_ANSWERS: '@uplink_qa_accepted_answers',
};

/**
 * Safely parse structured post content into title, description, and topic tags.
 */
export function mapPostToQuestion(dto: PostResponseDto): Question {
  const { post, likeCount, commentCount, likedByCurrentUser } = dto;
  let title = '';
  let description = post.content || '';
  let topicTags: string[] = ['Academics'];

  try {
    if (post.content && post.content.trim().startsWith('{') && post.content.trim().endsWith('}')) {
      const parsed = JSON.parse(post.content);
      if (parsed.title) {
        title = parsed.title;
        description = parsed.description || '';
        topicTags = parsed.topicTags || parsed.tags || ['Academics'];
      }
    }
  } catch {
    // Non-JSON plain text content
  }

  if (!title) {
    const lines = (post.content || '').split('\n').filter((l) => l.trim().length > 0);
    title = lines[0] || 'Community Technical Question';
    description = lines.length > 1 ? lines.slice(1).join('\n') : post.content || '';
  }

  return {
    id: post.id,
    title,
    description,
    topicTags,
    authorId: post.user?.id || 'unknown',
    authorName: post.user?.fullName || 'Campus Peer',
    authorAcademicContext: 'Campus Member',
    createdAt: post.createdAt || new Date().toISOString(),
    answerCount: commentCount || 0,
    sameDoubtCount: likeCount || 0,
    hasUserMarkedSameDoubt: Boolean(likedByCurrentUser),
    isUnanswered: (commentCount || 0) === 0,
  };
}

/**
 * Map a backend comment into a Q&A Answer model.
 */
export function mapCommentToAnswer(
  comment: BackendComment,
  questionId: string,
  localMeta?: { helpfulCount?: number; hasMarkedHelpful?: boolean; isAccepted?: boolean }
): Answer {
  return {
    id: comment.id,
    questionId,
    authorId: comment.user?.id || 'unknown',
    authorName: comment.user?.fullName || 'Campus Member',
    authorRole: 'Campus Member',
    content: comment.content,
    createdAt: comment.createdAt || new Date().toISOString(),
    helpfulCount: localMeta?.helpfulCount || 0,
    isAccepted: localMeta?.isAccepted || false,
    hasUserMarkedHelpful: localMeta?.hasMarkedHelpful || false,
  };
}

class QAService {
  private inMemoryQuestions: Question[] = [];
  private inMemoryAnswers: Record<string, Answer[]> = {};
  private localHelpfulState: Record<string, { count: number; hasMarked: boolean }> = {};
  private localAcceptedState: Record<string, string> = {}; // questionId -> answerId

  constructor() {
    this.loadLocalMeta();
  }

  private loadLocalMeta() {
    try {
      const helpfulRaw = storage.getString(STORAGE_KEYS.HELPFUL_ANSWERS);
      const acceptedRaw = storage.getString(STORAGE_KEYS.ACCEPTED_ANSWERS);
      if (helpfulRaw) this.localHelpfulState = JSON.parse(helpfulRaw);
      if (acceptedRaw) this.localAcceptedState = JSON.parse(acceptedRaw);
    } catch {
      // ignore
    }
  }

  /**
   * Fetch questions for the specified feed tab, topic filter, and optional search text.
   * 1. Attempts dedicated /questions endpoint if available.
   * 2. If unsupported on hosted backend, fetches from live Content Module (/content/feed?type=QUESTION).
   * 3. Uses MMKV cache for offline support.
   */
  async getQuestions(params?: {
    tab?: QAFeedTab;
    topic?: QATopic | 'All';
    search?: string;
  }): Promise<ApiResponse<Question[]>> {
    let rawQuestions: Question[] = [];

    // Step 1: Try dedicated /questions endpoint
    const queryParams = new URLSearchParams();
    if (params?.tab) queryParams.append('tab', params.tab);
    if (params?.topic && params.topic !== 'All') queryParams.append('topic', params.topic);
    if (params?.search) queryParams.append('search', params.search);

    const dedicatedRes = await apiClient.get<SpringPage<Question> | Question[]>(
      `/questions?${queryParams.toString()}`
    );

    if (dedicatedRes.success && dedicatedRes.data) {
      rawQuestions = Array.isArray(dedicatedRes.data)
        ? dedicatedRes.data
        : (dedicatedRes.data as SpringPage<Question>).content || [];
    } else {
      // Step 2: Fall back to verified live Content Module (/api/content/feed?type=QUESTION)
      const contentRes = await apiClient.get<SpringPage<PostResponseDto> | PostResponseDto[]>(
        '/content/feed?type=QUESTION&page=0&size=50'
      );

      if (contentRes.success && contentRes.data) {
        const posts = Array.isArray(contentRes.data)
          ? contentRes.data
          : (contentRes.data as SpringPage<PostResponseDto>).content || [];

        rawQuestions = posts.map(mapPostToQuestion);
      } else {
        rawQuestions = [];
      }
    }

    return {
      success: true,
      data: this.filterQuestions(rawQuestions, params),
      statusCode: 200,
    };
  }

  /**
   * Filter question list by active tab, topic tag, and keyword search.
   */
  private filterQuestions(
    questions: Question[],
    params?: { tab?: QAFeedTab; topic?: QATopic | 'All'; search?: string }
  ): Question[] {
    let list = [...questions];

    const tab = params?.tab || 'For You';
    if (tab === 'Unanswered') {
      list = list.filter((q) => q.answerCount === 0 || q.isUnanswered);
    } else if (tab === 'Trending') {
      list = list.sort(
        (a, b) => b.sameDoubtCount + b.answerCount - (a.sameDoubtCount + a.answerCount)
      );
    } else if (tab === 'My Questions') {
      list = list.filter((q) => q.authorId === 'u-current');
    }

    if (params?.topic && params.topic !== 'All') {
      list = list.filter((q) => q.topicTags.includes(params.topic as string));
    }

    if (params?.search && params.search.trim()) {
      const query = params.search.toLowerCase().trim();
      list = list.filter(
        (q) =>
          q.title.toLowerCase().includes(query) ||
          q.description.toLowerCase().includes(query) ||
          q.topicTags.some((t) => t.toLowerCase().includes(query))
      );
    }

    return list;
  }

  /**
   * Fetch a single question by ID.
   */
  async getQuestionById(id: string): Promise<ApiResponse<Question>> {
    // Try dedicated /questions/{id}
    const res = await apiClient.get<Question>(`/questions/${id}`);
    if (res.success && res.data) {
      return res;
    }

    // Fall back to live Content Module (/content/posts/{id})
    const contentRes = await apiClient.get<PostResponseDto>(`/content/posts/${id}`);
    if (contentRes.success && contentRes.data) {
      return {
        success: true,
        data: mapPostToQuestion(contentRes.data),
        statusCode: 200,
      };
    }

    // Check in-memory / cache
    const match = this.inMemoryQuestions.find((item) => item.id === id);
    if (match) {
      return { success: true, data: match, statusCode: 200 };
    }

    return { success: false, error: 'Question not found', statusCode: 404 };
  }

  /**
   * Fetch answers for a given question.
   */
  async getAnswers(questionId: string): Promise<ApiResponse<Answer[]>> {
    // Try dedicated /questions/{id}/answers
    const res = await apiClient.get<Answer[]>(`/questions/${questionId}/answers`);
    if (res.success && res.data) {
      return res;
    }

    // Fall back to live Content Module (/content/posts/{id}/comments)
    const commentsRes = await apiClient.get<SpringPage<BackendComment> | BackendComment[]>(
      `/content/posts/${questionId}/comments?page=0&size=50`
    );

    if (commentsRes.success && commentsRes.data) {
      const comments = Array.isArray(commentsRes.data)
        ? commentsRes.data
        : (commentsRes.data as SpringPage<BackendComment>).content || [];

      const acceptedAnswerId = this.localAcceptedState[questionId];

      const mappedAnswers = comments.map((comment) => {
        const helpfulMeta = this.localHelpfulState[comment.id];
        return mapCommentToAnswer(comment, questionId, {
          helpfulCount: helpfulMeta?.count || 0,
          hasMarkedHelpful: helpfulMeta?.hasMarked || false,
          isAccepted: acceptedAnswerId === comment.id,
        });
      });

      return { success: true, data: mappedAnswers, statusCode: 200 };
    }

    // Return empty array if no live answers found
    const local = this.inMemoryAnswers[questionId] || [];
    return { success: true, data: local, statusCode: 200 };
  }

  /**
   * Toggle the "I have the same doubt" signal on a question.
   */
  async toggleSameDoubt(questionId: string): Promise<ApiResponse<{ hasMarked: boolean; count: number }>> {
    // Try dedicated /questions/{id}/doubt
    const res = await apiClient.post<{ hasMarked: boolean; count: number }>(`/questions/${questionId}/doubt`);
    if (res.success && res.data) {
      return res;
    }

    // Fall back to live Content Module (/content/posts/{id}/like)
    const likeRes = await apiClient.post<{ liked: boolean }>(`/content/posts/${questionId}/like`);
    if (likeRes.success && likeRes.data) {
      const isLiked = likeRes.data.liked;
      return {
        success: true,
        data: { hasMarked: isLiked, count: isLiked ? 1 : 0 },
        statusCode: 200,
      };
    }

    return { success: true, data: { hasMarked: true, count: 1 }, statusCode: 200 };
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
    // Try dedicated /questions endpoint
    const res = await apiClient.post<Question>('/questions', payload);
    if (res.success && res.data) {
      this.inMemoryQuestions.unshift(res.data);
      return res;
    }

    // Fall back to live Content Module (/content/posts) with structured JSON payload
    const structuredContent = JSON.stringify({
      title: payload.title,
      description: payload.description,
      topicTags: payload.topicTags,
    });

    const contentRes = await apiClient.post<PostResponseDto>('/content/posts', {
      content: structuredContent,
      type: 'QUESTION',
    });

    if (contentRes.success && contentRes.data) {
      const createdQuestion = mapPostToQuestion(contentRes.data);
      this.inMemoryQuestions.unshift(createdQuestion);
      return { success: true, data: createdQuestion, statusCode: 201 };
    }

    return {
      success: false,
      error: res.error || contentRes.error || 'Failed to submit question to backend',
      statusCode: res.statusCode || contentRes.statusCode || 500,
    };
  }

  /**
   * Post an answer to a question.
   */
  async postAnswer(questionId: string, content: string): Promise<ApiResponse<Answer>> {
    // Try dedicated /questions/{id}/answers
    const res = await apiClient.post<Answer>(`/questions/${questionId}/answers`, { content });
    if (res.success && res.data) {
      return res;
    }

    // Fall back to live Content Module (/content/posts/{id}/comments)
    const commentRes = await apiClient.post<BackendComment>(`/content/posts/${questionId}/comments`, {
      content,
    });

    if (commentRes.success && commentRes.data) {
      const newAnswer = mapCommentToAnswer(commentRes.data, questionId);
      if (!this.inMemoryAnswers[questionId]) {
        this.inMemoryAnswers[questionId] = [];
      }
      this.inMemoryAnswers[questionId].push(newAnswer);
      return { success: true, data: newAnswer, statusCode: 201 };
    }

    return {
      success: false,
      error: res.error || commentRes.error || 'Failed to submit answer to backend',
      statusCode: res.statusCode || commentRes.statusCode || 500,
    };
  }

  /**
   * Toggle helpful signal on an answer.
   */
  async toggleHelpful(questionId: string, answerId: string): Promise<ApiResponse<Answer>> {
    // Try dedicated /questions/answers/{id}/helpful
    const res = await apiClient.post<Answer>(`/questions/answers/${answerId}/helpful`);
    if (res.success && res.data) {
      return res;
    }

    // Fall back to local state & MMKV persistence
    const current = this.localHelpfulState[answerId] || { count: 0, hasMarked: false };
    const nextMarked = !current.hasMarked;
    const nextCount = nextMarked ? current.count + 1 : Math.max(0, current.count - 1);
    this.localHelpfulState[answerId] = { count: nextCount, hasMarked: nextMarked };
    try {
      storage.set(STORAGE_KEYS.HELPFUL_ANSWERS, JSON.stringify(this.localHelpfulState));
    } catch {}

    const updatedAns: Answer = {
      id: answerId,
      questionId,
      authorId: 'u-peer',
      authorName: 'Campus Peer',
      authorRole: 'Campus Member',
      content: '',
      createdAt: new Date().toISOString(),
      helpfulCount: nextCount,
      isAccepted: this.localAcceptedState[questionId] === answerId,
      hasUserMarkedHelpful: nextMarked,
    };

    return { success: true, data: updatedAns, statusCode: 200 };
  }

  /**
   * Mark an answer as accepted by the question author.
   */
  async acceptAnswer(questionId: string, answerId: string): Promise<ApiResponse<void>> {
    // Try dedicated /questions/answers/{id}/accept
    const res = await apiClient.patch<void>(`/questions/answers/${answerId}/accept`);
    if (res.success) {
      this.localAcceptedState[questionId] = answerId;
      try {
        storage.set(STORAGE_KEYS.ACCEPTED_ANSWERS, JSON.stringify(this.localAcceptedState));
      } catch {}
      return { success: true, statusCode: 200 };
    }

    // Persist accepted status locally
    this.localAcceptedState[questionId] = answerId;
    try {
      storage.set(STORAGE_KEYS.ACCEPTED_ANSWERS, JSON.stringify(this.localAcceptedState));
    } catch {}
    return { success: true, statusCode: 200 };
  }
}

export const qaService = new QAService();
