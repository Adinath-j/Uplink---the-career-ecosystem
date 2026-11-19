import { create } from 'zustand';
import { aiService, AtsParseResponse } from '../services/aiService';
import { resumeService, ResumeGenerateRequest, ResumeDto } from '../services/resumeService';

export interface AiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  taskType?: string;
}

interface AiState {
  // Chat state
  messages: AiChatMessage[];
  isThinking: boolean;
  chatError: string | null;

  // ATS Evaluation state
  atsResult: AtsParseResponse | null;
  isEvaluatingAts: boolean;
  atsError: string | null;

  // Resume state
  latestResume: ResumeDto | null;
  isGeneratingResume: boolean;
  resumeError: string | null;

  // Actions
  sendPrompt: (prompt: string, taskType?: string) => Promise<void>;
  clearChat: () => void;
  evaluateResumeAts: (resumeText: string, targetRole?: string) => Promise<AtsParseResponse | null>;
  generateNewResume: (request: ResumeGenerateRequest) => Promise<ResumeDto | null>;
}

export const useAiStore = create<AiState>((set, _get) => ({
  messages: [
    {
      id: 'welcome-1',
      role: 'assistant',
      content:
        'Hello! I am Uplink AI, your personal career mentor & interview coach. How can I help you today? You can ask for interview questions, portfolio guidance, or resume feedback.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      taskType: 'CAREER_ADVICE',
    },
  ],
  isThinking: false,
  chatError: null,

  atsResult: null,
  isEvaluatingAts: false,
  atsError: null,

  latestResume: null,
  isGeneratingResume: false,
  resumeError: null,

  sendPrompt: async (prompt: string, taskType: string = 'CAREER_ADVICE') => {
    const userMsg: AiChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      taskType,
    };

    set((state) => ({
      messages: [userMsg, ...state.messages],
      isThinking: true,
      chatError: null,
    }));

    try {
      const res = await aiService.queryLlm(prompt, taskType);
      const assistantMsg: AiChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.response || 'I have analyzed your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        taskType,
      };

      set((state) => ({
        messages: [assistantMsg, ...state.messages],
        isThinking: false,
      }));
    } catch (err: any) {
      set({
        isThinking: false,
        chatError: err?.message || 'Failed to get response from AI assistant.',
      });
    }
  },

  clearChat: () => {
    set({
      messages: [
        {
          id: 'welcome-reset',
          role: 'assistant',
          content: 'Chat refreshed. Ask me anything about your job hunt or resume!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      chatError: null,
    });
  },

  evaluateResumeAts: async (resumeText: string, targetRole: string = 'Software Engineer') => {
    set({ isEvaluatingAts: true, atsError: null });
    try {
      const res = await aiService.parseResume(resumeText, targetRole);
      set({ atsResult: res, isEvaluatingAts: false });
      return res;
    } catch (err: any) {
      set({ atsResult: null, isEvaluatingAts: false, atsError: err?.message || 'Failed to analyze resume' });
      return null;
    }
  },

  generateNewResume: async (request: ResumeGenerateRequest) => {
    set({ isGeneratingResume: true, resumeError: null });
    try {
      const res = await resumeService.generateResume(request);
      set({ latestResume: res, isGeneratingResume: false });
      return res;
    } catch (err: any) {
      set({ latestResume: null, isGeneratingResume: false, resumeError: err?.message || 'Failed to generate resume' });
      return null;
    }
  },
}));
