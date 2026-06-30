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
import type { ClusterDetail, Service } from "@/lib/aws/ecs";
import { columnGroups } from "@/lib/kv";

export default function ClusterDetailView({
  cluster,
  error,
}: {
  cluster: ClusterDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !cluster) {
    return (
      <ContentLayout header={<Header variant="h1">Cluster</Header>}>
        <Alert type="error" header="Failed to load cluster">
          {error ?? "Cluster not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const {
    name,
    arn,
    status,
    runningTasks,
    pendingTasks,
    activeServices,
    containerInstances,
    services,
  } = cluster;

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
                { label: "Cluster name", value: name },
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
                  label: "Status",
                  value: (
                    <StatusIndicator
                      type={status === "ACTIVE" ? "success" : "in-progress"}
                    >
                      {status}
                    </StatusIndicator>
                  ),
                },
                { label: "Running tasks", value: runningTasks },
                { label: "Pending tasks", value: pendingTasks },
                { label: "Active services", value: activeServices },
                { label: "Container instances", value: containerInstances },
              ],
              3,
            )}
          />
        </Container>

        <Table<Service>
          variant="container"
          items={services}
          trackBy="name"
          columnDefinitions={[
            {
              id: "name",
              header: "Service name",
              isRowHeader: true,
              cell: (s) => s.name,
            },
            {
              id: "status",
              header: "Status",
              cell: (s) => (
                <StatusIndicator
                  type={s.status === "ACTIVE" ? "success" : "in-progress"}
                >
                  {s.status}
                </StatusIndicator>
              ),
            },
            {
              id: "desiredCount",
              header: "Desired",
              cell: (s) => s.desiredCount,
            },
            {
              id: "runningCount",
              header: "Running",
              cell: (s) => s.runningCount,
            },
            {
              id: "pendingCount",
              header: "Pending",
              cell: (s) => s.pendingCount,
            },
            {
              id: "launchType",
              header: "Launch type",
              cell: (s) => s.launchType,
            },
            {
              id: "taskDefinition",
              header: "Task definition",
              cell: (s) => s.taskDefinition,
            },
          ]}
          header={
            <Header counter={`(${services.length})`}>Services</Header>
          }
          empty={
            <Box textAlign="center" color="inherit" padding="l">
              <b>No services</b>
            </Box>
          }
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
