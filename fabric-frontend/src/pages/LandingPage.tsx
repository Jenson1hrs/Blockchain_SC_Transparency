import { Link, Navigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { Button, Alert } from '../components';
import { ThemeToggle } from '../components/ThemeToggle';
import LanguageSelect from '../components/LanguageSelect';
import { LandingScrollAmbient } from '../components/LandingScrollAmbient';
import { ScrollReveal } from '../components/ScrollReveal';
import { useDocumentScrollProgress } from '../hooks/useDocumentScrollProgress';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const { t, locale, setGuestLanguage } = useI18n();
  const location = useLocation();
  const scrollProgress = useDocumentScrollProgress();

  /** Subtle ambient motion for decorative hero blurs when scroll-linked updates */
  const heroFloatY = scrollProgress * 52;

  const steps = useMemo(
    () => [
      { number: 1, title: t('landing.step1t'), description: t('landing.step1d'), icon: 'source' },
      { number: 2, title: t('landing.step2t'), description: t('landing.step2d'), icon: 'tag' },
      { number: 3, title: t('landing.step3t'), description: t('landing.step3d'), icon: 'scan' },
      { number: 4, title: t('landing.step4t'), description: t('landing.step4d'), icon: 'verify' },
      { number: 5, title: t('landing.step5t'), description: t('landing.step5d'), icon: 'insight' },
    ],
    [t, locale]
  );

  const roles = useMemo(
    () => [
      {
        title: t('landing.roleManu'),
        description: t('landing.roleManuD'),
        icon: '🏭',
        color: 'from-blue-500 to-blue-600',
      },
      {
        title: t('landing.roleDist'),
        description: t('landing.roleDistD'),
        icon: '🚚',
        color: 'from-green-500 to-green-600',
      },
      {
        title: t('landing.roleCons'),
        description: t('landing.roleConsD'),
        icon: '👤',
        color: 'from-purple-500 to-purple-600',
      },
    ],
    [t, locale]
  );

  const features = useMemo(
    () => [
      { icon: '🔒', title: t('landing.feat1t'), text: t('landing.feat1x') },
      { icon: '📱', title: t('landing.feat2t'), text: t('landing.feat2x') },
      { icon: '⏰', title: t('landing.feat3t'), text: t('landing.feat3x') },
      { icon: '📦', title: t('landing.feat4t'), text: t('landing.feat4x') },
      { icon: '🔄', title: t('landing.feat5t'), text: t('landing.feat5x') },
      { icon: '⚡', title: t('landing.feat6t'), text: t('landing.feat6x') },
    ],
    [t, locale]
  );

  const showcases = useMemo(
    () => [
      {
        title: t('landing.show1t'),
        description: t('landing.show1d'),
        image: '📱',
        features: [
          t('landing.show1f1'),
          t('landing.show1f2'),
          t('landing.show1f3'),
          t('landing.show1f4'),
        ],
      },
      {
        title: t('landing.show2t'),
        description: t('landing.show2d'),
        image: '⏰',
        features: [
          t('landing.show2f1'),
          t('landing.show2f2'),
          t('landing.show2f3'),
          t('landing.show2f4'),
        ],
      },
      {
        title: t('landing.show3t'),
        description: t('landing.show3d'),
        image: '📦',
        features: [
          t('landing.show3f1'),
          t('landing.show3f2'),
          t('landing.show3f3'),
          t('landing.show3f4'),
        ],
      },
    ],
    [t, locale]
  );
  const flashSuccess = (location.state as { flashSuccess?: string } | null)
    ?.flashSuccess;

  const renderStepIcon = (icon: string) => {
    const cls = 'h-6 w-6';
    switch (icon) {
      case 'source':
        return (
          <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M3 7.5 12 3l9 4.5-9 4.5L3 7.5Z" />
            <path d="M7 10.5v5.5l5 2.5 5-2.5v-5.5" />
          </svg>
        );
      case 'tag':
        return (
          <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M20 13 11 22l-9-9V4h9l9 9Z" />
            <circle cx="7.5" cy="8.5" r="1.2" />
          </svg>
        );
      case 'scan':
        return (
          <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3" />
            <path d="M8 12h8M6.5 9.5h11M6.5 14.5h11" />
          </svg>
        );
      case 'verify':
        return (
          <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M12 3 5 6v6c0 4.5 3.2 7.7 7 9 3.8-1.3 7-4.5 7-9V6l-7-3Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M4 19h16M7 15l3-3 2 2 5-5" />
            <circle cx="7" cy="15" r="1.2" />
            <circle cx="10" cy="12" r="1.2" />
            <circle cx="12" cy="14" r="1.2" />
            <circle cx="17" cy="9" r="1.2" />
          </svg>
        );
    }
  };

  if (!loading && user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="relative isolate min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/90 to-sky-50/85 dark:from-[#070b12] dark:via-[#0a101c] dark:to-[#0c1324]">
      <LandingScrollAmbient progress={scrollProgress} />

      <div className="relative z-[1] transition-colors duration-500">
      {/* Navigation */}
      <nav
        className={clsx(
          'bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-primary-200/40 dark:border-neutral-700/80 sticky top-0 z-50 motion-safe:transition-[box-shadow,backdrop-filter,border-color] motion-safe:duration-500 motion-safe:ease-out',
          scrollProgress > 0.035
            ? 'shadow-xl shadow-slate-900/[0.08] dark:shadow-black/45 border-slate-200/90 dark:border-neutral-700/90'
            : 'shadow-sm'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg text-white font-semibold">
                BC
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900 dark:text-neutral-100">{t('landing.brand')}</p>
                <p className="text-xs text-slate-500 dark:text-neutral-300">{t('landing.tagline')}</p>
              </div>
            </Link>
            <div className="flex items-center gap-3 flex-wrap justify-end">
              <ThemeToggle compact />
              {!loading && !user && (
                <>
                  <div className="flex items-center gap-2">
                    <label htmlFor="landing-lang" className="text-xs text-slate-500 sr-only">
                      {t('landing.langLabel')}
                    </label>
                    <LanguageSelect
                      id="landing-lang"
                      value={locale}
                      onChange={setGuestLanguage}
                      className="rounded-lg border border-slate-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-2 py-1.5 text-xs text-slate-700 dark:text-neutral-200 shadow-sm max-w-[200px]"
                    />
                  </div>
                  <Button
                    as={Link}
                    to="/login"
                    variant="ghost"
                    size="sm"
                    className="min-w-[110px]"
                  >
                    {t('landing.signIn')}
                  </Button>
                  <Button
                    as={Link}
                    to="/register"
                    variant="primary"
                    size="sm"
                    className="min-w-[140px]"
                  >
                    {t('landing.getStarted')}
                  </Button>
                </>
              )}
              {!loading && user && (
                <div className="rounded-full border border-slate-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-4 py-2 text-sm text-slate-700 dark:text-neutral-200 shadow-sm">
                  {t('landing.welcomeUser', { name: user.name })}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-[1] overflow-hidden bg-section-primary">
        <div className="decoration-grid" />
        <div
          className="absolute top-16 right-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl -z-10 motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{ transform: `translate3d(0, ${heroFloatY}px, 0)` }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-72 h-72 bg-slate-200/20 dark:bg-primary-900/15 rounded-full blur-3xl -z-10 motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
          style={{ transform: `translate3d(0, ${heroFloatY * -0.55}px, 0)` }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
          <div className="grid gap-12 lg:grid-cols-[1fr_520px] items-center">
            <ScrollReveal className="space-y-8 text-center lg:text-left" delayMs={40}>
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 dark:text-neutral-100 tracking-tight leading-tight">
                  {t('landing.heroLine1')}
                  <span className="block bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                    {t('landing.heroLine2')}
                  </span>
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-neutral-200 max-w-3xl mx-auto lg:mx-0 leading-8">
                  {t('landing.heroSub')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-start gap-4 items-center">
                <Button
                  as={Link}
                  to="/verify"
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold shadow-xl"
                >
                  {t('landing.ctaVerify')}
                </Button>
                {!loading && !user && (
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
            </ScrollReveal>

            <ScrollReveal className="relative" delayMs={120} staggerMs={0}>
              <div
                className="absolute -top-10 left-4 w-20 h-20 rounded-full bg-primary-200/40 motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out"
                style={{ transform: `translate3d(0, ${heroFloatY * 0.35}px, 0)` }}
              />
              <div className="relative rounded-[2rem] border border-slate-200 dark:border-neutral-600 bg-white/95 dark:bg-neutral-800/95 shadow-2xl p-8 backdrop-blur-sm motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-[cubic-bezier(0.23,1,0.32,1)] hover:shadow-[0_25px_80px_-12px_rgba(37,99,235,0.28)] dark:hover:shadow-[0_28px_90px_-16px_rgba(0,0,0,0.55)]">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/80 p-6 text-center shadow-sm">
                    <div className="text-5xl mb-4">📱</div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-2">{t('landing.cardScanTitle')}</h3>
                    <p className="text-sm text-slate-600 dark:text-neutral-200">{t('landing.cardScanSub')}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/80 p-6 text-center shadow-sm">
                    <div className="text-5xl mb-4">🔗</div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-2">{t('landing.cardTraceTitle')}</h3>
                    <p className="text-sm text-slate-600 dark:text-neutral-200">{t('landing.cardTraceSub')}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800/80 p-6 text-center shadow-sm">
                    <div className="text-5xl mb-4">⏰</div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-2">{t('landing.cardExpiryTitle')}</h3>
                    <p className="text-sm text-slate-600 dark:text-neutral-200">{t('landing.cardExpirySub')}</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Success Message */}
      {flashSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ScrollReveal>
            <Alert type="success">{flashSuccess}</Alert>
          </ScrollReveal>
        </div>
      )}

      {/* Features Section */}
      <section className="relative z-[1] py-24 landing-section-sheet overflow-hidden">
        <div
          className="absolute top-0 left-1/3 w-96 h-96 bg-primary-200/15 dark:bg-primary-500/10 rounded-full blur-3xl -z-10 motion-safe:transition-transform motion-safe:duration-[900ms] motion-safe:ease-out"
          style={{ transform: `translate3d(${scrollProgress * -2}%, ${scrollProgress * 24}px, 0)` }}
        />
        <div
          className="absolute bottom-10 right-1/4 w-80 h-80 bg-slate-200/10 dark:bg-violet-600/10 rounded-full blur-3xl -z-10 motion-safe:transition-transform motion-safe:duration-[900ms] motion-safe:ease-out"
          style={{ transform: `translate3d(${scrollProgress * 3}%, ${scrollProgress * -18}px, 0)` }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-neutral-100 mb-4">{t('landing.featuresHeading')}</h2>
            <p className="text-xl text-slate-600 dark:text-neutral-200 max-w-3xl mx-auto leading-relaxed">{t('landing.featuresSub')}</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <ScrollReveal key={`feat-${index}-${feature.title}`} staggerIndex={index}>
                <div className="group bg-white/95 dark:bg-neutral-800 rounded-3xl border border-slate-200 dark:border-neutral-600 p-8 shadow-soft motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-600/70 hover:-translate-y-2 hover:shadow-primary-600/15 dark:hover:shadow-black/40">
                  <div className="text-4xl mb-4 motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-105">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-neutral-100 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-neutral-200 leading-relaxed">{feature.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section className="relative z-[1] py-24 landing-section-sheet overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-50/35 dark:via-primary-950/25 to-transparent -z-10 motion-safe:transition-opacity motion-safe:duration-700"
          style={{ opacity: 0.75 + scrollProgress * 0.25 }}
        />
        <div className="absolute left-1/2 top-12 h-64 w-64 -translate-x-1/2 rounded-full bg-primary-300/15 blur-3xl dark:bg-primary-700/20 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-neutral-100 mb-4">{t('landing.howHeading')}</h2>
            <p className="text-xl text-slate-600 dark:text-neutral-200">{t('landing.howSub')}</p>
          </ScrollReveal>

          <div className="relative max-w-5xl mx-auto">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-primary-300/0 via-primary-400/60 to-primary-300/0 dark:via-primary-600/70" />
            <div className="space-y-6">
              {steps.map((step, index) => (
                <ScrollReveal
                  key={step.number}
                  className={clsx(
                    'relative md:grid md:grid-cols-[1fr_auto_1fr] md:items-stretch',
                    index % 2 === 0 ? '' : ''
                  )}
                  staggerIndex={index}
                  staggerMs={90}
                >
                  <div className={clsx('hidden md:block', index % 2 === 0 ? 'md:col-start-1' : 'md:col-start-3')} />
                  <div className="absolute left-6 md:left-1/2 top-9 -translate-x-1/2 z-20">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl border border-primary-200/80 dark:border-primary-700 bg-white dark:bg-neutral-900 shadow-lg shadow-primary-500/15">
                      <span className="text-xs font-bold text-primary-700 dark:text-primary-300">{step.number}</span>
                    </div>
                  </div>

                  <div
                    className={clsx(
                      'ml-16 md:ml-0 bg-white/95 dark:bg-neutral-800 rounded-2xl border border-slate-200/90 dark:border-neutral-600 p-6 md:p-7 shadow-sm',
                      'motion-safe:transition-all motion-safe:duration-500 hover:-translate-y-1 hover:shadow-2xl hover:border-primary-300/70 dark:hover:border-primary-500/60',
                      index % 2 === 0 ? 'md:col-start-1 md:mr-8' : 'md:col-start-3 md:ml-8'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white shadow-md shrink-0">
                        {renderStepIcon(step.icon)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-neutral-100 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-neutral-200 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="relative z-[1] py-24 landing-section-sheet overflow-hidden">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-200/15 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-neutral-100 mb-4">{t('landing.rolesHeading')}</h2>
            <p className="text-xl text-slate-600 dark:text-neutral-200">{t('landing.rolesSub')}</p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <ScrollReveal key={`role-${index}-${role.title}`} staggerIndex={index} staggerMs={100}>
                <div className="bg-white/95 dark:bg-neutral-800 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-600 p-8 text-center motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out hover:shadow-xl hover:border-primary-200/80 dark:hover:border-primary-600/65 hover:-translate-y-2 hover:shadow-primary-600/12 dark:hover:shadow-black/45">
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${role.color} text-white rounded-full text-3xl mb-6 shadow-lg motion-safe:transition-transform motion-safe:duration-300 hover:scale-105`}
                  >
                    {role.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-neutral-100 mb-4">
                    {role.title}
                  </h3>
                  <p className="text-slate-600 dark:text-neutral-200 leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="relative z-[1] py-24 landing-section-sheet overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-b from-primary-50/30 dark:from-primary-950/25 to-transparent -z-10 motion-safe:transition-[transform,opacity] motion-safe:duration-[900ms] motion-safe:ease-out"
          style={{
            transform: `translateY(${scrollProgress * -12}px)`,
            opacity: 0.65 + scrollProgress * 0.35,
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-neutral-100 mb-4">{t('landing.showHeading')}</h2>
            <p className="text-xl text-slate-600 dark:text-neutral-200">{t('landing.showSub')}</p>
          </ScrollReveal>

          <div className="space-y-24">
            {showcases.map((showcase, index) => (
              <ScrollReveal key={`show-${index}-${showcase.title}`} staggerIndex={index} staggerMs={120}>
                <div
                  className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 rounded-2xl border border-transparent p-4 -m-4 motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-primary-200/60 dark:hover:border-primary-600/45 hover:bg-white/70 dark:hover:bg-neutral-800/75 hover:shadow-xl hover:-translate-y-1`}
                >
                  <div className="flex-1 motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out hover:scale-[1.03]">
                    <div className="text-8xl mb-6 text-center lg:text-left select-none">{showcase.image}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-neutral-100 mb-4">
                      {showcase.title}
                    </h3>
                    <p className="text-lg text-slate-600 dark:text-neutral-200 mb-6 leading-relaxed">
                      {showcase.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {showcase.features.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />
                          <span className="text-slate-700 dark:text-neutral-200">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-[1] py-24 bg-gradient-to-r from-primary-600 to-primary-700 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.12] motion-safe:transition-transform motion-safe:duration-[1000ms] motion-safe:ease-out"
          style={{ transform: `translate3d(0, ${scrollProgress * 20}px, 0)` }}
        >
          <div className="absolute top-10 left-1/2 w-72 h-72 -translate-x-1/2 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-16 w-60 h-60 rounded-full bg-slate-200/30 blur-3xl" />
        </div>
        <ScrollReveal className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">{t('landing.ctaHeading')}</h2>
          <p className="text-xl sm:text-2xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('landing.ctaSub')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              as={Link}
              to="/register"
              size="lg"
              className="!bg-white !text-primary-700 !shadow-xl hover:!bg-primary-50 hover:!shadow-2xl hover:!shadow-primary-950/30 hover:!-translate-y-1.5 active:!translate-y-0 active:!shadow-lg px-8 py-4 text-lg font-semibold motion-safe:!transition-all motion-safe:!duration-300"
            >
              {t('landing.ctaFree')}
            </Button>
            <Button
              as={Link}
              to="/verify"
              size="lg"
              className="!bg-white/95 !text-primary-700 !border-2 !border-white !shadow-lg hover:!bg-white hover:!shadow-2xl hover:!shadow-primary-950/25 hover:!-translate-y-1.5 active:!translate-y-0 px-8 py-4 text-lg font-semibold motion-safe:!transition-all motion-safe:!duration-300"
            >
              {t('landing.ctaTry')}
            </Button>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="relative z-[1] bg-slate-950 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-950 to-transparent opacity-80 -z-10" />
        <div className="absolute top-8 right-8 w-48 h-48 rounded-full bg-primary-500/10 blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">BC</span>
                </div>
                <div>
                  <p className="text-lg font-semibold">{t('landing.brand')}</p>
                  <p className="text-sm text-slate-400">{t('landing.tagline')}</p>
                </div>
              </div>
              <p className="text-slate-400 mb-6 max-w-md leading-relaxed">{t('landing.footerBlurb')}</p>
              <div className="flex items-center gap-4 text-2xl">
                <div>🔒</div>
                <div>📱</div>
                <div>⏰</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-slate-100 mb-4">{t('landing.footerPlatform')}</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link
                    to="/verify"
                    className="hover:text-white transition-colors"
                  >
                    {t('landing.footerVerify')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/inventory"
                    className="hover:text-white transition-colors"
                  >
                    {t('landing.footerInventory')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/expiring"
                    className="hover:text-white transition-colors"
                  >
                    {t('landing.footerExpiry')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/create"
                    className="hover:text-white transition-colors"
                  >
                    {t('landing.footerCreate')}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-100 mb-4">{t('landing.footerCompany')}</h3>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <Link
                    to="/login"
                    className="hover:text-white transition-colors"
                  >
                    {t('landing.footerSignIn')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="hover:text-white transition-colors"
                  >
                    {t('landing.footerRegister')}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="hover:text-white transition-colors"
                  >
                    {t('landing.footerProfile')}
                  </Link>
                </li>
                <li className="text-slate-500">{t('landing.footerFyp')}</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500">
            <p>{t('landing.footerCopy')}</p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
