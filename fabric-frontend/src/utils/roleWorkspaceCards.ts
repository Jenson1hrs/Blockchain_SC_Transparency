import type { UserRole } from '../types';

/** Route + icon + i18n keys — never embed English copy here (see `i18n/strings.*.ts`). */
export type WorkspaceCard = {
  titleKey: string;
  descriptionKey: string;
  to: string;
  icon: string;
};

/** Role-based shortcuts shown on the signed-in home workspace (`/home`). */
export function roleWorkspaceCards(role: UserRole): WorkspaceCard[] {
  if (role === 'admin') {
    return [
      { titleKey: 'dash.admin.users.t', descriptionKey: 'dash.admin.users.d', to: '/admin/users', icon: '👥' },
      { titleKey: 'dash.admin.dist.t', descriptionKey: 'dash.admin.dist.d', to: '/admin/users', icon: '📊' },
      { titleKey: 'dash.admin.chain.t', descriptionKey: 'dash.admin.chain.d', to: '/admin/system', icon: '⛓️' },
      { titleKey: 'dash.admin.api.t', descriptionKey: 'dash.admin.api.d', to: '/admin/system', icon: '🛜' },
      { titleKey: 'dash.admin.db.t', descriptionKey: 'dash.admin.db.d', to: '/admin/system', icon: '🗄️' },
      { titleKey: 'dash.admin.audit.t', descriptionKey: 'dash.admin.audit.d', to: '/admin/audit', icon: '📜' },
      { titleKey: 'dash.admin.config.t', descriptionKey: 'dash.admin.config.d', to: '/admin/config', icon: '📝' },
    ];
  }
  if (role === 'manufacturer') {
    return [
      { titleKey: 'dash.mfg.create.t', descriptionKey: 'dash.mfg.create.d', to: '/create', icon: '➕' },
      { titleKey: 'dash.mfg.qr.t', descriptionKey: 'dash.mfg.qr.d', to: '/verify', icon: '📱' },
      { titleKey: 'dash.mfg.meta.t', descriptionKey: 'dash.mfg.meta.d', to: '/verify', icon: '📋' },
      { titleKey: 'dash.mfg.verify.t', descriptionKey: 'dash.mfg.verify.d', to: '/verify', icon: '✅' },
    ];
  }
  if (role === 'distributor') {
    return [
      { titleKey: 'dash.distributor.transfer.t', descriptionKey: 'dash.distributor.transfer.d', to: '/transfer', icon: '🚚' },
      { titleKey: 'dash.distributor.location.t', descriptionKey: 'dash.distributor.location.d', to: '/location', icon: '📍' },
      { titleKey: 'dash.distributor.verify.t', descriptionKey: 'dash.distributor.verify.d', to: '/verify', icon: '✅' },
      { titleKey: 'dash.distributor.history.t', descriptionKey: 'dash.distributor.history.d', to: '/verify', icon: '📜' },
    ];
  }
  if (role === 'retailer') {
    return [
      { titleKey: 'dash.retailer.transfer.t', descriptionKey: 'dash.retailer.transfer.d', to: '/transfer', icon: '🏪' },
      { titleKey: 'dash.retailer.location.t', descriptionKey: 'dash.retailer.location.d', to: '/location', icon: '📍' },
      { titleKey: 'dash.retailer.verify.t', descriptionKey: 'dash.retailer.verify.d', to: '/verify', icon: '✅' },
      { titleKey: 'dash.retailer.history.t', descriptionKey: 'dash.retailer.history.d', to: '/verify', icon: '📜' },
    ];
  }
  return [
    { titleKey: 'dash.cons.verify.t', descriptionKey: 'dash.cons.verify.d', to: '/verify', icon: '✅' },
    { titleKey: 'dash.cons.inventory.t', descriptionKey: 'dash.cons.inventory.d', to: '/inventory', icon: '📦' },
    { titleKey: 'dash.cons.expiring.t', descriptionKey: 'dash.cons.expiring.d', to: '/expiring', icon: '⏰' },
    { titleKey: 'dash.cons.profile.t', descriptionKey: 'dash.cons.profile.d', to: '/profile', icon: '⚙️' },
  ];
}
