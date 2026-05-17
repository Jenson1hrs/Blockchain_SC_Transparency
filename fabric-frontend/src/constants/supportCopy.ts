import type { UserRole } from '../types';

export const CONTACT_ROLE_HELPERS: Partial<Record<UserRole, string>> = {
  consumer:
    'Contact us about verification, inventory, or expiry reminders.',
  manufacturer:
    'Contact us about product registration, QR generation, or transfer requests.',
  distributor: 'Contact us about custody transfers or stock visibility.',
  retailer: 'Contact us about custody transfers or stock visibility.',
  regulator: 'Contact us about organization review and compliance oversight.',
  admin: 'Contact us about platform operations or system monitoring.',
};

export const FEEDBACK_CATEGORIES = [
  'Product verification',
  'QR scanning',
  'Inventory',
  'Expiry alerts',
  'Transfer workflow',
  'Regulator/organization review',
  'UI/UX',
  'Other',
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];
