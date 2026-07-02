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
import type { DeliveryStreamDetail, Destination } from "@/lib/aws/firehose";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

function statusType(status: string): StatusIndicatorProps.Type {
  if (status === "ACTIVE") return "success";
  if (status === "CREATING") return "in-progress";
  if (status === "CREATING_FAILED" || status === "DELETING_FAILED")
    return "error";
  return "in-progress";
}

export default function StreamDetail({
  stream,
  error,
}: {
  stream: DeliveryStreamDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !stream) {
    return (
      <ContentLayout header={<Header variant="h1">Delivery stream</Header>}>
        <Alert type="error" header="Failed to load delivery stream">
          {error ?? "Delivery stream not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const { name, arn, status, type, createdAt, destinations } = stream;

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
                { label: "Type", value: type },
                { label: "Created", value: formatDate(createdAt) },
              ],
              3,
            )}
          />
        </Container>

        <Table<Destination>
          variant="container"
          items={destinations}
          trackBy="id"
          columnDefinitions={[
            {
              id: "id",
              header: "Destination ID",
              isRowHeader: true,
              cell: (d) => d.id,
            },
            {
              id: "type",
              header: "Type",
              cell: (d) => d.type,
            },
            {
              id: "target",
              header: "Target",
              cell: (d) => d.target || "—",
            },
          ]}
          header={
            <Header counter={`(${destinations.length})`}>Destinations</Header>
          }
          empty={
            <Box textAlign="center" color="inherit" padding="l">
              <b>No destinations</b>
            </Box>
          }
        />
      </SpaceBetween>
    </ContentLayout>
  );
}
