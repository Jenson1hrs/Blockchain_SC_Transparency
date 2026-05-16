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
import {
  isConsumerRole,
  isSupplyChainRole,
  PROFILE_PAGE_INTRO_KEY,
  PROFILE_ROLE_HINT_KEY,
  PROFILE_SHELL_SUBTITLE_KEY,
  PROFILE_WORKSPACE_NOTE_KEY,
} from '../constants/profileRoleCopy';

export default function Profile() {
  const { user, setCurrentUser } = useAuth();
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [allergies, setAllergies] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [fontScale, setFontScale] = useState<FontScaleId>(() => getStoredFontScale());
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isConsumer = user ? isConsumerRole(user.role) : false;
  const isSupplyChain = user ? isSupplyChainRole(user.role) : false;
  const workspaceNoteKey = user ? PROFILE_WORKSPACE_NOTE_KEY[user.role] : undefined;

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setAllergies(user.allergies ?? '');
    setDietaryPreference(user.dietaryPreference ?? '');
    setPreferredLanguage(user.preferredLanguage || 'en');
    setCompanyName(user.companyName ?? '');
    setCompanyDescription(user.companyDescription ?? '');
    setCompanyWebsite(user.companyWebsite ?? '');
    setCompanyLogoUrl(user.companyLogoUrl ?? '');
    setCompanyLocation(user.companyLocation ?? '');
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
      const body: Parameters<typeof updateMeApi>[0] = {
        name: name.trim(),
        preferredLanguage: preferredLanguage.trim() || 'en',
        themePreference: user.themePreference ?? 'light',
      };
      if (isConsumer) {
        body.allergies = allergies.trim() || '';
        body.dietaryPreference = dietaryPreference.trim() || '';
      }
      if (isSupplyChain) {
        body.companyName = companyName.trim();
        body.companyDescription = companyDescription.trim();
        body.companyWebsite = companyWebsite.trim();
        body.companyLogoUrl = companyLogoUrl.trim();
        body.companyLocation = companyLocation.trim();
      }

      const res = await updateMeApi(body);
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

  const onPickCompanyLogo = (file: File | null) => {
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) {
      setError(t('profile.companyLogoInvalidType'));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError(t('profile.companyLogoTooLarge'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      setCompanyLogoUrl(dataUrl);
    };
    reader.onerror = () => {
      setError(t('profile.companyLogoReadFailed'));
    };
    reader.readAsDataURL(file);
  };

  const clearCompanyLogo = () => {
    setCompanyLogoUrl('');
  };

  if (!user) return null;

  return (
    <AppShell
      title={t('profile.shellTitle')}
      subtitle={t(PROFILE_SHELL_SUBTITLE_KEY[user.role])}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-slate-200 dark:border-neutral-600 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-neutral-100 mb-2">
              {t('profile.pageTitle')}
            </h1>
            <p className="text-slate-600 dark:text-neutral-200">{t(PROFILE_PAGE_INTRO_KEY[user.role])}</p>
          </div>

          <form className="space-y-8" onSubmit={submit}>
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-slate-900 dark:text-neutral-100 border-b border-slate-200 dark:border-neutral-600 pb-2">
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
                  <label className="block text-sm font-medium text-slate-700 dark:text-neutral-200">
                    {t('profile.email')}
                  </label>
                  <input
                    className="w-full rounded-lg border border-slate-200 dark:border-neutral-600 bg-slate-50 dark:bg-neutral-900/60 px-3 py-2.5 text-sm text-slate-600 dark:text-neutral-200 cursor-not-allowed"
                    value={user.email}
                    readOnly
                  />
                  <p className="text-xs text-slate-500 dark:text-neutral-300">{t('profile.emailHint')}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-200">
                  {t('profile.role')}
                </label>
                <input
                  className="w-full rounded-lg border border-slate-200 dark:border-neutral-600 bg-slate-50 dark:bg-neutral-900/60 px-3 py-2.5 text-sm text-slate-600 dark:text-neutral-200 capitalize cursor-not-allowed"
                  value={user.role}
                  readOnly
                />
                <p className="text-xs text-slate-500 dark:text-neutral-300">
                  {t(PROFILE_ROLE_HINT_KEY[user.role])}
                </p>
              </div>
            </div>

            {!isConsumer && workspaceNoteKey && (
              <div className="rounded-lg border border-primary-200/80 bg-primary-50/50 px-4 py-3 text-sm text-page-body dark:border-primary-800/50 dark:bg-primary-950/30">
                {t(workspaceNoteKey)}
              </div>
            )}

            {isSupplyChain && (
              <div className="space-y-6 border-t border-slate-200 dark:border-neutral-600 pt-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-neutral-100">
                    {t('profile.sectionOrganization')}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-neutral-200">
                    {t('profile.sectionOrganizationIntro')}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    label={t('profile.companyName')}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={t('profile.companyNamePh')}
                  />
                  <TextField
                    label={t('profile.companyLocation')}
                    value={companyLocation}
                    onChange={(e) => setCompanyLocation(e.target.value)}
                    placeholder={t('profile.companyLocationPh')}
                  />
                  <TextField
                    label={t('profile.companyWebsite')}
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="md:col-span-2"
                  />
                  <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-neutral-200 mb-2">
                    {t('profile.companyLogo')}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {companyLogoUrl ? (
                      <img
                        src={companyLogoUrl}
                        alt={companyName.trim() || user.name}
                        className="h-24 w-24 rounded-xl border border-slate-200 dark:border-neutral-600 object-cover shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-xl border border-dashed border-slate-300 dark:border-neutral-600 bg-slate-50 dark:bg-neutral-900/50 flex items-center justify-center text-slate-400 dark:text-neutral-500 text-xs text-center px-2 shrink-0">
                        {t('profile.companyLogoEmpty')}
                      </div>
                    )}
                    <div className="space-y-2 min-w-0 flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onPickCompanyLogo(e.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-slate-600 dark:text-neutral-200 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-950/50 dark:file:text-primary-300"
                      />
                      <p className="text-xs text-slate-500 dark:text-neutral-300">
                        {t('profile.companyLogoHint')}
                      </p>
                      {companyLogoUrl && (
                        <Button type="button" variant="ghost" size="sm" onClick={clearCompanyLogo}>
                          {t('profile.companyLogoRemove')}
                        </Button>
                      )}
                      {isSupplyChain && user.id > 0 && (
                        <p className="text-xs text-slate-500 dark:text-neutral-300 pt-1">
                          <a
                            href={`/organization/${user.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary-600 hover:underline dark:text-primary-400"
                          >
                            {t('profile.companyLogoPreviewLink')}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-neutral-200 mb-1.5">
                    {t('profile.companyDescription')}
                  </label>
                  <textarea
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-slate-300 dark:border-neutral-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-800 dark:text-neutral-100"
                    placeholder={t('profile.companyDescriptionPh')}
                  />
                </div>
              </div>
            )}

            {isConsumer && (
              <div className="space-y-6 border-t border-slate-200 dark:border-neutral-600 pt-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-neutral-100">
                    {t('profile.sectionConsumerHealth')}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-neutral-200">
                    {t('profile.sectionConsumerHealthIntro')}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    label={t('profile.allergies')}
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder={t('profile.allergiesPh')}
                    helperText={t('profile.allergiesFormatHint')}
                  />
                  <TextField
                    label={t('profile.dietary')}
                    value={dietaryPreference}
                    onChange={(e) => setDietaryPreference(e.target.value)}
                    placeholder={t('profile.dietaryPh')}
                  />
                </div>
              </div>
            )}

            <div className="space-y-6 border-t border-slate-200 dark:border-neutral-600 pt-6">
              <h3 className="text-lg font-medium text-slate-900 dark:text-neutral-100">
                {t('profile.sectionDisplay')}
              </h3>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-200">
                  {t('profile.language')}
                </label>
                <LanguageSelect
                  value={preferredLanguage}
                  onChange={setPreferredLanguage}
                  className="w-full rounded-lg border border-slate-300 dark:border-neutral-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-800 dark:text-neutral-100 transition-colors"
                />
                <p className="text-xs text-slate-500 dark:text-neutral-300 mt-1">
                  {t('profile.languageHint', {
                    label: getLanguageLabel(preferredLanguage),
                    code: preferredLanguage,
                  })}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-neutral-200">
                  {t('profile.fontSize')}
                </label>
                <select
                  value={fontScale}
                  onChange={(e) => onFontScaleChange(e.target.value as FontScaleId)}
                  className="w-full rounded-lg border border-slate-300 dark:border-neutral-600 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-800 dark:text-neutral-100 transition-colors"
                >
                  <option value="default">{t('profile.fontDefault')}</option>
                  <option value="large">{t('profile.fontLarge')}</option>
                  <option value="larger">{t('profile.fontLarger')}</option>
                  <option value="largest">{t('profile.fontLargest')}</option>
                </select>
                <p className="text-xs text-slate-500 dark:text-neutral-300">{t('profile.fontSizeHint')}</p>
              </div>
            </div>

            {error && <Alert type="error">{error}</Alert>}
            {success && <Alert type="success">{success}</Alert>}

            <div className="flex justify-end border-t border-slate-200 dark:border-neutral-600 pt-6">
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