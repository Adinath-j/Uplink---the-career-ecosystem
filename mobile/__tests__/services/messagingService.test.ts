import {
  messagingService,
  BackendConversation,
  BackendMessage,
} from '../../src/services/messagingService';
import { apiClient } from '../../src/services/api/apiClient';

describe('messagingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockConversation: BackendConversation = {
    id: 'conv-101',
    type: 'DIRECT',
    members: [
      {
        id: 'mem-1',
        user: { id: 'usr-1', fullName: 'Aditya Verma' },
      },
      {
        id: 'mem-2',
        user: { id: 'usr-2', fullName: 'Recruiter Smith' },
      },
    ],
  };

  const mockMessage: BackendMessage = {
    id: 'msg-1',
    conversationId: 'conv-101',
    sender: { id: 'usr-2', fullName: 'Recruiter Smith' },
    content: 'Hi Aditya, we reviewed your application.',
    messageType: 'TEXT',
    isRead: false,
    createdAt: '2026-10-25T14:00:00Z',
  };

  test('getMyConversations calls GET /messages/conversations', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: [mockConversation],
      statusCode: 200,
    });

    const res = await messagingService.getMyConversations();
    expect(getSpy).toHaveBeenCalledWith('/messages/conversations');
    expect(res.success).toBe(true);
    expect(res.data?.length).toBe(1);
  });

  test('createConversation calls POST /messages/conversations', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: mockConversation,
      statusCode: 201,
    });

    const res = await messagingService.createConversation({
      type: 'DIRECT',
      participantIds: ['usr-2'],
    });

    expect(postSpy).toHaveBeenCalledWith('/messages/conversations', {
      type: 'DIRECT',
      participantIds: ['usr-2'],
    });
    expect(res.success).toBe(true);
  });

  test('getMessages calls GET /messages/conversation/{id}', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: {
        content: [mockMessage],
        totalElements: 1,
      },
      statusCode: 200,
    });

    const res = await messagingService.getMessages('conv-101', 0, 50);
    expect(getSpy).toHaveBeenCalledWith('/messages/conversation/conv-101?page=0&size=50');
    expect(res.success).toBe(true);
    expect(res.data?.length).toBe(1);
    expect(res.data?.[0].content).toContain('reviewed your application');
  });

  test('sendMessage calls POST /messages/send', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: mockMessage,
      statusCode: 201,
    });

    const res = await messagingService.sendMessage({
      conversationId: 'conv-101',
      content: 'Thank you!',
      messageType: 'TEXT',
    });

    expect(postSpy).toHaveBeenCalledWith('/messages/send', {
      conversationId: 'conv-101',
      content: 'Thank you!',
      messageType: 'TEXT',
    });
    expect(res.success).toBe(true);
  });

  test('markAsRead calls POST /messages/conversation/{id}/read', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      statusCode: 200,
    });

    const res = await messagingService.markAsRead('conv-101');
    expect(postSpy).toHaveBeenCalledWith('/messages/conversation/conv-101/read');
    expect(res.success).toBe(true);
  });

  test('getOrCreateConversation calls POST /messages/conversations with recipientId', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: mockConversation,
      statusCode: 200,
    });

    const res = await messagingService.getOrCreateConversation('usr-2');
    expect(postSpy).toHaveBeenCalledWith('/messages/conversations', {
      recipientId: 'usr-2',
      participantIds: ['usr-2'],
      type: 'DIRECT',
    });
    expect(res.success).toBe(true);
  });

  test('searchPeers calls GET /messages/users/search with query', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: [{ id: 'usr-2', fullName: 'Recruiter Smith', email: 'smith@campus.edu' }],
      statusCode: 200,
    });

    const res = await messagingService.searchPeers('Smith');
    expect(getSpy).toHaveBeenCalledWith('/messages/users/search?query=Smith');
    expect(res.success).toBe(true);
    expect(res.data?.length).toBe(1);
  });
});

