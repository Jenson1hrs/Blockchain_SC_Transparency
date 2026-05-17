import type { UserRole } from '../types';

/** Professional role label for headers and subtitles. */
export const ROLE_LABEL_PROFESSIONAL: Record<UserRole, string> = {
  admin: 'Platform Administrator',
  regulator: 'Regulatory Authority',
  manufacturer: 'Verified Manufacturer',
  distributor: 'Logistics Partner',
  retailer: 'Retail Operator',
  consumer: 'Consumer',
};

/** Signed-in home page title (AppShell). */
export const ROLE_WORKSPACE_TITLE: Record<UserRole, string> = {
  admin: 'Operations Dashboard',
  regulator: 'Compliance & Oversight',
  manufacturer: 'Manufacturing Workspace',
  distributor: 'Logistics Workspace',
  retailer: 'Retail Operations',
  consumer: 'Consumer Safety Hub',
};

/** One-line AppShell subtitle under the page title. */
export const ROLE_WORKSPACE_SUBTITLE: Record<UserRole, string> = {
  admin: 'Monitor platform health, user activity, and blockchain connectivity.',
  regulator: 'Govern supply-chain trust, organization verification, and transparency.',
  manufacturer: 'Register authentic products, issue QR codes, and release custody downstream.',
  distributor: 'Manage inbound and outbound custody with full traceability.',
  retailer: 'Prepare store inventory for verification and consumer transparency.',
  consumer: 'Verify authenticity, track personal inventory, and stay ahead of expiry risks.',
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
    'Oversee infrastructure health, user governance, and synchronized ledger activity across the platform.',
  regulator:
    'Review organization compliance, product metadata quality, and end-to-end supply-chain transparency.',
  manufacturer:
    'Establish product authenticity at origin, generate traceable QR codes, and transfer custody to distributors.',
  distributor:
    'Coordinate logistics between manufacturers and retailers with accountable inbound and outbound transfers.',
  retailer:
    'Maintain retail-ready custody, monitor expiry, and enable trustworthy verification before consumer purchase.',
  consumer:
    'Confirm product authenticity, manage a personal safety inventory, and receive expiry and dietary alerts.',
};

/** Context above role analytics grids. */
export const DASHBOARD_SUPPLY_CHAIN_HELPER: Partial<Record<UserRole, string>> = {
  admin:
    'Live operational metrics for users, products, API availability, database health, and Fabric gateway status.',
  regulator:
    'Oversight metrics for verified organizations, product metadata quality, and platform transparency indicators.',
  manufacturer:
    'Track registered products, outbound custody offers, and metadata completeness before release to the chain.',
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
  manufacturer: 'Production & custody',
  distributor: 'Logistics & transfers',
  retailer: 'Store operations',
  consumer: 'Personal safety',
};
