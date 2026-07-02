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
import type { FileSystem } from "@/lib/aws/efs";

function stateType(state: string): StatusIndicatorProps.Type {
  if (state === "available") return "success";
  if (state === "creating" || state === "updating") return "in-progress";
  if (state === "deleting" || state === "deleted") return "error";
  return "pending";
}

function formatBytes(sizeBytes: number): string {
  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MiB`;
}

export default function FileSystemsTable({
  fileSystems,
}: {
  fileSystems: FileSystem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(fileSystems, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No file systems</b>
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

  const href = (id: string) => `/services/efs/${encodeURIComponent(id)}`;

  return (
    <Table<FileSystem>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading file systems"
      items={items}
      trackBy="id"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (f) => (
            <Link
              href={href(f.id)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(f.id));
              }}
            >
              {f.name || f.id}
            </Link>
          ),
        },
        {
          id: "id",
          header: "File system ID",
          sortingField: "id",
          cell: (f) => f.id,
        },
        {
          id: "state",
          header: "State",
          sortingField: "state",
          cell: (f) => (
            <StatusIndicator type={stateType(f.state)}>
              {f.state}
            </StatusIndicator>
          ),
        },
        {
          id: "sizeBytes",
          header: "Size",
          sortingField: "sizeBytes",
          cell: (f) => formatBytes(f.sizeBytes),
        },
        {
          id: "mountTargets",
          header: "Mount targets",
          sortingField: "mountTargets",
          cell: (f) => f.mountTargets,
        },
      ]}
      header={
        <Header
          counter={`(${fileSystems.length})`}
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
          File systems
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find file systems"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
