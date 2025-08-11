export default function PrivacyPage() {
  return (
    <main className="prose">
      <h1>Privacy Summary</h1>
      <p>This overview is informational and not legal advice.</p>
      <h2>Data We Collect</h2>
      <ul>
        <li>Account details and profile preferences.</li>
        <li>App telemetry such as copy slip events.</li>
        <li>Minimal logs for reliability.</li>
      </ul>
      <h2>Why We Collect It</h2>
      <ul>
        <li>To personalise suggestions and user experience.</li>
        <li>To improve product reliability and UX.</li>
      </ul>
      <h2>Retention</h2>
      <ul>
        <li>Profile data remains until you delete your account.</li>
        <li>Telemetry is aggregated.</li>
        <li>Logs are rotated regularly.</li>
      </ul>
      <h2>Your Rights</h2>
      <p>You may request an export or deletion of your data by emailing <a href="mailto:support@example.com">support@example.com</a>.</p>
      <h2>Security</h2>
      <p>Server-side secrets, row level security, and admin audit logs help protect your data.</p>
      <h2>Contact</h2>
      <p>Email <a href="mailto:support@example.com">support@example.com</a> with privacy questions.</p>
    </main>
  );
}
