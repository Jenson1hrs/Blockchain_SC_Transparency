type Props = {
  /** Document scroll progress in [0, 1] */
  progress: number;
};

/**
 * Full-viewport, fixed gradient orbs tied to scroll. Sits beneath page content (`z-index` 0).
 * Pairs best with translucent section sheets on the landing page.
 */
export function LandingScrollAmbient({ progress }: Props) {
  const p = Math.min(1, Math.max(0, progress));
  const wave = Math.sin(p * Math.PI);

  const primaryBlob = {
    transform: `translate3d(${wave * -5 + p * 2}%, ${-8 + p * 28}vh, 0) scale(${1.05 + wave * 0.12})`,
    opacity: 0.52 + wave * 0.22,
  };

  const accentBlob = {
    transform: `translate3d(${8 - p * 6 + wave * 4}%, ${10 + p * 18}vh, 0) scale(${1.1 + p * 0.08})`,
    opacity: 0.42 + p * 0.2,
  };

  const iris = {
    transform: `translate3d(${-wave * 3}%, ${p * 12}vh, 0)`,
    opacity: 0.18 + p * 0.55,
  };

  const transition = 'transform 620ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 780ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden motion-reduce:hidden"
    >
      <div
        className="absolute inset-0 bg-gradient-to-b from-slate-200/50 via-slate-100/35 to-primary-100/40 dark:from-neutral-950 dark:via-neutral-950 dark:to-primary-950/45 opacity-70 dark:opacity-100 motion-safe:transition-[background-position] motion-safe:duration-700 motion-safe:ease-out"
        style={{
          backgroundPosition: `50% ${p * 22}%`,
        }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_85%_70%_at_50%_35%,transparent_20%,rgba(15,23,42,0.06)_100%)] dark:bg-[radial-gradient(ellipse_90%_75%_at_50%_40%,transparent_15%,rgba(0,0,0,0.35)_100%)] mix-blend-multiply dark:mix-blend-soft-light transition-opacity motion-safe:duration-700"
        style={{ opacity: 0.55 + p * 0.25 }}
      />

      <div
        className="absolute -left-[18%] top-[-12%] h-[78vh] w-[78vw] rounded-full bg-gradient-to-br from-primary-400/45 via-sky-300/25 to-transparent blur-3xl dark:from-primary-500/25 dark:via-sky-500/12 dark:to-transparent will-change-transform"
        style={{ ...primaryBlob, transition }}
      />
      <div
        className="absolute -right-[12%] top-[18%] h-[72vh] w-[70vw] rounded-full bg-gradient-to-bl from-violet-400/40 via-fuchsia-300/20 to-transparent blur-3xl dark:from-violet-600/22 dark:via-fuchsia-600/10 dark:to-transparent will-change-transform"
        style={{ ...accentBlob, transition }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-t from-primary-200/25 via-transparent to-indigo-200/20 dark:from-primary-900/40 dark:via-transparent dark:to-indigo-900/30 blur-3xl will-change-transform"
        style={{ ...iris, transition }}
      />
    </div>
  );
}
