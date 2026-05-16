import type { UserRole } from '../types';

/** i18n keys for read-only role hints on the profile page */
export const PROFILE_ROLE_HINT_KEY: Record<UserRole, string> = {
  admin: 'profile.roleHint.admin',
  regulator: 'profile.roleHint.regulator',
  manufacturer: 'profile.roleHint.manufacturer',
  distributor: 'profile.roleHint.distributor',
  retailer: 'profile.roleHint.retailer',
  consumer: 'profile.roleHint.consumer',
};

/** i18n keys for one-line workspace notes (supply-chain roles only) */
export const PROFILE_WORKSPACE_NOTE_KEY: Partial<Record<UserRole, string>> = {
  admin: 'profile.workspaceNote.admin',
  regulator: 'profile.workspaceNote.regulator',
  manufacturer: 'profile.workspaceNote.manufacturer',
  distributor: 'profile.workspaceNote.distributor',
  retailer: 'profile.workspaceNote.retailer',
};

export const PROFILE_SHELL_SUBTITLE_KEY: Record<UserRole, string> = {
  admin: 'profile.shellSubtitle.admin',
  regulator: 'profile.shellSubtitle.regulator',
  manufacturer: 'profile.shellSubtitle.manufacturer',
  distributor: 'profile.shellSubtitle.distributor',
  retailer: 'profile.shellSubtitle.retailer',
  consumer: 'profile.shellSubtitle.consumer',
};

export const PROFILE_PAGE_INTRO_KEY: Record<UserRole, string> = {
  admin: 'profile.pageIntro.admin',
  regulator: 'profile.pageIntro.regulator',
  manufacturer: 'profile.pageIntro.manufacturer',
  distributor: 'profile.pageIntro.distributor',
  retailer: 'profile.pageIntro.retailer',
  consumer: 'profile.pageIntro.consumer',
};

export function isConsumerRole(role: UserRole): boolean {
  return role === 'consumer';
}

const SUPPLY_CHAIN_ROLES: UserRole[] = ['manufacturer', 'distributor', 'retailer'];

export function isSupplyChainRole(role: UserRole): boolean {
  return SUPPLY_CHAIN_ROLES.includes(role);
}
