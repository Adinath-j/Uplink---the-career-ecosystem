import {
  contentService,
  PostResponseDto,
} from '../../src/services/contentService';
import { apiClient } from '../../src/services/api/apiClient';

describe('contentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPostResponse: PostResponseDto = {
    post: {
      id: 'post-101',
      user: {
        id: 'usr-1',
        fullName: 'Campus Admin',
        email: 'admin@campus.edu',
      },
      content: 'Campus Placements begin next week for batch of 2027.',
      type: 'NOTICE',
      createdAt: '2026-10-20T10:00:00Z',
    },
    likeCount: 42,
    commentCount: 5,
    likedByCurrentUser: false,
  };

  test('getFeed calls GET /content/feed with query params', async () => {
    const getSpy = jest.spyOn(apiClient, 'get').mockResolvedValueOnce({
      success: true,
      data: {
        content: [mockPostResponse],
        totalElements: 1,
      },
      statusCode: 200,
    });

    const res = await contentService.getFeed('NOTICE', 0, 10);

    expect(getSpy).toHaveBeenCalledWith('/content/feed?type=NOTICE&page=0&size=10');
    expect(res.success).toBe(true);
    expect(res.data?.length).toBe(1);
    expect(res.data?.[0].post.content).toContain('Campus Placements');
  });

  test('createPost calls POST /content/posts', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: mockPostResponse,
      statusCode: 201,
    });

    const res = await contentService.createPost({
      content: 'New post',
      type: 'POST',
    });

    expect(postSpy).toHaveBeenCalledWith('/content/posts', {
      content: 'New post',
      type: 'POST',
    });
    expect(res.success).toBe(true);
  });

  test('toggleLike calls POST /content/posts/{id}/like', async () => {
    const postSpy = jest.spyOn(apiClient, 'post').mockResolvedValueOnce({
      success: true,
      data: { liked: true },
      statusCode: 200,
    });

    const res = await contentService.toggleLike('post-101');
    expect(postSpy).toHaveBeenCalledWith('/content/posts/post-101/like');
    expect(res.success).toBe(true);
    expect(res.data?.liked).toBe(true);
  });

  test('deletePost calls DELETE /content/posts/{id}', async () => {
    const deleteSpy = jest.spyOn(apiClient, 'delete').mockResolvedValueOnce({
      success: true,
      statusCode: 200,
    });

    const res = await contentService.deletePost('post-101');
    expect(deleteSpy).toHaveBeenCalledWith('/content/posts/post-101');
    expect(res.success).toBe(true);
  });
});

