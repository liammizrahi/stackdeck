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
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { WorkGroup } from "@/lib/aws/athena";

export default function WorkGroupsTable({ workGroups }: { workGroups: WorkGroup[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(workGroups, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No work groups</b>
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
    `/services/athena/${encodeURIComponent(name)}`;

  return (
    <Table<WorkGroup>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading work groups"
      items={items}
      trackBy="name"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (wg) => (
            <Link
              href={href(wg.name)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(wg.name));
              }}
            >
              {wg.name}
            </Link>
          ),
        },
        {
          id: "state",
          header: "State",
          sortingField: "state",
          cell: (wg) => wg.state || "—",
        },
        {
          id: "description",
          header: "Description",
          cell: (wg) => wg.description || "—",
        },
        {
          id: "creationDate",
          header: "Created",
          sortingField: "creationDate",
          cell: (wg) =>
            wg.creationDate ? new Date(wg.creationDate).toLocaleString() : "—",
        },
      ]}
      header={
        <Header
          counter={`(${workGroups.length})`}
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
          Work groups
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find work groups"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
