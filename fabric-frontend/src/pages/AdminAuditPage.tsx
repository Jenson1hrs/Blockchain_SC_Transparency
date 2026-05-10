import AppShell from '../components/AppShell';

export default function AdminAuditPage() {
  return (
    <AppShell
      title="System audit & logs"
      subtitle="Placeholder for future audit trail and platform logs"
    >
      <div className="card p-8 text-center text-gray-600 animate-fade-up">
        <p className="mb-2">
          Audit and operational logs are not wired in this prototype. This screen reserves space for a
          future integration (e.g. structured logs, export, filters).
        </p>
      </div>
    </AppShell>
  );
}
