import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Alert, Button } from '../components';
import {
  VerifiedOrganizationBadge,
  OrganizationFlaggedBadge,
} from '../components/VerificationBadge';
import {
  fetchRegulatorOrganizations,
  setOrganizationVerification,
  setOrganizationFlag,
} from '../api/regulatorService';
import type { RegulatorOrganizationRow } from '../types';

function OrgStatusBadges({ row }: { row: RegulatorOrganizationRow }) {
  if (row.organizationFlagged) {
    return <OrganizationFlaggedBadge />;
  }
  if (row.organizationVerified) {
    return <VerifiedOrganizationBadge />;
  }
  return (
    <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Pending review</span>
  );
}

export default function OrganizationManagement() {
  const [rows, setRows] = useState<RegulatorOrganizationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [flagTarget, setFlagTarget] = useState<RegulatorOrganizationRow | null>(null);
  const [flagReason, setFlagReason] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchRegulatorOrganizations());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleVerification = async (row: RegulatorOrganizationRow, verified: boolean) => {
    setBusyId(row.id);
    setMessage(null);
    setError(null);
    try {
      const updated = await setOrganizationVerification(row.id, verified);
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setMessage(verified ? `Approved ${displayName(row)}` : `Revoked approval for ${displayName(row)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  const submitFlag = async (flagged: boolean) => {
    if (!flagTarget) return;
    setBusyId(flagTarget.id);
    setMessage(null);
    setError(null);
    try {
      const updated = await setOrganizationFlag(
        flagTarget.id,
        flagged,
        flagged ? flagReason : undefined
      );
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setMessage(
        flagged
          ? `Flagged ${displayName(flagTarget)} for review`
          : `Removed flag from ${displayName(flagTarget)}`
      );
      setFlagTarget(null);
      setFlagReason('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Flag update failed');
    } finally {
      setBusyId(null);
    }
  };

  const unflagOrganization = async (row: RegulatorOrganizationRow) => {
    setBusyId(row.id);
    setMessage(null);
    setError(null);
    try {
      const updated = await setOrganizationFlag(row.id, false);
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setMessage(`Removed flag from ${displayName(row)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unflag failed');
    } finally {
      setBusyId(null);
    }
  };

  const displayName = (r: RegulatorOrganizationRow) => r.companyName?.trim() || r.name;

  return (
    <AppShell
      title="Organization review"
      subtitle="Approve, revoke, or flag supply-chain organizations"
    >
      <div className="space-y-6 animate-fade-up">
        <div className="rounded-xl border border-sky-200/80 bg-gradient-to-r from-sky-50/90 to-slate-50/50 px-5 py-4 dark:border-sky-800/50 dark:from-sky-950/30 dark:to-neutral-900/40">
          <p className="text-sm text-page-body">
            Regulators oversee manufacturers, distributors, and retailers only. Verified and flagged
            statuses appear on public organization and product verification pages.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => void load()} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
          <Button as={Link} to="/home" variant="ghost">
            Back to oversight home
          </Button>
        </div>

        {error && <Alert type="error">{error}</Alert>}
        {message && <Alert type="success">{message}</Alert>}

        {flagTarget && (
          <div className="card p-5 border border-red-200/80 dark:border-red-900/50 space-y-3">
            <h3 className="font-semibold text-page-title">
              Flag {displayName(flagTarget)} for review
            </h3>
            <label className="block text-sm text-page-label">
              Reason (optional)
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-lg border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm dark:bg-neutral-800"
                placeholder="e.g. Missing certification documents"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="primary"
                loading={busyId === flagTarget.id}
                onClick={() => void submitFlag(true)}
              >
                Confirm flag
              </Button>
              <Button type="button" variant="ghost" onClick={() => setFlagTarget(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <section className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-sky-50/80 dark:bg-sky-950/30 border-b border-neutral-200 dark:border-neutral-700">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-page-label">Organization</th>
                  <th className="text-left px-4 py-3 font-semibold text-page-label">Role</th>
                  <th className="text-left px-4 py-3 font-semibold text-page-label">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-page-label">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80 dark:divide-neutral-700/80">
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-page-muted">
                      Loading organizations…
                    </td>
                  </tr>
                )}
                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-page-muted">
                      No supply-chain organizations registered yet.
                    </td>
                  </tr>
                )}
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-page-title">{displayName(row)}</p>
                      <p className="text-xs text-page-muted">{row.email}</p>
                      {row.organizationFlagReason && (
                        <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                          Flag reason: {row.organizationFlagReason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 capitalize text-page-body">{row.role}</td>
                    <td className="px-4 py-3">
                      <OrgStatusBadges row={row} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button as={Link} to={`/organization/${row.id}`} variant="ghost" size="sm">
                          Inspect
                        </Button>
                        {!row.organizationVerified ? (
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            loading={busyId === row.id}
                            onClick={() => void toggleVerification(row, true)}
                          >
                            Approve
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            loading={busyId === row.id}
                            onClick={() => void toggleVerification(row, false)}
                          >
                            Revoke
                          </Button>
                        )}
                        {row.organizationFlagged ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            loading={busyId === row.id}
                            onClick={() => void unflagOrganization(row)}
                          >
                            Unflag
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setFlagTarget(row);
                              setFlagReason('');
                            }}
                          >
                            Flag
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
      </div>
    </AppShell>
  );
}
