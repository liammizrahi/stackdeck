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
import type {
  StackDetail,
  StackEvent,
  StackOutput,
  StackParameter,
  StackResource,
} from "@/lib/aws/cloudformation";
import { columnGroups } from "@/lib/kv";
import { stackStatusType } from "../StacksTable";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function StackDetailView({
  stack,
  error,
}: {
  stack: StackDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !stack) {
    return (
      <ContentLayout header={<Header variant="h1">Stack</Header>}>
        <Alert type="error" header="Failed to load stack">
          {error ?? "Stack not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const {
    name,
    id,
    status,
    description,
    createdTime,
    updatedTime,
    outputs,
    parameters,
    resources,
    events,
  } = stack;

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
                { label: "Stack name", value: name },
                {
                  label: "Stack ID",
                  value: (
                    <CopyToClipboard
                      variant="inline"
                      textToCopy={id}
                      copySuccessText="Stack ID copied"
                      copyErrorText="Failed to copy Stack ID"
                    />
                  ),
                },
                {
                  label: "Status",
                  value: (
                    <StatusIndicator type={stackStatusType(status)}>
                      {status}
                    </StatusIndicator>
                  ),
                },
                { label: "Description", value: description || "—" },
                { label: "Created", value: formatDate(createdTime) },
                { label: "Updated", value: formatDate(updatedTime) },
              ],
              3,
            )}
          />
        </Container>

        <Tabs
          tabs={[
            {
              id: "resources",
              label: `Resources (${resources.length})`,
              content: (
                <Table<StackResource>
                  variant="container"
                  items={resources}
                  trackBy="logicalId"
                  columnDefinitions={[
                    {
                      id: "logicalId",
                      header: "Logical ID",
                      isRowHeader: true,
                      cell: (r) => r.logicalId,
                    },
                    {
                      id: "type",
                      header: "Type",
                      cell: (r) => r.type,
                    },
                    {
                      id: "physicalId",
                      header: "Physical ID",
                      cell: (r) => r.physicalId || "—",
                    },
                    {
                      id: "status",
                      header: "Status",
                      cell: (r) => (
                        <StatusIndicator type={stackStatusType(r.status)}>
                          {r.status}
                        </StatusIndicator>
                      ),
                    },
                  ]}
                  header={
                    <Header counter={`(${resources.length})`}>Resources</Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No resources</b>
                    </Box>
                  }
                />
              ),
            },
            {
              id: "outputs",
              label: `Outputs (${outputs.length})`,
              content: (
                <Table<StackOutput>
                  variant="container"
                  items={outputs}
                  trackBy="key"
                  columnDefinitions={[
                    {
                      id: "key",
                      header: "Key",
                      isRowHeader: true,
                      cell: (o) => o.key,
                    },
                    {
                      id: "value",
                      header: "Value",
                      cell: (o) => (
                        <CopyToClipboard
                          variant="inline"
                          textToCopy={o.value}
                          copySuccessText="Value copied"
                          copyErrorText="Failed to copy value"
                        />
                      ),
                    },
                    {
                      id: "description",
                      header: "Description",
                      cell: (o) => o.description || "—",
                    },
                  ]}
                  header={
                    <Header counter={`(${outputs.length})`}>Outputs</Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No outputs</b>
                    </Box>
                  }
                />
              ),
            },
            {
              id: "parameters",
              label: `Parameters (${parameters.length})`,
              content: (
                <Table<StackParameter>
                  variant="container"
                  items={parameters}
                  trackBy="key"
                  columnDefinitions={[
                    {
                      id: "key",
                      header: "Key",
                      isRowHeader: true,
                      cell: (p) => p.key,
                    },
                    {
                      id: "value",
                      header: "Value",
                      cell: (p) => p.value,
                    },
                  ]}
                  header={
                    <Header counter={`(${parameters.length})`}>
                      Parameters
                    </Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No parameters</b>
                    </Box>
                  }
                />
              ),
            },
            {
              id: "events",
              label: `Events (${events.length})`,
              content: (
                <Table<StackEvent>
                  variant="container"
                  items={events}
                  trackBy={(e) => `${e.timestamp}-${e.logicalId}`}
                  columnDefinitions={[
                    {
                      id: "timestamp",
                      header: "Time",
                      cell: (e) => formatDate(e.timestamp),
                    },
                    {
                      id: "logicalId",
                      header: "Logical ID",
                      isRowHeader: true,
                      cell: (e) => e.logicalId,
                    },
                    {
                      id: "status",
                      header: "Status",
                      cell: (e) => (
                        <StatusIndicator type={stackStatusType(e.status)}>
                          {e.status}
                        </StatusIndicator>
                      ),
                    },
                    {
                      id: "reason",
                      header: "Reason",
                      cell: (e) => e.reason || "—",
                    },
                  ]}
                  header={
                    <Header counter={`(${events.length})`}>Events</Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No events</b>
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
