import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProductQr } from '../api/productService';
import AppShell from '../components/AppShell';
import type { ProductQrResult } from '../types';
import { QR_URL_HELPER_TEXT, verifyRouteFromQrUrl } from '../utils/verifyQrUrl';
import { Alert } from '../components/Alert';
import { friendlyQrLoadError } from '../utils/friendlyErrors';

const ProductQr = () => {
  const { productId } = useParams<{ productId: string }>();
  const [data, setData] = useState<ProductQrResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!productId) {
        setError('Missing product ID');
        setLoading(false);
        return;
      }
      try {
        const qr = await getProductQr(productId);
        setData(qr);
      } catch (e) {
        const raw = e instanceof Error ? e.message : 'Failed to load QR';
        setError(friendlyQrLoadError(raw));
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [productId]);

  if (loading) {
    return (
      <AppShell title="Product QR" subtitle="Regenerate QR anytime from blockchain data.">
        <div className="card p-8 text-center">Loading QR…</div>
      </AppShell>
    );
  }

  const verifyRoute = data ? verifyRouteFromQrUrl(data.qrUrl) : '/verify';
  const usesLocalhost =
    data != null && /localhost|127\.0\.0\.1/i.test(data.qrUrl);

  return (
    <AppShell title="Product QR" subtitle="Regenerate QR anytime from blockchain data.">
      <div className="max-w-2xl mx-auto">
        <div className="card overflow-hidden animate-fade-up">
          <div className="p-6 space-y-6">
            <p className="text-sm text-gray-600 dark:text-neutral-200">
              Product ID: <span className="font-mono">{productId}</span>
            </p>

            {error && <Alert type="error">{error}</Alert>}

            {data && (
              <>
                <div className="text-center">
                  <img
                    src={data.qrCode}
                    alt={`QR for ${productId}`}
                    className="mx-auto max-w-[260px] border border-gray-200 rounded dark:border-neutral-600"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-neutral-200 mb-2">Verification URL</p>
                  <p className="text-xs text-page-muted mb-2 leading-relaxed">{QR_URL_HELPER_TEXT}</p>
                  {usesLocalhost && (
                    <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2 dark:text-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50">
                      This URL uses <strong>localhost</strong>. Set{' '}
                      <code className="font-mono text-[11px]">FRONTEND_URL</code> on the API to your
                      LAN IP (e.g. <code className="font-mono text-[11px]">http://192.168.x.x:5173</code>
                      ), restart the API, then open this page again to regenerate the QR.
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 items-center">
                    <code className="text-xs bg-gray-100 dark:bg-neutral-800 px-2 py-1 rounded break-all flex-1 min-w-0">
                      {data.qrUrl}
                    </code>
                    <button
                      type="button"
                      className="text-sm text-blue-600 shrink-0 dark:text-primary-400"
                      onClick={() => void navigator.clipboard.writeText(data.qrUrl)}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <Link
                    to={verifyRoute}
                    className="text-blue-600 hover:underline text-sm dark:text-primary-400"
                  >
                    Open verify page →
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default ProductQr;
