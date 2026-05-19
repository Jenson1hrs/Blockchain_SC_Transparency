import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { HeroBackgroundVideo } from './HeroBackgroundVideo';
import { ScrollReveal } from './ScrollReveal';

const HERO_VIDEO_SRC = '/Background_video/BackgroundVideo_LandingPage.mp4';

/** Video + scrim only — no scroll props, so playback is not interrupted by hero parallax updates. */
const LandingHeroVideoLayer = memo(function LandingHeroVideoLayer() {
  return (
    <>
      <HeroBackgroundVideo
        src={HERO_VIDEO_SRC}
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-slate-900/10 via-transparent to-transparent dark:bg-gradient-to-b dark:from-neutral-950/92 dark:via-neutral-950/78 dark:to-neutral-950/94"
        aria-hidden
      />
    </>
  );
});

type LandingHeroSectionProps = {
  heroFloatY: number;
  t: (key: string) => string;
  showRegisterCta: boolean;
};

function LandingHeroSectionInner({
  heroFloatY,
  t,
  showRegisterCta,
}: LandingHeroSectionProps) {
  return (
    <section className="relative z-[1] overflow-hidden bg-transparent">
      <LandingHeroVideoLayer />
      <div
        className="absolute top-16 right-10 w-96 h-96 bg-primary-400/25 rounded-full blur-3xl z-[2] motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
        style={{ transform: `translate3d(0, ${heroFloatY}px, 0)` }}
      />
      <div
        className="absolute bottom-0 left-1/4 w-72 h-72 bg-slate-200/15 dark:bg-primary-900/10 rounded-full blur-3xl z-[2] motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
        style={{ transform: `translate3d(0, ${heroFloatY * -0.55}px, 0)` }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_520px] items-center">
          <ScrollReveal className="text-center lg:text-left" delayMs={40}>
            <div className="mx-auto lg:mx-0 max-w-3xl space-y-8 rounded-2xl border border-slate-300/90 bg-white/75 px-6 py-8 shadow-xl shadow-slate-900/12 ring-1 ring-white/80 backdrop-blur-xl dark:border-neutral-600/50 dark:bg-neutral-900/85 dark:shadow-lg dark:shadow-black/40 dark:ring-white/10 sm:px-8 sm:py-10">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 dark:text-neutral-100 tracking-tight leading-tight">
                  {t('landing.heroLine1')}
                  <span className="block bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                    {t('landing.heroLine2')}
                  </span>
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-slate-700 dark:text-neutral-200 leading-8">
                  {t('landing.heroSub')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-start gap-4 items-center lg:items-start">
                <Button
                  as={Link}
                  to="/verify"
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold shadow-xl"
                >
                  {t('landing.ctaVerify')}
                </Button>
              {showRegisterCta && (
                <Button
                  as={Link}
                  to="/register"
                  variant="secondary"
                  size="lg"
                  className="px-8 py-4 text-lg"
                >
                  {t('landing.ctaAccount')}
                </Button>
              )}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal className="relative" delayMs={120} staggerMs={0}>
            <div
              className="absolute -top-10 left-4 w-20 h-20 rounded-full bg-primary-200/40 motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out"
              style={{ transform: `translate3d(0, ${heroFloatY * 0.35}px, 0)` }}
            />
            <div className="relative rounded-[2rem] border border-slate-300/80 bg-slate-100/70 p-8 shadow-2xl shadow-slate-900/10 ring-1 ring-white/60 backdrop-blur-lg dark:border-neutral-600 dark:bg-neutral-800/95 dark:ring-white/5 motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-[0_25px_80px_-12px_rgba(37,99,235,0.28)] dark:hover:shadow-[0_28px_90px_-16px_rgba(0,0,0,0.55)]">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 text-center shadow-md shadow-slate-900/5 dark:border-neutral-700 dark:bg-neutral-800/80 dark:shadow-sm">
                  <div className="text-5xl mb-4">📱</div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-2">{t('landing.cardScanTitle')}</h3>
                  <p className="text-sm text-slate-600 dark:text-neutral-200">{t('landing.cardScanSub')}</p>
                </div>
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 text-center shadow-md shadow-slate-900/5 dark:border-neutral-700 dark:bg-neutral-800/80 dark:shadow-sm">
                  <div className="text-5xl mb-4">🔗</div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-2">{t('landing.cardTraceTitle')}</h3>
                  <p className="text-sm text-slate-600 dark:text-neutral-200">{t('landing.cardTraceSub')}</p>
                </div>
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 text-center shadow-md shadow-slate-900/5 dark:border-neutral-700 dark:bg-neutral-800/80 dark:shadow-sm">
                  <div className="text-5xl mb-4">⏰</div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-2">{t('landing.cardExpiryTitle')}</h3>
                  <p className="text-sm text-slate-600 dark:text-neutral-200">{t('landing.cardExpirySub')}</p>
                </div>
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 text-center shadow-md shadow-slate-900/5 dark:border-neutral-700 dark:bg-neutral-800/80 dark:shadow-sm">
                  <div className="text-5xl mb-4">📦</div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-2">{t('landing.cardInventoryTitle')}</h3>
                  <p className="text-sm text-slate-600 dark:text-neutral-200">{t('landing.cardInventorySub')}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

export const LandingHeroSection = memo(LandingHeroSectionInner);
