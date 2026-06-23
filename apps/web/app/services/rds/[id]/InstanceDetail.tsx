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
import Table from "@cloudscape-design/components/table";
import Tabs from "@cloudscape-design/components/tabs";
import type { DbInstance } from "@/lib/aws/rds";

function instanceStatus(
  status: string,
): "success" | "error" | "warning" | "pending" | "stopped" | "in-progress" {
  if (status === "available") return "success";
  if (status === "failed" || status === "incompatible-restore") return "error";
  if (status === "stopped" || status === "stopping") return "stopped";
  if (
    status === "creating" ||
    status === "modifying" ||
    status === "starting" ||
    status === "rebooting"
  )
    return "in-progress";
  return "pending";
}

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString() : "—";
}

function nullableString(value: string | null | undefined): string {
  return value ?? "—";
}

export default function InstanceDetail({
  instance,
  error,
}: {
  instance: DbInstance | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const refresh = () => startTransition(() => router.refresh());

  if (error || !instance) {
    return (
      <ContentLayout header={<Header>DB Instance</Header>}>
        <Alert type="error" header="Failed to load DB instance">
          {error ?? "Instance not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const endpointValue =
    instance.endpointAddress
      ? instance.endpointPort
        ? `${instance.endpointAddress}:${instance.endpointPort}`
        : instance.endpointAddress
      : "—";

  const tags = instance.tags ?? [];

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                iconName="refresh"
                ariaLabel="Refresh"
                onClick={refresh}
                loading={isPending}
              />
            </SpaceBetween>
          }
        >
          {instance.identifier}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={[
              { label: "Engine", value: instance.engine },
              { label: "Engine version", value: nullableString(instance.engineVersion) },
              {
                label: "Status",
                value: (
                  <StatusIndicator type={instanceStatus(instance.status)}>
                    {instance.status}
                  </StatusIndicator>
                ),
              },
              { label: "Class", value: nullableString(instance.instanceClass) },
              { label: "Endpoint", value: endpointValue },
              { label: "DB name", value: nullableString(instance.dbName) },
              { label: "Master username", value: nullableString(instance.masterUsername) },
              {
                label: "Allocated storage",
                value:
                  instance.allocatedStorage != null
                    ? `${instance.allocatedStorage} GiB`
                    : "—",
              },
              {
                label: "Multi-AZ",
                value: instance.multiAz ? "Yes" : "No",
              },
              { label: "Availability zone", value: nullableString(instance.availabilityZone) },
              { label: "Created", value: formatDate(instance.createTime) },
              {
                label: "ARN",
                value: instance.arn ? (
                  <CopyToClipboard
                    variant="inline"
                    textToCopy={instance.arn}
                    copySuccessText="ARN copied"
                    copyErrorText="Failed to copy ARN"
                  />
                ) : (
                  "—"
                ),
              },
            ]}
          />
        </Container>

        <Tabs
          tabs={[
            {
              id: "tags",
              label: "Tags",
              content: (
                <Table<{ key: string; value: string }>
                  variant="container"
                  items={tags}
                  trackBy="key"
                  columnDefinitions={[
                    {
                      id: "key",
                      header: "Key",
                      isRowHeader: true,
                      cell: (tag) => tag.key,
                    },
                    {
                      id: "value",
                      header: "Value",
                      cell: (tag) => tag.value || "—",
                    },
                  ]}
                  header={<Header counter={`(${tags.length})`}>Tags</Header>}
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No tags</b>
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
