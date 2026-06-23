const storageKey = "stackdeck_recent";
const maxRecent = 10;

export function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addRecent(key: string): void {
  if (typeof window === "undefined") return;
  const next = [key, ...getRecent().filter((k) => k !== key)].slice(0, maxRecent);
  localStorage.setItem(storageKey, JSON.stringify(next));
}
