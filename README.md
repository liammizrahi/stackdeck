<div align="center">

<img src=".github/assets/logo.svg" alt="StackDeck" width="300" />

### The AWS Management Console for your local cloud

**StackDeck** is a self-hosted, open-source web console for [**MiniStack**](https://ministack.org) and [**LocalStack**](https://localstack.cloud) — browse and manage your local AWS resources through a faithful recreation of the real AWS Console.

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

## 🚀 Quick start

### Prerequisites

- **Node.js ≥ 18** and **npm**
- A running **MiniStack** or **LocalStack** on `http://localhost:4566`
- **Docker** — required by your emulator (and by StackDeck's RDS SQL features, which exec into the local database container)

### 1. Start a local AWS emulator

```bash
# MiniStack (recommended)
docker run --rm -p 4566:4566 -v /var/run/docker.sock:/var/run/docker.sock ministackorg/ministack

# …or LocalStack
docker run --rm -p 4566:4566 localstack/localstack
```

### 2. Run StackDeck

```bash
git clone https://github.com/liammizrahi/stackdeck.git
cd stackdeck
npm install
npm run dev
```

Open **[http://localhost:4577](http://localhost:4577)**. 🎉

## ⚙️ Configuration

StackDeck reads standard AWS environment variables. Create `apps/web/.env.local` to override the defaults:

| Variable | Default | Description |
| --- | --- | --- |
| `AWS_ENDPOINT_URL` | `http://localhost:4566` | Local AWS endpoint (MiniStack / LocalStack) |
| `AWS_REGION` | `us-east-1` | Region used for all clients |
| `AWS_ACCESS_KEY_ID` | `test` | Dummy credentials for the emulator |
| `AWS_SECRET_ACCESS_KEY` | `test` | Dummy credentials for the emulator |

```dotenv
# apps/web/.env.local
AWS_ENDPOINT_URL=http://localhost:4566
AWS_REGION=us-east-1
```

## 🧱 Tech stack

- **[Next.js 16](https://nextjs.org)** (App Router, React Server Components, Server Actions) + **React 19**
- **[Cloudscape Design System](https://cloudscape.design)** — AWS's open-source console components
- **[AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html)**
- **TypeScript** (strict) · **[Turborepo](https://turborepo.com)** monorepo · **Vitest** · **ESLint** · **Prettier**

## 📂 Project structure

```
stackdeck/
├─ apps/
│  └─ web/                    # Next.js console (workspace: "web")
│     ├─ app/services/        # one route group per AWS service
│     ├─ components/          # layout (top bar, sidebar) + shared UI
│     ├─ lib/aws/             # AWS SDK v3 data layer — one file per service
│     └─ public/aws-icons/    # gradient service icons
├─ turbo.json
└─ package.json               # npm workspaces + Turborepo
```

Each service follows the same shape: a `lib/aws/<service>.ts` data layer and an `app/services/<service>/` route with a list page and detail pages. Adding a service is mostly a copy-paste-and-wire affair.

## 🛠️ Development

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server on port **4577** |
| `npm run build` | Production build |
| `npm run lint` | ESLint (zero-warning policy) |
| `npm run check-types` | TypeScript type-check |
| `npm run test -w web` | Run Vitest unit tests |
| `npm run format` | Prettier across the repo |

## 🗺️ Roadmap

- More services (Step Functions, Secrets Manager, Kinesis, …)
- Deeper write operations and resource editing
- Packaged Docker image for one-command self-hosting

## 🤝 Contributing

Contributions are welcome! New services follow a clear, repeatable pattern (see [Project structure](#-project-structure)). Open an issue to discuss larger changes, then send a PR — please run `npm run check-types && npm run lint && npm run build` before submitting.

## 📄 License

[MIT](LICENSE) © Liam Mizrahi

<div align="center">
<sub>StackDeck is not affiliated with Amazon Web Services. "AWS" and related marks are trademarks of Amazon.com, Inc. or its affiliates.</sub>
</div>
