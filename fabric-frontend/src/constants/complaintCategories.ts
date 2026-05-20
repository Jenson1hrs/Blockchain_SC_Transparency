export const COMPLAINT_CATEGORY_KEYS = [
  'suspected_counterfeit',
  'expired_product',
  'wrong_product_info',
  'allergy_safety_concern',
  'damaged_packaging',
  'suspicious_seller',
  'other',
] as const;

export type ComplaintCategory = (typeof COMPLAINT_CATEGORY_KEYS)[number];

export type ComplaintStatus = 'open' | 'reviewed' | 'resolved';

export const COMPLAINT_CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  suspected_counterfeit: 'Suspected counterfeit',
  expired_product: 'Expired product',
  wrong_product_info: 'Wrong product information',
  allergy_safety_concern: 'Allergy or safety concern',
  damaged_packaging: 'Damaged packaging',
  suspicious_seller: 'Suspicious seller',
  other: 'Other issue',
};
