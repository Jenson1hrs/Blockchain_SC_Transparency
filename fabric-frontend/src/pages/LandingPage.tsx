import { Link, Navigate, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { Button, Alert } from '../components';
import LanguageSelect from '../components/LanguageSelect';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const { t, locale, setGuestLanguage } = useI18n();
  const location = useLocation();

  const steps = useMemo(
    () => [
      { number: 1, title: t('landing.step1t'), description: t('landing.step1d'), icon: '🏭' },
      { number: 2, title: t('landing.step2t'), description: t('landing.step2d'), icon: '📱' },
      { number: 3, title: t('landing.step3t'), description: t('landing.step3d'), icon: '📷' },
      { number: 4, title: t('landing.step4t'), description: t('landing.step4d'), icon: '✅' },
      { number: 5, title: t('landing.step5t'), description: t('landing.step5d'), icon: '📊' },
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

  if (!loading && user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
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
                <p className="text-base font-semibold text-slate-900">{t('landing.brand')}</p>
                <p className="text-xs text-slate-500">{t('landing.tagline')}</p>
              </div>
            </Link>
            <div className="flex items-center gap-3 flex-wrap justify-end">
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
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 shadow-sm max-w-[200px]"
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
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm">
                  {t('landing.welcomeUser', { name: user.name })}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-section-primary">
        <div className="decoration-grid" />
        <div className="absolute top-16 right-10 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-slate-200/20 rounded-full blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative">
          <div className="grid gap-12 lg:grid-cols-[1fr_520px] items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 tracking-tight leading-tight">
                  {t('landing.heroLine1')}
                  <span className="block bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                    {t('landing.heroLine2')}
                  </span>
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto lg:mx-0 leading-8">
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
            </div>

            <div className="relative">
              <div className="absolute -top-10 left-4 w-20 h-20 rounded-full bg-primary-200/40 blur-3xl" />
              <div className="relative rounded-[2rem] border border-slate-200 bg-white/95 shadow-2xl p-8 backdrop-blur-sm">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
                    <div className="text-5xl mb-4">📱</div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('landing.cardScanTitle')}</h3>
                    <p className="text-sm text-slate-600">{t('landing.cardScanSub')}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
                    <div className="text-5xl mb-4">🔗</div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('landing.cardTraceTitle')}</h3>
                    <p className="text-sm text-slate-600">{t('landing.cardTraceSub')}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
                    <div className="text-5xl mb-4">⏰</div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('landing.cardExpiryTitle')}</h3>
                    <p className="text-sm text-slate-600">{t('landing.cardExpirySub')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Message */}
      {flashSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert type="success" className="animate-fade-up">
            {flashSuccess}
          </Alert>
        </div>
      )}

      {/* Features Section */}
      <section className="relative py-24 bg-section-secondary overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary-200/15 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-slate-200/10 rounded-full blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('landing.featuresHeading')}</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">{t('landing.featuresSub')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={`feat-${index}-${feature.title}`}
                className="group bg-white rounded-3xl border border-slate-200 p-8 shadow-soft hover:shadow-xl hover:border-primary-200 hover:-translate-y-1 transition-all duration-300 ease-out animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Timeline */}
      <section className="relative py-24 bg-section-light overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-50/30 to-transparent -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('landing.howHeading')}</h2>
            <p className="text-xl text-slate-600">{t('landing.howSub')}</p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-0.5 bg-gradient-to-r from-primary-200 via-primary-300 to-primary-200" />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-4">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className="relative text-center animate-fade-up"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  {/* Timeline dot */}
                  <div className="hidden lg:block absolute top-20 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary-500 rounded-full border-4 border-white shadow-lg z-10" />

                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full font-bold text-xl mb-4 shadow-lg">
                      {step.icon}
                    </div>
                    <div className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-600 rounded-full font-bold text-sm mb-4 -mt-12 ml-12">
                      {step.number}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section className="relative py-24 bg-section-accent overflow-hidden">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-200/15 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('landing.rolesHeading')}</h2>
            <p className="text-xl text-slate-600">{t('landing.rolesSub')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <div
                key={`role-${index}-${role.title}`}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-xl hover:border-primary-200 hover:-translate-y-1 transition-all duration-300 ease-out animate-fade-up text-center"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${role.color} text-white rounded-full text-3xl mb-6 shadow-lg`}
                >
                  {role.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-4">
                  {role.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {role.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="relative py-24 bg-section-light overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/30 to-transparent -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">{t('landing.showHeading')}</h2>
            <p className="text-xl text-slate-600">{t('landing.showSub')}</p>
          </div>

          <div className="space-y-24">
            {showcases.map((showcase, index) => (
              <div
                key={`show-${index}-${showcase.title}`}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 animate-fade-up rounded-2xl border border-transparent p-4 -m-4 hover:border-primary-200/60 hover:bg-white/60 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ease-out`}
                style={{ animationDelay: `${index * 300}ms` }}
              >
                <div className="flex-1">
                  <div className="text-8xl mb-6 text-center lg:text-left">
                    {showcase.image}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    {showcase.title}
                  </h3>
                  <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                    {showcase.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {showcase.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center space-x-2"
                      >
                        <div className="w-2 h-2 bg-primary-500 rounded-full" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-r from-primary-600 to-primary-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/2 w-72 h-72 -translate-x-1/2 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-16 w-60 h-60 rounded-full bg-slate-200/30 blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">{t('landing.ctaHeading')}</h2>
          <p className="text-xl sm:text-2xl text-primary-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('landing.ctaSub')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              as={Link}
              to="/register"
              size="lg"
              className="bg-white text-primary-600 hover:bg-slate-50 px-8 py-4 text-lg font-semibold shadow-xl"
            >
              {t('landing.ctaFree')}
            </Button>
            <Button
              as={Link}
              to="/verify"
              size="lg"
              className="bg-white text-primary-600 hover:bg-primary-50 border-2 border-white px-8 py-4 text-lg font-semibold shadow-lg"
            >
              {t('landing.ctaTry')}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-slate-950 text-white py-20 overflow-hidden">
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
  );
}
