import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProductHistory } from '../api/productService';
import type { Product, ProductHistory } from '../types';

const QRVerifyPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<ProductHistory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyProduct = async () => {
      if (!productId) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }

      // Get batch and hash from URL query params
      const urlParams = new URLSearchParams(window.location.search);
      const batch = urlParams.get('batch');
      const hash = urlParams.get('hash');

      try {
        // If batch and hash are provided, verify QR authenticity
        if (batch && hash) {
          const response = await fetch('http://192.168.1.11:3000/verifyQR', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, batchNumber: batch, hash })
          });
          const data = await response.json();
          if (!data.success) throw new Error(data.message);
          setProduct(data.data);
        } else {
          // Fallback to regular product fetch
          const productRes = await fetch(`http://192.168.1.11:3000/product/${productId}`);
          const productData = await productRes.json();
          if (!productData.success) throw new Error(productData.message);
          setProduct(productData.data);
        }

        const historyData = await getProductHistory(productId);
        setHistory(historyData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyProduct();
  }, [productId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Manufactured': return 'bg-blue-100 text-blue-800';
      case 'In Transit': return 'bg-yellow-100 text-yellow-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-600">{error}</div>;
  if (!product) return <div className="text-center py-8">Product not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-50 p-4 border-b border-green-200">
            <h2 className="text-xl font-semibold text-green-800">✅ Authentic Product Verified</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Product ID</p><p className="font-mono">{product.productId}</p></div>
              <div><p className="text-sm text-gray-500">Name</p><p className="font-medium">{product.name}</p></div>
              <div><p className="text-sm text-gray-500">Manufacturer</p><p className="font-medium">{product.manufacturer}</p></div>
              <div><p className="text-sm text-gray-500">Batch Number</p><p className="font-mono">{product.batchNumber}</p></div>
              <div><p className="text-sm text-gray-500">Current Owner</p><p className="font-medium">{product.owner}</p></div>
              <div><p className="text-sm text-gray-500">Location</p><p className="font-medium">{product.location}</p></div>
              <div><p className="text-sm text-gray-500">Status</p><span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>{product.status}</span></div>
            </div>
          </div>
        </div>

        {history && history.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
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
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(entry.data.status)}`}>{entry.data.status}</span>
                        <span className="text-xs text-gray-500">{new Date(entry.timestamp.seconds * 1000).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600"><span className="font-medium">Owner:</span> {entry.data.owner}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Location:</span> {entry.data.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <a href="/" className="text-blue-600 hover:underline">← Back to Home</a>
        </div>
      </div>
    </div>
  );
};

export default QRVerifyPage;