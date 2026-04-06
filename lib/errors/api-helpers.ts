import { NextResponse } from 'next/server';
import { ErrorCode } from './types';
import { createErrorResponse, getUserFriendlyMessage } from './handler';

/**
 * Standardized API error response helpers
 */

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function errorResponse(
  error: unknown,
  code: ErrorCode = 'SERVER_ERROR',
  status: number = 500
) {
  const message = getUserFriendlyMessage(error);
  
  return NextResponse.json(
    {
      error: true,
      code,
      message,
      timestamp: new Date().toISOString(),
      // Include error details in development
      ...(process.env.NODE_ENV === 'development' && {
        details: error instanceof Error ? error.message : String(error),
      }),
    },
    { status }
  );
}

export function validationError(message: string, errors?: Record<string, string[]>) {
  return NextResponse.json(
    {
      error: true,
      code: 'VALIDATION_ERROR',
      message,
      errors,
      timestamp: new Date().toISOString(),
    },
    { status: 400 }
  );
}

export function unauthorized(message: string = 'Authentication required') {
  return NextResponse.json(
    {
      error: true,
      code: 'AUTH_REQUIRED',
      message,
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  );
}

export function forbidden(message: string = 'You don\'t have permission to access this resource') {
  return NextResponse.json(
    {
      error: true,
      code: 'AUTH_INVALID',
      message,
      timestamp: new Date().toISOString(),
    },
    { status: 403 }
  );
}

export function notFound(message: string = 'Resource not found') {
  return NextResponse.json(
    {
      error: true,
      code: 'DB_NOT_FOUND',
      message,
      timestamp: new Date().toISOString(),
    },
    { status: 404 }
  );
}

export function conflict(message: string = 'Resource already exists') {
  return NextResponse.json(
    {
      error: true,
      code: 'DB_DUPLICATE',
      message,
      timestamp: new Date().toISOString(),
    },
    { status: 409 }
  );
}

/**
 * Wrap API route handler with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Error:', error);
      return errorResponse(error);
    }
  }) as T;
}

