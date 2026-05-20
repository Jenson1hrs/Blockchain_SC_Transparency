import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { Button } from './Button';
import { ConfirmModal } from './ConfirmModal';
import { Toast } from './Toast';
import type {
  DashboardTransferRequestSummary,
  DistributorDashboardSummary,
  ManufacturerDashboardSummary,
  RetailerDashboardSummary,
} from '../types';
import {
  acceptTransferRequest,
  rejectTransferRequest,
} from '../api/transferRequestService';
import { ManufacturerBrandDashboard } from './ManufacturerBrandDashboard';

function SectionHeading({ title, helper }: { title: string; helper?: string }) {
  return (
    <div className="md:col-span-2 xl:col-span-3 space-y-1 pt-2">
      <h4 className="text-base font-semibold text-page-title">{title}</h4>
      {helper ? (
        <p className="text-sm text-page-muted max-w-3xl leading-relaxed">{helper}</p>
      ) : null}
    </div>
  );
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
  tone: 'primary' | 'success' | 'warning' | 'neutral' | 'danger';
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const toneIconWrap: Record<string, string> = {
    primary: 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300',
    success: 'bg-success-100 text-success-600 dark:bg-success-900/40 dark:text-success-300',
    warning: 'bg-warning-100 text-warning-600 dark:bg-warning-900/40 dark:text-warning-300',
    neutral: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700/80 dark:text-neutral-200',
    danger: 'bg-danger-100 text-danger-600 dark:bg-danger-900/40 dark:text-danger-300',
  };
  return (
    <div
      className={clsx(
        'card p-5 sm:p-6 flex flex-col gap-3 h-full min-h-[8.5rem] border-neutral-200/80 dark:border-neutral-600/80',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', toneIconWrap[tone])}>
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

function TransferStatusBadge({ status }: { status: DashboardTransferRequestSummary['status'] }) {
  const styles: Record<DashboardTransferRequestSummary['status'], string> = {
    pending: 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
    cancelled: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  };
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}

function TransferCountRow({ pending, accepted, rejected }: { pending: number; accepted: number; rejected: number }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-lg border border-amber-200/80 bg-amber-50/50 px-3 py-2 dark:border-amber-900/50 dark:bg-amber-950/20">
        <p className="text-xs text-page-muted">Pending</p>
        <p className="text-xl font-bold tabular-nums">{pending}</p>
      </div>
      <div className="rounded-lg border border-green-200/80 bg-green-50/50 px-3 py-2 dark:border-green-900/50 dark:bg-green-950/20">
        <p className="text-xs text-page-muted">Accepted</p>
        <p className="text-xl font-bold tabular-nums">{accepted}</p>
      </div>
      <div className="rounded-lg border border-red-200/80 bg-red-50/50 px-3 py-2 dark:border-red-900/50 dark:bg-red-950/20">
        <p className="text-xs text-page-muted">Rejected</p>
        <p className="text-xl font-bold tabular-nums">{rejected}</p>
      </div>
    </div>
  );
}

export function TransferRequestTable({
  requests,
  direction,
  showIncomingActions,
  onRefresh,
}: {
  requests: DashboardTransferRequestSummary[];
  direction: 'inbound' | 'outbound';
  showIncomingActions?: boolean;
  onRefresh?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<'accept' | 'reject' | null>(null);
  const [activeRequest, setActiveRequest] = useState<DashboardTransferRequestSummary | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (requests.length === 0) {
    return <p className="text-sm text-page-muted">No requests yet.</p>;
  }

  const closeModal = () => {
    if (loading) return;
    setModal(null);
    setActiveRequest(null);
    setRejectReason('');
  };

  const confirmAccept = async () => {
    if (!activeRequest) return;
    setLoading(true);
    setActionError(null);
    try {
      await acceptTransferRequest(activeRequest.id);
      setModal(null);
      setToast({
        message: `Accepted ${activeRequest.productId}. Blockchain ownership updated.`,
        type: 'success',
      });
      setActiveRequest(null);
      onRefresh?.();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Accept failed');
      setModal(null);
    } finally {
      setLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!activeRequest) return;
    setLoading(true);
    setActionError(null);
    try {
      await rejectTransferRequest(activeRequest.id, rejectReason.trim() || undefined);
      setModal(null);
      setToast({
        message: `Rejected transfer for ${activeRequest.productId}.`,
        type: 'success',
      });
      setActiveRequest(null);
      setRejectReason('');
      onRefresh?.();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Reject failed');
      setModal(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <ConfirmModal
        isOpen={modal === 'accept' && activeRequest !== null}
        variant="success"
        title="Accept transfer?"
        description="By accepting this transfer, your organization becomes responsible for this product. This action will update the blockchain ownership record."
        confirmText="Accept"
        cancelText="Cancel"
        loading={loading}
        onConfirm={() => void confirmAccept()}
        onCancel={closeModal}
      >
        {activeRequest && (
          <p className="text-sm font-medium">
            {activeRequest.productName || activeRequest.productId}{' '}
            <span className="text-page-muted">from {activeRequest.fromOrgName}</span>
          </p>
        )}
      </ConfirmModal>

      <ConfirmModal
        isOpen={modal === 'reject' && activeRequest !== null}
        variant="warning"
        title="Reject transfer?"
        description="The sender retains custody. On-chain ownership is unchanged."
        confirmText="Reject"
        cancelText="Cancel"
        loading={loading}
        onConfirm={() => void confirmReject()}
        onCancel={closeModal}
      >
        <label className="block text-sm font-medium text-page-label">
          Rejection reason (optional)
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={2}
            className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
          />
        </label>
      </ConfirmModal>

      {actionError && <p className="text-sm text-red-700 dark:text-red-300">{actionError}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700 text-page-muted">
              <th className="py-2 pr-3">Product</th>
              <th className="py-2 pr-3">From</th>
              <th className="py-2 pr-3">To</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Created</th>
              <th className="py-2 pr-3">Responded</th>
              {showIncomingActions && <th className="py-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id} className="border-b border-neutral-100 dark:border-neutral-800/80">
                <td className="py-2 pr-3">
                  <span className="font-medium block">{req.productName || req.productId}</span>
                  <span className="font-mono text-xs text-page-muted">{req.productId}</span>
                </td>
                <td className="py-2 pr-3">{req.fromOrgName}</td>
                <td className="py-2 pr-3">{req.toOrgName}</td>
                <td className="py-2 pr-3">
                  <TransferStatusBadge status={req.status} />
                </td>
                <td className="py-2 pr-3 text-xs whitespace-nowrap">
                  {req.createdAt ? new Date(req.createdAt).toLocaleString() : '—'}
                </td>
                <td className="py-2 pr-3 text-xs whitespace-nowrap">
                  {req.respondedAt ? new Date(req.respondedAt).toLocaleString() : '—'}
                </td>
                {showIncomingActions && (
                  <td className="py-2">
                    {req.status === 'pending' && direction === 'inbound' ? (
                      
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          disabled={loading}
                          onClick={() => {
                            setActiveRequest(req);
                            setModal('accept');
                          }}
                        >
                          Accept
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={loading}
                          onClick={() => {
                            setActiveRequest(req);
                            setRejectReason('');
                            setModal('reject');
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-page-muted">
        <Link to="/transfer" className="text-primary-600 hover:underline dark:text-primary-400">
          Open transfer workspace
        </Link>
      </p>
    </div>
  );
}

const iconBox = (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);
const iconTruck = (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4v11h9zM13 16h4l4-4V6h-4" />
  </svg>
);
const iconLayers = (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
  </svg>
);
const iconRefresh = (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const iconMap = (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);
const iconStore = (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);
const iconClock = (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export function ManufacturerSupplyChainAnalytics({ data }: { data: ManufacturerDashboardSummary }) {
  return <ManufacturerBrandDashboard data={data} />;
}

export function DistributorSupplyChainAnalytics({
  data,
  onRefresh,
}: {
  data: DistributorDashboardSummary;
  onRefresh?: () => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <SectionHeading title="Inbound transfers" helper="Shipments offered to your organization from manufacturers." />
      <AnalyticsCard title="Inbound Transfers" description="Offers awaiting or completed for you." tone="primary" icon={iconTruck} className="md:col-span-2 xl:col-span-2">
        <TransferCountRow pending={data.inboundPendingCount} accepted={data.inboundAcceptedCount} rejected={data.inboundRejectedCount} />
      </AnalyticsCard>
      <AnalyticsCard title="Recent Inbound Requests" description="Latest offers to accept or reject." tone="success" icon={iconRefresh} className="md:col-span-2 xl:col-span-3">
        <TransferRequestTable requests={data.recentInboundRequests} direction="inbound" showIncomingActions onRefresh={onRefresh} />
      </AnalyticsCard>
      <SectionHeading title="Outbound transfers" helper="Forward accepted inventory to retailer partners." />
      <AnalyticsCard title="Outbound Transfers" description="Requests you sent." tone="warning" icon={iconTruck} className="md:col-span-2 xl:col-span-2">
        <TransferCountRow pending={data.outboundPendingCount} accepted={data.outboundAcceptedCount} rejected={data.outboundRejectedCount} />
      </AnalyticsCard>
      <AnalyticsCard title="Recent Outbound Requests" description="Latest transfers you initiated." tone="neutral" icon={iconRefresh} className="md:col-span-2 xl:col-span-3">
        <TransferRequestTable requests={data.recentOutboundRequests} direction="outbound" />
      </AnalyticsCard>
      <SectionHeading title="Products currently held" helper="Products where you are current owner after accepted transfers." />
      <AnalyticsCard title="Currently Held" description="Assigned to your distributor account." tone="primary" icon={iconBox}>
        <BigNumber>{data.currentlyHeldCount}</BigNumber>
      </AnalyticsCard>
      <AnalyticsCard title="In Transit" description="Held products in transit." tone="warning" icon={iconTruck}>
        <BigNumber>{data.inTransitCount}</BigNumber>
      </AnalyticsCard>
      <AnalyticsCard title="Products by Location" description="Held inventory by location." tone="neutral" icon={iconMap} className="md:col-span-2 xl:col-span-3">
        {data.productsByLocation.length === 0 ? (
          <p className="text-sm text-page-muted">No locations recorded.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.productsByLocation.slice(0, 12).map((row) => (
              <li key={row.location} className="flex justify-between gap-2 rounded-lg border px-3 py-2 text-sm dark:border-neutral-600">
                <span className="truncate font-medium">{row.location}</span>
                <span className="tabular-nums text-page-muted">{row.count}</span>
              </li>
            ))}
          </ul>
        )}
      </AnalyticsCard>
    </div>
  );
}

export function RetailerSupplyChainAnalytics({
  data,
  onRefresh,
}: {
  data: RetailerDashboardSummary;
  onRefresh?: () => void;
}) {
  const entries = Object.entries(data.productsByStatus).sort((a, b) => b[1] - a[1]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <SectionHeading title="Inbound transfers" />
      <AnalyticsCard title="Inbound Transfers" description="Pending, accepted, rejected offers." tone="primary" icon={iconTruck} className="md:col-span-2 xl:col-span-2">
        <TransferCountRow pending={data.inboundPendingCount} accepted={data.inboundAcceptedCount} rejected={data.inboundRejectedCount} />
      </AnalyticsCard>
      <AnalyticsCard title="Recent Inbound Requests" description="Latest offers to your organization." tone="success" icon={iconRefresh} className="md:col-span-2 xl:col-span-3">
        <TransferRequestTable requests={data.recentInboundRequests} direction="inbound" showIncomingActions onRefresh={onRefresh} />
      </AnalyticsCard>
      <SectionHeading title="Store products" helper="Inventory in retail custody after accepted inbound transfers." />
      <AnalyticsCard title="Products In Store" description="Blockchain custody at your retailer account." tone="primary" icon={iconStore}>
        <BigNumber>{data.currentlyHeldCount}</BigNumber>
      </AnalyticsCard>
      <AnalyticsCard title="Expiring Soon" description="Within 7 days." tone="warning" icon={iconClock}>
        <BigNumber>{data.expiringSoonCount}</BigNumber>
      </AnalyticsCard>
      <AnalyticsCard title="Expired Products" description="Past expiry date in store custody." tone="danger" icon={iconClock}>
        <BigNumber>{data.expiredCount}</BigNumber>
      </AnalyticsCard>
      <AnalyticsCard title="Ready for Sale" description="Retail-ready statuses." tone="success" icon={iconStore}>
        <BigNumber>{data.readyForSaleCount}</BigNumber>
      </AnalyticsCard>
      <AnalyticsCard
        title="Metadata & Safety Warnings"
        description="Incomplete metadata or expiry within 7 days on held products."
        tone="warning"
        icon={iconLayers}
      >
        <BigNumber>{(data.metadataWarningCount ?? 0) + (data.expiringOrExpiredWarningCount ?? 0)}</BigNumber>
        <p className="mt-2 text-xs text-page-muted">
          {data.metadataWarningCount ?? 0} metadata · {data.expiringOrExpiredWarningCount ?? 0} expiry
        </p>
      </AnalyticsCard>
      <AnalyticsCard title="Products by Status" description="Held inventory by status." tone="neutral" icon={iconLayers} className="md:col-span-2 xl:col-span-3">
        {entries.length === 0 ? (
          <p className="text-sm text-page-muted">No held products yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {entries.map(([status, count]) => (
              <li key={status} className="inline-flex gap-2 rounded-lg border px-3 py-1.5 text-sm dark:border-neutral-600">
                <span className="font-medium">{status}</span>
                <span className="tabular-nums text-page-muted">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </AnalyticsCard>
    </div>
  );
}
