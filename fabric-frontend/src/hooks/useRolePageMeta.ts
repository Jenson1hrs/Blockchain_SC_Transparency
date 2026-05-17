import { useAuth } from '../context/AuthContext';
import { getRolePageMeta, type RolePageId } from '../constants/rolePageCopy';
import type { UserRole } from '../types';

export function useRolePageMeta(page: RolePageId, fallbackRole: UserRole = 'consumer') {
  const { user } = useAuth();
  return getRolePageMeta(user?.role ?? fallbackRole, page);
}
