/**
 * Error types and codes for the application
 */

export type ErrorCode =
  // Auth errors
  | 'AUTH_REQUIRED'
  | 'AUTH_INVALID'
  | 'AUTH_EXPIRED'
  
  // Database errors
  | 'DB_NOT_FOUND'
  | 'DB_DUPLICATE'
  | 'DB_PERMISSION_DENIED'
  | 'DB_CONNECTION_ERROR'
  
  // Validation errors
  | 'VALIDATION_ERROR'
  | 'INVALID_INPUT'
  
  // Network errors
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  
  // Subscription errors
  | 'SUBSCRIPTION_REQUIRED'
  | 'SUBSCRIPTION_EXPIRED'
  | 'PAYMENT_FAILED'
  
  // Generic errors
  | 'UNKNOWN_ERROR'
  | 'SERVER_ERROR';

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  details?: unknown;
  stack?: string;
}

export interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  metadata?: Record<string, unknown>;
}

