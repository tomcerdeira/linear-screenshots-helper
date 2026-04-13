import { useAsyncData } from './useAsyncData';
import type { LinearProject } from '../../shared/types';

export function useLinearProjects() {
  const { data, loading, error } = useAsyncData<LinearProject[]>(
    () => window.api.getProjects(),
  );
  return { projects: data ?? [], loading, error };
}
