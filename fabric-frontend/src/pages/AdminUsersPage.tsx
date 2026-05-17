import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { useRolePageMeta } from '../hooks/useRolePageMeta';
import { Alert } from '../components/Alert';
import { fetchAdminUsers } from '../api/adminService';
import type { AdminUserRow } from '../types';

export default function AdminUsersPage() {
  const pageMeta = useRolePageMeta('adminUsers', 'admin');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchAdminUsers();
        if (!cancelled && res.success) {
          setUsers(res.data ?? []);
          setRoleCounts(res.roleCounts ?? {});
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load users');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const roleKeys = Object.keys(roleCounts).sort();

  return (
    <AppShell title={pageMeta.title} subtitle={pageMeta.subtitle}>
      <div className="space-y-6 animate-fade-up">
        {error && (
          <Alert type="error" className="border border-red-200 dark:border-red-900/60">
            {error}
          </Alert>
        )}

        <section className="card p-5 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-3">Role distribution</h2>
          {loading ? (
            <p className="text-sm text-gray-500 dark:text-neutral-200">Loading summary…</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {roleKeys.map((role) => (
                <div
                  key={role}
                  className="rounded-lg border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-900/50 px-4 py-2 text-sm"
                >
                  <span className="capitalize text-gray-700 dark:text-neutral-200">{role}</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-neutral-100">{roleCounts[role] ?? 0}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-neutral-900/60 border-b border-gray-200 dark:border-neutral-700">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-neutral-200">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-neutral-200">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-neutral-200">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-neutral-200">Language</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 dark:text-neutral-200">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-neutral-200">
                      Loading users…
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-neutral-200">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/80 dark:hover:bg-neutral-800/50">
                      <td className="px-4 py-3 text-gray-900 dark:text-neutral-100">{u.name}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-neutral-200">{u.email}</td>
                      <td className="px-4 py-3 capitalize text-gray-800 dark:text-neutral-200">{u.role}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-neutral-200">{u.preferredLanguage}</td>
                      <td className="px-4 py-3 text-gray-600 dark:text-neutral-200 whitespace-nowrap">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
