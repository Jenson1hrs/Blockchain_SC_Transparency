/**
 * QR HMAC-style hash secret. Set QR_SECRET in .env for production.
 * Falls back for local dev only (logs a warning).
 */
function getQrSecret() {
  const fromEnv = process.env.QR_SECRET != null ? String(process.env.QR_SECRET).trim() : '';
  if (fromEnv) return fromEnv;
  const fallback = 'mySuperSecretKey';
  console.warn(
    '[qr] QR_SECRET is not set — using development fallback. Set QR_SECRET in .env for production.'
  );
  return fallback;
}

module.exports = { getQrSecret };
