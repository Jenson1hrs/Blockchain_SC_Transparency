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
    ];
  }
  if (role === 'regulator') {
    return [
      {
        titleKey: 'dash.regulator.orgs.t',
        descriptionKey: 'dash.regulator.orgs.d',
        to: '/regulator/organizations',
        icon: '🏛️',
      },
      {
        titleKey: 'dash.regulator.products.t',
        descriptionKey: 'dash.regulator.products.d',
        to: '/regulator/products',
        icon: '🔍',
      },
      {
        titleKey: 'dash.regulator.transparency.t',
        descriptionKey: 'dash.regulator.transparency.d',
        to: '/regulator/transparency',
        icon: '📊',
      },
      { titleKey: 'dash.regulator.verify.t', descriptionKey: 'dash.regulator.verify.d', to: '/verify', icon: '✅' },
    ];
  }
  if (role === 'manufacturer') {
    return [
      { titleKey: 'dash.mfg.create.t', descriptionKey: 'dash.mfg.create.d', to: '/create', icon: '➕' },
      { titleKey: 'dash.mfg.products.t', descriptionKey: 'dash.mfg.products.d', to: '/my-products', icon: '📦' },
      { titleKey: 'dash.mfg.transfer.t', descriptionKey: 'dash.mfg.transfer.d', to: '/transfer', icon: '🚚' },
      { titleKey: 'dash.mfg.trace.t', descriptionKey: 'dash.mfg.trace.d', to: '/verify', icon: '🔍' },
    ];
  }
  if (role === 'distributor') {
    return [
      { titleKey: 'nav.assignedProducts', descriptionKey: 'assignedProducts.subtitleDistributor', to: '/assigned-products', icon: '📦' },
      { titleKey: 'dash.distributor.inbound.t', descriptionKey: 'dash.distributor.inbound.d', to: '/transfer', icon: '📥' },
      { titleKey: 'dash.distributor.transfer.t', descriptionKey: 'dash.distributor.transfer.d', to: '/transfer', icon: '🚚' },
      { titleKey: 'dash.distributor.location.t', descriptionKey: 'dash.distributor.location.d', to: '/location', icon: '📍' },
      { titleKey: 'dash.distributor.verify.t', descriptionKey: 'dash.distributor.verify.d', to: '/verify', icon: '✅' },
    ];
  }
  if (role === 'retailer') {
    return [
      { titleKey: 'nav.retailStock', descriptionKey: 'retailStock.subtitle', to: '/assigned-products', icon: '🏪' },
      { titleKey: 'dash.retailer.inbound.t', descriptionKey: 'dash.retailer.inbound.d', to: '/transfer', icon: '📥' },
      { titleKey: 'dash.retailer.expiring.t', descriptionKey: 'dash.retailer.expiring.d', to: '/expiring', icon: '⏰' },
      { titleKey: 'dash.retailer.location.t', descriptionKey: 'dash.retailer.location.d', to: '/location', icon: '📍' },
      { titleKey: 'dash.retailer.verify.t', descriptionKey: 'dash.retailer.verify.d', to: '/verify', icon: '✅' },
    ];
  }
  return [
    { titleKey: 'dash.cons.verify.t', descriptionKey: 'dash.cons.verify.d', to: '/verify', icon: '✅' },
    { titleKey: 'nav.myInventory', descriptionKey: 'dash.cons.inventory.d', to: '/inventory', icon: '📦' },
    { titleKey: 'dash.cons.expiring.t', descriptionKey: 'dash.cons.expiring.d', to: '/expiring', icon: '⏰' },
  ];
}
