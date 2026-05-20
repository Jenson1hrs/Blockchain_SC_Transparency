import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { fetchSupplyChainUsers, type SupplyChainUser } from '../api/userService';
import {
  createTransferRequest,
  fetchIncomingTransferRequests,
  fetchOutgoingTransferRequests,
  acceptTransferRequest,
  rejectTransferRequest,
} from '../api/transferRequestService';
import type { TransferRequest, UserRole } from '../types';
import AppShell from '../components/AppShell';
import { Button, ConfirmModal, Toast } from '../components';
import {
  TransferProductIdPreview,
  TransferProductSummaryBlock,
  type ProductIdPreviewStatus,
} from '../components/ProductLookupPreview';
import type { Product } from '../types';
import {
  VerificationBadge,
  OrganizationFlaggedBadge,
  VerifiedOrganizationBadge,
} from '../components/VerificationBadge';
import { useAuth } from '../context/AuthContext';
import { useRolePageMeta } from '../hooks/useRolePageMeta';

const OUTBOUND_TRANSFER_ROLES: UserRole[] = ['manufacturer', 'distributor'];
const RECIPIENT_ROLE_FOR_SENDER: Partial<Record<UserRole, UserRole>> = {
  manufacturer: 'distributor',
  distributor: 'retailer',
};

type ModalKind = 'send' | 'accept' | 'reject' | null;

function StatusBadge({ status }: { status: TransferRequest['status'] }) {
  const styles: Record<TransferRequest['status'], string> = {
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

const TransferProduct = () => {
  const { user } = useAuth();
  const pageMeta = useRolePageMeta('transfer', 'distributor');
  const canSendOutbound = Boolean(user?.role && OUTBOUND_TRANSFER_ROLES.includes(user.role));
  const defaultRecipientRole = user?.role ? RECIPIENT_ROLE_FOR_SENDER[user.role] : undefined;
  const [productId, setProductId] = useState('');
  const [message, setMessage] = useState('');
  const [recipientQuery, setRecipientQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>(defaultRecipientRole ?? '');
  const [recipients, setRecipients] = useState<SupplyChainUser[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<SupplyChainUser | null>(null);
  const [searchingRecipients, setSearchingRecipients] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<TransferRequest[]>([]);
  const [outgoing, setOutgoing] = useState<TransferRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [modal, setModal] = useState<ModalKind>(null);
  const [activeRequest, setActiveRequest] = useState<TransferRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [previewStatus, setPreviewStatus] = useState<ProductIdPreviewStatus>('idle');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  const canSubmitTransfer =
    previewStatus === 'found' &&
    Boolean(selectedRecipient) &&
    !loading;

  const loadRecipients = useCallback(async () => {
    setSearchingRecipients(true);
    try {
      const rows = await fetchSupplyChainUsers(recipientQuery, roleFilter || undefined);
      setRecipients(rows.filter((u) => u.id !== user?.id));
    } catch {
      setRecipients([]);
    } finally {
      setSearchingRecipients(false);
    }
  }, [recipientQuery, roleFilter, user?.id]);

  const loadRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const [inc, out] = await Promise.all([
        fetchIncomingTransferRequests(),
        fetchOutgoingTransferRequests(),
      ]);
      setIncoming(inc);
      setOutgoing(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load transfer requests');
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRecipients(), 300);
    return () => window.clearTimeout(timer);
  }, [loadRecipients]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    if (defaultRecipientRole) {
      setRoleFilter(defaultRecipientRole);
    }
  }, [defaultRecipientRole]);

  const closeModal = () => {
    if (loading) return;
    setModal(null);
    setActiveRequest(null);
    setRejectReason('');
  };

  const handlePreviewChange = useCallback(
    (s: ProductIdPreviewStatus, p: Product | null) => {
      setPreviewStatus(s);
      setPreviewProduct(p);
    },
    [],
  );

  const openSendModal = (e: FormEvent) => {
    e.preventDefault();
    if (!productId.trim()) {
      setError('Product ID is required');
      return;
    }
    if (previewStatus === 'loading') {
      setError('Wait for product details to load, then confirm the product is correct');
      return;
    }
    if (previewStatus !== 'found' || !previewProduct) {
      setError(
        previewStatus === 'not_owner'
          ? 'This product is not under your organization’s custody'
          : 'Enter a valid product ID and confirm the preview matches your item',
      );
      return;
    }
    if (!selectedRecipient) {
      setError('Select a recipient organization from the list');
      return;
    }
    setError(null);
    setModal('send');
  };

  const confirmSend = async () => {
    if (!selectedRecipient) return;
    setLoading(true);
    setError(null);
    try {
      await createTransferRequest(productId.trim(), selectedRecipient.id, message.trim() || undefined);
      setModal(null);
      setToast({
        message: 'Transfer request sent. Waiting for the recipient to accept.',
        type: 'success',
      });
      setSelectedRecipient(null);
      setRecipientQuery('');
      setMessage('');
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
      setModal(null);
    } finally {
      setLoading(false);
    }
  };

  const confirmAccept = async () => {
    if (!activeRequest) return;
    setLoading(true);
    setError(null);
    try {
      await acceptTransferRequest(activeRequest.id);
      setModal(null);
      setToast({
        message: `Accepted custody for ${activeRequest.productId}. On-chain ownership has been updated.`,
        type: 'success',
      });
      setActiveRequest(null);
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Accept failed');
      setModal(null);
    } finally {
      setLoading(false);
    }
  };

  const confirmReject = async () => {
    if (!activeRequest) return;
    setLoading(true);
    setError(null);
    try {
      await rejectTransferRequest(activeRequest.id, rejectReason.trim() || undefined);
      setModal(null);
      setToast({
        message: `Rejected transfer for ${activeRequest.productId}. Ownership is unchanged.`,
        type: 'success',
      });
      setActiveRequest(null);
      setRejectReason('');
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reject failed');
      setModal(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title={pageMeta.title} subtitle={pageMeta.subtitle}>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <ConfirmModal
        isOpen={modal === 'send'}
        variant="info"
        title="Send transfer request?"
        description="Ownership remains under your organization until the recipient accepts. The product will not move on-chain until then."
        confirmText="Send request"
        cancelText="Cancel"
        loading={loading}
        onConfirm={() => void confirmSend()}
        onCancel={closeModal}
      >
        <div className="space-y-3 text-sm">
          {previewProduct ? (
            <TransferProductSummaryBlock product={previewProduct} />
          ) : (
            <p>
              <span className="text-page-muted">Product:</span>{' '}
              <span className="font-mono font-medium">{productId.trim()}</span>
            </p>
          )}
          <p className="pt-2 border-t border-neutral-200/80 dark:border-neutral-600">
            <span className="text-page-muted">To:</span>{' '}
            <span className="font-medium">{selectedRecipient?.displayName}</span>
          </p>
        </div>
      </ConfirmModal>

      <ConfirmModal
        isOpen={modal === 'accept' && activeRequest !== null}
        variant="success"
        title="Accept transfer?"
        description="By accepting this transfer, your organization becomes responsible for this product. This action will update the blockchain ownership record."
        confirmText="Accept transfer"
        cancelText="Cancel"
        loading={loading}
        onConfirm={() => void confirmAccept()}
        onCancel={closeModal}
      >
        {activeRequest && (
          <div className="rounded-lg border border-neutral-200/80 bg-neutral-50/80 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800/50">
            <p className="font-medium">{activeRequest.productName || activeRequest.productId}</p>
            <p className="text-page-muted mt-1">
              From <strong>{activeRequest.fromOrgName}</strong>
            </p>
          </div>
        )}
      </ConfirmModal>

      <ConfirmModal
        isOpen={modal === 'reject' && activeRequest !== null}
        variant="warning"
        title="Reject transfer?"
        description="The sender will keep custody. Ownership and on-chain records stay with the sending organization."
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
            rows={3}
            placeholder="e.g. Shipment documentation incomplete"
            className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-50"
          />
        </label>
      </ConfirmModal>

      <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
        
        {user?.role === 'retailer' ? (
          <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 dark:border-amber-800/60 dark:bg-amber-950/30 dark:text-amber-100">
            Review incoming transfer requests and accept products into retail custody.
          </div>
        ) : (
          <div className="rounded-lg border border-primary-200 bg-primary-50/80 px-4 py-3 text-sm text-primary-900 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-100">
            Ownership changes only after the receiving organization accepts the transfer.
          </div>
        )}

        {canSendOutbound ? (
        <form onSubmit={openSendModal} className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-page-title">Send transfer request</h2>
          <p className="text-sm text-page-muted">
            {user?.role === 'manufacturer'
              ? 'Send custody to distributors only (Manufacturer → Distributor).'
              : 'Forward custody to retailers only (Distributor → Retailer).'}
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-1">
              Product ID
            </label>
            <input
              type="text"
              required
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="e.g. P-A1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-neutral-900 dark:border-neutral-600"
              autoComplete="off"
              spellCheck={false}
            />
            <TransferProductIdPreview
              productId={productId}
              currentUserId={user?.id}
              onPreviewChange={handlePreviewChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-1">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="Shipment reference, expected delivery window…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-neutral-900 dark:border-neutral-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-1">
              Recipient organization
            </label>
            
            <div className="flex flex-wrap gap-2 mb-2">
              <input
                type="search"
                value={recipientQuery}
                onChange={(e) => setRecipientQuery(e.target.value)}
                placeholder="Search by name, company, or email"
                className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg dark:bg-neutral-900 dark:border-neutral-600"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
                className="px-3 py-2 border border-gray-300 rounded-lg dark:bg-neutral-900 dark:border-neutral-600"
              >
                <option value="">All roles</option>
                {(defaultRecipientRole ? [defaultRecipientRole] : OUTBOUND_TRANSFER_ROLES).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {selectedRecipient && (
              <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-primary-200 bg-primary-50/80 px-3 py-2 text-sm dark:border-primary-800 dark:bg-primary-950/40">
                <span className="font-medium">{selectedRecipient.displayName}</span>
                <span className="text-page-muted capitalize">({selectedRecipient.role})</span>
                {selectedRecipient.organizationVerified && <VerifiedOrganizationBadge />}
                {selectedRecipient.organizationFlagged && <OrganizationFlaggedBadge />}
                <button
                  type="button"
                  className="ml-auto text-xs text-primary-700 hover:underline dark:text-primary-300"
                  onClick={() => setSelectedRecipient(null)}
                >
                  Clear
                </button>
              </div>
            )}

            <div className="max-h-40 overflow-y-auto rounded-lg border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-100 dark:divide-neutral-800">
              {searchingRecipients && <p className="p-3 text-sm text-page-muted">Searching…</p>}
              {!searchingRecipients && recipients.length === 0 && (
                <p className="p-3 text-sm text-page-muted">No matching organizations</p>
              )}
              {recipients.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setSelectedRecipient(u)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800/80 ${
                    selectedRecipient?.id === u.id ? 'bg-primary-50 dark:bg-primary-950/30' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{u.displayName}</span>
                    <span className="text-xs text-page-muted capitalize">{u.role}</span>
                    {u.organizationVerified && <VerificationBadge verified />}
                    {u.organizationFlagged && <OrganizationFlaggedBadge />}
                  </div>
                </button>
              ))}
            </div>
            
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm dark:bg-red-950/40 dark:border-red-900 dark:text-red-300">
              {error}
            </div>
          )}

          <Button type="submit" disabled={!canSubmitTransfer} className="w-full">
            Send transfer request
          </Button>
          {productId.trim() && previewStatus !== 'found' && previewStatus !== 'loading' && (
            <p className="text-xs text-center text-page-muted">
              Confirm the product preview above before sending.
            </p>
          )}
        </form>
        ) : null}

        <section className="card p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-page-title">Incoming requests</h2>
            <Button type="button" variant="secondary" size="sm" onClick={() => void loadRequests()} disabled={loadingRequests}>
              Refresh
            </Button>
          </div>
          {loadingRequests && incoming.length === 0 && (
            <p className="text-sm text-page-muted">Loading…</p>
          )}
          {!loadingRequests && incoming.length === 0 && (
            <p className="text-sm text-page-muted">No incoming transfer requests.</p>
          )}
          <ul className="space-y-4">
            {incoming.map((req) => (
              <li
                key={req.id}
                className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-page-title">
                      {req.productName || req.productId}{' '}
                      <span className="font-mono text-sm text-page-muted">({req.productId})</span>
                    </p>
                    <p className="text-sm text-page-muted mt-1">
                      From <strong>{req.fromOrgName}</strong> → <strong>{req.toOrgName}</strong>
                    </p>
                    {req.message && (
                      <p className="text-sm text-page-muted mt-1">Message: {req.message}</p>
                    )}
                    <p className="text-xs text-page-muted mt-1">
                      Requested {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setActiveRequest(req);
                        setModal('accept');
                      }}
                      disabled={loading}
                    >
                      Accept
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setActiveRequest(req);
                        setRejectReason('');
                        setModal('reject');
                      }}
                      disabled={loading}
                    >
                      Reject
                    </Button>
                  </div>
                )}
                {req.status === 'rejected' && req.rejectionReason && (
                  <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                    Reason: {req.rejectionReason}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>

        {canSendOutbound && (
        <section className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-page-title">Outgoing requests</h2>
          {!loadingRequests && outgoing.length === 0 && (
            <p className="text-sm text-page-muted">No outgoing transfer requests.</p>
          )}
          <ul className="space-y-3">
            {outgoing.map((req) => (
              <li
                key={req.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 px-4 py-3 dark:border-neutral-700"
              >
                <div>
                  <p className="font-medium">
                    {req.productId} → {req.toOrgName}
                  </p>
                  <p className="text-xs text-page-muted">
                    Sent {new Date(req.createdAt).toLocaleString()}
                    {req.respondedAt &&
                      ` · Responded ${new Date(req.respondedAt).toLocaleString()}`}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </li>
            ))}
          </ul>
        </section>
        )}

        <p className="text-center text-sm text-page-muted">
          <Link to="/verify" className="text-primary-600 hover:underline dark:text-primary-400">
            Verify a product
          </Link>{' '}
          to review combined on-chain and workflow history after transfers.
        </p>
      </div>
    </AppShell>
  );
};

export default TransferProduct;
