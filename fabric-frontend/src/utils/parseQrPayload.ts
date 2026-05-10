/** Supports full verify URL (?batch=&hash=) or `productId|batch|hash`. */
export function parseQrPayload(text: string): {
  productId: string;
  batch: string;
  hash: string;
} | null {
  const trimmed = text.trim();
  if (trimmed.includes('/verify/')) {
    try {
      const url = new URL(trimmed);
      const parts = url.pathname.split('/').filter(Boolean);
      const idx = parts.indexOf('verify');
      const productId =
        idx >= 0 ? parts[idx + 1] : parts[parts.length - 1] ?? '';
      const batch = url.searchParams.get('batch') ?? '';
      const hash = url.searchParams.get('hash') ?? '';
      if (productId && batch && hash) {
        return {
          productId: decodeURIComponent(productId),
          batch: decodeURIComponent(batch),
          hash: decodeURIComponent(hash),
        };
      }
    } catch {
      /* ignore */
    }
  }
  const pipe = trimmed.split('|');
  if (pipe.length >= 3) {
    return { productId: pipe[0], batch: pipe[1], hash: pipe[2] };
  }
  return null;
}
