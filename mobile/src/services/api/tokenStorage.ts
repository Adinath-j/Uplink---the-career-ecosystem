import { createMMKV, type MMKV as MMKVType } from 'react-native-mmkv';
import type { StateStorage } from 'zustand/middleware';

/**
 * MMKV Compatibility Wrapper Class
 * Ensures `new MMKV()` works cleanly across both MMKV v3 and v4/Nitro runtimes.
 */
export class MMKV {
  private instance: MMKVType;

  constructor(configuration?: any) {
    this.instance = createMMKV(configuration);
  }

  public set(key: string, value: boolean | string | number | ArrayBuffer): void {
    this.instance.set(key, value);
  }

  public getString(key: string): string | undefined {
    return this.instance.getString(key);
  }

  public getNumber(key: string): number | undefined {
    return this.instance.getNumber(key);
  }

  public getBoolean(key: string): boolean | undefined {
    return this.instance.getBoolean(key);
  }

  public delete(key: string): boolean {
    return this.instance.remove(key);
  }

  public remove(key: string): boolean {
    return this.instance.remove(key);
  }

  public contains(key: string): boolean {
    return this.instance.contains(key);
  }

  public getAllKeys(): string[] {
    return this.instance.getAllKeys();
  }

  public clearAll(): void {
    this.instance.clearAll();
  }
}

/**
 * Global MMKV Storage Instance
 */
export const storage = new MMKV();

// Purge any legacy cached data keys left over from previous builds
try {
  const legacyCacheKeys = [
    '@uplink_cached_mentors',
    '@uplink_cached_events',
    '@uplink_cached_opportunities',
    '@uplink_cached_profile',
    '@uplink_cached_applications',
    '@uplink_cached_feed_all',
    '@uplink_cached_feed_notice',
    '@uplink_cached_feed_post',
    '@uplink_cached_feed_question',
    '@uplink_cached_feed_mentor',
    '@uplink_qa_cached_questions',
    '@uplink_cached_bookings',
  ];
  legacyCacheKeys.forEach((k) => {
    try {
      if (storage.contains(k)) {
        storage.delete(k);
      }
    } catch {}
  });
} catch {}

/**
 * Custom synchronous MMKV Storage Adapter for Zustand's `persist` middleware.
 */
export const zustandStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

/**
 * Token Storage Keys
 */
const ACCESS_TOKEN_KEY = '@uplink_access_token';
const REFRESH_TOKEN_KEY = '@uplink_refresh_token';
const USER_SESSION_KEY = '@uplink_user_session';

/**
 * Centralized Token Storage Abstraction powered by MMKV.
 *
 * Provides synchronous native key-value access via memory-mapped files
 * while retaining Promise-based method signatures for seamless compatibility
 * with existing stores and API clients.
 */
class TokenStorage {
  private memoryAccessToken: string | null = null;
  private memoryRefreshToken: string | null = null;
  private isLoaded = false;

  /**
   * Pre-load tokens into memory on app startup
   */
  public async loadTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    try {
      const accessToken = storage.getString(ACCESS_TOKEN_KEY) ?? null;
      const refreshToken = storage.getString(REFRESH_TOKEN_KEY) ?? null;
      this.memoryAccessToken = accessToken;
      this.memoryRefreshToken = refreshToken;
      this.isLoaded = true;
      return { accessToken, refreshToken };
    } catch (error) {
      console.warn('[TokenStorage] Error loading tokens from MMKV:', error);
      return { accessToken: null, refreshToken: null };
    }
  }

  public getAccessTokenSync(): string | null {
    if (this.memoryAccessToken) {
      return this.memoryAccessToken;
    }
    const token = storage.getString(ACCESS_TOKEN_KEY) ?? null;
    this.memoryAccessToken = token;
    return token;
  }

  public async getAccessToken(): Promise<string | null> {
    if (this.memoryAccessToken) {
      return this.memoryAccessToken;
    }
    const token = storage.getString(ACCESS_TOKEN_KEY) ?? null;
    this.memoryAccessToken = token;
    return token;
  }

  public async getRefreshToken(): Promise<string | null> {
    if (this.memoryRefreshToken) {
      return this.memoryRefreshToken;
    }
    const token = storage.getString(REFRESH_TOKEN_KEY) ?? null;
    this.memoryRefreshToken = token;
    return token;
  }

  public async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    this.memoryAccessToken = accessToken;
    storage.set(ACCESS_TOKEN_KEY, accessToken);

    if (refreshToken) {
      this.memoryRefreshToken = refreshToken;
      storage.set(REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  public async clearTokens(): Promise<void> {
    this.memoryAccessToken = null;
    this.memoryRefreshToken = null;
    storage.delete(ACCESS_TOKEN_KEY);
    storage.delete(REFRESH_TOKEN_KEY);
    storage.delete(USER_SESSION_KEY);
  }

  public async saveSessionData(data: any): Promise<void> {
    try {
      storage.set(USER_SESSION_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[TokenStorage] Failed to save session data:', e);
    }
  }

  public async getSessionData<T>(): Promise<T | null> {
    try {
      const raw = storage.getString(USER_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('[TokenStorage] Failed to parse session data:', e);
      return null;
    }
  }
}

export const tokenStorage = new TokenStorage();
