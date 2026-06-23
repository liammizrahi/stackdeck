"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Pagination from "@cloudscape-design/components/pagination";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { Api } from "@/lib/aws/apigateway";

export default function ApisTable({ apis }: { apis: Api[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(apis, {
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

  const refresh = () => startTransition(() => router.refresh());

  return (
    <Table<Api>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading APIs"
      items={items}
      trackBy="id"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (api) => (
            <Link
              href={`/services/apigateway/${encodeURIComponent(api.id)}`}
              onFollow={(event) => {
                event.preventDefault();
                router.push(
                  `/services/apigateway/${encodeURIComponent(api.id)}`,
                );
              }}
            >
              {api.name}
            </Link>
          ),
        },
        {
          id: "protocolType",
          header: "Protocol",
          sortingField: "protocolType",
          cell: (api) => api.protocolType,
        },
        {
          id: "endpoint",
          header: "Endpoint",
          cell: (api) => api.endpoint || "—",
        },
        {
          id: "id",
          header: "API ID",
          sortingField: "id",
          cell: (api) => api.id,
        },
      ]}
      header={
        <Header
          counter={`(${apis.length})`}
          actions={
            <Button iconName="refresh" ariaLabel="Refresh" onClick={refresh} />
          }
        >
          APIs
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
