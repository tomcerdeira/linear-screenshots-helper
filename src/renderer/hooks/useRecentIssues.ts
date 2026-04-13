import { useAsyncData } from './useAsyncData';
import type { LinearIssueResult } from '../../shared/types';

export function useRecentIssues() {
  const { data, loading, error } = useAsyncData<LinearIssueResult[]>(
    () => window.api.getRecentIssues(),
  );
  return { issues: data ?? [], loading, error };
}
