import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useAuth } from '../context/AuthContext';
import { registerApi } from '../api/authService';
import type { UserRole } from '../types';
import LanguageSelect from '../components/LanguageSelect';
import { getLanguageLabel } from '../utils/languages';

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'consumer', label: 'Consumer' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'retailer', label: 'Retailer' },
  { value: 'admin', label: 'Admin' },
];

export default function Register() {
  const { user, loginWithSession } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('consumer');
  const [allergies, setAllergies] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
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
      navigate('/', {
        replace: true,
        state: { flashSuccess: `Registration successful. Welcome, ${res.user.name}.` },
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title="Create account" subtitle="Preferences are stored for your profile only">
      <div className="card p-6 max-w-lg mx-auto animate-fade-up">
        <form onSubmit={onSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              autoComplete="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              autoComplete="new-password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-amber-700 mt-1">
              For prototype testing only. In real deployment, roles are approved by an administrator.
            </p>
          </div>
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preferences</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (optional)</label>
              <input
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. peanuts, shellfish"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dietary preference (optional)</label>
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
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-blue-600 text-white py-2.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link className="text-blue-600 hover:underline font-medium" to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
