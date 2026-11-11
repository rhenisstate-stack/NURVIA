export function shouldRetryRequest(statusCode: number): boolean {
  // Retry on certain transient errors
  return (
    statusCode === 0 || // Network error
    statusCode === 408 || // Request Timeout
    statusCode === 429 || // Rate Limited
    statusCode === 500 || // Internal Server Error
    statusCode === 502 || // Bad Gateway
    statusCode === 503 || // Service Unavailable
    statusCode === 504 // Gateway Timeout
  );
}

export function isIdempotentMethod(method: string): boolean {
  // These methods are generally idempotent and safe to retry
  return ['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method.toUpperCase());
}