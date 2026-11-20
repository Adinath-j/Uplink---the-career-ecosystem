import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ENV, BackendEnvironment, setBackendEnvironment } from '../../config/env';
import { tokenStorage } from './tokenStorage';

/**
 * Standard API Result wrapper for Mobile Consumers.
 * Matches backend ApiResponse semantics while providing normalized status code and error messages.
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  raw?: any;
  validationErrors?: Record<string, string>;
  statusCode: number;
}

/**
 * Backend Raw ApiResponse Shape from Spring Boot
 */
interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * Backend ErrorResponse Shape from Spring Boot GlobalExceptionHandler
 */
interface BackendErrorResponse {
  success: boolean;
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  validationErrors?: Record<string, string>;
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];
  private onUnauthorizedCallback?: () => void;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: ENV.API_BASE_URL,
      timeout: ENV.API_TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set callback triggered when session refresh fails (e.g., force logout)
   */
  public setUnauthorizedCallback(callback: () => void) {
    this.onUnauthorizedCallback = callback;
  }

  /**
   * Update base URL dynamically (e.g. For physical device LAN IP testing)
   */
  public updateBaseUrl(newBaseUrl: string) {
    this.axiosInstance.defaults.baseURL = newBaseUrl;
  }

  /**
   * Switch backend environment dynamically ('deployed', 'localhost', 'emulator', 'lan')
   */
  public switchBackend(target: BackendEnvironment) {
    setBackendEnvironment(target);
    this.axiosInstance.defaults.baseURL = ENV.API_BASE_URL;
    this.axiosInstance.defaults.timeout = ENV.API_TIMEOUT_MS;
  }

  /**
   * Set or clear authorization token manually in memory and storage
   */
  public async setAuthToken(token: string | null, refreshToken?: string) {
    if (token) {
      await tokenStorage.setTokens(token, refreshToken);
    } else {
      await tokenStorage.clearTokens();
    }
  }

  private setupInterceptors() {
    // -----------------------------------------------------------------
    // Request Interceptor: Attach JWT Bearer Token
    // -----------------------------------------------------------------
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = tokenStorage.getAccessTokenSync() || (await tokenStorage.getAccessToken());
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Always ensure base URL matches current configuration
        config.baseURL = ENV.API_BASE_URL;

        return config;
      },
      (error) => Promise.reject(error)
    );

    // -----------------------------------------------------------------
    // Response Interceptor: Handle Refresh Token & Normalize 401/403s
    // -----------------------------------------------------------------
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        const status = error.response?.status;
        const isAuthEndpoint =
          originalRequest?.url?.includes('/auth/login') ||
          originalRequest?.url?.includes('/auth/register') ||
          originalRequest?.url?.includes('/auth/refresh-token');

        // Handle 401 Unauthorized or 403 Forbidden on protected routes
        if (
          (status === 401 || status === 403) &&
          originalRequest &&
          !originalRequest._retry &&
          !isAuthEndpoint
        ) {
          const refreshToken = await tokenStorage.getRefreshToken();
          const hasValidRefreshToken = Boolean(
            refreshToken && !refreshToken.startsWith('uplink_demo_')
          );

          if (hasValidRefreshToken) {
            if (this.isRefreshing) {
              return new Promise((resolve) => {
                this.refreshSubscribers.push((newToken: string) => {
                  if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                  }
                  resolve(this.axiosInstance(originalRequest));
                });
              });
            }

            originalRequest._retry = true;
            this.isRefreshing = true;

            try {
              // Call Spring Boot /api/auth/refresh-token
              const refreshRes = await axios.post<BackendApiResponse<{ token: string; refreshToken?: string }>>(
                `${ENV.API_BASE_URL}/auth/refresh-token`,
                { refreshToken },
                {
                  headers: { 'Content-Type': 'application/json' },
                  timeout: ENV.API_TIMEOUT_MS,
                }
              );

              const newTokens = refreshRes.data.data;
              if (newTokens?.token) {
                await tokenStorage.setTokens(newTokens.token, newTokens.refreshToken);
                this.isRefreshing = false;
                this.notifySubscribers(newTokens.token);

                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newTokens.token}`;
                }
                return this.axiosInstance(originalRequest);
              }
            } catch (refreshErr) {
              this.isRefreshing = false;
              this.refreshSubscribers = [];
              await tokenStorage.clearTokens();
              this.onUnauthorizedCallback?.();
              return Promise.reject(refreshErr);
            }
          } else {
            // Invalid / legacy / absent refresh token: trigger cleanup callback
            await tokenStorage.clearTokens();
            this.onUnauthorizedCallback?.();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private notifySubscribers(newToken: string) {
    this.refreshSubscribers.forEach((cb) => cb(newToken));
    this.refreshSubscribers = [];
  }

  /**
   * Normalize Axios responses and errors into the unified ApiResponse structure
   */
  private handleResponse<T>(response: AxiosResponse): ApiResponse<T> {
    const raw = response.data as BackendApiResponse<T>;

    // If backend already wrapped data in ApiResponse envelope
    if (raw && typeof raw === 'object' && 'success' in raw) {
      return {
        success: raw.success,
        data: raw.data !== undefined ? raw.data : (raw as any),
        message: raw.message,
        statusCode: response.status,
      };
    }

    return {
      success: true,
      data: response.data as T,
      statusCode: response.status,
    };
  }

  private handleError<T>(error: any): ApiResponse<T> {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<BackendErrorResponse>;
      const status = axiosError.response?.status || 0;
      const responseData = axiosError.response?.data;

      let message = responseData?.message || responseData?.error || axiosError.message;

      // Extract field-level validation errors from Spring Boot ErrorResponse if present
      if (responseData?.validationErrors && Object.keys(responseData.validationErrors).length > 0) {
        const errorDetails = Object.entries(responseData.validationErrors)
          .map(([field, err]) => `${field}: ${err}`)
          .join(', ');
        message = `${message ? `${message} (` : ''}${errorDetails}${message ? ')' : ''}`;
      }

      // Friendly connection diagnostic for local and physical Android testing
      if (!axiosError.response) {
        if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
          message = 'Network request timed out. Please check your connection.';
        } else {
          message = `Unable to connect to UPLINK server (${ENV.API_BASE_URL}). Ensure the Spring Boot backend is running.`;
        }
      }

      return {
        success: false,
        error: message,
        code: (responseData as any)?.code,
        raw: responseData,
        validationErrors: responseData?.validationErrors,
        statusCode: status,
      };
    }

    return {
      success: false,
      error: error?.message || 'An unexpected client error occurred.',
      statusCode: 0,
    };
  }

  public async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(endpoint, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  public async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(endpoint, data, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  public async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  public async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(endpoint, data, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  public async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.patch<T>(endpoint, data, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  public async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(endpoint, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }
}

export const apiClient = new ApiClient();
