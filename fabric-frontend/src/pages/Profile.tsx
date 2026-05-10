import { useEffect, useState, type FormEvent } from 'react';
import AppShell from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { updateMeApi } from '../api/authService';
import LanguageSelect from '../components/LanguageSelect';
import { getLanguageLabel } from '../utils/languages';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import type { FontScaleId } from '../utils/uiFontScale';
import { getStoredFontScale, setStoredFontScale } from '../utils/uiFontScale';

export default function Profile() {
  const { user, setCurrentUser } = useAuth();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [allergies, setAllergies] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [fontScale, setFontScale] = useState<FontScaleId>(() => getStoredFontScale());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setAllergies(user.allergies ?? '');
    setDietaryPreference(user.dietaryPreference ?? '');
    setPreferredLanguage(user.preferredLanguage || 'en');
  }, [user]);

  useEffect(() => {
    setFontScale(getStoredFontScale());
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSuccess('');
    if (!name.trim()) {
      setError(t('profile.nameRequired'));
      return;
    }
    setBusy(true);
    try {
      const res = await updateMeApi({
        name: name.trim(),
        allergies: allergies.trim() || '',
        dietaryPreference: dietaryPreference.trim() || '',
        preferredLanguage: preferredLanguage.trim() || 'en',
      });
      if (!res.success || !res.user) {
        setError(res.message || 'Failed to update profile');
        return;
      }
      setCurrentUser(res.user);
      try {
        localStorage.setItem('preferredLanguage', res.user.preferredLanguage || 'en');
      } catch {
        /* ignore */
      }
      setSuccess(t('profile.success'));
    } finally {
      setBusy(false);
    }
  };

  const onFontScaleChange = (next: FontScaleId) => {
    setFontScale(next);
    setStoredFontScale(next);
  };

  if (!user) return null;

  return (
    <AppShell title={t('profile.shellTitle')} subtitle={t('profile.shellSubtitle')}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900 mb-2">{t('profile.pageTitle')}</h1>
            <p className="text-slate-600">{t('profile.pageIntro')}</p>
          </div>

          <form className="space-y-8" onSubmit={submit}>
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-slate-900 border-b border-slate-200 pb-2">
                {t('profile.sectionAccount')}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  label={t('profile.fullName')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder={t('profile.fullNamePh')}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">{t('profile.email')}</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 cursor-not-allowed"
                    value={user.email}
                    readOnly
                  />
                  <p className="text-xs text-slate-500">{t('profile.emailHint')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">{t('profile.role')}</label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 capitalize cursor-not-allowed"
                  value={user.role}
                  readOnly
                />
                <p className="text-xs text-slate-500">{t('profile.roleHint')}</p>
              </div>
            </div>

            <div className="space-y-6 border-t border-slate-200 pt-6">
              <h3 className="text-lg font-medium text-slate-900">{t('profile.sectionPrefs')}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  label={t('profile.allergies')}
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder={t('profile.allergiesPh')}
                />

                <TextField
                  label={t('profile.dietary')}
                  value={dietaryPreference}
                  onChange={(e) => setDietaryPreference(e.target.value)}
                  placeholder={t('profile.dietaryPh')}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">{t('profile.language')}</label>
                <LanguageSelect
                  value={preferredLanguage}
                  onChange={setPreferredLanguage}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {t('profile.languageHint', {
                    label: getLanguageLabel(preferredLanguage),
                    code: preferredLanguage,
                  })}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">{t('profile.fontSize')}</label>
                <select
                  value={fontScale}
                  onChange={(e) => onFontScaleChange(e.target.value as FontScaleId)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white transition-colors"
                >
                  <option value="default">{t('profile.fontDefault')}</option>
                  <option value="large">{t('profile.fontLarge')}</option>
                  <option value="larger">{t('profile.fontLarger')}</option>
                  <option value="largest">{t('profile.fontLargest')}</option>
                </select>
                <p className="text-xs text-slate-500">{t('profile.fontSizeHint')}</p>
              </div>
            </div>

            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            <div className="flex justify-end border-t border-slate-200 pt-6">
              <Button type="submit" variant="primary" loading={busy} loadingText={t('profile.saving')}>
                {t('profile.save')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
