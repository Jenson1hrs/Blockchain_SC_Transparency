import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { useRolePageMeta } from '../hooks/useRolePageMeta';
import { Alert, Button, ConfirmModal, Toast } from '../components';
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
  const pageMeta = useRolePageMeta('regulatorOrgs', 'regulator');
  const [rows, setRows] = useState<RegulatorOrganizationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<RegulatorOrganizationRow | null>(null);
  const [flagTarget, setFlagTarget] = useState<RegulatorOrganizationRow | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  const displayName = (r: RegulatorOrganizationRow) => r.companyName?.trim() || r.name;

  const closeModals = () => {
    if (busy) return;
    setApproveTarget(null);
    setFlagTarget(null);
    setFlagReason('');
  };

  const confirmApprove = async () => {
    if (!approveTarget) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await setOrganizationVerification(approveTarget.id, true);
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setApproveTarget(null);
      setToast({
        message: `${displayName(approveTarget)} is now verified. Trust badges will appear on verification pages.`,
        type: 'success',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
      setApproveTarget(null);
    } finally {
      setBusy(false);
    }
  };

  const confirmFlag = async () => {
    if (!flagTarget) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await setOrganizationFlag(flagTarget.id, true, flagReason.trim() || undefined);
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setFlagTarget(null);
      setFlagReason('');
      setToast({
        message: `Flagged ${displayName(flagTarget)} for review.`,
        type: 'success',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Flag update failed');
      setFlagTarget(null);
    } finally {
      setBusy(false);
    }
  };

  const revokeVerification = async (row: RegulatorOrganizationRow) => {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await setOrganizationVerification(row.id, false);
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setMessage(`Revoked approval for ${displayName(row)}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const unflagOrganization = async (row: RegulatorOrganizationRow) => {
    setBusy(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await setOrganizationFlag(row.id, false);
      setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setToast({ message: `Removed flag from ${displayName(row)}`, type: 'success' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unflag failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell title={pageMeta.title} subtitle={pageMeta.subtitle}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmModal
        isOpen={approveTarget !== null}
        variant="success"
        title="Approve organization?"
        description="Verified organizations display a trust badge on product verification and organization profiles. This signals regulatory approval to consumers and partners."
        confirmText="Approve"
        cancelText="Cancel"
        loading={busy}
        onConfirm={() => void confirmApprove()}
        onCancel={closeModals}
      >
        {approveTarget && (
          <p className="text-sm font-medium text-page-title">{displayName(approveTarget)}</p>
        )}
      </ConfirmModal>

      <ConfirmModal
        isOpen={flagTarget !== null}
        variant="danger"
        title="Flag organization for review?"
        description="Flagged organizations may display warning badges during product verification. Use this when compliance or documentation concerns require attention."
        confirmText="Flag organization"
        cancelText="Cancel"
        loading={busy}
        onConfirm={() => void confirmFlag()}
        onCancel={closeModals}
      >
        <label className="block text-sm font-medium text-page-label">
          Reason (optional)
          <textarea
            value={flagReason}
            onChange={(e) => setFlagReason(e.target.value)}
            rows={3}
            placeholder="e.g. Missing certification documents"
            className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
          />
        </label>
      </ConfirmModal>

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
                            disabled={busy}
                            onClick={() => setApproveTarget(row)}
                          >
                            Approve
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            loading={busy}
                            onClick={() => void revokeVerification(row)}
                          >
                            Revoke
                          </Button>
                        )}
                        {row.organizationFlagged ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            loading={busy}
                            onClick={() => void unflagOrganization(row)}
                          >
                            Unflag
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={busy}
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
