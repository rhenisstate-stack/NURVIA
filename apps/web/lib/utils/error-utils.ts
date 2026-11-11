/**
 * Error classification utilities for NURVIA API error handling
 */

export interface ApiError {
  status?: number;
  message?: string;
  errors?: string[];
  statusCode?: number;
}

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  REQUEST_CANCELLED = 'REQUEST_CANCELLED',
  HTTP_400 = 'HTTP_400',
  HTTP_401 = 'HTTP_401',
  HTTP_403 = 'HTTP_403',
  HTTP_404 = 'HTTP_404',
  HTTP_409 = 'HTTP_409',
  HTTP_422 = 'HTTP_422',
  HTTP_429 = 'HTTP_429',
  HTTP_500 = 'HTTP_500',
  HTTP_502 = 'HTTP_502',
  HTTP_503 = 'HTTP_503',
  HTTP_504 = 'HTTP_504',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Determines the type of error based on the error object
 */
export function classifyError(error: unknown): ErrorType {
  // Handle network errors (failed to fetch)
  if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
    return ErrorType.NETWORK_ERROR;
  }

  // Handle request cancellation
  if (error instanceof Error && error.name === 'AbortError') {
    return ErrorType.REQUEST_CANCELLED;
  }

  // Handle API errors
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const apiError = error as ApiError;
    
    switch (apiError.statusCode || apiError.status) {
      case 400:
        return ErrorType.HTTP_400;
      case 401:
        return ErrorType.HTTP_401;
      case 403:
        return ErrorType.HTTP_403;
      case 404:
        return ErrorType.HTTP_404;
      case 409:
        return ErrorType.HTTP_409;
      case 422:
        return ErrorType.HTTP_422;
      case 429:
        return ErrorType.HTTP_429;
      case 500:
        return ErrorType.HTTP_500;
      case 502:
        return ErrorType.HTTP_502;
      case 503:
        return ErrorType.HTTP_503;
      case 504:
        return ErrorType.HTTP_504;
      default:
        if (apiError.statusCode && apiError.statusCode >= 400) {
          return ErrorType.UNKNOWN;
        }
    }
  }

  // Handle timeout errors
  if (error instanceof Error && error.message.includes('timeout')) {
    return ErrorType.TIMEOUT;
  }

  // Default to unknown error
  return ErrorType.UNKNOWN;
}

/**
 * Checks if an error is retryable based on error type
 */
export function isRetryableError(error: unknown): boolean {
  const errorType = classifyError(error);
  
  // These errors are generally safe to retry
  return [
    ErrorType.NETWORK_ERROR,
    ErrorType.TIMEOUT,
    ErrorType.HTTP_500,
    ErrorType.HTTP_502,
    ErrorType.HTTP_503,
    ErrorType.HTTP_504
  ].includes(errorType);
}

/**
 * Checks if authentication recovery is needed
 */
export function isAuthError(error: unknown): boolean {
  const errorType = classifyError(error);
  
  return [
    ErrorType.HTTP_401,
    ErrorType.HTTP_403
  ].includes(errorType);
}

/**
 * Gets a user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  const errorType = classifyError(error);
  
  switch (errorType) {
    case ErrorType.NETWORK_ERROR:
      return 'Unable to connect to NURVIA services. Please check your internet connection.';
    case ErrorType.TIMEOUT:
      return 'Request timed out. Please try again.';
    case ErrorType.HTTP_400:
      return 'Invalid request. Please check your input and try again.';
    case ErrorType.HTTP_401:
      return 'Session expired. Please sign in again.';
    case ErrorType.HTTP_403:
      return 'Access denied. You do not have permission to perform this action.';
    case ErrorType.HTTP_404:
      return 'The requested resource was not found.';
    case ErrorType.HTTP_409:
      return 'Conflict with the current state of the resource.';
    case ErrorType.HTTP_422:
      return 'The request could not be processed due to validation errors.';
    case ErrorType.HTTP_429:
      return 'Too many requests. Please try again later.';
    case ErrorType.HTTP_500:
      return 'An internal server error occurred. Our team has been notified.';
    case ErrorType.HTTP_502:
      return 'Gateway error. Please try again in a few moments.';
    case ErrorType.HTTP_503:
      return 'Service temporarily unavailable. Please try again later.';
    case ErrorType.HTTP_504:
      return 'Gateway timeout. Please try again in a few moments.';
    case ErrorType.REQUEST_CANCELLED:
      return 'Request was cancelled.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}