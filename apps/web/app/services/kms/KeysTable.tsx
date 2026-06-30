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
import type { KmsKey } from "@/lib/aws/kms";

export default function KeysTable({ keys }: { keys: KmsKey[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(keys, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No keys</b>
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

  const href = (keyId: string) =>
    `/services/kms/${encodeURIComponent(keyId)}`;

  return (
    <Table<KmsKey>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading keys"
      items={items}
      trackBy="keyId"
      columnDefinitions={[
        {
          id: "keyId",
          header: "Key ID",
          sortingField: "keyId",
          isRowHeader: true,
          cell: (k) => (
            <Link
              href={href(k.keyId)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(k.keyId));
              }}
            >
              {k.keyId}
            </Link>
          ),
        },
        {
          id: "aliases",
          header: "Aliases",
          cell: (k) => (k.aliases.length > 0 ? k.aliases.join(", ") : "—"),
        },
        {
          id: "state",
          header: "Status",
          sortingField: "state",
          cell: (k) => (
            <StatusIndicator
              type={
                k.state === "Enabled"
                  ? "success"
                  : k.state === "Disabled"
                    ? "stopped"
                    : "in-progress"
              }
            >
              {k.state}
            </StatusIndicator>
          ),
        },
        {
          id: "keyUsage",
          header: "Usage",
          sortingField: "keyUsage",
          cell: (k) => k.keyUsage,
        },
        {
          id: "description",
          header: "Description",
          cell: (k) => k.description || "—",
        },
      ]}
      header={
        <Header
          counter={`(${keys.length})`}
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
          Keys
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find keys"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
