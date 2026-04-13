import { useState, useEffect, useRef } from 'react';
import type { LinearIssueResult } from '../../shared/types';

export function useIssueSearch(query: string): {
  results: LinearIssueResult[];
  loading: boolean;
  error: string | null;
} {
  const [results, setResults] = useState<LinearIssueResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!query || query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await window.api.searchIssues(query);
        if (result.success && result.data) {
          setResults(result.data);
        } else {
          setError(result.error ?? 'Search failed');
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  return { results, loading, error };
}
