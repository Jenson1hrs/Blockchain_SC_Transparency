import { STRINGS_EN } from './strings.en';
import { STRINGS_MS } from './strings.ms';
import { STRINGS_ZH } from './strings.zh';
import { STRINGS_ID } from './strings.id';
import { STRINGS_JA } from './strings.ja';
import { STRINGS_KO } from './strings.ko';
import { STRINGS_TH } from './strings.th';
import { STRINGS_VI } from './strings.vi';
import { STRINGS_AR } from './strings.ar';
import { STRINGS_TA } from './strings.ta';
import { LANGUAGE_OPTIONS } from '../utils/languages';

const ALLOWED = new Set(LANGUAGE_OPTIONS.map((o) => o.code));

const LOCALE_OVERLAYS: Record<string, Record<string, string>> = {
  ms: STRINGS_MS,
  zh: STRINGS_ZH,
  id: STRINGS_ID,
  ja: STRINGS_JA,
  ko: STRINGS_KO,
  th: STRINGS_TH,
  vi: STRINGS_VI,
  ar: STRINGS_AR,
  ta: STRINGS_TA,
};

export function normalizeLocale(code: string | null | undefined): string {
  const raw = (code || 'en').toLowerCase().trim();
  const two = raw.slice(0, 2);
  return ALLOWED.has(two) ? two : 'en';
}

/** Merged string table for UI locale (English base + overrides). */
export function buildLocaleTable(locale: string): Record<string, string> {
  const code = normalizeLocale(locale);
  const base = { ...STRINGS_EN };
  const overlay = LOCALE_OVERLAYS[code];
  return overlay ? { ...base, ...overlay } : base;
}

export function translateString(
  table: Record<string, string>,
  key: string,
  vars?: Record<string, string | number>
): string {
  let s = table[key] ?? STRINGS_EN[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.split(`{{${k}}}`).join(String(v));
    }
  }
  return s;
}
