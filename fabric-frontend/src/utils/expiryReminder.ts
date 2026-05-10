export interface ExpiryReminder {
  level: 'expired' | 'urgent' | 'warning' | 'safe';
  label: string;
  statusText: string;
  daysLeft: number;
  expiresOn: string;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getExpiryReminder(expiryDate?: string | null): ExpiryReminder | null {
  if (!expiryDate) return null;
  const exp = new Date(expiryDate);
  if (Number.isNaN(exp.getTime())) return null;

  const today = startOfDay(new Date());
  const expDay = startOfDay(exp);
  const diffMs = expDay.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (24 * 60 * 60 * 1000));

  if (daysLeft < 0) {
    return {
      level: 'expired',
      label: `Expired — expired ${Math.abs(daysLeft)} day(s) ago`,
      statusText: 'Expired',
      daysLeft,
      expiresOn: expDay.toISOString().slice(0, 10),
    };
  }
  if (daysLeft <= 3) {
    return {
      level: 'urgent',
      label: `Urgent — ${daysLeft} day(s) left`,
      statusText: 'Urgent',
      daysLeft,
      expiresOn: expDay.toISOString().slice(0, 10),
    };
  }
  if (daysLeft <= 7) {
    return {
      level: 'warning',
      label: `Expiring Soon — ${daysLeft} day(s) left`,
      statusText: 'Expiring Soon',
      daysLeft,
      expiresOn: expDay.toISOString().slice(0, 10),
    };
  }
  return {
    level: 'safe',
    label: `Safe — ${daysLeft} day(s) left`,
    statusText: 'Safe',
    daysLeft,
    expiresOn: expDay.toISOString().slice(0, 10),
  };
}
