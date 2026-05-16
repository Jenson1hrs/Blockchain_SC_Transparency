/**
 * Metadata completeness for off-chain product records (PostgreSQL).
 * A product is incomplete if ANY important field is empty/null.
 */
const METADATA_FIELDS = [
  'image_url',
  'ingredients',
  'allergy_info',
  'usage_instructions',
  'halal_status',
];

function isEmpty(val) {
  return val == null || String(val).trim() === '';
}

function fieldFilled(row, dbKey) {
  return !isEmpty(row[dbKey]);
}

/** @param {object} row products table row */
function assessProductMetadata(row) {
  if (!row) {
    return {
      isComplete: false,
      filledCount: 0,
      totalCount: METADATA_FIELDS.length,
      completionPercent: 0,
      missingFields: [...METADATA_FIELDS],
    };
  }

  const missingFields = METADATA_FIELDS.filter((f) => !fieldFilled(row, f));
  const filledCount = METADATA_FIELDS.length - missingFields.length;
  const completionPercent = Math.round((filledCount / METADATA_FIELDS.length) * 100);

  return {
    isComplete: missingFields.length === 0,
    filledCount,
    totalCount: METADATA_FIELDS.length,
    completionPercent,
    missingFields,
  };
}

module.exports = {
  METADATA_FIELDS,
  assessProductMetadata,
};
