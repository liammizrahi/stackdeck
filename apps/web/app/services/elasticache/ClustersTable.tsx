"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import StatusIndicator from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { CacheCluster } from "@/lib/aws/elasticache";

export default function ClustersTable({ clusters }: { clusters: CacheCluster[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(clusters, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No clusters</b>
          </Box>
        ),
        noMatch: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No matches</b>
          </Box>
        ),
      },
      pagination: { pageSize: 20 },
      sorting: {},
    });

  const href = (id: string) =>
    `/services/elasticache/${encodeURIComponent(id)}`;

  return (
    <Table<CacheCluster>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading clusters"
      items={items}
      trackBy="id"
      columnDefinitions={[
        {
          id: "id",
          header: "Cluster ID",
          sortingField: "id",
          isRowHeader: true,
          cell: (cluster) => (
            <Link
              href={href(cluster.id)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(cluster.id));
              }}
            >
              {cluster.id}
            </Link>
          ),
        },
        {
          id: "engine",
          header: "Engine",
          sortingField: "engine",
          cell: (cluster) => cluster.engine,
        },
        {
          id: "engineVersion",
          header: "Version",
          sortingField: "engineVersion",
          cell: (cluster) => cluster.engineVersion,
        },
        {
          id: "status",
          header: "Status",
          sortingField: "status",
          cell: (cluster) => (
            <StatusIndicator
              type={cluster.status === "available" ? "success" : "in-progress"}
            >
              {cluster.status}
            </StatusIndicator>
          ),
        },
        {
          id: "nodeType",
          header: "Node type",
          sortingField: "nodeType",
          cell: (cluster) => cluster.nodeType,
        },
        {
          id: "numNodes",
          header: "Nodes",
          sortingField: "numNodes",
          cell: (cluster) => cluster.numNodes ?? "—",
        },
      ]}
      header={
        <Header
          counter={`(${clusters.length})`}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button
                iconName="refresh"
                ariaLabel="Refresh"
                onClick={() => startTransition(() => router.refresh())}
              />
            </SpaceBetween>
          }
        >
          Clusters
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find clusters"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
