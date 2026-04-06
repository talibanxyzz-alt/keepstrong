import { AppError, ErrorCode, ErrorContext } from './types';
import { PostgrestError } from '@supabase/supabase-js';

/**
 * Log error to console (dev) or error tracking service (prod)
 */
export function logError(
  error: Error | AppError | PostgrestError | unknown,
  context?: ErrorContext
): void {
  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    console.error('🔴 Error:', {
      error,
      context,
      timestamp: new Date().toISOString(),
    });
  } else {
    // In production, send to error tracking service (e.g., Sentry)
    // Example:
    // Sentry.captureException(error, { contexts: { custom: context } });
    
    // For now, just console.error (you can add Sentry later)
    console.error('Error:', error, context);
  }
}

/**
 * Show user-friendly error message
 * This should trigger your toast/notification system
 */
export function showUserError(message: string): void {
  // Import dynamically to avoid circular dependencies
  if (typeof window !== 'undefined') {
    // You can integrate with your toast system here
    // For now, we'll use a simple alert in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('User Error:', message);
    }
    // In production, this would trigger your toast notification
    // toast.error(message);
  }
}

/**
 * Convert technical error to user-friendly message
 */
export function getUserFriendlyMessage(error: unknown): string {
  // Supabase/Postgres errors
  if (isPostgrestError(error)) {
    return getPostgrestErrorMessage(error);
  }

  // App errors
  if (isAppError(error)) {
    return error.userMessage;
  }

  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Connection lost. Please check your internet connection and try again.';
  }

  // Timeout errors
  if (error instanceof Error && error.message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Generic error
  if (error instanceof Error) {
    return 'Something went wrong. Please try again.';
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Get user-friendly message for Postgrest/Supabase errors
 */
function getPostgrestErrorMessage(error: PostgrestError): string {
  // Specific Postgres error codes
  switch (error.code) {
    case '23505':
      return 'This item already exists. Please use a different value.';
    
    case '42501':
      return 'You don\'t have permission to do that.';
    
    case 'PGRST116':
      return 'We couldn\'t find what you\'re looking for.';
    
    case '23503':
      return 'This action requires data that doesn\'t exist.';
    
    case '23514':
      return 'The data provided doesn\'t meet the requirements.';
    
    case '22P02':
      return 'Invalid data format provided.';
    
    default:
      if (error.message.includes('JWT')) {
        return 'Your session has expired. Please sign in again.';
      }
      
      if (error.message.includes('RLS')) {
        return 'You don\'t have access to this data.';
      }
      
      return 'A database error occurred. Please try again.';
  }
}

/**
 * Create standardized error response for API routes
 */
export function createErrorResponse(
  code: ErrorCode,
  message: string,
  status: number = 500
): Response {
  return Response.json(
    {
      error: true,
      code,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Create AppError from unknown error
 */
export function createAppError(
  error: unknown,
  code: ErrorCode = 'UNKNOWN_ERROR',
  userMessage?: string
): AppError {
  if (error instanceof Error) {
    return {
      code,
      message: error.message,
      userMessage: userMessage || getUserFriendlyMessage(error),
      stack: error.stack,
    };
  }

  return {
    code,
    message: String(error),
    userMessage: userMessage || 'An unexpected error occurred',
  };
}

/**
 * Handle and log error, return user-friendly message
 */
export function handleError(
  error: unknown,
  context?: ErrorContext
): string {
  logError(error, context);
  return getUserFriendlyMessage(error);
}

// Type guards
function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
}

function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'userMessage' in error
  );
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const message = handleError(error, context);
      showUserError(message);
      throw error;
    }
  }) as T;
}

