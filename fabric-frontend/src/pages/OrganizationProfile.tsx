import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppShell from '../components/AppShell';
import { Alert, Button } from '../components';
import { fetchOrganization } from '../api/organizationService';
import {
  VerifiedOrganizationBadge,
  VerificationBadge,
  OrganizationFlaggedBadge,
} from '../components/VerificationBadge';
import type { PublicOrganization } from '../types';

export default function OrganizationProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [org, setOrg] = useState<PublicOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = parseInt(userId ?? '', 10);
    if (!Number.isFinite(id)) {
      setError('Invalid organization');
      setLoading(false);
      return;
    }
    void (async () => {
      setLoading(true);
      setError(null);
      const data = await fetchOrganization(id);
      if (!data) setError('Organization not found');
      setOrg(data);
      setLoading(false);
    })();
  }, [userId]);

  return (
    <AppShell
      title={org?.displayName ?? 'Organization'}
      subtitle="Verified supply-chain organization on BlockSure"
    >
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
        {loading && <p className="text-sm text-page-muted">Loading organization…</p>}
        {error && (
          <Alert type="error" className="border border-red-200 dark:border-red-900/60">
            {error}
          </Alert>
        )}

        {org && (
          <div className="card overflow-hidden">
            <div className="relative bg-gradient-to-br from-primary-600/10 via-transparent to-emerald-500/10 dark:from-primary-500/15 dark:to-emerald-600/10 px-6 py-8 sm:px-8">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {org.companyLogoUrl ? (
                  <img
                    src={org.companyLogoUrl}
                    alt={`${org.displayName} logo`}
                    className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl border border-neutral-200/80 object-cover shadow-md dark:border-neutral-600 bg-white dark:bg-neutral-800"
                  />
                ) : (
                  <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl border border-neutral-200/80 bg-white/80 dark:bg-neutral-800/80 dark:border-neutral-600 flex items-center justify-center text-3xl font-bold text-primary-700 dark:text-primary-300">
                    {(org.displayName || '?').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-700 dark:text-primary-300">
                    {org.role}
                  </p>
                  <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-page-title truncate">
                    {org.displayName}
                  </h1>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {org.organizationFlagged && <OrganizationFlaggedBadge />}
                    {org.organizationVerified && <VerifiedOrganizationBadge />}
                    {org.verifiedByRegulator && <VerificationBadge verified />}
                  </div>
                  {org.organizationFlagReason && (
                    <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                      Flag reason: {org.organizationFlagReason}
                    </p>
                  )}
                  {org.companyLocation && (
                    <p className="mt-2 text-sm text-page-muted flex items-center gap-1.5">
                      <span aria-hidden>📍</span>
                      {org.companyLocation}
                    </p>
                  )}
                  {org.companyWebsite && (
                    <a
                      href={
                        org.companyWebsite.startsWith('http')
                          ? org.companyWebsite
                          : `https://${org.companyWebsite}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
                    >
                      {org.companyWebsite.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-6 sm:px-8 space-y-6 border-t border-neutral-200/80 dark:border-neutral-700/80">
              {org.companyDescription ? (
                <div>
                  <h2 className="text-sm font-semibold text-page-label mb-2">About</h2>
                  <p className="text-page-body leading-relaxed whitespace-pre-wrap">
                    {org.companyDescription}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-page-muted italic">
                  This organization has not added a public description yet.
                </p>
              )}

              {org.role === 'manufacturer' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-4 dark:border-neutral-600 dark:bg-neutral-900/40">
                    <p className="text-xs text-page-label">Products registered</p>
                    <p className="mt-1 text-2xl font-bold text-page-title tabular-nums">
                      {org.totalProducts ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/60 p-4 dark:border-neutral-600 dark:bg-neutral-900/40">
                    <p className="text-xs text-page-label">Metadata completion</p>
                    <p className="mt-1 text-2xl font-bold text-page-title tabular-nums">
                      {org.metadataCompletionPercent != null
                        ? `${org.metadataCompletionPercent}%`
                        : '—'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/30">
                    <p className="text-xs text-page-label">On-chain traceability</p>
                    <p className="mt-1 text-sm font-medium text-emerald-800 dark:text-emerald-200">
                      Hyperledger Fabric verified
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Button as={Link} to="/verify" variant="secondary">
                  Verify a product
                </Button>
                <Button as={Link} to="/" variant="ghost">
                  Back to home
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
