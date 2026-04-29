type CacheEntry<T> = {
  data: T;
  expires: number;
  timestamp: number;
};

const MAX_CACHE_SIZE = 100;
const cache = new Map<string, CacheEntry<unknown>>();

function evictLRU(): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;
    for (const [key, entry] of cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }
}

export function getCached<T>(key: string, ttlMs: number): T | null {
  const now = Date.now();
  const entry = cache.get(key);
  if (!entry) return null;
  if (now > entry.expires) {
    cache.delete(key);
    return null;
  }
  const updatedEntry = { ...entry, timestamp: now };
  cache.set(key, updatedEntry);
  return entry.data as T;
}

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  evictLRU();
  cache.set(key, {
    data,
    expires: Date.now() + ttlMs,
    timestamp: Date.now(),
  });
}

export function clearCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key);
  }
}
