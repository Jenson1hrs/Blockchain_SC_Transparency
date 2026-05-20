import { useCallback, useEffect, useState } from 'react';
import { fetchAssignedProducts, getExpiringProducts } from '../api/productService';
import { fetchOutgoingTransferRequests } from '../api/transferRequestService';
import type { Product } from '../types';
import {
  countExpiringFromProducts,
  countNotQrReady,
  countProductsAtRole,
  countProductsDownstream,
} from '../utils/manufacturerProductInsights';

export type ManufacturerBrandInsights = {
  catalogueProducts: Product[];
  expiringProducts: Product[];
  atDistributorCount: number;
  atRetailerCount: number;
  downstreamCount: number;
  expiringSoonCount: number;
  notQrReadyCount: number;
  pendingOutboundProductIds: Set<string>;
};

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; insights: ManufacturerBrandInsights };

export function useManufacturerBrandInsights(enabled: boolean) {
  const [state, setState] = useState<State>({ status: 'idle' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const [catalogueProducts, expiringResult, outgoingRequests] = await Promise.all([
        fetchAssignedProducts(200),
        getExpiringProducts(7, { includeExpired: true }),
        fetchOutgoingTransferRequests(),
      ]);
      const expiringProducts = expiringResult.products;
      const pendingOutboundProductIds = new Set<string>();
      for (const r of outgoingRequests) {
        if (r.status === 'pending' && r.productId) pendingOutboundProductIds.add(r.productId);
      }
      const insights: ManufacturerBrandInsights = {
        catalogueProducts,
        expiringProducts,
        atDistributorCount: countProductsAtRole(catalogueProducts, 'distributor'),
        atRetailerCount: countProductsAtRole(catalogueProducts, 'retailer'),
        downstreamCount: countProductsDownstream(catalogueProducts),
        expiringSoonCount: Math.max(
          expiringProducts.length,
          countExpiringFromProducts(catalogueProducts),
        ),
        notQrReadyCount: countNotQrReady(catalogueProducts),
        pendingOutboundProductIds,
      };
      setState({ status: 'success', insights });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not load brand insights';
      setState({ status: 'error', message });
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setState({ status: 'idle' });
      return;
    }
    void load();
  }, [enabled, load]);

  return {
    loading: enabled && (state.status === 'idle' || state.status === 'loading'),
    error: state.status === 'error' ? state.message : null,
    insights: state.status === 'success' ? state.insights : null,
    refresh: load,
  };
}
