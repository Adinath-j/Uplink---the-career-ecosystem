import { ENV } from '../../config/env';

/**
 * Standard API Result wrapper for Spring Boot API communication.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

/**
 * Centralized API Client
 *
 * Prepares HTTP requests for the Spring Boot REST backend.
 * Provides timeout control, auth token injection, and structured error normalization.
 */
class ApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = ENV.API_BASE_URL;
  }

  public setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  public async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ENV.API_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers as Record<string, string>),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type');
      let data: any = null;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        return {
          success: false,
          error: data?.message || `Request failed with status ${response.status}`,
          statusCode: response.status,
        };
      }

      return {
        success: true,
        data: data as T,
        statusCode: response.status,
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        return {
          success: false,
          error: 'Network request timed out. Please check your connection.',
          statusCode: 408,
        };
      }

      return {
        success: false,
        error: err.message || 'Unable to connect to the server.',
        statusCode: 0,
      };
    }
  }
}

export const apiClient = new ApiClient();
