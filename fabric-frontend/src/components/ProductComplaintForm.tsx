import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitComplaint } from '../api/complaintService';
import { dispatchNotificationsUpdated } from '../api/notificationService';
import {
  COMPLAINT_CATEGORY_KEYS,
  COMPLAINT_CATEGORY_LABELS,
  type ComplaintCategory,
} from '../constants/complaintCategories';
import { Alert } from './Alert';
import { Button } from './Button';

const MIN_MESSAGE_LENGTH = 10;

type Props = {
  productId: string;
  productName?: string | null;
  className?: string;
};

export function ProductComplaintForm({ productId, productName, className }: Props) {
  const { user } = useAuth();
  const [category, setCategory] = useState<ComplaintCategory>(COMPLAINT_CATEGORY_KEYS[0]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (message.trim().length < MIN_MESSAGE_LENGTH) {
      setError(`Please describe the issue in at least ${MIN_MESSAGE_LENGTH} characters.`);
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await submitComplaint({
        productId,
        category,
        message: message.trim(),
      });
      setSuccess('Thank you. Your report has been sent to the product brand.');
      setSubmitted(true);
      setMessage('');
      if (user) dispatchNotificationsUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit report');
    } finally {
      setBusy(false);
    }
  };

  if (submitted && success) {
    return (
      <div className={className}>
        <Alert type="success">{success}</Alert>
        {user ? (
          <p className="mt-3 text-sm text-page-muted">
            You can track updates in{' '}
            <Link
              to="/my-reports"
              className="font-medium text-primary-700 hover:underline dark:text-primary-300"
            >
              My product reports
            </Link>
            {' '}
            and{' '}
            <Link
              to="/notifications"
              className="font-medium text-primary-700 hover:underline dark:text-primary-300"
            >
              Notifications
            </Link>
            .
          </p>
        ) : (
          <p className="mt-3 text-sm text-page-muted">
            Sign in to receive in-app updates if the brand reviews your report.
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={
        className ??
        'rounded-xl border border-amber-200/70 bg-amber-50/40 p-5 dark:border-amber-900/40 dark:bg-amber-950/20'
      }
    >
      <h3 className="text-lg font-semibold text-page-title">Report a product issue</h3>
      <p className="mt-1 text-sm text-page-muted">
        Reports are sent to the brand that registered this product.
        {productName ? (
          <>
            {' '}
            <span className="font-medium text-page-body">{productName}</span>
          </>
        ) : null}
      </p>
      <p className="mt-1 text-xs text-page-muted">
        For app feedback (not product issues), use{' '}
        <a href="/feedback" className="font-medium text-primary-700 hover:underline dark:text-primary-300">
          Feedback
        </a>
        .
      </p>

      {error && (
        <Alert type="error" className="mt-4">
          {error}
        </Alert>
      )}

      <form onSubmit={(e) => void onSubmit(e)} className="mt-4 space-y-4">
        <div>
          <label htmlFor="complaint-category" className="block text-sm font-medium text-page-label mb-1">
            Issue category
          </label>
          <select
            id="complaint-category"
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900"
            value={category}
            onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
            disabled={busy}
          >
            {COMPLAINT_CATEGORY_KEYS.map((key) => (
              <option key={key} value={key}>
                {COMPLAINT_CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="complaint-message" className="block text-sm font-medium text-page-label mb-1">
            What happened?
          </label>
          <textarea
            id="complaint-message"
            rows={4}
            required
            minLength={MIN_MESSAGE_LENGTH}
            maxLength={2000}
            placeholder="Describe the issue (e.g. suspected fake, expired batch, wrong ingredients label)…"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-900"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={busy}
          />
          <p className="mt-1 text-xs text-page-muted">Minimum {MIN_MESSAGE_LENGTH} characters.</p>
        </div>

        <Button type="submit" disabled={busy}>
          {busy ? 'Sending…' : 'Send report to brand'}
        </Button>
      </form>
    </div>
  );
}
