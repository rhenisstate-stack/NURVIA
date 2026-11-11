export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export function classifyApiError(error: ApiError | null): string {
  if (!error) return "unknown";
  
  switch (error.status) {
    case 400:
      return "validation";
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not_found";
    case 409:
      return "conflict";
    case 429:
      return "rate_limited";
    case 500:
      return "server_error";
    case 502:
      return "bad_gateway";
    case 503:
      return "service_unavailable";
    case 504:
      return "gateway_timeout";
    default:
      if (error.status >= 400 && error.status < 500) {
        return "client_error";
      }
      if (error.status >= 500 && error.status < 600) {
        return "server_error";
      }
      return "unknown";
  }
}

export function getErrorMessage(error: ApiError | null): string {
  if (!error) return "An unknown error occurred.";
  
  switch (error.status) {
    case 400:
      return "There was a validation error with your request. Please check the provided information.";
    case 401:
      return "You need to be signed in to access this resource.";
    case 403:
      return "You don't have permission to access this resource.";
    case 404:
      return "The requested resource could not be found.";
    case 409:
      return "There was a conflict with your request. Please try again.";
    case 429:
      return "You're making too many requests. Please try again later.";
    case 500:
      return "An internal server error occurred. Our team has been notified.";
    case 502:
      return "The server received an invalid response from an upstream service.";
    case 503:
      return "The service is temporarily unavailable. Please try again later.";
    case 504:
      return "The server timed out while waiting for a response from an upstream service.";
    default:
      return error.message || "An unexpected error occurred.";
  }
}