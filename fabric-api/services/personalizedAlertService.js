/** Server-side mirror of frontend personalized alert logic (prototype). */

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseCommaTerms(raw) {
  if (!raw || String(raw).trim() === '') return [];
  return String(raw)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function termMatchesHaystack(term, haystack) {
  const t = term.trim();
  if (!t || !haystack) return false;
  const re = new RegExp(`\\b${escapeRegExp(t)}\\b`, 'i');
  return re.test(haystack);
}

const MEAT_KEYWORDS = ['meat', 'beef', 'chicken', 'pork', 'fish', 'gelatin'];

function assessPersonalizedRisk(userRow, product) {
  if (!userRow || userRow.role !== 'consumer') return null;

  const haystack = `${product.ingredients ?? ''} ${product.allergyInfo ?? ''}`;
  const allergyTerms = parseCommaTerms(userRow.allergies);
  const matched = allergyTerms.filter((t) => termMatchesHaystack(t, haystack));
  if (matched.length > 0) {
    return { severity: 'danger', reason: 'allergy' };
  }

  const dietary = (userRow.dietary_preference || userRow.dietaryPreference || '')
    .toLowerCase()
    .trim();
  const ingredients = product.ingredients || '';
  const halal = (product.halalStatus || '').toLowerCase();

  if (dietary === 'vegetarian' || dietary === 'vegan') {
    for (const kw of MEAT_KEYWORDS) {
      if (termMatchesHaystack(kw, ingredients)) {
        return { severity: 'warning', reason: 'dietary' };
      }
    }
  }

  if (dietary === 'halal') {
    const h = halal.trim();
    if (!h || h === 'unknown' || h === 'none') {
      return { severity: 'warning', reason: 'halal' };
    }
    if (
      h === 'non halal' ||
      h.includes('non halal') ||
      h.includes('non-halal') ||
      h === 'vegeterian' ||
      h === 'vegetarian'
    ) {
      return { severity: 'warning', reason: 'halal' };
    }
    if (h !== 'halal') {
      return { severity: 'warning', reason: 'halal' };
    }
  }

  return null;
}

module.exports = {
  assessPersonalizedRisk,
};
