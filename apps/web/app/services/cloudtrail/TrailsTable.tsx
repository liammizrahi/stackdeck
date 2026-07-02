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
import type { Trail } from "@/lib/aws/cloudtrail";

export default function TrailsTable({ trails }: { trails: Trail[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(trails, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No trails</b>
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
    `/services/cloudtrail/${encodeURIComponent(name)}`;

  return (
    <Table<Trail>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading trails"
      items={items}
      trackBy="name"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (t) => (
            <Link
              href={href(t.name)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(t.name));
              }}
            >
              {t.name}
            </Link>
          ),
        },
        {
          id: "s3Bucket",
          header: "S3 bucket",
          sortingField: "s3Bucket",
          cell: (t) => t.s3Bucket,
        },
        {
          id: "homeRegion",
          header: "Home region",
          sortingField: "homeRegion",
          cell: (t) => t.homeRegion,
        },
        {
          id: "isMultiRegion",
          header: "Multi-region",
          cell: (t) => (t.isMultiRegion ? "Yes" : "No"),
        },
      ]}
      header={
        <Header
          counter={`(${trails.length})`}
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
          Trails
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find trails"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
