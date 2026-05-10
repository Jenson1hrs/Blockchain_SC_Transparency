import { LANGUAGE_OPTIONS } from '../utils/languages';

interface LanguageSelectProps {
  value: string;
  onChange: (code: string) => void;
  id?: string;
  className?: string;
}

/** Native select so all languages are always visible (datalist is inconsistent). */
export default function LanguageSelect({ value, onChange, id, className }: LanguageSelectProps) {
  const raw = value && value.trim() !== '' ? value.trim() : 'en';
  const code = LANGUAGE_OPTIONS.some((o) => o.code === raw) ? raw : 'en';

  return (
    <select
      id={id}
      className={className}
      value={code}
      onChange={(e) => onChange(e.target.value)}
    >
      {LANGUAGE_OPTIONS.map((opt) => (
        <option key={opt.code} value={opt.code}>
          {opt.label} ({opt.code})
        </option>
      ))}
    </select>
  );
}
