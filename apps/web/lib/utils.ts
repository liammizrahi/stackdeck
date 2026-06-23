export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(n) / Math.log(1024)));
  const value = n / Math.pow(1024, i);
  const rounded = Math.round(value * 100) / 100;
  return `${rounded} ${units[i]}`;
}

export function isConnectionError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; name?: string; message?: string };
  const haystack = `${e.code ?? ""} ${e.name ?? ""} ${e.message ?? ""}`;
  return /ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|TimeoutError|NetworkingError/i.test(
    haystack,
  );
}
