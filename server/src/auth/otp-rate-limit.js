// Per-process IP burst limit supplements database-backed destination limits.
// Multi-instance deployments should also configure a shared edge rate limit.
export function createOtpRequestLimiter(now = Date.now) {
  const buckets = new Map();
  return (request, response, next) => {
    const time = now();
    for (const [key, bucket] of buckets) if (bucket.until <= time) buckets.delete(key);
    const key = request.ip || request.socket?.remoteAddress || 'unknown';
    const bucket = buckets.get(key) || { count: 0, until: time + 15 * 60 * 1000 };
    if (bucket.count >= 10 || (!buckets.has(key) && buckets.size >= 10000)) {
      response.set('Retry-After', String(Math.max(1, Math.ceil((bucket.until - time) / 1000))));
      return response.status(429).json({ error: 'Too many OTP requests. Please try again later.' });
    }
    bucket.count++;
    buckets.set(key, bucket);
    next();
  };
}
export const otpRequestLimiter = createOtpRequestLimiter();
