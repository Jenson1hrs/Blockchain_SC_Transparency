import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resolveOrganizationUserId } from '../api/organizationService';

type OrganizationLinkProps = {
  userId?: number | null;
  name: string;
  className?: string;
};

export function OrganizationLink({ userId, name, className }: OrganizationLinkProps) {
  const [resolvedId, setResolvedId] = useState<number | null>(userId ?? null);

  useEffect(() => {
    if (userId != null) {
      setResolvedId(userId);
      return;
    }
    let cancelled = false;
    void resolveOrganizationUserId(name).then((id) => {
      if (!cancelled) setResolvedId(id);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, name]);

  const label = name.trim() || 'Organization';
  if (resolvedId != null) {
    return (
      <Link
        to={`/organization/${resolvedId}`}
        className={
          className ??
          'font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline-offset-2 hover:underline'
        }
      >
        {label}
      </Link>
    );
  }
  return <span className={className ?? 'text-page-body'}>{label}</span>;
}
