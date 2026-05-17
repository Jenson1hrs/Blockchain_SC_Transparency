import { clsx } from 'clsx';
import { LIKERT_SCALE_LABELS, type LikertValue } from '../constants/likertQuestions';

type LikertScaleProps = {
  name: string;
  value: LikertValue | null;
  onChange: (value: LikertValue) => void;
  disabled?: boolean;
};

export function LikertScale({ name, value, onChange, disabled }: LikertScaleProps) {
  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="sr-only">{name} response scale</legend>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {LIKERT_SCALE_LABELS.map((label, index) => {
          const scaleValue = (index + 1) as LikertValue;
          const selected = value === scaleValue;
          return (
            <label
              key={label}
              className={clsx(
                'flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-[11px] font-medium leading-tight transition-all duration-200 sm:text-xs',
                selected
                  ? 'border-primary-500 bg-primary-50 text-primary-800 shadow-sm dark:border-primary-400 dark:bg-primary-950/50 dark:text-primary-100'
                  : 'border-neutral-200 bg-white/80 text-page-muted hover:border-primary-300 hover:bg-primary-50/50 dark:border-neutral-600 dark:bg-neutral-800/80 dark:hover:border-primary-600',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              <input
                type="radio"
                name={name}
                value={scaleValue}
                checked={selected}
                onChange={() => onChange(scaleValue)}
                className="sr-only"
              />
              <span
                className={clsx(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                  selected
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-200',
                )}
              >
                {scaleValue}
              </span>
              <span>{label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
