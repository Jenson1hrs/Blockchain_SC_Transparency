import AppShell from '../components/AppShell';

export default function AdminConfigPage() {
  return (
    <AppShell
      title="System configuration"
      subtitle="Notes for operators (prototype)"
    >
      <div className="card p-6 space-y-4 text-sm text-gray-700 animate-fade-up leading-relaxed">
        <p>
          Environment-specific settings (connection profiles, wallet identities, channel and chaincode
          names) live on the API server and Fabric network hosts—not in this web app.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Backend uses <code className="bg-gray-100 px-1 rounded">connection.json</code> and the
            file-system wallet under the API project.
          </li>
          <li>
            Chaincode contract name and channel must match what peers endorse (see API Fabric config).
          </li>
          <li>For demo deployments, rotate JWT secrets and restrict CORS to known origins.</li>
        </ul>
      </div>
    </AppShell>
  );
}
