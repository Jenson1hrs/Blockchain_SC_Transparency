/** Allowed halal / dietary status values for product registration. */
export const HALAL_STATUS_OPTIONS = [
  'Halal',
  'Non Halal',
  'Vegeterian',
  'Unknown',
  'None',
] as const;

export type HalalStatusOption = (typeof HALAL_STATUS_OPTIONS)[number];

export function isHalalStatusOption(value: string): value is HalalStatusOption {
  return (HALAL_STATUS_OPTIONS as readonly string[]).includes(value);
}
