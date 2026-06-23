# StackDeck — Local AWS Console for LocalStack/MiniStack

**Status:** Approved design — Phase 1
**Date:** 2026-06-23

## Summary

StackDeck is an open-source, Dockerized Next.js web app that mimics the AWS
Management Console but connects to local AWS-compatible runtimes (LocalStack or
MiniStack). It uses Cloudscape — AWS's open-source design system — for an
authentic console look, and AWS SDK v3 for all service calls. The app is a
polished developer tool in the spirit of Docker Desktop, Portainer, and Lens.

## Goals

- Browse and inspect local AWS resources through a console-grade UI.
- Run locally in Docker (production build) and via `npm run dev` (development).
- Connect to LocalStack/MiniStack with sensible defaults, fully env-configurable.
- Friendly, explicit handling when the local runtime is unreachable.
- Grow service coverage in phases without rework.

## Non-Goals (Phase 1)

- No docker-compose with a bundled LocalStack/MiniStack (the user wires the
  endpoint via env in their own compose). MiniStack from another project is used
  for testing.
- No real-AWS / multi-account support — local endpoints only.
- Services beyond the Phase 1 set (see Phasing).

## Decisions

- **Design system:** Cloudscape (`@cloudscape-design/components`,
  `@cloudscape-design/global-styles`) — the genuine AWS Console system. HeroUI
  and Tailwind are removed from `apps/web`.
- **AWS access:** AWS SDK v3 (`@aws-sdk/client-*`), server-side only. No AWS CLI
  in the Docker image.
- **Font:** Amazon Ember (already added via `next/font/local`), fed into
  Cloudscape's theme as the base font family — the real AWS Console font.
- **Data flow:** React Server Components for initial loads, Server Actions for
  mutations, `router.refresh()` for reloads. No hand-rolled REST layer in Phase 1.

## Architecture

```
Browser ── Cloudscape UI (client components)
   │
   ▼  RSC initial load + Server Actions for mutations
Next.js App Router (apps/web)  ── server-side
   │
   ▼  @aws-sdk/client-*  →  AWS_ENDPOINT_URL (default http://localstack:4566)
LocalStack / MiniStack
```

- AWS SDK v3 clients are created server-side; credentials and endpoint never
  reach the browser.
- RSC pages call `lib/aws/*` functions directly and pass plain serializable
  objects to Cloudscape client components.
- Server Actions perform mutations (SNS publish, SQS purge, S3 preview, etc.).
- Refresh re-runs the RSC via `router.refresh()`.
- Route handlers under `app/api/*` may be added later for services needing
  client-side polling; not required in Phase 1.

## Repository placement & structure

Lives in the existing `stackdeck` turborepo as `apps/web`, switching to a `src/`
layout:

```
apps/web/src/
  app/
    layout.tsx                  # Cloudscape global styles + AppShell
    page.tsx                    # Dashboard
    services/
      s3/        page.tsx, [bucket]/page.tsx
      lambda/    page.tsx, [name]/page.tsx
      dynamodb/  page.tsx, [table]/page.tsx
      sqs/       page.tsx, [queue]/page.tsx
      sns/       page.tsx, [topic]/page.tsx
  components/
    layout/     AppShell.tsx, Sidebar.tsx, Topbar.tsx
    resources/  ResourceTable.tsx, EmptyState.tsx, StatusBadge.tsx, ErrorState.tsx
  lib/
    aws/        config.ts, s3.ts, lambda.ts, dynamodb.ts, sqs.ts, sns.ts
    utils.ts
```

UI is built on Cloudscape primitives: `AppLayout`, `SideNavigation`,
`TopNavigation`, `Table`, `StatusIndicator`, `Cards`, and empty-state slots.

## AWS configuration (`lib/aws/config.ts`)

Central factory for SDK v3 clients. Defaults match the spec; all overridable by
env:

| Env                     | Default                  |
| ----------------------- | ------------------------ |
| `AWS_ENDPOINT_URL`      | `http://localstack:4566` |
| `AWS_ACCESS_KEY_ID`     | `test`                   |
| `AWS_SECRET_ACCESS_KEY` | `test`                   |
| `AWS_REGION`            | `us-east-1`              |

- S3 uses `forcePathStyle: true` (required for LocalStack).
- A short request timeout is applied so an unreachable runtime fails fast.
- Each `lib/aws/<svc>.ts` exports typed functions returning plain serializable
  objects.

## Per-service scope (Phase 1)

- **S3:** list buckets → list objects (prefix navigation) → object preview
  (text/small). Action: create bucket.
- **Lambda:** list functions → function configuration detail (runtime, memory,
  timeout, handler, env, last modified). Read-only.
- **DynamoDB:** list tables → table detail (key schema, indexes, item count) →
  scan a page of items. Read-only.
- **SQS:** list queues with attributes → queue detail. Actions: peek messages
  (visibility-timeout 0), purge queue.
- **SNS:** list topics → topic detail (subscriptions). Action: publish message
  (with optional attributes).

## Error, loading & empty states

- `loading.tsx` per service → Cloudscape loading state during RSC fetch.
- `error.tsx` boundary → detects connection failures (ECONNREFUSED / timeout)
  and renders a friendly Alert: "Can't reach LocalStack/MiniStack at
  `<endpoint>` — is it running?" with a retry control.
- Empty tables → Cloudscape empty state with a relevant call to action.
- Dashboard runs a lightweight health probe (e.g. STS `GetCallerIdentity` or a
  cheap list with a short timeout) and shows a Connected / Disconnected status,
  the configured endpoint, and region.

## Docker

- Multi-stage `apps/web/Dockerfile` using Next.js standalone output
  (`output: 'standalone'`), Node 22 alpine, non-root user.
- No AWS CLI in the image (SDK only) → small image.
- No docker-compose file. The endpoint is provided via env in the user's own
  compose, defaulting to `http://localstack:4566`.
- Development continues via `npm run dev` (port 4577).

## Testing

- Unit-test `lib/aws/*` mapping logic with `aws-sdk-client-mock` (no live AWS).
- Manual verification against the real MiniStack for the integration path.
- No heavy E2E in Phase 1.

## Phasing

- **Phase 1 (this spec):** App shell + dashboard + S3, Lambda, DynamoDB, SQS,
  SNS (list + detail + high-value actions). Runnable against MiniStack.
- **Later phases (separate specs):** RDS, IAM, Cognito, Parameter Store,
  Secrets Manager, EventBridge, Route53, API Gateway, CloudWatch, and beyond.

## Open questions

None blocking Phase 1.
