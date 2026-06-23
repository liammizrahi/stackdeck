# StackDeck Console Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Dockerized Next.js AWS-Console-like UI (StackDeck) on Cloudscape + AWS SDK v3 that browses LocalStack/MiniStack resources: dashboard + S3, Lambda, DynamoDB, SQS, SNS.

**Architecture:** Next.js App Router app in `apps/web`. React Server Components fetch data by calling `src/lib/aws/*` functions (AWS SDK v3, server-side only). Cloudscape client components render tables/detail. Server Actions perform mutations. `router.refresh()` reloads.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Cloudscape (`@cloudscape-design/components`, `@cloudscape-design/global-styles`), AWS SDK v3 (`@aws-sdk/client-*`), Vitest + `aws-sdk-client-mock` for unit tests, Docker (standalone output).

## Global Constraints

- No code comments in source/config files (user preference).
- Commits: no `Co-Authored-By: Claude` trailer, no "Generated with" footer.
- Git: commits use local config `Liam Mizrahi <liammizrahi.iphone@gmail.com>` (already set on the repo).
- Default endpoint `http://localstack:4566`; env overrides: `AWS_ENDPOINT_URL`, `AWS_ACCESS_KEY_ID` (default `test`), `AWS_SECRET_ACCESS_KEY` (default `test`), `AWS_REGION` (default `us-east-1`).
- Dev server port: `4577` (already configured).
- No docker-compose file in this repo.
- All AWS calls run server-side only; credentials never reach the browser.
- `lib/aws/*` functions return plain serializable objects (no SDK class instances) so RSC → client props work.
- Node 22, npm workspaces, run all commands from repo root `/Users/liammizrahi/WebstormProjects/stackdeck`.
- Run web-scoped commands with `-w web` (the app's package name is `web`).

---

### Task 1: Swap framework deps and base config (Cloudscape + SDK, src/ layout)

Remove HeroUI/Tailwind, add Cloudscape + AWS SDK + test tooling, move to `src/` layout, configure Next.js standalone + transpilePackages, add `@/*` path alias and Vitest.

**Files:**
- Modify: `apps/web/package.json` (deps, scripts)
- Modify: `apps/web/next.config.js`
- Modify: `apps/web/tsconfig.json`
- Create: `apps/web/vitest.config.ts`
- Delete: `apps/web/postcss.config.mjs`
- Move: `apps/web/app/` → `apps/web/src/app/` (via `git mv`)
- Replace: `apps/web/src/app/globals.css`
- Replace: `apps/web/src/app/layout.tsx`
- Replace: `apps/web/src/app/page.tsx` (temporary smoke page; real dashboard in Task 5)

**Interfaces:**
- Produces: `@/*` path alias → `apps/web/src/*`. Vitest test command `npm run test -w web`.

- [ ] **Step 1: Remove old deps and add new ones**

```bash
cd /Users/liammizrahi/WebstormProjects/stackdeck
npm uninstall -w web @heroui/react @heroui/styles tailwind-variants tailwindcss @tailwindcss/postcss postcss
npm install -w web @cloudscape-design/components @cloudscape-design/global-styles @cloudscape-design/component-toolkit @aws-sdk/client-s3 @aws-sdk/client-lambda @aws-sdk/client-dynamodb @aws-sdk/util-dynamodb @aws-sdk/client-sqs @aws-sdk/client-sns @aws-sdk/client-sts @smithy/node-http-handler
npm install -w web -D vitest aws-sdk-client-mock
```

- [ ] **Step 2: Remove PostCSS config**

```bash
rm -f apps/web/postcss.config.mjs
```

- [ ] **Step 3: Move app/ to src/app/**

```bash
mkdir -p apps/web/src
git -C /Users/liammizrahi/WebstormProjects/stackdeck mv apps/web/app apps/web/src/app
```

- [ ] **Step 4: Replace `apps/web/next.config.js`**

```js
const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: [
    "@cloudscape-design/components",
    "@cloudscape-design/global-styles",
    "@cloudscape-design/component-toolkit",
  ],
};

module.exports = nextConfig;
```

Note: rename is required — change the file from ESM to CJS. Run:

```bash
git -C /Users/liammizrahi/WebstormProjects/stackdeck mv apps/web/next.config.js apps/web/next.config.cjs 2>/dev/null || true
```

If the rename ran, the file is `next.config.cjs`; otherwise keep `next.config.js` with the `module.exports` content above. Next.js accepts both.

- [ ] **Step 5: Replace `apps/web/tsconfig.json`**

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "strictNullChecks": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    "next-env.d.ts",
    "next.config.cjs",
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 6: Create `apps/web/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

- [ ] **Step 7: Add scripts to `apps/web/package.json`**

In the `"scripts"` block add (keep existing dev/build/start/lint/check-types):

```json
    "test": "vitest run"
```

- [ ] **Step 8: Replace `apps/web/src/app/globals.css`**

```css
@import "@cloudscape-design/global-styles/index.css";

html,
body {
  margin: 0;
  padding: 0;
}
```

- [ ] **Step 9: Replace `apps/web/src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const amazonEmber = localFont({
  src: [
    { path: "./fonts/amazon-ember/AmazonEmber-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/amazon-ember/AmazonEmber-LightItalic.woff2", weight: "300", style: "italic" },
    { path: "./fonts/amazon-ember/AmazonEmber-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/amazon-ember/AmazonEmber-Italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/amazon-ember/AmazonEmber-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/amazon-ember/AmazonEmber-MediumItalic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/amazon-ember/AmazonEmber-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/amazon-ember/AmazonEmber-BoldItalic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-amazon-ember",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StackDeck",
  description: "Local AWS console for LocalStack/MiniStack",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={amazonEmber.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 10: Replace `apps/web/src/app/page.tsx` with a Cloudscape smoke page**

```tsx
import Box from "@cloudscape-design/components/box";

export default function Home() {
  return <Box padding="l">StackDeck</Box>;
}
```

- [ ] **Step 11: Build to verify**

Run: `npm run build -w web`
Expected: build succeeds; route `/` is generated. No Tailwind/HeroUI errors.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "Switch web app to Cloudscape + AWS SDK v3 and src/ layout"
```

---

### Task 2: AWS settings + client config factory

Central server-side config: env-driven settings with defaults and a shared client config (credentials, endpoint, region, fast-fail timeout).

**Files:**
- Create: `apps/web/src/lib/aws/config.ts`
- Test: `apps/web/src/lib/aws/config.test.ts`

**Interfaces:**
- Produces:
  - `getAwsSettings(): { endpoint: string; region: string; accessKeyId: string; secretAccessKey: string }`
  - `clientConfig(): { endpoint: string; region: string; credentials: { accessKeyId: string; secretAccessKey: string }; requestHandler: NodeHttpHandler }`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/lib/aws/config.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getAwsSettings } from "@/lib/aws/config";

describe("getAwsSettings", () => {
  const saved = { ...process.env };

  beforeEach(() => {
    delete process.env.AWS_ENDPOINT_URL;
    delete process.env.AWS_REGION;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
  });

  afterEach(() => {
    process.env = { ...saved };
  });

  it("returns documented defaults", () => {
    expect(getAwsSettings()).toEqual({
      endpoint: "http://localstack:4566",
      region: "us-east-1",
      accessKeyId: "test",
      secretAccessKey: "test",
    });
  });

  it("honors env overrides", () => {
    process.env.AWS_ENDPOINT_URL = "http://localhost:4566";
    process.env.AWS_REGION = "eu-central-1";
    process.env.AWS_ACCESS_KEY_ID = "abc";
    process.env.AWS_SECRET_ACCESS_KEY = "xyz";
    expect(getAwsSettings()).toEqual({
      endpoint: "http://localhost:4566",
      region: "eu-central-1",
      accessKeyId: "abc",
      secretAccessKey: "xyz",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -w web`
Expected: FAIL — cannot resolve `@/lib/aws/config`.

- [ ] **Step 3: Write `apps/web/src/lib/aws/config.ts`**

```ts
import { NodeHttpHandler } from "@smithy/node-http-handler";

export interface AwsSettings {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

const requestTimeoutMs = 5000;

export function getAwsSettings(): AwsSettings {
  return {
    endpoint: process.env.AWS_ENDPOINT_URL ?? "http://localstack:4566",
    region: process.env.AWS_REGION ?? "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test",
  };
}

export function clientConfig() {
  const settings = getAwsSettings();
  return {
    endpoint: settings.endpoint,
    region: settings.region,
    credentials: {
      accessKeyId: settings.accessKeyId,
      secretAccessKey: settings.secretAccessKey,
    },
    requestHandler: new NodeHttpHandler({
      connectionTimeout: requestTimeoutMs,
      requestTimeout: requestTimeoutMs,
    }),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -w web`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/aws/config.ts apps/web/src/lib/aws/config.test.ts
git commit -m "Add AWS settings and client config factory"
```

---

### Task 3: utils + connection-error detection

Small shared helpers: human byte formatting and a predicate that recognizes "runtime unreachable" errors (used by error states and the health probe).

**Files:**
- Create: `apps/web/src/lib/utils.ts`
- Test: `apps/web/src/lib/utils.test.ts`

**Interfaces:**
- Produces:
  - `formatBytes(n: number): string`
  - `isConnectionError(err: unknown): boolean`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/lib/utils.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { formatBytes, isConnectionError } from "@/lib/utils";

describe("formatBytes", () => {
  it("formats common sizes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1048576)).toBe("1 MB");
  });
});

describe("isConnectionError", () => {
  it("detects ECONNREFUSED and timeouts", () => {
    expect(isConnectionError({ code: "ECONNREFUSED" })).toBe(true);
    expect(isConnectionError({ name: "TimeoutError" })).toBe(true);
    expect(isConnectionError(new Error("connect ECONNREFUSED 127.0.0.1:4566"))).toBe(true);
  });

  it("returns false for unrelated errors", () => {
    expect(isConnectionError(new Error("AccessDenied"))).toBe(false);
    expect(isConnectionError(null)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -w web`
Expected: FAIL — cannot resolve `@/lib/utils`.

- [ ] **Step 3: Write `apps/web/src/lib/utils.ts`**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -w web`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/utils.ts apps/web/src/lib/utils.test.ts
git commit -m "Add formatBytes and connection-error helpers"
```

---

### Task 4: App shell (Cloudscape AppLayout + sidebar + topbar + Ember theme)

The console chrome: TopNavigation, SideNavigation with the 5 services, and Amazon Ember applied via Cloudscape theming. Server `layout.tsx` wraps children with the client `AppShell`.

**Files:**
- Create: `apps/web/src/components/layout/Sidebar.tsx`
- Create: `apps/web/src/components/layout/Topbar.tsx`
- Create: `apps/web/src/components/layout/AppShell.tsx`
- Modify: `apps/web/src/app/layout.tsx`

**Interfaces:**
- Consumes: `--font-amazon-ember` CSS var (Task 1).
- Produces: `AppShell` (client) default export wrapping page content.

- [ ] **Step 1: Create `apps/web/src/components/layout/Sidebar.tsx`**

```tsx
"use client";

import SideNavigation from "@cloudscape-design/components/side-navigation";
import { usePathname, useRouter } from "next/navigation";

const items = [
  {
    type: "section" as const,
    text: "Services",
    items: [
      { type: "link" as const, text: "S3", href: "/services/s3" },
      { type: "link" as const, text: "Lambda", href: "/services/lambda" },
      { type: "link" as const, text: "DynamoDB", href: "/services/dynamodb" },
      { type: "link" as const, text: "SQS", href: "/services/sqs" },
      { type: "link" as const, text: "SNS", href: "/services/sns" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeHref =
    items[0].items.find((i) => pathname.startsWith(i.href))?.href ?? "/";
  return (
    <SideNavigation
      header={{ href: "/", text: "StackDeck" }}
      activeHref={activeHref}
      items={items}
      onFollow={(event) => {
        if (!event.detail.external) {
          event.preventDefault();
          router.push(event.detail.href);
        }
      }}
    />
  );
}
```

- [ ] **Step 2: Create `apps/web/src/components/layout/Topbar.tsx`**

```tsx
"use client";

import TopNavigation from "@cloudscape-design/components/top-navigation";
import { getAwsSettings } from "@/lib/aws/config";

export default function Topbar({
  endpoint,
  region,
}: {
  endpoint: string;
  region: string;
}) {
  return (
    <TopNavigation
      identity={{ href: "/", title: "StackDeck" }}
      utilities={[
        { type: "button", text: region, iconName: "globe" },
        { type: "button", text: endpoint, iconName: "share" },
      ]}
    />
  );
}

export { getAwsSettings };
```

- [ ] **Step 3: Create `apps/web/src/components/layout/AppShell.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import AppLayout from "@cloudscape-design/components/app-layout";
import { applyTheme } from "@cloudscape-design/components/theming";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({
  endpoint,
  region,
  children,
}: {
  endpoint: string;
  region: string;
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(true);

  useEffect(() => {
    const reset = applyTheme({
      theme: {
        tokens: {
          fontFamilyBase:
            "var(--font-amazon-ember), 'Amazon Ember', system-ui, sans-serif",
        },
      },
    });
    return () => reset.reset();
  }, []);

  return (
    <>
      <div id="top-nav">
        <Topbar endpoint={endpoint} region={region} />
      </div>
      <AppLayout
        headerSelector="#top-nav"
        navigation={<Sidebar />}
        navigationOpen={navOpen}
        onNavigationChange={(e) => setNavOpen(e.detail.open)}
        toolsHide
        content={children}
      />
    </>
  );
}
```

- [ ] **Step 4: Wire `AppShell` into `apps/web/src/app/layout.tsx`**

Replace the `<body>` line so children are wrapped. The full file:

```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import AppShell from "@/components/layout/AppShell";
import { getAwsSettings } from "@/lib/aws/config";
import "./globals.css";

const amazonEmber = localFont({
  src: [
    { path: "./fonts/amazon-ember/AmazonEmber-Light.woff2", weight: "300", style: "normal" },
    { path: "./fonts/amazon-ember/AmazonEmber-LightItalic.woff2", weight: "300", style: "italic" },
    { path: "./fonts/amazon-ember/AmazonEmber-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/amazon-ember/AmazonEmber-Italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/amazon-ember/AmazonEmber-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/amazon-ember/AmazonEmber-MediumItalic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/amazon-ember/AmazonEmber-Bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/amazon-ember/AmazonEmber-BoldItalic.woff2", weight: "700", style: "italic" },
  ],
  variable: "--font-amazon-ember",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StackDeck",
  description: "Local AWS console for LocalStack/MiniStack",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { endpoint, region } = getAwsSettings();
  return (
    <html lang="en" className={amazonEmber.variable} suppressHydrationWarning>
      <body>
        <AppShell endpoint={endpoint} region={region}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Build to verify**

Run: `npm run build -w web`
Expected: build succeeds.

- [ ] **Step 6: Manually verify the shell**

Run: `npm run dev -w web`, open http://localhost:4577. Expected: AWS-style top nav + left sidebar listing the 5 services; clicking a service navigates (pages 404/placeholder until later tasks). Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/layout apps/web/src/app/layout.tsx
git commit -m "Add Cloudscape app shell with sidebar, topbar, and Amazon Ember theme"
```

---

### Task 5: Shared resource components + per-route loading/error states

Reusable building blocks for every service page: a status badge, an empty state, an error state (connection-aware), and a generic resource table. Plus a root `loading.tsx`/`error.tsx` pattern.

**Files:**
- Create: `apps/web/src/components/resources/StatusBadge.tsx`
- Create: `apps/web/src/components/resources/EmptyState.tsx`
- Create: `apps/web/src/components/resources/ErrorState.tsx`
- Create: `apps/web/src/components/resources/ResourceTable.tsx`
- Create: `apps/web/src/app/services/loading.tsx`
- Create: `apps/web/src/app/services/error.tsx`

**Interfaces:**
- Produces:
  - `StatusBadge({ status }: { status: string })`
  - `EmptyState({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode })`
  - `ErrorState({ error, endpoint }: { error: { message: string }; endpoint?: string })`
  - `ResourceTable<T>({ items, columnDefinitions, loading, empty, header })` — thin wrapper over Cloudscape `Table`.

- [ ] **Step 1: Create `apps/web/src/components/resources/StatusBadge.tsx`**

```tsx
"use client";

import StatusIndicator from "@cloudscape-design/components/status-indicator";

const successStates = ["available", "active", "enabled", "succeeded", "running"];
const errorStates = ["failed", "deleting", "inactive", "error"];

export default function StatusBadge({ status }: { status: string }) {
  const value = (status ?? "").toLowerCase();
  const type = successStates.includes(value)
    ? "success"
    : errorStates.includes(value)
      ? "error"
      : "info";
  return <StatusIndicator type={type}>{status || "unknown"}</StatusIndicator>;
}
```

- [ ] **Step 2: Create `apps/web/src/components/resources/EmptyState.tsx`**

```tsx
"use client";

import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";

export default function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <Box textAlign="center" color="inherit" padding="l">
      <SpaceBetween size="xs">
        <Box variant="strong" color="inherit">
          {title}
        </Box>
        {subtitle ? (
          <Box variant="p" color="inherit">
            {subtitle}
          </Box>
        ) : null}
        {action}
      </SpaceBetween>
    </Box>
  );
}
```

- [ ] **Step 3: Create `apps/web/src/components/resources/ErrorState.tsx`**

```tsx
"use client";

import Alert from "@cloudscape-design/components/alert";
import Button from "@cloudscape-design/components/button";

export default function ErrorState({
  error,
  endpoint,
  onRetry,
}: {
  error: { message: string };
  endpoint?: string;
  onRetry?: () => void;
}) {
  const looksLikeConnection =
    /ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|Timeout|Networking/i.test(
      error.message,
    );
  return (
    <Alert
      type="error"
      header={
        looksLikeConnection
          ? "Can't reach LocalStack/MiniStack"
          : "Something went wrong"
      }
      action={onRetry ? <Button onClick={onRetry}>Retry</Button> : undefined}
    >
      {looksLikeConnection
        ? `No response from ${endpoint ?? "the configured endpoint"}. Is your local runtime running?`
        : error.message}
    </Alert>
  );
}
```

- [ ] **Step 4: Create `apps/web/src/components/resources/ResourceTable.tsx`**

```tsx
"use client";

import Table, {
  type TableProps,
} from "@cloudscape-design/components/table";

export default function ResourceTable<T>(props: TableProps<T>) {
  return <Table<T> variant="full-page" stickyHeader {...props} />;
}
```

- [ ] **Step 5: Create `apps/web/src/app/services/loading.tsx`**

```tsx
import Box from "@cloudscape-design/components/box";
import Spinner from "@cloudscape-design/components/spinner";

export default function Loading() {
  return (
    <Box padding="l">
      <Spinner size="large" /> Loading…
    </Box>
  );
}
```

- [ ] **Step 6: Create `apps/web/src/app/services/error.tsx`**

```tsx
"use client";

import ErrorState from "@/components/resources/ErrorState";

export default function ServicesError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return <ErrorState error={error} onRetry={reset} />;
}
```

- [ ] **Step 7: Build to verify**

Run: `npm run build -w web`
Expected: build succeeds.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/components/resources apps/web/src/app/services
git commit -m "Add shared resource components and services loading/error states"
```

---

### Task 6: Dashboard with health probe

Landing page: connection status (STS GetCallerIdentity with fast-fail), endpoint, region, and a grid of service cards linking into each service.

**Files:**
- Create: `apps/web/src/lib/aws/health.ts`
- Test: `apps/web/src/lib/aws/health.test.ts`
- Create: `apps/web/src/components/Dashboard.tsx`
- Replace: `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: `clientConfig` (Task 2), `getAwsSettings` (Task 2), `isConnectionError` (Task 3).
- Produces: `checkHealth(): Promise<{ connected: boolean; account: string | null; endpoint: string; region: string; error?: string }>`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/lib/aws/health.test.ts`:

```ts
import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  GetCallerIdentityCommand,
  STSClient,
} from "@aws-sdk/client-sts";
import { checkHealth } from "@/lib/aws/health";

const sts = mockClient(STSClient);

afterEach(() => sts.reset());

describe("checkHealth", () => {
  it("reports connected with account on success", async () => {
    sts.on(GetCallerIdentityCommand).resolves({ Account: "000000000000" });
    const result = await checkHealth();
    expect(result.connected).toBe(true);
    expect(result.account).toBe("000000000000");
  });

  it("reports disconnected on connection failure", async () => {
    sts.on(GetCallerIdentityCommand).rejects(
      Object.assign(new Error("connect ECONNREFUSED"), { code: "ECONNREFUSED" }),
    );
    const result = await checkHealth();
    expect(result.connected).toBe(false);
    expect(result.account).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -w web`
Expected: FAIL — cannot resolve `@/lib/aws/health`.

- [ ] **Step 3: Write `apps/web/src/lib/aws/health.ts`**

```ts
import { GetCallerIdentityCommand, STSClient } from "@aws-sdk/client-sts";
import { clientConfig, getAwsSettings } from "@/lib/aws/config";

export async function checkHealth(): Promise<{
  connected: boolean;
  account: string | null;
  endpoint: string;
  region: string;
  error?: string;
}> {
  const { endpoint, region } = getAwsSettings();
  const client = new STSClient(clientConfig());
  try {
    const out = await client.send(new GetCallerIdentityCommand({}));
    return { connected: true, account: out.Account ?? null, endpoint, region };
  } catch (err) {
    return {
      connected: false,
      account: null,
      endpoint,
      region,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -w web`
Expected: PASS (2 tests).

- [ ] **Step 5: Create `apps/web/src/components/Dashboard.tsx`**

```tsx
"use client";

import Cards from "@cloudscape-design/components/cards";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import { useRouter } from "next/navigation";

const services = [
  { name: "S3", href: "/services/s3", description: "Object storage buckets" },
  { name: "Lambda", href: "/services/lambda", description: "Functions" },
  { name: "DynamoDB", href: "/services/dynamodb", description: "NoSQL tables" },
  { name: "SQS", href: "/services/sqs", description: "Message queues" },
  { name: "SNS", href: "/services/sns", description: "Pub/sub topics" },
];

export default function Dashboard({
  health,
}: {
  health: {
    connected: boolean;
    account: string | null;
    endpoint: string;
    region: string;
  };
}) {
  const router = useRouter();
  return (
    <ContentLayout header={<Header variant="h1">Dashboard</Header>}>
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Connection</Header>}>
          <SpaceBetween size="s">
            <StatusIndicator type={health.connected ? "success" : "error"}>
              {health.connected ? "Connected" : "Disconnected"}
            </StatusIndicator>
            <div>Endpoint: {health.endpoint}</div>
            <div>Region: {health.region}</div>
            <div>Account: {health.account ?? "—"}</div>
          </SpaceBetween>
        </Container>
        <Cards
          cardDefinition={{
            header: (item) => (
              <Link
                fontSize="heading-m"
                onFollow={(e) => {
                  e.preventDefault();
                  router.push(item.href);
                }}
                href={item.href}
              >
                {item.name}
              </Link>
            ),
            sections: [
              { id: "desc", content: (item) => item.description },
            ],
          }}
          cardsPerRow={[{ cards: 1 }, { minWidth: 500, cards: 3 }]}
          items={services}
          header={<Header variant="h2">Services</Header>}
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
```

- [ ] **Step 6: Replace `apps/web/src/app/page.tsx`**

```tsx
import Dashboard from "@/components/Dashboard";
import { checkHealth } from "@/lib/aws/health";

export const dynamic = "force-dynamic";

export default async function Home() {
  const health = await checkHealth();
  return <Dashboard health={health} />;
}
```

- [ ] **Step 7: Build to verify**

Run: `npm run build -w web`
Expected: build succeeds.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/lib/aws/health.ts apps/web/src/lib/aws/health.test.ts apps/web/src/components/Dashboard.tsx apps/web/src/app/page.tsx
git commit -m "Add dashboard with connection health probe"
```

---

### Task 7: S3 service (buckets → objects → preview, create bucket)

**Files:**
- Create: `apps/web/src/lib/aws/s3.ts`
- Test: `apps/web/src/lib/aws/s3.test.ts`
- Create: `apps/web/src/app/services/s3/actions.ts`
- Create: `apps/web/src/app/services/s3/page.tsx`
- Create: `apps/web/src/app/services/s3/BucketsView.tsx`
- Create: `apps/web/src/app/services/s3/[bucket]/page.tsx`
- Create: `apps/web/src/app/services/s3/[bucket]/ObjectsView.tsx`

**Interfaces:**
- Consumes: `clientConfig` (Task 2), `formatBytes` (Task 3), `ResourceTable`/`EmptyState`/`StatusBadge` (Task 5).
- Produces:
  - `listBuckets(): Promise<Array<{ name: string; creationDate: string | null }>>`
  - `listObjects(bucket: string, prefix: string): Promise<{ objects: Array<{ key: string; size: number; lastModified: string | null }>; prefixes: string[] }>`
  - `getObjectPreview(bucket: string, key: string): Promise<{ body?: string; error?: string; truncated?: boolean }>`
  - `createBucketAction(formData: FormData): Promise<void>` (server action)

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/lib/aws/s3.test.ts`:

```ts
import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  ListBucketsCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { listBuckets, listObjects } from "@/lib/aws/s3";

const s3 = mockClient(S3Client);

afterEach(() => s3.reset());

describe("listBuckets", () => {
  it("maps and sorts buckets", async () => {
    s3.on(ListBucketsCommand).resolves({
      Buckets: [
        { Name: "zeta", CreationDate: new Date("2020-01-01") },
        { Name: "alpha", CreationDate: new Date("2021-01-01") },
      ],
    });
    const result = await listBuckets();
    expect(result.map((b) => b.name)).toEqual(["alpha", "zeta"]);
    expect(result[0].creationDate).toBe(new Date("2021-01-01").toISOString());
  });
});

describe("listObjects", () => {
  it("splits objects and common prefixes", async () => {
    s3.on(ListObjectsV2Command).resolves({
      Contents: [{ Key: "a.txt", Size: 10, LastModified: new Date("2022-01-01") }],
      CommonPrefixes: [{ Prefix: "folder/" }],
    });
    const result = await listObjects("bk", "");
    expect(result.objects).toEqual([
      { key: "a.txt", size: 10, lastModified: new Date("2022-01-01").toISOString() },
    ]);
    expect(result.prefixes).toEqual(["folder/"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -w web`
Expected: FAIL — cannot resolve `@/lib/aws/s3`.

- [ ] **Step 3: Write `apps/web/src/lib/aws/s3.ts`**

```ts
import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { clientConfig } from "@/lib/aws/config";

function s3Client() {
  return new S3Client({ ...clientConfig(), forcePathStyle: true });
}

const previewLimit = 1024 * 1024;

export async function listBuckets(): Promise<
  Array<{ name: string; creationDate: string | null }>
> {
  const out = await s3Client().send(new ListBucketsCommand({}));
  return (out.Buckets ?? [])
    .map((b) => ({
      name: b.Name ?? "",
      creationDate: b.CreationDate ? b.CreationDate.toISOString() : null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function listObjects(
  bucket: string,
  prefix: string,
): Promise<{
  objects: Array<{ key: string; size: number; lastModified: string | null }>;
  prefixes: string[];
}> {
  const out = await s3Client().send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Delimiter: "/",
      Prefix: prefix || undefined,
      MaxKeys: 500,
    }),
  );
  const objects = (out.Contents ?? [])
    .filter((c) => c.Key !== prefix)
    .map((c) => ({
      key: c.Key ?? "",
      size: c.Size ?? 0,
      lastModified: c.LastModified ? c.LastModified.toISOString() : null,
    }));
  const prefixes = (out.CommonPrefixes ?? []).map((p) => p.Prefix ?? "");
  return { objects, prefixes };
}

export async function getObjectPreview(
  bucket: string,
  key: string,
): Promise<{ body?: string; error?: string; truncated?: boolean }> {
  const client = s3Client();
  try {
    const head = await client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key }),
    );
    if ((head.ContentLength ?? 0) > previewLimit) {
      return { error: "File is too large to preview (> 1 MB)." };
    }
    const out = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    const body = await out.Body?.transformToString();
    return { body: body ?? "" };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export async function createBucket(name: string): Promise<void> {
  await s3Client().send(new CreateBucketCommand({ Bucket: name }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -w web`
Expected: PASS.

- [ ] **Step 5: Create `apps/web/src/app/services/s3/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createBucket } from "@/lib/aws/s3";

export async function createBucketAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await createBucket(name);
  revalidatePath("/services/s3");
}
```

- [ ] **Step 6: Create `apps/web/src/app/services/s3/BucketsView.tsx`**

```tsx
"use client";

import Button from "@cloudscape-design/components/button";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import { useRouter } from "next/navigation";
import ResourceTable from "@/components/resources/ResourceTable";
import EmptyState from "@/components/resources/EmptyState";

type Bucket = { name: string; creationDate: string | null };

export default function BucketsView({ buckets }: { buckets: Bucket[] }) {
  const router = useRouter();
  return (
    <ResourceTable<Bucket>
      items={buckets}
      header={<Header variant="h1" counter={`(${buckets.length})`}>Buckets</Header>}
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          cell: (b) => (
            <Link
              href={`/services/s3/${encodeURIComponent(b.name)}`}
              onFollow={(e) => {
                e.preventDefault();
                router.push(`/services/s3/${encodeURIComponent(b.name)}`);
              }}
            >
              {b.name}
            </Link>
          ),
        },
        {
          id: "created",
          header: "Creation date",
          cell: (b) => (b.creationDate ? new Date(b.creationDate).toLocaleString() : "—"),
        },
      ]}
      empty={<EmptyState title="No buckets" subtitle="Create a bucket to get started." />}
      footer={
        <form action="/services/s3" />
      }
    />
  );
}
```

- [ ] **Step 7: Create `apps/web/src/app/services/s3/page.tsx`**

```tsx
import BucketsView from "./BucketsView";
import { listBuckets } from "@/lib/aws/s3";

export const dynamic = "force-dynamic";

export default async function S3Page() {
  const buckets = await listBuckets();
  return <BucketsView buckets={buckets} />;
}
```

- [ ] **Step 8: Create `apps/web/src/app/services/s3/[bucket]/ObjectsView.tsx`**

```tsx
"use client";

import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import { useRouter } from "next/navigation";
import ResourceTable from "@/components/resources/ResourceTable";
import EmptyState from "@/components/resources/EmptyState";
import { formatBytes } from "@/lib/utils";

type Row =
  | { kind: "prefix"; name: string }
  | { kind: "object"; name: string; size: number; lastModified: string | null };

export default function ObjectsView({
  bucket,
  prefix,
  rows,
}: {
  bucket: string;
  prefix: string;
  rows: Row[];
}) {
  const router = useRouter();
  const go = (p: string) =>
    router.push(`/services/s3/${encodeURIComponent(bucket)}?prefix=${encodeURIComponent(p)}`);
  return (
    <ResourceTable<Row>
      items={rows}
      header={<Header variant="h1">{bucket}{prefix ? ` / ${prefix}` : ""}</Header>}
      columnDefinitions={[
        {
          id: "name",
          header: "Key",
          cell: (r) =>
            r.kind === "prefix" ? (
              <Link href="#" onFollow={(e) => { e.preventDefault(); go(r.name); }}>
                {r.name}
              </Link>
            ) : (
              r.name
            ),
        },
        {
          id: "size",
          header: "Size",
          cell: (r) => (r.kind === "object" ? formatBytes(r.size) : "—"),
        },
        {
          id: "modified",
          header: "Last modified",
          cell: (r) =>
            r.kind === "object" && r.lastModified
              ? new Date(r.lastModified).toLocaleString()
              : "—",
        },
      ]}
      empty={<EmptyState title="Empty" subtitle="No objects under this prefix." />}
    />
  );
}
```

- [ ] **Step 9: Create `apps/web/src/app/services/s3/[bucket]/page.tsx`**

```tsx
import ObjectsView from "./ObjectsView";
import { listObjects } from "@/lib/aws/s3";

export const dynamic = "force-dynamic";

export default async function BucketPage({
  params,
  searchParams,
}: {
  params: Promise<{ bucket: string }>;
  searchParams: Promise<{ prefix?: string }>;
}) {
  const { bucket } = await params;
  const { prefix = "" } = await searchParams;
  const decoded = decodeURIComponent(bucket);
  const { objects, prefixes } = await listObjects(decoded, prefix);
  const rows = [
    ...prefixes.map((name) => ({ kind: "prefix" as const, name })),
    ...objects.map((o) => ({
      kind: "object" as const,
      name: o.key,
      size: o.size,
      lastModified: o.lastModified,
    })),
  ];
  return <ObjectsView bucket={decoded} prefix={prefix} rows={rows} />;
}
```

- [ ] **Step 10: Run tests and build**

Run: `npm run test -w web && npm run build -w web`
Expected: tests PASS, build succeeds.

- [ ] **Step 11: Commit**

```bash
git add apps/web/src/lib/aws/s3.ts apps/web/src/lib/aws/s3.test.ts apps/web/src/app/services/s3
git commit -m "Add S3 service: buckets, objects, and preview"
```

---

### Task 8: Lambda service (functions → configuration detail)

**Files:**
- Create: `apps/web/src/lib/aws/lambda.ts`
- Test: `apps/web/src/lib/aws/lambda.test.ts`
- Create: `apps/web/src/app/services/lambda/page.tsx`
- Create: `apps/web/src/app/services/lambda/FunctionsView.tsx`
- Create: `apps/web/src/app/services/lambda/[name]/page.tsx`
- Create: `apps/web/src/app/services/lambda/[name]/FunctionDetail.tsx`

**Interfaces:**
- Consumes: `clientConfig` (Task 2), `ResourceTable`/`EmptyState` (Task 5).
- Produces:
  - `listFunctions(): Promise<Array<{ name: string; runtime: string; memory: number; timeout: number; description: string }>>`
  - `getFunction(name: string): Promise<{ name: string; runtime: string; memory: number; timeout: number; handler: string; description: string; lastModified: string; env: Record<string, string> }>`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/lib/aws/lambda.test.ts`:

```ts
import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  LambdaClient,
  ListFunctionsCommand,
} from "@aws-sdk/client-lambda";
import { listFunctions } from "@/lib/aws/lambda";

const lambda = mockClient(LambdaClient);

afterEach(() => lambda.reset());

describe("listFunctions", () => {
  it("maps and sorts functions", async () => {
    lambda.on(ListFunctionsCommand).resolves({
      Functions: [
        { FunctionName: "b", Runtime: "nodejs20.x", MemorySize: 256, Timeout: 10 },
        { FunctionName: "a", Runtime: "python3.12", MemorySize: 128, Timeout: 3 },
      ],
    });
    const result = await listFunctions();
    expect(result.map((f) => f.name)).toEqual(["a", "b"]);
    expect(result[0]).toMatchObject({ runtime: "python3.12", memory: 128, timeout: 3 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -w web`
Expected: FAIL — cannot resolve `@/lib/aws/lambda`.

- [ ] **Step 3: Write `apps/web/src/lib/aws/lambda.ts`**

```ts
import {
  GetFunctionConfigurationCommand,
  LambdaClient,
  ListFunctionsCommand,
} from "@aws-sdk/client-lambda";
import { clientConfig } from "@/lib/aws/config";

function lambdaClient() {
  return new LambdaClient(clientConfig());
}

export async function listFunctions(): Promise<
  Array<{
    name: string;
    runtime: string;
    memory: number;
    timeout: number;
    description: string;
  }>
> {
  const out = await lambdaClient().send(new ListFunctionsCommand({}));
  return (out.Functions ?? [])
    .map((f) => ({
      name: f.FunctionName ?? "",
      runtime: f.Runtime ?? "",
      memory: f.MemorySize ?? 0,
      timeout: f.Timeout ?? 0,
      description: f.Description ?? "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getFunction(name: string): Promise<{
  name: string;
  runtime: string;
  memory: number;
  timeout: number;
  handler: string;
  description: string;
  lastModified: string;
  env: Record<string, string>;
}> {
  const out = await lambdaClient().send(
    new GetFunctionConfigurationCommand({ FunctionName: name }),
  );
  return {
    name: out.FunctionName ?? name,
    runtime: out.Runtime ?? "",
    memory: out.MemorySize ?? 0,
    timeout: out.Timeout ?? 0,
    handler: out.Handler ?? "",
    description: out.Description ?? "",
    lastModified: out.LastModified ?? "",
    env: out.Environment?.Variables ?? {},
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -w web`
Expected: PASS.

- [ ] **Step 5: Create `apps/web/src/app/services/lambda/FunctionsView.tsx`**

```tsx
"use client";

import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import { useRouter } from "next/navigation";
import ResourceTable from "@/components/resources/ResourceTable";
import EmptyState from "@/components/resources/EmptyState";

type Fn = {
  name: string;
  runtime: string;
  memory: number;
  timeout: number;
  description: string;
};

export default function FunctionsView({ functions }: { functions: Fn[] }) {
  const router = useRouter();
  return (
    <ResourceTable<Fn>
      items={functions}
      header={<Header variant="h1" counter={`(${functions.length})`}>Functions</Header>}
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          cell: (f) => (
            <Link
              href={`/services/lambda/${encodeURIComponent(f.name)}`}
              onFollow={(e) => {
                e.preventDefault();
                router.push(`/services/lambda/${encodeURIComponent(f.name)}`);
              }}
            >
              {f.name}
            </Link>
          ),
        },
        { id: "runtime", header: "Runtime", cell: (f) => f.runtime || "—" },
        { id: "memory", header: "Memory (MB)", cell: (f) => f.memory },
        { id: "timeout", header: "Timeout (s)", cell: (f) => f.timeout },
      ]}
      empty={<EmptyState title="No functions" subtitle="Deploy a Lambda to see it here." />}
    />
  );
}
```

- [ ] **Step 6: Create `apps/web/src/app/services/lambda/page.tsx`**

```tsx
import FunctionsView from "./FunctionsView";
import { listFunctions } from "@/lib/aws/lambda";

export const dynamic = "force-dynamic";

export default async function LambdaPage() {
  const functions = await listFunctions();
  return <FunctionsView functions={functions} />;
}
```

- [ ] **Step 7: Create `apps/web/src/app/services/lambda/[name]/FunctionDetail.tsx`**

```tsx
"use client";

import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";

type Detail = {
  name: string;
  runtime: string;
  memory: number;
  timeout: number;
  handler: string;
  description: string;
  lastModified: string;
  env: Record<string, string>;
};

export default function FunctionDetail({ detail }: { detail: Detail }) {
  const envEntries = Object.entries(detail.env);
  return (
    <ContentLayout header={<Header variant="h1">{detail.name}</Header>}>
      <Container header={<Header variant="h2">Configuration</Header>}>
        <KeyValuePairs
          columns={3}
          items={[
            { label: "Runtime", value: detail.runtime || "—" },
            { label: "Handler", value: detail.handler || "—" },
            { label: "Memory (MB)", value: String(detail.memory) },
            { label: "Timeout (s)", value: String(detail.timeout) },
            { label: "Last modified", value: detail.lastModified || "—" },
            { label: "Description", value: detail.description || "—" },
            {
              label: "Environment",
              value: envEntries.length
                ? envEntries.map(([k, v]) => `${k}=${v}`).join(", ")
                : "—",
            },
          ]}
        />
      </Container>
    </ContentLayout>
  );
}
```

- [ ] **Step 8: Create `apps/web/src/app/services/lambda/[name]/page.tsx`**

```tsx
import FunctionDetail from "./FunctionDetail";
import { getFunction } from "@/lib/aws/lambda";

export const dynamic = "force-dynamic";

export default async function LambdaDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const detail = await getFunction(decodeURIComponent(name));
  return <FunctionDetail detail={detail} />;
}
```

- [ ] **Step 9: Run tests and build**

Run: `npm run test -w web && npm run build -w web`
Expected: tests PASS, build succeeds.

- [ ] **Step 10: Commit**

```bash
git add apps/web/src/lib/aws/lambda.ts apps/web/src/lib/aws/lambda.test.ts apps/web/src/app/services/lambda
git commit -m "Add Lambda service: functions and configuration detail"
```

---

### Task 9: DynamoDB service (tables → detail + item scan)

**Files:**
- Create: `apps/web/src/lib/aws/dynamodb.ts`
- Test: `apps/web/src/lib/aws/dynamodb.test.ts`
- Create: `apps/web/src/app/services/dynamodb/page.tsx`
- Create: `apps/web/src/app/services/dynamodb/TablesView.tsx`
- Create: `apps/web/src/app/services/dynamodb/[table]/page.tsx`
- Create: `apps/web/src/app/services/dynamodb/[table]/TableDetail.tsx`

**Interfaces:**
- Consumes: `clientConfig` (Task 2), `ResourceTable`/`EmptyState` (Task 5).
- Produces:
  - `listTables(): Promise<string[]>`
  - `describeTable(name: string): Promise<{ name: string; status: string; itemCount: number; keys: Array<{ name: string; type: string }> }>`
  - `scanItems(name: string): Promise<{ items: Array<Record<string, unknown>>; columns: string[] }>`

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/lib/aws/dynamodb.test.ts`:

```ts
import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  DynamoDBClient,
  ListTablesCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { listTables, scanItems } from "@/lib/aws/dynamodb";

const ddb = mockClient(DynamoDBClient);

afterEach(() => ddb.reset());

describe("listTables", () => {
  it("returns sorted table names", async () => {
    ddb.on(ListTablesCommand).resolves({ TableNames: ["z", "a"] });
    expect(await listTables()).toEqual(["a", "z"]);
  });
});

describe("scanItems", () => {
  it("unmarshalls items and collects columns", async () => {
    ddb.on(ScanCommand).resolves({
      Items: [
        { id: { S: "1" }, n: { N: "42" } },
        { id: { S: "2" }, active: { BOOL: true } },
      ],
    });
    const result = await scanItems("t");
    expect(result.items[0]).toEqual({ id: "1", n: 42 });
    expect(result.columns.sort()).toEqual(["active", "id", "n"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -w web`
Expected: FAIL — cannot resolve `@/lib/aws/dynamodb`.

- [ ] **Step 3: Write `apps/web/src/lib/aws/dynamodb.ts`**

```ts
import {
  DescribeTableCommand,
  DynamoDBClient,
  ListTablesCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { clientConfig } from "@/lib/aws/config";

function dynamoClient() {
  return new DynamoDBClient(clientConfig());
}

const scanLimit = 100;

export async function listTables(): Promise<string[]> {
  const out = await dynamoClient().send(new ListTablesCommand({}));
  return (out.TableNames ?? []).slice().sort((a, b) => a.localeCompare(b));
}

export async function describeTable(name: string): Promise<{
  name: string;
  status: string;
  itemCount: number;
  keys: Array<{ name: string; type: string }>;
}> {
  const out = await dynamoClient().send(
    new DescribeTableCommand({ TableName: name }),
  );
  const t = out.Table ?? {};
  return {
    name: t.TableName ?? name,
    status: t.TableStatus ?? "",
    itemCount: t.ItemCount ?? 0,
    keys: (t.KeySchema ?? []).map((k) => ({
      name: k.AttributeName ?? "",
      type: k.KeyType ?? "",
    })),
  };
}

export async function scanItems(name: string): Promise<{
  items: Array<Record<string, unknown>>;
  columns: string[];
}> {
  const out = await dynamoClient().send(
    new ScanCommand({ TableName: name, Limit: scanLimit }),
  );
  const items = (out.Items ?? []).map((i) => unmarshall(i));
  const columns = Array.from(
    new Set(items.flatMap((i) => Object.keys(i))),
  );
  return { items, columns };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -w web`
Expected: PASS.

- [ ] **Step 5: Create `apps/web/src/app/services/dynamodb/TablesView.tsx`**

```tsx
"use client";

import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import { useRouter } from "next/navigation";
import ResourceTable from "@/components/resources/ResourceTable";
import EmptyState from "@/components/resources/EmptyState";

type Row = { name: string };

export default function TablesView({ tables }: { tables: string[] }) {
  const router = useRouter();
  const rows = tables.map((name) => ({ name }));
  return (
    <ResourceTable<Row>
      items={rows}
      header={<Header variant="h1" counter={`(${rows.length})`}>Tables</Header>}
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          cell: (r) => (
            <Link
              href={`/services/dynamodb/${encodeURIComponent(r.name)}`}
              onFollow={(e) => {
                e.preventDefault();
                router.push(`/services/dynamodb/${encodeURIComponent(r.name)}`);
              }}
            >
              {r.name}
            </Link>
          ),
        },
      ]}
      empty={<EmptyState title="No tables" subtitle="Create a DynamoDB table to see it here." />}
    />
  );
}
```

- [ ] **Step 6: Create `apps/web/src/app/services/dynamodb/page.tsx`**

```tsx
import TablesView from "./TablesView";
import { listTables } from "@/lib/aws/dynamodb";

export const dynamic = "force-dynamic";

export default async function DynamoPage() {
  const tables = await listTables();
  return <TablesView tables={tables} />;
}
```

- [ ] **Step 7: Create `apps/web/src/app/services/dynamodb/[table]/TableDetail.tsx`**

```tsx
"use client";

import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import SpaceBetween from "@cloudscape-design/components/space-between";
import ResourceTable from "@/components/resources/ResourceTable";
import EmptyState from "@/components/resources/EmptyState";

type Detail = {
  name: string;
  status: string;
  itemCount: number;
  keys: Array<{ name: string; type: string }>;
};

export default function TableDetail({
  detail,
  items,
  columns,
}: {
  detail: Detail;
  items: Array<Record<string, unknown>>;
  columns: string[];
}) {
  return (
    <ContentLayout header={<Header variant="h1">{detail.name}</Header>}>
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Overview</Header>}>
          <KeyValuePairs
            columns={3}
            items={[
              { label: "Status", value: detail.status || "—" },
              { label: "Item count", value: String(detail.itemCount) },
              {
                label: "Keys",
                value: detail.keys.map((k) => `${k.name} (${k.type})`).join(", ") || "—",
              },
            ]}
          />
        </Container>
        <ResourceTable<Record<string, unknown>>
          items={items}
          header={<Header variant="h2" counter={`(${items.length})`}>Items</Header>}
          columnDefinitions={columns.map((col) => ({
            id: col,
            header: col,
            cell: (item: Record<string, unknown>) => {
              const v = item[col];
              return v === undefined ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v);
            },
          }))}
          empty={<EmptyState title="No items" subtitle="This table has no items." />}
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
```

- [ ] **Step 8: Create `apps/web/src/app/services/dynamodb/[table]/page.tsx`**

```tsx
import TableDetail from "./TableDetail";
import { describeTable, scanItems } from "@/lib/aws/dynamodb";

export const dynamic = "force-dynamic";

export default async function DynamoTablePage({
  params,
}: {
  params: Promise<{ table: string }>;
}) {
  const { table } = await params;
  const name = decodeURIComponent(table);
  const detail = await describeTable(name);
  const { items, columns } = await scanItems(name);
  return <TableDetail detail={detail} items={items} columns={columns} />;
}
```

- [ ] **Step 9: Run tests and build**

Run: `npm run test -w web && npm run build -w web`
Expected: tests PASS, build succeeds.

- [ ] **Step 10: Commit**

```bash
git add apps/web/src/lib/aws/dynamodb.ts apps/web/src/lib/aws/dynamodb.test.ts apps/web/src/app/services/dynamodb
git commit -m "Add DynamoDB service: tables, detail, and item scan"
```

---

### Task 10: SQS service (queues → detail, peek + purge)

**Files:**
- Create: `apps/web/src/lib/aws/sqs.ts`
- Test: `apps/web/src/lib/aws/sqs.test.ts`
- Create: `apps/web/src/app/services/sqs/actions.ts`
- Create: `apps/web/src/app/services/sqs/page.tsx`
- Create: `apps/web/src/app/services/sqs/QueuesView.tsx`
- Create: `apps/web/src/app/services/sqs/[queue]/page.tsx`
- Create: `apps/web/src/app/services/sqs/[queue]/QueueDetail.tsx`

**Interfaces:**
- Consumes: `clientConfig` (Task 2), `ResourceTable`/`EmptyState` (Task 5).
- Produces:
  - `listQueues(): Promise<Array<{ url: string; name: string; visible: string; inflight: string }>>`
  - `peekMessages(url: string): Promise<Array<{ messageId: string; body: string }>>`
  - `purgeQueueByUrl(url: string): Promise<void>`
  - `purgeQueueAction(formData: FormData): Promise<void>` (server action)

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/lib/aws/sqs.test.ts`:

```ts
import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  GetQueueAttributesCommand,
  ListQueuesCommand,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { listQueues, peekMessages } from "@/lib/aws/sqs";

const sqs = mockClient(SQSClient);

afterEach(() => sqs.reset());

describe("listQueues", () => {
  it("maps queue urls with attributes", async () => {
    sqs.on(ListQueuesCommand).resolves({
      QueueUrls: ["http://localstack:4566/000000000000/orders"],
    });
    sqs.on(GetQueueAttributesCommand).resolves({
      Attributes: {
        ApproximateNumberOfMessages: "5",
        ApproximateNumberOfMessagesNotVisible: "1",
      },
    });
    const result = await listQueues();
    expect(result).toEqual([
      { url: "http://localstack:4566/000000000000/orders", name: "orders", visible: "5", inflight: "1" },
    ]);
  });
});

describe("peekMessages", () => {
  it("returns message id and body", async () => {
    sqs.on(ReceiveMessageCommand).resolves({
      Messages: [{ MessageId: "m1", Body: "hello" }],
    });
    expect(await peekMessages("u")).toEqual([{ messageId: "m1", body: "hello" }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -w web`
Expected: FAIL — cannot resolve `@/lib/aws/sqs`.

- [ ] **Step 3: Write `apps/web/src/lib/aws/sqs.ts`**

```ts
import {
  GetQueueAttributesCommand,
  ListQueuesCommand,
  PurgeQueueCommand,
  ReceiveMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { clientConfig } from "@/lib/aws/config";

function sqsClient() {
  return new SQSClient(clientConfig());
}

export async function listQueues(): Promise<
  Array<{ url: string; name: string; visible: string; inflight: string }>
> {
  const client = sqsClient();
  const out = await client.send(new ListQueuesCommand({}));
  const urls = out.QueueUrls ?? [];
  const queues = await Promise.all(
    urls.map(async (url) => {
      const attrs = await client.send(
        new GetQueueAttributesCommand({
          QueueUrl: url,
          AttributeNames: ["All"],
        }),
      );
      const a = attrs.Attributes ?? {};
      return {
        url,
        name: url.split("/").pop() ?? url,
        visible: a.ApproximateNumberOfMessages ?? "0",
        inflight: a.ApproximateNumberOfMessagesNotVisible ?? "0",
      };
    }),
  );
  return queues.sort((x, y) => x.name.localeCompare(y.name));
}

export async function peekMessages(
  url: string,
): Promise<Array<{ messageId: string; body: string }>> {
  const out = await sqsClient().send(
    new ReceiveMessageCommand({
      QueueUrl: url,
      MaxNumberOfMessages: 10,
      VisibilityTimeout: 0,
      WaitTimeSeconds: 0,
    }),
  );
  return (out.Messages ?? []).map((m) => ({
    messageId: m.MessageId ?? "",
    body: m.Body ?? "",
  }));
}

export async function purgeQueueByUrl(url: string): Promise<void> {
  await sqsClient().send(new PurgeQueueCommand({ QueueUrl: url }));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -w web`
Expected: PASS.

- [ ] **Step 5: Create `apps/web/src/app/services/sqs/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { purgeQueueByUrl } from "@/lib/aws/sqs";

export async function purgeQueueAction(formData: FormData): Promise<void> {
  const url = String(formData.get("url") ?? "");
  if (!url) return;
  await purgeQueueByUrl(url);
  revalidatePath(`/services/sqs/${encodeURIComponent(url.split("/").pop() ?? "")}`);
}
```

- [ ] **Step 6: Create `apps/web/src/app/services/sqs/QueuesView.tsx`**

```tsx
"use client";

import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import { useRouter } from "next/navigation";
import ResourceTable from "@/components/resources/ResourceTable";
import EmptyState from "@/components/resources/EmptyState";

type Queue = { url: string; name: string; visible: string; inflight: string };

export default function QueuesView({ queues }: { queues: Queue[] }) {
  const router = useRouter();
  return (
    <ResourceTable<Queue>
      items={queues}
      header={<Header variant="h1" counter={`(${queues.length})`}>Queues</Header>}
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          cell: (q) => (
            <Link
              href={`/services/sqs/${encodeURIComponent(q.name)}`}
              onFollow={(e) => {
                e.preventDefault();
                router.push(`/services/sqs/${encodeURIComponent(q.name)}?url=${encodeURIComponent(q.url)}`);
              }}
            >
              {q.name}
            </Link>
          ),
        },
        { id: "visible", header: "Visible", cell: (q) => q.visible },
        { id: "inflight", header: "In flight", cell: (q) => q.inflight },
      ]}
      empty={<EmptyState title="No queues" subtitle="Create an SQS queue to see it here." />}
    />
  );
}
```

- [ ] **Step 7: Create `apps/web/src/app/services/sqs/page.tsx`**

```tsx
import QueuesView from "./QueuesView";
import { listQueues } from "@/lib/aws/sqs";

export const dynamic = "force-dynamic";

export default async function SqsPage() {
  const queues = await listQueues();
  return <QueuesView queues={queues} />;
}
```

- [ ] **Step 8: Create `apps/web/src/app/services/sqs/[queue]/QueueDetail.tsx`**

```tsx
"use client";

import Button from "@cloudscape-design/components/button";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import { useRouter } from "next/navigation";
import ResourceTable from "@/components/resources/ResourceTable";
import EmptyState from "@/components/resources/EmptyState";
import { purgeQueueAction } from "../actions";

type Message = { messageId: string; body: string };

export default function QueueDetail({
  name,
  url,
  messages,
}: {
  name: string;
  url: string;
  messages: Message[];
}) {
  const router = useRouter();
  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button onClick={() => router.refresh()}>Refresh</Button>
              <form action={purgeQueueAction}>
                <input type="hidden" name="url" value={url} />
                <Button variant="normal" formAction={purgeQueueAction}>
                  Purge
                </Button>
              </form>
            </SpaceBetween>
          }
        >
          {name}
        </Header>
      }
    >
      <ResourceTable<Message>
        items={messages}
        header={<Header variant="h2" counter={`(${messages.length})`}>Messages (peek)</Header>}
        columnDefinitions={[
          { id: "id", header: "Message ID", cell: (m) => m.messageId },
          { id: "body", header: "Body", cell: (m) => m.body },
        ]}
        empty={<EmptyState title="No messages" subtitle="The queue is empty (or messages are in flight)." />}
      />
    </ContentLayout>
  );
}
```

- [ ] **Step 9: Create `apps/web/src/app/services/sqs/[queue]/page.tsx`**

```tsx
import QueueDetail from "./QueueDetail";
import { peekMessages } from "@/lib/aws/sqs";

export const dynamic = "force-dynamic";

export default async function SqsQueuePage({
  params,
  searchParams,
}: {
  params: Promise<{ queue: string }>;
  searchParams: Promise<{ url?: string }>;
}) {
  const { queue } = await params;
  const { url = "" } = await searchParams;
  const name = decodeURIComponent(queue);
  const messages = url ? await peekMessages(url) : [];
  return <QueueDetail name={name} url={url} messages={messages} />;
}
```

- [ ] **Step 10: Run tests and build**

Run: `npm run test -w web && npm run build -w web`
Expected: tests PASS, build succeeds.

- [ ] **Step 11: Commit**

```bash
git add apps/web/src/lib/aws/sqs.ts apps/web/src/lib/aws/sqs.test.ts apps/web/src/app/services/sqs
git commit -m "Add SQS service: queues, peek messages, and purge"
```

---

### Task 11: SNS service (topics → detail, publish)

**Files:**
- Create: `apps/web/src/lib/aws/sns.ts`
- Test: `apps/web/src/lib/aws/sns.test.ts`
- Create: `apps/web/src/app/services/sns/actions.ts`
- Create: `apps/web/src/app/services/sns/page.tsx`
- Create: `apps/web/src/app/services/sns/TopicsView.tsx`
- Create: `apps/web/src/app/services/sns/[topic]/page.tsx`
- Create: `apps/web/src/app/services/sns/[topic]/TopicDetail.tsx`

**Interfaces:**
- Consumes: `clientConfig` (Task 2), `ResourceTable`/`EmptyState` (Task 5).
- Produces:
  - `listTopics(): Promise<Array<{ arn: string; name: string }>>`
  - `listSubscriptions(arn: string): Promise<Array<{ protocol: string; endpoint: string }>>`
  - `publish(arn: string, message: string): Promise<{ messageId: string }>`
  - `publishAction(formData: FormData): Promise<void>` (server action)

- [ ] **Step 1: Write the failing test**

Create `apps/web/src/lib/aws/sns.test.ts`:

```ts
import { afterEach, describe, expect, it } from "vitest";
import { mockClient } from "aws-sdk-client-mock";
import {
  ListTopicsCommand,
  PublishCommand,
  SNSClient,
} from "@aws-sdk/client-sns";
import { listTopics, publish } from "@/lib/aws/sns";

const sns = mockClient(SNSClient);

afterEach(() => sns.reset());

describe("listTopics", () => {
  it("derives names from arns and sorts", async () => {
    sns.on(ListTopicsCommand).resolves({
      Topics: [
        { TopicArn: "arn:aws:sns:us-east-1:000000000000:zeta" },
        { TopicArn: "arn:aws:sns:us-east-1:000000000000:alpha" },
      ],
    });
    const result = await listTopics();
    expect(result.map((t) => t.name)).toEqual(["alpha", "zeta"]);
  });
});

describe("publish", () => {
  it("returns the message id", async () => {
    sns.on(PublishCommand).resolves({ MessageId: "abc" });
    expect(await publish("arn", "hi")).toEqual({ messageId: "abc" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -w web`
Expected: FAIL — cannot resolve `@/lib/aws/sns`.

- [ ] **Step 3: Write `apps/web/src/lib/aws/sns.ts`**

```ts
import {
  ListSubscriptionsByTopicCommand,
  ListTopicsCommand,
  PublishCommand,
  SNSClient,
} from "@aws-sdk/client-sns";
import { clientConfig } from "@/lib/aws/config";

function snsClient() {
  return new SNSClient(clientConfig());
}

export async function listTopics(): Promise<
  Array<{ arn: string; name: string }>
> {
  const out = await snsClient().send(new ListTopicsCommand({}));
  return (out.Topics ?? [])
    .map((t) => {
      const arn = t.TopicArn ?? "";
      return { arn, name: arn.split(":").pop() ?? arn };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function listSubscriptions(
  arn: string,
): Promise<Array<{ protocol: string; endpoint: string }>> {
  const out = await snsClient().send(
    new ListSubscriptionsByTopicCommand({ TopicArn: arn }),
  );
  return (out.Subscriptions ?? []).map((s) => ({
    protocol: s.Protocol ?? "",
    endpoint: s.Endpoint ?? "",
  }));
}

export async function publish(
  arn: string,
  message: string,
): Promise<{ messageId: string }> {
  const out = await snsClient().send(
    new PublishCommand({ TopicArn: arn, Message: message }),
  );
  return { messageId: out.MessageId ?? "" };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -w web`
Expected: PASS.

- [ ] **Step 5: Create `apps/web/src/app/services/sns/actions.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { publish } from "@/lib/aws/sns";

export async function publishAction(formData: FormData): Promise<void> {
  const arn = String(formData.get("arn") ?? "");
  const message = String(formData.get("message") ?? "");
  if (!arn || !message) return;
  await publish(arn, message);
  revalidatePath(`/services/sns/${encodeURIComponent(arn.split(":").pop() ?? "")}`);
}
```

- [ ] **Step 6: Create `apps/web/src/app/services/sns/TopicsView.tsx`**

```tsx
"use client";

import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import { useRouter } from "next/navigation";
import ResourceTable from "@/components/resources/ResourceTable";
import EmptyState from "@/components/resources/EmptyState";

type Topic = { arn: string; name: string };

export default function TopicsView({ topics }: { topics: Topic[] }) {
  const router = useRouter();
  return (
    <ResourceTable<Topic>
      items={topics}
      header={<Header variant="h1" counter={`(${topics.length})`}>Topics</Header>}
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          cell: (t) => (
            <Link
              href={`/services/sns/${encodeURIComponent(t.name)}`}
              onFollow={(e) => {
                e.preventDefault();
                router.push(`/services/sns/${encodeURIComponent(t.name)}?arn=${encodeURIComponent(t.arn)}`);
              }}
            >
              {t.name}
            </Link>
          ),
        },
        { id: "arn", header: "ARN", cell: (t) => t.arn },
      ]}
      empty={<EmptyState title="No topics" subtitle="Create an SNS topic to see it here." />}
    />
  );
}
```

- [ ] **Step 7: Create `apps/web/src/app/services/sns/page.tsx`**

```tsx
import TopicsView from "./TopicsView";
import { listTopics } from "@/lib/aws/sns";

export const dynamic = "force-dynamic";

export default async function SnsPage() {
  const topics = await listTopics();
  return <TopicsView topics={topics} />;
}
```

- [ ] **Step 8: Create `apps/web/src/app/services/sns/[topic]/TopicDetail.tsx`**

```tsx
"use client";

import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import FormField from "@cloudscape-design/components/form-field";
import Header from "@cloudscape-design/components/header";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Textarea from "@cloudscape-design/components/textarea";
import { useState } from "react";
import ResourceTable from "@/components/resources/ResourceTable";
import EmptyState from "@/components/resources/EmptyState";
import { publishAction } from "../actions";

type Subscription = { protocol: string; endpoint: string };

export default function TopicDetail({
  name,
  arn,
  subscriptions,
}: {
  name: string;
  arn: string;
  subscriptions: Subscription[];
}) {
  const [message, setMessage] = useState("");
  return (
    <ContentLayout header={<Header variant="h1">{name}</Header>}>
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Publish message</Header>}>
          <form action={publishAction}>
            <SpaceBetween size="s">
              <input type="hidden" name="arn" value={arn} />
              <FormField label="Message">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.detail.value)}
                  placeholder="Enter a message payload"
                />
              </FormField>
              <input type="hidden" name="message" value={message} />
              <Button variant="primary" formAction={publishAction}>
                Publish
              </Button>
            </SpaceBetween>
          </form>
        </Container>
        <ResourceTable<Subscription>
          items={subscriptions}
          header={<Header variant="h2" counter={`(${subscriptions.length})`}>Subscriptions</Header>}
          columnDefinitions={[
            { id: "protocol", header: "Protocol", cell: (s) => s.protocol },
            { id: "endpoint", header: "Endpoint", cell: (s) => s.endpoint },
          ]}
          empty={<EmptyState title="No subscriptions" subtitle="This topic has no subscriptions." />}
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
```

- [ ] **Step 9: Create `apps/web/src/app/services/sns/[topic]/page.tsx`**

```tsx
import TopicDetail from "./TopicDetail";
import { listSubscriptions } from "@/lib/aws/sns";

export const dynamic = "force-dynamic";

export default async function SnsTopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ topic: string }>;
  searchParams: Promise<{ arn?: string }>;
}) {
  const { topic } = await params;
  const { arn = "" } = await searchParams;
  const name = decodeURIComponent(topic);
  const subscriptions = arn ? await listSubscriptions(arn) : [];
  return <TopicDetail name={name} arn={arn} subscriptions={subscriptions} />;
}
```

- [ ] **Step 10: Run tests and build**

Run: `npm run test -w web && npm run build -w web`
Expected: tests PASS, build succeeds.

- [ ] **Step 11: Commit**

```bash
git add apps/web/src/lib/aws/sns.ts apps/web/src/lib/aws/sns.test.ts apps/web/src/app/services/sns
git commit -m "Add SNS service: topics, subscriptions, and publish"
```

---

### Task 12: Dockerfile + dockerignore + README

Containerize the standalone build and document how to run it against MiniStack/LocalStack.

**Files:**
- Create: `apps/web/Dockerfile`
- Create: `apps/web/.dockerignore`
- Replace: `apps/web/README.md`

**Interfaces:**
- Consumes: `output: "standalone"` + `outputFileTracingRoot` (Task 1).

- [ ] **Step 1: Create `apps/web/.dockerignore`**

```
node_modules
.next
.turbo
npm-debug.log
Dockerfile
.dockerignore
```

- [ ] **Step 2: Create `apps/web/Dockerfile`**

```dockerfile
FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build -w web

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
```

- [ ] **Step 3: Replace `apps/web/README.md`**

````markdown
# StackDeck

A local AWS Console-like web UI for LocalStack/MiniStack, built with Next.js, Cloudscape, and AWS SDK v3.

## Development

```bash
npm install
npm run dev -w web
```

Open http://localhost:4577.

## Configuration

| Env                     | Default                  |
| ----------------------- | ------------------------ |
| `AWS_ENDPOINT_URL`      | `http://localstack:4566` |
| `AWS_ACCESS_KEY_ID`     | `test`                   |
| `AWS_SECRET_ACCESS_KEY` | `test`                   |
| `AWS_REGION`            | `us-east-1`              |

For local dev against a runtime on the host, set `AWS_ENDPOINT_URL=http://localhost:4566`.

## Docker

Build (from the repo root, build context is the monorepo root):

```bash
docker build -f apps/web/Dockerfile -t stackdeck .
```

Run (point it at your local runtime):

```bash
docker run --rm -p 4577:3000 -e AWS_ENDPOINT_URL=http://host.docker.internal:4566 stackdeck
```

When running in the same Docker network as LocalStack/MiniStack, use the service
name, e.g. `-e AWS_ENDPOINT_URL=http://localstack:4566`.
````

- [ ] **Step 4: Verify the Docker build**

Run: `docker build -f apps/web/Dockerfile -t stackdeck .`
Expected: image builds successfully.

- [ ] **Step 5: Smoke-test the container**

Run: `docker run --rm -d -p 4577:3000 --name stackdeck-test stackdeck && sleep 3 && curl -sf http://localhost:4577 >/dev/null && echo OK; docker rm -f stackdeck-test`
Expected: prints `OK` (dashboard renders; it will show "Disconnected" without a runtime, which is correct).

- [ ] **Step 6: Commit**

```bash
git add apps/web/Dockerfile apps/web/.dockerignore apps/web/README.md
git commit -m "Add Dockerfile, dockerignore, and README"
```

---

### Task 13: Manual verification against MiniStack + push

End-to-end check against the real MiniStack used by the other project, then push.

- [ ] **Step 1: Start the dev server pointed at the host runtime**

Run: `AWS_ENDPOINT_URL=http://localhost:4566 npm run dev -w web`
Open http://localhost:4577.

- [ ] **Step 2: Verify each surface (with MiniStack running)**

- Dashboard shows "Connected", the endpoint, region, and account.
- S3: buckets list; clicking a bucket lists objects/prefixes.
- Lambda: functions list; clicking one shows configuration.
- DynamoDB: tables list; clicking one shows overview + a page of items.
- SQS: queues list with counts; queue detail peeks messages; Purge works.
- SNS: topics list; topic detail shows subscriptions; Publish posts a message.

- [ ] **Step 3: Verify the disconnected state**

Stop MiniStack (or run with a bad endpoint) and confirm a service page shows the friendly "Can't reach LocalStack/MiniStack" alert, and the dashboard shows "Disconnected". Restart the dev server normally afterward.

- [ ] **Step 4: Push**

```bash
git push
```

Expected: branch pushed to `origin/main`.

---

## Self-Review Notes

- **Spec coverage:** Dashboard+health (Task 6), S3/Lambda/DynamoDB/SQS/SNS (Tasks 7–11), shell/sidebar/topbar (Task 4), shared resource components + loading/error/empty (Task 5), AWS config with env defaults (Task 2), Cloudscape + Amazon Ember (Tasks 1, 4), SDK v3 (all service tasks), Dockerfile standalone, no docker-compose (Task 12), `npm run dev` dev workflow (Task 1, README), src/ structure (Task 1). All covered.
- **Type consistency:** `clientConfig()`/`getAwsSettings()` names match across tasks; `ResourceTable` uses Cloudscape `TableProps<T>`; service function signatures in each task's Interfaces block match their implementations and page consumers.
- **Note for implementer:** Cloudscape `Link.onFollow` and `SideNavigation.onFollow` use `event.preventDefault()` + `router.push` for client navigation; this is intentional and required because Cloudscape renders its own anchors.
