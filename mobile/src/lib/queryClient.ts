import { QueryClient } from '@tanstack/react-query';
import { storage } from '../services/api/tokenStorage';
import { ENV } from '../config/env';
import { useAuthStore } from '../store/authStore';

/**
 * Global React Query Client
 * Configured with sensible stale-while-revalidate defaults:
 * - 60s stale time for profile, feed, opportunities
 * - 15s stale time for conversations
 * - 24hr garbage collection time
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * MMKV Scoped Cache Key Generator
 * Scoped by `{apiBaseUrl}:{userId}:{key}`
 * Strictly isolates offline cache between backend environments and user accounts.
 */
export function getScopedCacheKey(key: string): string {
  const userId = useAuthStore.getState().user?.id || 'anonymous';
  const apiBase = ENV.API_BASE_URL.replace(/\/+$/, '');
  return `@cache:${apiBase}:${userId}:${key}`;
}

export function saveScopedCache<T>(key: string, data: T): void {
  try {
    storage.set(getScopedCacheKey(key), JSON.stringify(data));
  } catch (err) {
    if (__DEV__) console.warn('[Cache] Failed to save scoped cache:', err);
  }
}

export function getScopedCache<T>(key: string): T | null {
  try {
    const raw = storage.getString(getScopedCacheKey(key));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function purgeAllScopedCaches(): void {
  try {
    const keys = storage.getAllKeys();
    keys.forEach((k) => {
      if (k.startsWith('@cache:')) {
        storage.delete(k);
      }
    });
  } catch (err) {
    if (__DEV__) console.warn('[Cache] Failed to purge caches:', err);
  }
}

/**
 * Post-Authentication Prefetching
 * Concurrently prefetches current user profile and conversations inbox
 * immediately after authentication succeeds.
 */
export async function prefetchPostAuthData(): Promise<void> {
  try {
    const { profileService } = require('../services/profileService');
    const { messagingService } = require('../services/messagingService');
    const { useProfileStore } = require('../store/profileStore');
    const { useMessagingStore } = require('../store/messagingStore');

    // Run parallel prefetching across React Query and Zustand stores
    await Promise.allSettled([
      queryClient.prefetchQuery({
        queryKey: ['profile', 'me'],
        queryFn: async () => {
          const res = await profileService.getMyProfile();
          return res.data ?? null;
        },
        staleTime: 60_000,
      }),
      queryClient.prefetchQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
          const res = await messagingService.getMyConversations();
          return res.data ?? [];
        },
        staleTime: 15_000,
      }),
      useProfileStore.getState().fetchProfile(),
      useMessagingStore.getState().fetchConversations(),
      useMessagingStore.getState().initSocket(),
    ]);
  } catch (err) {
    if (__DEV__) console.warn('[Prefetch] Post-auth prefetch error:', err);
  }
}
