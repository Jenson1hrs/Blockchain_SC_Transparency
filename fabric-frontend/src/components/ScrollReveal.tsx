import { clsx } from 'clsx';
import { type ReactNode, useEffect, useRef, useState } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  /** Base delay once the element crosses the viewport (ms) */
  delayMs?: number;
  /** Per-item stagger multiplier (typically item index × staggerMs) */
  staggerIndex?: number;
  staggerMs?: number;
};

/**
 * Fade + lift + slight scale when scrolled into view (one-shot).
 * Respects `prefers-reduced-motion`.
 */
export function ScrollReveal({
  children,
  className,
  delayMs = 0,
  staggerIndex = 0,
  staggerMs = 65,
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
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-8 scale-[0.97] motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100',
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
