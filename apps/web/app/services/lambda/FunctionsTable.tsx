"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCollection } from "@cloudscape-design/collection-hooks";
import Badge from "@cloudscape-design/components/badge";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import CopyToClipboard from "@cloudscape-design/components/copy-to-clipboard";
import Header from "@cloudscape-design/components/header";
import Link from "@cloudscape-design/components/link";
import Pagination from "@cloudscape-design/components/pagination";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Table from "@cloudscape-design/components/table";
import TextFilter from "@cloudscape-design/components/text-filter";
import type { LambdaFunction } from "@/lib/aws/lambda";

function formatDate(value: string) {
  return value ? new Date(value).toLocaleString() : "—";
}

export default function FunctionsTable({
  functions,
}: {
  functions: LambdaFunction[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { items, collectionProps, filterProps, paginationProps, filteredItemsCount } =
    useCollection(functions, {
      filtering: {
        empty: (
          <Box textAlign="center" color="inherit" padding="l">
            <b>No functions</b>
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
    <Table<LambdaFunction>
      {...collectionProps}
      variant="full-page"
      stickyHeader
      loading={isPending}
      loadingText="Loading functions"
      items={items}
      trackBy="name"
      columnDefinitions={[
        {
          id: "name",
          header: "Name",
          sortingField: "name",
          isRowHeader: true,
          cell: (fn) => (
            <Link
              href={`/services/lambda/${encodeURIComponent(fn.name)}`}
              onFollow={(event) => {
                event.preventDefault();
                router.push(`/services/lambda/${encodeURIComponent(fn.name)}`);
              }}
            >
              {fn.name}
            </Link>
          ),
        },
        {
          id: "arn",
          header: "ARN",
          cell: (fn) => (
            <CopyToClipboard
              variant="inline"
              textToCopy={fn.arn}
              copySuccessText="ARN copied"
              copyErrorText="Failed to copy ARN"
            />
          ),
        },
        {
          id: "runtime",
          header: "Runtime",
          sortingField: "runtime",
          cell: (fn) => fn.runtime || "—",
        },
        {
          id: "memory",
          header: "Memory (MB)",
          sortingField: "memory",
          cell: (fn) => fn.memory,
        },
        {
          id: "timeout",
          header: "Timeout (s)",
          sortingField: "timeout",
          cell: (fn) => fn.timeout,
        },
        {
          id: "tags",
          header: "Tags",
          cell: (fn) =>
            fn.tags.length === 0 ? (
              "—"
            ) : (
              <SpaceBetween direction="horizontal" size="xxs">
                {fn.tags.map((t) => (
                  <Badge key={t.key}>
                    {t.key}: {t.value}
                  </Badge>
                ))}
              </SpaceBetween>
            ),
        },
        {
          id: "lastModified",
          header: "Last modified",
          sortingField: "lastModified",
          cell: (fn) => formatDate(fn.lastModified),
        },
      ]}
      header={
        <Header
          counter={`(${functions.length})`}
          actions={
            <SpaceBetween direction="horizontal" size="xs">
              <Button iconName="refresh" ariaLabel="Refresh" onClick={refresh} />
            </SpaceBetween>
          }
        >
          Functions
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringPlaceholder="Find functions"
          countText={`${filteredItemsCount} matches`}
        />
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
