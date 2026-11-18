import { apiClient, ApiResponse } from './api/apiClient';

export interface BackendPost {
  id: string;
  user: {
    id: string;
    fullName: string;
    email?: string;
  };
  content: string;
  type?: 'POST' | 'BLOG' | 'NOTICE' | string;
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
  user: {
    id: string;
    fullName: string;
  };
  content: string;
  createdAt?: string;
}

export interface CreatePostRequest {
  content: string;
  type?: 'POST' | 'BLOG' | 'NOTICE' | string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

class ContentService {
  /**
   * Fetch community feed of posts, blogs, and notices (paginated).
   * Calls live Spring Boot GET /content/feed with local caching and offline fallback.
   */
  async getFeed(type?: string, page: number = 0, size: number = 20): Promise<ApiResponse<PostResponseDto[]>> {
    const queryParts: string[] = [];
    if (type && type !== 'All') {
      queryParts.push(`type=${encodeURIComponent(type.toUpperCase())}`);
    }
    queryParts.push(`page=${page}`);
    queryParts.push(`size=${size}`);

    const queryString = `?${queryParts.join('&')}`;

    const res = await apiClient.get<SpringPage<PostResponseDto> | PostResponseDto[]>(
      `/content/feed${queryString}`
    );

    if (res.success && res.data) {
      const list: PostResponseDto[] = Array.isArray(res.data)
        ? res.data
        : (res.data as SpringPage<PostResponseDto>).content || [];
      return { success: true, data: list, statusCode: res.statusCode };
    }

    return {
      success: false,
      data: [],
      error: res.error || 'Failed to fetch community feed',
      statusCode: res.statusCode || 500,
    };
  }

  /**
   * Publish a new post, blog, or notice.
   * Calls POST /content/posts
   */
  async createPost(request: CreatePostRequest): Promise<ApiResponse<PostResponseDto>> {
    return apiClient.post<PostResponseDto>('/content/posts', request);
  }

  /**
   * Get single post details with like and comment counts.
   * Calls GET /content/posts/{id}
   */
  async getPostById(id: string): Promise<ApiResponse<PostResponseDto>> {
    return apiClient.get<PostResponseDto>(`/content/posts/${id}`);
  }

  /**
   * Delete post (owner or admin).
   * Calls DELETE /content/posts/{id}
   */
  async deletePost(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/content/posts/${id}`);
  }

  /**
   * Toggle like on post.
   * Calls POST /content/posts/{id}/like
   */
  async toggleLike(id: string): Promise<ApiResponse<{ liked: boolean }>> {
    return apiClient.post<{ liked: boolean }>(`/content/posts/${id}/like`);
  }

  /**
   * Get comments for post (paginated).
   * Calls GET /content/posts/{id}/comments
   */
  async getComments(postId: string, page: number = 0, size: number = 20): Promise<ApiResponse<BackendComment[]>> {
    const res = await apiClient.get<SpringPage<BackendComment> | BackendComment[]>(
      `/content/posts/${postId}/comments?page=${page}&size=${size}`
    );

    if (res.success && res.data) {
      const comments: BackendComment[] = Array.isArray(res.data)
        ? res.data
        : (res.data as SpringPage<BackendComment>).content || [];

      return { success: true, data: comments, statusCode: res.statusCode };
    }

    return {
      success: false,
      error: res.error || 'Failed to load comments',
      statusCode: res.statusCode,
    };
  }

  /**
   * Add comment to post.
   * Calls POST /content/posts/{id}/comments
   */
  async addComment(postId: string, request: CreateCommentRequest): Promise<ApiResponse<BackendComment>> {
    return apiClient.post<BackendComment>(`/content/posts/${postId}/comments`, request);
  }
}

export const contentService = new ContentService();
