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
import type { HostedZone } from "@/lib/aws/route53";

export default function HostedZonesTable({
  zones,
}: {
  zones: HostedZone[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(zones, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No hosted zones</b>
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
    `/services/route53/${encodeURIComponent(id)}`;

  return (
    <Table<HostedZone>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading hosted zones"
      items={items}
      trackBy="id"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (z) => (
            <Link
              href={href(z.id)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(z.id));
              }}
            >
              {z.name}
            </Link>
          ),
        },
        {
          id: "recordCount",
          header: "Record count",
          sortingField: "recordCount",
          cell: (z) => z.recordCount,
        },
        {
          id: "type",
          header: "Type",
          cell: (z) => (z.privateZone ? "Private" : "Public"),
        },
        {
          id: "id",
          header: "Hosted zone ID",
          sortingField: "id",
          cell: (z) => z.id,
        },
        {
          id: "comment",
          header: "Comment",
          cell: (z) => z.comment || "—",
        },
      ]}
      header={
        <Header
          counter={`(${zones.length})`}
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
          Hosted zones
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find hosted zones"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
