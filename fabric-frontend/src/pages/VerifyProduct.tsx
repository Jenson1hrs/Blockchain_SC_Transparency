import React, { useState } from 'react';
import { getProduct, getProductHistory } from '../api/productService';
import type { Product, ProductHistory } from '../types';

const VerifyProduct: React.FC = () => {
  const [productId, setProductId] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<ProductHistory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const [productData, historyData] = await Promise.all([
        getProduct(productId),
        getProductHistory(productId)
      ]);
      
      setProduct(productData);
      setHistory(historyData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Product not found or verification failed');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Product Authenticity Verification
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Enter Product ID (e.g., P999)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleVerify}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {product && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="bg-green-50 p-4 border-b border-green-200">
              <h2 className="text-xl font-semibold text-green-800">
                ✅ Authentic Product Verified
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Product ID</p>
                  <p className="font-mono font-medium">{product.productId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Product Name</p>
                  <p className="font-medium">{product.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Manufacturer</p>
                  <p className="font-medium">{product.manufacturer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Batch Number</p>
                  <p className="font-mono">{product.batchNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Owner</p>
                  <p className="font-medium">{product.owner}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Location</p>
                  <p className="font-medium">{product.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-sm">{new Date(product.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {history && history.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-100 p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Product Journey Timeline</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {history.map((entry, index) => (
                <div key={entry.txId} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{history.length - index}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(entry.data.status)}`}>
                          {entry.data.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(entry.timestamp.seconds * 1000).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Owner:</span> {entry.data.owner}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {entry.data.location}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Transaction ID: {entry.txId.slice(0, 16)}...
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyProduct;