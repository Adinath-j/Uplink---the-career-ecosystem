import { apiClient, ApiResponse } from './api/apiClient';

export interface BackendConversationMember {
  id: string;
  user: {
    id: string;
    fullName: string;
    email?: string;
  };
  joinedAt?: string;
}

export interface BackendConversation {
  id: string;
  type?: 'DIRECT' | 'GROUP' | string;
  createdAt?: string;
  updatedAt?: string;
  members?: BackendConversationMember[];
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
  isRead?: boolean;
  readAt?: string;
  createdAt?: string;
}

export interface CreateConversationRequest {
  type?: 'DIRECT' | 'GROUP';
  participantIds: string[];
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  messageType?: 'TEXT' | 'FILE' | 'LINK';
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
   * Calls GET /messages/conversations
   */
  async getMyConversations(): Promise<ApiResponse<BackendConversation[]>> {
    return apiClient.get<BackendConversation[]>('/messages/conversations');
  }

  /**
   * Start a new direct or group conversation.
   * Calls POST /messages/conversations
   */
  async createConversation(request: CreateConversationRequest): Promise<ApiResponse<BackendConversation>> {
    return apiClient.post<BackendConversation>('/messages/conversations', request);
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
}

export const messagingService = new MessagingService();

