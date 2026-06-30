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
import type { StatusIndicatorProps } from "@cloudscape-design/components/status-indicator";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { KinesisStream } from "@/lib/aws/kinesis";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

function statusType(status: string): StatusIndicatorProps.Type {
  if (status === "ACTIVE") return "success";
  if (status === "CREATING" || status === "UPDATING") return "in-progress";
  if (status === "DELETING") return "error";
  return "pending";
}

export default function StreamsTable({
  streams,
}: {
  streams: KinesisStream[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(streams, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No streams</b>
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
    `/services/kinesis/${encodeURIComponent(name)}`;

  return (
    <Table<KinesisStream>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading streams"
      items={items}
      trackBy="name"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (s) => (
            <Link
              href={href(s.name)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(s.name));
              }}
            >
              {s.name}
            </Link>
          ),
        },
        {
          id: "status",
          header: "Status",
          sortingField: "status",
          cell: (s) => (
            <StatusIndicator type={statusType(s.status)}>
              {s.status}
            </StatusIndicator>
          ),
        },
        {
          id: "shardCount",
          header: "Shards",
          sortingField: "shardCount",
          cell: (s) => s.shardCount,
        },
        {
          id: "retentionHours",
          header: "Retention",
          sortingField: "retentionHours",
          cell: (s) => `${s.retentionHours} h`,
        },
        {
          id: "creationDate",
          header: "Created",
          sortingField: "creationDate",
          cell: (s) => formatDate(s.creationDate),
        },
      ]}
      header={
        <Header
          counter={`(${streams.length})`}
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
          Data streams
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find streams"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
