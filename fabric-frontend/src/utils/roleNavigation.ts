import type { AuthUser } from '../types';

/** Primary workspace entry for the signed-in user, or public home for guests. */
export function homePathForUser(user: AuthUser | null | undefined): string {
  return user ? '/home' : '/';
}
