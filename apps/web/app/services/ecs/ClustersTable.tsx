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
import type { Cluster } from "@/lib/aws/ecs";

export default function ClustersTable({
  clusters,
}: {
  clusters: Cluster[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(clusters, {
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

  const href = (name: string) =>
    `/services/ecs/${encodeURIComponent(name)}`;

  return (
    <Table<Cluster>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading clusters"
      items={items}
      trackBy="arn"
      columnDefinitions={[
        {
          id: "name",
          header: "Cluster name",
          sortingField: "name",
          isRowHeader: true,
          cell: (c) => (
            <Link
              href={href(c.name)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(c.name));
              }}
            >
              {c.name}
            </Link>
          ),
        },
        {
          id: "status",
          header: "Status",
          sortingField: "status",
          cell: (c) => (
            <StatusIndicator
              type={c.status === "ACTIVE" ? "success" : "in-progress"}
            >
              {c.status}
            </StatusIndicator>
          ),
        },
        {
          id: "runningTasks",
          header: "Running tasks",
          sortingField: "runningTasks",
          cell: (c) => c.runningTasks,
        },
        {
          id: "pendingTasks",
          header: "Pending tasks",
          sortingField: "pendingTasks",
          cell: (c) => c.pendingTasks,
        },
        {
          id: "activeServices",
          header: "Services",
          sortingField: "activeServices",
          cell: (c) => c.activeServices,
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
