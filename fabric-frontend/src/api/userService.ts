import { apiClient } from './client';
import { formatApiError } from './formatApiError';
import type { UserRole } from '../types';

export interface SupplyChainUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  companyName: string | null;
  displayName: string;
  organizationVerified: boolean;
  organizationFlagged: boolean;
}

export async function fetchSupplyChainUsers(
  q = '',
  role?: UserRole | ''
): Promise<SupplyChainUser[]> {
  const path = '/users/supply-chain';
  try {
    const response = await apiClient.get<{
      success: boolean;
      data?: SupplyChainUser[];
      message?: string;
    }>(path, {
      params: {
        ...(q.trim() ? { q: q.trim() } : {}),
        ...(role ? { role } : {}),
      },
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to load users');
    }
    return response.data.data ?? [];
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}
