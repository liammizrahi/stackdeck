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
import type { Shard, StreamDetail } from "@/lib/aws/kinesis";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

function statusType(status: string): StatusIndicatorProps.Type {
  if (status === "ACTIVE") return "success";
  if (status === "CREATING" || status === "UPDATING") return "in-progress";
  if (status === "DELETING") return "error";
  return "pending";
}

export default function StreamDetailView({
  stream,
  error,
}: {
  stream: StreamDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !stream) {
    return (
      <ContentLayout header={<Header variant="h1">Stream</Header>}>
        <Alert type="error" header="Failed to load stream">
          {error ?? "Stream not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const {
    name,
    arn,
    status,
    shardCount,
    retentionHours,
    encryptionType,
    creationDate,
    shards,
  } = stream;

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
                  label: "Status",
                  value: (
                    <StatusIndicator type={statusType(status)}>
                      {status}
                    </StatusIndicator>
                  ),
                },
                { label: "Shard count", value: shardCount },
                { label: "Retention", value: `${retentionHours} h` },
                { label: "Encryption", value: encryptionType || "—" },
                { label: "Created", value: formatDate(creationDate) },
              ],
              3,
            )}
          />
        </Container>

        <Container header={<Header variant="h2">Shards</Header>}>
          <Table<Shard>
            variant="container"
            items={shards}
            trackBy="shardId"
            columnDefinitions={[
              {
                id: "shardId",
                header: "Shard ID",
                isRowHeader: true,
                cell: (s) => s.shardId,
              },
              {
                id: "startingHashKey",
                header: "Starting hash key",
                cell: (s) => s.startingHashKey,
              },
              {
                id: "endingHashKey",
                header: "Ending hash key",
                cell: (s) => s.endingHashKey,
              },
              {
                id: "startingSequenceNumber",
                header: "Starting sequence number",
                cell: (s) => s.startingSequenceNumber,
              },
            ]}
            header={<Header counter={`(${shards.length})`}>Shards</Header>}
            empty={
              <Box textAlign="center" color="inherit" padding="l">
                <b>No shards</b>
              </Box>
            }
          />
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
