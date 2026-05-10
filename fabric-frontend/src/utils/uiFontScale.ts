export type FontScaleId = 'default' | 'large' | 'larger' | 'largest';

const STORAGE_KEY = 'fabric_ui_font_scale';

const REM: Record<FontScaleId, string> = {
  default: '100%',
  large: '112.5%',
  larger: '125%',
  largest: '137.5%',
};

export function getStoredFontScale(): FontScaleId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'large' || raw === 'larger' || raw === 'largest' || raw === 'default') {
      return raw;
    }
  } catch {
    /* ignore */
  }
  return 'default';
}

export function setStoredFontScale(id: FontScaleId): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
  applyFontScale(id);
}

/** Sets root font size so Tailwind `rem` units scale together. */
export function applyFontScale(id: FontScaleId): void {
  document.documentElement.style.fontSize = REM[id] ?? REM.default;
  document.documentElement.dataset.fontScale = id;
}
