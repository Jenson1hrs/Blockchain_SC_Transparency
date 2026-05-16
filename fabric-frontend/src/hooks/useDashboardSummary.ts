import { useCallback, useEffect, useState } from 'react';
import { fetchDashboardSummary, type DashboardSummaryPayload } from '../api/dashboardService';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; payload: DashboardSummaryPayload };

export function useDashboardSummary(enabled: boolean) {
  const [state, setState] = useState<State>({ status: 'idle' });
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    if (!enabled) return;
    setRefreshKey((k) => k + 1);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setState({ status: 'idle' });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    (async () => {
      try {
        const payload = await fetchDashboardSummary();
        if (!cancelled) setState({ status: 'success', payload });
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Could not load analytics.';
        if (!cancelled) setState({ status: 'error', message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, refreshKey]);

  const loading = enabled && (state.status === 'idle' || state.status === 'loading');

  return {
    state,
    loading,
    error: state.status === 'error' ? state.message : null,
    payload: state.status === 'success' ? state.payload : null,
    refresh,
    isRefreshing: state.status === 'loading' && refreshKey > 0,
  };
}
