import { useEffect, useState } from 'react';

/**
 * Normalized vertical scroll progress in [0, 1].
 * RAF-throttled read for smooth coupling with gradients and motion layers.
 */
export function useDocumentScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const read = () => {
      ticking = false;
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      setProgress(Math.min(1, Math.max(0, window.scrollY / max)));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(read);
    };

    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', read, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', read);
    };
  }, []);

  return progress;
}
