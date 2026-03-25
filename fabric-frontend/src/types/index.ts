export interface Product {
  productId: string;
  name: string;
  manufacturer: string;
  batchNumber: string;
  location: string;
  owner: string;
  status: 'Manufactured' | 'In Transit' | 'Delivered';
  timestamp: string;
}

export interface ProductHistory {
  txId: string;
  timestamp: {
    seconds: number;
    nanos: number;
  };
  data: Product;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}