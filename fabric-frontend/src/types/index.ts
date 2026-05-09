export type UserRole =
  | 'admin'
  | 'manufacturer'
  | 'distributor'
  | 'retailer'
  | 'consumer';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  allergies: string | null;
  dietaryPreference: string | null;
  preferredLanguage: string;
}

export interface Product {
  productId: string;
  name: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate?: string | null;
  imageUrl?: string | null;
  ingredients?: string | null;
  allergyInfo?: string | null;
  halalStatus?: string | null;
  usageInstructions?: string | null;
  location: string;
  owner: string;
  status: 'Manufactured' | 'In Transit' | 'Delivered';
  timestamp: string;
}

export interface ProductHistory {
  txId: string;
  /** Present when API returns protobuf-style time; chaincode may omit. */
  timestamp?: {
    seconds: number;
    nanos?: number;
  };
  data: Product;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  qrCode?: string;
  qrRaw?: string;
  verificationStatus?: 'authentic' | 'fake' | 'not_found' | 'invalid_request' | 'error';
}

export type VerificationStatus = NonNullable<ApiResponse<unknown>['verificationStatus']>;

export interface CreateProductResult {
  product: Product;
  qrCode: string;
  qrRaw: string;
}

export interface ProductQrResult {
  qrCode: string;
  qrUrl: string;
  qrRaw: string;
}