/**
 * Centralized Application Environment Configuration
 *
 * Keeps base URLs and configuration flags isolated from components and services.
 * In production, these values are populated from environment variables / build flavors.
 */

export const ENV = {
  APP_NAME: 'UPLINK',
  VERSION: '1.0.0',
  BUILD_NUMBER: 1,

  // Spring Boot Core API endpoint
  API_BASE_URL: 'http://10.0.2.2:8080/api/v1', // Android emulator default loopback; configurable for device

  // Storage and Timeout settings
  API_TIMEOUT_MS: 15000,

  // Feature Flags
  USE_MOCK_DATA: true, // Used for local preview before Spring Boot backend is running
  DEBUG_LOGGING: __DEV__,
} as const;

export type EnvConfig = typeof ENV;
