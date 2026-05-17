import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import { useRolePageMeta } from '../hooks/useRolePageMeta';
import { Alert } from '../components/Alert';
import { Button } from '../components/Button';
import { fetchAdminSystemStatus, fetchPublicHealth } from '../api/adminService';
import type { SystemStatusResponse } from '../types';

export default function AdminSystemPage() {
  const pageMeta = useRolePageMeta('adminSystem', 'admin');
  const [status, setStatus] = useState<SystemStatusResponse | null>(null);
  const [healthTs, setHealthTs] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sys, health] = await Promise.all([
        fetchAdminSystemStatus(),
        fetchPublicHealth(),
      ]);
      if (sys.success) setStatus(sys);
      if (health.success) setHealthTs(health.timestamp);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load system status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const pill = (label: string, tone: 'ok' | 'warn' | 'bad') => (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        tone === 'ok'
          ? 'bg-green-100 text-green-800 dark:bg-green-950/55 dark:text-green-200'
          : tone === 'bad'
            ? 'bg-red-100 text-red-800 dark:bg-red-950/55 dark:text-red-200'
            : 'bg-amber-100 text-amber-900 dark:bg-amber-950/45 dark:text-amber-100'
      }`}
    >
      {label}
    </span>
  );

  return (
    <AppShell title={pageMeta.title} subtitle={pageMeta.subtitle}>
      <div className="space-y-6 animate-fade-up">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => void load()} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
        </div>

        {error && (
          <Alert type="error" className="border border-red-200 dark:border-red-900/60">
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-2">API</h3>
            <p className="text-sm text-gray-600 dark:text-neutral-200 mb-2">Public health probe</p>
            {loading && !healthTs ? (
              <p className="text-sm text-gray-500 dark:text-neutral-200">Loading…</p>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">{pill('online', 'ok')}</div>
                <p className="text-xs text-gray-500 dark:text-neutral-200">
                  Timestamp: {healthTs ?? status?.timestamp ?? '—'}
                </p>
              </>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-2">Database</h3>
            <p className="text-sm text-gray-600 dark:text-neutral-200 mb-2">PostgreSQL</p>
            {loading && !status ? (
              <p className="text-sm text-gray-500 dark:text-neutral-200">Loading…</p>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  {pill(
                    status?.database.status === 'connected' ? 'connected' : 'error',
                    status?.database.status === 'connected' ? 'ok' : 'bad',
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-neutral-200">{status?.database.detail}</p>
              </>
            )}
          </div>

          <div className="card p-5 md:col-span-2">
            <h3 className="font-semibold text-gray-900 dark:text-neutral-100 mb-2">Blockchain</h3>
            <p className="text-sm text-gray-600 dark:text-neutral-200 mb-2">Hyperledger Fabric (supplychannel)</p>
            {loading && !status ? (
              <p className="text-sm text-gray-500 dark:text-neutral-200">Loading…</p>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  {pill(
                    status?.blockchain.status === 'connected'
                      ? 'connected'
                      : status?.blockchain.status === 'error'
                        ? 'error'
                        : 'unknown',
                    status?.blockchain.status === 'connected'
                      ? 'ok'
                      : status?.blockchain.status === 'error'
                        ? 'bad'
                        : 'warn',
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-neutral-200">{status?.blockchain.detail}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
