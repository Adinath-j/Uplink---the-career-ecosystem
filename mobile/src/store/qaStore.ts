import { create } from 'zustand';
import { Question, Answer, QAFeedTab, QATopic } from '../types/models';
import { qaService } from '../services/qaService';

interface QAState {
  questions: Question[];
  activeTab: QAFeedTab;
  selectedTopic: QATopic | 'All';
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  activeQuestionAnswers: Record<string, Answer[]>;
  isLoadingAnswers: boolean;

  fetchQuestions: () => Promise<void>;
  setActiveTab: (tab: QAFeedTab) => void;
  setSelectedTopic: (topic: QATopic | 'All') => void;
  setSearchQuery: (query: string) => void;
  toggleSameDoubt: (questionId: string) => Promise<void>;
  fetchAnswers: (questionId: string) => Promise<void>;
  postAnswer: (questionId: string, content: string) => Promise<boolean>;
  askQuestion: (payload: {
    title: string;
    description: string;
    topicTags: string[];
  }) => Promise<boolean>;
  toggleHelpfulAnswer: (questionId: string, answerId: string) => Promise<void>;
}

export const useQAStore = create<QAState>((set, get) => ({
  questions: [],
  activeTab: 'For You',
  selectedTopic: 'All',
  searchQuery: '',
  isLoading: false,
  error: null,

  activeQuestionAnswers: {},
  isLoadingAnswers: false,

  fetchQuestions: async () => {
    set({ isLoading: true, error: null });
    const { activeTab, selectedTopic, searchQuery } = get();

    const res = await qaService.getQuestions({
      tab: activeTab,
      topic: selectedTopic,
      search: searchQuery,
    });

    if (res.success && res.data) {
      set({ questions: res.data, isLoading: false, error: null });
    } else {
      set({
        isLoading: false,
        error: res.error || 'Failed to load questions.',
      });
    }
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
    get().fetchQuestions();
  },

  setSelectedTopic: (topic) => {
    set({ selectedTopic: topic });
    get().fetchQuestions();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().fetchQuestions();
  },

  toggleSameDoubt: async (questionId: string) => {
    // Optimistic local update
    set((state) => ({
      questions: state.questions.map((q) => {
        if (q.id === questionId) {
          const nextState = !q.hasUserMarkedSameDoubt;
          return {
            ...q,
            hasUserMarkedSameDoubt: nextState,
            sameDoubtCount: nextState ? q.sameDoubtCount + 1 : Math.max(0, q.sameDoubtCount - 1),
          };
        }
        return q;
      }),
    }));

    await qaService.toggleSameDoubt(questionId);
  },

  fetchAnswers: async (questionId: string) => {
    set({ isLoadingAnswers: true });
    const res = await qaService.getAnswers(questionId);
    if (res.success && res.data) {
      set((state) => ({
        activeQuestionAnswers: {
          ...state.activeQuestionAnswers,
          [questionId]: res.data!,
        },
        isLoadingAnswers: false,
      }));
    } else {
      set({ isLoadingAnswers: false });
    }
  },

  postAnswer: async (questionId: string, content: string) => {
    const res = await qaService.postAnswer(questionId, content);
    if (res.success && res.data) {
      set((state) => ({
        activeQuestionAnswers: {
          ...state.activeQuestionAnswers,
          [questionId]: [...(state.activeQuestionAnswers[questionId] || []), res.data!],
        },
        questions: state.questions.map((q) =>
          q.id === questionId ? { ...q, answerCount: q.answerCount + 1, isUnanswered: false } : q
        ),
      }));
      return true;
    }
    return false;
  },

  askQuestion: async (payload) => {
    const res = await qaService.askQuestion(payload);
    if (res.success && res.data) {
      set((state) => ({
        questions: [res.data!, ...state.questions],
      }));
      return true;
    }
    return false;
  },

  toggleHelpfulAnswer: async (questionId: string, answerId: string) => {
    const res = await qaService.toggleHelpful(questionId, answerId);
    if (res.success && res.data) {
      set((state) => ({
        activeQuestionAnswers: {
          ...state.activeQuestionAnswers,
          [questionId]: (state.activeQuestionAnswers[questionId] || []).map((a) =>
            a.id === answerId ? res.data! : a
          ),
        },
      }));
    }
  },
}));
