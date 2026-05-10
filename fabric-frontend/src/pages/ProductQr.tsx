import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductQr } from '../api/productService';
import AppShell from '../components/AppShell';
import type { ProductQrResult } from '../types';

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
        setError(e instanceof Error ? e.message : 'Failed to load QR');
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

  return (
    <AppShell title="Product QR" subtitle="Regenerate QR anytime from blockchain data.">
      <div className="max-w-2xl mx-auto">
        <div className="card overflow-hidden animate-fade-up">
          <div className="p-6 space-y-6">
            <p className="text-sm text-gray-600">
              Product ID: <span className="font-mono">{productId}</span>
            </p>

            {error && (
              <pre className="text-xs text-red-800 bg-red-50 p-3 rounded-lg border border-red-200 whitespace-pre-wrap font-sans overflow-x-auto">
                {error}
              </pre>
            )}

            {data && (
              <>
                <div className="text-center">
                  <img
                    src={data.qrCode}
                    alt={`QR for ${productId}`}
                    className="mx-auto max-w-[260px] border border-gray-200 rounded"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Verification URL</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all flex-1 min-w-0">
                      {data.qrUrl}
                    </code>
                    <button
                      type="button"
                      className="text-sm text-blue-600 shrink-0"
                      onClick={() => void navigator.clipboard.writeText(data.qrUrl)}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="text-center">
                  <a
                    href={data.qrUrl}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Open verify page →
                  </a>
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
