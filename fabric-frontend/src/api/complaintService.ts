import { apiClient } from './client';
import { formatApiError } from './formatApiError';
import type { ComplaintStatus, ManufacturerComplaintSummary, ProductComplaint } from '../types';

export async function submitComplaint(payload: {
  productId: string;
  category: string;
  message: string;
}): Promise<void> {
  const path = '/complaints';
  try {
    const res = await apiClient.post<{ success: boolean; message?: string }>(path, payload);
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to submit report');
    }
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}

export async function fetchManufacturerComplaintSummary(): Promise<ManufacturerComplaintSummary> {
  const path = '/complaints/manufacturer/summary';
  try {
    const res = await apiClient.get<{ success: boolean; data?: ManufacturerComplaintSummary }>(path);
    if (!res.data.success || !res.data.data) {
      throw new Error('Failed to load complaint summary');
    }
    return res.data.data;
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}

export async function fetchManufacturerComplaints(options?: {
  status?: ComplaintStatus;
  productId?: string;
  limit?: number;
}): Promise<ProductComplaint[]> {
  const path = '/complaints/manufacturer';
  try {
    const res = await apiClient.get<{ success: boolean; data?: ProductComplaint[] }>(path, {
      params: options,
    });
    if (!res.data.success) {
      throw new Error('Failed to load complaints');
    }
    return res.data.data ?? [];
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}

export async function fetchMyProductReports(limit = 50): Promise<ProductComplaint[]> {
  const path = '/complaints/my-reports';
  try {
    const res = await apiClient.get<{ success: boolean; data?: ProductComplaint[] }>(path, {
      params: { limit },
    });
    if (!res.data.success) {
      throw new Error('Failed to load your reports');
    }
    return res.data.data ?? [];
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}

export async function updateComplaintStatus(
  complaintId: number,
  status: ComplaintStatus,
  manufacturerResponse: string,
): Promise<ProductComplaint> {
  const path = `/complaints/${complaintId}/status`;
  try {
    const res = await apiClient.patch<{ success: boolean; data?: ProductComplaint; message?: string }>(
      path,
      { status, manufacturerResponse },
    );
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Failed to update status');
    }
    return res.data.data;
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}
