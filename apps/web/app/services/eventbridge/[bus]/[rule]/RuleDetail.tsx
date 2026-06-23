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
import type { EventRule, EventTarget } from "@/lib/aws/eventbridge";
import { columnGroups } from "@/lib/kv";

function prettyJson(value: string): string {
  if (!value) return "—";
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export default function RuleDetail({
  rule,
  targets,
}: {
  rule: EventRule | null;
  targets: EventTarget[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!rule) {
    return (
      <ContentLayout header={<Header variant="h1">Rule</Header>}>
        <Alert type="error" header="Rule not found" />
      </ContentLayout>
    );
  }

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
          {rule.name}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups(
              [
                {
                  label: "State",
                  value: (
                    <StatusIndicator
                      type={rule.state === "ENABLED" ? "success" : "stopped"}
                    >
                      {rule.state || "—"}
                    </StatusIndicator>
                  ),
                },
                {
                  label: "Schedule",
                  value: rule.scheduleExpression || "—",
                },
                {
                  label: "ARN",
                  value: (
                    <CopyToClipboard
                      variant="inline"
                      textToCopy={rule.arn}
                      copySuccessText="ARN copied"
                      copyErrorText="Failed to copy ARN"
                    />
                  ),
                },
                {
                  label: "Description",
                  value: rule.description || "—",
                },
              ],
              3,
            )}
          />
        </Container>

        <Tabs
          tabs={[
            {
              id: "pattern",
              label: "Event pattern",
              content: (
                <Container>
                  <pre className="sd-preview">{prettyJson(rule.eventPattern)}</pre>
                </Container>
              ),
            },
            {
              id: "targets",
              label: `Targets (${targets.length})`,
              content: (
                <Table<EventTarget>
                  variant="container"
                  items={targets}
                  trackBy="id"
                  columnDefinitions={[
                    {
                      id: "id",
                      header: "Target ID",
                      isRowHeader: true,
                      cell: (t) => t.id,
                    },
                    {
                      id: "arn",
                      header: "ARN",
                      cell: (t) => (
                        <CopyToClipboard
                          variant="inline"
                          textToCopy={t.arn}
                          copySuccessText="ARN copied"
                          copyErrorText="Failed to copy ARN"
                        />
                      ),
                    },
                  ]}
                  header={<Header counter={`(${targets.length})`}>Targets</Header>}
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No targets</b>
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
