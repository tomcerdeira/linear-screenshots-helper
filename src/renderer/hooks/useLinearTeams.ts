import { useAsyncData } from './useAsyncData';
import type { LinearTeam } from '../../shared/types';

export function useLinearTeams() {
  const { data, loading, error } = useAsyncData<LinearTeam[]>(
    () => window.api.getTeams(),
  );
  return { teams: data ?? [], loading, error };
}
