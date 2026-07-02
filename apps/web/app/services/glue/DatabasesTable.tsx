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
import type { GlueDatabase } from "@/lib/aws/glue";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function DatabasesTable({
  databases,
}: {
  databases: GlueDatabase[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(databases, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No databases</b>
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
    `/services/glue/${encodeURIComponent(name)}`;

  return (
    <Table<GlueDatabase>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading databases"
      items={items}
      trackBy="name"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (d) => (
            <Link
              href={href(d.name)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(d.name));
              }}
            >
              {d.name}
            </Link>
          ),
        },
        {
          id: "description",
          header: "Description",
          sortingField: "description",
          cell: (d) => d.description || "—",
        },
        {
          id: "location",
          header: "Location",
          sortingField: "location",
          cell: (d) => d.location || "—",
        },
        {
          id: "createTime",
          header: "Created",
          sortingField: "createTime",
          cell: (d) => formatDate(d.createTime),
        },
      ]}
      header={
        <Header
          counter={`(${databases.length})`}
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
          Databases
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find databases"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
