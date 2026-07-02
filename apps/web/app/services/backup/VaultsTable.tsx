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
import type { BackupVault } from "@/lib/aws/backup";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function VaultsTable({ vaults }: { vaults: BackupVault[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(vaults, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No backup vaults</b>
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
    `/services/backup/${encodeURIComponent(name)}`;

  return (
    <Table<BackupVault>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading backup vaults"
      items={items}
      trackBy="name"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (v) => (
            <Link
              href={href(v.name)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(v.name));
              }}
            >
              {v.name}
            </Link>
          ),
        },
        {
          id: "recoveryPoints",
          header: "Recovery points",
          sortingField: "recoveryPoints",
          cell: (v) => v.recoveryPoints,
        },
        {
          id: "arn",
          header: "ARN",
          cell: (v) => (
            <CopyToClipboard
              variant="inline"
              textToCopy={v.arn}
              copySuccessText="ARN copied"
              copyErrorText="Failed to copy ARN"
            />
          ),
        },
        {
          id: "createdAt",
          header: "Created",
          sortingField: "createdAt",
          cell: (v) => formatDate(v.createdAt),
        },
      ]}
      header={
        <Header
          counter={`(${vaults.length})`}
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
          Backup vaults
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find vaults"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
