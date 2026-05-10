import { apiClient } from './client';
import { formatApiError } from './formatApiError';

export type UserInventoryEntry = {
  id: number;
  productId: string;
  addedAt: string;
};

function dispatchInventoryUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('inventory-updated'));
}

export async function fetchUserInventory(): Promise<UserInventoryEntry[]> {
  const url = 'inventory';
  try {
    const res = await apiClient.get<{ success: boolean; data?: UserInventoryEntry[] }>(url);
    if (!res.data.success) throw new Error('Failed to load inventory');
    return res.data.data ?? [];
  } catch (e) {
    throw new Error(formatApiError(e, url));
  }
}

/** Adds product to the logged-in user's server-side inventory. Dispatches `inventory-updated` on success. */
export async function addToUserInventory(productId: string): Promise<{ added: boolean }> {
  const url = 'inventory';
  try {
    const res = await apiClient.post<{ success: boolean; added?: boolean; message?: string }>(
      url,
      { productId: productId.trim() }
    );
    if (!res.data.success) throw new Error(res.data.message || 'Failed to add to inventory');
    dispatchInventoryUpdated();
    return { added: Boolean(res.data.added) };
  } catch (e) {
    throw new Error(formatApiError(e, url));
  }
}

/** Removes product from server-side inventory. Dispatches `inventory-updated` on success. */
export async function removeFromUserInventory(productId: string): Promise<void> {
  const path = `inventory/${encodeURIComponent(productId.trim())}`;
  try {
    const res = await apiClient.delete<{ success: boolean }>(path);
    if (!res.data?.success) throw new Error('Failed to remove from inventory');
    dispatchInventoryUpdated();
  } catch (e) {
    throw new Error(formatApiError(e, path));
  }
}
