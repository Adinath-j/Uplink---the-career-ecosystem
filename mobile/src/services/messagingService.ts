import { apiClient, ApiResponse } from './api/apiClient';

export interface BackendConversationMember {
  id: string;
  user: {
    id: string;
    fullName: string;
    email?: string;
  };
  role?: string;
  joinedAt?: string;
}

export interface BackendMessage {
  id: string;
  conversationId?: string;
  sender: {
    id: string;
    fullName: string;
    email?: string;
  };
  content: string;
  messageType?: 'TEXT' | 'FILE' | 'LINK' | string;
  clientMessageId?: string;
  isRead?: boolean;
  readAt?: string;
  createdAt?: string;
  status?: 'SENDING' | 'SENT' | 'FAILED';
}

export interface BackendConversation {
  id: string;
  type?: 'DIRECT' | 'GROUP' | string;
  createdAt?: string;
  updatedAt?: string;
  members?: BackendConversationMember[];
  lastMessage?: BackendMessage;
  unreadCount?: number;
}

export interface CreateConversationRequest {
  type?: 'DIRECT' | 'GROUP';
  participantIds?: string[];
  recipientId?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType?: 'TEXT' | 'FILE' | 'LINK';
  clientMessageId?: string;
}

export interface UserSearchResult {
  id: string;
  fullName: string;
  email: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

class MessagingService {
  /**
   * Get all conversations for current user.
   * Calls GET /messages/conversations (also aliased at /conversations)
   */
  async getMyConversations(): Promise<ApiResponse<BackendConversation[]>> {
    return apiClient.get<BackendConversation[]>('/messages/conversations');
  }

  /**
   * Start or get existing direct conversation, or start a group conversation.
   * Calls POST /messages/conversations (also aliased at /conversations)
   */
  async createConversation(request: CreateConversationRequest): Promise<ApiResponse<BackendConversation>> {
    return apiClient.post<BackendConversation>('/messages/conversations', request);
  }

  /**
   * Helper to get or initiate a 1-on-1 direct conversation with a recipient.
   */
  async getOrCreateConversation(recipientId: string): Promise<ApiResponse<BackendConversation>> {
    return this.createConversation({
      recipientId,
      participantIds: [recipientId],
      type: 'DIRECT',
    });
  }

  /**
   * Get conversation message thread (paginated).
   * Calls GET /messages/conversation/{conversationId}?page=...
   */
  async getMessages(
    conversationId: string,
    page: number = 0,
    size: number = 50
  ): Promise<ApiResponse<BackendMessage[]>> {
    const res = await apiClient.get<SpringPage<BackendMessage> | BackendMessage[]>(
      `/messages/conversation/${conversationId}?page=${page}&size=${size}`
    );

    if (res.success && res.data) {
      const list: BackendMessage[] = Array.isArray(res.data)
        ? res.data
        : (res.data as SpringPage<BackendMessage>).content || [];

      return { success: true, data: list, statusCode: res.statusCode };
    }

    return {
      success: false,
      error: res.error || 'Failed to load messages',
      statusCode: res.statusCode,
    };
  }

  /**
   * Send a message in a conversation.
   * Calls POST /messages/send
   */
  async sendMessage(request: SendMessageRequest): Promise<ApiResponse<BackendMessage>> {
    return apiClient.post<BackendMessage>('/messages/send', request);
  }

  /**
   * Mark all unread messages in conversation as read.
   * Calls POST /messages/conversation/{conversationId}/read
   */
  async markAsRead(conversationId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/messages/conversation/${conversationId}/read`);
  }

  /**
   * Search users/peers to start a new chat.
   * Calls GET /messages/users/search?query=...
   */
  async searchPeers(query: string): Promise<ApiResponse<UserSearchResult[]>> {
    return apiClient.get<UserSearchResult[]>(
      `/messages/users/search?query=${encodeURIComponent(query)}`
    );
  }
}

export const messagingService = new MessagingService();
