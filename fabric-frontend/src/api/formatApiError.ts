import axios from 'axios';

/** Turn axios/network failures into a readable, actionable message. */
export function formatApiError(error: unknown, attemptedUrl: string): string {
  if (axios.isAxiosError(error)) {
    const cfg = error.config;
    const method = (cfg?.method ?? 'GET').toUpperCase();
    const absoluteUrl =
      attemptedUrl.startsWith('http://') || attemptedUrl.startsWith('https://')
        ? attemptedUrl
        : typeof window !== 'undefined'
          ? `${window.location.origin}${attemptedUrl.startsWith('/') ? attemptedUrl : `/${attemptedUrl}`}`
          : attemptedUrl;

    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as { message?: string } | undefined;
      const msg = data?.message ?? error.message;
      const endpoint = attemptedUrl.toLowerCase();
      if (status === 401) {
        if (endpoint.includes('auth/login')) {
          return 'Invalid email or password.';
        }
        return 'Your session has expired. Please log in again.';
      }
      if (status === 403) {
        return 'Access denied: your role cannot use this feature.';
      }
      if (status === 404 && endpoint.includes('/product/')) {
        return 'Product not found. This may be an unregistered or counterfeit item.';
      }
      if (status === 502 || status === 503) {
        return 'Cannot connect to the server. Please check that the backend API is running.';
      }
      if (/invalid credentials/i.test(msg)) {
        return 'Invalid email or password.';
      }
      if (/unauthorized/i.test(msg)) {
        return 'Your session has expired. Please log in again.';
      }
      return msg || `Request failed (${status}). Please try again.`;
    }

    if (error.request) {
      return [
        'Cannot connect to the server. Please check that the backend API is running.',
        `Request: ${method} ${absoluteUrl}`,
      ].join('\n');
    }

    return `${error.message}\nRequest: ${method} ${attemptedUrl}`;
  }

  if (error instanceof Error) return error.message;
  return String(error);
}
