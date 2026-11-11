/**
 * Request utilities for NURVIA API interactions
 */

import { isIdempotent } from './retry-utils';
import { ErrorType, classifyError } from './error-utils';

export interface RequestOptions {
  /** HTTP method */
  method?: string;
  /** Whether the request is idempotent (safe to retry) */
  idempotent?: boolean;
  /** Whether to retry on failure */
  retry?: boolean;
  /** Retry configuration */
  retryOptions?: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    jitter?: boolean;
  };
}

/**
 * Determine if a request should be retried
 */
export function shouldRetryRequest(error: unknown, options: RequestOptions = {}): boolean {
  // If explicitly told not to retry, return false
  if (options.retry === false) {
    return false;
  }
  
  // If request is not idempotent, don't retry
  if (options.idempotent === false) {
    return false;
  }
  
  // Check if the error is retryable
  const errorType = classifyError(error);
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
 * Validate if a request is safe to retry
 */
export function isValidRetry(requestOptions: RequestOptions = {}): boolean {
  const { method = 'GET', idempotent = true } = requestOptions;
  
  // Non-idempotent methods should not be retried automatically
  if (!idempotent && !isIdempotent(method)) {
    return false;
  }
  
  return true;
}

/**
 * Get retry options with defaults
 */
export function getRetryOptions(options: RequestOptions = {}): Required<NonNullable<RequestOptions['retryOptions']>> {
  return {
    maxAttempts: options.retryOptions?.maxAttempts ?? 3,
    initialDelay: options.retryOptions?.initialDelay ?? 1000,
    maxDelay: options.retryOptions?.maxDelay ?? 30000,
    backoffMultiplier: options.retryOptions?.backoffMultiplier ?? 2,
    jitter: options.retryOptions?.jitter ?? true
  };
}

/**
 * Prepare a request with default options
 */
export function prepareRequestOptions(options: RequestOptions = {}): RequestOptions {
  return {
    method: options.method ?? 'GET',
    idempotent: options.idempotent ?? true,
    retry: options.retry ?? true,
    retryOptions: options.retryOptions ?? {}
  };
}