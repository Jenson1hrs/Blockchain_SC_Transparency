/** Device-only theme when logged out (not mixed between accounts). */
export const GUEST_THEME_KEY = 'fabric-theme-guest';

export type ThemePreference = 'light' | 'dark';

export function readGuestTheme(): ThemePreference {
  try {
    const v = localStorage.getItem(GUEST_THEME_KEY);
    return v === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function writeGuestTheme(mode: ThemePreference) {
  try {
    localStorage.setItem(GUEST_THEME_KEY, mode);
  } catch {
    /* ignore */
  }
}
