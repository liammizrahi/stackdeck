// Static, public asset references (e.g. files in /public, third-party
// component `src` strings) are NOT rewritten by Next.js basePath the way
// `next/link` and `next/image` are, so prefix them manually.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function withBase(path: string): string {
  return `${basePath}${path}`;
}
