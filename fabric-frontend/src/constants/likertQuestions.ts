export const LIKERT_SCALE_LABELS = [
  'Strongly Disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly Agree',
] as const;

export type LikertValue = 1 | 2 | 3 | 4 | 5;

export const LIKERT_QUESTIONS = [
  {
    id: 'verification_easy',
    text: 'The product verification process is easy to understand.',
  },
  {
    id: 'qr_trust',
    text: 'The QR verification feature improves trust in product authenticity.',
  },
  {
    id: 'inventory_useful',
    text: 'The inventory and expiry reminder features are useful.',
  },
  {
    id: 'navigation_easy',
    text: 'The system interface is easy to navigate.',
  },
  {
    id: 'workflow_clear',
    text: 'The role-based workflow is clear and realistic.',
  },
] as const;

export type LikertResponses = Record<string, LikertValue>;
