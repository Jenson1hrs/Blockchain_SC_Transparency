import { apiClient } from './client';
import type { AdminUserRow, SystemStatusResponse } from '../types';

export async function fetchPublicHealth() {
  const { data } = await apiClient.get<{
    success: boolean;
    status: string;
    timestamp: string;
  }>('/health');
  return data;
}

export async function fetchAdminUsers() {
  const { data } = await apiClient.get<{
    success: boolean;
    data: AdminUserRow[];
    roleCounts: Record<string, number>;
  }>('/admin/users');
  return data;
}

export async function fetchAdminSystemStatus() {
  const { data } = await apiClient.get<SystemStatusResponse>('/admin/system-status');
  return data;
}
