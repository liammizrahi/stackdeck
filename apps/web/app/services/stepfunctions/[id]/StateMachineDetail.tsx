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
import type { Execution, StateMachineDetail } from "@/lib/aws/stepfunctions";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

function prettyDefinition(definition: string): string {
  try {
    return JSON.stringify(JSON.parse(definition), null, 2);
  } catch {
    return definition;
  }
}

function executionStatusType(status: string): StatusIndicatorProps.Type {
  if (status === "SUCCEEDED") return "success";
  if (status === "FAILED" || status === "TIMED_OUT" || status === "ABORTED")
    return "error";
  if (status === "RUNNING") return "in-progress";
  return "pending";
}

export default function StateMachineDetailView({
  machine,
  error,
}: {
  machine: StateMachineDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !machine) {
    return (
      <ContentLayout header={<Header variant="h1">State machine</Header>}>
        <Alert type="error" header="Failed to load state machine">
          {error ?? "State machine not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const {
    arn,
    name,
    type,
    creationDate,
    status,
    roleArn,
    definition,
    executions,
  } = machine;

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
                { label: "Type", value: type },
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
                { label: "Role ARN", value: roleArn || "—" },
                { label: "Created", value: formatDate(creationDate) },
              ],
              3,
            )}
          />
        </Container>

        <Tabs
          tabs={[
            {
              id: "definition",
              label: "Definition",
              content: (
                <Container header={<Header variant="h2">Definition</Header>}>
                  <div style={{ maxHeight: "32rem", overflow: "auto" }}>
                    <Box variant="code">
                      <Box variant="pre" padding="n">
                        {prettyDefinition(definition)}
                      </Box>
                    </Box>
                  </div>
                </Container>
              ),
            },
            {
              id: "executions",
              label: `Executions (${executions.length})`,
              content: (
                <Table<Execution>
                  variant="container"
                  items={executions}
                  trackBy="executionArn"
                  columnDefinitions={[
                    {
                      id: "name",
                      header: "Name",
                      isRowHeader: true,
                      cell: (e) => e.name,
                    },
                    {
                      id: "status",
                      header: "Status",
                      cell: (e) => (
                        <StatusIndicator type={executionStatusType(e.status)}>
                          {e.status}
                        </StatusIndicator>
                      ),
                    },
                    {
                      id: "startDate",
                      header: "Started",
                      cell: (e) => formatDate(e.startDate),
                    },
                    {
                      id: "stopDate",
                      header: "Stopped",
                      cell: (e) => formatDate(e.stopDate),
                    },
                  ]}
                  header={
                    <Header counter={`(${executions.length})`}>
                      Executions
                    </Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No executions</b>
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
