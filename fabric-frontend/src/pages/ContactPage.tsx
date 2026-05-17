import { useState, type FormEvent } from 'react';
import { InfoPageLayout } from '../components/InfoPageLayout';
import { useAuth } from '../context/AuthContext';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Alert } from '../components/Alert';
import { CONTACT_ROLE_HELPERS } from '../constants/supportCopy';

export default function ContactPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [purpose, setPurpose] = useState(user?.role ?? '');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const roleHelper =
    user?.role && CONTACT_ROLE_HELPERS[user.role]
      ? CONTACT_ROLE_HELPERS[user.role]
      : 'Tell us how we can help with verification, traceability, or platform support.';

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    window.setTimeout(() => {
      setSubmitted(true);
      setBusy(false);
      setMessage('');
    }, 400);
  };

  return (
    <InfoPageLayout
      title="Contact"
      subtitle="Reach the VeriChain team for support or partnership questions."
    >
      <div className="grid gap-8 lg:grid-cols-5">
        <aside className="card overflow-hidden p-6 lg:col-span-2">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-2xl dark:bg-primary-950/50">
            ✉️
          </div>
          <h2 className="text-lg font-semibold text-page-heading">We are here to help</h2>
          <p className="mt-2 text-sm leading-relaxed text-page-body">{roleHelper}</p>
          <p className="mt-4 text-sm text-page-muted">
            Messages are reviewed by the platform team. Email delivery is not enabled in this
            prototype. You will see an on-screen confirmation after you submit.
          </p>
        </aside>

        <div className="card p-6 lg:col-span-3">
          {submitted ? (
            <Alert type="success">
              Thank you for contacting VeriChain. We have received your message.
            </Alert>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <TextField
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-page-label">Role / purpose</label>
                <select
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                >
                  <option value="">Select…</option>
                  <option value="consumer">Consumer</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="distributor">Distributor</option>
                  <option value="retailer">Retailer</option>
                  <option value="regulator">Regulator</option>
                  <option value="admin">Admin</option>
                  <option value="partner">Partner / other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-page-label">Message</label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                  placeholder="How can we help?"
                />
              </div>
              <Button type="submit" loading={busy} loadingText="Sending…">
                Send message
              </Button>
            </form>
          )}
        </div>
      </div>
    </InfoPageLayout>
  );
}
