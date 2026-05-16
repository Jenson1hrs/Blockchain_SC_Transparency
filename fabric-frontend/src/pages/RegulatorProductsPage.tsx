import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Alert, Button } from '../components';
import { MetadataIncompleteBadge } from '../components/MetadataIncompleteBadge';
import {
  VerifiedOrganizationBadge,
  OrganizationFlaggedBadge,
} from '../components/VerificationBadge';
import {
  fetchRegulatorProducts,
  type RegulatorProductFilter,
} from '../api/regulatorService';

export default function RegulatorProductsPage() {
  const [filter, setFilter] = useState<RegulatorProductFilter>('all');
  const [searchQ, setSearchQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [manufacturerFilter, setManufacturerFilter] = useState('');
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchRegulatorProducts>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(
        await fetchRegulatorProducts({
          filter,
          q: searchQ,
          status: statusFilter,
          manufacturer: manufacturerFilter,
          limit: 150,
        })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [filter, searchQ, statusFilter, manufacturerFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppShell
      title="Product registry"
      subtitle="Searchable oversight of traceable products (read-only)"
    >
      <div className="space-y-6 animate-fade-up">
        <p className="text-sm text-page-body rounded-xl border border-sky-200/70 bg-sky-50/50 px-4 py-3 dark:border-sky-800/50 dark:bg-sky-950/25">
          Inspect metadata, verify authenticity, and open manufacturer profiles. Regulators cannot
          create or transfer products.
        </p>

        <div className="card p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="text-sm">
              <span className="text-page-label block mb-1">Search</span>
              <input
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="ID, name, manufacturer, batch"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm dark:bg-neutral-800"
              />
            </label>
            <label className="text-sm">
              <span className="text-page-label block mb-1">Status</span>
              <input
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                placeholder="e.g. Manufactured"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm dark:bg-neutral-800"
              />
            </label>
            <label className="text-sm">
              <span className="text-page-label block mb-1">Manufacturer</span>
              <input
                value={manufacturerFilter}
                onChange={(e) => setManufacturerFilter(e.target.value)}
                placeholder="Company name"
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm dark:bg-neutral-800"
              />
            </label>
            <label className="text-sm">
              <span className="text-page-label block mb-1">Filter</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as RegulatorProductFilter)}
                className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm dark:bg-neutral-800"
              >
                <option value="all">All products</option>
                <option value="flagged">Flagged / issues</option>
                <option value="incomplete">Missing metadata</option>
                <option value="expiring">Expiring soon</option>
                <option value="flagged_org">Flagged organization</option>
              </select>
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="primary" onClick={() => void load()} disabled={loading}>
              Apply filters
            </Button>
            <Button type="button" variant="secondary" onClick={() => void load()} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {loading && <p className="text-sm text-page-muted">Loading product registry…</p>}

        {!loading && rows.length === 0 && (
          <p className="text-sm text-page-muted">No products match your filters.</p>
        )}

        {!loading && rows.length > 0 && (
          <section className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-sky-50/80 dark:bg-sky-950/30 border-b border-neutral-200 dark:border-neutral-700">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Product ID</th>
                    <th className="text-left px-3 py-2 font-semibold">Name</th>
                    <th className="text-left px-3 py-2 font-semibold">Manufacturer</th>
                    <th className="text-left px-3 py-2 font-semibold">Owner</th>
                    <th className="text-left px-3 py-2 font-semibold">Location</th>
                    <th className="text-left px-3 py-2 font-semibold">Status</th>
                    <th className="text-left px-3 py-2 font-semibold">Expiry</th>
                    <th className="text-left px-3 py-2 font-semibold">Metadata</th>
                    <th className="text-left px-3 py-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200/80 dark:divide-neutral-700/80">
                  {rows.map((p) => (
                    <tr key={p.productId} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30">
                      <td className="px-3 py-2 font-mono text-xs">{p.productId}</td>
                      <td className="px-3 py-2">{p.name}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          <span>{p.manufacturerCompanyName}</span>
                          <div className="flex flex-wrap gap-1">
                            {p.manufacturerOrganizationVerified && (
                              <VerifiedOrganizationBadge compact />
                            )}
                            {p.manufacturerOrganizationFlagged && (
                              <OrganizationFlaggedBadge compact />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">{p.owner}</td>
                      <td className="px-3 py-2">{p.location}</td>
                      <td className="px-3 py-2">{p.status}</td>
                      <td className="px-3 py-2 text-xs">
                        {p.expiryDate ? String(p.expiryDate).slice(0, 10) : '—'}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          <span className="tabular-nums">{p.metadataCompletionPercent}%</span>
                          {!p.metadataComplete && <MetadataIncompleteBadge compact />}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-1">
                          <Button
                            as={Link}
                            to="/verify"
                            state={{ productId: p.productId }}
                            size="sm"
                            variant="secondary"
                          >
                            Verify
                          </Button>
                          <Button
                            as={Link}
                            to={`/qr/${encodeURIComponent(p.productId)}`}
                            size="sm"
                            variant="ghost"
                          >
                            QR
                          </Button>
                          {p.manufacturerUserId != null && (
                            <Button
                              as={Link}
                              to={`/organization/${p.manufacturerUserId}`}
                              size="sm"
                              variant="ghost"
                            >
                              Org
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
