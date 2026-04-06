/**
 * SWR configuration and hooks
 */

import useSWR, { mutate as globalMutate, SWRConfiguration } from "swr";
import { swrFetcher } from '@/lib/data/fetchers';

/**
 * Default SWR configuration
 */
export const defaultSWRConfig: SWRConfiguration = {
  // Stale-while-revalidate strategy
  revalidateOnFocus: false, // Don't revalidate on window focus (can be annoying)
  revalidateOnReconnect: true, // Revalidate when reconnecting
  dedupingInterval: 2000, // Dedupe requests within 2 seconds
  
  // Error handling
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  
  // Loading states
  suspense: false,
  
  // Fetcher
  fetcher: swrFetcher,
};

/**
 * SWR configurations for different data types
 */
export const SWR_CONFIGS = {
  // Fast-changing data (protein logs, workout sessions)
  realtime: {
    ...defaultSWRConfig,
    refreshInterval: 30000, // Refresh every 30 seconds
    dedupingInterval: 1000,
  },
  
  // Medium-changing data (user profile, progress)
  standard: {
    ...defaultSWRConfig,
    refreshInterval: 120000, // Refresh every 2 minutes
  },
  
  // Slow-changing data (workout programs, settings)
  static: {
    ...defaultSWRConfig,
    revalidateOnMount: false,
    refreshInterval: 3600000, // Refresh every hour
    dedupingInterval: 60000, // Dedupe for 1 minute
  },
  
  // No auto-refresh (manual revalidation only)
  manual: {
    ...defaultSWRConfig,
    revalidateOnMount: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
  },
};

/**
 * Prefetch data for faster navigation
 */
export function prefetchData(key: string | null) {
  if (!key) return;
  
  // Use link prefetch
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = key;
  document.head.appendChild(link);
}

/**
 * Hook for user profile with optimized caching
 */
export function useUserProfile(userId: string | null) {
  return useSWR(
    userId ? `/api/profile/${userId}` : null,
    swrFetcher,
    SWR_CONFIGS.standard
  );
}

/**
 * Hook for protein logs with realtime updates
 */
export function useProteinLogs(userId: string | null, date: string) {
  return useSWR(
    userId ? `/api/protein/${userId}?date=${date}` : null,
    swrFetcher,
    SWR_CONFIGS.realtime
  );
}

/**
 * Hook for workout programs (cached)
 */
export function useWorkoutPrograms() {
  return useSWR(
    '/api/workouts/programs',
    swrFetcher,
    SWR_CONFIGS.static
  );
}

/**
 * Hook for progress data
 */
export function useProgressData(userId: string | null) {
  return useSWR(
    userId ? `/api/progress/${userId}` : null,
    swrFetcher,
    SWR_CONFIGS.standard
  );
}

/**
 * Optimistic update helper (uses global SWR mutate — not a hook).
 */
export function optimisticUpdate<T>(
  key: string,
  updateFn: (current: T | undefined) => T,
  revalidate: () => void
) {
  void globalMutate<T>(
    key,
    (current) => updateFn(current),
    {
      optimisticData: (current) => updateFn(current),
      rollbackOnError: true,
      revalidate: false,
    }
  );
  setTimeout(revalidate, 100);
}

