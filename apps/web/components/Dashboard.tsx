"use client";

import Box from "@cloudscape-design/components/box";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Grid from "@cloudscape-design/components/grid";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import Link from "@cloudscape-design/components/link";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import { useRouter } from "next/navigation";
import ServiceIcon from "@/components/ServiceIcon";
import { services } from "@/lib/services";

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
    <ContentLayout header={<Header variant="h1">Console Home</Header>}>
      <Grid
        gridDefinition={[
          { colspan: { default: 12, m: 8 } },
          { colspan: { default: 12, m: 4 } },
          { colspan: { default: 12, m: 8 } },
          { colspan: { default: 12, m: 4 } },
        ]}
      >
        <Container header={<Header variant="h2">Services</Header>}>
          <Grid
            gridDefinition={services.map(() => ({
              colspan: { default: 12, xs: 6 },
            }))}
          >
            {services.map((service) => (
              <Link
                key={service.key}
                href={service.href}
                onFollow={(event) => {
                  event.preventDefault();
                  router.push(service.href);
                }}
              >
                <SpaceBetween direction="horizontal" size="s">
                  <ServiceIcon service={service.key} size={32} />
                  <SpaceBetween size="xxxs">
                    <Box variant="strong">{service.name}</Box>
                    <Box variant="small" color="text-body-secondary">
                      {service.description}
                    </Box>
                  </SpaceBetween>
                </SpaceBetween>
              </Link>
            ))}
          </Grid>
        </Container>

        <Container header={<Header variant="h2">Connection</Header>}>
          <SpaceBetween size="m">
            <StatusIndicator type={health.connected ? "success" : "error"}>
              {health.connected ? "Connected" : "Disconnected"}
            </StatusIndicator>
            <KeyValuePairs
              items={[
                { label: "Endpoint", value: health.endpoint },
                { label: "Region", value: health.region },
                { label: "Account", value: health.account ?? "—" },
              ]}
            />
          </SpaceBetween>
        </Container>

        <Container header={<Header variant="h2">Welcome to StackDeck</Header>}>
          <SpaceBetween size="s">
            <Box variant="p">
              StackDeck is a local AWS console for LocalStack and MiniStack. Browse
              and manage your local cloud resources with a familiar interface.
            </Box>
            <Link external href="https://docs.localstack.cloud">
              LocalStack documentation
            </Link>
          </SpaceBetween>
        </Container>

        <Container header={<Header variant="h2">Getting started</Header>}>
          <SpaceBetween size="xs">
            <Link
              href="/services/s3"
              onFollow={(event) => {
                event.preventDefault();
                router.push("/services/s3");
              }}
            >
              Browse S3 buckets
            </Link>
            <Link
              href="/services/lambda"
              onFollow={(event) => {
                event.preventDefault();
                router.push("/services/lambda");
              }}
            >
              Inspect Lambda functions
            </Link>
            <Link
              href="/services/dynamodb"
              onFollow={(event) => {
                event.preventDefault();
                router.push("/services/dynamodb");
              }}
            >
              Query DynamoDB tables
            </Link>
          </SpaceBetween>
        </Container>
      </Grid>
    </ContentLayout>
  );
}
