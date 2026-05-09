export type LanguageOption = {
  label: string;
  code: string;
};

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { label: 'English', code: 'en' },
  { label: 'Bahasa Melayu', code: 'ms' },
  { label: 'Chinese', code: 'zh' },
  { label: 'Tamil', code: 'ta' },
  { label: 'Arabic', code: 'ar' },
  { label: 'Japanese', code: 'ja' },
  { label: 'Korean', code: 'ko' },
  { label: 'Indonesian', code: 'id' },
  { label: 'Thai', code: 'th' },
  { label: 'Vietnamese', code: 'vi' },
];

export function getLanguageLabel(code?: string | null): string {
  if (!code) return 'English';
  return LANGUAGE_OPTIONS.find((item) => item.code === code)?.label ?? code;
}

export function parseLanguageInput(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  const byCode = LANGUAGE_OPTIONS.find((item) => item.code === v.toLowerCase());
  if (byCode) return byCode.code;
  const byLabel = LANGUAGE_OPTIONS.find((item) => item.label.toLowerCase() === v.toLowerCase());
  if (byLabel) return byLabel.code;
  const m = v.match(/\(([a-z]{2})\)$/i);
  if (m) {
    const code = m[1].toLowerCase();
    if (LANGUAGE_OPTIONS.some((item) => item.code === code)) return code;
  }
  return null;
}
