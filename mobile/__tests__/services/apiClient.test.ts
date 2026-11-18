import axios from 'axios';

jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  const mockInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    defaults: { baseURL: 'http://10.0.2.2:8080/api' },
  };

  return {
    ...actualAxios,
    create: jest.fn(() => mockInstance),
    isAxiosError: actualAxios.isAxiosError,
  };
});

import { apiClient } from '../../src/services/api/apiClient';
import { tokenStorage } from '../../src/services/api/tokenStorage';

describe('ApiClient', () => {
  let mockInstance: any;

  beforeEach(async () => {
    await tokenStorage.clearTokens();
    jest.clearAllMocks();
    mockInstance = (apiClient as any).axiosInstance;
  });

  test('normalizes Spring Boot ApiResponse envelope on GET', async () => {
    mockInstance.get.mockResolvedValueOnce({
      status: 200,
      data: {
        success: true,
        message: 'Opportunities retrieved',
        data: [{ id: 'opp-1', title: 'Software Engineer' }],
        timestamp: '2026-11-06T00:00:00Z',
      },
    });

    const res = await apiClient.get<Array<{ id: string; title: string }>>('/opportunities');

    expect(res.success).toBe(true);
    expect(res.statusCode).toBe(200);
    expect(res.message).toBe('Opportunities retrieved');
    expect(res.data).toEqual([{ id: 'opp-1', title: 'Software Engineer' }]);
  });

  test('normalizes Spring Boot ErrorResponse and validationErrors on error', async () => {
    const axiosError = new axios.AxiosError('Request failed with status code 400', '400');
    axiosError.response = {
      status: 400,
      statusText: 'Bad Request',
      headers: {},
      config: {} as any,
      data: {
        success: false,
        status: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        path: '/api/auth/register',
        timestamp: '2026-11-06T00:00:00Z',
        validationErrors: {
          email: 'Email should be valid',
          password: 'Password must be at least 6 characters',
        },
      },
    };

    mockInstance.post.mockRejectedValueOnce(axiosError);

    const res = await apiClient.post('/auth/register', { email: 'bad-email' });

    expect(res.success).toBe(false);
    expect(res.statusCode).toBe(400);
    expect(res.error).toContain('Validation failed');
    expect(res.error).toContain('email: Email should be valid');
    expect(res.validationErrors?.email).toBe('Email should be valid');
  });

  test('handles network connection refusal gracefully', async () => {
    const networkError = new axios.AxiosError('Network Error', 'ECONNREFUSED');
    networkError.response = undefined;

    mockInstance.get.mockRejectedValueOnce(networkError);

    const res = await apiClient.get('/profile');

    expect(res.success).toBe(false);
    expect(res.statusCode).toBe(0);
    expect(res.error).toContain('Unable to connect to UPLINK server');
  });
});
