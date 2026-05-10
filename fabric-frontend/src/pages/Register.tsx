import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { registerApi } from '../api/authService';
import type { UserRole } from '../types';
import LanguageSelect from '../components/LanguageSelect';
import { getLanguageLabel } from '../utils/languages';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { normalizeLocale } from '../i18n/registry';

const ROLES: { value: UserRole; labelKey: string }[] = [
  { value: 'consumer', labelKey: 'auth.roleConsumer' },
  { value: 'manufacturer', labelKey: 'auth.roleManufacturer' },
  { value: 'distributor', labelKey: 'auth.roleDistributor' },
  { value: 'retailer', labelKey: 'auth.roleRetailer' },
  { value: 'admin', labelKey: 'auth.roleAdmin' },
];

export default function Register() {
  const { user, loginWithSession } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('consumer');
  const [allergies, setAllergies] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState(() =>
    typeof localStorage !== 'undefined'
      ? normalizeLocale(localStorage.getItem('preferredLanguage'))
      : 'en'
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to="/home" replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await registerApi({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        allergies: allergies.trim() || undefined,
        dietaryPreference: dietaryPreference.trim() || undefined,
        preferredLanguage: preferredLanguage.trim() || 'en',
      });
      if (!res.success || !res.token || !res.user) {
        setError(res.message || 'Registration failed');
        return;
      }
      loginWithSession(res.token, res.user);
      navigate('/home', {
        replace: true,
        state: {
          flashSuccess: t('auth.flashRegister', { name: res.user.name }),
        },
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')}>
      <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-slate-900 mb-2">{t('auth.createHeading')}</h1>
              <p className="text-slate-600">{t('auth.createIntro')}</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">
                  {t('auth.accountSection')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    label={t('profile.fullName')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder={t('profile.fullNamePh')}
                  />

                  <TextField
                    label={t('auth.email')}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t('auth.emailPh')}
                  />
                </div>

                <TextField
                  label={t('auth.passwordMin')}
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  placeholder={t('auth.passwordCreatePh')}
                  helperText={t('auth.passwordHelper')}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">{t('auth.regRole')}</label>
                  <select
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {t(r.labelKey)}
                      </option>
                    ))}
                  </select>
                  <Alert type="warning" className="mt-2">
                    {t('auth.roleWarning')}
                  </Alert>
                </div>
              </div>

              <div className="space-y-6 border-t border-slate-200 pt-6">
                <h3 className="text-lg font-medium text-slate-900">
                  {t('auth.regPreferences')}{' '}
                  <span className="text-sm font-normal text-slate-500">{t('auth.optionalTag')}</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    label={t('auth.regAllergies')}
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder={t('profile.allergiesPh')}
                  />

                  <TextField
                    label={t('auth.regDietary')}
                    value={dietaryPreference}
                    onChange={(e) => setDietaryPreference(e.target.value)}
                    placeholder={t('profile.dietaryPh')}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">{t('auth.regPreferredLang')}</label>
                  <LanguageSelect
                    value={preferredLanguage}
                    onChange={setPreferredLanguage}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {t('auth.regLanguageHint', {
                      label: getLanguageLabel(preferredLanguage),
                      code: preferredLanguage,
                    })}
                  </p>
                </div>
              </div>

              {error && <Alert type="error">{error}</Alert>}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={busy}
                loadingText={t('auth.registering')}
                className="w-full"
              >
                {t('auth.registerSubmit')}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600">
                {t('auth.haveAccount')}{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  {t('auth.signInHere')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
