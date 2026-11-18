/**
 * Centralized Application Environment Configuration
 *
 * Keeps base URLs and configuration flags isolated from components and services.
 * Provides a single, clean flag for switching between deployed cloud and localhost backends.
 */

// Available Backend Target Options:
// 1. Live hosted Spring Boot backend on Render
export const HOSTED_BACKEND_BASE_URL = 'https://uplink-kzh3.onrender.com/api';

// 2. Localhost via ADB reverse for physical USB device (run: adb reverse tcp:8080 tcp:8080)
export const LOCAL_DEVICE_BASE_URL = 'http://localhost:8080/api';

// 3. Android Emulator localhost loopback
export const EMULATOR_BACKEND_BASE_URL = 'http://10.0.2.2:8080/api';

// 4. Local network IP (same Wi-Fi network)
export const LAN_BACKEND_BASE_URL = 'http://10.10.122.87:8080/api';

/**
 * ===================================================================
 * BACKEND ENVIRONMENT SWITCH FLAG
 * ===================================================================
 * Toggle this boolean to instantly switch between deployed & local:
 * - false: Points to deployed hosted Render backend (https://uplink-kzh3.onrender.com/api)
 * - true : Points to local Spring Boot backend
 */
export const USE_LOCAL_BACKEND = false;

/**
 * When USE_LOCAL_BACKEND is true, choose your local development environment:
 * - 'localhost': Physical USB Android device (run: adb reverse tcp:8080 tcp:8080)
 * - 'emulator' : Android Virtual Device (AVD) using 10.0.2.2 loopback
 * - 'lan'      : Physical device on same Wi-Fi network using LAN IP
 */
export type LocalBackendFlavor = 'localhost' | 'emulator' | 'lan';
export const LOCAL_BACKEND_FLAVOR: LocalBackendFlavor = 'localhost';

export type BackendEnvironment = 'deployed' | LocalBackendFlavor;

export function resolveBackendUrl(target: BackendEnvironment): string {
  switch (target) {
    case 'localhost':
      return LOCAL_DEVICE_BASE_URL;
    case 'emulator':
      return EMULATOR_BACKEND_BASE_URL;
    case 'lan':
      return LAN_BACKEND_BASE_URL;
    case 'deployed':
    default:
      return HOSTED_BACKEND_BASE_URL;
  }
}

export function getActiveBackendEnvironment(): BackendEnvironment {
  return USE_LOCAL_BACKEND ? LOCAL_BACKEND_FLAVOR : 'deployed';
}

export const ENV = {
  APP_NAME: 'UPLINK',
  VERSION: '1.0.0',
  BUILD_NUMBER: 1,

  // Active target switch
  USE_LOCAL_BACKEND,

  // Active Spring Boot API endpoint (derived from USE_LOCAL_BACKEND)
  API_BASE_URL: resolveBackendUrl(getActiveBackendEnvironment()),

  // Request timeout: 60s for Render cold-starts, 10s for fast local testing
  API_TIMEOUT_MS: USE_LOCAL_BACKEND ? 10000 : 60000,

  // Global fallback mock flag (preserved for unmigrated modules)
  USE_MOCK_DATA: false,

  /**
   * Modular Feature Flags for Mock Data
   * All 14 modules are configured for live Spring Boot REST communication.
   */
  MOCK_FLAGS: {
    AUTH: false,          // Live Spring Boot AuthController (/api/auth/**)
    PROFILE: false,       // Live Spring Boot UserProfileController (/api/profile/**)
    OPPORTUNITIES: false, // Live Spring Boot OpportunityController (/api/opportunities/**)
    APPLICATIONS: false,  // Live Spring Boot ApplicationController (/api/applications/**)
    CONTENT: false,       // Live Spring Boot ContentController (/api/content/**)
    NOTIFICATIONS: false, // Live Spring Boot NotificationController (/api/notifications/**)
    ASSESSMENTS: false,   // Live Spring Boot AssessmentController (/api/assessments/**)
    MESSAGING: false,     // Live Spring Boot MessagingController (/api/messages/**)
    VERIFICATION: false,  // Live Spring Boot VerificationController (/api/verification/**)
    RECRUITER: false,     // Live Spring Boot RecruiterController (/api/recruiter/**)
    ADMIN: false,         // Live Spring Boot AdminController (/api/admin/**)
    ANALYTICS: false,     // Live Spring Boot AnalyticsController (/api/analytics/**)
    QA: false,            // Live Spring Boot Community Q&A Module (/api/content/** & /api/questions/**)
    MENTORS: false,       // Live Spring Boot Mentorship Directory & Sessions (/api/mentors/** & /api/content/**)
  },

  DEBUG_LOGGING: __DEV__,
};

/**
 * Switch backend target dynamically at runtime
 * Example: setBackendEnvironment('localhost') or setBackendEnvironment('deployed')
 */
export function setBackendEnvironment(target: BackendEnvironment) {
  ENV.API_BASE_URL = resolveBackendUrl(target);
  ENV.API_TIMEOUT_MS = target === 'deployed' ? 60000 : 10000;
}

/**
 * Configure API base URL manually to an arbitrary URL
 * Example: configureApiBaseUrl('http://192.168.1.100:8080/api');
 */
export function configureApiBaseUrl(url: string) {
  ENV.API_BASE_URL = url.endsWith('/') ? url.slice(0, -1) : url;
}

export type EnvConfig = typeof ENV;
