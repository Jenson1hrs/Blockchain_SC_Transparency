import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getProduct,
  getProductHistory,
  verifyQr,
} from '../api/productService';
import type { Product, ProductHistory } from '../types';
import QRScanner from '../components/QRScanner';
import AppShell from '../components/AppShell';
import { formatHistoryTimestamp } from '../utils/historyTime';
import { getHistoryEventLabel } from '../utils/historyLabel';
import { parseQrPayload } from '../utils/parseQrPayload';
import { getExpiryReminder } from '../utils/expiryReminder';
import { addInventoryId } from '../utils/inventoryStorage';

const VerifyProduct: React.FC = () => {
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<ProductHistory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [pastedQrUrl, setPastedQrUrl] = useState('');
  const [inventoryMsg, setInventoryMsg] = useState<string | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!productId.trim()) {
      setError('Please enter a Product ID');
      return;
    }

    setLoading(true);
    setError(null);
    setProduct(null);
    setHistory(null);

    try {
      const p = await getProduct(productId.trim());
      setProduct(p);
      const h = await getProductHistory(productId.trim());
      setHistory(h);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Product not found or failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (scannedText: string) => {
    const parsed = parseQrPayload(scannedText);
    if (!parsed) {
      setError('Invalid QR: expected verify URL or id|batch|hash');
      return;
    }

    setLoading(true);
    setError(null);
    setShowScanner(false);
    setProduct(null);
    setHistory(null);

    try {
      const r = await verifyQr(parsed.productId, parsed.batch, parsed.hash);
      if (r.status === 'authentic' && r.product) {
        setProduct(r.product);
        setProductId(parsed.productId);
        const h = await getProductHistory(parsed.productId);
        setHistory(h);
        return;
      }
      if (r.status === 'fake') {
        setError(r.message || 'QR verification failed. The QR code may have been tampered with.');
        return;
      }
      if (r.status === 'not_found') {
        setError(r.message || 'Product not found. This may be an unregistered or counterfeit item.');
        return;
      }
      setError(r.message || 'Verification failed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

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

  const expiryReminder = product ? getExpiryReminder(product.expiryDate) : null;
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

  return (
    <AppShell
      title="Product Verification"
      subtitle="Verify product authenticity, scan QR, and view blockchain history."
    >

        <div className="card p-6 mb-8 animate-fade-up">
          <form
            className="flex gap-4 flex-wrap mb-4"
            onSubmit={(e) => {
              e.preventDefault();
              void handleVerify();
            }}
          >
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Product ID (e.g. P999)"
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying…' : 'Verify'}
            </button>
            <button
              type="button"
              onClick={() => setShowScanner((s) => !s)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {showScanner ? 'Close scanner' : 'Scan QR'}
            </button>
            <Link
              to={productId.trim() ? `/qr/${encodeURIComponent(productId.trim())}` : '#'}
              onClick={(e) => {
                if (!productId.trim()) {
                  e.preventDefault();
                  setError('Enter Product ID first to view QR');
                }
              }}
              className="px-6 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
            >
              View QR
            </Link>
            <button
              type="button"
              onClick={() => {
                const id = productId.trim() || product?.productId || '';
                if (!id) {
                  setError('Enter Product ID first to add inventory');
                  return;
                }
                const out = addInventoryId(id);
                setInventoryMsg(out.added ? 'Added to My Inventory' : 'Already in My Inventory');
              }}
              className="px-6 py-2 border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50"
            >
              Add to Inventory
            </button>
          </form>

          {showScanner && (
            <div className="mb-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste verification link (from any scanner app)
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="url"
                    autoComplete="off"
                    value={pastedQrUrl}
                    onChange={(e) => setPastedQrUrl(e.target.value)}
                    placeholder="http://192.168.x.x:5173/verify/…?batch=…&hash=…"
                    className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    disabled={loading || !pastedQrUrl.trim()}
                    onClick={() => {
                      const t = pastedQrUrl.trim();
                      if (t) void handleScan(t);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Use pasted link
                  </button>
                </div>
              </div>
              <QRScanner onScan={(t) => void handleScan(t)} />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {product && (
          <div className="card overflow-hidden mb-8 animate-fade-up">
            <div className="bg-green-50 p-4 border-b border-green-200">
              <h2 className="text-xl font-semibold text-green-800">
                Product record
              </h2>
              {expiryReminder && (
                <p className={`inline-block mt-2 text-xs px-2 py-1 rounded-full border ${expiryBadgeClass}`}>
                  Expiry Reminder: {expiryReminder.label}
                </p>
              )}
            </div>
            <div className="p-6">
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
                    <p className="font-mono font-medium">{product.productId}</p>
                    <Link
                      to={`/qr/${encodeURIComponent(product.productId)}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View QR code
                    </Link>
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
                  <div>
                    <p className="text-sm text-gray-500">Last updated</p>
                    <p className="text-sm">
                      {new Date(product.timestamp).toLocaleString()}
                    </p>
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
        )}

        {history && history.length > 0 && (
          <div className="card overflow-hidden animate-fade-up">
            <div className="bg-gray-100 p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Product journey</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {history.map((entry, index) => (
                <div
                  key={`${entry.txId}-${index}`}
                  className="p-4 hover:bg-gray-50"
                >
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
                        <span className="font-medium">Owner:</span>{' '}
                        {entry.data.owner}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span>{' '}
                        {entry.data.location}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Tx: {entry.txId.slice(0, 16)}…
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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
    </AppShell>
  );
};

export default VerifyProduct;
