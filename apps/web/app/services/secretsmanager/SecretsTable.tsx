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
import type { SecretSummary } from "@/lib/aws/secretsmanager";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function SecretsTable({
  secrets,
}: {
  secrets: SecretSummary[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(secrets, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No secrets</b>
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
    `/services/secretsmanager/${encodeURIComponent(name)}`;

  return (
    <Table<SecretSummary>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading secrets"
      items={items}
      trackBy="arn"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (s) => (
            <Link
              href={href(s.name)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(s.name));
              }}
            >
              {s.name}
            </Link>
          ),
        },
        {
          id: "description",
          header: "Description",
          sortingField: "description",
          cell: (s) => s.description || "—",
        },
        {
          id: "lastChangedDate",
          header: "Last changed",
          sortingField: "lastChangedDate",
          cell: (s) => formatDate(s.lastChangedDate),
        },
        {
          id: "arn",
          header: "ARN",
          cell: (s) => (
            <CopyToClipboard
              variant="inline"
              textToCopy={s.arn}
              copySuccessText="ARN copied"
              copyErrorText="Failed to copy ARN"
            />
          ),
        },
      ]}
      header={
        <Header
          counter={`(${secrets.length})`}
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
          Secrets
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find secrets"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
