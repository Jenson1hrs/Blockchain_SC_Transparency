import { useEffect, useMemo, useState } from 'react';
import { LANGUAGE_OPTIONS, getLanguageLabel, parseLanguageInput } from '../utils/languages';

interface LanguageSelectProps {
  value: string;
  onChange: (code: string) => void;
  id?: string;
  className?: string;
}

const LIST_ID = 'language-option-list';

export default function LanguageSelect({ value, onChange, id, className }: LanguageSelectProps) {
  const normalized = value || 'en';
  const [text, setText] = useState('');

  const options = useMemo(
    () => LANGUAGE_OPTIONS.map((item) => `${item.label} (${item.code})`),
    []
  );

  useEffect(() => {
    setText(`${getLanguageLabel(normalized)} (${normalized})`);
  }, [normalized]);

  return (
    <>
      <input
        id={id}
        list={LIST_ID}
        value={text}
        onChange={(e) => {
          const next = e.target.value;
          setText(next);
          const parsed = parseLanguageInput(next);
          if (parsed) onChange(parsed);
        }}
        onBlur={() => {
          const parsed = parseLanguageInput(text);
          if (parsed) {
            onChange(parsed);
            setText(`${getLanguageLabel(parsed)} (${parsed})`);
          } else {
            setText(`${getLanguageLabel(normalized)} (${normalized})`);
          }
        }}
        placeholder="Select language"
        className={className}
      />
      <datalist id={LIST_ID}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </>
  );
}
