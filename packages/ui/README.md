# `@repo/ui`

Shared UI dependency bundle for the StackDeck monorepo.

This package intentionally ships **no source code** — it only declares the
[Cloudscape Design System](https://cloudscape.design) packages as dependencies.
Both `apps/web` and `apps/docs` depend on `@repo/ui`, so the Cloudscape
versions are declared in exactly one place instead of being duplicated across
every app's `package.json`.

Because npm workspaces hoist these dependencies to the repo root
`node_modules`, the apps import the Cloudscape packages directly, e.g.:

```ts
import Box from "@cloudscape-design/components/box";
```

To bump a Cloudscape version, edit this file and run `npm install` from the
repo root. Remember to keep each app's `next.config.js` `transpilePackages`
list in sync with the packages declared here.
