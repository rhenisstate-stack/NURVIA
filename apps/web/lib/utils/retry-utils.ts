/**
 * Retry utilities for NURVIA API requests
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number; // in milliseconds
  maxDelay?: number; // in milliseconds
  backoffMultiplier?: number;
  jitter?: boolean;
}

export interface RetryResult<T> {
  data: T | null;
  error: unknown | null;
  attempts: number;
}

/**
 * Exponential backoff with optional jitter
 */
export function calculateDelay(attempt: number, options: RetryOptions): number {
  const { initialDelay = 1000, maxDelay = 30000, backoffMultiplier = 2, jitter = true } = options;
  
  let delay = Math.min(initialDelay * Math.pow(backoffMultiplier, attempt - 1), maxDelay);
  
  if (jitter) {
    // Add jitter: random factor between 0.5 and 1.5
    const jitterFactor = 0.5 + Math.random() * 0.5;
    delay *= jitterFactor;
  }
  
  return Math.floor(delay);
}

/**
 * Perform a retryable operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    jitter = true
  } = options;
  
  let lastError: unknown | null = null;
  let attempts = 0;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    attempts = attempt;
    
    try {
      const result = await operation();
      return { data: result, error: null, attempts };
    } catch (error) {
      lastError = error;
      
      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        break;
      }
      
      // Wait before retrying
      const delay = calculateDelay(attempt, { initialDelay, maxDelay, backoffMultiplier, jitter });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return { data: null, error: lastError, attempts };
}

/**
 * Check if an operation is idempotent (safe to retry)
 */
export function isIdempotent(method: string): boolean {
  const nonIdempotentMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  return !nonIdempotentMethods.includes(method.toUpperCase());
}