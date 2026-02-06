// src/lib/api-client.ts
/**
 * Centralized API client with error handling, type safety, and security.
 * Use this for all fetch requests to API routes and external services.
 */

export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

interface RequestOptions extends RequestInit {
  baseUrl?: string;
  timeout?: number;
  retry?: number;
}

export async function apiCall<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    baseUrl = '/api',
    timeout = 10000,
    retry = 1,
    ...fetchOptions
  } = options;

  const url = `${baseUrl}${endpoint}`;

  // Add default headers (CSRF protection ready)
  const headers = new Headers(fetchOptions.headers || {});
  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('X-Requested-With', 'XMLHttpRequest');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new APIError(
            response.status,
            errorData.code || 'UNKNOWN_ERROR',
            errorData.message || response.statusText
          );
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;
        if (attempt < retry && error instanceof APIError && error.statusCode >= 500) {
          // Retry on server errors
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
          continue;
        }
        break;
      }
    }

    throw lastError;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new APIError(408, 'TIMEOUT', `Request timed out after ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Usage examples:
/*
// GET
const tours = await apiCall<Tour[]>('/tours', {
  method: 'GET'
});

// POST with validation
const newTour = await apiCall<Tour>('/tours', {
  method: 'POST',
  body: JSON.stringify(validatedData)
});

// With error handling
try {
  const result = await apiCall('/protected-resource');
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error (${error.code}): ${error.message}`);
  }
}
*/
