"use client";

import Badge from "@cloudscape-design/components/badge";
import Box from "@cloudscape-design/components/box";
import BreadcrumbGroup from "@cloudscape-design/components/breadcrumb-group";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import { I18nProvider } from "@cloudscape-design/components/i18n";
import enMessages from "@cloudscape-design/components/i18n/messages/all.en.json";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import TextContent from "@cloudscape-design/components/text-content";
import HeroHeader from "@/components/HeroHeader";
import OnThisPage from "@/components/OnThisPage";
import UserFeedback from "@/components/UserFeedback";

const REPO_URL = "https://github.com/liammizrahi/stackdeck";

function Overview() {
  return (
    <section className="page-section" aria-label="Overview">
      <Header variant="h2">
        <span id="overview">Overview</span>
      </Header>
      <SpaceBetween size="m">
        <div>
          <Box variant="p">
            Local AWS emulators are fantastic for development, but you usually
            poke at them through the CLI or <code>curl</code>. StackDeck gives
            you the real console experience on top of your local endpoint —
            point it at MiniStack or LocalStack and manage your resources
            through proper tables, forms, and wizards.
          </Box>
          <Box variant="p">
            It defaults to <code>http://localhost:4566</code> and needs a single
            environment variable to point somewhere else. No account, no
            telemetry, no cost.
          </Box>
        </div>

        <div>
          <Box variant="h3" margin={{ bottom: "xs" }}>
            Details
          </Box>
          <Box>
            <dl className="product-details" aria-label="Project details">
              <dt>Maintained by</dt>
              <dd>
                <Link href={REPO_URL} external={true} variant="primary">
                  liammizrahi
                </Link>
              </dd>

              <dt>License</dt>
              <dd>MIT (open source)</dd>

              <dt>Delivery method</dt>
              <dd>
                Docker image
                <br />
                Docker Compose
              </dd>

              <dt>Built with</dt>
              <dd>Next.js, Turborepo, Cloudscape, AWS SDK v3</dd>
            </dl>
          </Box>
        </div>

        <div>
          <Header variant="h3">Highlights</Header>
          <TextContent>
            <ul>
              <li>
                Looks like the real thing — a faithful recreation of the AWS
                Management Console.
              </li>
              <li>
                Zero config — defaults to <code>http://localhost:4566</code>; one
                env var to point it elsewhere.
              </li>
              <li>
                17 services and counting — compute, storage, databases,
                messaging, security, and more, all wired to the live AWS SDK.
              </li>
              <li>
                Actually interactive — create and manage resources through
                proper forms and wizards, not just read-only views.
              </li>
              <li>
                Self-hosted &amp; open source — a single Docker container.
              </li>
            </ul>
          </TextContent>
        </div>
      </SpaceBetween>
    </section>
  );
}

function QuickStart() {
  return (
    <section className="page-section" aria-label="Quick start">
      <Header variant="h2">
        <span id="quick-start">Quick start</span>
      </Header>
      <SpaceBetween size="m">
        <Box variant="p">
          StackDeck ships as a single container image. Run it alongside your
          local AWS emulator and open the console in your browser.
        </Box>

        <div>
          <Box variant="h3" margin={{ bottom: "xs" }}>
            Run with Docker
          </Box>
          <pre className="code-block">
            <code>{`docker run --rm -p 4577:4577 \\
  -e AWS_ENDPOINT_URL=http://host.docker.internal:4566 \\
  ghcr.io/liammizrahi/stackdeck:latest`}</code>
          </pre>
        </div>

        <div>
          <Box variant="h3" margin={{ bottom: "xs" }}>
            Configuration
          </Box>
          <Table
            variant="embedded"
            wrapLines={true}
            columnDefinitions={[
              { header: "Environment variable", cell: (item) => item.name },
              { header: "Default", cell: (item) => item.default },
              { header: "Description", cell: (item) => item.description },
            ]}
            items={[
              {
                name: "AWS_ENDPOINT_URL",
                default: "http://localhost:4566",
                description: "Endpoint of your MiniStack/LocalStack instance.",
              },
              {
                name: "AWS_REGION",
                default: "us-east-1",
                description: "Default region used for SDK calls.",
              },
              {
                name: "AWS_ACCESS_KEY_ID",
                default: "test",
                description: "Access key passed to the AWS SDK.",
              },
              {
                name: "AWS_SECRET_ACCESS_KEY",
                default: "test",
                description: "Secret key passed to the AWS SDK.",
              },
            ]}
          />
        </div>

        <Box variant="p">
          Then open{" "}
          <Link href="http://localhost:4577" external={true}>
            http://localhost:4577
          </Link>{" "}
          to browse your local cloud.
        </Box>
      </SpaceBetween>
    </section>
  );
}

function Services() {
  return (
    <section className="page-section" aria-label="Supported services">
      <Box variant="h2" padding={{ bottom: "m" }}>
        <span id="services">Supported services</span>
      </Box>
      <SpaceBetween size="m">
        <Box variant="p">
          StackDeck wires up the live AWS SDK across compute, storage,
          databases, messaging, and security — with more services landing
          regularly.
        </Box>
        <TextContent>
          <ul>
            <li>
              <strong>Compute</strong> — EC2, Lambda
            </li>
            <li>
              <strong>Storage</strong> — S3
            </li>
            <li>
              <strong>Database</strong> — DynamoDB, RDS, ElastiCache
            </li>
            <li>
              <strong>Networking &amp; content delivery</strong> — CloudFront
            </li>
            <li>
              <strong>Analytics</strong> — Athena
            </li>
            <li>
              <strong>Application integration</strong> — SQS, SNS, API Gateway,
              EventBridge
            </li>
            <li>
              <strong>Security, identity &amp; compliance</strong> — IAM, Cognito
            </li>
            <li>
              <strong>Management &amp; governance</strong> — Parameter Store,
              AppConfig, CloudWatch
            </li>
          </ul>
        </TextContent>
      </SpaceBetween>
    </section>
  );
}

function Deployment() {
  return (
    <section className="page-section" aria-label="Deployment">
      <Box variant="h2" padding={{ bottom: "m" }}>
        <span id="deployment">Deployment</span>
      </Box>
      <SpaceBetween size="m">
        <div>
          <Header variant="h3">Single container</Header>
          <Box variant="p">
            StackDeck is distributed as a self-contained Docker image published
            to the GitHub Container Registry. It is a stateless front end — all
            data lives in your local AWS emulator — so you can start, stop, and
            upgrade it freely.{" "}
            <Link
              href={`${REPO_URL}#-quick-start`}
              external={true}
              variant="primary"
              ariaLabel="Learn more about deploying StackDeck (opens in new tab)"
            >
              Learn more
            </Link>
          </Box>
        </div>

        <div>
          <Header variant="h3">Docker Compose</Header>
          <Box variant="p">
            Run StackDeck next to MiniStack or LocalStack with a single{" "}
            <code>docker compose up</code>. A sample{" "}
            <code>docker-compose.yml</code> is included in the repository.
          </Box>
        </div>
      </SpaceBetween>
    </section>
  );
}

function Support() {
  return (
    <section className="page-section" aria-label="Support">
      <Box variant="h2" padding={{ bottom: "m" }}>
        <span id="support">Support</span>
      </Box>
      <SpaceBetween size="m">
        <div>
          <Header variant="h3">Community</Header>
          <Box variant="p">
            StackDeck is community-supported and open source. The fastest way to
            get help, report a bug, or request a feature is through GitHub.
          </Box>
        </div>
        <div>
          <Header variant="h3">Report an issue</Header>
          <Box variant="p">
            Found a bug or have an idea? Open an issue and include your AWS
            emulator, the service you were using, and steps to reproduce.
          </Box>
          <Link
            href={`${REPO_URL}/issues`}
            external={true}
            variant="primary"
            ariaLabel="Open a StackDeck issue on GitHub"
          >
            Open an issue
          </Link>
        </div>
      </SpaceBetween>
    </section>
  );
}

function ProjectCard({
  title,
  category,
  description,
  href,
  isNew = false,
}: {
  title: string;
  category: string;
  description: string;
  href: string;
  isNew?: boolean;
}) {
  return (
    <li className="product-cards-list-item" aria-label={title}>
      <Container>
        <SpaceBetween direction="vertical" size="s">
          <SpaceBetween direction="vertical" size="xxs">
            <Box variant="h3">
              <Link fontSize="inherit" href={href} external={true}>
                {title}
              </Link>
            </Box>
            <Box color="text-body-secondary">{category}</Box>
            {isNew && <Badge color="green">New</Badge>}
          </SpaceBetween>
          <Box variant="p">{description}</Box>
          <Button href={href} target="_blank" ariaLabel={`Visit ${title}`}>
            Learn more
          </Button>
        </SpaceBetween>
      </Container>
    </li>
  );
}

function Related() {
  return (
    <section className="page-section" aria-label="Related projects">
      <Box variant="h2" margin={{ bottom: "m" }}>
        <span id="related">Related projects</span>
      </Box>
      <ul className="product-cards-list">
        <ProjectCard
          title="MiniStack"
          category="Local AWS cloud emulator"
          description="A lightweight local AWS cloud stack. StackDeck connects to it out of the box and gives you a full console on top."
          href="https://ministack.org"
          isNew={true}
        />
        <ProjectCard
          title="LocalStack"
          category="Local AWS cloud emulator"
          description="A fully functional local AWS cloud stack. Point StackDeck at your LocalStack endpoint to manage resources visually."
          href="https://localstack.cloud"
        />
        <ProjectCard
          title="Cloudscape Design System"
          category="UI framework"
          description="The open-source design system that powers StackDeck's faithful recreation of the AWS Management Console."
          href="https://cloudscape.design"
        />
      </ul>
    </section>
  );
}

export default function Page() {
  return (
    <I18nProvider locale="en" messages={[enMessages]}>
      <ContentLayout
        breadcrumbs={
          <BreadcrumbGroup
            items={[
              { href: "/", text: "StackDeck" },
              { href: "#", text: "Documentation" },
            ]}
            expandAriaLabel="Show path"
            ariaLabel="Breadcrumbs"
          />
        }
        headerVariant="high-contrast"
        header={<HeroHeader />}
        defaultPadding={true}
        maxContentWidth={1040}
        disableOverlap={true}
      >
        <div className="product-page-content-grid">
          <div className="on-this-page--mobile">
            <OnThisPage variant="mobile" />
          </div>

          <aside aria-label="Side bar" className="product-page-aside">
            <div className="product-page-aside-sticky">
              <SpaceBetween size="xl">
                <div className="on-this-page--side">
                  <OnThisPage variant="side" />
                </div>
                <hr />
                <UserFeedback />
              </SpaceBetween>
            </div>
          </aside>

          <main className="product-page-content">
            <Overview />
            <QuickStart />
            <Services />
            <Deployment />
            <Support />
            <Related />
          </main>

          <aside className="product-page-mobile" aria-label="Side bar">
            <UserFeedback />
          </aside>
        </div>
      </ContentLayout>
    </I18nProvider>
  );
}
