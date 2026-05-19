import { memo, useEffect, useState } from 'react';
import { clsx } from 'clsx';

type HeroBackgroundVideoProps = {
  src: string;
  className?: string;
};

/** Full-bleed muted hero video. Kept minimal so layout updates never restart playback. */
function HeroBackgroundVideoInner({ src, className }: HeroBackgroundVideoProps) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setHidden(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (hidden) return;
    const resume = () => {
      const el = document.querySelector<HTMLVideoElement>('[data-hero-bg-video]');
      if (el?.paused && !document.hidden) void el.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', resume);
    return () => document.removeEventListener('visibilitychange', resume);
  }, [hidden, src]);

  if (hidden) return null;

  return (
    <video
      data-hero-bg-video
      className={clsx('pointer-events-none', className)}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden
    />
  );
}

export const HeroBackgroundVideo = memo(HeroBackgroundVideoInner);
