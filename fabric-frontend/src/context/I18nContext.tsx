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
import { buildLocaleTable, normalizeLocale, translateString } from '../i18n/registry';
import { applyFontScale, getStoredFontScale } from '../utils/uiFontScale';

const PREF_LANG_KEY = 'preferredLanguage';

type I18nContextValue = {
  locale: string;
  t: (key: string, vars?: Record<string, string | number>) => string;
  /** For guests on the marketing page: switch UI language before login. */
  setGuestLanguage: (code: string) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [guestLocale, setGuestLocale] = useState(() =>
    normalizeLocale(
      typeof localStorage !== 'undefined' ? localStorage.getItem(PREF_LANG_KEY) : null
    )
  );

  useEffect(() => {
    applyFontScale(getStoredFontScale());
  }, []);

  useEffect(() => {
    if (!user) {
      setGuestLocale(normalizeLocale(localStorage.getItem(PREF_LANG_KEY)));
    }
  }, [user]);

  useEffect(() => {
    const onStorage = () => {
      if (!user) {
        setGuestLocale(normalizeLocale(localStorage.getItem(PREF_LANG_KEY)));
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [user]);

  const locale = useMemo(() => {
    if (user?.preferredLanguage) {
      return normalizeLocale(user.preferredLanguage);
    }
    return guestLocale;
  }, [user?.preferredLanguage, guestLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale]);

  useEffect(() => {
    if (user?.preferredLanguage) {
      try {
        localStorage.setItem(PREF_LANG_KEY, normalizeLocale(user.preferredLanguage));
      } catch {
        /* ignore */
      }
    }
  }, [user?.preferredLanguage]);

  const table = useMemo(() => buildLocaleTable(locale), [locale]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translateString(table, key, vars),
    [table]
  );

  const setGuestLanguage = useCallback((code: string) => {
    const n = normalizeLocale(code);
    try {
      localStorage.setItem(PREF_LANG_KEY, n);
    } catch {
      /* ignore */
    }
    setGuestLocale(n);
  }, []);

  const value = useMemo(
    () => ({ locale, t, setGuestLanguage }),
    [locale, t, setGuestLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
