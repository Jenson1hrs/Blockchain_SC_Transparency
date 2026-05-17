import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useRolePageMeta } from '../hooks/useRolePageMeta';
import { Alert, Button } from '../components';
import { fetchPublicHealth } from '../api/adminService';
import { fetchRegulatorSummary } from '../api/regulatorService';
import type { RegulatorSummary } from '../api/regulatorService';

export default function RegulatorTransparencyPage() {
  const pageMeta = useRolePageMeta('regulatorTransparency', 'regulator');
  const [summary, setSummary] = useState<RegulatorSummary | null>(null);
  const [healthTs, setHealthTs] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const [s, health] = await Promise.all([fetchRegulatorSummary(), fetchPublicHealth()]);
        setSummary(s);
        if (health.success) setHealthTs(health.timestamp);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load transparency data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pill = (label: string, ok: boolean) => (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        ok
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
          : 'bg-amber-100 text-amber-900 dark:bg-amber-950/45 dark:text-amber-100'
      }`}
    >
      {label}
    </span>
  );

  return (
    <AppShell title={pageMeta.title} subtitle={pageMeta.subtitle}>
      <div className="space-y-6 animate-fade-up max-w-3xl">
        {error && <Alert type="error">{error}</Alert>}
        {loading && <p className="text-sm text-page-muted">Loading…</p>}

        {summary && (
          <>
            <section className="card p-6 space-y-4 border-l-4 border-sky-600 dark:border-sky-500">
              <h2 className="text-lg font-semibold text-page-title">Infrastructure</h2>
              <div className="flex flex-wrap gap-3">
                {pill(`API: ${summary.apiStatus}`, summary.apiStatus === 'online')}
                {pill(`Database: ${summary.databaseStatus}`, summary.databaseStatus === 'online')}
                {pill(`Blockchain: ${summary.blockchainStatus}`, summary.blockchainStatus === 'connected')}
              </div>
              {healthTs && (
                <p className="text-xs text-page-muted">Health check at {new Date(healthTs).toLocaleString()}</p>
              )}
            </section>

            <section className="card p-6">
              <h2 className="text-lg font-semibold text-page-title mb-2">Traceability scope</h2>
              <p className="text-3xl font-bold text-sky-800 dark:text-sky-300 tabular-nums">
                {summary.totalTraceableProducts}
              </p>
              <p className="text-sm text-page-muted mt-1">
                Products indexed in the platform cache with blockchain verification available.
              </p>
            </section>

            <section className="card p-6">
              <h2 className="text-lg font-semibold text-page-title mb-3">Governance posture</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <li className="rounded-lg bg-neutral-50 dark:bg-neutral-900/40 p-3">
                  <span className="text-page-muted">Verified organizations</span>
                  <p className="text-xl font-bold text-page-title">{summary.verifiedOrganizationsCount}</p>
                </li>
                <li className="rounded-lg bg-neutral-50 dark:bg-neutral-900/40 p-3">
                  <span className="text-page-muted">Pending review</span>
                  <p className="text-xl font-bold text-page-title">{summary.pendingOrganizationsCount}</p>
                </li>
                <li className="rounded-lg bg-neutral-50 dark:bg-neutral-900/40 p-3">
                  <span className="text-page-muted">Incomplete metadata</span>
                  <p className="text-xl font-bold text-page-title">{summary.incompleteMetadataProductCount}</p>
                </li>
                <li className="rounded-lg bg-neutral-50 dark:bg-neutral-900/40 p-3">
                  <span className="text-page-muted">Flagged products</span>
                  <p className="text-xl font-bold text-page-title">{summary.flaggedProductCount}</p>
                </li>
              </ul>
            </section>
          </>
        )}

        <Button as={Link} to="/home" variant="ghost">
          Back to oversight home
        </Button>
      </div>
    </AppShell>
  );
}
