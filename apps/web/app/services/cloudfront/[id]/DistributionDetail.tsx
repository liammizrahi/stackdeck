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
import type { Behavior, DistributionDetail, Origin } from "@/lib/aws/cloudfront";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function DistributionDetailView({
  distribution,
  error,
}: {
  distribution: DistributionDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (error || !distribution) {
    return (
      <ContentLayout header={<Header variant="h1">Distribution</Header>}>
        <Alert type="error" header="Failed to load distribution">
          {error ?? "Distribution not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const { id, arn, domainName, status, enabled, comment, lastModified, origins, behaviors } =
    distribution;

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
          {domainName}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups(
              [
                { label: "Distribution ID", value: id },
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
                { label: "Domain name", value: domainName },
                {
                  label: "Status",
                  value: (
                    <StatusIndicator
                      type={status === "Deployed" ? "success" : "in-progress"}
                    >
                      {status}
                    </StatusIndicator>
                  ),
                },
                { label: "Enabled", value: enabled ? "Yes" : "No" },
                { label: "Comment", value: comment || "—" },
                { label: "Last modified", value: formatDate(lastModified) },
              ],
              3,
            )}
          />
        </Container>

        <Tabs
          tabs={[
            {
              id: "origins",
              label: `Origins (${origins.length})`,
              content: (
                <Table<Origin>
                  variant="container"
                  items={origins}
                  trackBy="id"
                  columnDefinitions={[
                    {
                      id: "id",
                      header: "Origin ID",
                      isRowHeader: true,
                      cell: (o) => o.id,
                    },
                    {
                      id: "domainName",
                      header: "Domain name",
                      cell: (o) => o.domainName,
                    },
                  ]}
                  header={
                    <Header counter={`(${origins.length})`}>Origins</Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No origins</b>
                    </Box>
                  }
                />
              ),
            },
            {
              id: "behaviors",
              label: `Behaviors (${behaviors.length})`,
              content: (
                <Table<Behavior>
                  variant="container"
                  items={behaviors}
                  trackBy="pathPattern"
                  columnDefinitions={[
                    {
                      id: "pathPattern",
                      header: "Path pattern",
                      isRowHeader: true,
                      cell: (b) => b.pathPattern,
                    },
                    {
                      id: "targetOriginId",
                      header: "Target origin",
                      cell: (b) => b.targetOriginId,
                    },
                    {
                      id: "viewerProtocolPolicy",
                      header: "Viewer protocol",
                      cell: (b) => b.viewerProtocolPolicy,
                    },
                  ]}
                  header={
                    <Header counter={`(${behaviors.length})`}>Behaviors</Header>
                  }
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No behaviors</b>
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
