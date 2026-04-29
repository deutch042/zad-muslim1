const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const DEFAULT_LIMIT = 10;
const DEFAULT_WINDOW_MS = 60 * 1000;

function cleanupExpiredRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(cleanupExpiredRateLimits, 5 * 60 * 1000);

export function rateLimit(
  key: string,
  limit: number = DEFAULT_LIMIT,
  windowMs: number = DEFAULT_WINDOW_MS
): boolean {
  cleanupExpiredRateLimits();
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (existing.count >= limit) {
    return false;
  }

  existing.count++;
  return true;
}

export function getRateLimitKey(req: Request, endpoint: string): string {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
    || req.headers.get("cf-connecting-ip") 
    || "unknown";
  return `${ip}:${endpoint}`;
}