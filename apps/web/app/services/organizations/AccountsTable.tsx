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
import type { OrgAccount } from "@/lib/aws/organizations";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function AccountsTable({
  accounts,
}: {
  accounts: OrgAccount[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(accounts, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No accounts</b>
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
    `/services/organizations/${encodeURIComponent(id)}`;

  return (
    <Table<OrgAccount>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading accounts"
      items={items}
      trackBy="id"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (a) => (
            <Link
              href={href(a.id)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(a.id));
              }}
            >
              {a.name}
            </Link>
          ),
        },
        {
          id: "id",
          header: "Account ID",
          sortingField: "id",
          cell: (a) => a.id,
        },
        {
          id: "email",
          header: "Email",
          sortingField: "email",
          cell: (a) => a.email,
        },
        {
          id: "status",
          header: "Status",
          sortingField: "status",
          cell: (a) => (
            <StatusIndicator
              type={a.status === "ACTIVE" ? "success" : "stopped"}
            >
              {a.status}
            </StatusIndicator>
          ),
        },
        {
          id: "joinedAt",
          header: "Joined",
          sortingField: "joinedAt",
          cell: (a) => formatDate(a.joinedAt),
        },
      ]}
      header={
        <Header
          counter={`(${accounts.length})`}
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
          Accounts
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find accounts"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
