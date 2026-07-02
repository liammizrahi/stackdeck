"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@cloudscape-design/components/alert";
import Button from "@cloudscape-design/components/button";
import Container from "@cloudscape-design/components/container";
import ContentLayout from "@cloudscape-design/components/content-layout";
import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";
import Header from "@cloudscape-design/components/header";
import KeyValuePairs from "@cloudscape-design/components/key-value-pairs";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import type { ScheduleDetail } from "@/lib/aws/scheduler";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function ScheduleDetailView({
  schedule,
  error,
}: {
  schedule: ScheduleDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !schedule) {
    return (
      <ContentLayout header={<Header variant="h1">Schedule</Header>}>
        <Alert type="error" header="Failed to load schedule">
          {error ?? "Schedule not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const {
    name,
    groupName,
    state,
    arn,
    targetArn,
    scheduleExpression,
    timezone,
    flexibleTimeWindow,
    startDate,
    endDate,
    creationDate,
  } = schedule;

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
                { label: "Group", value: groupName },
                {
                  label: "State",
                  value: (
                    <StatusIndicator
                      type={state === "ENABLED" ? "success" : "stopped"}
                    >
                      {state}
                    </StatusIndicator>
                  ),
                },
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
                  label: "Schedule expression",
                  value: scheduleExpression || "—",
                },
                { label: "Timezone", value: timezone || "—" },
                {
                  label: "Flexible time window",
                  value: flexibleTimeWindow || "—",
                },
                {
                  label: "Target ARN",
                  value: (
                    <CopyToClipboard
                      variant="inline"
                      textToCopy={targetArn}
                      copySuccessText="Target ARN copied"
                      copyErrorText="Failed to copy target ARN"
                    />
                  ),
                },
                { label: "Start date", value: formatDate(startDate) },
                { label: "End date", value: formatDate(endDate) },
                { label: "Created", value: formatDate(creationDate) },
              ],
              3,
            )}
          />
        </Container>
      </SpaceBetween>
    </ContentLayout>
  );
}
