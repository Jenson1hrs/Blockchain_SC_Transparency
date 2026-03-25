import axios from 'axios';
import type { Product, ProductHistory, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:3000';

// Get product by ID
export const getProduct = async (productId: string): Promise<Product> => {
  const response = await axios.get<ApiResponse<Product>>(
    `${API_BASE_URL}/product/${productId}`
  );
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'Product not found');
  }
  
  return response.data.data!;
};

// Get product history
export const getProductHistory = async (productId: string): Promise<ProductHistory[]> => {
  const response = await axios.get<ApiResponse<ProductHistory[]>>(
    `${API_BASE_URL}/history/${productId}`
  );
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'History not found');
  }
  
  return response.data.data!;
};

// Create a new product
export const createProduct = async (product: {
  productId: string;
  name: string;
  manufacturer: string;
  batchNumber: string;
  location: string;
}): Promise<Product> => {
  const response = await axios.post<ApiResponse<Product>>(
    `${API_BASE_URL}/createProduct`,
    {
      id: product.productId,        // Backend expects 'id'
      name: product.name,
      manufacturer: product.manufacturer,
      batch: product.batchNumber,   // Backend expects 'batch'
      location: product.location
    }
  );
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to create product');
  }
  
  return response.data.data!;
};

// Transfer product
export const transferProduct = async (id: string, newOwner: string): Promise<Product> => {
  const response = await axios.post<ApiResponse<Product>>(
    `${API_BASE_URL}/transfer`,
    { id, newOwner }
  );
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to transfer product');
  }
  
  return response.data.data!;
};

// Update location
export const updateLocation = async (id: string, location: string): Promise<Product> => {
  const response = await axios.post<ApiResponse<Product>>(
    `${API_BASE_URL}/location`,
    { id, location }
  );
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to update location');
  }
  
  return response.data.data!;
};