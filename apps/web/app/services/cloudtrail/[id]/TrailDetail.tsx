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
import type { TrailDetail, TrailEvent } from "@/lib/aws/cloudtrail";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function TrailDetailView({
  trail,
  error,
}: {
  trail: TrailDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !trail) {
    return (
      <ContentLayout header={<Header variant="h1">Trail</Header>}>
        <Alert type="error" header="Failed to load trail">
          {error ?? "Trail not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const {
    name,
    arn,
    s3Bucket,
    homeRegion,
    isMultiRegion,
    isLogging,
    logFileValidation,
    isOrganizationTrail,
    events,
  } = trail;

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
                { label: "S3 bucket", value: s3Bucket },
                { label: "Home region", value: homeRegion },
                { label: "Multi-region", value: isMultiRegion ? "Yes" : "No" },
                {
                  label: "Logging",
                  value: (
                    <StatusIndicator type={isLogging ? "success" : "stopped"}>
                      {isLogging ? "Logging" : "Stopped"}
                    </StatusIndicator>
                  ),
                },
                {
                  label: "Log file validation",
                  value: logFileValidation ? "Yes" : "No",
                },
                {
                  label: "Organization trail",
                  value: isOrganizationTrail ? "Yes" : "No",
                },
              ],
              3,
            )}
          />
        </Container>

        <Container header={<Header variant="h2">Recent events</Header>}>
          <Table<TrailEvent>
            variant="container"
            items={events}
            trackBy="id"
            columnDefinitions={[
              {
                id: "name",
                header: "Event name",
                isRowHeader: true,
                cell: (e) => e.name,
              },
              {
                id: "eventTime",
                header: "Time",
                cell: (e) => formatDate(e.eventTime),
              },
              {
                id: "username",
                header: "User",
                cell: (e) => e.username,
              },
              {
                id: "eventSource",
                header: "Source",
                cell: (e) => e.eventSource,
              },
            ]}
            header={
              <Header counter={`(${events.length})`}>Recent events</Header>
            }
            empty={
              <Box textAlign="center" color="inherit" padding="l">
                <b>No events</b>
              </Box>
            }
          />
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
