import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';
import { updateMeApi } from '../api/authService';
import {
  readGuestTheme,
  writeGuestTheme,
  type ThemePreference,
} from '../utils/themeStorage';

function applyDomTheme(mode: ThemePreference) {
  document.documentElement.classList.toggle('dark', mode === 'dark');
}

type ThemeContextValue = {
  /** Effective theme on screen */
  resolved: ThemePreference;
  setTheme: (mode: ThemePreference) => Promise<void>;
  toggleTheme: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { user, loading, setCurrentUser } = useAuth();
  const [guestTheme, setGuestTheme] = useState<ThemePreference>(() => readGuestTheme());

  useEffect(() => {
    if (!loading && !user) {
      setGuestTheme(readGuestTheme());
    }
  }, [loading, user]);

  useEffect(() => {
    if (loading) return;
    if (user) {
      applyDomTheme(user.themePreference ?? 'light');
    } else {
      applyDomTheme(guestTheme);
    }
  }, [loading, user, guestTheme]);

  const setTheme = useCallback(
    async (mode: ThemePreference) => {
      applyDomTheme(mode);
      if (!user) {
        writeGuestTheme(mode);
        setGuestTheme(mode);
        return;
      }
      const res = await updateMeApi({
        name: user.name,
        allergies: user.allergies ?? '',
        dietaryPreference: user.dietaryPreference ?? '',
        preferredLanguage: user.preferredLanguage || 'en',
        themePreference: mode,
      });
      if (res.success && res.user) {
        setCurrentUser(res.user);
      }
    },
    [user, setCurrentUser]
  );

  const toggleTheme = useCallback(async () => {
    const next: ThemePreference = document.documentElement.classList.contains('dark')
      ? 'light'
      : 'dark';
    await setTheme(next);
  }, [setTheme]);

  const resolved: ThemePreference =
    !loading && user ? user.themePreference ?? 'light' : guestTheme;

  const value = useMemo(
    () => ({
      resolved,
      setTheme,
      toggleTheme,
    }),
    [resolved, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
