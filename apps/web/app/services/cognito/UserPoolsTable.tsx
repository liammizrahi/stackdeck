"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { UserPool } from "@/lib/aws/cognito";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function UserPoolsTable({ pools }: { pools: UserPool[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(pools, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No user pools</b>
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

  const href = (id: string) => `/services/cognito/${encodeURIComponent(id)}`;

  return (
    <Table<UserPool>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading user pools"
      items={items}
      trackBy="id"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (pool) => (
            <Link
              href={href(pool.id)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(pool.id));
              }}
            >
              {pool.name}
            </Link>
          ),
        },
        { id: "id", header: "Pool ID", cell: (pool) => pool.id },
        {
          id: "arn",
          header: "ARN",
          cell: (pool) => (
            <CopyToClipboard
              variant="inline"
              textToCopy={pool.arn}
              copySuccessText="ARN copied"
              copyErrorText="Failed to copy ARN"
            />
          ),
        },
        {
          id: "creationDate",
          header: "Created",
          sortingField: "creationDate",
          cell: (pool) => formatDate(pool.creationDate),
        },
      ]}
      header={
        <Header
          counter={`(${pools.length})`}
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
          User pools
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find user pools"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
