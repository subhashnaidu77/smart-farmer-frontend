export async function retryWithBackoff(fn, {
  retries = 3,
  baseMs = 300,
  maxMs = 1500,
  shouldRetry = (err) => err?.code === "auth/network-request-failed",
} = {}) {
  let attempt = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt > retries || !shouldRetry(err)) throw err;
      const delay = Math.min(maxMs, baseMs * Math.pow(2, attempt - 1));
      await new Promise(res => setTimeout(res, delay));
    }
  }
}
