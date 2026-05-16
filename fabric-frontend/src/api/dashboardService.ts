import type { DashboardSummaryResponse, UserRole } from '../types';
import { apiClient } from './client';
import { formatApiError } from './formatApiError';

export type DashboardSummaryPayload = Pick<DashboardSummaryResponse, 'role' | 'data'>;

export async function fetchDashboardSummary(): Promise<DashboardSummaryPayload> {
  const url = 'dashboard/summary';
  try {
    const res = await apiClient.get<DashboardSummaryResponse>(url);
    if (!res.data.success || !res.data.data || !res.data.role) {
      throw new Error('Dashboard data unavailable');
    }
    return { role: res.data.role as UserRole, data: res.data.data };
  } catch (e) {
    throw new Error(formatApiError(e, url));
  }
}
