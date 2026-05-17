import { useState, useEffect, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { loginApi } from '../api/authService';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { resolvePostLoginPath } from '../utils/routeAccess';

export default function Login() {
  const { user, loginWithSession } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const locState = location.state as {
    from?: string;
    flashSuccess?: string;
    registeredEmail?: string;
  } | null;
  const from = locState?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const hint = locState?.registeredEmail;
    if (hint) setEmail(hint);
  }, [locState?.registeredEmail]);

  if (user) {
    return <Navigate to="/home" replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await loginApi(email.trim(), password);
      if (!res.success || !res.token || !res.user) {
        setError(res.message || 'Login failed');
        return;
      }
      loginWithSession(res.token, res.user);
      const destination = resolvePostLoginPath(from, res.user.role);
      navigate(destination, {
        replace: true,
        state: {
          flashSuccess: t('auth.flashLogin', { name: res.user.name }),
        },
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title={t('auth.signInTitle')} subtitle={t('auth.signInSubtitle')}>
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-600 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-neutral-100 mb-2">{t('auth.welcomeBack')}</h1>
              <p className="text-slate-600 dark:text-neutral-200">{t('auth.signInContinue')}</p>
            </div>

            {locState?.flashSuccess && (
              <div className="mb-6">
                <Alert type="success">{locState.flashSuccess}</Alert>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-6">
              <TextField
                label={t('auth.email')}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('auth.emailPh')}
              />

              <TextField
                label={t('auth.password')}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t('auth.passwordPh')}
              />

              {error && <Alert type="error">{error}</Alert>}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={busy}
                loadingText={t('auth.submitting')}
                className="w-full"
              >
                {t('auth.submit')}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600 dark:text-neutral-200">
                {t('auth.needAccount')}{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors"
                >
                  {t('auth.createAccountLink')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
