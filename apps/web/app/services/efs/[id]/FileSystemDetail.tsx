"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@cloudscape-design/components/alert";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import type { StatusIndicatorProps } from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import type {
  FileSystemDetail as FileSystemDetailType,
  MountTarget,
} from "@/lib/aws/efs";
import { columnGroups } from "@/lib/kv";

function stateType(state: string): StatusIndicatorProps.Type {
  if (state === "available") return "success";
  if (state === "creating" || state === "updating") return "in-progress";
  if (state === "deleting" || state === "deleted") return "error";
  return "pending";
}

function formatBytes(sizeBytes: number): string {
  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MiB`;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function FileSystemDetailView({
  fileSystem,
  error,
}: {
  fileSystem: FileSystemDetailType | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !fileSystem) {
    return (
      <ContentLayout header={<Header variant="h1">File system</Header>}>
        <Alert type="error" header="Failed to load file system">
          {error ?? "File system not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const {
    id,
    name,
    state,
    sizeBytes,
    mountTargets,
    performanceMode,
    encrypted,
    createdAt,
    throughputMode,
    mountTargetDetails,
  } = fileSystem;

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
          {name || id}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups(
              [
                { label: "Name", value: name || "—" },
                { label: "File system ID", value: id },
                {
                  label: "State",
                  value: (
                    <StatusIndicator type={stateType(state)}>
                      {state}
                    </StatusIndicator>
                  ),
                },
                { label: "Size", value: formatBytes(sizeBytes) },
                { label: "Performance mode", value: performanceMode || "—" },
                { label: "Throughput mode", value: throughputMode || "—" },
                { label: "Encrypted", value: encrypted ? "Yes" : "No" },
                { label: "Mount targets", value: mountTargets },
                { label: "Created", value: formatDate(createdAt) },
              ],
              3,
            )}
          />
        </Container>

        <Container
          header={
            <Header counter={`(${mountTargetDetails.length})`}>
              Mount targets
            </Header>
          }
        >
          <Table<MountTarget>
            variant="borderless"
            items={mountTargetDetails}
            trackBy="id"
            columnDefinitions={[
              {
                id: "id",
                header: "Mount target ID",
                isRowHeader: true,
                cell: (m) => m.id,
              },
              {
                id: "subnetId",
                header: "Subnet",
                cell: (m) => m.subnetId,
              },
              {
                id: "state",
                header: "State",
                cell: (m) => (
                  <StatusIndicator type={stateType(m.state)}>
                    {m.state}
                  </StatusIndicator>
                ),
              },
              {
                id: "ipAddress",
                header: "IP address",
                cell: (m) => m.ipAddress,
              },
              {
                id: "availabilityZone",
                header: "Availability zone",
                cell: (m) => m.availabilityZone,
              },
            ]}
            empty={
              <Box textAlign="center" color="inherit" padding="l">
                <b>No mount targets</b>
              </Box>
            }
          />
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
