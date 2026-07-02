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
import type { GraphqlApi } from "@/lib/aws/appsync";

export default function ApisTable({ apis }: { apis: GraphqlApi[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(apis, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No APIs</b>
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

  const href = (apiId: string) =>
    `/services/appsync/${encodeURIComponent(apiId)}`;

  return (
    <Table<GraphqlApi>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading APIs"
      items={items}
      trackBy="apiId"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (a) => (
            <Link
              href={href(a.apiId)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(a.apiId));
              }}
            >
              {a.name}
            </Link>
          ),
        },
        {
          id: "apiId",
          header: "API ID",
          sortingField: "apiId",
          cell: (a) => a.apiId,
        },
        {
          id: "authenticationType",
          header: "Authentication",
          sortingField: "authenticationType",
          cell: (a) => a.authenticationType,
        },
        {
          id: "endpoint",
          header: "Endpoint",
          cell: (a) => (
            <CopyToClipboard
              variant="inline"
              textToCopy={a.endpoint}
              copySuccessText="Endpoint copied"
              copyErrorText="Failed to copy endpoint"
            />
          ),
        },
      ]}
      header={
        <Header
          counter={`(${apis.length})`}
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
          GraphQL APIs
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find APIs"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
