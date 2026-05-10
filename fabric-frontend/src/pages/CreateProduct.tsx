import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createProduct } from '../api/productService';
import { API_BASE_URL } from '../config';
import AppShell from '../components/AppShell';
import type { Product } from '../types';

const CreateProduct = () => {
  const [form, setForm] = useState({
    productId: '',
    name: '',
    manufacturer: '',
    batchNumber: '',
    location: '',
    expiryDate: '',
    imageUrl: '',
    ingredients: '',
    allergyInfo: '',
    halalStatus: '',
    usageInstructions: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<{
    product: Product;
    qrCode: string;
    qrRaw: string;
  } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const onPickImage = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }
    // Keep payload reasonable when storing as base64 in TEXT column
    if (file.size > 2 * 1024 * 1024) {
      setError('Image too large. Please pick an image <= 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      setForm((f) => ({ ...f, imageUrl: dataUrl }));
      setImagePreview(dataUrl || null);
    };
    reader.onerror = () => {
      setError('Failed to read selected image');
    };
    reader.readAsDataURL(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setResult(null);
    setLoading(true);
    try {
      const out = await createProduct(form);
      setResult(out);
      setSuccess(`Product ${out.product.productId} created successfully.`);
      setForm({
        productId: '',
        name: '',
        manufacturer: '',
        batchNumber: '',
        location: '',
        expiryDate: '',
        imageUrl: '',
        ingredients: '',
        allergyInfo: '',
        halalStatus: '',
        usageInstructions: '',
      });
      setImagePreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Create Product" subtitle="Register a product on blockchain and generate QR.">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs text-gray-500 mb-6 font-mono break-all">
          API base: {API_BASE_URL}
          {import.meta.env.DEV && (
            <span className="block mt-1 text-amber-700">
              Dev: leave <code className="bg-amber-100 px-1">VITE_API_BASE_URL</code> unset to
              use <code className="bg-amber-100 px-1">/api</code> proxy → port 3000
            </span>
          )}
        </p>

        <form
          onSubmit={submit}
          className="card p-6 space-y-4 mb-8 animate-fade-up"
        >
          {[
            ['productId', 'Product ID', 'text', 'e.g. P400'],
            ['name', 'Name', 'text', ''],
            ['manufacturer', 'Manufacturer', 'text', ''],
            ['batchNumber', 'Batch number', 'text', ''],
            ['location', 'Location', 'text', ''],
            ['expiryDate', 'Expiry Date (optional)', 'date', ''],
            ['halalStatus', 'Halal Status (optional)', 'text', 'Halal / Non-Halal / Unknown'],
          ].map(([key, label, type, ph]) => (
            <div key={key as string}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <input
                required={key !== 'expiryDate'}
                type={type as string}
                placeholder={ph as string}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image Upload (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onPickImage(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Or keep using URL field by pasting into browser address bar and copy direct image link.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image URL (optional fallback)
            </label>
            <input
              type="url"
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, imageUrl: e.target.value }))
              }
            />
          </div>
          {(imagePreview || (form.imageUrl && !form.imageUrl.startsWith('data:'))) && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Image preview</p>
              <img
                src={imagePreview || form.imageUrl}
                alt="Selected product preview"
                className="max-w-[260px] rounded-lg border border-gray-200"
              />
            </div>
          )}
          {[
            ['ingredients', 'Ingredients (optional)', 'e.g. Sugar, cocoa, milk'],
            ['allergyInfo', 'Allergy Info (optional)', 'e.g. Contains milk and nuts'],
            ['usageInstructions', 'Usage Instructions (optional)', 'e.g. Keep refrigerated after opening'],
          ].map(([key, label, ph]) => (
            <div key={key as string}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <textarea
                rows={3}
                placeholder={ph as string}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={form[key as keyof typeof form]}
                onChange={(e) =>
                  setForm((f) => ({ ...f, [key]: e.target.value }))
                }
              />
            </div>
          ))}
          {error && (
            <pre className="text-xs text-red-800 bg-red-50 p-3 rounded-lg border border-red-200 whitespace-pre-wrap font-sans overflow-x-auto">
              {error}
            </pre>
          )}
          {success && (
            <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-200">
              {success}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create on blockchain'}
          </button>
        </form>

        {result && (
          <div className="card overflow-hidden animate-fade-up">
            <div className="bg-green-50 px-4 py-3 border-b border-green-200">
              <h2 className="font-semibold text-green-800">Created</h2>
            </div>
            <div className="p-6 space-y-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-gray-500">Product ID</dt>
                  <dd className="font-mono font-medium">{result.product.productId}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Name</dt>
                  <dd className="font-medium">{result.product.name}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Manufacturer</dt>
                  <dd>{result.product.manufacturer}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Batch</dt>
                  <dd className="font-mono">{result.product.batchNumber}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-gray-500">Location</dt>
                  <dd>{result.product.location}</dd>
                </div>
                {result.product.expiryDate && (
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500">Expiry Date</dt>
                    <dd>{result.product.expiryDate}</dd>
                  </div>
                )}
                {result.product.halalStatus && (
                  <div>
                    <dt className="text-gray-500">Halal Status</dt>
                    <dd>{result.product.halalStatus}</dd>
                  </div>
                )}
              </dl>
              {result.product.imageUrl && (
                <div className="text-center">
                  <img
                    src={result.product.imageUrl}
                    alt={`${result.product.name} preview`}
                    className="mx-auto max-w-[280px] rounded-lg border border-gray-200"
                  />
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-2">Verification URL</p>
                {(result.qrRaw.includes('localhost') ||
                  result.qrRaw.includes('127.0.0.1')) && (
                  <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
                    <strong>Phones / other devices</strong> cannot open{' '}
                    <code className="bg-amber-100 px-1">localhost</code>. Set environment variable{' '}
                    <code className="bg-amber-100 px-1">FRONTEND_URL=http://&lt;your-laptop-LAN-IP&gt;:5173</code>{' '}
                    when starting <strong>fabric-api</strong>, then create the product again so the QR
                    encodes your LAN URL.
                  </div>
                )}
                <div className="flex gap-2 flex-wrap items-center">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all flex-1 min-w-0">
                    {result.qrRaw}
                  </code>
                  <button
                    type="button"
                    className="text-sm text-blue-600 shrink-0"
                    onClick={() =>
                      void navigator.clipboard.writeText(result.qrRaw)
                    }
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">QR code</p>
                <img
                  src={result.qrCode}
                  alt="Product verification QR"
                  className="mx-auto max-w-[220px] border border-gray-200 rounded"
                />
              </div>

              <div className="text-center">
                <Link
                  to={(() => {
                    const u = new URL(result.qrRaw);
                    return `${u.pathname}${u.search}`;
                  })()}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Open verify page →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default CreateProduct;
