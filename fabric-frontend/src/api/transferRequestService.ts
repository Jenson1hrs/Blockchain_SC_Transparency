import { apiClient } from './client';
import { formatApiError } from './formatApiError';

export type TransferRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface TransferRequest {
  id: number;
  productId: string;
  productName: string | null;
  fromUserId: number;
  toUserId: number;
  fromOrgName: string;
  toOrgName: string;
  status: TransferRequestStatus;
  message: string | null;
  rejectionReason: string | null;
  createdAt: string;
  respondedAt: string | null;
}

export async function createTransferRequest(
  productId: string,
  toUserId: number,
  message?: string
): Promise<TransferRequest> {
  const path = 'transfer/request';
  try {
    const response = await apiClient.post<{
      success: boolean;
      message?: string;
      data?: TransferRequest;
    }>(path, { productId, toUserId, message: message || null });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to create transfer request');
    }
    return response.data.data;
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}

export async function fetchIncomingTransferRequests(): Promise<TransferRequest[]> {
  const path = 'transfer/requests/incoming';
  try {
    const response = await apiClient.get<{ success: boolean; data?: TransferRequest[] }>(path);
    if (!response.data.success) {
      throw new Error('Failed to load incoming requests');
    }
    return response.data.data ?? [];
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}

export async function fetchOutgoingTransferRequests(): Promise<TransferRequest[]> {
  const path = 'transfer/requests/outgoing';
  try {
    const response = await apiClient.get<{ success: boolean; data?: TransferRequest[] }>(path);
    if (!response.data.success) {
      throw new Error('Failed to load outgoing requests');
    }
    return response.data.data ?? [];
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}

export async function acceptTransferRequest(requestId: number): Promise<TransferRequest> {
  const path = `transfer/requests/${requestId}/accept`;
  try {
    const response = await apiClient.patch<{ success: boolean; data?: TransferRequest; message?: string }>(
      path
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to accept transfer');
    }
    return response.data.data;
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}

export async function rejectTransferRequest(
  requestId: number,
  rejectionReason?: string
): Promise<TransferRequest> {
  const path = `transfer/requests/${requestId}/reject`;
  try {
    const response = await apiClient.patch<{ success: boolean; data?: TransferRequest; message?: string }>(
      path,
      { rejectionReason: rejectionReason || null }
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to reject transfer');
    }
    return response.data.data;
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}
