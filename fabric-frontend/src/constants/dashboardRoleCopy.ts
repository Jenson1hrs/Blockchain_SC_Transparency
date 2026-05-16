import type { UserRole } from '../types';

/** Role-specific lead copy for the signed-in workspace (supervisor / demo). */
export const DASHBOARD_ROLE_HEADING: Record<UserRole, string> = {
  admin:
    'Monitor system users, platform health, and blockchain-backed product records.',
  regulator:
    'Oversee organization verification, product metadata quality, and platform transparency.',
  manufacturer:
    'Register authentic products and generate blockchain-backed QR codes.',
  distributor: 'Track product movement and update supply chain ownership.',
  retailer:
    'Verify received products and update final store-level product status.',
  consumer:
    'Verify product authenticity, manage inventory, and monitor expiry or safety alerts.',
};

export const ROLE_LABEL_PROFESSIONAL: Record<UserRole, string> = {
  admin: 'Administrator',
  regulator: 'Regulatory authority',
  manufacturer: 'Manufacturer',
  distributor: 'Distributor',
  retailer: 'Retailer',
  consumer: 'Consumer',
};
