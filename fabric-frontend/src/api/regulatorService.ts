import { apiClient } from './client';
import { formatApiError } from './formatApiError';
import type { RegulatorOrganizationRow, RegulatorProductOversightRow } from '../types';

export interface RegulatorSummary {
  verifiedOrganizationsCount: number;
  pendingOrganizationsCount: number;
  incompleteMetadataProductCount: number;
  flaggedProductCount: number;
  totalTraceableProducts: number;
  databaseStatus: string;
  blockchainStatus: string;
  apiStatus: string;
}

export type RegulatorProductFilter =
  | 'all'
  | 'incomplete'
  | 'flagged'
  | 'expiring'
  | 'flagged_org';

export interface RegulatorProductsQuery {
  filter?: RegulatorProductFilter;
  q?: string;
  status?: string;
  manufacturer?: string;
  limit?: number;
}

export async function fetchRegulatorOrganizations(): Promise<RegulatorOrganizationRow[]> {
  const path = '/regulator/organizations';
  try {
    const res = await apiClient.get<{ success: boolean; data?: RegulatorOrganizationRow[] }>(path);
    if (!res.data.success || !res.data.data) return [];
    return res.data.data;
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}

export async function setOrganizationVerification(
  organizationId: number,
  verified: boolean
): Promise<RegulatorOrganizationRow> {
  const path = `/regulator/organizations/${organizationId}/verification`;
  try {
    const res = await apiClient.patch<{
      success: boolean;
      data?: RegulatorOrganizationRow;
      message?: string;
    }>(path, { verified });
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Update failed');
    }
    return res.data.data;
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}

export async function setOrganizationFlag(
  organizationId: number,
  flagged: boolean,
  reason?: string
): Promise<RegulatorOrganizationRow> {
  const path = `/regulator/organizations/${organizationId}/flag`;
  try {
    const res = await apiClient.patch<{
      success: boolean;
      data?: RegulatorOrganizationRow;
      message?: string;
    }>(path, { flagged, reason: reason?.trim() || undefined });
    if (!res.data.success || !res.data.data) {
      throw new Error(res.data.message || 'Update failed');
    }
    return res.data.data;
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}

export async function fetchRegulatorProducts(
  query: RegulatorProductsQuery = {}
): Promise<RegulatorProductOversightRow[]> {
  const path = '/regulator/products';
  try {
    const res = await apiClient.get<{ success: boolean; data?: RegulatorProductOversightRow[] }>(
      path,
      {
        params: {
          filter: query.filter ?? 'all',
          q: query.q?.trim() || undefined,
          status: query.status?.trim() || undefined,
          manufacturer: query.manufacturer?.trim() || undefined,
          limit: query.limit ?? 100,
        },
      }
    );
    if (!res.data.success || !res.data.data) return [];
    return res.data.data;
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}

export async function fetchRegulatorSummary(): Promise<RegulatorSummary | null> {
  const path = '/regulator/summary';
  try {
    const res = await apiClient.get<{ success: boolean; data?: RegulatorSummary }>(path);
    if (!res.data.success || !res.data.data) return null;
    return res.data.data;
  } catch {
    return null;
  }
}
