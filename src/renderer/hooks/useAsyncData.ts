import { useState, useEffect } from 'react';
import type { IpcResult } from '../../shared/types';

interface AsyncDataState<T> {
  readonly data: T | null;
  readonly loading: boolean;
  readonly error: string | null;
}

export function useAsyncData<T>(
  fetcher: () => Promise<IpcResult<T>>,
): AsyncDataState<T> {
  const [state, setState] = useState<AsyncDataState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await fetcher();
        if (cancelled) return;

        if (result.success && result.data !== undefined) {
          setState({ data: result.data, loading: false, error: null });
        } else {
          setState({ data: null, loading: false, error: result.error ?? 'Request failed' });
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Request failed',
          });
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return state;
}
