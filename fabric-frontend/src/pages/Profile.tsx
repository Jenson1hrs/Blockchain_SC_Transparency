import { useEffect, useState, type FormEvent } from 'react';
import AppShell from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import { updateMeApi } from '../api/authService';
import LanguageSelect from '../components/LanguageSelect';
import { getLanguageLabel } from '../utils/languages';

export default function Profile() {
  const { user, setCurrentUser } = useAuth();
  const [name, setName] = useState('');
  const [allergies, setAllergies] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
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

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setSuccess('');
    if (!name.trim()) {
      setError('Name is required');
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
      setSuccess('Profile updated successfully.');
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;

  return (
    <AppShell title="Profile / Settings" subtitle="Manage your account details and preferences">
      <div className="card p-6 max-w-lg mx-auto animate-fade-up">
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (read-only)</label>
            <input
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
              value={user.email}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role (read-only)</label>
            <input
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 capitalize"
              value={user.role}
              readOnly
            />
          </div>
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preferences</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. peanuts, shellfish"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dietary preference</label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value)}
                placeholder="e.g. vegetarian, halal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred language</label>
              <LanguageSelect
                value={preferredLanguage}
                onChange={setPreferredLanguage}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Selected: {getLanguageLabel(preferredLanguage)} ({preferredLanguage})
              </p>
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
              {success}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="text-sm rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
