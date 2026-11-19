import { create } from 'zustand';
import {
  messagingService,
  BackendConversation,
  BackendMessage,
  SendMessageRequest,
  UserSearchResult,
} from '../services/messagingService';
import { websocketService, ConnectionState } from '../services/api/websocketService';
import { useAuthStore } from './authStore';
import { useAlertStore } from './alertStore';
import { getScopedCache, saveScopedCache } from '../lib/queryClient';

interface MessagingState {
  conversations: BackendConversation[];
  activeMessages: BackendMessage[];
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;

  // Real-time connection & presence
  connectionState: ConnectionState;
  isConnectedToSocket: boolean;
  activeConversationId: string | null;

  // Typing state: maps conversationId -> name of peer currently typing
  typingUsers: Record<string, string>;

  initSocket: () => Promise<void>;
  subscribeToConversation: (conversationId: string) => () => void;
  receiveIncomingMessage: (message: BackendMessage) => void;
  sendTyping: (conversationId: string, isTyping: boolean) => void;

  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string, background?: boolean) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<boolean>;
  createConversation: (
    participantIds: string[]
  ) => Promise<BackendConversation | null>;
  getOrCreateConversation: (recipientId: string) => Promise<BackendConversation | null>;
  searchPeers: (query: string) => Promise<UserSearchResult[]>;
  markAsRead: (conversationId: string) => Promise<void>;
  clearActiveMessages: () => void;
}

let userMsgUnsub: (() => void) | null = null;
let userNotifUnsub: (() => void) | null = null;
let socketInitialized = false;
const typingTimers: Record<string, ReturnType<typeof setTimeout>> = {};

export const useMessagingStore = create<MessagingState>((set, get) => ({
  conversations: getScopedCache<BackendConversation[]>('conversations') || [],
  activeMessages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSending: false,
  error: null,

  connectionState: 'DISCONNECTED',
  isConnectedToSocket: false,
  activeConversationId: null,
  typingUsers: {},

  initSocket: async () => {
    if (socketInitialized) return;
    socketInitialized = true;

    // Listen to socket connection state changes
    websocketService.onStateChange((state) => {
      set({
        connectionState: state,
        isConnectedToSocket: state === 'CONNECTED',
      });
    });

    await websocketService.connect();

    // Subscribe to current user's personal alert and inbox channels
    const currentUser = useAuthStore.getState().user;
    if (currentUser?.id) {
      if (userMsgUnsub) userMsgUnsub();
      if (userNotifUnsub) userNotifUnsub();

      // Listen for incoming messages destined for this user (inbox sync + alerts)
      userMsgUnsub = websocketService.subscribe(
        `/topic/user.${currentUser.id}.messages`,
        (incoming: BackendMessage) => {
          if (!incoming || !incoming.id) return;

          const currentActiveConv = get().activeConversationId;
          const isCurrentActive =
            currentActiveConv && incoming.conversationId === currentActiveConv;

          if (isCurrentActive) {
            get().receiveIncomingMessage(incoming);
          } else {
            // Outside of active chat: trigger in-app alert toast
            const isFromOther =
              incoming.sender?.id !== currentUser.id &&
              incoming.sender?.email !== currentUser.email;

            if (isFromOther) {
              useAlertStore.getState().showAlert({
                type: 'MESSAGE',
                title: incoming.sender?.fullName || 'Direct Message',
                subtitle: incoming.content || 'Sent you a message',
                data: {
                  conversationId: incoming.conversationId,
                  senderName: incoming.sender?.fullName,
                },
              });
            }

            // Update conversations list: bump to top, update lastMessage, increment unreadCount
            set((state) => {
              const updated = [...state.conversations];
              const idx = updated.findIndex((c) => c.id === incoming.conversationId);
              if (idx !== -1) {
                const [target] = updated.splice(idx, 1);
                target.updatedAt = incoming.createdAt || new Date().toISOString();
                target.lastMessage = incoming;
                if (isFromOther) {
                  target.unreadCount = (target.unreadCount || 0) + 1;
                }
                updated.unshift(target);
              } else {
                // Fetch list if conversation is brand new to user
                get().fetchConversations();
              }
              return { conversations: updated };
            });
          }
        }
      );

      // Listen for real-time notifications (e.g. system, job, assessment alerts)
      userNotifUnsub = websocketService.subscribe(
        `/topic/user.${currentUser.id}.notifications`,
        (notif: any) => {
          if (!notif) return;
          useAlertStore.getState().showAlert({
            type: 'NOTIFICATION',
            title: notif.title || 'Notification',
            subtitle: notif.message || '',
            data: notif,
          });
        }
      );
    }
  },

  subscribeToConversation: (conversationId: string) => {
    set({ activeConversationId: conversationId });

    // Ensure socket is running
    get().initSocket();

    // 1. STOMP subscription for the specific conversation room messages
    const topic = `/topic/conversations.${conversationId}`;
    const stompMsgUnsub = websocketService.subscribe(topic, (msg: BackendMessage) => {
      get().receiveIncomingMessage(msg);
    });

    // 2. STOMP subscription for typing indicator
    const typingTopic = `/topic/conversations.${conversationId}.typing`;
    const stompTypingUnsub = websocketService.subscribe(
      typingTopic,
      (data: { conversationId: string; userId: string; userName: string; isTyping: boolean }) => {
        const currentUser = useAuthStore.getState().user;
        if (!data || data.userId === currentUser?.id) return;

        if (data.isTyping) {
          // Clear existing timer if any
          if (typingTimers[conversationId]) {
            clearTimeout(typingTimers[conversationId]);
          }

          set((state) => ({
            typingUsers: { ...state.typingUsers, [conversationId]: data.userName || 'Peer' },
          }));

          // Auto-clear typing indicator after 3 seconds of inactivity
          typingTimers[conversationId] = setTimeout(() => {
            set((state) => {
              const updated = { ...state.typingUsers };
              delete updated[conversationId];
              return { typingUsers: updated };
            });
          }, 3000);
        } else {
          if (typingTimers[conversationId]) {
            clearTimeout(typingTimers[conversationId]);
            delete typingTimers[conversationId];
          }
          set((state) => {
            const updated = { ...state.typingUsers };
            delete updated[conversationId];
            return { typingUsers: updated };
          });
        }
      }
    );

    // 3. STOMP subscription for read receipts
    const readTopic = `/topic/conversations.${conversationId}.read`;
    const stompReadUnsub = websocketService.subscribe(
      readTopic,
      (data: { conversationId: string; userId: string; readAt: string }) => {
        const currentUser = useAuthStore.getState().user;
        if (!data || data.userId === currentUser?.id) return;

        // Mark all my sent messages in active view as read
        set((state) => ({
          activeMessages: state.activeMessages.map((m) => {
            const isMine =
              m.sender?.id === currentUser?.id ||
              m.sender?.email === currentUser?.email;
            if (isMine && !m.isRead) {
              return { ...m, isRead: true, readAt: data.readAt };
            }
            return m;
          }),
        }));
      }
    );

    // Adaptive fallback polling: if socket is disconnected, poll every 4.5 seconds
    const pollInterval = setInterval(() => {
      if (!get().isConnectedToSocket && get().activeConversationId === conversationId) {
        get().fetchMessages(conversationId, true);
      }
    }, 4500);

    return () => {
      clearInterval(pollInterval);
      stompMsgUnsub();
      stompTypingUnsub();
      stompReadUnsub();
      if (typingTimers[conversationId]) {
        clearTimeout(typingTimers[conversationId]);
        delete typingTimers[conversationId];
      }
      set((state) => {
        const updatedTyping = { ...state.typingUsers };
        delete updatedTyping[conversationId];
        return { activeConversationId: null, typingUsers: updatedTyping };
      });
    };
  },

  sendTyping: (conversationId: string, isTyping: boolean) => {
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) return;

    websocketService.send('/app/chat.typing', {
      conversationId,
      userId: currentUser.id,
      userName: currentUser.fullName,
      isTyping,
    });
  },

  receiveIncomingMessage: (message: BackendMessage) => {
    if (!message || !message.id) return;

    set((state) => {
      // Optimistic deduplication:
      // Check if message was already added optimistically via clientMessageId or matching id
      const existingIndex = state.activeMessages.findIndex(
        (m) =>
          (message.clientMessageId && m.clientMessageId === message.clientMessageId) ||
          m.id === message.id ||
          (message.clientMessageId && m.id === message.clientMessageId)
      );

      let updatedMessages = [...state.activeMessages];
      if (existingIndex !== -1) {
        // Replace temporary optimistic message with confirmed server message
        updatedMessages[existingIndex] = {
          ...message,
          status: 'SENT',
        };
      } else {
        // Prepend to top because FlatList is inverted
        updatedMessages = [{ ...message, status: 'SENT' }, ...updatedMessages];
      }

      // Also update conversations list preview
      const updatedConversations = [...state.conversations];
      const convIdx = updatedConversations.findIndex((c) => c.id === message.conversationId);
      if (convIdx !== -1) {
        const [target] = updatedConversations.splice(convIdx, 1);
        target.lastMessage = message;
        target.updatedAt = message.createdAt || new Date().toISOString();
        updatedConversations.unshift(target);
      }

      saveScopedCache('conversations', updatedConversations);

      return {
        activeMessages: updatedMessages,
        conversations: updatedConversations,
      };
    });

    // Automatically mark read if active
    const activeId = get().activeConversationId;
    if (activeId && activeId === message.conversationId) {
      get().markAsRead(activeId);
    }
  },

  fetchConversations: async () => {
    const hasExisting = get().conversations.length > 0;
    if (!hasExisting) {
      set({ isLoadingConversations: true, error: null });
    }
    const res = await messagingService.getMyConversations();
    if (res.success && res.data) {
      set({
        conversations: res.data,
        isLoadingConversations: false,
        error: null,
      });
      saveScopedCache('conversations', res.data);
    } else {
      if (!hasExisting) {
        set({
          conversations: [],
          isLoadingConversations: false,
          error: res.error || 'Failed to load conversations.',
        });
      } else {
        set({ isLoadingConversations: false });
      }
    }
  },

  fetchMessages: async (conversationId: string, background = false) => {
    if (!background) {
      set({ isLoadingMessages: true, error: null });
    }
    const res = await messagingService.getMessages(conversationId);
    if (res.success && res.data) {
      set({
        activeMessages: res.data.map((m) => ({ ...m, status: 'SENT' })),
        isLoadingMessages: false,
        error: null,
      });
      // Automatically mark as read
      get().markAsRead(conversationId);
    } else if (!background) {
      set({
        isLoadingMessages: false,
        error: res.error || 'Failed to load messages.',
      });
    }
  },

  sendMessage: async (conversationId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return false;

    const currentUser = useAuthStore.getState().user;
    const clientMessageId = `c_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // 1. Optimistic message insertion
    const optimisticMessage: BackendMessage = {
      id: clientMessageId,
      conversationId,
      sender: {
        id: currentUser?.id || '',
        fullName: currentUser?.fullName || 'Me',
        email: currentUser?.email,
      },
      content: trimmed,
      messageType: 'TEXT',
      clientMessageId,
      isRead: false,
      createdAt: new Date().toISOString(),
      status: 'SENDING',
    };

    set((state) => ({
      activeMessages: [optimisticMessage, ...state.activeMessages],
      isSending: true,
    }));

    // 2. Real-time send via STOMP if connected
    const stompPayload: SendMessageRequest = {
      conversationId,
      content: trimmed,
      clientMessageId,
      messageType: 'TEXT',
    };

    let sentViaSocket = false;
    if (websocketService.isConnected()) {
      sentViaSocket = websocketService.send('/app/chat.send', stompPayload);
    }

    // 3. If socket is not connected or send failed, use REST fallback
    if (!sentViaSocket) {
      const res = await messagingService.sendMessage(stompPayload);
      if (res.success && res.data) {
        get().receiveIncomingMessage(res.data);
        set({ isSending: false });
        return true;
      } else {
        // Mark as failed
        set((state) => ({
          activeMessages: state.activeMessages.map((m) =>
            m.clientMessageId === clientMessageId ? { ...m, status: 'FAILED' } : m
          ),
          isSending: false,
        }));
        return false;
      }
    }

    set({ isSending: false });
    return true;
  },

  createConversation: async (participantIds: string[]) => {
    const res = await messagingService.createConversation({
      participantIds,
      type: participantIds.length > 1 ? 'GROUP' : 'DIRECT',
    });

    if (res.success && res.data) {
      set((state) => ({
        conversations: [res.data!, ...state.conversations.filter((c) => c.id !== res.data!.id)],
      }));
      return res.data;
    }
    return null;
  },

  getOrCreateConversation: async (recipientId: string) => {
    const res = await messagingService.getOrCreateConversation(recipientId);
    if (res.success && res.data) {
      set((state) => ({
        conversations: [res.data!, ...state.conversations.filter((c) => c.id !== res.data!.id)],
      }));
      return res.data;
    }
    return null;
  },

  searchPeers: async (query: string) => {
    const res = await messagingService.searchPeers(query);
    if (res.success && res.data) {
      return res.data;
    }
    return [];
  },

  markAsRead: async (conversationId: string) => {
    // Optimistically clear unread count for this conversation in the local list
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ),
    }));

    // Send read event via STOMP if connected
    if (websocketService.isConnected()) {
      websocketService.send('/app/chat.read', { conversationId });
    }

    // Call REST markAsRead
    await messagingService.markAsRead(conversationId);
  },

  clearActiveMessages: () => {
    set({ activeMessages: [], error: null });
  },
}));
