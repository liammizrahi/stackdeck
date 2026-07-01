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
import type { Vpc } from "@/lib/aws/vpc";

export default function VpcsTable({ vpcs }: { vpcs: Vpc[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(vpcs, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No VPCs</b>
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

  const href = (id: string) => `/services/vpc/${encodeURIComponent(id)}`;

  return (
    <Table<Vpc>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading VPCs"
      items={items}
      trackBy="id"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (v) => (
            <Link
              href={href(v.id)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(v.id));
              }}
            >
              {v.name || "—"}
            </Link>
          ),
        },
        {
          id: "id",
          header: "VPC ID",
          sortingField: "id",
          cell: (v) => v.id,
        },
        {
          id: "cidrBlock",
          header: "CIDR",
          sortingField: "cidrBlock",
          cell: (v) => v.cidrBlock,
        },
        {
          id: "state",
          header: "State",
          sortingField: "state",
          cell: (v) => (
            <StatusIndicator
              type={v.state === "available" ? "success" : "in-progress"}
            >
              {v.state}
            </StatusIndicator>
          ),
        },
        {
          id: "isDefault",
          header: "Default",
          cell: (v) => (v.isDefault ? "Yes" : "No"),
        },
      ]}
      header={
        <Header
          counter={`(${vpcs.length})`}
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
          VPCs
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find VPCs"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
