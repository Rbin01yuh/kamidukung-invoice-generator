const getCache = (): Map<string, number> => {
  const globalRef = globalThis as any;
  if (!globalRef._ipTrialCache) {
    globalRef._ipTrialCache = new Map<string, number>();
  }
  return globalRef._ipTrialCache;
};

export default defineEventHandler((event) => {
  const headers = getHeaders(event);
  const rawIp = headers["x-forwarded-for"] || headers["x-real-ip"] || event.node?.req?.socket?.remoteAddress || "127.0.0.1";
  const ip = (typeof rawIp === "string" ? rawIp.split(",")[0] : String(rawIp)).trim();

  const cache = getCache();
  const currentCount = cache.get(ip) || 0;
  const newCount = currentCount + 1;
  cache.set(ip, newCount);

  return {
    ip,
    count: newCount,
  };
});
