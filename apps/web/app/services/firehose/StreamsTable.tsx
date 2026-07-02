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
import type { DeliveryStream } from "@/lib/aws/firehose";

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

export default function StreamsTable({
  streams,
}: {
  streams: DeliveryStream[];
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
          <b>No delivery streams</b>
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
    `/services/firehose/${encodeURIComponent(name)}`;

  return (
    <Table<DeliveryStream>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading delivery streams"
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
          id: "type",
          header: "Type",
          sortingField: "type",
          cell: (s) => s.type,
        },
        {
          id: "createdAt",
          header: "Created",
          sortingField: "createdAt",
          cell: (s) => formatDate(s.createdAt),
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
          Delivery streams
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find delivery streams"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
