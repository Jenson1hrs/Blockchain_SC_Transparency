import type { AuthUser } from '../types';

/** Company profile fields shown on consumer verification pages. */
export function isManufacturerProfileComplete(user: AuthUser | null | undefined): boolean {
  if (!user || user.role !== 'manufacturer') return false;
  return Boolean(
    user.companyName?.trim() &&
      (user.companyDescription?.trim() ||
        user.companyLocation?.trim() ||
        user.companyWebsite?.trim() ||
        user.companyLogoUrl),
  );
}
