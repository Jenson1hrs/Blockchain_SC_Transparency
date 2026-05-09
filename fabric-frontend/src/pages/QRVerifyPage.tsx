import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  getProduct,
  getProductHistory,
  verifyQr,
} from '../api/productService';
import { API_BASE_URL } from '../config';
import type { Product, ProductHistory } from '../types';
import { formatHistoryTimestamp } from '../utils/historyTime';
import { getHistoryEventLabel } from '../utils/historyLabel';
import { getExpiryReminder } from '../utils/expiryReminder';
import AppShell from '../components/AppShell';
import { addInventoryId } from '../utils/inventoryStorage';

type VerifyState =
  | { kind: 'loading' }
  | { kind: 'authentic'; product: Product }
  | { kind: 'fake'; message?: string }
  | { kind: 'not_found'; message?: string }
  | { kind: 'id_only'; product: Product; message: string }
  | { kind: 'error'; message: string };

const QRVerifyPage = () => {
  const { productId: routeProductId } = useParams<{ productId: string }>();
  const location = useLocation();
  const [state, setState] = useState<VerifyState>({ kind: 'loading' });
  const [history, setHistory] = useState<ProductHistory[]>([]);
  const [inventoryMsg, setInventoryMsg] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!routeProductId) {
        setState({ kind: 'error', message: 'Invalid product ID' });
        return;
      }

      const productId = decodeURIComponent(routeProductId);
      const params = new URLSearchParams(location.search);
      const batch = params.get('batch');
      const hash = params.get('hash');

      setState({ kind: 'loading' });
      setHistory([]);

      try {
        if (batch && hash) {
          const r = await verifyQr(productId, batch, hash);
          if (cancelled) return;

          if (r.status === 'authentic' && r.product) {
            setState({ kind: 'authentic', product: r.product });
            setHistory(await getProductHistory(productId));
            return;
          }
          if (r.status === 'fake') {
            setState({ kind: 'fake', message: r.message });
            return;
          }
          if (r.status === 'not_found') {
            setState({ kind: 'not_found', message: r.message });
            return;
          }
          if (r.status === 'invalid_request') {
            setState({
              kind: 'error',
              message: r.message || 'Invalid verification request',
            });
            return;
          }
          setState({
            kind: 'error',
            message: r.message || 'Verification failed',
          });
          return;
        }

        const product = await getProduct(productId);
        if (cancelled) return;
        setState({
          kind: 'id_only',
          product,
          message:
            'Product found by ID only. Scan the full QR (with batch and hash) for cryptographic verification.',
        });
        setHistory(await getProductHistory(productId));
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : 'Verification failed';
        if (msg.toLowerCase().includes('not found')) {
          setState({ kind: 'not_found', message: msg });
        } else {
          setState({ kind: 'error', message: msg });
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [routeProductId, location.search]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Manufactured':
        return 'bg-blue-100 text-blue-800';
      case 'In Transit':
        return 'bg-yellow-100 text-yellow-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (state.kind === 'loading') {
    return (
      <AppShell title="QR Verification" subtitle="Validate authenticity from scanned QR data.">
        <div className="card p-8 text-center">Loading…</div>
      </AppShell>
    );
  }

  if (state.kind === 'fake') {
    return (
      <AppShell title="QR Verification" subtitle="Validate authenticity from scanned QR data.">
        <div className="max-w-lg mx-auto card p-8 text-center animate-fade-up">
          <h1 className="text-xl font-bold text-red-700 mb-2">
            Verification Failed
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            {state.message ||
              'QR verification failed. The QR code may have been tampered with.'}
          </p>
          <Link to="/" className="text-blue-600 hover:underline">
            ← Home
          </Link>
        </div>
      </AppShell>
    );
  }

  if (state.kind === 'not_found') {
    return (
      <AppShell title="QR Verification" subtitle="Validate authenticity from scanned QR data.">
        <div className="max-w-lg mx-auto card p-8 text-center animate-fade-up">
          <h1 className="text-xl font-bold text-gray-800 mb-2">Not found</h1>
          <p className="text-gray-600 text-sm mb-6">
            {state.message || 'Product not found. This may be an unregistered or counterfeit item.'}
          </p>
          <Link to="/" className="text-blue-600 hover:underline">
            ← Home
          </Link>
        </div>
      </AppShell>
    );
  }

  if (state.kind === 'error') {
    const msg = state.message;
    const looksLikeConnection =
      /network error|no response|bad gateway|ECONNREFUSED|ERR_NETWORK|502|503/i.test(
        msg
      );
    const title = looksLikeConnection
      ? "Can't reach the API"
      : 'Verification error';
    return (
      <AppShell title="QR Verification" subtitle="Validate authenticity from scanned QR data.">
        <div className="max-w-xl mx-auto card p-8 animate-fade-up">
          <h1 className="text-xl font-bold text-red-700 mb-2 text-center">
            {title}
          </h1>
          {looksLikeConnection && (
            <p className="text-amber-800 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              A <strong>fake hash</strong> test only works after the app can talk to the
              server. Generic &quot;Network Error&quot; usually means the browser never
              got an HTTP response (wrong API URL, API not running, or CORS blocked).
            </p>
          )}
          <p className="text-xs text-gray-500 font-mono mb-2">
            API base: {API_BASE_URL}
          </p>
          <pre className="text-left text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-4 whitespace-pre-wrap font-sans mb-6 overflow-x-auto">
            {msg}
          </pre>
          <div className="text-center">
            <Link to="/" className="text-blue-600 hover:underline">
              ← Home
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const product = state.kind === 'authentic' || state.kind === 'id_only' ? state.product : null;
  if (!product) return null;
  const expiryReminder = getExpiryReminder(product.expiryDate);
  const expiryBadgeClass = (() => {
    if (!expiryReminder) return '';
    switch (expiryReminder.level) {
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  })();

  const banner =
    state.kind === 'authentic' ? (
      <div className="bg-green-50 p-4 border-b border-green-200">
        <h2 className="text-xl font-semibold text-green-800">
          Authentic (QR verified)
        </h2>
      </div>
    ) : (
      <div className="bg-amber-50 p-4 border-b border-amber-200">
        <h2 className="text-xl font-semibold text-amber-900">Product found</h2>
        <p className="text-sm text-amber-800 mt-1">{state.message}</p>
      </div>
    );

  return (
    <AppShell title="QR Verification" subtitle="Validate authenticity from scanned QR data.">
      <div className="max-w-4xl mx-auto">
        <div className="card overflow-hidden animate-fade-up">
          {banner}
          <div className="p-6">
            {expiryReminder && (
              <p className={`inline-block mb-4 text-xs px-2 py-1 rounded-full border ${expiryBadgeClass}`}>
                Expiry Reminder: {expiryReminder.label}
              </p>
            )}
            <div className="mb-5 p-4 rounded-lg border bg-slate-50">
              <p className="text-sm font-semibold text-gray-900 mb-2">Expiry Reminder</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Expires on</p>
                  <p className="font-medium">{product.expiryDate || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium">{expiryReminder?.statusText || 'No expiry set'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Days left</p>
                  <p className="font-medium">
                    {expiryReminder ? (expiryReminder.daysLeft >= 0 ? expiryReminder.daysLeft : 0) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={`${product.name} product`}
                    className="w-full max-h-64 object-cover rounded-lg border border-gray-200 cursor-zoom-in"
                    onClick={() => setZoomImage(product.imageUrl || null)}
                  />
                ) : (
                  <div className="h-52 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-sm text-gray-500">
                    No product image
                  </div>
                )}
              </div>
              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Product ID</p>
                  <p className="font-mono">{product.productId}</p>
                  <button
                    type="button"
                    onClick={() => {
                      const out = addInventoryId(product.productId);
                      setInventoryMsg(
                        out.added
                          ? 'Added to My Inventory'
                          : 'Already in My Inventory'
                      );
                    }}
                    className="block text-xs text-indigo-700 hover:underline mt-1"
                  >
                    Add to My Inventory
                  </button>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Manufacturer</p>
                  <p className="font-medium">{product.manufacturer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Batch</p>
                  <p className="font-mono">{product.batchNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="font-medium">{product.expiryDate || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Halal Status</p>
                  <p className="font-medium">{product.halalStatus || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Owner</p>
                  <p className="font-medium">{product.owner}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{product.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}
                  >
                    {product.status}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500">Ingredients</p>
                  <p className="text-sm">{product.ingredients || 'N/A'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500">Allergy Info</p>
                  <p className="text-sm">{product.allergyInfo || 'N/A'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-gray-500">Usage Instructions</p>
                  <p className="text-sm">{product.usageInstructions || 'N/A'}</p>
                </div>
              </div>
            </div>
            {inventoryMsg && (
              <p className="mt-4 text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2">
                {inventoryMsg}{' '}
                <Link to="/inventory" className="underline">
                  Open Inventory
                </Link>
              </p>
            )}
          </div>
        </div>

        {history.length > 0 && (
          <div className="card overflow-hidden mt-8 animate-fade-up">
            <div className="bg-gray-100 p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Product journey</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {history.map((entry, index) => (
                <div key={`${entry.txId}-${index}`} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {history.length - index}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                          {getHistoryEventLabel(history, index)}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(entry.data.status)}`}
                        >
                          {entry.data.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatHistoryTimestamp(entry)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Owner:</span> {entry.data.owner}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span>{' '}
                        {entry.data.location}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center flex gap-4 justify-center">
          <Link to="/" className="text-blue-600 hover:underline">
            ← Verify
          </Link>
          <Link to="/create" className="text-blue-600 hover:underline">
            Create product
          </Link>
        </div>
        {zoomImage && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="relative w-full max-w-3xl">
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                className="absolute -top-10 right-0 text-white text-sm border border-white/40 rounded-md px-3 py-1 hover:bg-white/10"
              >
                Close
              </button>
              <img
                src={zoomImage}
                alt="Enlarged product"
                className="w-full max-h-[80vh] object-contain rounded-lg bg-white"
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default QRVerifyPage;
