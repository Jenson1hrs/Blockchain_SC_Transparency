import { clsx } from 'clsx';
import { type ReactNode, useEffect, useRef, useState } from 'react';

type SlideFrom = 'up' | 'left' | 'right';

type Props = {
  children: ReactNode;
  className?: string;
  /** Base delay once the element crosses the viewport (ms) */
  delayMs?: number;
  /** Per-item stagger multiplier (typically item index × staggerMs) */
  staggerIndex?: number;
  staggerMs?: number;
  /** Entry direction when scrolled into view */
  from?: SlideFrom;
};

/**
 * Fade + lift + slight scale when scrolled into view (one-shot).
 * Respects `prefers-reduced-motion`.
 */
const hiddenTransform: Record<SlideFrom, string> = {
  up: 'translate-y-8 scale-[0.97]',
  left: '-translate-x-10 scale-[0.98]',
  right: 'translate-x-10 scale-[0.98]',
};

const visibleTransform = 'translate-x-0 translate-y-0 scale-100';

export function ScrollReveal({
  children,
  className,
  delayMs = 0,
  staggerIndex = 0,
  staggerMs = 65,
  from = 'up',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      setRevealed(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setRevealed(true);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const stagger = staggerIndex * staggerMs;
  const enterDelayMs = revealed ? Math.min(delayMs + stagger, 560) : 0;

  return (
    <div
      ref={ref}
      className={clsx(
        'motion-safe:will-change-[opacity,transform]',
        'motion-safe:transition-[opacity,transform]',
        'motion-safe:duration-[820ms]',
        'motion-safe:ease-[cubic-bezier(0.23,1,0.32,1)]',
        revealed
          ? clsx('opacity-100', visibleTransform)
          : clsx(
              'opacity-0',
              hiddenTransform[from],
              'motion-reduce:opacity-100 motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100',
            ),
        className
      )}
      style={{
        transitionDelay: `${enterDelayMs}ms`,
      }}
    >
      {children}
    </div>
  );
}
