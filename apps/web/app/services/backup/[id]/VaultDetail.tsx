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
import type { BackupVaultDetail, RecoveryPoint } from "@/lib/aws/backup";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

function formatSize(sizeBytes: number) {
  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MiB`;
}

function statusType(status: string): StatusIndicatorProps.Type {
  if (status === "COMPLETED") return "success";
  if (status === "RUNNING" || status === "CREATING") return "in-progress";
  if (status === "FAILED" || status === "EXPIRED") return "error";
  return "pending";
}

export default function VaultDetail({
  vault,
  error,
}: {
  vault: BackupVaultDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !vault) {
    return (
      <ContentLayout header={<Header variant="h1">Backup vault</Header>}>
        <Alert type="error" header="Failed to load backup vault">
          {error ?? "Backup vault not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const { name, arn, recoveryPoints, createdAt, points } = vault;

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
                { label: "Recovery points", value: recoveryPoints },
                { label: "Created", value: formatDate(createdAt) },
              ],
              3,
            )}
          />
        </Container>

        <Container header={<Header variant="h2">Recovery points</Header>}>
          <Table<RecoveryPoint>
            variant="container"
            items={points}
            trackBy="arn"
            columnDefinitions={[
              {
                id: "resourceType",
                header: "Resource type",
                isRowHeader: true,
                cell: (p) => p.resourceType,
              },
              {
                id: "resourceArn",
                header: "Resource ARN",
                cell: (p) => p.resourceArn,
              },
              {
                id: "status",
                header: "Status",
                cell: (p) => (
                  <StatusIndicator type={statusType(p.status)}>
                    {p.status}
                  </StatusIndicator>
                ),
              },
              {
                id: "sizeBytes",
                header: "Size",
                cell: (p) => formatSize(p.sizeBytes),
              },
              {
                id: "createdAt",
                header: "Created",
                cell: (p) => formatDate(p.createdAt),
              },
            ]}
            header={
              <Header counter={`(${points.length})`}>Recovery points</Header>
            }
            empty={
              <Box textAlign="center" color="inherit" padding="l">
                <b>No recovery points</b>
              </Box>
            }
          />
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
