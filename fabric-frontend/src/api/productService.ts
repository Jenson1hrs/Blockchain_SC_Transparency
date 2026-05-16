import axios from 'axios';
import { apiClient } from './client';
import type {
  Product,
  ProductHistory,
  ApiResponse,
  CreateProductResult,
  ProductQrResult,
  VerificationStatus,
} from '../types';
import { API_BASE_URL } from '../config';
import { formatApiError } from './formatApiError';

/** Normalize API/DB payload to Product (camelCase). */
export function normalizeProduct(
  raw: Record<string, unknown> | null | undefined
): Product | null {
  if (!raw) return null;
  const pid = (raw.productId ?? raw.product_id) as string | undefined;
  if (!pid) return null;
  const status = raw.status as Product['status'];
  const ts = raw.timestamp as string | undefined;
  const manufacturerCompanyName = (raw.manufacturerCompanyName ??
    raw.manufacturer_company_name) as string | null | undefined;

  return {
    productId: pid,
    name: String(raw.name ?? ''),
    manufacturer: String(raw.manufacturer ?? ''),
    manufacturerUserId: (raw.manufacturerUserId ?? raw.manufacturer_user_id ?? null) as
      | number
      | null,
    manufacturerCompanyName: manufacturerCompanyName
      ? String(manufacturerCompanyName)
      : String(raw.manufacturer ?? ''),
    batchNumber: String(raw.batchNumber ?? raw.batch_number ?? ''),
    expiryDate: (raw.expiryDate ?? raw.expiry_date ?? null) as string | null,
    imageUrl: (raw.imageUrl ?? raw.image_url ?? null) as string | null,
    ingredients: (raw.ingredients ?? null) as string | null,
    allergyInfo: (raw.allergyInfo ?? raw.allergy_info ?? null) as string | null,
    halalStatus: (raw.halalStatus ?? raw.halal_status ?? null) as string | null,
    usageInstructions: (raw.usageInstructions ?? raw.usage_instructions ?? null) as string | null,
    location: String(raw.location ?? ''),
    owner: String(raw.owner ?? ''),
    status: (['Manufactured', 'In Transit', 'Delivered'].includes(status)
      ? status
      : 'Manufactured') as Product['status'],
    timestamp: ts ?? new Date().toISOString(),
    metadataComplete: (raw.metadataComplete ?? raw.metadata_complete ?? null) as boolean | null,
    metadataCompletionPercent: (raw.metadataCompletionPercent ??
      raw.metadata_completion_percent ??
      null) as number | null,
    metadataMissingFields: (raw.metadataMissingFields ??
      raw.metadata_missing_fields ??
      undefined) as string[] | undefined,
    manufacturerOrganizationVerified: Boolean(
      raw.manufacturerOrganizationVerified ?? raw.organization_verified
    ),
    manufacturerVerifiedByRegulator: Boolean(
      raw.manufacturerVerifiedByRegulator ?? raw.verified_by_regulator
    ),
    manufacturerVerificationDate: (raw.manufacturerVerificationDate ??
      raw.verification_date ??
      null) as string | null,
    manufacturerOrganizationFlagged: Boolean(
      raw.manufacturerOrganizationFlagged ?? raw.organization_flagged
    ),
    currentOwnerUserId: (raw.currentOwnerUserId ?? raw.current_owner_user_id ?? null) as
      | number
      | null,
    currentOwnerRole: (raw.currentOwnerRole ?? raw.current_owner_role ?? null) as string | null,
    currentOwnerName: (raw.currentOwnerName ?? raw.current_owner_name ?? null) as string | null,
    lastTransferredToUserId: (raw.lastTransferredToUserId ??
      raw.last_transferred_to_user_id ??
      null) as number | null,
    lastTransferredAt: (raw.lastTransferredAt ?? raw.last_transferred_at ?? null) as string | null,
  };
}

export function getManufacturerDisplayLabel(product: Product): string {
  return product.manufacturerCompanyName?.trim() || product.manufacturer;
}

export interface ProductSearchResult {
  productId: string;
  name: string;
  manufacturer: string;
  batchNumber: string;
  status: string;
  location: string;
  owner: string;
  expiryDate: string | null;
  imageUrl: string | null;
}

export async function searchProducts(query: string, limit = 30): Promise<ProductSearchResult[]> {
  const path = '/products/search';
  try {
    const response = await apiClient.get<{
      success: boolean;
      data?: ProductSearchResult[];
      message?: string;
    }>(path, { params: { q: query.trim(), limit } });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Search failed');
    }
    return response.data.data ?? [];
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}

export const getProduct = async (productId: string): Promise<Product> => {
  const url = `${API_BASE_URL}/product/${productId}`;
  try {
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(
      `product/${productId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Product not found');
    }

    const p = normalizeProduct(response.data.data);
    if (!p) throw new Error('Product not found');
    return p;
  } catch (e) {
    const msg = formatApiError(e, url);
    if (/product not found/i.test(msg)) {
      throw new Error('Product not found. This may be an unregistered or counterfeit item.');
    }
    throw new Error(msg);
  }
};

export const getProductHistory = async (
  productId: string
): Promise<ProductHistory[]> => {
  try {
    const response = await apiClient.get<ApiResponse<ProductHistory[]>>(
      `history/${productId}`
    );

    if (!response.data.success) {
      console.error('History API returned error:', response.data.message);
      return [];
    }

    return response.data.data || [];
  } catch (error) {
    console.error('History fetch error:', error);
    return [];
  }
};

export const createProduct = async (product: {
  productId: string;
  name: string;
  manufacturer: string;
  batchNumber: string;
  location: string;
  expiryDate?: string;
  imageUrl?: string;
  ingredients?: string;
  allergyInfo?: string;
  halalStatus?: string;
  usageInstructions?: string;
}): Promise<CreateProductResult> => {
  const url = `${API_BASE_URL}/create`;
  try {
    const response = await apiClient.post<
      ApiResponse<Record<string, unknown>> & { qrCode?: string; qrRaw?: string }
    >('create', {
      id: product.productId,
      name: product.name,
      manufacturer: product.manufacturer,
      batch: product.batchNumber,
      location: product.location,
      expiryDate: product.expiryDate || null,
      imageUrl: product.imageUrl || null,
      ingredients: product.ingredients || null,
      allergyInfo: product.allergyInfo || null,
      halalStatus: product.halalStatus || null,
      usageInstructions: product.usageInstructions || null,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create product');
    }

    const p = normalizeProduct(response.data.data);
    if (!p) throw new Error('Invalid create response');
    const qrCode = response.data.qrCode;
    const qrRaw = response.data.qrRaw;
    if (!qrCode || !qrRaw) {
      throw new Error('Create succeeded but QR payload missing');
    }

    return { product: p, qrCode, qrRaw };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data && typeof e.response.data === 'object') {
      const msg = (e.response.data as { message?: string }).message;
      if (msg && e.response.status < 500) {
        throw new Error(msg);
      }
    }
    throw new Error(formatApiError(e, url));
  }
};

export interface VerifyQrResult {
  status: VerificationStatus;
  message?: string;
  product?: Product;
}

export const verifyQr = async (
  productId: string,
  batchNumber: string,
  hash: string
): Promise<VerifyQrResult> => {
  const url = `${API_BASE_URL}/verifyQR`;
  try {
    const response = await apiClient.post<
      ApiResponse<Record<string, unknown>> & {
        verificationStatus?: VerificationStatus;
      }
    >('verifyQR', { productId, batchNumber, hash }, { validateStatus: () => true });

    const body = response.data;
    if (response.status >= 500) {
      return {
        status: 'error',
        message: body.message || 'Server error',
      };
    }

    const v = body.verificationStatus;
    if (v === 'fake') {
      return { status: 'fake', message: body.message };
    }
    if (v === 'not_found') {
      return { status: 'not_found', message: body.message };
    }
    if (v === 'invalid_request') {
      return { status: 'invalid_request', message: body.message };
    }
    if (body.success && body.data) {
      const product = normalizeProduct(body.data as Record<string, unknown>);
      if (product) {
        return {
          status: 'authentic',
          message: body.message,
          product,
        };
      }
    }
    return {
      status: 'error',
      message: body.message || 'Verification failed',
    };
  } catch (e) {
    return {
      status: 'error',
      message: formatApiError(e, url),
    };
  }
};

export const transferProduct = async (
  id: string,
  newOwnerUserId: number
): Promise<Product> => {
  const path = 'transfer';
  try {
    const response = await apiClient.post<ApiResponse<Record<string, unknown>>>(path, {
      id,
      newOwnerUserId,
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to transfer product');
    }

    const p = normalizeProduct(response.data.data);
    if (!p) throw new Error('Invalid transfer response');
    return p;
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
};

export async function fetchAssignedProducts(limit = 100): Promise<Product[]> {
  const path = '/products/assigned';
  try {
    const response = await apiClient.get<{
      success: boolean;
      data?: Record<string, unknown>[];
      message?: string;
    }>(path, { params: { limit } });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to load assigned products');
    }
    return (response.data.data ?? [])
      .map((r) => normalizeProduct(r))
      .filter((p): p is Product => Boolean(p));
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}

export const updateLocation = async (
  id: string,
  location: string
): Promise<Product> => {
  const response = await apiClient.post<ApiResponse<Record<string, unknown>>>(
    'location',
    { id, location }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to update location');
  }

  const p = normalizeProduct(response.data.data);
  if (!p) throw new Error('Invalid location response');
  return p;
};

export const getProductQr = async (productId: string): Promise<ProductQrResult> => {
  const url = `${API_BASE_URL}/qr/${encodeURIComponent(productId)}`;
  try {
    const response = await apiClient.get<
      ApiResponse<unknown> & { qrCode?: string; qrUrl?: string; qrRaw?: string }
    >(`qr/${encodeURIComponent(productId)}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to regenerate QR');
    }
    const qrCode = response.data.qrCode;
    const qrUrl = response.data.qrUrl ?? response.data.qrRaw;
    const qrRaw = response.data.qrRaw ?? response.data.qrUrl;
    if (!qrCode || !qrUrl || !qrRaw) {
      throw new Error('Invalid QR response');
    }
    return { qrCode, qrUrl, qrRaw };
  } catch (e) {
    throw new Error(formatApiError(e, url));
  }
};

export const getExpiringProducts = async (days = 7): Promise<Product[]> => {
  const url = `${API_BASE_URL}/expiring?days=${encodeURIComponent(String(days))}`;
  try {
    const response = await apiClient.get<ApiResponse<Record<string, unknown>[]>>(
      `expiring?days=${encodeURIComponent(String(days))}`
    );
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to load expiring products');
    }
    const rows = response.data.data || [];
    return rows
      .map((r) => normalizeProduct(r))
      .filter((p): p is Product => Boolean(p));
  } catch (e) {
    throw new Error(formatApiError(e, url));
  }
};
