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
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { OpenSearchDomain } from "@/lib/aws/opensearch";

export default function DomainsTable({
  domains,
}: {
  domains: OpenSearchDomain[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(domains, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No domains</b>
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
    `/services/opensearch/${encodeURIComponent(name)}`;

  return (
    <Table<OpenSearchDomain>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading domains"
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
          id: "engineVersion",
          header: "Engine version",
          sortingField: "engineVersion",
          cell: (d) => d.engineVersion,
        },
        {
          id: "instanceType",
          header: "Instance type",
          sortingField: "instanceType",
          cell: (d) => d.instanceType,
        },
        {
          id: "instanceCount",
          header: "Instances",
          sortingField: "instanceCount",
          cell: (d) => d.instanceCount,
        },
        {
          id: "status",
          header: "Status",
          cell: (d) => (
            <StatusIndicator
              type={d.processing ? "in-progress" : "success"}
            >
              {d.processing ? "Processing" : "Active"}
            </StatusIndicator>
          ),
        },
      ]}
      header={
        <Header
          counter={`(${domains.length})`}
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
          Domains
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find domains"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
