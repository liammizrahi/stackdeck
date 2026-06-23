"use client";

import { useState, useTransition } from "react";
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
import type { CacheClusterDetail, CacheNode } from "@/lib/aws/elasticache";
import { columnGroups } from "@/lib/kv";

function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function ClusterDetail({
  cluster,
  error,
}: {
  cluster: CacheClusterDetail | null;
  error: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTabId, setActiveTabId] = useState("nodes");

  if (error || !cluster) {
    return (
      <ContentLayout header={<Header variant="h1">Cache cluster</Header>}>
        <Alert type="error" header="Failed to load cache cluster">
          {error ?? "Cluster not found"}
        </Alert>
      </ContentLayout>
    );
  }

  const {
    id,
    engine,
    engineVersion,
    status,
    nodeType,
    numNodes,
    availabilityZone,
    endpoint,
    arn,
    created,
    nodes,
  } = cluster;

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
          {id}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">Details</Header>}>
          <KeyValuePairs
            columns={3}
            items={columnGroups(
              [
                { label: "Engine", value: engine },
                { label: "Engine version", value: engineVersion || "—" },
                {
                  label: "Status",
                  value: (
                    <StatusIndicator
                      type={status === "available" ? "success" : "in-progress"}
                    >
                      {status}
                    </StatusIndicator>
                  ),
                },
                { label: "Node type", value: nodeType || "—" },
                { label: "Nodes", value: numNodes != null ? String(numNodes) : "—" },
                { label: "Endpoint", value: endpoint || "—" },
                { label: "Availability zone", value: availabilityZone || "—" },
                { label: "Created", value: formatDate(created) },
                {
                  label: "ARN",
                  value: arn ? (
                    <CopyToClipboard
                      variant="inline"
                      textToCopy={arn}
                      copySuccessText="ARN copied"
                      copyErrorText="Failed to copy ARN"
                    />
                  ) : (
                    "—"
                  ),
                },
              ],
              3,
            )}
          />
        </Container>

        <Tabs
          activeTabId={activeTabId}
          onChange={({ detail }) => setActiveTabId(detail.activeTabId)}
          tabs={[
            {
              id: "nodes",
              label: `Nodes (${nodes.length})`,
              content: (
                <Table<CacheNode>
                  variant="container"
                  items={nodes}
                  trackBy="id"
                  columnDefinitions={[
                    {
                      id: "id",
                      header: "Node ID",
                      isRowHeader: true,
                      cell: (node) => node.id,
                    },
                    {
                      id: "status",
                      header: "Status",
                      cell: (node) => node.status,
                    },
                    {
                      id: "endpoint",
                      header: "Endpoint",
                      cell: (node) => node.endpoint || "—",
                    },
                  ]}
                  header={<Header counter={`(${nodes.length})`}>Nodes</Header>}
                  empty={
                    <Box textAlign="center" color="inherit" padding="l">
                      <b>No nodes</b>
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
