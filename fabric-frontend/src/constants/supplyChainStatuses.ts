/** Application lifecycle statuses (PostgreSQL / UI). Do not rename — aligned with API. */
export const SUPPLY_CHAIN_STATUSES = {
  MANUFACTURED: 'Manufactured',
  TRANSFER_PENDING: 'Transfer Pending',
  IN_TRANSIT: 'In Transit',
  RECEIVED_DISTRIBUTOR: 'Received by Distributor',
  RECEIVED_RETAILER: 'Received by Retailer',
  RETAIL_READY: 'Retail Ready',
} as const;

export type SupplyChainStatus =
  (typeof SUPPLY_CHAIN_STATUSES)[keyof typeof SUPPLY_CHAIN_STATUSES];
