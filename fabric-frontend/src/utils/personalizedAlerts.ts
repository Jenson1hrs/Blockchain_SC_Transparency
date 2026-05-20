import type { AuthUser, Product } from '../types';

export type PersonalizedAlertType = 'allergy' | 'dietary' | 'halal' | 'info';

export type PersonalizedAlertSeverity = 'danger' | 'warning' | 'success' | 'info';

export interface PersonalizedAlert {
  type: PersonalizedAlertType;
  severity: PersonalizedAlertSeverity;
  title: string;
  message: string;
  matchedTerms?: string[];
}

type ProductFields = Pick<
  Product,
  'ingredients' | 'allergyInfo' | 'halalStatus'
>;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseCommaTerms(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Whole-word / phrase match (case-insensitive). */
function termMatchesHaystack(term: string, haystack: string): boolean {
  const t = term.trim();
  if (!t || !haystack) return false;
  const re = new RegExp(`\\b${escapeRegExp(t)}\\b`, 'i');
  return re.test(haystack);
}

function buildAllergyHaystack(product: ProductFields): string {
  return `${product.ingredients ?? ''} ${product.allergyInfo ?? ''}`;
}

function collectAllergyMatches(
  userTerms: string[],
  haystack: string
): string[] {
  const matched: string[] = [];
  for (const term of userTerms) {
    if (termMatchesHaystack(term, haystack)) {
      matched.push(term);
    }
  }
  return matched;
}

const MEAT_KEYWORDS = [
  'meat',
  'beef',
  'chicken',
  'pork',
  'fish',
  'gelatin',
] as const;

function findMeatKeywordsInIngredients(ingredients: string | null | undefined): string[] {
  if (!ingredients?.trim()) return [];
  const found: string[] = [];
  for (const kw of MEAT_KEYWORDS) {
    if (termMatchesHaystack(kw, ingredients)) {
      found.push(kw);
    }
  }
  return found;
}

function dietaryLower(user: AuthUser): string {
  return (user.dietaryPreference ?? '').toLowerCase();
}

function wantsHalal(user: AuthUser): boolean {
  return dietaryLower(user).includes('halal');
}

function wantsVegetarian(user: AuthUser): boolean {
  return dietaryLower(user).includes('vegetarian');
}

/**
 * Rule-based personalized safety alerts (no ML).
 * Pass `user: null` when logged out — returns [] (UI shows login hint separately).
 */
export function getPersonalizedAlerts(
  product: ProductFields,
  user: AuthUser | null
): PersonalizedAlert[] {
  if (!user) return [];

  const alerts: PersonalizedAlert[] = [];

  const allergyTerms = parseCommaTerms(user.allergies);
  if (allergyTerms.length > 0) {
    const haystack = buildAllergyHaystack(product);
    const matched = collectAllergyMatches(allergyTerms, haystack);
    if (matched.length > 0) {
      const list = matched.join(', ');
      alerts.push({
        type: 'allergy',
        severity: 'danger',
        title: 'Allergy alert',
        message: `Allergy Alert: This product may contain ${list}.`,
        matchedTerms: matched,
      });
    }
  }

  if (wantsHalal(user)) {
    const raw = (product.halalStatus ?? '').trim();
    const h = raw.toLowerCase();

    const isUnknown =
      !raw ||
      h === 'unknown' ||
      h === 'none' ||
      h === 'n/a' ||
      h === 'na' ||
      /\bunknown\b/i.test(raw);

    const isNonHalal =
      h === 'non halal' ||
      h.includes('not halal') ||
      h.includes('non-halal') ||
      h.includes('non halal');

    const isVegeterian = h === 'vegeterian' || h === 'vegetarian';

    if (isNonHalal) {
      alerts.push({
        type: 'halal',
        severity: 'danger',
        title: 'Halal',
        message: 'This product is not marked as halal-certified.',
      });
    } else if (isVegeterian) {
      alerts.push({
        type: 'halal',
        severity: 'warning',
        title: 'Halal',
        message:
          'This product is marked as vegetarian, not halal-certified.',
      });
    } else if (isUnknown) {
      alerts.push({
        type: 'halal',
        severity: 'warning',
        title: 'Halal status unknown',
        message: 'Halal status is not provided for this product.',
      });
    } else if (h === 'halal' || (h.includes('halal') && !isNonHalal)) {
      alerts.push({
        type: 'halal',
        severity: 'success',
        title: 'Halal',
        message: 'This product is marked as halal-certified.',
      });
    }
  }

  if (wantsVegetarian(user)) {
    const meatHits = findMeatKeywordsInIngredients(product.ingredients);
    if (meatHits.length > 0) {
      alerts.push({
        type: 'dietary',
        severity: 'warning',
        title: 'Vegetarian preference',
        message: `This product’s ingredients may include animal-derived items (${meatHits.join(', ')}).`,
        matchedTerms: meatHits,
      });
    }
  }

  return alerts;
}
