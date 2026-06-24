<div align="center">

<img src=".github/assets/logo.svg" alt="StackDeck" width="300" />

### The AWS Management Console for your local cloud

**StackDeck** is a self-hosted, open-source web console for [**MiniStack**](https://ministack.org) and [**LocalStack**](https://localstack.cloud) — browse and manage your local AWS resources through a faithful recreation of the real AWS Console.

[![Latest release](https://img.shields.io/github/v/release/liammizrahi/stackdeck?label=latest&color=ED8E33)](https://github.com/liammizrahi/stackdeck/pkgs/container/stackdeck)
[![GitHub stars](https://img.shields.io/github/stars/liammizrahi/stackdeck?color=ED8E33)](https://github.com/liammizrahi/stackdeck/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-ED8E33.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)](https://nextjs.org)
[![Cloudscape](https://img.shields.io/badge/Cloudscape-Design%20System-232F3E)](https://cloudscape.design)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#-contributing)

</div>

---

## ✨ Why StackDeck?

Local AWS emulators are fantastic for development, but you usually poke at them through the CLI or `curl`. StackDeck gives you the **real console experience** on top of your local endpoint:

- 🎯 **Looks like the real thing** — built on [Cloudscape](https://cloudscape.design), AWS's own open-source console design system, down to the Amazon Ember typeface and gradient service icons.
- 🔌 **Zero config** — points at `http://localhost:4566` out of the box. One env var to repoint it anywhere.
- 🗂️ **17 services and counting** — tables, detail tabs, ARNs, tags, property filters, and region switching, all wired to the live AWS SDK.
- 🧪 **Actually interactive** — run SQL against RDS, tail CloudWatch logs, browse S3 objects, publish to SNS, and create resources through proper wizards — not just read-only views.
- 🐳 **Self-hosted & open source** — runs anywhere Node runs; no account, no telemetry, no cost.

## 🚀 Quick start

StackDeck is published as a Docker image — pull it and point it at any LocalStack
or MiniStack endpoint. No checkout, no build step. AWS settings are optional and
default to a local emulator on `http://localhost:4566`.

### Add to your `docker-compose.yml` (recommended)

Drop the service in next to your emulator and point it at the right endpoint:

```yaml
services:
  stackdeck:
    image: ghcr.io/liammizrahi/stackdeck:latest
    ports:
      - "4577:4577"
    environment:
      AWS_ENDPOINT_URL: http://ministack:4566   # your emulator's service name
    depends_on:
      - ministack
```

Then `docker compose up` and open **[http://localhost:4577](http://localhost:4577)**. 🎉

### Run with `docker run`

```bash
docker run --rm -p 4577:4577 \
  --add-host=host.docker.internal:host-gateway \
  -e AWS_ENDPOINT_URL=http://host.docker.internal:4566 \
  ghcr.io/liammizrahi/stackdeck
```

(`host.docker.internal` lets the container reach an emulator running on your host.)

## ⚙️ Configuration

All AWS settings are **optional** — StackDeck defaults to a local emulator on
`http://localhost:4566` with throwaway credentials. Override any of them via
environment variables:

| Variable | Default | Description |
| --- | --- | --- |
| `AWS_ENDPOINT_URL` | `http://localhost:4566` | Local AWS endpoint (MiniStack / LocalStack) |
| `AWS_REGION` | `us-east-1` | Region used for all clients |
| `AWS_ACCESS_KEY_ID` | `test` | Dummy credentials for the emulator |
| `AWS_SECRET_ACCESS_KEY` | `test` | Dummy credentials for the emulator |

> [!IMPORTANT]
> **Networking inside Docker:** `localhost` points at the StackDeck container
> itself, not your host. When running in a container, set `AWS_ENDPOINT_URL` to
> either your emulator's **Compose service name** (e.g. `http://ministack:4566`)
> or **`http://host.docker.internal:4566`** to reach an emulator on your host
> (add `--add-host=host.docker.internal:host-gateway` on Linux).

Running from source? You can also put these in `apps/web/.env.local`.

## 🧩 Services

| Category | Services |
| --- | --- |
| **Compute** | EC2 · Lambda |
| **Storage** | S3 |
| **Database** | DynamoDB · RDS · ElastiCache |
| **Networking & Content Delivery** | CloudFront |
| **Analytics** | Athena |
| **Application Integration** | SQS · SNS · API Gateway · EventBridge |
| **Security, Identity & Compliance** | IAM · Cognito |
| **Management & Governance** | Parameter Store · AppConfig · CloudWatch |

### Highlights

- **RDS explorer** — browse tables, run ad-hoc SQL in a syntax-highlighted editor, add / edit / delete rows, and spin up new instances through a multi-step wizard.
- **CloudWatch Logs** — stream-by-stream viewer with live tailing, time-range filters, and JSON expansion.
- **S3 browser** — navigate prefixes, preview objects, copy ARNs.
- **Create wizards & forms** — resource creation uses Cloudscape wizards/forms instead of bare modals.

> [!NOTE]
> The RDS **SQL editor** and **row editing** run queries by exec'ing into the local
> database container, so they need access to the host Docker socket. They work out of
> the box when running from source; in Docker, mount `/var/run/docker.sock` into the
> StackDeck container and use an image that includes the Docker CLI.

## 🧱 Tech stack

- **[Next.js 16](https://nextjs.org)** (App Router, React Server Components, Server Actions) + **React 19**
- **[Cloudscape Design System](https://cloudscape.design)** — AWS's open-source console components
- **[AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html)**
- **TypeScript** (strict) · **[Turborepo](https://turborepo.com)** monorepo · **Vitest** · **ESLint** · **Prettier**

## 🗺️ Roadmap

- More services (Step Functions, Secrets Manager, Kinesis, …)
- Deeper write operations and resource editing
- Multi-arch published images and versioned releases

## 🤝 Contributing

Contributions are very welcome — new services, bug fixes, and polish alike.

**Local setup** (requires **Node.js ≥ 18**):

```bash
git clone https://github.com/liammizrahi/stackdeck.git
cd stackdeck
npm install
npm run dev        # http://localhost:4577
```

**Opening a pull request**

1. **Fork** the repository and create a branch: `git checkout -b feat/my-change`
2. Make your change. New services follow a repeatable pattern — a `lib/aws/<service>.ts` data layer plus an `app/services/<service>/` route with list and detail pages.
3. Run the checks locally before committing:
   ```bash
   npm run check-types && npm run lint && npm run build
   ```
4. Commit with a clear message and **push** to your fork.
5. **Open a PR** against `main` describing what changed and why. For larger changes, open an issue first to discuss the approach.

**Useful commands**

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server on port **4577** |
| `npm run build` | Production build |
| `npm run lint` | ESLint (zero-warning policy) |
| `npm run check-types` | TypeScript type-check |
| `npm run test -w web` | Vitest unit tests |
| `npm run format` | Prettier across the repo |

## 📄 License

[MIT](LICENSE) © Liam Mizrahi

<div align="center">
<sub>StackDeck is not affiliated with Amazon Web Services. "AWS" and related marks are trademarks of Amazon.com, Inc. or its affiliates.</sub>
</div>
