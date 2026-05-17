import { useState, type FormEvent } from 'react';
import { InfoPageLayout } from '../components/InfoPageLayout';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { LikertScale } from '../components/LikertScale';
import { FEEDBACK_CATEGORIES } from '../constants/supportCopy';
import {
  LIKERT_QUESTIONS,
  type LikertResponses,
  type LikertValue,
} from '../constants/likertQuestions';
import { submitFeedback } from '../api/feedbackService';

export default function FeedbackPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState<string>(FEEDBACK_CATEGORIES[0]);
  const [likert, setLikert] = useState<Record<string, LikertValue | null>>(() => {
    const init: Record<string, LikertValue | null> = {};
    for (const q of LIKERT_QUESTIONS) init[q.id] = null;
    return init;
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const allAnswered = LIKERT_QUESTIONS.every((q) => likert[q.id] != null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!allAnswered) {
      setError('Please answer all five survey questions.');
      return;
    }
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const responses: LikertResponses = {};
      for (const q of LIKERT_QUESTIONS) {
        responses[q.id] = likert[q.id] as LikertValue;
      }
      await submitFeedback({
        category,
        likertResponses: responses,
        message: message.trim(),
        role: user?.role,
      });
      setSuccess('Thank you. Your feedback helps us improve VeriChain.');
      setMessage('');
      const reset: Record<string, LikertValue | null> = {};
      for (const q of LIKERT_QUESTIONS) reset[q.id] = null;
      setLikert(reset);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit feedback');
    } finally {
      setBusy(false);
    }
  };

  return (
    <InfoPageLayout
      title="Feedback"
      subtitle="Rate your experience with VeriChain. All survey questions are required."
    >
      <div className="card overflow-hidden p-6 md:p-8">
        {user && (
          <p className="mb-6 text-sm text-page-muted">
            Signed in as <span className="font-medium capitalize">{user.role}</span>
            {user.name ? ` · ${user.name}` : ''}
          </p>
        )}

        {success && <Alert type="success" className="mb-6">{success}</Alert>}
        {error && <Alert type="error" className="mb-6">{error}</Alert>}

        <form onSubmit={(e) => void onSubmit(e)} className="space-y-8">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-page-label">Category</label>
            <select
              className="w-full max-w-md rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {FEEDBACK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-6 rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-5 dark:border-neutral-600/50 dark:bg-neutral-900/40">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-page-muted">
              Experience survey
            </h2>
            {LIKERT_QUESTIONS.map((q, index) => (
              <div
                key={q.id}
                className="rounded-xl border border-neutral-200/70 bg-white/90 p-4 dark:border-neutral-600/50 dark:bg-neutral-800/80"
              >
                <p className="mb-3 text-sm font-medium text-page-heading">
                  {index + 1}. {q.text}
                </p>
                <LikertScale
                  name={q.id}
                  value={likert[q.id]}
                  onChange={(v) => setLikert((prev) => ({ ...prev, [q.id]: v }))}
                  disabled={busy}
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-page-label">
              Additional comments <span className="font-normal text-page-muted">(optional)</span>
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              placeholder="Anything else you would like us to know?"
            />
          </div>

          <Button type="submit" loading={busy} loadingText="Submitting…" disabled={!allAnswered || busy}>
            Submit feedback
          </Button>
        </form>
      </div>
    </InfoPageLayout>
  );
}
