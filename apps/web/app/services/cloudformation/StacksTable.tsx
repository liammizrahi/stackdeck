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
import type { Stack } from "@/lib/aws/cloudformation";

export function stackStatusType(status: string): StatusIndicatorProps.Type {
  if (status.includes("FAILED") || status.includes("ROLLBACK")) return "error";
  if (status.endsWith("_IN_PROGRESS")) return "in-progress";
  if (status.endsWith("_COMPLETE")) return "success";
  return "pending";
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function StacksTable({ stacks }: { stacks: Stack[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(stacks, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No stacks</b>
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
    `/services/cloudformation/${encodeURIComponent(name)}`;

  return (
    <Table<Stack>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading stacks"
      items={items}
      trackBy="id"
      columnDefinitions={[
        {
          id: "name",
          header: "Stack name",
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
            <StatusIndicator type={stackStatusType(s.status)}>
              {s.status}
            </StatusIndicator>
          ),
        },
        {
          id: "description",
          header: "Description",
          cell: (s) => s.description || "—",
        },
        {
          id: "createdTime",
          header: "Created",
          sortingField: "createdTime",
          cell: (s) => formatDate(s.createdTime),
        },
      ]}
      header={
        <Header
          counter={`(${stacks.length})`}
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
          Stacks
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find stacks"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
