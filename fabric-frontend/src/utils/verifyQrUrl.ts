/** In-app route for a full QR verify URL returned by the API (`/verify/:id?batch=&hash=`). */
export function verifyRouteFromQrUrl(qrUrl: string): string {
  try {
    const u = new URL(qrUrl);
    return `${u.pathname}${u.search}`;
  } catch {
    return '/verify';
  }
}
