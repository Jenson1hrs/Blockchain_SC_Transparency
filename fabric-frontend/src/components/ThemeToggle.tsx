import { useI18n } from '../context/I18nContext';
import { useTheme } from '../context/ThemeContext';

type Props = {
  className?: string;
  /** Smaller hit target on dense nav bars */
  compact?: boolean;
};

export function ThemeToggle({ className = '', compact }: Props) {
  const { t } = useI18n();
  const { resolved, toggleTheme } = useTheme();
  const isDark = resolved === 'dark';

  return (
    <button
      type="button"
      onClick={() => void toggleTheme()}
      className={`inline-flex items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-700 shadow-sm motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out hover:bg-neutral-50 hover:shadow-md hover:border-primary-300 hover:-translate-y-0.5 active:translate-y-0 dark:border-neutral-600 dark:bg-neutral-800 dark:text-amber-200 dark:hover:bg-neutral-700 dark:hover:border-amber-500/40 dark:hover:shadow-black/35 ${
        compact ? 'h-9 w-9 p-0 text-lg' : 'px-3 py-2 text-sm gap-2'
      } ${className}`}
      title={isDark ? t('shell.themeUseLight') : t('shell.themeUseDark')}
      aria-label={isDark ? t('shell.themeUseLight') : t('shell.themeUseDark')}
    >
      <span aria-hidden>{isDark ? '☀️' : '🌙'}</span>
      {!compact && <span>{isDark ? t('shell.themeLight') : t('shell.themeDark')}</span>}
    </button>
  );
}
