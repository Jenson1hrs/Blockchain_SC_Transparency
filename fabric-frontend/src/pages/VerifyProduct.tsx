import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getProduct, getProductHistory, verifyQr } from '../api/productService';
import type { Product, ProductHistory } from '../types';
import QRScanner from '../components/QRScanner';
import AppShell from '../components/AppShell';
import {
  Button,
  Alert,
  TextField,
  ProductCard,
  ProductStatusBadge,
  ExpiryBadge,
  ProductTimeline,
} from '../components';
import { formatHistoryTimestamp } from '../utils/historyTime';
import { parseQrPayload } from '../utils/parseQrPayload';
import { getExpiryReminder } from '../utils/expiryReminder';
import { useAuth } from '../context/AuthContext';
import { addToUserInventory } from '../api/inventoryService';

const VerifyProduct: React.FC = () => {
  const { user } = useAuth();
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
        err instanceof Error ? err.message : 'Product not found or failed',
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
        setError(
          r.message ||
            'QR verification failed. The QR code may have been tampered with.',
        );
        return;
      }
      if (r.status === 'not_found') {
        setError(
          r.message ||
            'Product not found. This may be an unregistered or counterfeit item.',
        );
        return;
      }
      setError(r.message || 'Verification failed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const expiryReminder = product ? getExpiryReminder(product.expiryDate) : null;

  const handleAddToInventory = async (id: string) => {
    setInventoryMsg(null);
    if (!user) {
      setError('Sign in to save products to your inventory. Use Login in the navigation.');
      return;
    }
    try {
      const { added } = await addToUserInventory(id);
      setInventoryMsg(added ? 'Added to My Inventory' : 'Already in My Inventory');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add to inventory');
    }
  };

  return (
    <AppShell
      title="Product Verification"
      subtitle="Verify product authenticity, scan QR codes, and view blockchain history"
    >
      <div className="space-y-8 animate-fade-up">
        {/* Verification Form */}
        <div className="card p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Verify Product
            </h2>
            <p className="text-neutral-600">
              Enter a product ID or scan a QR code to verify authenticity
            </p>
          </div>

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              void handleVerify();
            }}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <TextField
                  label="Product ID"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  placeholder="e.g. P999"
                  helperText="Enter the product ID to verify"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  isLoading={loading}
                  className="whitespace-nowrap"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowScanner((s) => !s)}
                >
                  {showScanner ? 'Close Scanner' : 'Scan QR'}
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                as={Link}
                to={
                  productId.trim()
                    ? `/qr/${encodeURIComponent(productId.trim())}`
                    : '#'
                }
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  if (!productId.trim()) {
                    e.preventDefault();
                    setError('Enter Product ID first to view QR');
                  }
                }}
              >
                View QR Code
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const id = productId.trim() || product?.productId || '';
                  if (!id) {
                    setError('Enter Product ID first to add to inventory');
                    return;
                  }
                  void handleAddToInventory(id);
                }}
              >
                Add to Inventory
              </Button>
            </div>
          </form>

          {/* QR Scanner Section */}
          {showScanner && (
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Scan QR Code
                </h3>
                <p className="text-neutral-600">
                  Use your camera or paste a verification link
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <TextField
                      label="Paste verification link"
                      type="url"
                      value={pastedQrUrl}
                      onChange={(e) => setPastedQrUrl(e.target.value)}
                      placeholder="http://192.168.x.x:5173/verify/...?"
                      helperText="From any QR scanner app"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => {
                        const t = pastedQrUrl.trim();
                        if (t) void handleScan(t);
                      }}
                      disabled={loading || !pastedQrUrl.trim()}
                      isLoading={loading}
                    >
                      Use Link
                    </Button>
                  </div>
                </div>

                <div className="border border-neutral-200 rounded-lg p-4">
                  <QRScanner onScan={(t) => void handleScan(t)} />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6">
              <Alert type="error">{error}</Alert>
            </div>
          )}

          {/* Inventory Message */}
          {inventoryMsg && (
            <div className="mt-6">
              <Alert type="success">
                {inventoryMsg}{' '}
                <Link to="/inventory" className="underline font-medium">
                  Open Inventory
                </Link>
              </Alert>
            </div>
          )}
        </div>

        {/* Product Details */}
        {product && (
          <div className="space-y-8">
            {/* Product Card */}
            <ProductCard
              product={{
                id: product.productId,
                name: product.name,
                description: product.ingredients ?? undefined,
                manufacturer: product.manufacturer,
                status: product.status,
                expiryDate: product.expiryDate ?? undefined,
                imageUrl: product.imageUrl ?? undefined,
              }}
              expiryReminder={expiryReminder || undefined}
              actions={
                <div className="flex gap-2">
                  <Button
                    as={Link}
                    to={`/qr/${encodeURIComponent(product.productId)}`}
                    variant="secondary"
                    size="sm"
                  >
                    View QR
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => void handleAddToInventory(product.productId)}
                  >
                    Save
                  </Button>
                </div>
              }
            />

            {/* Detailed Information */}
            <div className="card p-8">
              <h3 className="text-lg font-semibold text-neutral-900 mb-6">
                Product Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-500">
                      Product ID
                    </label>
                    <p className="font-mono text-neutral-900">
                      {product.productId}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500">
                      Batch Number
                    </label>
                    <p className="font-mono text-neutral-900">
                      {product.batchNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500">
                      Status
                    </label>
                    <div className="mt-1">
                      <ProductStatusBadge status={product.status} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-500">
                      Current Owner
                    </label>
                    <p className="text-neutral-900">{product.owner}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500">
                      Location
                    </label>
                    <p className="text-neutral-900">{product.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500">
                      Last Updated
                    </label>
                    <p className="text-neutral-900">
                      {new Date(product.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-500">
                      Halal Status
                    </label>
                    <p className="text-neutral-900">
                      {product.halalStatus || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-500">
                      Expiry Date
                    </label>
                    <p className="text-neutral-900">
                      {product.expiryDate || 'N/A'}
                    </p>
                  </div>
                  {expiryReminder && (
                    <div>
                      <label className="text-sm font-medium text-neutral-500">
                        Expiry Status
                      </label>
                      <div className="mt-1">
                        <ExpiryBadge level={expiryReminder.level} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="mt-8 space-y-6">
                {product.ingredients && (
                  <div>
                    <label className="text-sm font-medium text-neutral-500">
                      Ingredients
                    </label>
                    <p className="text-neutral-900 mt-1">
                      {product.ingredients}
                    </p>
                  </div>
                )}

                {product.allergyInfo && (
                  <div>
                    <label className="text-sm font-medium text-neutral-500">
                      Allergy Information
                    </label>
                    <p className="text-neutral-900 mt-1">
                      {product.allergyInfo}
                    </p>
                  </div>
                )}

                {product.usageInstructions && (
                  <div>
                    <label className="text-sm font-medium text-neutral-500">
                      Usage Instructions
                    </label>
                    <p className="text-neutral-900 mt-1">
                      {product.usageInstructions}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Product History */}
            {history && history.length > 0 && (
              <div className="card p-8">
                <h3 className="text-lg font-semibold text-neutral-900 mb-6">
                  Supply Chain History
                </h3>
                <ProductTimeline
                  history={history.map((entry) => ({
                    timestamp: formatHistoryTimestamp(entry),
                    status: entry.data.status,
                    location: entry.data.location,
                    notes: `Transaction: ${entry.txId.slice(0, 16)}...`,
                    actor: entry.data.owner,
                  }))}
                />
              </div>
            )}
          </div>
        )}

        {/* Image Zoom Modal */}
        {zoomImage && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
            <div className="relative w-full max-w-3xl">
              <button
                type="button"
                onClick={() => setZoomImage(null)}
                className="absolute -top-10 right-0 text-white text-sm border border-white/40 rounded-md px-3 py-1 hover:bg-white/10 transition-colors"
              >
                Close
              </button>
              <img
                src={zoomImage}
                alt="Enlarged product"
                className="w-full max-h-[80vh] object-contain rounded-lg bg-white shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default VerifyProduct;
