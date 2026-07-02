"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import type { StatusIndicatorProps } from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import Tabs from "@cloudscape-design/components/tabs";
import type {
  Listener,
  LoadBalancerDetail,
  TargetGroup,
} from "@/lib/aws/elbv2";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

function stateType(state: string): StatusIndicatorProps.Type {
  if (state === "active") return "success";
  if (state === "provisioning") return "in-progress";
  return "error";
}

export default function LoadBalancerDetailView({
  loadBalancer,
  error,
}: {
  loadBalancer: LoadBalancerDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !loadBalancer) {
    return (
      <ContentLayout header={<Header variant="h1">Load balancer</Header>}>
        <Alert type="error" header="Failed to load load balancer">
          {error ?? "Load balancer not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const {
    arn,
    name,
    dnsName,
    type,
    scheme,
    state,
    vpcId,
    createdTime,
    listeners,
    targetGroups,
  } = loadBalancer;

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <Button
              iconName="refresh"
              ariaLabel="Refresh"
              loading={isPending}
              onClick={() => startTransition(() => router.refresh())}
            />
          }
        >
          {name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups(
              [
                { label: "Name", value: name },
                {
                  label: "ARN",
                  value: (
                    <CopyToClipboard
                      variant="inline"
                      textToCopy={arn}
                      copySuccessText="ARN copied"
                      copyErrorText="Failed to copy ARN"
                    />
                  ),
                },
                {
                  label: "DNS name",
                  value: (
                    <CopyToClipboard
                      variant="inline"
                      textToCopy={dnsName}
                      copySuccessText="DNS name copied"
                      copyErrorText="Failed to copy DNS name"
                    />
                  ),
                },
                { label: "Type", value: type },
                { label: "Scheme", value: scheme },
                {
                  label: "State",
                  value: (
                    <StatusIndicator type={stateType(state)}>
                      {state}
                    </StatusIndicator>
                  ),
                },
                { label: "VPC ID", value: vpcId },
                { label: "Created", value: formatDate(createdTime) },
              ],
              3,
            )}
          />
        </Container>

        <Tabs
          tabs={[
            {
              id: "listeners",
              label: `Listeners (${listeners.length})`,
              content: (
                <Table<Listener>
                  variant="container"
                  items={listeners}
                  trackBy="arn"
                  columnDefinitions={[
                    {
                      id: "protocol",
                      header: "Protocol",
                      isRowHeader: true,
                      cell: (l) => l.protocol,
                    },
                    {
                      id: "port",
                      header: "Port",
                      cell: (l) => (l.port ?? "—"),
                    },
                    {
                      id: "arn",
                      header: "ARN",
                      cell: (l) => (
                        <CopyToClipboard
                          variant="inline"
                          textToCopy={l.arn}
                          copySuccessText="ARN copied"
                          copyErrorText="Failed to copy ARN"
                        />
                      ),
                    },
                  ]}
                  header={
                    <Header counter={`(${listeners.length})`}>Listeners</Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No listeners</b>
                    </Box>
                  }
                />
              ),
            },
            {
              id: "targetGroups",
              label: `Target groups (${targetGroups.length})`,
              content: (
                <Table<TargetGroup>
                  variant="container"
                  items={targetGroups}
                  trackBy="arn"
                  columnDefinitions={[
                    {
                      id: "name",
                      header: "Name",
                      isRowHeader: true,
                      cell: (tg) => tg.name,
                    },
                    {
                      id: "protocol",
                      header: "Protocol",
                      cell: (tg) => tg.protocol,
                    },
                    {
                      id: "port",
                      header: "Port",
                      cell: (tg) => (tg.port ?? "—"),
                    },
                    {
                      id: "targetType",
                      header: "Target type",
                      cell: (tg) => tg.targetType,
                    },
                    {
                      id: "healthCheckPath",
                      header: "Health check path",
                      cell: (tg) => tg.healthCheckPath || "—",
                    },
                  ]}
                  header={
                    <Header counter={`(${targetGroups.length})`}>
                      Target groups
                    </Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No target groups</b>
                    </Box>
                  }
                />
              ),
            },
          ]}
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
