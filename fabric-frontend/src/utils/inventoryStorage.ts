const KEY = 'consumer_inventory_product_ids';

function notifyInventoryUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event('inventory-updated'));
}

export function getInventoryIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string' && v.trim() !== '');
  } catch {
    return [];
  }
}

export function addInventoryId(id: string): { added: boolean; ids: string[] } {
  const clean = id.trim();
  if (!clean) return { added: false, ids: getInventoryIds() };
  const ids = getInventoryIds();
  if (ids.includes(clean)) return { added: false, ids };
  const next = [clean, ...ids];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  notifyInventoryUpdated();
  return { added: true, ids: next };
}

export function removeInventoryId(id: string): string[] {
  const next = getInventoryIds().filter((x) => x !== id);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  notifyInventoryUpdated();
  return next;
}
