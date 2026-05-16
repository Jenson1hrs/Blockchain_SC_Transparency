import { apiClient } from './client';
import { formatApiError } from './formatApiError';
import type { PublicOrganization } from '../types';

export async function fetchOrganization(userId: number): Promise<PublicOrganization | null> {
  const url = `organization/${userId}`;
  try {
    const res = await apiClient.get<{ success: boolean; data?: PublicOrganization }>(url);
    if (!res.data.success || !res.data.data) return null;
    return res.data.data;
  } catch {
    return null;
  }
}

export async function resolveOrganizationUserId(manufacturerName: string): Promise<number | null> {
  if (!manufacturerName.trim()) return null;
  const url = 'organization/resolve';
  try {
    const res = await apiClient.get<{ success: boolean; userId?: number }>(url, {
      params: { manufacturer: manufacturerName.trim() },
    });
    if (!res.data.success || res.data.userId == null) return null;
    return res.data.userId;
  } catch {
    return null;
  }
}

export async function fetchOrganizationSafe(userId: number): Promise<PublicOrganization | null> {
  try {
    return await fetchOrganization(userId);
  } catch (e) {
    console.warn(formatApiError(e, `organization/${userId}`));
    return null;
  }
}
