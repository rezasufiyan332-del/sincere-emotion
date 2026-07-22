import { NextResponse } from 'next/server'

// Custom error classes for the application

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational
    Error.captureStackTrace(this, this.constructor)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND')
  }
}

export class ValidationError extends AppError {
  public readonly errors: Record<string, string[]>

  constructor(errors: Record<string, string[]>) {
    super('Validation failed', 400, 'VALIDATION_ERROR')
    this.errors = errors
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT')
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMITED')
  }
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Helper function to create consistent API responses
// IMPORTANT: Uses NextResponse.json to preserve Set-Cookie headers from auth
export function apiSuccess<T>(data: T, status: number = 200): Response {
  return NextResponse.json(
    { success: true, data } satisfies ApiResponse<T>,
    { status }
  )
}

export function apiError(
  error: AppError | Error,
  status?: number
): Response {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error instanceof ValidationError ? { details: error.errors } : {}),
        },
      } satisfies ApiResponse,
      { status: error.statusCode }
    )
  }

  console.error('Unexpected error:', error)
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message:
          process.env.NODE_ENV === 'development'
            ? error.message || 'An unexpected error occurred'
            : 'An unexpected error occurred',
      },
    } satisfies ApiResponse,
    { status: status ?? 500 }
  )
}

// Middleware to handle errors in API routes.
// Wraps handler result with apiSuccess automatically.
// Handler can return:
//   - a Response directly (passed through as-is)
//   - { data, status? } (wrapped with apiSuccess)
//   - any other value (wrapped with apiSuccess, status 200)
export async function withErrorHandling<T>(
  handler: () => Promise<T | Response>
): Promise<Response> {
  try {
    const result = await handler()

    if (result instanceof Response) {
      return result
    }

    if (
      result !== null &&
      typeof result === 'object' &&
      'data' in result &&
      'status' in result
    ) {
      const { data, status } = result as { data: unknown; status?: number }
      return apiSuccess(data, status ?? 200)
    }

    return apiSuccess(result)
  } catch (error) {
    return apiError(error instanceof Error ? error : new Error(String(error)))
  }
}
