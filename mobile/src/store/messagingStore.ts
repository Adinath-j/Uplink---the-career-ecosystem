import { create } from 'zustand';
import {
  messagingService,
  BackendConversation,
  BackendMessage,
} from '../services/messagingService';

interface MessagingState {
  conversations: BackendConversation[];
  activeMessages: BackendMessage[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;

  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<boolean>;
  createConversation: (
    participantIds: string[]
  ) => Promise<BackendConversation | null>;
  markAsRead: (conversationId: string) => Promise<void>;
  clearActiveMessages: () => void;
}

export const useMessagingStore = create<MessagingState>((set, get) => ({
  conversations: [],
  activeMessages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSending: false,
  error: null,

  fetchConversations: async () => {
    set({ isLoadingConversations: true, error: null });
    const res = await messagingService.getMyConversations();
    if (res.success && res.data) {
      set({
        conversations: res.data,
        isLoadingConversations: false,
        error: null,
      });
    } else {
      set({
        isLoadingConversations: false,
        error: res.error || 'Failed to load conversations.',
      });
    }
  },

  fetchMessages: async (conversationId: string) => {
    set({ isLoadingMessages: true, error: null });
    const res = await messagingService.getMessages(conversationId);
    if (res.success && res.data) {
      set({
        activeMessages: res.data,
        isLoadingMessages: false,
        error: null,
      });
      // Automatically mark as read
      get().markAsRead(conversationId);
    } else {
      set({
        isLoadingMessages: false,
        error: res.error || 'Failed to load messages.',
      });
    }
  },

  sendMessage: async (conversationId: string, content: string) => {
    if (!content.trim()) return false;
    set({ isSending: true });

    const res = await messagingService.sendMessage({
      conversationId,
      content: content.trim(),
      messageType: 'TEXT',
    });

    if (res.success && res.data) {
      // In inverted FlatList, new message is added to top of activeMessages
      set((state) => ({
        activeMessages: [res.data!, ...state.activeMessages],
        isSending: false,
      }));
      return true;
    }

    set({ isSending: false });
    return false;
  },

  createConversation: async (participantIds: string[]) => {
    const res = await messagingService.createConversation({
      participantIds,
      type: participantIds.length > 1 ? 'GROUP' : 'DIRECT',
    });

    if (res.success && res.data) {
      set((state) => ({
        conversations: [res.data!, ...state.conversations],
      }));
      return res.data;
    }
    return null;
  },

  markAsRead: async (conversationId: string) => {
    await messagingService.markAsRead(conversationId);
  },

  clearActiveMessages: () => {
    set({ activeMessages: [], error: null });
  },
}));
