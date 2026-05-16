import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { Alert } from './Alert';
import { Button } from './Button';
import type {
  AdminDashboardSummary,
  ConsumerDashboardSummary,
  DistributorDashboardSummary,
  DashboardSummaryData,
  ManufacturerDashboardSummary,
  RegulatorDashboardSummary,
  RetailerDashboardSummary,
  UserRole,
} from '../types';
import type { DashboardSummaryPayload } from '../api/dashboardService';

const ROLE_ORDER: UserRole[] = [
  'admin',
  'regulator',
  'manufacturer',
  'distributor',
  'retailer',
  'consumer',
];

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Admin',
  regulator: 'Regulator',
  manufacturer: 'Manufacturer',
  distributor: 'Distributor',
  retailer: 'Retailer',
  consumer: 'Consumer',
};

type Tone = 'primary' | 'success' | 'warning' | 'neutral' | 'danger';

const toneIconWrap: Record<Tone, string> = {
  primary:
    'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300',
  success:
    'bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-300',
  warning:
    'bg-warning-100 text-warning-600 dark:bg-warning-900/40 dark:text-warning-300',
  neutral:
    'bg-neutral-100 text-neutral-600 dark:bg-neutral-700/80 dark:text-neutral-200',
  danger: 'bg-danger-100 text-danger-600 dark:bg-danger-900/40 dark:text-danger-300',
};

function statusTone(raw: string): { label: string; className: string } {
  const s = String(raw).toLowerCase();
  if (s === 'online' || s === 'connected') {
    return { label: raw, className: 'bg-success-100 text-success-800 dark:bg-success-900/40 dark:text-success-200' };
  }
  if (s === 'configured') {
    return { label: raw, className: 'bg-warning-100 text-warning-800 dark:bg-warning-900/40 dark:text-warning-200' };
  }
  if (s === 'error' || s.includes('fail')) {
    return { label: raw, className: 'bg-danger-100 text-danger-800 dark:bg-danger-900/40 dark:text-danger-200' };
  }
  return { label: raw, className: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700/80 dark:text-neutral-200' };
}

function BigNumber({ children }: { children: ReactNode }) {
  return (
    <p className="text-2xl sm:text-3xl font-bold tabular-nums text-page-title tracking-tight">
      {children}
    </p>
  );
}

function AnalyticsCard({
  title,
  description,
  tone,
  icon,
  children,
  className,
}: {
  title: string;
  description: string;
  tone: Tone;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        'card p-5 sm:p-6 flex flex-col gap-3 h-full min-h-[8.5rem] border-neutral-200/80 dark:border-neutral-600/80',
        'shadow-soft hover:shadow-medium motion-safe:transition-shadow motion-safe:duration-200',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={clsx(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
            toneIconWrap[tone]
          )}
          aria-hidden
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-page-heading text-base">{title}</h4>
          <p className="text-sm text-page-muted mt-0.5">{description}</p>
        </div>
      </div>
      <div className="mt-auto pt-1">{children}</div>
    </div>
  );
}

function SkeletonGrid({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card p-6 h-36 animate-pulse bg-neutral-100/80 dark:bg-neutral-800/80 border-neutral-200/60 dark:border-neutral-600/60"
        >
          <div className="h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-600 mb-4" />
          <div className="h-8 w-1/2 rounded bg-neutral-200 dark:bg-neutral-600" />
        </div>
      ))}
    </div>
  );
}

function IconUsers() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

function IconCloud() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
      />
    </svg>
  );
}

function IconDb() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4-8-4s-8 1.79-8 4"
      />
    </svg>
  );
}

function IconLink() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4v11h9zM13 16h4l4-4V6h-4"
      />
    </svg>
  );
}

function IconMap() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
      />
    </svg>
  );
}

function IconStore() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  );
}

function IconClock() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

function IconShield() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function AdminAnalytics({ data }: { data: AdminDashboardSummary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <AnalyticsCard
        title="Total Users"
        description="Registered accounts in the system."
        tone="primary"
        icon={<IconUsers />}
      >
        <BigNumber>{data.totalUsers}</BigNumber>
      </AnalyticsCard>

      <AnalyticsCard
        title="Users by Role"
        description="How accounts are distributed across roles."
        tone="neutral"
        icon={<IconLayers />}
      >
        <ul className="flex flex-wrap gap-2">
          {ROLE_ORDER.map((r) => (
            <li
              key={r}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200/90 bg-neutral-50/90 px-2.5 py-1 text-sm dark:border-neutral-600 dark:bg-neutral-900/40"
            >
              <span className="text-page-muted">{ROLE_LABEL[r]}</span>
              <span className="font-semibold text-page-title">{data.usersByRole[r] ?? 0}</span>
            </li>
          ))}
        </ul>
      </AnalyticsCard>

      <AnalyticsCard
        title="Total Products"
        description="Rows synced to PostgreSQL from supply-chain activity."
        tone="success"
        icon={<IconBox />}
      >
        <BigNumber>{data.totalProducts}</BigNumber>
      </AnalyticsCard>

      <AnalyticsCard
        title="API Status"
        description="Application server availability."
        tone="primary"
        icon={<IconCloud />}
      >
        <span
          className={clsx(
            'inline-flex rounded-full px-3 py-1 text-sm font-medium',
            statusTone(data.apiStatus).className
          )}
        >
          {data.apiStatus}
        </span>
      </AnalyticsCard>

      <AnalyticsCard
        title="Database Status"
        description="PostgreSQL connectivity check."
        tone="primary"
        icon={<IconDb />}
      >
        <div className="space-y-2">
          <span
            className={clsx(
              'inline-flex rounded-full px-3 py-1 text-sm font-medium',
              statusTone(data.databaseStatus).className
            )}
          >
            {data.databaseStatus}
          </span>
          {data.databaseDetail && (
            <p className="text-xs leading-relaxed text-page-muted">{data.databaseDetail}</p>
          )}
        </div>
      </AnalyticsCard>

      <AnalyticsCard
        title="Blockchain Status"
        description="Hyperledger Fabric gateway reachability."
        tone="warning"
        icon={<IconLink />}
      >
        <div className="space-y-2">
          <span
            className={clsx(
              'inline-flex rounded-full px-3 py-1 text-sm font-medium',
              statusTone(data.blockchainStatus).className
            )}
          >
            {data.blockchainStatus}
          </span>
          {data.blockchainDetail && (
            <p className="text-xs leading-relaxed text-page-muted">{data.blockchainDetail}</p>
          )}
        </div>
      </AnalyticsCard>
    </div>
  );
}

function ManufacturerAnalytics({ data }: { data: ManufacturerDashboardSummary }) {
  const entries = Object.entries(data.productsByStatus).sort((a, b) => b[1] - a[1]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <AnalyticsCard
        title="Total Products"
        description="Products registered under your manufacturer account."
        tone="primary"
        icon={<IconBox />}
      >
        <BigNumber>{data.totalProducts}</BigNumber>
      </AnalyticsCard>

      <AnalyticsCard
        title="Metadata Completion"
        description="Average completeness across image, ingredients, allergy, usage, and halal fields."
        tone="success"
        icon={<IconLayers />}
      >
        <BigNumber>{data.metadataCompletionPercent ?? 100}%</BigNumber>
      </AnalyticsCard>

      <AnalyticsCard
        title="Products by Status"
        description="Lifecycle breakdown from chain + DB cache."
        tone="neutral"
        icon={<IconLayers />}
        className="md:col-span-2 xl:col-span-2"
      >
        {entries.length === 0 ? (
          <p className="text-sm text-page-muted">No status breakdown yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {entries.map(([status, count]) => (
              <li
                key={status}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200/90 bg-neutral-50/90 px-3 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-900/40"
              >
                <span className="font-medium text-page-title">{status}</span>
                <span className="tabular-nums text-page-muted">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </AnalyticsCard>

      <AnalyticsCard
        title="Incomplete Metadata"
        description="Products missing one or more required metadata fields."
        tone="warning"
        icon={<IconLayers />}
      >
        <BigNumber>{data.missingMetadataCount}</BigNumber>
      </AnalyticsCard>

      {(data.recentIncompleteProducts?.length ?? 0) > 0 && (
        <AnalyticsCard
          title="Needs metadata"
          description="Recently registered products with incomplete metadata."
          tone="warning"
          icon={<IconRefresh />}
          className="md:col-span-2 xl:col-span-3"
        >
          <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {data.recentIncompleteProducts!.slice(0, 6).map((p) => (
              <li
                key={p.productId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200/70 bg-amber-50/40 px-3 py-2 text-sm dark:border-amber-800/50 dark:bg-amber-950/20"
              >
                <span className="font-medium text-page-title truncate max-w-[14rem]">
                  {p.name || p.productId}
                </span>
                <span className="text-xs text-page-muted tabular-nums">
                  {p.metadataCompletionPercent ?? 0}% complete
                </span>
              </li>
            ))}
          </ul>
        </AnalyticsCard>
      )}

      <AnalyticsCard
        title="Recent Products"
        description="Latest updates by timestamp."
        tone="success"
        icon={<IconRefresh />}
        className="md:col-span-2 xl:col-span-3"
      >
        {data.recentProducts.length === 0 ? (
          <p className="text-sm text-page-muted">No products yet — create one to get started.</p>
        ) : (
          <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {data.recentProducts.slice(0, 8).map((p) => (
              <li
                key={p.productId}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-neutral-200/70 bg-neutral-50/50 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900/30"
              >
                <span className="font-medium text-page-title truncate max-w-[14rem]">
                  {p.name || p.productId}
                </span>
                <span className="text-page-muted text-xs shrink-0">{p.status ?? '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </AnalyticsCard>
    </div>
  );
}

function DistributorAnalytics({ data }: { data: DistributorDashboardSummary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <AnalyticsCard
        title="In Transit Products"
        description="Shipments marked in transit in PostgreSQL."
        tone="warning"
        icon={<IconTruck />}
      >
        <BigNumber>{data.inTransitProductsCount}</BigNumber>
      </AnalyticsCard>

      <AnalyticsCard
        title="Recent Transfers / Updates"
        description="Latest product timestamps across the network."
        tone="primary"
        icon={<IconRefresh />}
        className="md:col-span-2 xl:col-span-2"
      >
        {data.recentTransfersOrUpdatedProducts.length === 0 ? (
          <p className="text-sm text-page-muted">No movement recorded yet.</p>
        ) : (
          <ul className="space-y-2 max-h-52 overflow-y-auto">
            {data.recentTransfersOrUpdatedProducts.slice(0, 8).map((p) => (
              <li
                key={p.productId}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-neutral-200/70 bg-neutral-50/50 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900/30"
              >
                <span className="font-medium text-page-title truncate max-w-[12rem]">
                  {p.name || p.productId}
                </span>
                <span className="text-page-muted text-xs">{p.location ?? '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </AnalyticsCard>

      <AnalyticsCard
        title="Products by Location"
        description="Top hubs from cached location fields."
        tone="neutral"
        icon={<IconMap />}
        className="md:col-span-2 xl:col-span-3"
      >
        {data.productsByLocation.length === 0 ? (
          <p className="text-sm text-page-muted">No locations recorded.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.productsByLocation.slice(0, 12).map((row) => (
              <li
                key={row.location}
                className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200/70 bg-neutral-50/50 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900/30"
              >
                <span className="truncate text-page-title font-medium">{row.location}</span>
                <span className="tabular-nums text-page-muted shrink-0">{row.count}</span>
              </li>
            ))}
          </ul>
        )}
      </AnalyticsCard>
    </div>
  );
}

function RetailerAnalytics({ data }: { data: RetailerDashboardSummary }) {
  const entries = Object.entries(data.productsByStatus).sort((a, b) => b[1] - a[1]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      <AnalyticsCard
        title="Store Products"
        description="Approximation: delivered or retail-like locations."
        tone="success"
        icon={<IconStore />}
      >
        <BigNumber>{data.productsAtRetailLocationsCount}</BigNumber>
      </AnalyticsCard>

      <AnalyticsCard
        title="Expiring Soon"
        description="Products with expiry in the next 7 days (network-wide)."
        tone="warning"
        icon={<IconClock />}
      >
        <BigNumber>{data.expiringSoonCount}</BigNumber>
      </AnalyticsCard>

      <AnalyticsCard
        title="Recently Updated"
        description="Latest timestamps from product records."
        tone="primary"
        icon={<IconRefresh />}
        className="md:col-span-2 xl:col-span-2"
      >
        {data.recentlyUpdatedProducts.length === 0 ? (
          <p className="text-sm text-page-muted">No updates yet.</p>
        ) : (
          <ul className="space-y-2 max-h-44 overflow-y-auto">
            {data.recentlyUpdatedProducts.slice(0, 6).map((p) => (
              <li
                key={p.productId}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-neutral-200/70 bg-neutral-50/50 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900/30"
              >
                <span className="font-medium text-page-title truncate max-w-[14rem]">
                  {p.name || p.productId}
                </span>
                <span className="text-page-muted text-xs">{p.status ?? '—'}</span>
              </li>
            ))}
          </ul>
        )}
      </AnalyticsCard>

      <AnalyticsCard
        title="Product Status Summary"
        description="Counts by chain status in PostgreSQL."
        tone="neutral"
        icon={<IconLayers />}
        className="md:col-span-2 xl:col-span-4"
      >
        {entries.length === 0 ? (
          <p className="text-sm text-page-muted">No products found.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {entries.map(([status, count]) => (
              <li
                key={status}
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-200/90 bg-neutral-50/90 px-3 py-1.5 text-sm dark:border-neutral-600 dark:bg-neutral-900/40"
              >
                <span className="font-medium text-page-title">{status}</span>
                <span className="tabular-nums text-page-muted">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </AnalyticsCard>
    </div>
  );
}

function RegulatorAnalytics({ data }: { data: RegulatorDashboardSummary }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-sky-200/80 bg-gradient-to-r from-sky-50/80 to-slate-50/50 px-5 py-4 dark:border-sky-800/50 dark:from-sky-950/25 dark:to-neutral-900/40">
        <p className="text-sm text-page-body">
          Compliance oversight — review organizations, inspect product metadata, and monitor platform
          transparency. You cannot create or transfer products.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button as={Link} to="/regulator/organizations" variant="primary" size="sm">
            Review organizations
          </Button>
          <Button as={Link} to="/regulator/products" variant="secondary" size="sm">
            Review products
          </Button>
          <Button as={Link} to="/regulator/transparency" variant="ghost" size="sm">
            System transparency
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnalyticsCard
          title="Verified Organizations"
          description="Supply-chain accounts approved by regulatory oversight."
          tone="success"
          icon={<IconShield />}
        >
          <BigNumber>{data.verifiedOrganizationsCount}</BigNumber>
        </AnalyticsCard>

        <AnalyticsCard
          title="Pending Review"
          description="Organizations awaiting verification."
          tone="warning"
          icon={<IconClock />}
        >
          <BigNumber>{data.pendingOrganizationsCount}</BigNumber>
        </AnalyticsCard>

        <AnalyticsCard
          title="Incomplete Metadata"
          description="Products missing required off-chain metadata fields."
          tone="warning"
          icon={<IconLayers />}
        >
          <BigNumber>{data.incompleteMetadataProductCount}</BigNumber>
        </AnalyticsCard>

        <AnalyticsCard
          title="Flagged Products"
          description="Incomplete metadata or unverified manufacturer organization."
          tone="danger"
          icon={<IconShield />}
        >
          <BigNumber>{data.flaggedProductCount}</BigNumber>
        </AnalyticsCard>

        <AnalyticsCard
          title="Traceable Products"
          description="Total products in the traceability index."
          tone="primary"
          icon={<IconBox />}
        >
          <BigNumber>{data.totalTraceableProducts}</BigNumber>
        </AnalyticsCard>

        <AnalyticsCard
          title="Platform Health"
          description="Database and blockchain connectivity."
          tone="neutral"
          icon={<IconLink />}
          className="md:col-span-2 xl:col-span-2"
        >
          <div className="flex flex-wrap gap-2">
            <span className={statusTone(data.databaseStatus).className + ' inline-flex rounded-full px-3 py-1 text-sm font-medium'}>
              DB: {data.databaseStatus}
            </span>
            <span className={statusTone(data.blockchainStatus).className + ' inline-flex rounded-full px-3 py-1 text-sm font-medium'}>
              Chain: {data.blockchainStatus}
            </span>
          </div>
        </AnalyticsCard>
      </div>
    </div>
  );
}

function ConsumerAnalytics({ data }: { data: ConsumerDashboardSummary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <AnalyticsCard
        title="My Inventory"
        description="Products you have saved after scanning or lookup."
        tone="primary"
        icon={<IconBox />}
      >
        <BigNumber>{data.inventoryCount}</BigNumber>
      </AnalyticsCard>

      <AnalyticsCard
        title="Expiring Soon"
        description="Saved items expiring within the next 7 days."
        tone="warning"
        icon={<IconClock />}
      >
        <BigNumber>{data.expiringSoonCount}</BigNumber>
      </AnalyticsCard>

      <AnalyticsCard
        title="Expired Items"
        description="Saved inventory past the expiry date."
        tone="danger"
        icon={<IconClock />}
      >
        <BigNumber>{data.expiredCount}</BigNumber>
      </AnalyticsCard>

      <AnalyticsCard
        title="Safety Alerts"
        description="Potential allergy conflicts vs your profile (prototype matching)."
        tone="danger"
        icon={<IconShield />}
      >
        <BigNumber>{data.allergyAlertCount}</BigNumber>
      </AnalyticsCard>

      <AnalyticsCard
        title="Recent Inventory"
        description="Latest additions and linked product details."
        tone="success"
        icon={<IconRefresh />}
        className="md:col-span-2 xl:col-span-3"
      >
        {data.recentInventoryItems.length === 0 ? (
          <p className="text-sm text-page-muted">
            Nothing saved yet —{' '}
            <Link to="/verify" className="text-primary-600 dark:text-primary-400 underline-offset-2 hover:underline">
              verify a product
            </Link>{' '}
            and add it to inventory.
          </p>
        ) : (
          <ul className="space-y-2 max-h-56 overflow-y-auto">
            {data.recentInventoryItems.slice(0, 10).map((row) => (
              <li
                key={`${row.id}-${row.productId}`}
                className="flex flex-wrap items-baseline justify-between gap-2 rounded-lg border border-neutral-200/70 bg-neutral-50/50 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900/30"
              >
                <span className="font-medium text-page-title truncate max-w-[14rem]">
                  {row.productName || row.productId}
                </span>
                <span className="text-page-muted text-xs shrink-0">
                  {row.expiryDate ? String(row.expiryDate).slice(0, 10) : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AnalyticsCard>
    </div>
  );
}

function renderByRole(role: UserRole, data: DashboardSummaryData) {
  switch (role) {
    case 'admin':
      return <AdminAnalytics data={data as AdminDashboardSummary} />;
    case 'manufacturer':
      return <ManufacturerAnalytics data={data as ManufacturerDashboardSummary} />;
    case 'distributor':
      return <DistributorAnalytics data={data as DistributorDashboardSummary} />;
    case 'retailer':
      return <RetailerAnalytics data={data as RetailerDashboardSummary} />;
    case 'consumer':
      return <ConsumerAnalytics data={data as ConsumerDashboardSummary} />;
    case 'regulator':
      return <RegulatorAnalytics data={data as RegulatorDashboardSummary} />;
    default:
      return null;
  }
}

function skeletonCountForRole(role: UserRole): number {
  switch (role) {
    case 'admin':
      return 6;
    case 'regulator':
      return 5;
    case 'manufacturer':
      return 4;
    case 'distributor':
      return 3;
    case 'retailer':
      return 4;
    case 'consumer':
      return 5;
    default:
      return 4;
  }
}

export interface DashboardAnalyticsProps {
  role: UserRole;
  loading: boolean;
  error: string | null;
  payload: DashboardSummaryPayload | null;
  onRefresh?: () => void;
  refreshLabel?: string;
  refreshingLabel?: string;
  isRefreshing?: boolean;
}

export function DashboardAnalytics({
  role,
  loading,
  error,
  payload,
  onRefresh,
  refreshLabel = 'Refresh',
  refreshingLabel = 'Refreshing…',
  isRefreshing = false,
}: DashboardAnalyticsProps) {
  return (
    <section className="space-y-5" aria-labelledby="dashboard-analytics-heading">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div className="space-y-1">
          <h3
            id="dashboard-analytics-heading"
            className="text-lg font-semibold text-page-title"
          >
            Analytics
          </h3>
          <p className="text-sm text-page-muted max-w-2xl leading-relaxed">
            Summary statistics from PostgreSQL, reflecting synchronized ledger activity where applicable.
          </p>
        </div>
        {onRefresh && (
          <Button
            type="button"
            variant="secondary"
            onClick={onRefresh}
            disabled={loading}
            className="shrink-0 self-start sm:self-end"
          >
            {loading && isRefreshing ? refreshingLabel : refreshLabel}
          </Button>
        )}
      </div>

      {error && (
        <Alert type="error" className="whitespace-pre-wrap">
          {error}
        </Alert>
      )}

      {loading && <SkeletonGrid count={skeletonCountForRole(role)} />}

      {!loading && !error && payload && renderByRole(payload.role, payload.data)}
    </section>
  );
}
