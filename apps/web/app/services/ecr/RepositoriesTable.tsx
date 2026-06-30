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
import type { Repository } from "@/lib/aws/ecr";

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function RepositoriesTable({
  repositories,
}: {
  repositories: Repository[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    items,
    collectionProps,
    filterProps,
    paginationProps,
    filteredItemsCount,
  } = useCollection(repositories, {
    filtering: {
      empty: (
        <Box textAlign="center" color="inherit" padding="l">
          <b>No repositories</b>
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
    `/services/ecr/${encodeURIComponent(name)}`;

  return (
    <Table<Repository>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading repositories"
      items={items}
      trackBy="name"
      columnDefinitions={[
        {
          id: "name",
          header: "Repository name",
          sortingField: "name",
          isRowHeader: true,
          cell: (r) => (
            <Link
              href={href(r.name)}
              onFollow={(event) => {
                event.preventDefault();
                router.push(href(r.name));
              }}
            >
              {r.name}
            </Link>
          ),
        },
        {
          id: "uri",
          header: "URI",
          sortingField: "uri",
          cell: (r) => (
            <CopyToClipboard
              variant="inline"
              textToCopy={r.uri}
              copySuccessText="URI copied"
              copyErrorText="Failed to copy URI"
            />
          ),
        },
        {
          id: "tagMutability",
          header: "Tag mutability",
          sortingField: "tagMutability",
          cell: (r) => r.tagMutability,
        },
        {
          id: "createdAt",
          header: "Created",
          sortingField: "createdAt",
          cell: (r) => formatDate(r.createdAt),
        },
      ]}
      header={
        <Header
          counter={`(${repositories.length})`}
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
          Repositories
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find repositories"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
