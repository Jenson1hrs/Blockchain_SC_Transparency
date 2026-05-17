/** User-facing messages for create/QR flows (hide technical noise). */
export function friendlyCreateError(message: string): string {
  const firstLine = message.split('\n')[0].trim();
  if (/already exists/i.test(firstLine)) {
    return 'This Product ID already exists. Please use a unique Product ID.';
  }
  if (/cannot connect to the server/i.test(message)) {
    return 'Cannot connect to the server. Please check that the backend API is running.';
  }
  if (/network error|ECONNREFUSED|ERR_NETWORK|502|503/i.test(message)) {
    return 'Cannot connect to the server. Please check that the backend API is running.';
  }
  return firstLine || 'Something went wrong. Please try again.';
}

export function friendlyQrLoadError(message: string): string {
  return friendlyCreateError(message);
}
