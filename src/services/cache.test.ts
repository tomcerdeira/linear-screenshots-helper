import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cached, invalidate, invalidateAll } from './cache';

beforeEach(() => {
  invalidateAll();
});

describe('cached', () => {
  it('calls fetcher on first request', async () => {
    const fetcher = vi.fn().mockResolvedValue('data');
    const result = await cached('key1', fetcher);
    expect(result).toBe('data');
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('returns cached value on second request without calling fetcher', async () => {
    const fetcher = vi.fn().mockResolvedValue('data');
    await cached('key2', fetcher);
    const result = await cached('key2', fetcher);
    expect(result).toBe('data');
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it('uses separate cache entries for different keys', async () => {
    const result1 = await cached('a', () => Promise.resolve('alpha'));
    const result2 = await cached('b', () => Promise.resolve('beta'));
    expect(result1).toBe('alpha');
    expect(result2).toBe('beta');
  });

  it('refetches after CACHE_TTL expires', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce('old')
      .mockResolvedValueOnce('new');

    await cached('key3', fetcher);

    // Advance past CACHE_TTL (5 min)
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 6 * 60 * 1000);

    const result = await cached('key3', fetcher);
    // Stale-while-revalidate: returns old data, triggers background refresh
    expect(result).toBe('old');
    expect(fetcher).toHaveBeenCalledTimes(2);

    vi.restoreAllMocks();
  });

  it('forces fresh fetch after STALE_TTL expires', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce('old')
      .mockResolvedValueOnce('fresh');

    await cached('key4', fetcher);

    // Advance past STALE_TTL (30 min)
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 31 * 60 * 1000);

    const result = await cached('key4', fetcher);
    expect(result).toBe('fresh');
    expect(fetcher).toHaveBeenCalledTimes(2);

    vi.restoreAllMocks();
  });
});

describe('invalidate', () => {
  it('removes entries matching the prefix', async () => {
    const fetcher1 = vi.fn().mockResolvedValue('a');
    const fetcher2 = vi.fn().mockResolvedValue('b');
    const fetcher3 = vi.fn().mockResolvedValue('c');

    await cached('team:1:states', fetcher1);
    await cached('team:1:labels', fetcher2);
    await cached('projects', fetcher3);

    invalidate('team:1');

    const newFetcher1 = vi.fn().mockResolvedValue('a2');
    const newFetcher2 = vi.fn().mockResolvedValue('b2');
    const newFetcher3 = vi.fn().mockResolvedValue('c2');

    const r1 = await cached('team:1:states', newFetcher1);
    const r2 = await cached('team:1:labels', newFetcher2);
    const r3 = await cached('projects', newFetcher3);

    expect(r1).toBe('a2'); // refetched
    expect(r2).toBe('b2'); // refetched
    expect(r3).toBe('c');  // still cached
    expect(newFetcher1).toHaveBeenCalledOnce();
    expect(newFetcher2).toHaveBeenCalledOnce();
    expect(newFetcher3).not.toHaveBeenCalled();
  });
});

describe('invalidateAll', () => {
  it('clears all entries', async () => {
    await cached('x', () => Promise.resolve(1));
    await cached('y', () => Promise.resolve(2));

    invalidateAll();

    const fetcherX = vi.fn().mockResolvedValue(10);
    const fetcherY = vi.fn().mockResolvedValue(20);

    expect(await cached('x', fetcherX)).toBe(10);
    expect(await cached('y', fetcherY)).toBe(20);
    expect(fetcherX).toHaveBeenCalledOnce();
    expect(fetcherY).toHaveBeenCalledOnce();
  });
});
