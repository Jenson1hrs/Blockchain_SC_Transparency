/**
 * @deprecated Inventory is stored per user in PostgreSQL (`user_inventory`).
 * Use `addToUserInventory` / `fetchUserInventory` / `removeFromUserInventory` from `api/inventoryService`.
 *
 * This module only keeps `notifyInventoryUpdated` for backwards compatibility with listeners.
 */

export function notifyInventoryUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('inventory-updated'));
}
