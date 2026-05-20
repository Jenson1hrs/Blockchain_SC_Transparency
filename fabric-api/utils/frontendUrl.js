/**
 * Base URL for QR verify links (from FRONTEND_URL). No trailing slash.
 * Set FRONTEND_URL to http://<LAN-IP>:5173 for phone QR scanning, or
 * http://localhost:5173 for laptop-only testing.
 */
function getFrontendBase() {
    const raw = process.env.FRONTEND_URL || 'http://localhost:5173';
    const frontendBase = String(raw).trim().replace(/\/$/, '');
    if (/localhost|127\.0\.0\.1/i.test(frontendBase)) {
        console.warn(
            '[qr] FRONTEND_URL uses localhost. Phone scanners cannot open this URL — use your LAN IP for mobile testing.'
        );
    }
    if (!/^https?:\/\/[^/]+:\d+/.test(frontendBase)) {
        console.warn(
            '[qr] FRONTEND_URL has no port (e.g. :5173). Phone QR links may fail — use http://<LAN-IP>:5173'
        );
    }
    return frontendBase;
}

function buildVerifyQrUrl(productId, batchNumber, hash) {
    const base = getFrontendBase();
    return `${base}/verify/${encodeURIComponent(productId)}?batch=${encodeURIComponent(batchNumber)}&hash=${encodeURIComponent(hash)}`;
}

module.exports = { getFrontendBase, buildVerifyQrUrl };
