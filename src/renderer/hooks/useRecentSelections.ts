import { useAsyncData } from './useAsyncData';
import type { RecentSelections } from '../../shared/types';

export function useRecentSelections() {
  const { data, loading } = useAsyncData<RecentSelections>(
    () => window.api.getRecentSelections(),
  );
  return {
    lastTeamId: data?.lastTeamId ?? '',
    lastProjectId: data?.lastProjectId ?? '',
    recentTickets: data?.recentTickets ?? [],
    loading,
  };
}
