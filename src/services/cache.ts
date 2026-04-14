const CACHE_TTL = 5 * 60 * 1000; // 5 minutes — serve from cache
const STALE_TTL = 30 * 60 * 1000; // 30 minutes — refetch in background

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();

  if (entry) {
    const age = now - entry.fetchedAt;

    if (age < CACHE_TTL) {
      return entry.data;
    }

    if (age < STALE_TTL) {
      // Serve stale data immediately, refresh in background
      fetcher().then((fresh) => {
        store.set(key, { data: fresh, fetchedAt: Date.now() });
      }).catch(() => { /* background refresh — errors are non-fatal */ });
      return entry.data;
    }
  }

  // No cache or expired — fetch fresh
  const data = await fetcher();
  store.set(key, { data, fetchedAt: now });
  return data;
}

export function invalidate(keyPrefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(keyPrefix)) {
      store.delete(key);
    }
  }
}

export function invalidateAll(): void {
  store.clear();
}
