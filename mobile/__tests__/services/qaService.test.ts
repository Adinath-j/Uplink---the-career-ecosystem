import { qaService, mapPostToQuestion, mapCommentToAnswer } from '../../src/services/qaService';
import { apiClient } from '../../src/services/api/apiClient';
import { storage } from '../../src/services/api/tokenStorage';

describe('qaService', () => {
  beforeEach(() => {
    storage.clearAll();
    jest.clearAllMocks();
  });

  describe('mapPostToQuestion and mapCommentToAnswer', () => {
    test('parses structured JSON post content correctly', () => {
      const dto = {
        post: {
          id: 'post-1',
          content: JSON.stringify({
            title: 'How to scale Redis?',
            description: 'Looking for cluster vs sentinel guidelines.',
            topicTags: ['System Design', 'DevOps'],
          }),
          type: 'QUESTION',
          createdAt: '2026-11-01T10:00:00Z',
          user: {
            id: 'usr-1',
            fullName: 'Aditya Verma',
          },
        },
        likeCount: 5,
        commentCount: 2,
        likedByCurrentUser: true,
      };

      const q = mapPostToQuestion(dto);
      expect(q.id).toBe('post-1');
      expect(q.title).toBe('How to scale Redis?');
      expect(q.description).toBe('Looking for cluster vs sentinel guidelines.');
      expect(q.topicTags).toEqual(['System Design', 'DevOps']);
      expect(q.authorName).toBe('Aditya Verma');
      expect(q.sameDoubtCount).toBe(5);
      expect(q.answerCount).toBe(2);
      expect(q.hasUserMarkedSameDoubt).toBe(true);
      expect(q.isUnanswered).toBe(false);
    });

    test('parses plain-text post content gracefully', () => {
      const dto = {
        post: {
          id: 'post-2',
          content: 'What is CAP Theorem?\nCan anyone explain consistency vs availability?',
          type: 'QUESTION',
          createdAt: '2026-11-01T10:00:00Z',
          user: {
            id: 'usr-2',
            fullName: 'Priya Patel',
          },
        },
        likeCount: 0,
        commentCount: 0,
        likedByCurrentUser: false,
      };

      const q = mapPostToQuestion(dto);
      expect(q.title).toBe('What is CAP Theorem?');
      expect(q.description).toBe('Can anyone explain consistency vs availability?');
      expect(q.answerCount).toBe(0);
      expect(q.isUnanswered).toBe(true);
    });

    test('maps BackendComment to Answer with local metadata', () => {
      const comment = {
        id: 'c-101',
        content: 'Consistency implies all nodes see the same data at the same time.',
        createdAt: '2026-11-01T12:00:00Z',
        user: {
          id: 'usr-3',
          fullName: 'Dr. Smith',
        },
      };

      const ans = mapCommentToAnswer(comment, 'post-2', {
        helpfulCount: 4,
        hasMarkedHelpful: true,
        isAccepted: true,
      });

      expect(ans.id).toBe('c-101');
      expect(ans.questionId).toBe('post-2');
      expect(ans.authorName).toBe('Dr. Smith');
      expect(ans.helpfulCount).toBe(4);
      expect(ans.hasUserMarkedHelpful).toBe(true);
      expect(ans.isAccepted).toBe(true);
    });
  });

  describe('Live API mode', () => {
    test('getQuestions falls back to /content/feed?type=QUESTION when /questions is unavailable', async () => {
      // First call to /questions fails (as on hosted Render backend)
      jest.spyOn(apiClient, 'get')
        .mockResolvedValueOnce({
          success: false,
          error: 'No static resource api/questions',
          statusCode: 500,
        })
        // Second call to /content/feed succeeds
        .mockResolvedValueOnce({
          success: true,
          data: {
            content: [
              {
                post: {
                  id: 'post-10',
                  content: JSON.stringify({
                    title: 'Live Render Question',
                    description: 'Fetched from live Content module',
                    topicTags: ['System Design'],
                  }),
                  type: 'QUESTION',
                  createdAt: '2026-11-05T10:00:00Z',
                  user: { id: 'usr-1', fullName: 'Vishal' },
                },
                likeCount: 3,
                commentCount: 1,
                likedByCurrentUser: false,
              },
            ],
            totalElements: 1,
          },
          statusCode: 200,
        });

      const res = await qaService.getQuestions({ topic: 'System Design' });
      expect(res.success).toBe(true);
      expect(res.data?.some((q) => q.title === 'Live Render Question')).toBe(true);
    });

    test('askQuestion falls back to POST /content/posts with type QUESTION', async () => {
      // First call to /questions fails
      jest.spyOn(apiClient, 'post')
        .mockResolvedValueOnce({
          success: false,
          error: 'Not found',
          statusCode: 404,
        })
        // Second call to /content/posts succeeds
        .mockResolvedValueOnce({
          success: true,
          data: {
            post: {
              id: 'post-new-1',
              content: JSON.stringify({
                title: 'How to use Redux Toolkit?',
                description: 'Comparison with Zustand',
                topicTags: ['Web Development'],
              }),
              type: 'QUESTION',
              createdAt: '2026-11-06T10:00:00Z',
              user: { id: 'u-current', fullName: 'Aditya' },
            },
            likeCount: 0,
            commentCount: 0,
            likedByCurrentUser: false,
          },
          statusCode: 201,
        });

      const res = await qaService.askQuestion({
        title: 'How to use Redux Toolkit?',
        description: 'Comparison with Zustand',
        topicTags: ['Web Development'],
      });

      expect(res.success).toBe(true);
      expect(res.data?.title).toBe('How to use Redux Toolkit?');
    });

    test('getAnswers falls back to /content/posts/{id}/comments', async () => {
      // First call to /questions/{id}/answers fails
      jest.spyOn(apiClient, 'get')
        .mockResolvedValueOnce({
          success: false,
          error: 'Not found',
          statusCode: 404,
        })
        // Second call to /content/posts/{id}/comments succeeds
        .mockResolvedValueOnce({
          success: true,
          data: {
            content: [
              {
                id: 'c-1',
                content: 'Use createSlice and configureStore.',
                createdAt: '2026-11-06T11:00:00Z',
                user: { id: 'u-2', fullName: 'Campus Peer' },
              },
            ],
          },
          statusCode: 200,
        });

      const res = await qaService.getAnswers('post-new-1');
      expect(res.success).toBe(true);
      expect(res.data?.[0].content).toBe('Use createSlice and configureStore.');
    });

    test('postAnswer falls back to POST /content/posts/{id}/comments', async () => {
      // First call to /questions/{id}/answers fails
      jest.spyOn(apiClient, 'post')
        .mockResolvedValueOnce({
          success: false,
          error: 'Not found',
          statusCode: 404,
        })
        // Second call to /content/posts/{id}/comments succeeds
        .mockResolvedValueOnce({
          success: true,
          data: {
            id: 'c-2',
            content: 'Zustand is lighter and requires no boilerplate.',
            createdAt: '2026-11-06T11:05:00Z',
            user: { id: 'u-current', fullName: 'Aditya' },
          },
          statusCode: 201,
        });

      const res = await qaService.postAnswer('post-new-1', 'Zustand is lighter and requires no boilerplate.');
      expect(res.success).toBe(true);
      expect(res.data?.content).toBe('Zustand is lighter and requires no boilerplate.');
    });

    test('toggleSameDoubt falls back to POST /content/posts/{id}/like', async () => {
      // First call to /questions/{id}/doubt fails
      jest.spyOn(apiClient, 'post')
        .mockResolvedValueOnce({
          success: false,
          error: 'Not found',
          statusCode: 404,
        })
        // Second call to /content/posts/{id}/like succeeds
        .mockResolvedValueOnce({
          success: true,
          data: { liked: true },
          statusCode: 200,
        });

      const res = await qaService.toggleSameDoubt('post-new-1');
      expect(res.success).toBe(true);
      expect(res.data?.hasMarked).toBe(true);
    });

    test('acceptAnswer marks solution and returns success', async () => {
      jest.spyOn(apiClient, 'patch').mockResolvedValueOnce({
        success: true,
        statusCode: 200,
      });

      const res = await qaService.acceptAnswer('post-new-1', 'c-2');
      expect(res.success).toBe(true);
    });
  });
});
