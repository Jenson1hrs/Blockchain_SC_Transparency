import type { UserRole } from '../types';

/** Professional role label for headers and subtitles. */
export const ROLE_LABEL_PROFESSIONAL: Record<UserRole, string> = {
  admin: 'Platform Administrator',
  regulator: 'Regulatory Authority',
  manufacturer: 'Skincare brand / manufacturer',
  distributor: 'Distribution partner',
  retailer: 'Retail partner',
  consumer: 'Consumer',
};

/** Signed-in home page title (AppShell). */
export const ROLE_WORKSPACE_TITLE: Record<UserRole, string> = {
  admin: 'Operations Dashboard',
  regulator: 'Compliance & Oversight',
  manufacturer: 'Brand protection overview',
  distributor: 'Logistics Workspace',
  retailer: 'Retail Operations',
  consumer: 'Skincare verification hub',
};

/** One-line AppShell subtitle under the page title. */
export const ROLE_WORKSPACE_SUBTITLE: Record<UserRole, string> = {
  admin: 'Monitor platform health, user activity, and blockchain connectivity.',
  regulator: 'Govern supply-chain trust, organization verification, and transparency.',
  manufacturer:
    'Protect brand trust — monitor product trust, custody accountability, audit readiness, and consumer-facing metadata.',
  distributor: 'Support traceability with inbound and outbound custody and location updates.',
  retailer: 'Support traceability with retail custody, expiry monitoring, and pre-sale verification.',
  consumer: 'Scan QR codes to verify authenticity, review ingredients and expiry, and manage personal inventory.',
};

/** Trust-oriented badge shown on workspace hero and analytics banners. */
export const ROLE_TRUST_BADGE: Record<UserRole, string> = {
  admin: 'Platform Operations',
  regulator: 'Regulatory Oversight',
  manufacturer: 'Blockchain Registered',
  distributor: 'Logistics Tracking',
  retailer: 'Retail Readiness',
  consumer: 'Consumer Safety',
};

/** Primary mission statement in the workspace hero card. */
export const DASHBOARD_ROLE_HEADING: Record<UserRole, string> = {
  admin:
    'Support platform operation: monitor infrastructure health, user accounts, and blockchain connectivity.',
  regulator:
    'Support governance: review organization trust, product metadata quality, and platform transparency.',
  manufacturer:
    'See how your skincare brand is protected: registered products, trust metadata, QR readiness, custody, and distributor handoffs.',
  distributor:
    'Support accountable logistics between skincare brands and retailers with traceable transfers and location updates.',
  retailer:
    'Support store-level traceability, monitor expiry on shelf stock, and help consumers verify products before purchase.',
  consumer:
    'Scan QR codes to confirm authenticity, review expiry and ingredient safety, and save products to a personal inventory with alerts.',
};

/** Context above role analytics grids. */
export const DASHBOARD_SUPPLY_CHAIN_HELPER: Partial<Record<UserRole, string>> = {
  admin:
    'Live operational metrics for users, products, API availability, database health, and Fabric gateway status.',
  regulator:
    'Oversight metrics for verified organizations, product metadata quality, and platform transparency indicators.',
  manufacturer:
    'Brand protection metrics — catalogue health, pending transfers, expiring batches, and downstream custody.',
  distributor:
    'Monitor held inventory, location coverage, and pending inbound or outbound transfer requests.',
  retailer:
    'Review inbound shipments, in-store custody, expiry risk, and metadata gaps before consumer-facing sale.',
  consumer:
    'Personal inventory insights only — saving items does not change on-chain ownership or custody records.',
};

/** Short hint above quick-action cards. */
export const ROLE_QUICK_ACTIONS_HINT: Record<UserRole, string> = {
  admin: 'Administrative tools for monitoring, user management, and system verification.',
  regulator: 'Compliance workflows for organizations, products, and transparency reporting.',
  manufacturer: 'Register products, manage QR traceability, and initiate outbound transfers.',
  distributor: 'Handle custody transfers, update logistics locations, and verify shipments.',
  retailer: 'Accept inbound stock, update store locations, and verify before sale.',
  consumer: 'Scan or look up products, manage inventory, and review personalized safety alerts.',
};

/** Compact trust footer on the signed-in home workspace. */
export const WORKSPACE_FOOTER: Record<UserRole, string> = {
  admin:
    'VeriChain provides auditable infrastructure monitoring. Product records stay anchored on blockchain for tamper-evident traceability.',
  regulator:
    'Oversight tools support accountable supply chains. Organization and product reviews strengthen public trust without altering custody.',
  manufacturer:
    'Every registered product is blockchain-anchored. Custody transfers take effect only after the receiving party accepts.',
  distributor:
    'Transfer and location events build an accountable logistics trail. Verify any product to inspect combined on-chain and workflow history.',
  retailer:
    'Store custody ends at the retail layer. Consumers verify authenticity without becoming blockchain owners.',
  consumer:
    'Your saved inventory is private and off-chain. Verification connects you to the same transparent history retailers rely on.',
};

/** Role tagline in the global app footer. */
export const FOOTER_ROLE_TAGLINE: Record<UserRole, string> = WORKSPACE_FOOTER;

/** Role-specific analytics section title on home dashboard. */
export const ROLE_ANALYTICS_TITLE: Record<UserRole, string> = {
  admin: 'Platform analytics',
  regulator: 'Oversight analytics',
  manufacturer: 'Brand protection overview',
  distributor: 'Logistics & transfers',
  retailer: 'Store operations',
  consumer: 'Personal safety',
};
